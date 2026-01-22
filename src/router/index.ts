import { createRouter, createWebHistory } from 'vue-router';

// 定义公共路由规则（不包含404路由）
const publicRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* rollupChunkName: "home" */ '../components/HomePage.vue'),
    meta: {
      title: 'CPSTest - 点击速度、反应时间、打字测试',
      description:
        'CPSTest - 免费、专业、快速的点击速度测试平台，提供实时反馈和全面的测试项目，支持多语言，记录历史成绩',
      keywords:
        'CPSTest,免费测试,专业测试,实时测试,快速测试,全面测试,点击速度测试,反应时间测试,打字测试,鼠标滚动测试,空格点击测试,多语言测试',
      // 添加翻译键，用于动态生成多语言meta标签
      i18n: {
        titleKey: 'websiteName',
        descriptionKey: 'metaDescription',
        keywordsKey: 'metaKeywords',
      },
    },
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import(/* rollupChunkName: "page" */ '../components/PrivacyPolicy.vue'),
    meta: {
      title: '隐私政策 - CPSTest',
      description: 'CPSTest隐私政策，详细说明我们如何收集、使用和保护您的数据',
      keywords: 'CPSTest,隐私政策,数据保护,用户隐私',
      // 添加翻译键，用于动态生成多语言meta标签
      i18n: {
        titleKey: 'privacyPolicyTitle',
        descriptionKey: 'privacyPolicyDescription',
        keywordsKey: 'privacyPolicyKeywords',
      },
    },
  },
  {
    path: '/home',
    redirect: '/', // 重定向到首页
  },
  {
    path: '/click-test',
    redirect: '/click-test/5', // 重定向到5秒点击测试
  },
  {
    path: '/click-test/:time(\\d+)',
    name: 'ClickTest',
    component: () => import(/* rollupChunkName: "click" */ '../components/ClickTest.vue'), // 点击测试组件
    props: true,
    meta: {
      title: '点击速度测试 - CPSTest',
      description: '测试您的点击速度，支持1秒、2秒、5秒、10秒、15秒、30秒、60秒等多种时间测试',
      keywords: '点击速度测试,CPSTest,鼠标点击测试,点击速度,点击速度测试在线,点击速度测试工具',
      i18n: {
        titleKey: 'clickTest',
        descriptionKey: 'clickTestDescription',
        keywordsKey: 'clickTestKeywords',
      },
    },
  },
  {
    path: '/multi-click-test/double',
    name: 'DoubleClickTest',
    component: () => import(/* rollupChunkName: "click" */ '../components/DoubleClickTest.vue'), // 双击连点测试组件
    props: true,
    meta: {
      title: '双击连点测试 - CPSTest',
      description: '测试您的双击连点速度，记录双击次数和CPS',
      keywords: '双击测试,连点测试,双击连点测试,双击速度测试,双击次数测试',
      i18n: {
        titleKey: 'doubleClickTest',
        descriptionKey: 'doubleClickTestDescription',
        keywordsKey: 'doubleClickTestKeywords',
      },
    },
  },
  {
    path: '/multi-click-test/triple',
    name: 'TripleClickTest',
    component: () => import(/* rollupChunkName: "click" */ '../components/TripleClickTest.vue'), // 三连击测试组件
    props: true,
    meta: {
      title: '三连击测试 - CPSTest',
      description: '测试您的三连击速度，记录三连击次数和最佳三连击速度',
      keywords: '三连击测试,三连点击测试,三连击速度测试,三连击次数测试,三连击测试工具',
      i18n: {
        titleKey: 'tripleClickTest',
        descriptionKey: 'tripleClickTestDescription',
        keywordsKey: 'tripleClickTestKeywords',
      },
    },
  },
  {
    path: '/space-click-test',
    redirect: '/space-click-test/5', // 重定向到5秒空格点击测试
  },
  {
    path: '/space-click-test/:time(\\d+)',
    name: 'SpaceClickTest',
    component: () => import(/* rollupChunkName: "keyboard" */ '../components/SpaceClickTest.vue'), // 空格点击测试组件
    props: true,
    meta: {
      title: '空格点击测试 - CPSTest',
      description: '测试您的空格点击速度，支持1秒、2秒、5秒、10秒、15秒、30秒、60秒等多种时间测试',
      keywords: '空格点击测试,空格键测试,空格速度测试,空格点击速度,空格键点击测试工具',
      i18n: {
        titleKey: 'spaceClickTest',
        descriptionKey: 'spaceClickTestDescription',
        keywordsKey: 'spaceClickTestKeywords',
      },
    },
  },
  {
    path: '/kohi-click-test',
    name: 'KohiClickTest',
    component: () => import(/* rollupChunkName: "click" */ '../components/KohiClickTest.vue'), // 科霍点击测试组件
    props: true,
    meta: {
      title: 'Kohi点击测试 - CPSTest',
      description: '专业的Minecraft点击测试，固定10秒，模拟Kohi服务器点击环境',
      keywords: 'Kohi测试,Kohi点击测试,Minecraft点击测试,MC点击测试,10秒点击测试',
      i18n: {
        titleKey: 'kohiClickTest',
        descriptionKey: 'kohiClickTestDescription',
        keywordsKey: 'kohiClickTestKeywords',
      },
    },
  },
  {
    path: '/reaction-time-test',
    name: 'ReactionTimeTest',
    component: () => import(/* rollupChunkName: "reaction" */ '../components/ReactionTimeTest.vue'), // 反应时间测试组件
    props: true,
    meta: {
      title: '反应时间测试 - CPSTest',
      description: '测试您的反应速度，测量从视觉刺激到鼠标点击的时间间隔',
      keywords: '反应时间测试,反应速度测试,视觉反应测试,反应测试,反应速度测试工具',
      i18n: {
        titleKey: 'reactionTest',
        descriptionKey: 'reactionTestDescription',
        keywordsKey: 'reactionTestKeywords',
      },
    },
  },
  {
    path: '/color-reaction-test',
    name: 'ColorReactionTest',
    component: () =>
      import(/* rollupChunkName: "reaction" */ '../components/ColorReactionTest.vue'), // 颜色反应测试组件
    props: true,
    meta: {
      title: '颜色反应测试 - CPSTest',
      description: '测试您的颜色识别和反应速度，忽略文字内容，点击与文字匹配的颜色',
      keywords: '颜色反应测试,颜色识别测试,视觉反应测试,颜色反应速度测试,颜色测试',
      i18n: {
        titleKey: 'colorReactionTest',
        descriptionKey: 'colorReactionTestDescription',
        keywordsKey: 'colorReactionTestKeywords',
      },
    },
  },
  {
    path: '/key-reaction-test',
    name: 'KeyReactionTest',
    component: () => import(/* rollupChunkName: "reaction" */ '../components/KeyReactionTest.vue'), // 按键反应测试组件
    props: true,
    meta: {
      title: '按键反应测试 - CPSTest',
      description: '测试您的WASD按键反应速度，适合游戏玩家训练',
      keywords: '按键反应测试,WASD反应测试,游戏反应测试,按键速度测试,游戏玩家训练',
      i18n: {
        titleKey: 'keyReactionTest',
        descriptionKey: 'keyReactionTestDescription',
        keywordsKey: 'keyReactionTestKeywords',
      },
    },
  },
  {
    path: '/target-elimination-game',
    name: 'TargetEliminationGame',
    component: () =>
      import(/* rollupChunkName: "game" */ '../components/TargetEliminationGame.vue'), // 目标消除游戏组件
    props: true,
    meta: {
      title: '目标消除游戏 - CPSTest',
      description: '测试您的反应速度和手眼协调能力，消除屏幕上的彩色目标',
      keywords: '目标消除游戏,反应速度训练,手眼协调训练,反应游戏,目标消除测试',
      i18n: {
        titleKey: 'targetEliminationGame',
        descriptionKey: 'targetEliminationGameDescription',
        keywordsKey: 'targetEliminationGameKeywords',
      },
    },
  },
  {
    path: '/mouse-scroll-test',
    name: 'MouseScrollTest',
    component: () => import(/* rollupChunkName: "mouse" */ '../components/MouseScrollTest.vue'), // 鼠标滚动测试组件
    props: true,
    meta: {
      title: '鼠标滚动测试 - CPSTest',
      description: '测试您的鼠标滚动速度，测量每秒滚动像素数',
      keywords: '鼠标滚动测试,滚动速度测试,鼠标滚动速度,滚动测试,鼠标测试',
      i18n: {
        titleKey: 'mouseScrollTest',
        descriptionKey: 'mouseScrollTestDescription',
        keywordsKey: 'mouseScrollTestKeywords',
      },
    },
  },
  {
    path: '/mouse-drag-test',
    name: 'MouseDragTest',
    component: () => import(/* rollupChunkName: "mouse" */ '../components/MouseDragTest.vue'), // 鼠标拖动测试组件
    props: true,
    meta: {
      title: '鼠标拖动测试 - CPSTest',
      description: '测试您的鼠标拖动速度和精度，记录拖动距离和平均速度',
      keywords: '鼠标拖动测试,拖动速度测试,鼠标拖动速度,拖动测试,鼠标测试',
      i18n: {
        titleKey: 'mouseDragTest',
        descriptionKey: 'mouseDragTestDescription',
        keywordsKey: 'mouseDragTestKeywords',
      },
    },
  },
  {
    path: '/keyboard-test',
    name: 'KeyboardTest',
    component: () => import(/* rollupChunkName: "keyboard" */ '../components/KeyboardTest.vue'), // 键盘测试组件
    props: true,
    meta: {
      title: '键盘测试 - CPSTest',
      description: '测试您的键盘按键功能，显示按键状态和已按下的按键列表',
      keywords: '键盘测试,键盘按键测试,键盘功能测试,按键测试,键盘检测',
      i18n: {
        titleKey: 'keyboardTest',
        descriptionKey: 'keyboardTestDescription',
        keywordsKey: 'keyboardTestKeywords',
      },
    },
  },
  {
    path: '/typing-test',
    redirect: '/typing-test/1', // 重定向到1分钟打字测试
  },
  {
    path: '/typing-test/:time(\\d+)',
    name: 'TypingTest',
    component: () => import(/* rollupChunkName: "typing" */ '../components/TypingTest.vue'), //打字测试组件
    props: true,
    meta: {
      title: '打字测试 - CPSTest',
      description:
        '测试您的打字速度和准确率，支持1分钟、3分钟、5分钟、10分钟、15分钟等多种时间测试',
      keywords: '打字测试,打字速度测试,打字准确率测试,打字练习,打字速度',
      i18n: {
        titleKey: 'typingTest',
        descriptionKey: 'typingTestDescription',
        keywordsKey: 'typingTestKeywords',
      },
    },
  },
  {
    path: '/spacebar-clicker',
    name: 'SpacebarClicker',
    component: () => import(/* rollupChunkName: "game" */ '../components/SpacebarClicker.vue'), // 空格键点击器组件
    props: true,
    meta: {
      title: '空格键点击器 - CPSTest',
      description: '空格键点击游戏，通过点击空格键或使用自动点击BUFF来积累点击数，解锁更多功能',
      keywords: '空格键点击器,点击游戏,自动点击,BUFF系统,点击积累',
      i18n: {
        titleKey: 'spacebarClicker',
        descriptionKey: 'spacebarClickerDescription',
        keywordsKey: 'spacebarClickerKeywords',
      },
    },
  },
];

