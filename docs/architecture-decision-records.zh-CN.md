# 架构决策记录 (ADR)

## 概述

本文档记录了 Castlery 家具规划器项目的关键架构和设计决策。每个决策都包含背景、考虑的选项、最终决策和影响。

**项目**: Castlery 家具规划器  
**最后更新**: 2026-01-26

---

## 目录

1. [ADR-001: 前端架构采用领域驱动设计](#adr-001-前端架构采用领域驱动设计)
2. [ADR-002: 聚合边界和关系](#adr-002-聚合边界和关系)
3. [ADR-003: 值对象 vs 实体](#adr-003-值对象-vs-实体)
4. [ADR-004: 前端状态存储策略](#adr-004-前端状态存储策略)
5. [ADR-005: 外部服务的防腐层](#adr-005-外部服务的防腐层)
6. [ADR-006: 领域事件的事件驱动架构](#adr-006-领域事件的事件驱动架构)
7. [ADR-007: 空房间 vs 有家具房间的处理](#adr-007-空房间-vs-有家具房间的处理)
8. [ADR-008: 预算验证策略](#adr-008-预算验证策略)
9. [ADR-009: 多语言支持方案](#adr-009-多语言支持方案)
10. [ADR-010: 碰撞检测实现](#adr-010-碰撞检测实现)

---

## ADR-001: 前端架构采用领域驱动设计

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

Castlery 家具规划器是一个复杂的应用程序，包含多个工作流（房间配置、AI 推荐、家具摆放、可视化、购物车）。我们需要决定一种能够处理这种复杂性同时保持可维护性的架构方法。

### 决策驱动因素

- 复杂的业务逻辑（家具摆放、碰撞检测、预算验证）
- 多个具有不同状态的用户工作流
- 需要清晰的关注点分离
- 未来的可扩展性（新房间类型、新功能）
- 团队理解和可维护性

### 考虑的选项

1. **传统 MVC/MVVM 模式**
   - 优点：熟悉，适合小型应用
   - 缺点：业务逻辑容易泄漏到控制器/视图模型中，随着复杂性增长难以维护

2. **领域驱动设计 (DDD)**
   - 优点：清晰的业务逻辑封装，丰富的领域模型，可扩展
   - 缺点：初始复杂度较高，学习曲线

3. **事务脚本模式**
   - 优点：简单，直接
   - 缺点：不能很好地扩展复杂性，逻辑重复

### 决策

我们将使用 **领域驱动设计 (DDD)** 作为前端架构。

### 理由

- 应用程序具有丰富的业务逻辑，受益于领域建模
- 清晰的聚合边界有助于管理复杂性
- 值对象提供类型安全并封装业务规则
- 领域事件实现功能之间的松耦合
- 与后端架构更好地对齐（如果使用 DDD）

### 影响

**正面影响：**
- 领域逻辑和基础设施之间清晰分离
- 业务规则明确且可测试
- 更容易理解复杂的工作流
- 更好的代码组织和可维护性

**负面影响：**
- 初始开发时间较长
- 团队需要理解 DDD 概念
- 相比简单模式有更多样板代码

**缓解措施：**
- 提供 DDD 培训和文档
- 创建清晰的示例和模板
- 使用 TypeScript 提供类型安全

---

## ADR-002: 聚合边界和关系

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

我们需要为聚合定义清晰的边界，以确保一致性并管理复杂性。主要实体是 PlanningSession、RoomDesign 和 ShoppingCart。

### 决策驱动因素

- 事务边界
- 一致性要求
- 性能（加载和保存）
- 并发访问模式

### 考虑的选项

1. **单个大聚合**
   - 所有内容都在一个 PlanningSession 聚合中
   - 优点：简单，所有数据在一起
   - 缺点：大对象图，性能问题，并发冲突

2. **三个独立聚合**
   - PlanningSession、RoomDesign、ShoppingCart 作为独立聚合
   - 优点：清晰的边界，独立事务，更好的性能
   - 缺点：需要管理聚合之间的引用

3. **两个聚合**
   - 合并 PlanningSession 和 RoomDesign
   - 优点：比三个简单，相关数据在一起
   - 缺点：仍然很大，设计可以独立共享/重用

### 决策

我们将使用 **三个独立聚合**：PlanningSession、RoomDesign 和 ShoppingCart，它们之间通过 ID 引用。

### 理由

- **PlanningSession**：管理会话生命周期、偏好设置、聊天历史
- **RoomDesign**：管理房间配置和家具摆放
- **ShoppingCart**：独立管理购物车项目

每个聚合都有清晰的职责，可以独立修改。

### 影响

**正面影响：**
- 清晰的事务边界
- 更好的性能（只加载需要的内容）
- 减少并发冲突
- 设计可以独立于会话保存/共享

**负面影响：**
- 需要管理聚合之间的引用（ID）
- 加载相关数据稍微复杂一些

**实现：**
```typescript
class PlanningSession {
  roomDesignId: string  // ID 引用，不是对象
}

class ShoppingCart {
  sessionId: string  // ID 引用
}
```

---

## ADR-003: 值对象 vs 实体

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

我们需要决定哪些领域概念应该是实体（有身份标识）以及哪些应该是值对象（不可变，无身份标识）。

### 决策

**值对象：**
- UserPreferences（嵌入在 PlanningSession 中）
- UserSettings
- Money
- RoomDimensions
- FurnitureDimensions
- Position3D、Position2D
- ViewState、CameraAngle
- ChatMessage
- 所有枚举（RoomType、SessionStatus 等）

**实体：**
- FurniturePlacement（在 RoomDesign 内）
- CartItem（在 ShoppingCart 内）
- RoomImage（在 RoomDesign 内）

### 理由

**UserPreferences 作为值对象：**
- 没有独立的生命周期（始终是会话的一部分）
- 不需要追踪身份
- 不可变性防止意外修改
- 更容易理解

**Money、Dimensions、Positions 作为值对象：**
- 表示测量值/数值，而不是事物
- 不可变性确保正确性
- 可以自由复制和比较

**FurniturePlacement 作为实体：**
- 需要身份标识来追踪特定摆放
- 可以移动、旋转（可变操作）
- 被事件和操作引用

### 影响

**正面影响：**
- 通过值对象提供类型安全
- 不可变性防止 bug
- 事物（实体）和值之间的清晰区分
- 更容易测试和理解

**负面影响：**
- 需要管理更多类
- 需要为值对象的"更新"创建新实例

---

## ADR-004: 前端状态存储策略

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

我们需要决定如何在浏览器会话和标签页之间持久化前端状态。

### 决策

**存储策略：**

| 数据类型 | 存储方式 | 原因 |
|---------|---------|------|
| 当前会话 | sessionStorage | 临时，关闭标签页时清除 |
| 用户设置 | localStorage | 持久化单位偏好、语言 |
| 保存的设计 | localStorage | 跨浏览器会话持久化 |
| 购物车 | localStorage | 跨会话持久化 |
| 分享链接 | 后端 API | 跨设备访问 |
| 房间图片 | 临时/后端 | 原始：临时，处理后：后端 |

### 理由

- **sessionStorage** 用于临时会话数据，防止混乱
- **localStorage** 用于用户偏好，改善用户体验
- **后端 API** 用于分享链接，实现跨设备共享
- 混合方法平衡离线能力和数据持久化

### 影响

**正面影响：**
- 大多数功能可离线工作
- 用户偏好持久化
- 分享链接跨设备工作
- 基本功能无需登录

**负面影响：**
- localStorage 有大小限制（约 5-10MB）
- 需要处理存储配额超出错误
- 数据不跨设备同步（分享链接除外）

**实现注意事项：**
- 实现存储配额监控
- 存储满时提供清晰的错误消息
- 考虑对大型设计进行压缩

---

## ADR-005: 外部服务的防腐层

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

前端需要与外部服务（产品服务、AI 服务、Castlery 网站购物车）集成。我们需要保护领域模型免受外部 API 变化的影响。

### 决策

使用适配器模式为所有外部服务实现 **防腐层 (ACL)**：
- ProductServiceAdapter
- AIServiceAdapter
- CastleryCartAdapter

### 理由

- 外部 API 可能独立变化
- 领域模型不应依赖外部数据结构
- 更容易进行测试模拟
- 可以在不影响领域的情况下切换实现

### 影响

**正面影响：**
- 领域模型保持清晰和专注
- 外部 API 变化隔离在适配器中
- 更容易测试领域逻辑
- 可以在适配器中添加缓存、重试逻辑

**负面影响：**
- 额外的抽象层
- 更多代码需要维护
- DTO 和领域对象之间的映射

**实现：**
```typescript
class ProductServiceAdapter {
  toFurniturePlacement(productDTO: ProductDTO): FurniturePlacement {
    // 将外部 DTO 转换为领域实体
  }
}
```

---

## ADR-006: 领域事件的事件驱动架构

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

我们需要一种方式在应用程序的不同部分之间进行通信，而不产生紧耦合。

### 决策

使用 **领域事件** 和事件总线处理横切关注点：
- 分析追踪
- UI 更新
- 状态同步
- 审计日志

### 理由

- 组件之间松耦合
- 容易添加新的事件处理器
- 清晰的用户操作审计跟踪
- 如果将来需要，支持事件溯源

### 影响

**正面影响：**
- 解耦的组件
- 容易添加分析、日志
- 清晰的历史记录
- 支持撤销/重做功能

**负面影响：**
- 更难追踪执行流程
- 需要管理事件顺序
- 可能出现事件风暴

**实现：**
```typescript
// 发布事件
eventBus.publish(new FurniturePlaced(designId, placement));

// 订阅事件
eventBus.on('FurniturePlaced', (event) => {
  analytics.track('furniture_placed', event);
});
```

---

## ADR-007: 空房间 vs 有家具房间的处理

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

用户可以上传空房间或包含现有家具的房间照片。这些需要不同的工作流。

### 决策

使用 **单个 RoomImage 实体** 和 `isEmpty` 标志来处理两种情况：
- `isEmpty = false`：家具检测 → 替换工作流
- `isEmpty = true`：直接放置工作流

### 理由

- 单个实体简化模型
- 标志清楚地指示模式
- 可以共享通用的图像处理逻辑
- 如果需要，更容易在模式之间切换

### 影响

**正面影响：**
- 更简单的领域模型
- 共享的图像处理基础设施
- 业务逻辑中的清晰区分

**负面影响：**
- 需要根据 isEmpty 标志验证操作
- 某些属性仅与一种模式相关

**实现：**
```typescript
class RoomImage {
  isEmpty: boolean;
  detectedFurniture: DetectedFurnitureItem[];  // 仅用于有家具的房间
  appliedPlacements: ImageFurniturePlacement[];  // 仅用于空房间
}
```

---

## ADR-008: 预算验证策略

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

用户可以设置预算，我们需要验证家具选择不超过预算。问题是何时以及如何验证。

### 决策

使用 **专用的 BudgetValidationService** 在多个验证点进行验证：
1. **AI 推荐之前**：确保推荐符合预算
2. **用户添加家具后**：检查总额是否超过预算
3. **添加到购物车之前**：最终验证

当预算超支时发出 `BudgetExceeded` 事件，但允许用户在警告后继续。

### 理由

- 软验证（警告，不阻止）提供更好的用户体验
- 多个验证点及早发现问题
- 专用服务封装预算逻辑
- 事件允许 UI 显示警告

### 影响

**正面影响：**
- 灵活的用户体验（用户可以选择超出预算）
- 预算超支时有清晰的反馈
- 集中的预算逻辑

**负面影响：**
- 需要在 UI 中处理预算超支状态
- 用户可能忽略警告

**实现：**
```typescript
class BudgetValidationService {
  validateBudget(budget: Budget, selections: FurniturePlacement[]): ValidationResult {
    const total = this.calculateTotal(selections);
    if (budget.isExceededBy(total)) {
      return {
        isValid: false,
        exceededAmount: budget.getExceededAmount(total)
      };
    }
    return { isValid: true };
  }
}
```

---

## ADR-009: 多语言支持方案

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

应用程序需要支持多种语言（英语、中文等），包括 UI 和 AI 聊天交互。

### 决策

在 **UserSettings** 值对象中存储语言偏好，并传递给所有相关服务：
- UI 翻译由 i18n 库处理
- AI 聊天请求包含语言参数
- 语言在 localStorage 中持久化

### 理由

- 语言是用户设置，不是会话特定的
- 所有功能的一致语言体验
- AI 可以用用户的首选语言响应

### 影响

**正面影响：**
- 一致的语言体验
- 容易添加新语言
- 语言偏好持久化

**负面影响：**
- 需要翻译所有 UI 字符串
- AI 服务必须支持多种语言
- 更复杂的聊天请求格式化

**实现：**
```typescript
class UserSettings {
  language: string;  // 'en', 'zh' 等
}

class ChatService {
  sendMessage(session: PlanningSession, message: string) {
    const request = {
      message,
      language: session.userSettings.language,
      conversationHistory: session.chatHistory
    };
    // 发送到 AI 服务
  }
}
```

---

## ADR-010: 碰撞检测实现

**状态**: 已接受  
**日期**: 2026-01-26  
**决策者**: 开发团队

### 背景

我们需要防止家具在房间设计中重叠。这需要碰撞检测逻辑。

### 决策

将 **CollisionDetectionService** 实现为领域服务，使用 3D 边界框相交：
- 为每个家具摆放计算边界框
- 放置新家具时检查相交
- 发生碰撞时发出 `FurnitureCollisionDetected` 事件
- 如果检测到碰撞则阻止放置

### 理由

- 碰撞检测是领域逻辑（业务规则）
- 不属于任何单个聚合
- 领域服务适合多聚合操作
- 边界框方法简单且高效

### 影响

**正面影响：**
- 防止无效的家具布置
- 向用户提供清晰的错误反馈
- 可重用的碰撞检测逻辑

**负面影响：**
- 边界框是近似的（不是像素完美）
- 对于许多家具项目有性能影响
- 旋转家具的复杂性

**实现：**
```typescript
class CollisionDetectionService {
  checkCollision(placement1: FurniturePlacement, placement2: FurniturePlacement): boolean {
    const box1 = this.calculateBoundingBox(placement1);
    const box2 = this.calculateBoundingBox(placement2);
    return this.boxesIntersect(box1, box2);
  }
  
  validatePlacement(design: RoomDesign, furniture: FurniturePlacement, position: Position3D): boolean {
    // 检查所有现有摆放
    for (const existing of design.furniturePlacements) {
      if (this.checkCollision(furniture, existing)) {
        return false;
      }
    }
    return true;
  }
}
```

**未来改进：**
- 使用更精确的碰撞检测（多边形相交）
- 使用空间索引优化多项目场景
- 显示碰撞区域的视觉反馈

---

## 决策日志

| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| 001 | 前端架构采用领域驱动设计 | 已接受 | 2026-01-26 |
| 002 | 聚合边界和关系 | 已接受 | 2026-01-26 |
| 003 | 值对象 vs 实体 | 已接受 | 2026-01-26 |
| 004 | 前端状态存储策略 | 已接受 | 2026-01-26 |
| 005 | 外部服务的防腐层 | 已接受 | 2026-01-26 |
| 006 | 领域事件的事件驱动架构 | 已接受 | 2026-01-26 |
| 007 | 空房间 vs 有家具房间的处理 | 已接受 | 2026-01-26 |
| 008 | 预算验证策略 | 已接受 | 2026-01-26 |
| 009 | 多语言支持方案 | 已接受 | 2026-01-26 |
| 010 | 碰撞检测实现 | 已接受 | 2026-01-26 |

---

## 如何使用本文档

### 添加新的 ADR

当做出重要的架构决策时：

1. 创建一个带有下一个编号的新 ADR 部分
2. 填写所有部分（背景、决策驱动因素、选项、决策、影响）
3. 更新决策日志表
4. 获得团队审查和批准
5. 将状态更新为"已接受"或"已拒绝"

### ADR 模板

```markdown
## ADR-XXX: [标题]

**状态**: 提议中 | 已接受 | 已拒绝 | 已替代  
**日期**: YYYY-MM-DD  
**决策者**: [姓名]

### 背景
[我们面临什么问题？]

### 决策驱动因素
[哪些因素影响这个决策？]

### 考虑的选项
1. **选项 1**
   - 优点：...
   - 缺点：...

### 决策
[我们决定了什么？]

### 理由
[为什么做出这个决策？]

### 影响
**正面影响：**
- ...

**负面影响：**
- ...

**缓解措施：**
- ...
```

---

## 参考资料

- [领域驱动设计 by Eric Evans](https://www.domainlanguage.com/ddd/)
- [实现领域驱动设计 by Vaughn Vernon](https://vaughnvernon.com/)
- [ADR GitHub 组织](https://adr.github.io/)
- [用户故事文档](../inception/user_stories.md)
- [领域模型文档](../construction/unit_1_frontend_application/domain_model.md)
