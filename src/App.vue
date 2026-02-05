<script setup lang="ts">
  import { t, setLanguage, langState } from './i18n/index';
  // 导入ResponsiveImage组件（首屏关键组件）
  import ResponsiveImage from './components/ResponsiveImage.vue';

  // 导入拆分的组件
  import LanguageSelector from './components/LanguageSelector.vue';
  import HistorySelector from './components/HistorySelector.vue';
  import MenuManager from './components/MenuManager.vue';
  import Breadcrumb from './components/Breadcrumb.vue';

  import { updateMetaTags } from './router/index';
  // 导入工具类（仅在生产环境中预加载）
  import { iconManager } from './utils/iconManager';
  // 组件引用
  const historySelectorRef = ref<InstanceType<typeof HistorySelector> | null>(null);
  const contentRef = ref<HTMLElement | null>(null);

  const websiteName = computed(() => t('websiteName'));
  const mobileWebsiteName = computed(() => t('websiteName').split(' - ')[0]);

  // 路由实例
  const router = useRouter();
  const route = useRoute();

  // 节流函数，减少频繁触发
  const throttle = (func: Function, delay: number) => {
    let inThrottle = false;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, delay);
      }
    };
  };

  // 添加语言变化监听器，确保meta标签始终更新
  watch(
    () => langState.current,
    (newLang, oldLang) => {
      if (newLang !== oldLang) nextTick(() => updateMetaTags(router.currentRoute.value));
    },
    { immediate: false }
  );

  // 移动端侧边栏控制
  const isSidebarOpen = ref(false);

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  // 关闭侧边栏
  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  // 检测设备类型（true为移动端，false为桌面端）
  const isMobile = ref(window.innerWidth <= 1000);
  // 检测是否为触摸设备
  // const isTouchDevice = ref('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // 添加新的历史记录项
  const addHistoryItem = (path: string) => {
    // 通过ref调用HistorySelector组件的addHistoryItem方法
    if (historySelectorRef.value) {
      historySelectorRef.value.addHistoryItem(path);
    }
  };

  // 解密分享参数的函数
  const decodeShareParams = (encodedParams: string) => {
    try {
      // Base64解码
      const paramsJson = atob(encodedParams);
      // 解析为JSON对象
      const params = JSON.parse(paramsJson);
      // 返回解密后的参数
      return params;
    } catch (error) {
      console.error('Failed to decode share params:', error);
      return null;
    }
  };

  // 存储分享参数到sessionStorage
  const saveShareParams = (params: any) => {
    try {
      sessionStorage.setItem('sharedParams', JSON.stringify(params));
    } catch (error) {
      console.error('Failed to save shared params to sessionStorage:', error);
    }
  };

  // 检查并保存URL中的分享参数
  const checkAndSaveShareParams = () => {
    // 检查URL中是否有分享参数
    const shareParams = new URLSearchParams(window.location.search).get('share');
    if (shareParams) {
      // 解密分享参数
      const decodedParams = decodeShareParams(shareParams);
      if (decodedParams) {
        // 保存到sessionStorage
        saveShareParams(decodedParams);
      }
    }
  };

  onMounted(() => {
    // 添加路由导航监听，自动记录访问历史
    const removeRouterListener = router.afterEach((to) => {
      // 添加到历史记录
      addHistoryItem(to.path);
    });

    // 添加窗口大小改变监听，自动调整侧边栏状态和设备类型
    window.addEventListener('resize', handleResize);

    // 初始加载时，根据当前语言设置更新meta标签
    updateMetaTags(route);

    // 检查并保存URL中的分享参数
    checkAndSaveShareParams();

    // 预加载常用图标（轻量级操作）
    iconManager.preloadCommonIcons();

    // 组件卸载时移除事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      if (removeRouterListener) {
        removeRouterListener();
      }
    });
  });

  // 窗口大小改变时的处理函数（使用节流优化）
  const handleResize = throttle(() => {
    const width = window.innerWidth;
    isMobile.value = width <= 1000;

    // 当窗口宽度大于1000px时，自动关闭侧边栏
    if (width > 1000) {
      closeSidebar();
    }
  }, 200);

  // 滚动到顶部函数（使用平滑滚动）
  const scrollToTop = () => {
    if (contentRef.value) {
      contentRef.value.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // 监听路由变化，更新当前路径并滚动到顶部
  watch(
    () => route.path,
    () => {
      // 路由变化时将内容区域滚动到顶部
      scrollToTop();

      // 确保菜单已使用当前语言正确初始化，然后再处理路径匹配
      nextTick(() => {
        // 菜单展开逻辑已移至MenuManager组件
      });
    }
  );

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 先移除可能存在的语言前缀，避免重复添加
    const basePath = removeLanguagePrefix(path);

    // 根据当前语言添加语言前缀
    let fullPath = basePath;
    if (langState.current !== 'en') {
      const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
      fullPath = `/${langState.current}${normalizedPath}`;
    }

    router.push(fullPath).then(() => {
      // 导航成功后滚动到顶部
      scrollToTop();
      // 导航后关闭侧边栏（移动端）
      closeSidebar();
    });
  };

  // 辅助函数：从路径中移除语言前缀
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

  // 处理内容区域点击（关闭侧边栏）
  const handleContentClick = () => {
    if (isMobile.value && isSidebarOpen.value) {
      closeSidebar();
    }
  };

  // 切换语言 - 使用路径跳转实现
  const switchLanguage = async (languageCode: string) => {
    // 等待语言资源加载完成
    await setLanguage(languageCode);

    // 获取当前路径，去除语言前缀
    const currentPath = route.path;
    let basePath = currentPath;

    // 检查当前路径是否包含语言前缀
    const supportedLanguages = ['zh-CN', 'ja', 'ko'];
    const pathSegments = currentPath.split('/').filter((segment) => segment !== '');

    if (
      pathSegments.length > 0 &&
      pathSegments[0] &&
      supportedLanguages.includes(pathSegments[0])
    ) {
      // 移除当前语言前缀
      basePath = `/${pathSegments.slice(1).join('/')}`;
    }

    // 生成新的URL路径
    let newPath = '';
    if (languageCode === 'en') {
      // 默认语言不需要前缀
      newPath = basePath;
    } else {
      // 其他语言添加前缀
      const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
      newPath = `/${languageCode}${normalizedPath}`;
    }

    // 跳转到新的URL
    if (newPath !== currentPath) {
      await router.push(newPath);
    }
  };
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header" role="banner">
      <!-- 导航栏左侧区域：汉堡菜单 + logo -->
      <div class="header-left">
        <!-- 汉堡菜单按钮（移动端） -->
        <button
          class="hamburger-menu"
          aria-label="{{ t('menu') }}"
          :aria-expanded="isSidebarOpen"
          @click="toggleSidebar"
        >
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <!-- 桌面端logo -->
        <div
          class="logo"
          role="button"
          tabindex="0"
          @click="navigateTo('/')"
          @keydown.enter="navigateTo('/')"
        >
          <ResponsiveImage
            src="/logo.png"
            :alt="t('logoAlt')"
            class-name="logo-image"
            :width="32"
            :height="32"
            :lazy="true"
            :priority="true"
          />
          <span class="desktop-logo">{{ websiteName }}</span>
          <span class="mobile-logo">{{ mobileWebsiteName }}</span>
        </div>
      </div>
      <!-- 主导航区域：主要测试类型快捷导航 -->
      <nav class="main-nav" role="navigation" aria-label="{{ t('mainNavigation') }}">
        <ul class="main-nav-list">
          <li
            class="main-nav-item"
            role="button"
            tabindex="0"
            @click="navigateTo('/click-test/5')"
            @keydown.enter="navigateTo('/click-test/5')"
          >
            <span>{{ t('clickTest') }}</span>
          </li>
          <li
            class="main-nav-item"
            role="button"
            tabindex="0"
            @click="navigateTo('/space-click-test/5')"
            @keydown.enter="navigateTo('/space-click-test/5')"
          >
            <span>{{ t('spaceClickTest') }}</span>
          </li>
          <li
            class="main-nav-item"
            role="button"
            tabindex="0"
            @click="navigateTo('/keyboard-test')"
            @keydown.enter="navigateTo('/keyboard-test')"
          >
            <span>{{ t('keyboardTest') }}</span>
          </li>
          <li
            class="main-nav-item"
            role="button"
            tabindex="0"
            @click="navigateTo('/reaction-time-test')"
            @keydown.enter="navigateTo('/reaction-time-test')"
          >
            <span>{{ t('reactionTest') }}</span>
          </li>
          <li
            class="main-nav-item"
            role="button"
            tabindex="0"
            @click="navigateTo('/typing-test/1')"
            @keydown.enter="navigateTo('/typing-test/1')"
          >
            <span>{{ t('typingTest') }}</span>
          </li>
        </ul>
      </nav>
      <!-- 导航栏右侧区域：操作按钮 -->
      <div class="header-actions header-right">
        <!-- 语言选择组件 -->
        <LanguageSelector ref="languageSelectorRef" @switch-language="switchLanguage" />
        <!-- 历史选择组件 -->
        <HistorySelector ref="historySelectorRef" />
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="main-content" role="main">
      <!-- 左侧侧边栏 -->
      <MenuManager
        ref="menuManagerRef"
        :is-sidebar-open="isSidebarOpen"
        :mobile-website-name="mobileWebsiteName"
        @close-sidebar="closeSidebar"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- 右侧主内容 - 路由视图 -->
      <main ref="contentRef" class="content" role="main" @click="handleContentClick">
        <!-- 面包屑导航 - 404页面不显示 -->
        <Breadcrumb v-if="route.name !== 'NotFound' && route.name !== 'PrivacyPolicy'" />
        <!-- 路由视图 -->
        <router-view></router-view>
      </main>
    </div>

    <!-- 页脚区域 -->
    <footer class="footer" role="contentinfo">
      <div class="footer-content">
        <p>{{ t('copyright', { year: new Date().getFullYear() }) }}</p>
        <div class="footer-links">
          <router-link
            to="/privacy-policy"
            class="footer-link"
            aria-label="{{ t('privacyPolicy') }}"
          >
            {{ t('privacyPolicy') }}
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
  /* 全局布局 */
  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #1a1a1a;
    color: #ffffff;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 顶部导航栏 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #000000;
    border-bottom: 1px solid #333;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    height: 60px;
    box-sizing: border-box;
    transition:
      height 0.3s ease,
      padding 0.3s ease;
  }

  /* 导航栏左侧区域：汉堡菜单 + logo */
  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
  }

  /* 导航栏logo样式 */
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .logo:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .logo:focus {
    outline: none;
  }

  .desktop-logo {
    font-size: 18px;
    font-weight: 600;
    color: #4caf50;
  }

  .mobile-logo {
    font-size: 16px;
    font-weight: 600;
    color: #4caf50;
  }

  /* 导航栏右侧区域：操作按钮 */
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* 主导航区域样式 */
  .main-nav {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;
  }

  /* 主导航列表样式 */
  .main-nav-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 15px;
  }

  /* 主导航项样式 */
  .main-nav-item {
    /* 优化内边距，减小悬停样式范围 */
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #cccccc;
    /* 设置字体大小 */
    font-size: 14px;
    /* 减小最小高度，使悬停样式更紧凑 */
    min-height: 40px;
    display: flex;
    align-items: center;
    letter-spacing: 0.2px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  }

  /* 主导航项悬停样式 - 缩小范围 */
  .main-nav-item:hover {
    color: #4caf50;
    /* 移除背景色和阴影，仅保留颜色变化 */
  }

  /* 主导航项激活样式 */
  .main-nav-item.active {
    background-color: #2a2a2a;
    color: #4caf50;
    box-shadow: inset 0 0 0 2px #4caf50;
    border-radius: 4px;
  }

  /* 主导航项焦点样式 */
  .main-nav-item:focus {
    outline: none;
  }

  /* 移动端导航栏优化 */
  @media (max-width: 1000px) {
    /* 在移动端隐藏主导航 */
    .main-nav {
      display: none;
    }

    .header {
      padding: 10px 15px;
      height: 50px;
      background-color: #000000;
    }

    /* 调整header-actions的布局，确保在移动端不会拥挤 */
    .header-actions {
      gap: 12px;
    }

    /* 优化语言选择器和历史记录按钮的间距 */
    .language-selector,
    .history-selector {
      margin-right: 0;
      padding: 6px;
    }

    /* 优化语言菜单的位置，避免溢出屏幕 */
    .language-dropdown {
      right: 0;
      left: auto;
      margin-top: 5px;
    }

    /* 优化历史记录面板的位置 */
    .history-panel {
      right: 0;
      left: auto;
      margin-top: 5px;
    }

    /* 移动端隐藏导航栏logo，只在侧边栏显示 */
    .header-left .logo {
      display: none;
    }
  }

  /* 桌面端显示完整的网站名称 */
  @media (min-width: 1001px) {
    .desktop-logo {
      display: inline;
    }

    .mobile-logo {
      display: none;
    }

    /* 桌面端显示logo */
    .header-left .logo {
      display: flex;
    }

    /* 桌面端隐藏汉堡菜单 */
    .hamburger-menu {
      display: none;
    }
  }

  /* 平板设备适配 */
  @media (min-width: 768px) and (max-width: 1000px) {
    .content {
      padding: 20px;
    }
  }

  /* 小屏幕设备适配 */
  @media (max-width: 480px) {
    .header {
      padding: 8px 12px;
    }

    .content {
      padding: 12px;
    }

    .footer {
      padding: 12px 0;
      font-size: 12px;
    }

    .footer-content {
      padding: 0 12px;
    }
  }

  /* 汉堡菜单样式 */
  .hamburger-menu {
    display: none;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-right: 10px;
    z-index: 1002;
    color: #ffffff;
    transition: all 0.2s ease;
    border-radius: 4px;
    outline: none;
  }

  /* 汉堡菜单点击样式 */
  .hamburger-menu:active {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(0.95);
  }

  /* 汉堡菜单焦点样式 */
  .hamburger-menu:focus {
    outline: none;
  }

  /* 汉堡菜单图标 */
  .menu-icon {
    transition: all 0.3s ease;
  }

  /* 主内容区域 */
  .main-content {
    display: flex;
    flex: 1;
    margin-top: 60px;
    min-height: calc(100vh - 60px);
    transition: margin-top 0.3s ease;
  }

  /* 路由视图内容区域 */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    margin-left: 280px;
    transition:
      margin-left 0.3s ease,
      padding 0.3s ease;
  }

  /* 移动端适配 */
  @media (max-width: 1000px) {
    .content {
      margin-left: 0;
      overflow-y: auto;
      -ms-overflow-style: none;
      scrollbar-width: thin;
    }

    .content::-webkit-scrollbar {
      width: 6px;
    }

    .content::-webkit-scrollbar-track {
      background: #2a2a2a;
      border-radius: 3px;
    }

    .content::-webkit-scrollbar-thumb {
      background: #4caf50;
      border-radius: 3px;
    }
  }

  /* 页脚样式 */
  .footer {
    background-color: #000000;
    border-top: 1px solid #333;
    padding: 20px 0;
    margin-top: auto;
    text-align: center;
    font-size: 14px;
    color: #888;
    min-height: 80px;
    display: flex;
    align-items: center;
    transition:
      padding 0.3s ease,
      font-size 0.3s ease;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    width: 100%;
  }

  .footer p {
    margin: 5px 0;
    min-height: 20px;
  }

  .footer-links {
    margin-top: 10px;
    min-height: 20px;
  }

  .footer-link {
    color: #4caf50;
    text-decoration: none;
    margin: 0 10px;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .footer-link:hover {
    color: #45a049;
    text-decoration: underline;
  }

  /* 移动端适配 */
  @media (max-width: 1000px) {
    /* 显示移动端汉堡菜单 */
    .hamburger-menu {
      display: block;
    }

    /* 移动端菜单优化 */
    .language-selector,
    .history-selector {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    /* 确保菜单内容可见 */
    .language-dropdown,
    .history-panel {
      opacity: 1 !important;
      visibility: visible !important;
      transform: translateY(0) !important;
    }
    /* 移动端菜单交互优化 */
    .language-selector,
    .history-selector {
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    /* 确保菜单内容在移动端可点击 */
    .language-dropdown,
    .history-panel {
      pointer-events: auto;
      z-index: 2001;
    }
    /* 移动端菜单激活状态样式 */
    .language-selector.mobile-open,
    .history-selector.mobile-open {
      background-color: rgba(100, 100, 100, 0.3);
      border-color: #4caf50;
    }

    /* 确保菜单内容在移动端可点击 */
    .language-dropdown,
    .history-panel {
      pointer-events: auto;
    }
    /* 移动端语言选择菜单适配 */
    .language-dropdown {
      grid-template-columns: 1fr;
      min-width: auto;
      width: 160px;
      z-index: 2001;
    }

    /* 移动端历史记录面板适配 */
    .history-panel {
      width: 250px;
      max-width: calc(100vw - 50px);
      z-index: 2001;
    }

    /* 修复移动端点击事件问题 */
    .language-selector,
    .history-selector {
      pointer-events: auto;
    }

    /* 确保下拉菜单在移动端显示在最上层 */
    .header-actions {
      position: relative;
      z-index: 2000;
    }

    .footer {
      padding: 15px 0;
      font-size: 13px;
    }

    .footer-content {
      padding: 0 15px;
    }
  }
</style>
