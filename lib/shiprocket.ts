let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export type ServiceabilityResult = {
  serviceable: boolean;
  etd?: string;
  minDays?: number;
  courierName?: string;
  availableCouriers?: Array<{
    courierName: string;
    rate: number;
    etd: string;
    rating: number;
  }>;
  message?: string;
};

export type ShiprocketOrderItem = {
  name: string;
  sku?: string;
  units: number;
  selling_price: number;
};

export type CreateShiprocketOrderInput = {
  orderId: string; // e.g. SE-XXXXX
  orderDate?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'razorpay' | 'cod' | string;
  items: ShiprocketOrderItem[];
  totalAmount: number;
};

export type ShiprocketOrderResult = {
  success: boolean;
  shiprocketOrderId?: number;
  shipmentId?: number;
  status?: string;
  message?: string;
};

export type ShiprocketTrackingResult = {
  success: boolean;
  awbCode?: string;
  courierName?: string;
  currentStatus?: string;
  trackingUrl?: string;
  timeline?: Array<{ date: string; activity: string; location: string }>;
  message?: string;
};

/** Get authenticated Shiprocket JWT Bearer Token */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    return null; // Shiprocket credentials not yet supplied
  }

  // Return cached token if valid (expires in 10 days, cache for 9 days)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      console.error('Shiprocket auth failed:', res.statusText);
      return null;
    }

    const data = await res.json();
    if (data.token) {
      cachedToken = data.token;
      tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
    return null;
  } catch (err) {
    console.error('Shiprocket Auth Error:', err);
    return null;
  }
}

/** Check courier serviceability & estimated delivery days for a pincode */
export async function checkShiprocketServiceability(
  deliveryPincode: string,
  isCod = false,
  weight = '0.8'
): Promise<ServiceabilityResult> {
  const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '143001';
  const token = await getShiprocketToken();

  if (!token) {
    // Graceful fallback response when credentials are not configured yet
    const isValidPincode = /^\d{6}$/.test(deliveryPincode);
    return {
      serviceable: isValidPincode,
      etd: isValidPincode ? '3–5 Business Days' : 'Invalid Pincode',
      courierName: 'Standard Express Courier',
      message: isValidPincode
        ? 'Serviceable across India (Express Shipping from Amritsar)'
        : 'Please enter a valid 6-digit Indian Pincode',
    };
  }

  try {
    const params = new URLSearchParams({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,
      cod: isCod ? '1' : '0',
    });

    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { serviceable: true, etd: '3–5 Days', courierName: 'Express Shipping' };
    }

    const data = await res.json();
    const couriers = data.data?.available_courier_companies || [];

    if (couriers.length === 0) {
      return {
        serviceable: false,
        message: `Pincode ${deliveryPincode} is currently non-serviceable for delivery.`,
      };
    }

    // Sort couriers by rate & estimated delivery
    const sorted = couriers.sort((a: { rate: number }, b: { rate: number }) => a.rate - b.rate);
    const topCourier = sorted[0];

    return {
      serviceable: true,
      etd: topCourier.etd || '3–5 Days',
      courierName: topCourier.courier_name || 'Express Courier',
      availableCouriers: sorted.slice(0, 4).map((c: { courier_name: string; rate: number; etd: string; rating: number }) => ({
        courierName: c.courier_name,
        rate: c.rate,
        etd: c.etd,
        rating: c.rating || 4.5,
      })),
    };
  } catch (err) {
    console.error('Shiprocket Serviceability Error:', err);
    return { serviceable: true, etd: '3–5 Business Days', courierName: 'Express Shipping' };
  }
}

/** Create a shipment order on Shiprocket */
export async function createShiprocketOrder(
  input: CreateShiprocketOrderInput
): Promise<ShiprocketOrderResult> {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      message: 'Shiprocket API credentials not configured in environment variables.',
    };
  }

  try {
    const nameParts = input.customerName.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const isCod = input.paymentMethod.toLowerCase().includes('cod');

    const formattedDate = input.orderDate || new Date().toISOString().replace('T', ' ').slice(0, 16);

    const payload = {
      order_id: input.orderId,
      order_date: formattedDate,
      pickup_location: 'Primary',
      channel_id: '',
      comment: 'Order placed on Saanshika Ethnics Store',
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: input.address,
      billing_city: input.city,
      billing_pincode: input.pincode,
      billing_state: input.state,
      billing_country: 'India',
      billing_email: input.customerEmail,
      billing_phone: input.customerPhone,
      shipping_is_billing: true,
      order_items: input.items.map((item, idx) => ({
        name: item.name,
        sku: item.sku || `SKU-${idx + 1}`,
        units: item.units,
        selling_price: item.selling_price,
      })),
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: input.totalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.8,
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.status_code === 0) {
      return {
        success: false,
        message: data.message || 'Failed to create order on Shiprocket',
      };
    }

    return {
      success: true,
      shiprocketOrderId: data.order_id,
      shipmentId: data.shipment_id,
      status: data.status,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Shiprocket order creation error';
    return { success: false, message: msg };
  }
}

/** Track an order by Order Number */
export async function trackShiprocketOrder(orderNumber: string): Promise<ShiprocketTrackingResult> {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      message: 'Shiprocket credentials not configured.',
    };
  }

  try {
    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/by/order_id?order_id=${encodeURIComponent(orderNumber)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return { success: false, message: 'Tracking data unavailable.' };
    }

    const data = await res.json();
    const trackData = data?.[orderNumber]?.tracking_data;

    if (!trackData) {
      return { success: false, message: 'Shipment tracking not initiated yet.' };
    }

    const trackActivities = Array.isArray(trackData.shipment_track_activities)
      ? trackData.shipment_track_activities.map((a: { date: string; activity: string; location: string }) => ({
          date: a.date,
          activity: a.activity,
          location: a.location,
        }))
      : [];

    return {
      success: true,
      awbCode: trackData.awb_code || '',
      courierName: trackData.courier_name || '',
      currentStatus: trackData.current_status || 'In Transit',
      trackingUrl: trackData.track_url || `https://shiprocket.co/tracking/${trackData.awb_code}`,
      timeline: trackActivities,
    };
  } catch (err) {
    return { success: false, message: 'Error querying tracking status.' };
  }
}
