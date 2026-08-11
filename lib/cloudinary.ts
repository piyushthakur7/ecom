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
