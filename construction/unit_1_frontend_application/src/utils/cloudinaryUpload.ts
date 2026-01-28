import { getApiUrl } from './apiConfig';

export interface UploadSignature {
  success: boolean;
  apiKey: string;
  cloudName: string;
  timestamp: number;
  signature: string;
  publicId: string;
  expiresAt: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  imageUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Get upload signature from backend
 */
export async function getUploadSignature(): Promise<UploadSignature> {
  const response = await fetch(getApiUrl('/upload/signature'));
  
  if (!response.ok) {
    throw new Error(`Failed to get upload signature: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Failed to get upload signature');
  }
  
  return data;
}

/**
 * Upload image directly to Cloudinary with progress tracking
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Get signature from backend
    const signature = await getUploadSignature();
    
    // Validate signature hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (now >= signature.expiresAt) {
      throw new Error('Upload signature has expired. Please try again.');
    }
    
    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('signature', signature.signature);
    formData.append('public_id', signature.publicId);
    
    // Upload to Cloudinary with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              imageUrl: result.secure_url || result.url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            });
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });
      
      // Start upload
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
    };
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please upload a smaller image.'
    };
  }
  
  return { valid: true };
}