// 定义404路由
const notFoundRoute = {
  // 404页面路由
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import(/* rollupChunkName: "error" */ '../components/NotFound.vue'),
  meta: {
    title: '页面未找到 - CPSTest',
    description: '抱歉，您访问的页面不存在。请检查URL是否正确，或返回首页继续浏览。',
    keywords: '404,页面未找到,CPSTest,错误页面',
    i18n: {
      titleKey: 'notFoundTitle',
      descriptionKey: 'notFoundDescription',
      keywordsKey: 'notFoundKeywords',
    },
  },
};

// 定义支持的语言（不包括默认语言英语）
const supportedLanguages = ['zh-CN', 'ja', 'ko'];

// 定义路由规则 - 支持多语言路径前缀
const routes = [
  // 默认语言路由（英语，无需前缀）
  ...publicRoutes,

  // 其他语言路由（带前缀）
  ...supportedLanguages.flatMap((lang) => {
    // 为每个语言创建扁平的路由配置，而不是嵌套路由
    return publicRoutes.map((route) => {
      // 移除原始路由的name属性，避免重复命名
      return {
        ...route,
        // 为路由添加语言前缀
        path: `/${lang}${route.path === '/' ? '' : route.path}`,
        // 保留原始路由的meta属性
        meta: route.meta,
        // 删除name属性
        name: undefined,
      };
    });
  }),
  notFoundRoute,
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 优化滚动行为
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      // 如果有保存的位置，恢复到该位置
      return savedPosition;
    } else {
      // 否则滚动到顶部
      return { top: 0 };
    }
  },
});

