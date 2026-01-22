// 图标管理服务
class IconManager {
  private icons: Map<string, string> = new Map();
  private loadedIcons: Set<string> = new Set();
  private iconCache: Map<string, string> = new Map();

  // 图标映射表
  private iconMap: Record<string, string> = {
    history: 'history.png',
    home: 'home.png',
    chick: 'chick.png',
    mouse02: 'mouse02.png',
    keyboard02: 'keyboard02.png',
    reaction: 'reaction.png',
    game02: 'game02.png',
    statistics: 'statistics.png',
    question: 'question.png',
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
    const iconFilename = this.iconMap[iconName];
    if (iconFilename) {
      try {
        // 使用相对于当前文件的路径
        const iconUrl = new URL(`../assets/icons/${iconFilename}`, import.meta.url).href;
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
    commonIcons.forEach((iconName) => {
      setTimeout(() => {
        this.getIconUrl(iconName);
      }, 100);
    });
  }

  // 批量预加载图标
  preloadIcons(iconNames: string[]) {
    iconNames.forEach((iconName) => {
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
