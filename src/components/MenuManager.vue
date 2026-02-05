<script setup lang="ts">
  import { t, langState } from '../i18n/index';
  import ResponsiveImage from './ResponsiveImage.vue';
  import { iconManager } from '../utils/iconManager';

  // 接收父组件传递的属性
  const props = defineProps({
    isSidebarOpen: {
      type: Boolean,
      default: false,
    },
    mobileWebsiteName: {
      type: String,
      default: '',
    },
  });

  // 定义事件
  const emit = defineEmits(['close-sidebar', 'toggle-sidebar']);

  // 路由实例
  const router = useRouter();
  const route = useRoute();

  // 菜单项目接口
  interface MenuItem {
    id: number;
    name: string;
    path?: string;
    children?: MenuItem[];
    isExpanded: boolean;
    icon?: string;
  }

  // 初始化菜单数据
  const initMenuItems = () => {
    // 使用图标管理服务获取图标URL
    const icons = {
      home: iconManager.getIconUrl('home'),
      chick: iconManager.getIconUrl('chick'),
      mouse02: iconManager.getIconUrl('mouse02'),
      keyboard02: iconManager.getIconUrl('keyboard02'),
      reaction: iconManager.getIconUrl('reaction'),
      game02: iconManager.getIconUrl('game02'),
    };

    const items: MenuItem[] = [
      {
        id: 0,
        name: t('home'),
        path: '/',
        children: [],
        isExpanded: false,
        icon: icons.home,
      },
      {
        id: 1,
        name: t('clickTest'),
        icon: icons.chick,
        children: [
          {
            id: 11,
            name: t('1secClickTest'),
            path: '/click-test/1',
            children: [],
            isExpanded: false,
          },
          {
            id: 12,
            name: t('2secClickTest'),
            path: '/click-test/2',
            children: [],
            isExpanded: false,
          },
          {
            id: 13,
            name: t('5secClickTest'),
            path: '/click-test/5',
            children: [],
            isExpanded: false,
          },
          {
            id: 14,
            name: t('10secClickTest'),
            path: '/click-test/10',
            children: [],
            isExpanded: false,
          },
          {
            id: 15,
            name: t('15secClickTest'),
            path: '/click-test/15',
            children: [],
            isExpanded: false,
          },
          {
            id: 16,
            name: t('30secClickTest'),
            path: '/click-test/30',
            children: [],
            isExpanded: false,
          },
          {
            id: 17,
            name: t('60secClickTest'),
            path: '/click-test/60',
            children: [],
            isExpanded: false,
          },
        ],
        isExpanded: false,
      },
      {
        id: 8,
        name: t('clickSeriesTest'),
        icon: icons.mouse02,
        children: [
          {
            id: 81,
            name: t('doubleClickTest'),
            path: '/multi-click-test/double',
            children: [],
            isExpanded: false,
          },
          {
            id: 82,
            name: t('tripleClickTest'),
            path: '/multi-click-test/triple',
            children: [],
            isExpanded: false,
          },
        ],
        isExpanded: false,
      },
      {
        id: 2,
        name: t('spaceClickTest'),
        icon: icons.keyboard02,
        children: [
          {
            id: 21,
            name: t('1secSpaceTest'),
            path: '/space-click-test/1',
            children: [],
            isExpanded: false,
          },
          {
            id: 22,
            name: t('2secSpaceTest'),
            path: '/space-click-test/2',
            children: [],
            isExpanded: false,
          },
          {
            id: 23,
            name: t('5secSpaceTest'),
            path: '/space-click-test/5',
            children: [],
            isExpanded: false,
          },
          {
            id: 24,
            name: t('10secSpaceTest'),
            path: '/space-click-test/10',
            children: [],
            isExpanded: false,
          },
          {
            id: 25,
            name: t('15secSpaceTest'),
            path: '/space-click-test/15',
            children: [],
            isExpanded: false,
          },
          {
            id: 26,
            name: t('30secSpaceTest'),
            path: '/space-click-test/30',
            children: [],
            isExpanded: false,
          },
          {
            id: 27,
            name: t('60secSpaceTest'),
            path: '/space-click-test/60',
            children: [],
            isExpanded: false,
          },
        ],
        isExpanded: false,
      },
      {
        id: 101,
        name: t('spacebarClicker'),
        path: '/spacebar-clicker',
        children: [],
        isExpanded: false,
        icon: icons.keyboard02,
      },
      {
        id: 3,
        name: t('kohiClickTest'),
        path: '/kohi-click-test',
        children: [],
        isExpanded: false,
        icon: icons.chick,
      },
      {
        id: 9,
        name: t('mouseDragTest'),
        path: '/mouse-drag-test',
        children: [],
        isExpanded: false,
        icon: icons.mouse02,
      },
      {
        id: 10,
        name: t('keyboardTest'),
        path: '/keyboard-test',
        children: [],
        isExpanded: false,
        icon: icons.keyboard02,
      },
      {
        id: 4,
        name: t('typingTest'),
        icon: icons.keyboard02,
        children: [
          {
            id: 41,
            name: t('1minTypingTest'),
            path: '/typing-test/1',
            children: [],
            isExpanded: false,
          },
          {
            id: 42,
            name: t('3minTypingTest'),
            path: '/typing-test/3',
            children: [],
            isExpanded: false,
          },
          {
            id: 43,
            name: t('5minTypingTest'),
            path: '/typing-test/5',
            children: [],
            isExpanded: false,
          },
          {
            id: 44,
            name: t('10minTypingTest'),
            path: '/typing-test/10',
            children: [],
            isExpanded: false,
          },
          {
            id: 45,
            name: t('15minTypingTest'),
            path: '/typing-test/15',
            children: [],
            isExpanded: false,
          },
        ],
        isExpanded: false,
      },
      {
        id: 5,
        name: t('reactionTest'),
        icon: icons.reaction,
        children: [
          {
            id: 51,
            name: t('simpleReactionTest'),
            path: '/reaction-time-test',
            children: [],
            isExpanded: false,
            icon: '',
          },
          {
            id: 52,
            name: t('colorReactionTest'),
            path: '/color-reaction-test',
            children: [],
            isExpanded: false,
            icon: '',
          },
          {
            id: 53,
            name: t('keyReactionTest'),
            path: '/key-reaction-test',
            children: [],
            isExpanded: false,
            icon: '',
          },
        ],
        isExpanded: false,
      },
      {
        id: 6,
        name: t('targetEliminationGame'),
        path: '/target-elimination-game',
        children: [],
        isExpanded: false,
        icon: icons.game02,
      },
      {
        id: 7,
        name: t('mouseScrollTest'),
        path: '/mouse-scroll-test',
        children: [],
        isExpanded: false,
        icon: icons.mouse02,
      },
    ];
    menuItems.value = items;
  };

  // 初始化菜单数据
  const menuItems = ref<MenuItem[]>([]);
  initMenuItems();

  const computedMobileWebsiteName = computed(() => t('websiteName').split(' - ')[0]);

  // 切换侧边栏显示状态
  const toggleSidebar = () => {
    // 触发事件让父组件处理状态切换
    emit('toggle-sidebar');
  };

  // 关闭侧边栏
  const closeSidebar = () => {
    // 触发事件让父组件关闭侧边栏
    emit('close-sidebar');
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

  // 根据当前语言添加语言前缀
  const addLanguagePrefix = (path: string) => {
    // 先移除可能存在的语言前缀，避免重复添加
    const basePath = removeLanguagePrefix(path);

    // 根据当前语言添加语言前缀
    let fullPath = basePath;
    if (langState.current !== 'en') {
      // 确保路径以斜杠开头
      const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
      fullPath = `/${langState.current}${normalizedPath}`;
    }

    return fullPath;
  };

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 使用添加语言前缀后的路径导航
    const fullPath = addLanguagePrefix(path);
    router.push(fullPath);
    // 导航后关闭侧边栏（移动端）
    closeSidebar();
  };

  // 滚动到顶部函数
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // 辅助函数：获取路径部分，忽略查询参数
  const getPathWithoutQuery = (fullPath: string) => {
    return fullPath.split('?')[0];
  };

  // 判断菜单项是否活跃
  const isItemActive = (item: any) => {
    // 移除当前路径的语言前缀
    const supportedLanguages = ['zh-CN', 'ja', 'ko'];
    let currentPathWithoutLang = route.path;
    const pathSegments = currentPathWithoutLang.split('/').filter((segment) => segment !== '');
    if (
      pathSegments.length > 0 &&
      pathSegments[0] &&
      supportedLanguages.includes(pathSegments[0])
    ) {
      currentPathWithoutLang = `/${pathSegments.slice(1).join('/')}`;
    }

    // 如果菜单项有path属性，检查路径部分是否匹配
    if (item.path) {
      return getPathWithoutQuery(item.path) === currentPathWithoutLang;
    }
    // 否则检查是否有子项是活跃的
    return item.children.some(
      (child: any) => getPathWithoutQuery(child.path) === currentPathWithoutLang
    );
  };

  // 判断子菜单项是否活跃
  const isSubItemActive = (path: string) => {
    // 移除当前路径的语言前缀
    const supportedLanguages = ['zh-CN', 'ja', 'ko'];
    let currentPathWithoutLang = route.path;
    const pathSegments = currentPathWithoutLang.split('/').filter((segment) => segment !== '');
    if (
      pathSegments.length > 0 &&
      pathSegments[0] &&
      supportedLanguages.includes(pathSegments[0])
    ) {
      currentPathWithoutLang = `/${pathSegments.slice(1).join('/')}`;
    }
    return getPathWithoutQuery(path) === currentPathWithoutLang;
  };

  // 侧边栏相关方法 - 点击一个大类时折叠其他所有大类或直接导航
  const toggleMenu = (item: any) => {
    // 检查当前菜单项是否有子项
    if (item.children.length > 0) {
      // 如果当前菜单项有子项
      if (item.isExpanded) {
        // 如果已经展开，直接折叠
        item.isExpanded = false;
      } else {
        // 如果未展开，先折叠所有其他大类，然后展开当前大类
        menuItems.value.forEach((menuItem) => {
          menuItem.isExpanded = false;
        });
        item.isExpanded = true;
      }
    } else if (item.path) {
      // 如果菜单项没有子项但有路径，先折叠所有大类，然后导航
      menuItems.value.forEach((menuItem) => {
        menuItem.isExpanded = false;
      });
      navigateTo(item.path);
    }
  };

  // 窗口大小改变时的处理函数
  const handleResize = () => {
    // 当窗口宽度大于1000px时，自动关闭侧边栏
    if (window.innerWidth > 1000) {
      closeSidebar();
    }
  };

  // 监听路由变化，更新当前路径并滚动到顶部
  watch(
    () => route,
    (newRoute) => {
      const newPath = newRoute.path;
      // 路由变化时将内容区域滚动到顶部
      scrollToTop();

      // 确保菜单已使用当前语言正确初始化，然后再处理路径匹配
      nextTick(() => {
        // 从路径中移除语言前缀，以便正确匹配菜单项
        const supportedLanguages = ['zh-CN', 'ja', 'ko'];
        let basePath = newPath;
        const pathSegments = newPath.split('/').filter((segment) => segment !== '');

        if (
          pathSegments.length > 0 &&
          pathSegments[0] &&
          supportedLanguages.includes(pathSegments[0])
        ) {
          // 移除语言前缀
          basePath = `/${pathSegments.slice(1).join('/')}`;
        }

        // 展开对应的侧边栏菜单
        if (basePath !== '/') {
          menuItems.value.forEach((item) => {
            // 检查当前菜单项是否有子项
            if (item.children && item.children.length > 0) {
              // 检查是否有子项的路径与当前路径匹配或当前路径以子项路径开头
              const hasMatchingChild = item.children.some((child: any) => {
                // 检查完全匹配或当前路径以子项路径开头（处理带参数的路径）
                return (
                  basePath === child.path ||
                  basePath.startsWith(child.path + '/') ||
                  child.path === '/' + basePath.split('/')[1]
                );
              });

              // 如果有匹配的子项，展开当前菜单项，否则折叠
              item.isExpanded = hasMatchingChild;
            } else {
              // 没有子项的菜单项直接折叠
              item.isExpanded = false;
            }
          });
        } else {
          // 如果导航到首页，缩回所有侧边栏菜单
          menuItems.value.forEach((item) => {
            item.isExpanded = false;
          });
        }
      });
    },
    { deep: true }
  );

  // 监听语言状态变化，确保菜单项目的翻译始终是最新的
  watch(
    () => langState.current,
    () => {
      nextTick(() => {
        initMenuItems();
      });
    }
  );

  // 暴露方法给父组件
  defineExpose({
    toggleSidebar,
    closeSidebar,
    navigateTo,
  });

  onMounted(() => {
    // 添加窗口大小改变监听，自动调整侧边栏状态和设备类型
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

<template>
  <!-- 左侧侧边栏 -->
  <aside
    class="sidebar"
    :class="{ open: props.isSidebarOpen }"
    role="complementary"
    aria-label="侧边导航"
  >
    <!-- 侧边栏头部 - 网站icon和名字 -->
    <div class="sidebar-header">
      <div class="sidebar-logo" style="cursor: pointer" @click="navigateTo('/')">
        <ResponsiveImage
          src="/logo.png"
          :alt="t('logoAlt')"
          class-name="logo-image"
          :width="24"
          :height="24"
          :lazy="true"
          :priority="true"
          :skip-device-suffix="true"
        />
        <span class="sidebar-logo-text">{{ computedMobileWebsiteName }}</span>
      </div>
      <button class="close-sidebar-btn" aria-label="关闭侧边栏" @click="closeSidebar">
        <svg
          class="close-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <!-- 可滚动的菜单区域 -->
    <div class="sidebar-scrollable">
      <nav class="menu" role="navigation" aria-label="侧边导航">
        <!-- 主要测试类型导航 -->
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.id" class="menu-item">
            <div
              class="menu-item-header"
              :class="{ active: isItemActive(item) }"
              role="button"
              :aria-expanded="item.isExpanded"
              @click="toggleMenu(item)"
            >
              <ResponsiveImage
                :src="item.icon || ''"
                :alt="item.name"
                class-name="menu-item-icon"
                :width="20"
                :height="20"
                :lazy="true"
                :priority="false"
                :skip-device-suffix="true"
              />
              <span class="menu-item-name">{{ item.name }}</span>
              <span
                v-if="item.children && item.children.length > 0"
                class="menu-toggle"
                aria-hidden="true"
              >
                {{ item.isExpanded ? '▼' : '▶' }}
              </span>
            </div>

            <!-- 下拉列表 -->
            <transition name="submenu">
              <div v-if="item.isExpanded" role="group" :aria-label="item.name + ' 子菜单'">
                <ul class="submenu-list">
                  <li
                    v-for="child in item.children"
                    :key="child.id"
                    class="submenu-item"
                    :class="{ active: isSubItemActive(child.path || '') }"
                    @click.stop="navigateTo(child.path || '')"
                  >
                    {{ child.name }}
                  </li>
                </ul>
              </div>
            </transition>
          </li>
        </ul>

        <!-- 辅助导航区域 -->
        <div class="sidebar-divider"></div>
        <div class="auxiliary-nav" role="complementary">
          <h3 class="auxiliary-nav-title">{{ t('popularTests') }}</h3>
          <ul class="auxiliary-nav-list">
            <li class="auxiliary-nav-item" @click="navigateTo('/click-test/5')">
              <span>{{ t('5secClickTest') }}</span>
            </li>
            <li class="auxiliary-nav-item" @click="navigateTo('/reaction-time-test')">
              <span>{{ t('simpleReactionTest') }}</span>
            </li>
            <li class="auxiliary-nav-item" @click="navigateTo('/keyboard-test')">
              <span>{{ t('keyboardTest') }}</span>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
  /* 侧边栏样式 */
  .sidebar {
    position: fixed;
    left: -300px;
    top: 0;
    width: 280px;
    height: 100vh;
    background-color: #1a1a1a;
    border-right: 1px solid #333333;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
    z-index: 1001;
    transition: left 0.3s ease;
    flex-shrink: 0;
    min-width: 280px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
  }

  .sidebar.open {
    left: 0;
  }

  /* 可滚动的菜单区域 */
  .sidebar-scrollable {
    flex: 1;
    overflow-y: auto;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #333333;
    background-color: #1a1a1a;
    height: 50px;
  }
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-image {
    border-radius: 4px;
    width: 24px;
    height: 24px;
  }

  .sidebar-logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #4caf50;
  }

  /* 桌面端隐藏侧边栏头部 */
  @media (min-width: 1001px) {
    .sidebar-header {
      display: none;
    }
  }

  /* 移动端显示侧边栏头部 */
  @media (max-width: 1000px) {
    .sidebar-header {
      display: flex;
    }
  }

  .close-sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .close-sidebar-btn:hover {
    background-color: #333333;
  }

  .close-icon {
    width: 18px;
    height: 18px;
    color: #cccccc;
  }

  .menu {
    padding: 16px 0;
  }

  .menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .menu-item {
    margin-bottom: 4px;
  }

  .menu-item-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    color: #cccccc;
  }

  .menu-item-header:hover {
    background-color: transparent;
    border-left-color: transparent;
    color: #4caf50;
  }

  .menu-item-header.active {
    background-color: transparent;
    border-left-color: transparent;
    color: #4caf50;
  }

  .menu-item-icon {
    margin-right: 12px;
    opacity: 0.8;
  }

  .menu-item-name {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
  }

  .menu-toggle {
    font-size: 14px;
    color: #aaaaaa;
  }

  .submenu-list {
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: #1a1a1a;
  }

  .submenu-item {
    padding: 8px 16px 8px 58px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    border-left: 3px solid transparent;
    color: #aaaaaa;
  }

  /* 桌面端悬停效果 */
  @media (min-width: 769px) {
    .submenu-item:hover {
      background-color: transparent;
      border-left-color: transparent;
      color: #4caf50;
      padding-left: 68px;
      transition: all 0.2s ease;
    }
  }

  /* 移动端无悬停效果 */
  @media (max-width: 768px) {
    .submenu-item:hover {
      background-color: transparent;
      border-left-color: transparent;
      color: #4caf50;
      padding-left: 58px; /* 保持原始缩进 */
    }
  }

  .submenu-item.active {
    background-color: transparent;
    border-left-color: transparent;
    color: #4caf50;
  }

  .sidebar-divider {
    height: 1px;
    background-color: #333333;
    margin: 20px 0;
  }

  .auxiliary-nav {
    padding: 0 16px;
  }

  .auxiliary-nav-title {
    font-size: 16px;
    font-weight: 600;
    color: #4caf50;
    margin: 0 0 16px 0;
    text-transform: none;
    letter-spacing: normal;
  }

  .auxiliary-nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .auxiliary-nav-item {
    padding: 10px 0 10px 20px;
    cursor: pointer;
    transition: color 0.2s;
    font-size: 14px;
    color: #aaaaaa;
  }

  .auxiliary-nav-item:hover {
    color: #4caf50;
  }

  /* 动画效果 */
  .submenu-enter-active,
  .submenu-leave-active {
    transition:
      max-height 0.3s ease,
      opacity 0.3s ease;
    overflow: hidden;
    max-height: 500px;
    opacity: 1;
  }

  .submenu-enter-from,
  .submenu-leave-to {
    max-height: 0;
    opacity: 0;
  }

  /* 滚动条样式 - 始终显示 */
  .sidebar-scrollable::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-scrollable::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 0;
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
    background: #555555;
  }

  /* 移动端样式 */
  @media (max-width: 768px) {
    .sidebar {
      width: 260px;
      left: -260px;
      min-width: 260px;
      max-width: 260px;
    }

    .sidebar-header {
      padding: 12px 16px;
    }

    .sidebar-logo {
      gap: 10px;
    }

    .sidebar-logo-text {
      font-size: 18px;
    }

    .menu-item-header {
      padding: 10px 16px;
    }

    .submenu-item {
      padding: 8px 16px 8px 58px;
    }

    .auxiliary-nav {
      padding: 0 16px;
    }
  }

  /* 桌面端样式 */
  @media (min-width: 1001px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 60px;
      width: 280px;
      height: calc(100vh - 60px);
      box-shadow: none;
      border-right: 1px solid #333333;
      flex-shrink: 0;
      min-width: 280px;
      max-width: 280px;
      overflow-y: auto;
      z-index: 100;
    }

    .close-sidebar-btn {
      display: none;
    }

    .sidebar-logo-text {
      display: none;
    }
  }

  /* 移动端样式 */
  @media (max-width: 1000px) {
    .sidebar-logo-text {
      display: inline;
    }
  }
</style>