// 导入i18n翻译函数
import { t } from '../i18n/index';

// 缓存上一次的路由信息，避免重复更新
let lastRoute: any = null;

// 提取meta标签更新逻辑为独立函数，支持响应式更新
export const updateMetaTags = (to: any) => {
  // 避免重复更新相同路由的meta标签
  if (lastRoute && lastRoute.path === to.path && lastRoute.meta === to.meta) {
    return;
  }

  // 动态获取当前域名，避免硬编码
  const baseUrl = window.location.origin;
  const currentUrl = `${baseUrl}${to.path}`;

  // 设置页面标题
  let pageTitle = '';
  if (to.meta.i18n && to.meta.i18n.titleKey) {
    // 获取不带语言前缀的路径
    const pathWithoutLang = getPathWithoutLangPrefix(to.path);

    // 定义正则表达式来匹配测试类型和时间参数
    const testPathRegex = /^\/([^/]+)\/(\d+)$/;
    const match = pathWithoutLang.match(testPathRegex);

    if (match) {
      const [, testType, time] = match;

      // 根据测试类型和时间参数生成标题
      if (testType === 'click-test') {
        switch (time) {
          case '1':
            pageTitle = t('1secClickTest');
            break;
          case '2':
            pageTitle = t('2secClickTest');
            break;
          case '5':
            pageTitle = t('5secClickTest');
            break;
          case '10':
            pageTitle = t('10secClickTest');
            break;
          case '15':
            pageTitle = t('15secClickTest');
            break;
          case '30':
            pageTitle = t('30secClickTest');
            break;
          case '60':
            pageTitle = t('60secClickTest');
            break;
          default:
            pageTitle = t(to.meta.i18n.titleKey);
        }
      } else if (testType === 'space-click-test') {
        switch (time) {
          case '1':
            pageTitle = t('1secSpaceTest');
            break;
          case '2':
            pageTitle = t('2secSpaceTest');
            break;
          case '5':
            pageTitle = t('5secSpaceTest');
            break;
          case '10':
            pageTitle = t('10secSpaceTest');
            break;
          case '15':
            pageTitle = t('15secSpaceTest');
            break;
          case '30':
            pageTitle = t('30secSpaceTest');
            break;
          case '60':
            pageTitle = t('60secSpaceTest');
            break;
          default:
            pageTitle = t(to.meta.i18n.titleKey);
        }
      } else if (testType === 'typing-test') {
        switch (time) {
          case '1':
            pageTitle = t('1minTypingTest');
            break;
          case '3':
            pageTitle = t('3minTypingTest');
            break;
          case '5':
            pageTitle = t('5minTypingTest');
            break;
          case '10':
            pageTitle = t('10minTypingTest');
            break;
          case '15':
            pageTitle = t('15minTypingTest');
            break;
          default:
            pageTitle = t(to.meta.i18n.titleKey);
        }
      } else {
        pageTitle = t(to.meta.i18n.titleKey);
      }
    } else {
      // 默认情况：直接使用titleKey
      pageTitle = t(to.meta.i18n.titleKey);
    }
  } else {
    pageTitle = to.meta.title || t('websiteName');
  }
  // 完整标题格式：页面标题 - 网站名称（用于SEO和品牌推广）
  const fullPageTitle = to.name === 'Home' ? `${pageTitle}` : `${pageTitle} - CPSTestGo`;
  document.title = fullPageTitle;

  // 设置meta描述 - 根据路由参数动态生成
  let metaDesc = '';
  if (to.meta.i18n?.descriptionKey) {
    metaDesc = t(to.meta.i18n.descriptionKey);
  } else {
    metaDesc = t('metaDescription');
  }

  // 先尝试找到现有的meta标签，如果没有则创建
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', metaDesc);

  // 设置meta关键词 - 根据路由参数动态生成
  let metaKeywords = '';
  if (to.meta.i18n?.keywordsKey) {
    metaKeywords = t(to.meta.i18n.keywordsKey);
  } else {
    metaKeywords = t('metaKeywords');
  }

  // 先尝试找到现有的meta标签，如果没有则创建
  let metaKeywordsEl = document.querySelector('meta[name="keywords"]');
  if (!metaKeywordsEl) {
    metaKeywordsEl = document.createElement('meta');
    metaKeywordsEl.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywordsEl);
  }
  metaKeywordsEl.setAttribute('content', metaKeywords);

  // 设置Open Graph标签
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', pageTitle);
  }

  // 设置Open Graph描述 - 使用页面特定的描述
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    // 优先使用页面特定的og描述，如果没有则使用meta描述
    const pageOgDesc = to.meta.i18n?.ogDescriptionKey ? t(to.meta.i18n.ogDescriptionKey) : metaDesc;
    ogDescription.setAttribute('content', pageOgDesc);
  }

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', currentUrl);
  }

  // 设置Twitter Cards标签
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', pageTitle);
  }

  // 设置Twitter Cards描述 - 使用页面特定的描述
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) {
    // 优先使用页面特定的twitter描述，如果没有则使用meta描述
    const pageTwitterDesc = to.meta.i18n?.twitterDescriptionKey
      ? t(to.meta.i18n.twitterDescriptionKey)
      : metaDesc;
    twitterDescription.setAttribute('content', pageTwitterDesc);
  }

  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) {
    twitterUrl.setAttribute('content', currentUrl);
  }

  // 更新schema.org结构化数据
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript) {
    try {
      // 根据页面类型生成不同的结构化数据
      let schemaData: any = {};

      // 检测页面类型
      const isTestPage = to.path.includes('-test') || to.path.includes('game');

      if (isTestPage) {
        // 测试页面结构化数据
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: pageTitle,
          description: metaDesc,
          url: currentUrl,
          keywords: metaKeywords,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
          inLanguage: ['zh-CN', 'en', 'ja', 'ko'],
          image: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
            width: 512,
            height: 512,
          },
          publisher: {
            '@type': 'Organization',
            name: t('schemaPublisher'),
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
              width: 512,
              height: 512,
            },
            url: baseUrl,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': currentUrl,
          },
          // 使用固定发布日期，避免每次访问都更新
          datePublished: '2025-01-01',
          dateModified: '2025-06-01',
          potentialAction: {
            '@type': 'UseAction',
            target: currentUrl,
            description: `开始${pageTitle}`,
          },
        };
      } else {
        // 非测试页面使用默认结构化数据
        schemaData = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: t('schemaName'),
          description: metaDesc,
          url: currentUrl,
          keywords: metaKeywords,
          publisher: {
            '@type': 'Organization',
            name: t('schemaPublisher'),
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
              width: 512,
              height: 512,
            },
            url: baseUrl,
          },
          inLanguage: ['zh-CN', 'en', 'ja', 'ko'],
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': currentUrl,
          },
          // 使用固定发布日期，避免每次访问都更新
          datePublished: '2025-01-01',
          dateModified: '2025-06-01',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        };
      }

      // 更新结构化数据
      schemaScript.textContent = JSON.stringify(schemaData);
    } catch (error) {
      console.error('Failed to parse schema.org data:', error);
    }
  }

  // 缓存当前路由信息
  lastRoute = to;
};

