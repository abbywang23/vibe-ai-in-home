class ImageProcessingService {
  /**
   * Validate uploaded image
   */
  validateImage(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG and PNG formats are supported',
      };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB',
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Prepare image for upload
   */
  async prepareForUpload(file: File): Promise<FormData> {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
  }
  
  /**
   * Create preview URL for image
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }
  
  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export default new ImageProcessingService();
