/**
 * Cloudinary Image Upload Utility
 * Sends files to the server-side signed upload API route (/api/upload), returning a secure Cloudinary CDN image URL.
 */

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      console.warn('Signed upload failed, falling back to local Data URL:', data?.error);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    return data.url;
  } catch (err) {
    console.warn('Cloudinary upload route error, using Data URL fallback:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * A delivery URL for `src` capped at `width`, in the best format the browser
 * accepts.
 *
 * Product photos are stored as the original upload — several are 500 KB–900 KB
 * JPEGs — and rendering them straight into a grid thumbnail downloads all of
 * that to paint a ~300px card. Cloudinary resizes on delivery, so the transform
 * goes in the URL: `f_auto` picks WebP/AVIF, `q_auto` picks a quality, and
 * `c_limit` scales down without ever upscaling.
 *
 * Anything that is not a Cloudinary delivery URL (Unsplash, a data URI, a URL
 * that already carries a transform) is handed back untouched.
 */
export function cdnImage(src: string, width: number): string {
  if (!src) return src;

  // Unsplash sizes on its own CDN through query params. Seeded category art
  // still asks for w=900 to fill a 152px circle, so cap it the same way.
  if (src.startsWith('https://images.unsplash.com/')) {
    try {
      const u = new URL(src);
      u.searchParams.set('w', String(width));
      u.searchParams.set('auto', 'format');
      return u.toString();
    } catch {
      return src;
    }
  }

  const marker = '/image/upload/';
  const at = src.indexOf(marker);
  if (!src.startsWith('https://res.cloudinary.com/') || at === -1) return src;

  const rest = src.slice(at + marker.length);
  // A bare delivery URL continues with the version (`v1786541994/…`) or goes
  // straight to the public id. Anything else is already a transform.
  const firstSegment = rest.split('/')[0];
  const isVersion = /^v\d+$/.test(firstSegment);
  const hasTransform = !isVersion && /(^|,)[a-z]{1,2}_/.test(firstSegment);
  if (hasTransform) return src;

  return `${src.slice(0, at + marker.length)}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}
