export async function compressImageToDataUrl(file: File, maxDim = 900, initialQuality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const isGifOrWebp =
      file.type === 'image/gif' ||
      file.type === 'image/webp' ||
      file.name.toLowerCase().endsWith('.gif') ||
      file.name.toLowerCase().endsWith('.webp');

    if (isGifOrWebp) {
      if (file.size > 700 * 1024) {
        reject(new Error('This GIF is too big (max ~700 KB). Try a smaller one 💕'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to read image file 💕'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Ensure under ~750KB base64 size (approx 800KB doc limit)
        while (dataUrl.length * 0.75 > 750 * 1024 && quality > 0.2) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If still too large, reject
        if (dataUrl.length * 0.75 > 780 * 1024) {
          reject(new Error('Image is too large to fit in Firestore document (<800KB). Please choose a smaller photo 💕'));
          return;
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrlIfNeeded(dataUrl: string, maxDim = 900, initialQuality = 0.7): Promise<string> {
  // If already under 300KB, return as is
  if (dataUrl.length * 0.75 < 300 * 1024) {
    return dataUrl;
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, width, height);
      let quality = initialQuality;
      let res = canvas.toDataURL('image/jpeg', quality);
      while (res.length * 0.75 > 750 * 1024 && quality > 0.2) {
        quality -= 0.1;
        res = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(res);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
