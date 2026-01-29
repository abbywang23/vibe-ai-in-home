import { useEffect, useState, useCallback } from 'react';
import { IframeMessage, IframeMessagePayload, IframeStatusMessage, RenderStatus } from '../types/iframe';

export function useIframeMessage() {
  const [furnitureData, setFurnitureData] = useState<IframeMessagePayload | null>(null);

  useEffect(() => {
    console.log('=== IFRAME MESSAGE HOOK INITIALIZED ===');
    console.log('Listening for messages from parent window...');
    
    const handleMessage = (event: MessageEvent) => {
      console.log('=== MESSAGE RECEIVED IN IFRAME ===');
      console.log('1. event.origin:', event.origin);
      console.log('2. event.data:', event.data);
      console.log('3. event.source:', event.source);
      
      // 在生产环境中，应该验证 event.origin
      // 开发环境暂时允许所有来源
      // if (event.origin !== 'https://trusted-domain.com') return;
      
      try {
        const message: IframeMessage = event.data;
        console.log('4. Parsed message type:', message.type);
        
        if (message.type === 'FURNITURE_DATA') {
          console.log('5. ✅ FURNITURE_DATA received!');
          console.log('6. Payload:', JSON.stringify(message.payload, null, 2));
          console.log('7. Setting furniture data...');
          setFurnitureData(message.payload);
          console.log('8. Furniture data set successfully');
        } else if (message.type === 'RESET') {
          console.log('5. ✅ RESET received');
          setFurnitureData(null);
        } else {
          console.log('5. ⚠️ Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('❌ Failed to parse iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message event listener attached');
    
    return () => {
      console.log('Removing message event listener');
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
