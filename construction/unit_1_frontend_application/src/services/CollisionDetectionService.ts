import { FurniturePlacement, RoomDesign, Position3D, RoomDimensions } from '../types/domain';

interface BoundingBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface ValidationResult {
  isValid: boolean;
  collidingIds: string[];
}

class CollisionDetectionService {
  /**
   * Check if two furniture placements collide
   */
  checkCollision(placement1: FurniturePlacement, placement2: FurniturePlacement): boolean {
    const box1 = this.calculateBoundingBox(placement1);
    const box2 = this.calculateBoundingBox(placement2);
    return this.boxesIntersect(box1, box2);
  }
  
  /**
   * Validate if furniture can be placed at position
   */
  validatePlacement(
    design: RoomDesign,
    furniture: FurniturePlacement,
    position: Position3D
  ): ValidationResult {
    const collidingIds: string[] = [];
    
    // Check room boundaries
    if (!design.roomDimensions || !this.isWithinRoomBounds(position, furniture, design.roomDimensions)) {
      return { isValid: false, collidingIds: [] };
    }
    
    // Create temporary placement with new position
    const tempPlacement = { ...furniture, position };
    
    // Check collisions with existing furniture
    for (const existing of design.furniturePlacements) {
      if (existing.placementId !== furniture.placementId) {
        if (this.checkCollision(tempPlacement, existing)) {
          collidingIds.push(existing.placementId);
        }
      }
    }
    
    return {
      isValid: collidingIds.length === 0,
      collidingIds,
    };
  }
  
  /**
   * Calculate 2D bounding box for furniture (simplified, ignoring rotation)
   */
  private calculateBoundingBox(placement: FurniturePlacement): BoundingBox {
    const { position, productDimensions } = placement;
    
    // Simplified: not considering rotation for now
    return {
      minX: position.x,
      maxX: position.x + productDimensions.length,
      minZ: position.z,
      maxZ: position.z + productDimensions.width,
    };
  }
  
  /**
   * Check if two 2D bounding boxes intersect
   */
  private boxesIntersect(box1: BoundingBox, box2: BoundingBox): boolean {
    return !(
      box1.maxX <= box2.minX ||
      box1.minX >= box2.maxX ||
      box1.maxZ <= box2.minZ ||
      box1.minZ >= box2.maxZ
    );
  }
  
  /**
   * Check if furniture fits within room boundaries
   */
  private isWithinRoomBounds(
    position: Position3D,
    furniture: FurniturePlacement,
    roomDimensions: RoomDimensions
  ): boolean {
    const { productDimensions } = furniture;
    
    // Check if furniture is within room bounds
    if (position.x < 0 || position.z < 0) {
      return false;
    }
    
    if (
      position.x + productDimensions.length > roomDimensions.length ||
      position.z + productDimensions.width > roomDimensions.width
    ) {
      return false;
    }
    
    return true;
  }
}

export default new CollisionDetectionService();
