<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { t, setLanguage, initLanguage, langState } from './i18n/index';
  import Breadcrumb from './components/Breadcrumb.vue';
  import { updateMetaTags } from './router/index';
  // 导入外部CSS
  import './styles/AppStyles.css';

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

<style>
  /* 关键CSS - 首屏渲染所需的样式 */

  /* 全局布局 */
  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #1a1a1a;
    color: #ffffff;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #cccccc;
    font-size: 14px;
    min-height: 40px;
    display: flex;
    align-items: center;
    letter-spacing: 0.2px;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.2);
  }

  /* 主导航项悬停样式 */
  .main-nav-item:hover {
    color: #4caf50;
  }

  /* 主导航项激活样式 */
  .main-nav-item.active {
    background-color: #2a2a2a;
    color: #4caf50;
    box-shadow: inset 0 0 0 2px #4caf50;
    border-radius: 4px;
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

  /* Logo样式 */
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

  /* Logo图片样式 */
  .logo-image {
    width: 32px;
    height: 32px;
    object-fit: contain;
    vertical-align: middle;
  }

  /* 头部操作按钮样式 */
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

  /* 语言图片样式 */
  .language-image {
    display: block;
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

  /* 主内容区域 */
  .main-content {
    display: flex;
    flex: 1;
    margin-top: 60px;
  }

  /* 主要内容区域 */
  .content {
    flex: 1;
    padding: 20px;
    margin-left: 300px;
    transition: margin-left 0.3s ease;
  }

  /* 移动端适配 - 基础样式 */
  @media (max-width: 1000px) {
    .content {
      margin-left: 0;
      padding: 15px;
    }
  }

  /* 响应式设计 - 确保在小屏幕上的基本布局 */
  @media (max-width: 1000px) {
    .header {
      padding: 10px 15px;
      height: 50px;
    }

    .main-nav {
      display: none;
    }

    .hamburger-menu {
      display: flex;
    }

    .header-actions {
      gap: 5px;
    }

    .main-content {
      margin-top: 50px;
    }
  }
</style>
