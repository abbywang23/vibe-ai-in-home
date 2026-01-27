import { RoomDimensions, RoomType, DimensionUnit, RoomTemplate } from '../types/domain';

class RoomConfigurationService {
  /**
   * Validate room dimensions
   */
  validateDimensions(
    dimensions: RoomDimensions,
    roomType: RoomType
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const area = dimensions.length * dimensions.width;
    
    // Validate based on room type
    const ranges = this.getRoomTypeRanges(roomType);
    
    if (area < ranges.minArea) {
      errors.push(`Room area too small. Minimum: ${ranges.minArea}m²`);
    }
    
    if (area > ranges.maxArea) {
      errors.push(`Room area too large. Maximum: ${ranges.maxArea}m²`);
    }
    
    if (dimensions.height < 2 || dimensions.height > 6) {
      errors.push('Room height must be between 2-6 meters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Convert dimensions between units
   */
  convertDimensions(
    dimensions: RoomDimensions,
    targetUnit: DimensionUnit
  ): RoomDimensions {
    if (dimensions.unit === targetUnit) {
      return dimensions;
    }

    const conversionFactors: Record<DimensionUnit, Record<DimensionUnit, number>> = {
      [DimensionUnit.METERS]: {
        [DimensionUnit.METERS]: 1,
        [DimensionUnit.FEET]: 3.28084,
        [DimensionUnit.CENTIMETERS]: 100,
        [DimensionUnit.INCHES]: 39.3701,
      },
      [DimensionUnit.FEET]: {
        [DimensionUnit.METERS]: 0.3048,
        [DimensionUnit.FEET]: 1,
        [DimensionUnit.CENTIMETERS]: 30.48,
        [DimensionUnit.INCHES]: 12,
      },
      [DimensionUnit.CENTIMETERS]: {
        [DimensionUnit.METERS]: 0.01,
        [DimensionUnit.FEET]: 0.0328084,
        [DimensionUnit.CENTIMETERS]: 1,
        [DimensionUnit.INCHES]: 0.393701,
      },
      [DimensionUnit.INCHES]: {
        [DimensionUnit.METERS]: 0.0254,
        [DimensionUnit.FEET]: 0.0833333,
        [DimensionUnit.CENTIMETERS]: 2.54,
        [DimensionUnit.INCHES]: 1,
      },
    };

    const factor = conversionFactors[dimensions.unit][targetUnit];

    return {
      length: dimensions.length * factor,
      width: dimensions.width * factor,
      height: dimensions.height * factor,
      unit: targetUnit,
    };
  }
  
  /**
   * Get room templates for room type
   */
  getTemplatesForRoomType(roomType: RoomType): RoomTemplate[] {
    const templates: Record<RoomType, RoomTemplate[]> = {
      [RoomType.LIVING_ROOM]: [
        {
          templateId: 'lr_small',
          name: 'Small Living Room',
          roomType: RoomType.LIVING_ROOM,
          dimensions: { length: 4, width: 3.5, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
        {
          templateId: 'lr_medium',
          name: 'Medium Living Room',
          roomType: RoomType.LIVING_ROOM,
          dimensions: { length: 5, width: 4, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
        {
          templateId: 'lr_large',
          name: 'Large Living Room',
          roomType: RoomType.LIVING_ROOM,
          dimensions: { length: 7, width: 5, height: 3, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
      ],
      [RoomType.BEDROOM]: [
        {
          templateId: 'br_small',
          name: 'Small Bedroom',
          roomType: RoomType.BEDROOM,
          dimensions: { length: 3, width: 3, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
        {
          templateId: 'br_medium',
          name: 'Medium Bedroom',
          roomType: RoomType.BEDROOM,
          dimensions: { length: 4, width: 3.5, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
      ],
      [RoomType.DINING_ROOM]: [
        {
          templateId: 'dr_medium',
          name: 'Medium Dining Room',
          roomType: RoomType.DINING_ROOM,
          dimensions: { length: 4, width: 3, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
      ],
      [RoomType.HOME_OFFICE]: [
        {
          templateId: 'ho_small',
          name: 'Small Home Office',
          roomType: RoomType.HOME_OFFICE,
          dimensions: { length: 3, width: 2.5, height: 2.7, unit: DimensionUnit.METERS },
          thumbnailUrl: '',
        },
      ],
    };

    return templates[roomType] || [];
  }
  
  private getRoomTypeRanges(roomType: RoomType) {
    const ranges = {
      [RoomType.LIVING_ROOM]: { minArea: 12, maxArea: 50 },
      [RoomType.BEDROOM]: { minArea: 9, maxArea: 40 },
      [RoomType.DINING_ROOM]: { minArea: 10, maxArea: 35 },
      [RoomType.HOME_OFFICE]: { minArea: 6, maxArea: 25 },
    };
    return ranges[roomType];
  }
}

export default new RoomConfigurationService();
