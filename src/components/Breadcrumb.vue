<template>
  <div class="breadcrumb">
    <template v-for="(item, index) in breadcrumbs" :key="item.path || `text-${index}`">
      <router-link v-if="item.path" :to="item.path" class="breadcrumb-link">
        {{ item.name }}
      </router-link>
      <span v-else class="breadcrumb-text">
        {{ item.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator"> &gt; </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../i18n/index';

// 获取当前路由
const route = useRoute();

// 使用i18n
const { t, langState } = useI18n();

// 类型定义
export interface BreadcrumbItem {
  name: string;
  path: string;
}

// 生成首页路径
const getHomePath = (): string => {
  return langState.current === 'en' ? '/' : `/${langState.current}`;
};

// 语言前缀正则表达式（静态常量）
const LANG_PREFIX_REGEX = /^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})\//;

// 处理语言前缀
const getPathInfo = (path: string) => {
  const hasLangPrefix = LANG_PREFIX_REGEX.test(path);
  const shouldRemoveLangPrefix = langState.current !== 'en';
  
  const basePath = shouldRemoveLangPrefix && hasLangPrefix ? path.replace(LANG_PREFIX_REGEX, '/') : path;
  const paramPath = shouldRemoveLangPrefix && hasLangPrefix ? basePath : path;
  const paramIndex = hasLangPrefix && !shouldRemoveLangPrefix ? 3 : 2;

  return { basePath, paramPath, paramIndex };
};

// 路由配置映射，减少重复代码
const routeConfigMap: Record<string, string> = {
  '/kohi-click-test': 'kohiClickTest',
  '/reaction-time-test': 'reactionTest',
  '/color-reaction-test': 'colorReactionTest',
  '/key-reaction-test': 'keyReactionTest',
  '/target-elimination-game': 'targetEliminationGame',
  '/mouse-scroll-test': 'mouseScrollTest',
  '/mouse-drag-test': 'mouseDragTest',
  '/keyboard-test': 'keyboardTest',
  '/spacebar-clicker': 'spacebarClicker'
};

// 计算面包屑数据
const breadcrumbs = computed(() => {
  const path = route.path || '/';
  const items: BreadcrumbItem[] = [{ name: t('home'), path: getHomePath() }];

  const { basePath, paramPath, paramIndex } = getPathInfo(path);

  // 处理带参数的路由
  if (basePath.startsWith('/click-test/')) {
    const time = paramPath.split('/')[paramIndex];
    if (time) {
      items.push({ name: t('clickTest'), path: path.replace(/\/\d+$/, '/5') });
      items.push({ name: `${time}${t('sec')} ${t('clickTest')}`, path: path });
    }
  } else if (basePath.startsWith('/space-click-test/')) {
    const time = paramPath.split('/')[paramIndex];
    if (time) {
      items.push({ name: t('spaceClickTest'), path: path.replace(/\/\d+$/, '/5') });
      items.push({ name: `${time}${t('sec')} ${t('spaceClickTest')}`, path: path });
    }
  } else if (basePath.startsWith('/typing-test/')) {
    const time = paramPath.split('/')[paramIndex];
    if (time) {
      items.push({ name: t('typingTest'), path: path.replace(/\/\d+$/, '/1') });
      items.push({ name: `${time}${t('minTypingTest')}`, path: path });
    }
  } else if (basePath.startsWith('/multi-click-test/')) {
    const type = paramPath.split('/')[paramIndex] || '';
    items.push({ name: t('clickSeriesTest'), path: path.replace(/\/[^/]+$/, '/double') });
    if (type === 'double') {
      items.push({ name: t('doubleClickTest'), path: path });
    } else if (type === 'triple') {
      items.push({ name: t('tripleClickTest'), path: path });
    }
  }
  // 处理固定路由（使用映射表优化）
  else if (routeConfigMap[basePath]) {
    items.push({ name: t(routeConfigMap[basePath]), path: path });
  }

  return items;
});
</script>

<style scoped>
/* 基础字体样式 */
.breadcrumb {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  letter-spacing: 0.2px;
  
  /* 容器样式 */
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
}

/* 链接样式 */
.breadcrumb-link {
  color: #66cc66;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 3px 5px;
  border-radius: 3px;
  font-weight: 500;
  touch-action: manipulation;
}

.breadcrumb-link:hover {
  color: #ffffff;
  background-color: rgba(102, 204, 102, 0.3);
}

/* 文本样式 */
.breadcrumb-text {
  color: #ffffff;
  font-weight: 500;
}

/* 分隔符样式 */
.breadcrumb-separator {
  color: #666;
  margin: 0 4px;
  font-size: 12px;
}

/* 移动设备优化 */
@media (max-width: 768px) {
  .breadcrumb {
    padding: 8px 12px;
    margin: 8px 0 16px 0;
    font-size: 12px;
    gap: 6px;
  }
  
  .breadcrumb-link {
    padding: 2px 4px;
  }
  
  .breadcrumb-separator {
    margin: 0 2px;
    font-size: 10px;
  }
}
</style>
