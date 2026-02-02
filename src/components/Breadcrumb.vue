<template>
  <div class="breadcrumb">
    <span v-for="(item, index) in breadcrumbs" :key="item.path || `text-${index}`">
      <router-link v-if="item.path" :to="item.path" class="breadcrumb-link">
        {{ item.name }}
      </router-link>
      <span v-else class="breadcrumb-text">
        {{ item.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator"> &gt; </span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { t, langState } from '../i18n/index';

  // 获取当前路由
  const route = useRoute();

  // 类型定义
  interface BreadcrumbItem {
    name: string;
    path: string;
  }

  // 辅助函数：生成首页路径
  const generateHomePath = (): string => {
    return langState.current === 'en' ? '/' : `/${langState.current}`;
  };

  // 辅助函数：处理语言前缀
  const processLangPrefix = (path: string): { hasLangPrefix: boolean; basePath: string; paramPath: string; paramIndex: number } => {
    const langPrefixRegex = /^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})\//;
    const hasLangPrefix = langPrefixRegex.test(path);
    const shouldRemoveLangPrefix = langState.current !== 'en';
    
    let basePath = path;
    if (shouldRemoveLangPrefix && hasLangPrefix) {
      basePath = path.replace(langPrefixRegex, '/');
    }

    let paramPath = path;
    let paramIndex = 2;
    if (hasLangPrefix && !shouldRemoveLangPrefix) {
      paramIndex = 3;
    } else if (hasLangPrefix && shouldRemoveLangPrefix) {
      paramPath = basePath;
      paramIndex = 2;
    }

    return { hasLangPrefix, basePath, paramPath, paramIndex };
  };

  // 辅助函数：添加面包屑项
  const addBreadcrumbItem = (items: BreadcrumbItem[], name: string, path: string): void => {
    items.push({ name, path });
  };

  // 计算面包屑数据
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const path = route.path;
    const breadcrumbItems: BreadcrumbItem[] = [{ name: t('home'), path: generateHomePath() }];

    // 处理语言前缀
    const { basePath, paramPath, paramIndex } = processLangPrefix(path);

    // 处理点击测试路由
    if (basePath.startsWith('/click-test/')) {
      const time = paramPath.split('/')[paramIndex];
      addBreadcrumbItem(breadcrumbItems, t('clickTest'), route.path.replace(/\/\d+$/, '/5'));
      addBreadcrumbItem(breadcrumbItems, `${time}${t('sec')} ${t('clickTest')}`, route.path);
    }
    // 处理空格点击测试路由
    else if (basePath.startsWith('/space-click-test/')) {
      const time = paramPath.split('/')[paramIndex];
      addBreadcrumbItem(breadcrumbItems, t('spaceClickTest'), route.path.replace(/\/\d+$/, '/5'));
      addBreadcrumbItem(breadcrumbItems, `${time}${t('sec')} ${t('spaceClickTest')}`, route.path);
    }
    // 处理Kohi点击测试路由
    else if (basePath === '/kohi-click-test') {
      addBreadcrumbItem(breadcrumbItems, t('kohiClickTest'), route.path);
    }
    // 处理反应时间测试路由
    else if (basePath === '/reaction-time-test') {
      addBreadcrumbItem(breadcrumbItems, t('reactionTest'), route.path);
    }
    // 处理颜色反应测试路由
    else if (basePath === '/color-reaction-test') {
      addBreadcrumbItem(breadcrumbItems, t('colorReactionTest'), route.path);
    }
    // 处理按键反应测试路由
    else if (basePath === '/key-reaction-test') {
      addBreadcrumbItem(breadcrumbItems, t('keyReactionTest'), route.path);
    }
    // 处理目标消除游戏路由
    else if (basePath === '/target-elimination-game') {
      addBreadcrumbItem(breadcrumbItems, t('targetEliminationGame'), route.path);
    }
    // 处理鼠标滚动测试路由
    else if (basePath === '/mouse-scroll-test') {
      addBreadcrumbItem(breadcrumbItems, t('mouseScrollTest'), route.path);
    }
    // 处理打字测试路由
    else if (basePath.startsWith('/typing-test/')) {
      const time = paramPath.split('/')[paramIndex];
      addBreadcrumbItem(breadcrumbItems, t('typingTest'), route.path.replace(/\/\d+$/, '/1'));
      addBreadcrumbItem(breadcrumbItems, `${time}${t('minTypingTest')}`, route.path);
    }
    // 处理连点测试路由
    else if (basePath.startsWith('/multi-click-test/')) {
      const type = paramPath.split('/')[paramIndex] || '';
      addBreadcrumbItem(breadcrumbItems, t('clickSeriesTest'), route.path.replace(/\/[^/]+$/, '/double'));
      if (type === 'double') {
        addBreadcrumbItem(breadcrumbItems, t('doubleClickTest'), route.path);
      } else if (type === 'triple') {
        addBreadcrumbItem(breadcrumbItems, t('tripleClickTest'), route.path);
      }
    }
    // 处理鼠标拖动测试路由
    else if (basePath === '/mouse-drag-test') {
      addBreadcrumbItem(breadcrumbItems, t('mouseDragTest'), route.path);
    }
    // 处理键盘测试路由
    else if (basePath === '/keyboard-test') {
      addBreadcrumbItem(breadcrumbItems, t('keyboardTest'), route.path);
    }
    // 处理空格键点击器路由
    else if (basePath === '/spacebar-clicker') {
      addBreadcrumbItem(breadcrumbItems, t('spacebarClicker'), route.path);
    }

    return breadcrumbItems;
  });
</script>

<style scoped>
  /* 公共字体和渲染属性 */
  .breadcrumb, .breadcrumb-link, .breadcrumb-text, .breadcrumb-separator {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .breadcrumb {
    margin: 10px 0 20px 0;
    padding: 12px 15px;
    font-size: 14px;
    color: #ccc;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    background-color: rgba(30, 30, 30, 0.5);
    border-radius: 6px;
    border-left: 3px solid #4caf50;
    letter-spacing: 0.2px;
  }

  .breadcrumb-link {
    color: #66cc66;
    text-decoration: none;
    transition: all 0.2s ease;
    padding: 3px 5px;
    border-radius: 3px;
    letter-spacing: 0.2px;
    font-weight: 500;
  }

  .breadcrumb-link:hover {
    color: #ffffff;
    background-color: rgba(102, 204, 102, 0.3);
    text-decoration: none;
  }

  .breadcrumb-text {
    color: #ffffff;
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .breadcrumb-separator {
    color: #666;
    margin: 0 4px;
    font-size: 12px;
  }
</style>
