// 预加载服务
class PreloadService {
  private preloadedComponents: Set<string> = new Set();
  private networkSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  private userBehavior: Map<string, { clicks: number; views: number; lastAccessed: number }> =
    new Map();
  private cacheManager: any = null;

  constructor() {
    // 检测网络速度
    this.detectNetworkSpeed();

    // 初始化缓存管理器（仅在生产环境）
    this.initCacheManager();
  }

  // 初始化缓存管理器
  private initCacheManager() {
    if (import.meta.env.PROD) {
      // 动态导入缓存管理器
      import('../utils/cacheManager').then(({ cacheManager: cm }) => {
        this.cacheManager = cm;
      });
    }
  }

  // 检测网络速度
  detectNetworkSpeed() {
    if ('connection' in navigator) {
      const connection = navigator.connection as any;
      const effectiveType = connection.effectiveType || '4g';

      if (effectiveType === '2g') {
        this.networkSpeed = 'slow';
      } else if (effectiveType === '3g') {
        this.networkSpeed = 'medium';
      } else {
        this.networkSpeed = 'fast';
      }
    }
  }

  // 预加载组件
  async preloadComponent(componentPath: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    // 检查缓存
    if (this.cacheManager) {
      const cachedComponent = this.cacheManager.getCachedComponent(componentPath);
      if (cachedComponent) {
        this.preloadedComponents.add(componentPath);
        return;
      }
    }

    // 跳过已经预加载的组件
    if (this.preloadedComponents.has(componentPath)) {
      return;
    }

    // 根据网络速度和优先级决定是否预加载
    if (this.networkSpeed === 'slow' && priority === 'low') {
      return;
    }

    try {
      // 动态导入组件
      const component = await import(`../components/${componentPath}.vue`);
      this.preloadedComponents.add(componentPath);
      // 缓存组件
      if (this.cacheManager) {
        this.cacheManager.cacheComponent(componentPath, component);
      }
    } catch (error) {
      console.warn(`Failed to preload component ${componentPath}:`, error);
    }
  }

  // 批量预加载组件
  async preloadComponents(
    components: Array<{ path: string; priority: 'high' | 'medium' | 'low' }>
  ) {
    // 按照优先级排序
    const sortedComponents = [...components].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // 批量预加载
    for (const component of sortedComponents) {
      await this.preloadComponent(component.path, component.priority);
    }
  }

  // 预加载常用测试组件
  async preloadCommonTestComponents() {
    const commonComponents: Array<{ path: string; priority: 'high' | 'medium' | 'low' }> = [
      { path: 'ClickTest', priority: 'high' },
      { path: 'SpaceClickTest', priority: 'high' },
      { path: 'KeyboardTest', priority: 'medium' },
      { path: 'ReactionTimeTest', priority: 'medium' },
      { path: 'TypingTest', priority: 'medium' },
      { path: 'ResultModal', priority: 'high' },
      { path: 'RelatedTests', priority: 'low' },
    ];

    await this.preloadComponents(commonComponents);
  }

  // 预加载基于用户历史的组件
  async preloadBasedOnHistory(historyItems: Array<{ path: string }>) {
    const pathToComponentMap: Record<string, string> = {
      '/click-test/': 'ClickTest',
      '/space-click-test/': 'SpaceClickTest',
      '/keyboard-test': 'KeyboardTest',
      '/reaction-time-test': 'ReactionTimeTest',
      '/typing-test/': 'TypingTest',
      '/kohi-click-test': 'KohiClickTest',
      '/spacebar-clicker': 'SpacebarClicker',
      '/target-elimination-game': 'TargetEliminationGame',
    };

    const componentsToPreload = new Set<string>();

    // 分析历史记录，找出用户常用的组件
    for (const item of historyItems.slice(0, 5)) {
      // 只考虑最近5条历史记录
      for (const [pathPrefix, componentName] of Object.entries(pathToComponentMap)) {
        if (item.path.includes(pathPrefix)) {
          componentsToPreload.add(componentName);
          break;
        }
      }
    }

    // 预加载用户常用的组件
    for (const componentName of componentsToPreload) {
      await this.preloadComponent(componentName, 'high');
    }
  }

  // 预加载下一个可能的组件
  async preloadNextPossibleComponents(currentPath: string) {
    const pathToRelatedComponents: Record<string, string[]> = {
      '/click-test/': ['KohiClickTest', 'DoubleClickTest', 'TripleClickTest'],
      '/space-click-test/': ['SpacebarClicker', 'KeyboardTest'],
      '/reaction-time-test': ['ColorReactionTest', 'KeyReactionTest'],
      '/typing-test/': ['KeyboardTest'],
      '/keyboard-test': ['TypingTest', 'KeyReactionTest'],
    };

    for (const [pathPrefix, relatedComponents] of Object.entries(pathToRelatedComponents)) {
      if (currentPath.includes(pathPrefix)) {
        for (const componentName of relatedComponents) {
          await this.preloadComponent(componentName, 'medium');
        }
        break;
      }
    }
  }

  // 检查组件是否已预加载
  isComponentPreloaded(componentPath: string): boolean {
    return this.preloadedComponents.has(componentPath);
  }

  // 清除预加载缓存
  clearCache() {
    this.preloadedComponents.clear();
  }

  // 记录用户行为
  recordUserBehavior(componentName: string, action: 'click' | 'view') {
    const behavior = this.userBehavior.get(componentName) || {
      clicks: 0,
      views: 0,
      lastAccessed: Date.now(),
    };

    if (action === 'click') {
      behavior.clicks++;
    } else if (action === 'view') {
      behavior.views++;
    }

    behavior.lastAccessed = Date.now();
    this.userBehavior.set(componentName, behavior);

    // 最多保存20个组件的行为数据
    if (this.userBehavior.size > 20) {
      const oldestComponent = Array.from(this.userBehavior.entries()).sort(
        (a, b) => a[1].lastAccessed - b[1].lastAccessed
      )[0];
      if (oldestComponent) {
        this.userBehavior.delete(oldestComponent[0]);
      }
    }
  }

  // 基于时间的预加载
  async preloadBasedOnTime() {
    const currentHour = new Date().getHours();
    let componentsToPreload: Array<{ path: string; priority: 'high' | 'medium' | 'low' }> = [];

    // 根据时间段预加载不同的组件
    if (currentHour >= 6 && currentHour < 12) {
      // 早晨时段，预加载常用测试
      componentsToPreload = [
        { path: 'ClickTest', priority: 'high' },
        { path: 'SpaceClickTest', priority: 'high' },
        { path: 'ResultModal', priority: 'high' },
      ];
    } else if (currentHour >= 12 && currentHour < 18) {
      // 下午时段，预加载更多测试类型
      componentsToPreload = [
        { path: 'ClickTest', priority: 'high' },
        { path: 'SpaceClickTest', priority: 'high' },
        { path: 'KeyboardTest', priority: 'medium' },
        { path: 'ReactionTimeTest', priority: 'medium' },
        { path: 'ResultModal', priority: 'high' },
      ];
    } else {
      // 晚上时段，预加载所有常用组件
      componentsToPreload = [
        { path: 'ClickTest', priority: 'high' },
        { path: 'SpaceClickTest', priority: 'high' },
        { path: 'KeyboardTest', priority: 'medium' },
        { path: 'ReactionTimeTest', priority: 'medium' },
        { path: 'TypingTest', priority: 'medium' },
        { path: 'ResultModal', priority: 'high' },
      ];
    }

    await this.preloadComponents(componentsToPreload);
  }
}

// 导出单例实例
export const preloadService = new PreloadService();

// 导出类型
export type { PreloadService };
