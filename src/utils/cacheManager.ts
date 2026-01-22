// 资源缓存管理服务
class CacheManager {
  private componentCache: Map<string, any> = new Map();
  private resourceCache: Map<string, string> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private maxCacheSize: number = 100;
  private cacheTtl: number = 24 * 60 * 60 * 1000; // 24小时

  // 缓存组件
  cacheComponent(componentName: string, component: any) {
    // 检查缓存大小
    if (this.componentCache.size >= this.maxCacheSize) {
      this.evictOldestCache();
    }

    this.componentCache.set(componentName, component);
    this.cacheExpiry.set(componentName, Date.now() + this.cacheTtl);
  }

  // 获取缓存的组件
  getCachedComponent(componentName: string): any | null {
    // 检查缓存是否过期
    if (!this.isCacheValid(componentName)) {
      this.removeCache(componentName);
      return null;
    }

    return this.componentCache.get(componentName) || null;
  }

  // 缓存资源URL
  cacheResource(resourceKey: string, resourceUrl: string) {
    this.resourceCache.set(resourceKey, resourceUrl);
    this.cacheExpiry.set(resourceKey, Date.now() + this.cacheTtl);
  }

  // 获取缓存的资源URL
  getCachedResource(resourceKey: string): string | null {
    // 检查缓存是否过期
    if (!this.isCacheValid(resourceKey)) {
      this.removeCache(resourceKey);
      return null;
    }

    return this.resourceCache.get(resourceKey) || null;
  }

  // 检查缓存是否有效
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry) {
      return false;
    }
    return Date.now() < expiry;
  }

  // 移除缓存
  removeCache(key: string) {
    this.componentCache.delete(key);
    this.resourceCache.delete(key);
    this.cacheExpiry.delete(key);
  }

  // 移除最早的缓存
  private evictOldestCache() {
    let oldestKey: string | null = null;
    let oldestTime: number = Infinity;

    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry < oldestTime) {
        oldestTime = expiry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.removeCache(oldestKey);
    }
  }

  // 清除所有缓存
  clearAllCache() {
    this.componentCache.clear();
    this.resourceCache.clear();
    this.cacheExpiry.clear();
  }

  // 清除过期缓存
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.removeCache(key);
      }
    }
  }

  // 获取缓存统计信息
  getCacheStats() {
    return {
      componentCacheSize: this.componentCache.size,
      resourceCacheSize: this.resourceCache.size,
      totalCacheSize: this.componentCache.size + this.resourceCache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }

  // 设置缓存大小限制
  setMaxCacheSize(size: number) {
    this.maxCacheSize = size;
    // 如果当前缓存大小超过新的限制，移除多余的缓存
    while (this.componentCache.size + this.resourceCache.size > size) {
      this.evictOldestCache();
    }
  }

  // 设置缓存过期时间
  setCacheTtl(ttl: number) {
    this.cacheTtl = ttl;
  }
}

// 导出单例实例
export const cacheManager = new CacheManager();
