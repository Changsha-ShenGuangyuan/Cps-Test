<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { t } from '../i18n/index';
  import ResponsiveImage from './ResponsiveImage.vue';
  import { iconManager } from '../utils/iconManager';

  // 路由实例
  const router = useRouter();
  const route = useRoute();

  // 历史记录项类型定义
  interface HistoryItem {
    id: number;
    path: string;
    timestamp: number;
  }

  // 检测设备类型
  const isTouchDevice = ref('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // 历史记录相关
  const isHistoryOpen = ref(false);
  let historyTimeout: number | null = null;
  let storageTimeout: number | null = null;

  // localStorage键名
  const HISTORY_STORAGE_KEY = 'visit_history';

  // 防抖函数，用于优化localStorage写入
  const debounce = (func: Function, delay: number) => {
    let timeoutId: number | null;
    return function(this: any, ...args: any[]) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        func.apply(this, args);
        timeoutId = null;
      }, delay);
    };
  };

  // 从localStorage加载历史记录
  const loadHistoryFromStorage = (): HistoryItem[] => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const rawItems = JSON.parse(stored);
        // 确保只提取需要的字段，忽略旧格式的title和time字段
        return rawItems.map((item: any) => ({
          id: item.id,
          path: item.path,
          timestamp: item.timestamp,
        }));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
    }
    return [];
  };

  // 防抖保存历史记录到localStorage
  const debouncedSaveHistory = debounce((history: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }, 300);

  // 保存历史记录到localStorage
  const saveHistoryToStorage = (history: HistoryItem[]) => {
    debouncedSaveHistory(history);
  };

  // 格式化时间显示
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return t('justNow');
    } else if (minutes < 60) {
      return `${minutes}${t('minutesAgo')}`;
    } else if (hours < 24) {
      return `${hours}${t('hoursAgo')}`;
    } else if (days < 7) {
      return `${days}${t('daysAgo')}`;
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    }
  };

  // 历史记录数据
  const historyItems = ref<HistoryItem[]>(loadHistoryFromStorage());

  // 验证路径参数的有效性
  const validatePathParams = (basePath: string): boolean => {
    // 验证点击测试路径
    if (basePath.startsWith('/click-test/')) {
      const time = basePath.split('/')[2];
      const validTimes = ['1', '2', '5', '10', '15', '30', '60'];
      return !!time && validTimes.includes(time);
    }
    // 验证空格点击测试路径
    else if (basePath.startsWith('/space-click-test/')) {
      const time = basePath.split('/')[2];
      const validTimes = ['1', '2', '5', '10', '15', '30', '60'];
      return !!time && validTimes.includes(time);
    }
    // 验证打字测试路径
    else if (basePath.startsWith('/typing-test/')) {
      const time = basePath.split('/')[2];
      const validTimes = ['1', '3', '5', '10', '15'];
      return !!time && validTimes.includes(time);
    }
    // 验证多点击测试路径
    else if (basePath.startsWith('/multi-click-test/')) {
      const type = basePath.split('/')[2];
      const validTypes = ['double', 'triple'];
      return !!type && validTypes.includes(type);
    }
    
    // 其他路径默认有效
    return true;
  };

  // 从路径中移除语言前缀
  const removeLanguagePrefix = (path: string) => {
    const supportedLanguages = ['zh-CN', 'ja', 'ko'];
    const pathSegments = path.split('/').filter((segment) => segment !== '');

    if (
      pathSegments.length > 0 &&
      pathSegments[0] &&
      supportedLanguages.includes(pathSegments[0])
    ) {
      // 移除语言前缀
      return `/${pathSegments.slice(1).join('/')}`;
    }

    return path;
  };

  // 添加新的历史记录项
  const addHistoryItem = (path: string) => {
    // 不记录404页面
    const resolved = router.resolve(path);
    const isInvalidPath = !resolved.matched.some((route) => route.name !== 'NotFound');
    if (isInvalidPath) {
      return;
    }

    // 移除语言前缀，以便验证路径参数
    const basePath = removeLanguagePrefix(path);

    // 验证路径参数的有效性
    if (!validatePathParams(basePath)) {
      return;
    }

    // 检查是否已存在相同路径的记录，如果存在则移除旧记录
    const existingIndex = historyItems.value.findIndex((item) => item.path === path);
    if (existingIndex > -1) {
      historyItems.value.splice(existingIndex, 1);
    }

    // 创建新的历史记录项
    const newItem: HistoryItem = {
      id: Date.now(),
      path,
      timestamp: Date.now(),
    };

    // 添加到历史记录开头
    historyItems.value.unshift(newItem);

    // 限制历史记录数量为100条
    if (historyItems.value.length > 100) {
      historyItems.value = historyItems.value.slice(0, 100);
    }

    // 保存到localStorage
    saveHistoryToStorage(historyItems.value);
  };

  // 删除单个历史记录项
  const deleteHistoryItem = (index: number) => {
    historyItems.value.splice(index, 1);
    saveHistoryToStorage(historyItems.value);
  };

  // 清除全部历史记录
  const removeAllHistory = () => {
    historyItems.value = [];
    saveHistoryToStorage(historyItems.value);
  };

  // 根据当前语言添加语言前缀（预留方法）
  // const addLanguagePrefix = (path: string) => {
  //   // 先移除可能存在的语言前缀，避免重复添加
  //   const basePath = removeLanguagePrefix(path);
  // 
  //   // 获取当前语言
  //   const currentLang = localStorage.getItem('language') || 'en';
  // 
  //   // 根据当前语言添加语言前缀
  //   let fullPath = basePath;
  //   if (currentLang !== 'en') {
  //     // 确保路径以斜杠开头
  //     const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  //     fullPath = `/${currentLang}${normalizedPath}`;
  //   }
  // 
  //   return fullPath;
  // };

  // 检查历史记录项是否与当前路径匹配
  const isHistoryItemActive = (item: HistoryItem) => {
    return item.path === route.path;
  };

  // 点击历史记录项导航到对应页面
  const navigateToHistoryItem = (item: HistoryItem) => {
    // 使用router.push导航
    router.push(item.path);
    // 导航后关闭历史记录面板
    isHistoryOpen.value = false;
  };

  // 显示历史记录面板
  const showHistory = () => {
    if (historyTimeout) {
      clearTimeout(historyTimeout);
      historyTimeout = null;
    }
    isHistoryOpen.value = true;
  };

  // 隐藏历史记录面板
  const hideHistory = () => {
    if (historyTimeout) {
      clearTimeout(historyTimeout);
      historyTimeout = null;
    }
    // 增加延迟时间，给用户更充足的时间移动鼠标到面板上
    historyTimeout = window.setTimeout(() => {
      isHistoryOpen.value = false;
      historyTimeout = null;
    }, 100);
  };

  // 切换历史记录面板显示状态
  const toggleHistory = (e?: MouseEvent | TouchEvent) => {
    e?.stopPropagation();

    // 清除历史记录的延迟定时器，避免状态冲突
    if (historyTimeout) {
      clearTimeout(historyTimeout);
      historyTimeout = null;
    }

    // 切换状态
    isHistoryOpen.value = !isHistoryOpen.value;
  };

  // 从路由路径获取页面标题
  const getPageTitleFromPath = (path: string): string => {
    // 先移除语言前缀，确保正确匹配路径
    const basePath = removeLanguagePrefix(path);

    // 根据路径返回对应的页面标题
    if (basePath.startsWith('/click-test/')) {
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('sec')} ${t('clickTest')}`;
      } else {
        return t('clickTest');
      }
    } else if (basePath.startsWith('/space-click-test/')) {
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('sec')} ${t('spaceClickTest')}`;
      } else {
        return t('spaceClickTest');
      }
    } else if (basePath.startsWith('/typing-test/')) {
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('minTypingTest')} ${t('typingTest')}`;
      } else {
        return t('typingTest');
      }
    } else if (basePath === '/kohi-click-test') {
      return t('kohiClickTest');
    } else if (basePath === '/spacebar-clicker') {
      return t('spacebarClicker');
    } else if (basePath === '/reaction-time-test') {
      return t('simpleReactionTest');
    } else if (basePath === '/color-reaction-test') {
      return t('colorReactionTest');
    } else if (basePath === '/key-reaction-test') {
      return t('keyReactionTest');
    } else if (basePath === '/target-elimination-game') {
      return t('targetEliminationGame');
    } else if (basePath === '/mouse-scroll-test') {
      return t('mouseScrollTest');
    } else if (basePath === '/mouse-drag-test') {
      return t('mouseDragTest');
    } else if (basePath === '/keyboard-test') {
      return t('keyboardTest');
    } else if (basePath.startsWith('/multi-click-test/')) {
      const type = basePath.split('/')[2];
      if (type === 'double') {
        return t('doubleClickTest');
      } else if (type === 'triple') {
        return t('tripleClickTest');
      }
      return t('clickSeriesTest');
    } else if (basePath === '/') {
      return t('home');
    } else if (basePath === '/privacy-policy') {
      return t('privacyPolicy');
    }

    // 默认返回路径作为标题
    return basePath.substring(1) || t('home');
  };

  // 移动端历史菜单触摸处理
  const onHistoryTouch = (e: TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault(); // 阻止后续的click事件触发，避免状态切换两次
    }
    toggleHistory(e);
  };

  // 点击外部关闭菜单
  const closeHistoryOnOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.history-selector')) {
      isHistoryOpen.value = false;
    }
  };

  // 关闭历史记录面板
  const closeHistory = () => {
    isHistoryOpen.value = false;
  };

  // 暴露方法给父组件
  defineExpose({
    addHistoryItem,
    closeHistory
  });

  // 使用图标管理服务获取图标URL
  const historyIconUrl = iconManager.getIconUrl('history');

  onMounted(() => {
    document.addEventListener('click', closeHistoryOnOutsideClick);
  });

  onUnmounted(() => {
    document.removeEventListener('click', closeHistoryOnOutsideClick);
    if (historyTimeout) {
      clearTimeout(historyTimeout);
    }
    if (storageTimeout) {
      clearTimeout(storageTimeout);
    }
  });
</script>

<template>
  <div
    class="selector-base history-selector"
    :class="{
      'mobile-open': isHistoryOpen,
      'mobile-active': isTouchDevice && isHistoryOpen,
      active: isHistoryOpen,
      'show-content': isHistoryOpen,
    }"
    @touchstart.stop="onHistoryTouch($event)"
    @mouseenter="showHistory"
    @mouseleave="hideHistory"
    @click.stop="toggleHistory"
  >
    <ResponsiveImage
      :src="historyIconUrl"
      :alt="t('historyIconAlt')"
      class-name="language-image"
      :width="30"
      :height="30"
      :lazy="true"
      :priority="false"
    />
    <!-- 历史记录面板 -->
    <div
      v-if="isHistoryOpen"
      class="history-panel"
      role="region"
      aria-label="历史记录"
      @mouseenter="showHistory"
      @mouseleave="hideHistory"
      @touchstart.stop=""
      @touchmove.stop=""
      @touchend.stop=""
    >
      <div class="history-header">
        <h3>{{ t('history') }}</h3>
        <button
          class="remove-all-btn"
          aria-label="清除所有历史记录"
          @click.stop="removeAllHistory"
        >
          {{ t('removeAll') }}
        </button>
      </div>
      <div class="history-list">
        <div v-if="historyItems.length === 0" class="no-history">
          {{ t('noHistory') }}
        </div>
        <!-- 动态渲染历史记录项 -->
        <div
          v-for="(item, index) in historyItems"
          :key="item.id"
          class="history-item"
          :class="{ active: isHistoryItemActive(item) }"
          @click.stop="navigateToHistoryItem(item)"
        >
          <div class="history-title">{{ getPageTitleFromPath(item.path) }}</div>
          <div class="history-time">{{ formatTime(item.timestamp) }}</div>
          <button
            class="delete-btn"
            title="删除此记录"
            aria-label="删除此记录"
            @click.stop="deleteHistoryItem(index)"
            @touchstart.stop.prevent="deleteHistoryItem(index)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 历史选择器样式 */
  .history-selector {
    position: relative;
  }

  .language-image {
    cursor: pointer;
  }

  .history-panel {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background-color: #1a1a1a;
    border: 1px solid #333333;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    min-width: 280px;
    max-width: 320px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #333333;
    background-color: #2a2a2a;
  }

  .history-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .remove-all-btn {
    background: none;
    border: none;
    color: #ff6b6b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .remove-all-btn:hover {
    background-color: rgba(255, 107, 107, 0.2);
  }

  .history-list {
    padding: 8px 0;
  }

  .no-history {
    padding: 40px 16px;
    text-align: center;
    color: #aaaaaa;
    font-size: 14px;
  }

  .history-item {
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    border-bottom: 1px solid #333333;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
  }

  .history-item:hover {
    background-color: #2a2a2a;
  }

  .history-item:hover .history-title {
    color: #4caf50;
    text-decoration: underline;
  }

  .history-item.active {
    background-color: transparent;
  }

  .history-item.active .history-title {
    color: #ffffff;
    text-decoration: none;
  }

  .history-item.active:hover .history-title {
    color: #4caf50;
    text-decoration: underline;
  }

  .history-title {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .history-time {
    font-size: 12px;
    color: #aaaaaa;
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
    color: #ffffff;
  }

  .delete-btn:hover {
    background-color: rgba(255, 107, 107, 0.2);
  }

  /* 滚动条样式 */
  .history-panel::-webkit-scrollbar {
    width: 6px;
  }

  .history-panel::-webkit-scrollbar-track {
    background: #333333;
  }

  .history-panel::-webkit-scrollbar-thumb {
    background: #555555;
    border-radius: 3px;
  }

  .history-panel::-webkit-scrollbar-thumb:hover {
    background: #666666;
  }

  /* 移动端样式 */
  @media (max-width: 768px) {
    .history-panel {
      right: -10px;
      min-width: 240px;
      max-width: 280px;
      max-height: 350px;
    }

    .history-header {
      padding: 10px 12px;
    }

    .history-header h3 {
      font-size: 15px;
    }

    .remove-all-btn {
      font-size: 13px;
    }

    .history-item {
      padding: 10px 12px;
    }

    .history-title {
      font-size: 13px;
    }

    .history-time {
      font-size: 11px;
    }
  }
</style>