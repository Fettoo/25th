/**
 * Client-Side Image Compression Utility
 * Aligned with PRD Section 6.3:
 * "Seluruh foto dikompresi ke format .webp (< 300KB per foto)"
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export async function compressImageFile(
  file: File,
  maxDimension = 1440,
  quality = 0.82
): Promise<CompressionResult> {
  // If not an image (e.g. video or audio), return original
  if (!file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercentage: 0
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            reductionPercentage: 0
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        const targetMime = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 
          ? 'image/webp' 
          : 'image/jpeg';
        
        const extension = targetMime === 'image/webp' ? '.webp' : '.jpg';
        const newFileName = file.name.replace(/\.[^/.]+$/, '') + extension;

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compression didn't reduce size (already tiny), keep original
              resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                reductionPercentage: 0
              });
              return;
            }

            const compressedFile = new File([blob], newFileName, {
              type: targetMime,
              lastModified: Date.now()
            });

            const reduction = Math.round(((file.size - blob.size) / file.size) * 100);

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              reductionPercentage: Math.max(0, reduction)
            });
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => {
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0
        });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercentage: 0
      });
    };

    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