// 获取不带语言前缀的路径
const getPathWithoutLangPrefix = (path: string): string => {
  const supportedLanguages = ['zh-CN', 'ja', 'ko'];
  const pathSegments = path.split('/').filter((segment) => segment !== '');

  if (pathSegments.length > 0 && pathSegments[0] && supportedLanguages.includes(pathSegments[0])) {
    // 移除语言前缀
    return `/${pathSegments.slice(1).join('/')}`;
  }

  return path;
};

// 为指定语言生成带前缀的路径
const generateLangPath = (path: string, lang: string): string => {
  const basePath = getPathWithoutLangPrefix(path);

  // 默认语言（英语）不需要前缀
  if (lang === 'en') {
    return basePath;
  }

  // 其他语言需要添加前缀
  return `/${lang}${basePath === '/' ? '' : basePath}`;
};

// hreflang标签验证逻辑
const validateHreflangTags = () => {
  // 获取所有hreflang标签
  const hreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');

  // 检查是否存在hreflang标签
  if (hreflangTags.length === 0) {
    console.warn('No hreflang tags found on the page.');
    return false;
  }

  // 检查是否存在x-default标签
  const hasDefaultTag = Array.from(hreflangTags).some(
    (tag) => tag.getAttribute('hreflang') === 'x-default'
  );
  if (!hasDefaultTag) {
    console.warn('No x-default hreflang tag found.');
  }

  // 支持的语言列表
  const supportedLanguages = ['zh-CN', 'en', 'ja', 'ko'];

  // 检查每个语言是否都有对应的hreflang标签
  supportedLanguages.forEach((lang) => {
    const hasLangTag = Array.from(hreflangTags).some(
      (tag) => tag.getAttribute('hreflang') === lang
    );
    if (!hasLangTag) {
      console.warn(`No hreflang tag found for language: ${lang}`);
    }
  });

  // 检查每个hreflang标签的有效性
  let allValid = true;

  hreflangTags.forEach((tag) => {
    const hreflang = tag.getAttribute('hreflang');
    const href = tag.getAttribute('href');

    // 检查hreflang属性是否存在且非空
    if (!hreflang) {
      console.error('Invalid hreflang tag: missing hreflang attribute.');
      allValid = false;
      return;
    }

    // 检查href属性是否存在且非空
    if (!href) {
      console.error(`Invalid hreflang tag for ${hreflang}: missing href attribute.`);
      allValid = false;
      return;
    }

    // 检查href是否为有效的URL
    try {
      new URL(href);
    } catch (error) {
      console.error(`Invalid hreflang tag for ${hreflang}: invalid href URL.`);
      allValid = false;
      return;
    }
  });

  return allValid;
};

