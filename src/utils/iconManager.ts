// 图标管理服务
class IconManager {
  private icons: Map<string, string> = new Map();
  private loadedIcons: Set<string> = new Set();
  private iconCache: Map<string, string> = new Map();

  // 图标映射表
  private iconMap: Record<string, string> = {
    history: '../assets/icons/history.png',
    home: '../assets/icons/home.png',
    chick: '../assets/icons/chick.png',
    mouse02: '../assets/icons/mouse02.png',
    keyboard02: '../assets/icons/keyboard02.png',
    reaction: '../assets/icons/reaction.png',
    game02: '../assets/icons/game02.png',
    statistics: '../assets/icons/statistics.png',
    question: '../assets/icons/question.png'
  };

  // 获取图标URL
  getIconUrl(iconName: string): string {
    // 检查缓存
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName) || '';
    }

    // 检查是否已加载
    if (this.loadedIcons.has(iconName)) {
      const iconUrl = this.icons.get(iconName) || '';
      this.iconCache.set(iconName, iconUrl);
      return iconUrl;
    }

    // 加载图标
    const iconPath = this.iconMap[iconName];
    if (iconPath) {
      try {
        const iconUrl = new URL(iconPath, import.meta.url).href;
        this.icons.set(iconName, iconUrl);
        this.loadedIcons.add(iconName);
        this.iconCache.set(iconName, iconUrl);
        return iconUrl;
      } catch (error) {
        console.warn(`Failed to load icon ${iconName}:`, error);
        return '';
      }
    }

    return '';
  }

  // 预加载常用图标
  preloadCommonIcons() {
    const commonIcons = ['home', 'history', 'chick', 'keyboard02', 'reaction'];
    
    // 异步预加载图标
    commonIcons.forEach(iconName => {
      setTimeout(() => {
        this.getIconUrl(iconName);
      }, 100);
    });
  }

  // 批量预加载图标
  preloadIcons(iconNames: string[]) {
    iconNames.forEach(iconName => {
      setTimeout(() => {
        this.getIconUrl(iconName);
      }, 50);
    });
  }

  // 清除图标缓存
  clearCache() {
    this.iconCache.clear();
  }

  // 获取已加载的图标
  getLoadedIcons(): string[] {
    return Array.from(this.loadedIcons);
  }

  // 检查图标是否已加载
  isIconLoaded(iconName: string): boolean {
    return this.loadedIcons.has(iconName);
  }
}

// 导出单例实例
export const iconManager = new IconManager();
