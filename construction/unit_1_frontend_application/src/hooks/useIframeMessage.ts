import { useEffect, useState, useCallback } from 'react';
import { IframeMessage, IframeMessagePayload, IframeStatusMessage, RenderStatus } from '../types/iframe';

export function useIframeMessage() {
  const [furnitureData, setFurnitureData] = useState<IframeMessagePayload | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 在生产环境中，应该验证 event.origin
      // if (event.origin !== 'https://trusted-domain.com') return;
      
      try {
        const message: IframeMessage = event.data;
        
        if (message.type === 'FURNITURE_DATA') {
          console.log('Received furniture data:', message.payload);
          setFurnitureData(message.payload);
        } else if (message.type === 'RESET') {
          console.log('Reset iframe');
          setFurnitureData(null);
        }
      } catch (error) {
        console.error('Failed to parse iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const sendStatus = useCallback((
    status: RenderStatus,
    data?: {
      progress?: number;
      error?: string;
      renderedImageUrl?: string;
      originalImageUrl?: string;
    }
  ) => {
    const message: IframeStatusMessage = {
      type: 'RENDER_STATUS',
      payload: {
        status,
        ...data,
      },
    };
    
    // 发送给父窗口
    window.parent.postMessage(message, '*');
    console.log('Sent status to parent:', message);
  }, []);

  return {
    furnitureData,
    sendStatus,
  };
}
