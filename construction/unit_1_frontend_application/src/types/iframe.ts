// iframe 相关类型定义

import { RoomDimensions } from './domain';

export interface FurnitureItemForRender {
  id: string;
  name: string;
  imageUrl: string; // 用于前端展示
  renderImageUrl?: string; // 用于渲染（优先使用）
  category?: string;
  price?: number;
}

export interface IframeMessagePayload {
  furniture?: FurnitureItemForRender[];
  roomType?: string;
  roomDimensions?: RoomDimensions;
}

export interface IframeMessage {
  type: 'FURNITURE_DATA' | 'RESET';
  payload: IframeMessagePayload;
}

export interface IframeStatusMessage {
  type: 'RENDER_STATUS';
  payload: {
    status: 'idle' | 'uploading' | 'detecting' | 'rendering' | 'completed' | 'error';
    progress?: number;
    error?: string;
    renderedImageUrl?: string;
    originalImageUrl?: string;
  };
}

export type RenderStatus = 'idle' | 'uploading' | 'detecting' | 'rendering' | 'completed' | 'error';
