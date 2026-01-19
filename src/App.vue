<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { t, setLanguage, initLanguage, langState } from './i18n/index';
  import Breadcrumb from './components/Breadcrumb.vue';
  import { updateMetaTags } from './router/index';

  const websiteName = computed(() => t('websiteName'));
  const mobileWebsiteName = computed(() => t('websiteName').split(' - ')[0]);

  // 路由实例
  const router = useRouter();
  const route = useRoute();

  // 初始化语言
  initLanguage();

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

  // 语言选择相关
  const languages = [
    { code: 'en', name: 'ENGLISH', flag: new URL('@/assets/flags/um.png', import.meta.url).href },
    { code: 'zh-CN',name: '简体中文',flag: new URL('@/assets/flags/cn.png', import.meta.url).href,},
    { code: 'ja', name: '日本語', flag: new URL('@/assets/flags/jp.png', import.meta.url).href },
    { code: 'ko', name: '한국어', flag: new URL('@/assets/flags/kr.png', import.meta.url).href },
  ];

  // 检测设备类型（true为移动端，false为桌面端）
  const isMobile = ref(window.innerWidth <= 1000);
  const isTouchDevice = ref('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // 移动端语言菜单触摸处理
  const onLanguageTouch = (e: TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault(); // 阻止后续的click事件触发，避免状态切换两次
    }
    toggleLanguageMenu(e);
  };

  // 移动端历史菜单触摸处理
  const onHistoryTouch = (e: TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault(); // 阻止后续的click事件触发，避免状态切换两次
    }
    toggleHistory(e);
  };

  // 使用 computed 确保 currentLanguage 始终与 langState.current 保持同步
  const currentLanguage = computed(() => langState.current);
  const isLanguageMenuOpen = ref(false);

  // 计算当前语言的国旗和名称
  const currentLanguageFlag = computed(() => {
    const lang = languages.find((l) => l.code === currentLanguage.value);
    return lang ? lang.flag : '';
  });

  const currentLanguageName = computed(() => {
    const lang = languages.find((l) => l.code === currentLanguage.value);
    return lang ? lang.name : '';
  });

  // 切换语言菜单显示状态
  const toggleLanguageMenu = (e?: MouseEvent | TouchEvent) => {
    e?.stopPropagation();

    // 直接切换菜单状态，不使用nextTick，避免状态更新延迟导致的逻辑混乱
    isLanguageMenuOpen.value = !isLanguageMenuOpen.value;

    // 关闭历史记录菜单
    isHistoryOpen.value = false;
  };

  // 历史记录项类型定义
  interface HistoryItem {
    id: number;
    path: string;
    timestamp: number;
  }

  // 历史记录相关
  const isHistoryOpen = ref(false);
  let historyTimeout: number | null = null;

  // localStorage键名
  const HISTORY_STORAGE_KEY = 'visit_history';

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

  // 保存历史记录到localStorage
  const saveHistoryToStorage = (history: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
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

  // 添加新的历史记录项
  const addHistoryItem = (path: string) => {
    // 不记录404页面
    // 检查路径是否匹配任何有效的公共路由模式
    const resolved = router.resolve(path);
    const isInvalidPath = !resolved.matched.some((route) => route.name !== 'NotFound');
    if (isInvalidPath) {
      return;
    }

    // 移除语言前缀，以便验证路径参数
    const basePath = removeLanguagePrefix(path);

    // 验证路径参数的有效性
    let isValidPath = true;

    // 验证点击测试路径
    if (basePath.startsWith('/click-test/')) {
      const time = basePath.split('/')[2];
      // 只允许有效的测试时长
      const validTimes = ['1', '2', '5', '10', '15', '30', '60'];
      if (!time || !validTimes.includes(time)) {
        isValidPath = false;
      }
    }
    // 验证空格点击测试路径
    else if (basePath.startsWith('/space-click-test/')) {
      const time = basePath.split('/')[2];
      // 只允许有效的测试时长
      const validTimes = ['1', '2', '5', '10', '15', '30', '60'];
      if (!time || !validTimes.includes(time)) {
        isValidPath = false;
      }
    }
    // 验证打字测试路径
    else if (basePath.startsWith('/typing-test/')) {
      const time = basePath.split('/')[2];
      // 只允许有效的测试时长
      const validTimes = ['1', '3', '5', '10', '15'];
      if (!time || !validTimes.includes(time)) {
        isValidPath = false;
      }
    }
    // 验证多点击测试路径
    else if (basePath.startsWith('/multi-click-test/')) {
      const type = basePath.split('/')[2];
      // 只允许有效的点击类型
      const validTypes = ['double', 'triple'];
      if (!type || !validTypes.includes(type)) {
        isValidPath = false;
      }
    }

    // 如果路径参数无效，不记录到历史记录
    if (!isValidPath) {
      return;
    }

    // 检查是否已存在相同路径的记录，如果存在则移除旧记录
    const existingIndex = historyItems.value.findIndex((item) => item.path === path);
    if (existingIndex > -1) {
      historyItems.value.splice(existingIndex, 1);
    }

    // 创建新的历史记录项 - 只存储path和timestamp，title和time在渲染时动态生成
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

  // 点击历史记录项导航到对应页面
  const navigateToHistoryItem = (item: HistoryItem) => {
    // 使用navigateTo函数导航，确保统一的导航逻辑和状态管理
    navigateTo(item.path);
  };

  // 用于存储延迟隐藏的定时器
  let hideTimeout: number | null = null;

  // 鼠标悬停显示语言菜单
  const showLanguageMenu = () => {
    // 清除之前的延迟隐藏定时器
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    isLanguageMenuOpen.value = true;
  };

  // 鼠标离开隐藏语言菜单（带延迟）
  const hideLanguageMenu = () => {
    // 增加延迟时间，给用户更充足的时间移动鼠标到菜单上
    hideTimeout = window.setTimeout(() => {
      isLanguageMenuOpen.value = false;
      hideTimeout = null;
    }, 100);
  };

  // 鼠标进入菜单时取消隐藏
  const onMenuMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  // 鼠标离开菜单时隐藏
  const onMenuMouseLeave = () => {
    hideLanguageMenu();
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
    isHistoryOpen.value = false;
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

    // 关闭其他菜单
    if (isHistoryOpen.value) {
      isLanguageMenuOpen.value = false;
    }
  };

  // 点击外部关闭菜单
  const closeAllMenus = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // 简化关闭菜单的逻辑
    if (!target.closest('.language-selector')) isLanguageMenuOpen.value = false;
    if (!target.closest('.history-selector')) isHistoryOpen.value = false;
  };

  // 菜单展开状态接口
  interface MenuExpandedStates {
    [key: number]: boolean;
  }

  // 菜单项目接口
  interface MenuItem {
    id: number;
    name: string;
    path?: string;
    children?: MenuItem[];
    isExpanded: boolean;
    icon?: string;
  }

  // 切换语言 - 使用路径跳转实现
  const switchLanguage = (languageCode: string) => {
    // 设置语言状态
    setLanguage(languageCode);

    // 保存当前菜单的展开状态
    const expandedStates = menuItems.value.reduce((states: MenuExpandedStates, item: MenuItem) => {
      if (item.children && item.children.length > 0) {
        states[item.id] = item.isExpanded;
      }
      return states;
    }, {});

    // 重新初始化菜单数据，应用新语言
    initMenuItems();

    // 恢复菜单的展开状态
    menuItems.value.forEach((item: any) => {
      if (item.id in expandedStates) {
        item.isExpanded = expandedStates[item.id];
      }
    });

    // 清除可能存在的延迟隐藏定时器，确保菜单能立即关闭
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // 选择语言后立即关闭语言菜单
    isLanguageMenuOpen.value = false;

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
      newPath = `/${languageCode}${basePath === '/' ? '' : basePath}`;
    }

    // 跳转到新的URL
    router.push(newPath).then(() => {
      // 获取更新后的路由信息
      const updatedRoute = router.currentRoute.value;
      // 路由跳转完成后更新meta标签
      nextTick(() => {
        updateMetaTags(updatedRoute);
      });
    });
  };

  // 导入图标资源
  const historyIconUrl = new URL('@/assets/icons/history.png', import.meta.url).href;

  // 初始化菜单数据
  const initMenuItems = () => {
    // 导入所有图标资源
    const icons = {
      home: new URL('@/assets/icons/home.png', import.meta.url).href,
      chick: new URL('@/assets/icons/chick.png', import.meta.url).href,
      mouse02: new URL('@/assets/icons/mouse02.png', import.meta.url).href,
      keyboard02: new URL('@/assets/icons/keyboard02.png', import.meta.url).href,
      reaction: new URL('@/assets/icons/reaction.png', import.meta.url).href,
      game02: new URL('@/assets/icons/game02.png', import.meta.url).href,
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

  // 监听语言状态变化，确保菜单项目的翻译始终是最新的
  watch(
    () => langState.current,
    () => {
      nextTick(() => {
        initMenuItems();
      });
    }
  );

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

  // 从路由路径获取页面标题
  const getPageTitleFromPath = (path: string): string => {
    // 先移除语言前缀，确保正确匹配路径
    const basePath = removeLanguagePrefix(path);

    // 根据路径返回对应的页面标题
    if (basePath.startsWith('/click-test/')) {
      // 验证时间参数是否为有效数字
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('sec')} ${t('clickTest')}`;
      } else {
        // 无效时间参数，返回通用点击测试标题
        return t('clickTest');
      }
    } else if (basePath.startsWith('/space-click-test/')) {
      // 验证时间参数是否为有效数字
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('sec')} ${t('spaceClickTest')}`;
      } else {
        // 无效时间参数，返回通用空格点击测试标题
        return t('spaceClickTest');
      }
    } else if (basePath.startsWith('/typing-test/')) {
      // 验证时间参数是否为有效数字
      const time = basePath.split('/')[2];
      if (time && /^[1-9]\d*$/.test(time)) {
        return `${time}${t('minTypingTest')} ${t('typingTest')}`;
      } else {
        // 无效时间参数，返回通用打字测试标题
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
      // 默认返回多点击测试
      return t('clickSeriesTest');
    } else if (basePath === '/') {
      return t('home');
    }

    // 隐私政策页面
    else if (basePath === '/privacy-policy') {
      return t('privacyPolicy');
    }

    // 默认返回路径作为标题（已经移除了语言前缀）
    return basePath.substring(1) || t('home');
  };

  // 窗口大小改变时的处理函数
  const handleResize = () => {
    // 更新设备类型检测
    isMobile.value = window.innerWidth <= 1000;
    // 当窗口宽度大于1000px时，自动关闭侧边栏
    if (window.innerWidth > 1000) {
      isSidebarOpen.value = false;
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

  // 检查并处理URL中的分享参数
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

  // 存储路由导航监听器的移除函数
  let removeRouterListener: (() => void) | null = null;

  onMounted(() => {
    document.addEventListener('click', closeAllMenus);

    // 添加路由导航监听，自动记录访问历史
    removeRouterListener = router.afterEach((to) => {
      // 添加到历史记录
      addHistoryItem(to.path);
    });

    // 添加窗口大小改变监听，自动调整侧边栏状态和设备类型
    window.addEventListener('resize', handleResize);

    // 初始加载时，根据当前语言设置更新meta标签
    updateMetaTags(route);

    // 检查并保存URL中的分享参数
    checkAndSaveShareParams();
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('click', closeAllMenus);
    window.removeEventListener('resize', handleResize);
    // 移除路由导航监听器
    if (removeRouterListener) {
      removeRouterListener();
      removeRouterListener = null;
    }
  });

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

  // 滚动到顶部函数
  const scrollToTop = () => {
    // 简化滚动到顶部的实现
    window.scrollTo(0, 0);
  };

  // 监听路由变化，更新当前路径并滚动到顶部
  watch(
    () => route,
    (newRoute) => {
      const newPath = newRoute.path;
      // 路由变化时将内容区域滚动到顶部
      scrollToTop();
      // 路由变化时关闭历史记录面板
      isHistoryOpen.value = false;

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

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 先移除可能存在的语言前缀，避免重复添加
    const basePath = removeLanguagePrefix(path);

    // 根据当前语言添加语言前缀
    let fullPath = basePath;
    if (langState.current !== 'en') {
      // 确保路径以斜杠开头
      const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
      fullPath = `/${langState.current}${normalizedPath}`;
    }

    router.push(fullPath);
    // 导航后将内容区域滚动到顶部
    scrollToTop();
    // 导航后关闭侧边栏（移动端）
    closeSidebar();
    // 导航后关闭历史记录面板
    isHistoryOpen.value = false;
  };

  // 辅助函数：获取路径部分，忽略查询参数
  const getPathWithoutQuery = (fullPath: string) => {
    return fullPath.split('?')[0];
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
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header" role="banner">
      <!-- 导航栏左侧区域：汉堡菜单 + logo -->
      <div class="header-left">
        <!-- 汉堡菜单按钮（移动端） -->
        <button class="hamburger-menu" aria-label="菜单" @click="toggleSidebar">
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
        <div class="logo" style="cursor: pointer" @click="navigateTo('/')">
          <img
            src="/logo.png"
            :alt="t('logoAlt')"
            class="logo-image"
            width="32"
            height="32"
            loading="lazy"
          />
          <span class="desktop-logo">{{ websiteName }}</span>
          <span class="mobile-logo">{{ mobileWebsiteName }}</span>
        </div>
      </div>
      <!-- 主导航区域：主要测试类型快捷导航 -->
      <nav class="main-nav" role="navigation" aria-label="主导航">
        <ul class="main-nav-list">
          <li class="main-nav-item" @click="navigateTo('/click-test/5')">
            <span>{{ t('clickTest') }}</span>
          </li>
          <li class="main-nav-item" @click="navigateTo('/space-click-test/5')">
            <span>{{ t('spaceClickTest') }}</span>
          </li>
          <li class="main-nav-item" @click="navigateTo('/keyboard-test')">
            <span>{{ t('keyboardTest') }}</span>
          </li>
          <li class="main-nav-item" @click="navigateTo('/reaction-time-test')">
            <span>{{ t('reactionTest') }}</span>
          </li>
          <li class="main-nav-item" @click="navigateTo('/typing-test/1')">
            <span>{{ t('typingTest') }}</span>
          </li>
        </ul>
      </nav>
      <!-- 导航栏右侧区域：操作按钮 -->
      <div class="header-actions header-right">
        <!-- 语言选择下拉菜单 -->
        <div
          class="selector-base language-selector"
          :class="{
            'mobile-open': isMobile && isLanguageMenuOpen,
            'mobile-active': isTouchDevice && isLanguageMenuOpen,
            active: isLanguageMenuOpen,
            'show-content': isLanguageMenuOpen,
          }"
          @touchstart="onLanguageTouch($event)"
          @mouseenter="showLanguageMenu"
          @mouseleave="hideLanguageMenu"
          @click.stop.prevent="toggleLanguageMenu"
        >
          <img
            class="language-image"
            :src="currentLanguageFlag"
            :alt="currentLanguageName"
            width="24"
            height="18"
          />
          <div
            v-if="isLanguageMenuOpen"
            class="language-dropdown"
            role="menu"
            aria-label="语言选择"
            @mouseenter="onMenuMouseEnter"
            @mouseleave="onMenuMouseLeave"
          >
            <button
              v-for="(lang, index) in languages"
              :key="index"
              class="language-option"
              :class="{ active: lang.code === currentLanguage }"
              role="menuitem"
              :aria-label="lang.name"
              @click.stop="switchLanguage(lang.code)"
              @touchstart.stop="switchLanguage(lang.code)"
            >
              <img class="flag-icon" :src="lang.flag" :alt="lang.name" width="20" height="15" />
              <span class="language-name">{{ lang.name }}</span>
            </button>
          </div>
        </div>
        <!-- 历史查看按钮 -->
        <div
          class="selector-base history-selector"
          :class="{
            'mobile-open': isMobile && isHistoryOpen,
            'mobile-active': isTouchDevice && isHistoryOpen,
            active: isHistoryOpen,
            'show-content': isHistoryOpen,
          }"
          @touchstart.stop="onHistoryTouch($event)"
          @mouseenter="showHistory"
          @mouseleave="hideHistory"
          @click.stop="toggleHistory"
        >
          <img
            :src="historyIconUrl"
            class="language-image"
            width="30"
            height="30"
            :alt="t('historyIconAlt')"
            loading="lazy"
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
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="main-content" role="main">
      <!-- 侧边栏遮罩层（移动端） -->
      <div
        v-if="isSidebarOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="closeSidebar"
      ></div>

      <!-- 左侧侧边栏 -->
      <aside
        class="sidebar"
        :class="{ open: isSidebarOpen }"
        role="complementary"
        aria-label="侧边导航"
      >
        <!-- 侧边栏头部 - 网站icon和名字 -->
        <div class="sidebar-header">
          <div class="sidebar-logo" style="cursor: pointer" @click="navigateTo('/')">
            <img
              src="/logo.png"
              :alt="t('logoAlt')"
              class="logo-image"
              width="32"
              height="32"
              loading="lazy"
            />
            <span class="sidebar-logo-text">{{ mobileWebsiteName }}</span>
          </div>
          <button class="close-sidebar-btn" aria-label="关闭侧边栏" @click="closeSidebar">
            <svg
              class="close-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
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
        <nav class="menu" role="navigation" aria-label="侧边导航">
          <!-- 主要测试类型导航 -->
          <ul class="menu-list">
            <li v-for="item in menuItems" :key="item.id" class="menu-item">
              <div
                class="menu-item-header"
                :class="{ active: isItemActive(item) }"
                :aria-expanded="item.isExpanded"
                @click="toggleMenu(item)"
              >
                <img
                  class="menu-item-icon"
                  :src="item.icon"
                  :alt="item.name"
                  width="20"
                  height="20"
                  loading="lazy"
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
      </aside>

      <!-- 右侧主内容 - 路由视图 -->
      <main ref="contentRef" class="content" role="main">
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
          <router-link to="/privacy-policy" class="footer-link">{{
            t('privacyPolicy')
          }}</router-link>
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
    /* 移除overflow: hidden，允许页面滚动 */
  }

  /* 字体优化 */
  .font-optimized {
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
  }

  /* 导航栏左侧区域：汉堡菜单 + logo */
  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
  }

  /* 导航栏右侧区域：操作按钮 */
  .header-right {
    display: flex;
    align-items: center;
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
      gap: 5px;
    }

    /* 优化语言选择器和历史记录按钮的间距 */
    .language-selector,
    .history-selector {
      margin-right: 5px;
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

    /* 移动端侧边栏头部样式 - 固定在顶部，覆盖导航栏 */
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background-color: #000000;
      border-bottom: 1px solid #333;
      margin-bottom: 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1001;
      height: 50px;
      box-sizing: border-box;
    }

    /* 移动端侧边栏logo样式 - 参考图片样式 */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
      color: #4caf50;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 移动端侧边栏网站名称样式 */
    .sidebar-logo-text {
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 保持侧边栏logo图片原始大小 */
    .sidebar-logo .logo-image {
      width: 32px;
      height: 32px;
    }

    /* 移动端关闭侧边栏按钮 - 参考图片样式 */
    .close-sidebar-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      color: #ffffff;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      outline: none;
    }

    .close-sidebar-btn:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    /* 侧边栏缩回按钮点击样式 */
    .close-sidebar-btn:active {
      background-color: rgba(255, 255, 255, 0.2);
      transform: scale(0.9);
    }

    /* 侧边栏缩回按钮焦点样式 */
    .close-sidebar-btn:focus {
      outline: none;
      box-shadow: none;
    }

    /* 移动端关闭图标样式 */
    .close-icon {
      transition: all 0.3s ease;
      width: 20px;
      height: 20px;
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
      display: flex !important;
    }

    /* 桌面端隐藏汉堡菜单 */
    .hamburger-menu {
      display: none;
    }

    /* 桌面端隐藏侧边栏头部 */
    .sidebar-header {
      display: none;
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
    box-shadow: none;
  }

  /* 汉堡菜单图标 */
  .menu-icon {
    transition: all 0.3s ease;
  }

  /* 侧边栏遮罩层样式 */
  .sidebar-overlay {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
    /* 添加平滑过渡效果 */
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* 移动端显示汉堡菜单 */
  @media (max-width: 1000px) {
    .hamburger-menu {
      display: flex;
    }

    .sidebar-overlay {
      display: block;
      top: 0;
    }

    /* 当侧边栏打开时，显示遮罩层并添加过渡效果 */
    .sidebar.open + .sidebar-overlay {
      opacity: 1;
    }

    /* 移动端侧边栏样式调整 - 直接覆盖汉堡菜单和顶部导航栏 */
    .sidebar {
      top: 0 !important;
      bottom: 0;
      padding-top: 0;
      height: 100vh;
      overflow: visible;
      display: flex;
      flex-direction: column;
      background-color: #1a1a1a;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
      border-right: none;
      z-index: 9999 !important;
      position: fixed;
      left: 0;
      transform: translateX(-100%);
      width: 280px;
      transition: transform 0.3s ease;
    }

    /* 侧边栏打开状态 - 完全覆盖导航栏 */
    .sidebar.open {
      transform: translateX(0);
    }

    /* 确保侧边栏头部固定在侧边栏顶部，直接覆盖导航栏 */
    .sidebar .sidebar-header {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      background-color: #1a1a1a;
      padding: 10px 15px;
      border-bottom: 1px solid #333;
      height: 50px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* 移动端侧边栏菜单样式 - 从侧边栏头部下方开始，占据剩余空间 */
    .sidebar .menu {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      height: calc(100vh - 50px);
      background-color: #1a1a1a;
    }

    /* 确保顶部导航栏显示在侧边栏下方 */
    .header {
      z-index: 1000;
    }

    /* 移动端菜单项样式优化 */
    .sidebar .menu-item-header {
      padding: 14px 20px; /* 增加内边距，提升点击区域 */
      background-color: transparent;
      border-left: none; /* 移动端移除左侧边框 */
    }

    /* 移动端子菜单项样式优化 */
    .sidebar .submenu-item {
      padding: 12px 20px 12px 45px; /* 调整子菜单项内边距 */
      background-color: transparent;
      transition: all 0.2s ease;
    }

    /* 移动端菜单项图标样式优化 */
    .sidebar .menu-item-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px; /* 增加图标与文字的间距 */
    }
  }

  .logo {
    font-size: 20px;
    font-weight: bold;
    color: #4caf50;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.3px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }

  /* 侧边栏logo样式 */
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: bold;
    color: #4caf50;
    cursor: pointer;
    letter-spacing: 0.3px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }

  .logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
    vertical-align: middle;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  /* 选择器基础样式 */
  .selector-base {
    position: relative;
    margin-right: 10px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: inline-block;
    /* 增加点击区域大小 */
    min-width: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 2px solid transparent;
    outline: none;
  }

  .selector-base:hover {
    background-color: rgba(100, 100, 100, 0.3);
    border-color: #666;
  }

  .selector-base:focus {
    outline: none;
    box-shadow: none;
  }

  .language-image {
    display: block;
    /* 确保图片居中显示 */
    margin: 0 auto;
  }

  /* 国旗图标样式 */
  .flag-icon {
    display: inline-block;
    vertical-align: middle;
    object-fit: cover;
    border-radius: 2px;
    width: 20px;
    height: 15px;
    margin: 0;
  }

  /* 语言名称样式 */
  .language-name {
    display: inline-block;
    margin-left: 8px;
  }

  .language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #242424;
    border: 1px solid #444;
    border-radius: 4px;
    margin-top: 0; /* 移除间隙，让菜单紧挨着图标容器 */
    min-width: 200px;
    z-index: 1001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    overflow: hidden;
    padding: 8px 0; /* 增加内边距，让点击区域更大 */
  }

  .language-option {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    color: #ffffff;
    border: none;
    border-radius: 0;
    cursor: pointer;
    text-align: left;
    font-weight: normal;
    transition: all 0.2s ease;
    box-sizing: border-box;
    white-space: nowrap;
    outline: none;
  }

  .language-option:hover {
    background-color: #333;
    color: #ffffff;
  }

  .language-option:focus {
    outline: none;
    box-shadow: none;
  }

  .language-option.active {
    background-color: #444;
    font-weight: bold;
    color: #4caf50;
  }

  /* 历史记录面板样式 */
  .history-panel {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 2000;
    background-color: #242424;
    border-radius: 8px;
    width: 300px;
    max-width: 100vw;
    max-height: 70vh;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    margin-top: 5px;
    box-sizing: border-box;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #333;
    border-bottom: 1px solid #444;
  }

  .history-header h3 {
    color: #fff;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .remove-all-btn {
    color: #b0b0b0;
    background-color: transparent;
    border: none;
    font-size: 14px;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s ease;
    outline: none;
  }

  .remove-all-btn:hover {
    color: #fff;
    background-color: #444;
  }

  .remove-all-btn:focus {
    outline: none;
    box-shadow: none;
  }

  /* 历史记录列表样式 */
  .history-list {
    max-height: 400px; /* 限制最大高度，约10条记录 */
    overflow-y: auto;
    padding: 0;
    scrollbar-width: thin;
    scrollbar-color: #666 #2a2a2a;
  }

  .history-list::-webkit-scrollbar {
    width: 8px;
  }

  .history-list::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 4px;
  }

  .history-list::-webkit-scrollbar-thumb {
    background: #666;
    border: 1px solid #2a2a2a;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .history-list::-webkit-scrollbar-thumb:hover {
    background: #777;
  }

  /* 历史记录项样式 */
  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid #333;
  }

  .history-item:hover {
    background-color: #333;
  }

  .history-title {
    color: #fff;
    font-size: 14px;
    line-height: 1.4;
    flex: 1;
    margin-right: 15px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .history-title:hover {
    color: #4caf50;
    text-decoration: underline;
    text-decoration-color: #4caf50;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }

  .history-time {
    color: #888;
    font-size: 12px;
    white-space: nowrap;
    margin-right: 10px;
  }

  .delete-btn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;
    outline: none;
  }

  .delete-btn:hover {
    background-color: #444;
  }

  .delete-btn:focus {
    outline: none;
    box-shadow: none;
  }

  /* 暂无历史记录样式 */
  .no-history {
    color: #888;
    text-align: center;
    padding: 40px 20px;
    font-size: 14px;
    font-style: italic;
    border-bottom: none;
  }

  /* 主内容区域 */
  .main-content {
    display: flex;
    flex: 1;
    margin-top: 60px;
    /* 移除overflow: hidden，允许内容区域滚动 */
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
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer p {
    margin: 5px 0;
  }

  .footer-links {
    margin-top: 10px;
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

  /* 左侧侧边栏 */
  .sidebar {
    width: 300px;
    background-color: #1a1a1a; /* 深色背景 */
    border-right: 1px solid #333;
    overflow: hidden;
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    z-index: 900;
    transform: translateX(0);
    transition: transform 0.3s ease;
    /* 字体优化 */
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-smooth: always;
  }

  /* 侧边栏打开状态（仅移动端使用） */
  .sidebar.open {
    transform: translateX(0);
  }

  /* 移动端默认隐藏侧边栏 */
  @media (max-width: 1000px) {
    .sidebar {
      transform: translateX(-100%);
      width: 280px; /* 优化移动端侧边栏宽度 */
      background-color: #1a1a1a; /* 深色背景，与参考图一致 */
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5); /* 添加阴影效果，增强层次感 */
      border-right: none; /* 移除右侧边框 */
      z-index: 1003; /* 提高z-index，确保显示在最上层 */
      /* 添加平滑过渡效果 */
      transition: transform 0.3s ease;
    }

    /* 侧边栏打开状态的平滑过渡 */
    .sidebar.open {
      transition: transform 0.3s ease;
    }
  }

  /* 菜单样式 */
  .menu {
    height: 100%;
    overflow-y: auto;
    padding: 0;
    /* 确保滚动条始终占据固定宽度 */
    scrollbar-gutter: stable both-edges;
    /* 设置滚动条宽度 */
    scrollbar-width: thin;
    /* 自定义滚动条颜色 - Firefox */
    scrollbar-color: #666666 #2a2a2a;
  }

  /* 滚动条样式 - WebKit */
  .menu::-webkit-scrollbar {
    width: 8px;
  }

  .menu::-webkit-scrollbar-track {
    /* 滚动条轨道颜色 - 深色主题 */
    background: #2a2a2a;
    /* 轨道圆角 */
    border-radius: 4px;
  }

  .menu::-webkit-scrollbar-thumb {
    /* 滚动条滑块颜色 - 使用灰色 */
    background: #666666;
    /* 滑块圆角 */
    border-radius: 4px;
    /* 滑块边框 */
    border: 1px solid #2a2a2a;
    /* 过渡效果 */
    transition: all 0.2s ease;
  }

  .menu::-webkit-scrollbar-thumb:hover {
    /* 滑块悬停颜色 */
    background: #777777;
    /* 悬停时轻微放大 */
    transform: scale(1.1);
  }

  .menu::-webkit-scrollbar-thumb:active {
    /* 滑块点击颜色 */
    background: #888888;
  }

  .menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* 侧边栏分隔线样式 */
  .sidebar-divider {
    height: 1px;
    background-color: #333;
    margin: 20px 0;
  }

  /* 辅助导航区域样式 */
  .auxiliary-nav {
    padding: 0 20px 20px;
  }

  /* 辅助导航标题样式 */
  .auxiliary-nav-title {
    font-size: 14px;
    font-weight: bold;
    color: #4caf50;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 辅助导航列表样式 */
  .auxiliary-nav-list {
    list-style: none;
    padding: 0;
    margin: 0 0 20px;
  }

  /* 辅助导航项样式 */
  .auxiliary-nav-item {
    padding: 15px 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #cccccc;
    border-radius: 4px;
    margin-bottom: 5px;
    /* 确保最小尺寸符合触控标准 */
    min-height: 48px;
    display: flex;
    align-items: center;
    /* 字体优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.2px;
  }

  /* 辅助导航项悬停样式 */
  .auxiliary-nav-item:hover {
    background-color: #2a2a2a;
    color: #4caf50;
    transform: translateX(5px);
  }

  .menu-item {
    margin-bottom: 0;
  }

  .menu-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px;
    background-color: transparent;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: #cccccc; /* 侧边栏字体颜色改为灰白色 */
    position: relative;
    transform: translateZ(0);
    will-change: background-color, color;
    /* 确保最小尺寸符合触控标准 */
    min-height: 48px;
    /* 字体优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.2px;
  }

  .menu-item-header:hover {
    background-color: #2a2a2a;
    color: #4caf50; /* 悬停时显示绿色 */
  }

  .menu-item-header.active {
    background-color: #2a2a2a;
    color: #4caf50; /* 选中后显示绿色高亮文字 */
  }

  .menu-item-header.active:hover {
    background-color: #333;
    color: #4caf50;
  }

  .menu-item-name {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 菜单项图标样式 */
  .menu-item-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: contain;
  }

  .menu-toggle {
    font-size: 12px;
    color: #cccccc;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform: translateZ(0);
  }

  .menu-item-header.active .menu-toggle {
    color: #4caf50;
  }

  /* 下拉列表样式 */
  .submenu-list {
    list-style: none;
    padding: 0;
    margin: 0;
    background-color: #1a1a1a;
  }

  /* 过渡容器样式 */
  .submenu-enter-active,
  .submenu-leave-active {
    /* 使用height属性实现平滑的展开/折叠效果 */
    transition:
      height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.3s ease-in-out;
    overflow: hidden;
  }

  .submenu-enter-from,
  .submenu-leave-to {
    height: 0;
    opacity: 0;
  }

  .submenu-enter-to,
  .submenu-leave-from {
    height: auto;
    opacity: 1;
  }

  

  /* 移除级联动画，使用简单的淡入效果 */
  .submenu-item {
    padding: 15px 20px 15px 50px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    color: #cccccc; /* 侧边栏小类字体颜色改为灰白色 */
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 1; /* 直接显示，不再使用动画延迟 */
    animation: none; /* 移除级联动画 */
    /* 确保最小尺寸符合触控标准 */
    min-height: 48px;
    /* 字体优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.2px;
  }

  /* 为子菜单项添加简单的hover效果 */
  .submenu-item:hover {
    background-color: #2a2a2a;
    color: #4caf50;
    transform: translateX(5px);
  }

  .submenu-item::before {
    content: '➤'; /* 箭头图标 */
    font-size: 10px;
    color: #666;
  }

  .submenu-item.active {
    color: #4caf50; /* 选中后显示绿色高亮文字 */
  }

  .submenu-item.active::before {
    color: #4caf50;
  }

  .submenu-item.active:hover {
    background-color: #333;
    color: #4caf50;
  }

  

  /* 右侧主内容 */
  .content {
    flex: 1;
    padding: 20px 20px 20px 15px;
    overflow-y: auto;
    background-color: #1a1a1a;
    margin-left: 300px;
    min-height: calc(100vh - 60px);
    box-sizing: border-box;
    transition: margin-left 0.3s ease;
  }

  /* 移动端主内容区域 */
  @media (max-width: 1000px) {
    .content {
      margin-left: 0;
    }
  }

  /* 通用样式 - 确保所有直接子元素都靠近左侧 */
  .content > div {
    margin-left: 0;
    margin-right: auto;
  }

  /* 触摸交互优化 - 增大可点击区域 */
  /* 全局按钮触摸优化 */
  button {
    min-width: 48px;
    min-height: 48px;
    padding: 8px 16px;
    /* 防止文本被选中 */
    user-select: none;
    /* 触摸反馈优化 */
    touch-action: manipulation;
    /* 移除高亮效果 */
    -webkit-tap-highlight-color: transparent;
  }

  /* 链接触摸优化 */
  a {
    min-width: 48px;
    min-height: 48px;
    padding: 8px;
    /* 防止文本被选中 */
    user-select: none;
    /* 触摸反馈优化 */
    touch-action: manipulation;
    /* 移除高亮效果 */
    -webkit-tap-highlight-color: transparent;
  }

  /* 表单元素触摸优化 */
  input,
  select,
  textarea {
    min-height: 48px;
    padding: 8px 12px;
    /* 触摸反馈优化 */
    touch-action: manipulation;
    /* 移除高亮效果 */
    -webkit-tap-highlight-color: transparent;
  }

  /* 可点击div元素触摸优化 */
  div[role='button'],
  div[tabindex='0'] {
    min-width: 48px;
    min-height: 48px;
    padding: 8px;
    /* 触摸反馈优化 */
    touch-action: manipulation;
    /* 移除高亮效果 */
    -webkit-tap-highlight-color: transparent;
    /* 确保可点击元素有明显的视觉反馈 */
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* 移动端触摸优化 - 确保所有可点击元素都有足够的触摸区域 */
  @media (hover: none) {
    /* 在触摸设备上增大按钮和链接的触摸区域 */
    button,
    a,
    div[role='button'],
    div[tabindex='0'] {
      min-width: 48px;
      min-height: 48px;
      padding: 10px 16px;
    }

    /* 增大表单元素的触摸区域 */
    input,
    select,
    textarea {
      min-height: 48px;
      padding: 10px 14px;
    }

    /* 确保图标按钮有足够的触摸区域 */
    .control-btn,
    .language-selector,
    .history-selector {
      min-width: 48px;
      min-height: 48px;
      padding: 10px;
    }
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 顶部导航栏 - 固定在最顶部 */
    .header {
      padding: 10px 15px;
      height: 50px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background-color: #000000;
      border-bottom: 1px solid #333;
      box-sizing: border-box;
    }

    .logo {
      font-size: 16px;
    }

    .logo-image {
      width: 24px;
      height: 24px;
    }

    /* 导航栏右侧区域：操作按钮 */
    .header-right {
      gap: 2px;
    }

    /* 主内容区域 */
    .main-content {
      margin-top: 50px;
      flex-direction: row;
    }

    /* 左侧侧边栏 */
    .sidebar {
      width: 250px;
      top: 50px;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1001;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    /* 右侧主内容 */
    .content {
      margin-left: 0;
      padding: 15px;
    }

    /* 语言选择器 */
    .language-selector {
      margin-right: 3px;
      padding: 6px;
      min-width: 36px;
      min-height: 36px;
      border-radius: 4px;
      background-color: transparent;
      transition: all 0.2s ease;
      position: relative;
      overflow: visible;
    }

    .language-selector:active {
      background-color: rgba(120, 120, 120, 0.4);
      transform: scale(0.95);
      border-color: #888;
      border-radius: 4px;
    }

    .language-selector.active {
      background-color: rgba(100, 100, 100, 0.4);
      border-color: #888;
      border-radius: 4px 4px 0 0;
    }

    .language-dropdown {
      width: calc(100vw - 30px);
      max-width: 160px;
      right: 0;
      left: auto;
      margin-top: 0;
      top: 100%;
      position: absolute;
      background-color: #242424;
      border: 1px solid #444;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      z-index: 2001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      padding: 8px 0;
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
    }

    /* 历史记录选择器 */
    .history-selector {
      margin-right: 3px;
      padding: 6px;
      min-width: 36px;
      min-height: 36px;
      border-radius: 4px;
      background-color: transparent;
      transition: all 0.2s ease;
      position: relative;
      overflow: visible;
    }

    .history-selector:active {
      background-color: rgba(120, 120, 120, 0.4);
      transform: scale(0.95);
      border-color: #888;
      border-radius: 4px;
    }

    .history-selector.active {
      background-color: rgba(100, 100, 100, 0.4);
      border-color: #888;
      border-radius: 4px 4px 0 0;
    }

    /* 历史记录面板 */
    .history-panel {
      width: calc(100vw - 50px);
      max-width: 250px;
      right: 0;
      left: auto;
      margin-top: 0;
      top: 100%;
      position: absolute;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      z-index: 2001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      max-height: calc(100vh - 60px);
    }

    /* 移动端历史记录标题添加下划线 */
    .history-title {
      text-decoration: underline !important;
    }

    /* 历史记录面板头部 */
    .history-header {
      padding: 10px 15px;
      background-color: #333;
      border-bottom: 1px solid #444;
    }

    .history-header h3 {
      font-size: 16px;
    }

    /* 历史记录项 */
    .history-item {
      padding: 10px 15px;
      pointer-events: auto !important;
    }

    /* 点击区域 */
    .click-area {
      width: 250px;
      height: 250px;
      font-size: 20px;
    }

    /* 时间选项 */
    .time-options {
      gap: 5px;
    }

    .time-btn {
      padding: 6px 12px;
      font-size: 14px;
    }

    /* 统计信息 */
    .stats {
      flex-direction: column;
      gap: 15px;
    }

    .stat-item {
      min-width: auto;
      padding: 15px;
    }
  }

  /* 小屏移动端适配 */
  @media (max-width: 480px) {
    .logo {
      font-size: 14px;
    }

    .logo-image {
      width: 20px;
      height: 20px;
    }

    .click-area {
      width: 200px;
      height: 200px;
      font-size: 18px;
    }

    .header-right {
      gap: 1px;
    }

    /* 语言选择器 */
    .language-selector,
    .history-selector {
      margin-right: 2px;
      padding: 4px;
      min-width: 32px;
      min-height: 32px;
    }

    .language-dropdown {
      min-width: 180px;
    }

    .history-panel {
      width: calc(100vw - 20px);
    }
  }


  

  .clicks {
    font-size: 48px;
    margin-bottom: 10px;
  }

  .timer {
    font-size: 20px;
  }

  .result {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .cps {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .reset-btn {
    padding: 10px 20px;
    font-size: 18px;
    background-color: #fff;
    color: #333;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-btn:hover {
    background-color: #f0f0f0;
  }

  /* 时间选择 */
  .time-selector {
    text-align: center;
    margin: 20px 0;
  }

  .time-selector h3 {
    color: #4caf50;
    margin-bottom: 10px;
  }

  .time-options {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  .time-btn {
    padding: 8px 16px;
    border: 2px solid #4caf50;
    background-color: #2a2a2a;
    color: #4caf50;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
  }

  .time-btn:hover {
    background-color: #4caf50;
    color: white;
  }

  .time-btn.active {
    background-color: #4caf50;
    color: white;
  }

  /* 统计信息 */
  .stats {
    display: flex;
    gap: 30px;
    margin-top: 20px;
    justify-content: center;
  }

  .stat-item {
    text-align: center;
    background-color: #333;
    padding: 20px;
    border-radius: 8px;
    min-width: 150px;
  }

  .stat-item .label {
    display: block;
    font-size: 18px;
    color: #999;
    margin-bottom: 5px;
  }

  .stat-item .value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #4caf50;
  }

  /* 信息区域 */
  .info {
    margin-top: 50px;
    padding: 20px;
    background-color: #333;
    border-radius: 10px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .info h3 {
    color: #4caf50;
    margin-bottom: 10px;
  }

  .info p {
    color: #ccc;
    line-height: 1.5;
  }
</style>
