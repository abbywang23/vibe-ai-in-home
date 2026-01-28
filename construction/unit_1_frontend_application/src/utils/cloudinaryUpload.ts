import { API_BASE_URL } from '../services/api';
import SparkMD5 from 'spark-md5';

function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

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

interface CachedUpload {
  url: string;
  publicId: string;
  uploadedAt: number;
  width?: number;
  height?: number;
  bytes?: number;
}

interface UploadCache {
  [hash: string]: CachedUpload;
}

const CACHE_KEY = 'cloudinary_upload_cache';
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks for MD5 calculation

/**
 * Calculate MD5 hash of a file
 */
async function calculateFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();
    let currentChunk = 0;
    const chunks = Math.ceil(file.size / CHUNK_SIZE);

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      }
    };

    fileReader.onerror = () => {
      reject(new Error('Failed to read file for MD5 calculation'));
    };

    function loadNext() {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}

/**
 * Get cached upload result by hash
 */
function getCachedUpload(hash: string): UploadResult | null {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;

    const cache: UploadCache = JSON.parse(cacheStr);
    const cached = cache[hash];

    if (cached) {
      return {
        success: true,
        imageUrl: cached.url,
        publicId: cached.publicId,
        width: cached.width,
        height: cached.height,
        bytes: cached.bytes,
      };
    }

    return null;
  } catch (error) {
    // If cache is corrupted, clear it
    console.warn('Failed to read upload cache, clearing:', error);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * Save upload result to cache
 */
function setCachedUpload(hash: string, result: UploadResult): void {
  try {
    // Check if we need to cleanup before saving
    ensureCacheSpace();

    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: UploadCache = cacheStr ? JSON.parse(cacheStr) : {};

    cache[hash] = {
      url: result.imageUrl,
      publicId: result.publicId,
      uploadedAt: Date.now(),
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // If storage is full or unavailable, try cleanup and retry once
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        cleanupOldestCache();
        const cacheStr = localStorage.getItem(CACHE_KEY);
        const cache: UploadCache = cacheStr ? JSON.parse(cacheStr) : {};
        cache[hash] = {
          url: result.imageUrl,
          publicId: result.publicId,
          uploadedAt: Date.now(),
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        // If still fails, just skip caching
        console.warn('Failed to save upload cache:', retryError);
      }
    } else {
      console.warn('Failed to save upload cache:', error);
    }
  }
}

/**
 * Ensure there's enough space in localStorage
 */
function ensureCacheSpace(): void {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return;

    // Try to estimate size (rough calculation)
    const estimatedSize = new Blob([cacheStr]).size;
    const threshold = 1024 * 1024; // 1MB threshold

    if (estimatedSize > threshold) {
      cleanupOldestCache();
    }
  } catch (error) {
    // Ignore errors during space check
  }
}

/**
 * Clean up oldest cache entries
 */
function cleanupOldestCache(): void {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return;

    const cache: UploadCache = JSON.parse(cacheStr);
    const entries = Object.entries(cache);

    if (entries.length === 0) return;

    // Sort by uploadedAt (oldest first)
    entries.sort((a, b) => a[1].uploadedAt - b[1].uploadedAt);

    // Remove oldest 50% of entries
    const removeCount = Math.max(1, Math.floor(entries.length / 2));
    const newCache: UploadCache = {};

    // Keep the newer half
    for (let i = removeCount; i < entries.length; i++) {
      newCache[entries[i][0]] = entries[i][1];
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  } catch (error) {
    // If cleanup fails, clear entire cache
    console.warn('Failed to cleanup cache, clearing all:', error);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Get upload signature from backend
 */
export async function getUploadSignature(): Promise<UploadSignature> {
  const response = await fetch(getApiUrl('/api/ai/upload/signature'));
  
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
  // Calculate file hash and check cache
  let fileHash: string | undefined;
  try {
    fileHash = await calculateFileMD5(file);
    const cached = getCachedUpload(fileHash);
    if (cached) {
      return cached;
    }
  } catch (hashError) {
    // If hash calculation fails, continue with normal upload
    console.warn('Failed to calculate file hash, skipping cache:', hashError);
  }

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
            const uploadResult: UploadResult = {
              success: true,
              imageUrl: result.secure_url || result.url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              bytes: result.bytes
            };

            // Save to cache if hash was calculated
            if (fileHash) {
              try {
                setCachedUpload(fileHash, uploadResult);
              } catch (cacheError) {
                // Ignore cache errors, upload was successful
                console.warn('Failed to cache upload result:', cacheError);
              }
            }

            resolve(uploadResult);
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
