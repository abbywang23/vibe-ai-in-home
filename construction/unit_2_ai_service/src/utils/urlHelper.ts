import { Request } from 'express';

/**
 * Get base URL from request or environment variable
 * Priority: Request headers > BASE_URL env > localhost fallback
 */
export function getBaseUrl(req?: Request): string {
  // If request is provided, use it to determine base URL
  if (req) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || req.headers.host;
    
    if (host) {
      // Check if host is localhost or IP address
      const hostname = host.split(':')[0];
      const port = host.split(':')[1] || (protocol === 'https' ? '443' : '80');
      
      // If accessing via IP address (like 10.1.10.217), use that
      if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return `${protocol}://${hostname}:${port}`;
      }
      
      // Otherwise use the host as-is
      return `${protocol}://${host}`;
    }
  }
  
  // Fallback to environment variable
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  
  // Last resort: use localhost (for development only)
  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
}
