import { reactive, computed, nextTick } from 'vue';
import { updateMetaTags } from '../router/index';
import router from '../router/index';
import { CookieManager, COOKIE_NAMES } from '../utils/cookie';

// 定义翻译资源类型 - 支持嵌套对象
interface TranslationValue {
  [key: string]: string | TranslationValue;
}

interface TranslationResources {
  [key: string]: TranslationValue;
}

// 翻译资源 - 按需加载，使用reactive使其成为响应式
const resources = reactive<TranslationResources>({
  en: {}, // 默认语言，后续会动态加载
  'zh-CN': {},
  ja: {},
  ko: {},
});

// 语言资源缓存
const loadedLanguages = new Set<string>(); // 初始为空，后续按需加载

// 预加载默认语言（英语）资源，确保翻译立即可用
const preloadDefaultLanguage = async () => {
  try {
    const defaultMessages = await import('./locales/en/common');
    resources['en'] = defaultMessages.default;
    loadedLanguages.add('en');
  } catch (error) {
    console.error('Failed to preload default language resource:', error);
  }
};

// 立即预加载默认语言
preloadDefaultLanguage();

// 语言资源加载函数（按需加载）
const loadLanguageResource = async (lang: string): Promise<boolean> => {
  try {
    // 无论是否已加载，都强制重新加载英语资源，确保初始加载正确
    if (lang === 'en' || !loadedLanguages.has(lang)) {
      // 动态导入语言资源
      let messages: TranslationValue;
      switch (lang) {
        case 'zh-CN':
          messages = (await import('./locales/zh-CN/common')).default;
          break;
        case 'en':
          messages = (await import('./locales/en/common')).default;
          break;
        case 'ja':
          messages = (await import('./locales/ja/common')).default;
          break;
        case 'ko':
          messages = (await import('./locales/ko/common')).default;
          break;
        default:
          messages = (await import('./locales/en/common')).default;
      }

      // 更新资源
      resources[lang] = messages;

      // 标记为已加载
      loadedLanguages.add(lang);

      // 如果加载的是当前语言，强制触发currentResources重新计算
      if (lang === langState.current) {
        // 通过先赋一个不同的值，然后再赋回原来的值，触发响应式更新
        const tempLang = langState.current;
        langState.current = '';
        langState.current = tempLang;
      }
    }

    return true;
  } catch (error) {
    console.error(`Failed to load language resource for ${lang}:`, error);
    return false;
  }
};

// 当前语言 - 使用reactive使其成为响应式
export const langState = reactive({
  current: 'en',
});

// 为了保持向后兼容，导出一个只读的currentLang
export const currentLang = computed(() => langState.current);

// 设置当前语言
export const setLanguage = async (lang: string) => {
  // 加载语言资源
  const loaded = await loadLanguageResource(lang);

  if (loaded) {
    langState.current = lang;
    // 使用Cookie存储语言偏好，过期时间设置为365天
    CookieManager.setCookie(COOKIE_NAMES.LANGUAGE, lang, 365);

    // 语言切换后使用nextTick确保DOM更新完成后再更新meta标签
    nextTick(() => {
      updateMetaTags(router.currentRoute.value);
    });
  }
};

// 获取当前语言
export const getLanguage = (): string => {
  const savedLang = CookieManager.getCookie(COOKIE_NAMES.LANGUAGE);
  return savedLang || langState.current;
};

// 初始化语言 - 优先从URL路径提取，其次从URL参数获取，最后从localStorage获取，默认英语
export const initLanguage = async () => {
  // 支持的语言列表
  const supportedLanguages = ['zh-CN', 'en', 'ja', 'ko'];

  // 从URL路径中提取语言前缀
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment !== '');
  let detectedLang = '';

  // 检查路径是否以支持的语言前缀开头
  if (pathSegments.length > 0 && pathSegments[0] && supportedLanguages.includes(pathSegments[0])) {
    detectedLang = pathSegments[0];
  }

  // 如果路径中没有语言前缀，检查URL查询参数
  if (!detectedLang) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && supportedLanguages.includes(urlLang)) {
      detectedLang = urlLang;
    }
  }

  // 从Cookie获取保存的语言
  const savedLang = CookieManager.getCookie(COOKIE_NAMES.LANGUAGE);

  // 确定最终使用的语言
  let finalLang = 'en'; // 默认使用英语

  if (detectedLang && supportedLanguages.includes(detectedLang)) {
    finalLang = detectedLang;
  } else {
    // 检查是否是新会话（新打开浏览器）
    const isNewSession = !sessionStorage.getItem('session_started');
    if (isNewSession && savedLang && supportedLanguages.includes(savedLang)) {
      // 如果是新会话，使用Cookie中保存的语言偏好
      finalLang = savedLang;
      // 设置会话标记
      sessionStorage.setItem('session_started', 'true');
      // 导航到带有语言前缀的URL，确保URL和语言一致
      const path = window.location.pathname;
      const basePath = path === '/' ? '' : path;
      // 默认语言（英语）不需要前缀
      if (finalLang === 'en') {
        // 直接使用原始路径，不需要添加前缀
        // 但在导航前先加载语言资源并设置状态
        await loadLanguageResource(finalLang);
        langState.current = finalLang;
        window.location.href = basePath;
      } else {
        // 其他语言添加前缀
        // 在导航前先加载语言资源并设置状态
        await loadLanguageResource(finalLang);
        langState.current = finalLang;
        window.location.href = `/${finalLang}${basePath}`;
      }
      return; // 终止当前函数执行
    }
  }

  // 加载语言资源
  await loadLanguageResource(finalLang);

  // 直接设置最终语言
  langState.current = finalLang;

  // 只有当URL中有语言前缀时，才更新Cookie
  // 这样当用户使用浏览器后退按钮回退到默认语言版本时，Cookie中保存的仍然是之前选择的语言
  if (detectedLang) {
    CookieManager.setCookie(COOKIE_NAMES.LANGUAGE, finalLang, 365);
  }

  // 更新meta标签
  nextTick(() => {
    if (router && router.currentRoute && router.currentRoute.value) {
      updateMetaTags(router.currentRoute.value);
    }
  });
};

// 监听路由变化，更新语言状态
router.afterEach(async () => {
  await initLanguage();
});

// 当前语言资源 - 使用computed使其成为响应式
export const currentResources = computed(() => resources[langState.current]);

// 翻译函数 - 支持参数替换和嵌套对象
export const t = (key: string, params: Record<string, any> = {}): string => {
  // 分解键路径
  const keys = key.split('.');
  let translation: any = currentResources.value;

  // 遍历键路径，查找对应的翻译值
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // 如果找不到对应翻译，返回原始键
      return key;
    }
  }

  // 如果找到的翻译是对象而不是字符串，返回原始键
  if (typeof translation !== 'string') {
    return key;
  }

  // 替换参数
  Object.keys(params).forEach((paramKey) => {
    const regex = new RegExp(`\\{${paramKey}\\}`);
    translation = translation.replace(regex, params[paramKey]);
  });

  return translation;
};

// 提供useI18n composable
export const useI18n = () => {
  return {
    t,
    langState,
    currentLang,
    setLanguage,
    getLanguage,
    currentResources,
  };
};

// 默认导出，用于 main.ts 中的导入
export default {
  install: async (app: any) => {
    // 初始化语言
    await initLanguage();

    // 全局注册翻译函数
    app.config.globalProperties.$t = t;

    // 提供语言相关的状态和方法
    app.provide('i18n', {
      langState,
      currentLang,
      setLanguage,
      getLanguage,
      currentResources,
      t,
    });
  },
};
