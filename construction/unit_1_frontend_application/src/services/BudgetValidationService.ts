import { Money, FurniturePlacement } from '../types/domain';

interface BudgetValidationResult {
  isValid: boolean;
  total: Money;
  exceededAmount?: Money;
  remainingAmount?: Money;
}

class BudgetValidationService {
  /**
   * Validate if selections fit within budget
   */
  validateBudget(
    budget: Money | null,
    placements: FurniturePlacement[],
    productPrices: Record<string, Money> = {}
  ): BudgetValidationResult {
    const total = this.calculateTotal(placements, productPrices);
    
    if (!budget) {
      return { isValid: true, total };
    }
    
    const isValid = total.amount <= budget.amount;
    
    if (!isValid) {
      return {
        isValid: false,
        total,
        exceededAmount: {
          amount: total.amount - budget.amount,
          currency: budget.currency,
        },
      };
    }
    
    return {
      isValid: true,
      total,
      remainingAmount: {
        amount: budget.amount - total.amount,
        currency: budget.currency,
      },
    };
  }
  
  /**
   * Calculate total price of all placements
   */
  calculateTotal(
    placements: FurniturePlacement[],
    productPrices: Record<string, Money> = {}
  ): Money {
    let totalAmount = 0;
    const currency = Object.values(productPrices)[0]?.currency || 'USD';
    
    placements.forEach((placement) => {
      const price = productPrices[placement.productId];
      if (price) {
        totalAmount += price.amount;
      }
    });
    
    return {
      amount: totalAmount,
      currency,
    };
  }
  
  /**
   * Suggest items to remove to meet budget
   */
  suggestBudgetAdjustments(
    budget: Money,
    placements: FurniturePlacement[],
    productPrices: Record<string, Money>
  ): string[] {
    const validation = this.validateBudget(budget, placements, productPrices);
    
    if (validation.isValid) {
      return [];
    }
    
    // Sort placements by price (highest first)
    const sortedPlacements = [...placements].sort((a, b) => {
      const priceA = productPrices[a.productId]?.amount || 0;
      const priceB = productPrices[b.productId]?.amount || 0;
      return priceB - priceA;
    });
    
    const toRemove: string[] = [];
    let currentTotal = validation.total.amount;
    
    // Remove items until within budget
    for (const placement of sortedPlacements) {
      if (currentTotal <= budget.amount) {
        break;
      }
      
      const price = productPrices[placement.productId]?.amount || 0;
      toRemove.push(placement.placementId);
      currentTotal -= price;
    }
    
    return toRemove;
  }
  
  /**
   * Format money for display
   */
  formatMoney(money: Money): string {
    return `${money.currency} ${money.amount.toFixed(2)}`;
  }
}

export default new BudgetValidationService();