// 缓存上一次的hreflang标签，避免重复生成
let lastHreflangTags: any = null;
let lastCanonicalTag: string = '';

// 全局路由守卫 - 设置页面标题和meta标签
router.beforeEach((to, _from, next) => {
  // 处理重复语言前缀的重定向
  const pathSegments = to.path.split('/').filter((segment) => segment !== '');
  const supportedLanguages = ['zh-CN', 'ja', 'ko'];
  const allLanguages = ['zh-CN', 'ja', 'ko', 'en'];

  // 检查是否有重复的语言前缀
  if (pathSegments.length >= 2) {
    const firstSegment = pathSegments[0];
    const secondSegment = pathSegments[1];

    // 确保 segments 不是 undefined
    if (firstSegment && secondSegment) {
      // 情况1: /lang/en/path (如 /ko/en/multi-click-test/triple)
      if (supportedLanguages.includes(firstSegment) && secondSegment === 'en') {
        const remainingPath = pathSegments.slice(2).join('/');
        const redirectPath = remainingPath
          ? `/${firstSegment}/${remainingPath}`
          : `/${firstSegment}`;
        console.log(`重定向1: ${to.path} -> ${redirectPath}`);
        return next({ path: redirectPath, replace: true });
      }

      // 情况2: /lang1/lang2/path (如 /zh-CN/ja/test)
      if (allLanguages.includes(firstSegment) && allLanguages.includes(secondSegment)) {
        const remainingPath = pathSegments.slice(2).join('/');
        let redirectPath = '';

        // 如果第一个段是支持的语言，使用第一个段
        if (supportedLanguages.includes(firstSegment)) {
          redirectPath = remainingPath ? `/${firstSegment}/${remainingPath}` : `/${firstSegment}`;
        }
        // 如果第一个段是'en'，使用第二个段作为语言前缀
        else if (firstSegment === 'en' && supportedLanguages.includes(secondSegment)) {
          redirectPath = remainingPath ? `/${secondSegment}/${remainingPath}` : `/${secondSegment}`;
        }

        if (redirectPath) {
          console.log(`重定向2: ${to.path} -> ${redirectPath}`);
          return next({ path: redirectPath, replace: true });
        }
      }

      // 情况3: /en/path (如 /en/multi-click-test/triple) - 重定向到 /path
      if (firstSegment === 'en' && !allLanguages.includes(secondSegment)) {
        const remainingPath = pathSegments.slice(1).join('/');
        const redirectPath = remainingPath ? `/${remainingPath}` : '/';
        console.log(`重定向3: ${to.path} -> ${redirectPath}`);
        return next({ path: redirectPath, replace: true });
      }
    }
  }

  // 情况4: /en (单独的 /en) - 重定向到 /
  if (pathSegments.length === 1 && pathSegments[0] === 'en') {
    console.log(`重定向4: ${to.path} -> /`);
    return next({ path: '/', replace: true });
  }

  // 设置canonical标签（每个语言版本使用自己的URL作为规范URL）
  try {
    const canonicalUrl = `${window.location.origin}${to.path}`;

    // 避免重复更新相同的canonical标签
    if (lastCanonicalTag !== canonicalUrl) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link') as HTMLLinkElement;
        (canonicalTag as HTMLLinkElement).rel = 'canonical';
        document.head.appendChild(canonicalTag);
      }

      canonicalTag.setAttribute('href', canonicalUrl);
      lastCanonicalTag = canonicalUrl;
    }
  } catch (error) {
    console.error('Failed to set canonical tag:', error);
  }

  // 设置hreflang标签
  const languages = ['zh-CN', 'en', 'ja', 'ko'];
  const currentHreflangKey = `${to.path}_${languages.join('_')}`;

  // 避免重复生成相同的hreflang标签
  if (lastHreflangTags !== currentHreflangKey) {
    // 先移除所有现有hreflang标签
    const existingHreflangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflangTags.forEach((tag) => tag.remove());

    // 添加默认语言标签
    const defaultTag = document.createElement('link');
    defaultTag.rel = 'alternate';
    defaultTag.hreflang = 'x-default';
    defaultTag.href = `${window.location.origin}${getPathWithoutLangPrefix(to.path)}`;
    document.head.appendChild(defaultTag);

    // 添加各语言标签
    languages.forEach((lang) => {
      const tag = document.createElement('link');
      tag.rel = 'alternate';
      tag.hreflang = lang;
      tag.href = `${window.location.origin}${generateLangPath(to.path, lang)}`;
      document.head.appendChild(tag);
    });

    // 验证hreflang标签 - 使用环境变量检查，兼容浏览器环境
    if (import.meta.env.DEV) {
      setTimeout(() => {
        // 使用setTimeout确保DOM已更新
        validateHreflangTags();
      }, 0);
    }

    // 缓存当前hreflang标签状态
    lastHreflangTags = currentHreflangKey;
  }

  // 验证路由参数 - 确保只有有效的数字参数才能访问测试页面
  const pathWithoutLang = getPathWithoutLangPrefix(to.path);

  // 定义各测试类型支持的时间参数
  const supportedTimes = {
    '/click-test': [1, 2, 5, 10, 15, 30, 60],
    '/space-click-test': [1, 2, 5, 10, 15, 30, 60],
    '/typing-test': [1, 3, 5, 10, 15],
  };

  // 检查当前路由是否是时间测试路由
  for (const [routePrefix, times] of Object.entries(supportedTimes)) {
    if (pathWithoutLang.startsWith(routePrefix)) {
      // 提取时间参数
      const timeParam = to.params.time;
      if (timeParam) {
        const parsedTime = parseInt(timeParam.toString());
        // 验证时间参数是否为纯数字且在支持的时间列表中
        if (!/^\d+$/.test(timeParam.toString()) || !times.includes(parsedTime)) {
          // 如果参数无效，重定向到404页面，保留原始语言前缀
          // 从路径中提取语言前缀
          const pathSegments = to.path.split('/').filter((segment) => segment !== '');
          const supportedLanguages = ['zh-CN', 'ja', 'ko'];
          let langPrefix = '';

          if (
            pathSegments.length > 0 &&
            pathSegments[0] &&
            supportedLanguages.includes(pathSegments[0])
          ) {
            langPrefix = pathSegments[0];
          }

          // 如果有语言前缀，重定向到带有语言前缀的404路径
          if (langPrefix) {
            return next(`/${langPrefix}/*`);
          } else {
            // 否则重定向到默认的404路径
            return next({ name: 'NotFound' });
          }
        }
      }
      break;
    }
  }

  next();
});

// 在路由导航完成后更新meta标签，此时路由参数已正确解析
router.afterEach((to) => {
  // 调用meta标签更新函数
  updateMetaTags(to);
});

export default router;
