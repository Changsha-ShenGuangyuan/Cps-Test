<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { t, setLanguage, langState } from '../i18n/index';
  import ResponsiveImage from './ResponsiveImage.vue';

  // 路由实例
  const router = useRouter();

  // 语言选择相关
  const languages = [
    { code: 'en', name: 'ENGLISH', flag: new URL('@/assets/flags/um.png', import.meta.url).href },
    {
      code: 'zh-CN',
      name: '简体中文',
      flag: new URL('@/assets/flags/cn.png', import.meta.url).href,
    },
    { code: 'ja', name: '日本語', flag: new URL('@/assets/flags/jp.png', import.meta.url).href },
    { code: 'ko', name: '한국어', flag: new URL('@/assets/flags/kr.png', import.meta.url).href },
  ];

  // 检测设备类型
  const isTouchDevice = ref('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // 移动端语言菜单触摸处理
  const onLanguageTouch = (e: TouchEvent) => {
    e.stopPropagation();
    if (e.cancelable) {
      e.preventDefault(); // 阻止后续的click事件触发，避免状态切换两次
    }
    toggleLanguageMenu(e);
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

  // 用于存储延迟隐藏的定时器
  let hideTimeout: number | null = null;

  // 切换语言菜单显示状态
  const toggleLanguageMenu = (e?: MouseEvent | TouchEvent) => {
    e?.stopPropagation();

    // 直接切换菜单状态，不使用nextTick，避免状态更新延迟导致的逻辑混乱
    isLanguageMenuOpen.value = !isLanguageMenuOpen.value;
  };

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

  // 切换语言 - 使用路径跳转实现
  const switchLanguage = (languageCode: string) => {
    // 设置语言状态
    setLanguage(languageCode);

    // 清除可能存在的延迟隐藏定时器，确保菜单能立即关闭
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // 选择语言后立即关闭语言菜单
    isLanguageMenuOpen.value = false;

    // 获取当前路径，去除语言前缀
    const currentPath = router.currentRoute.value.path;
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
    router.push(newPath);
  };

  // 关闭菜单
  const closeMenu = () => {
    isLanguageMenuOpen.value = false;
  };

  // 暴露方法给父组件
  defineExpose({
    closeMenu
  });
</script>

<template>
  <div
    class="selector-base language-selector"
    :class="{
      'mobile-open': isLanguageMenuOpen,
      'mobile-active': isTouchDevice && isLanguageMenuOpen,
      active: isLanguageMenuOpen,
      'show-content': isLanguageMenuOpen,
    }"
    @touchstart="onLanguageTouch($event)"
    @mouseenter="showLanguageMenu"
    @mouseleave="hideLanguageMenu"
    @click.stop.prevent="toggleLanguageMenu"
  >
    <ResponsiveImage
      :src="currentLanguageFlag"
      :alt="currentLanguageName"
      class-name="language-image"
      :lazy="false"
      :priority="true"
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
        <ResponsiveImage
          :src="lang.flag"
          :alt="lang.name"
          class-name="flag-icon"
          :width="20"
          :height="15"
          :lazy="true"
          :priority="false"
        />
        <span class="language-name">{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* 语言选择器样式 */
  .language-selector {
    position: relative;
    margin-right: 16px;
  }

  .language-image {
    cursor: pointer;
    border-radius: 4px;
  }

  .language-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background-color: #1a1a1a;
    border: 1px solid #333333;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    min-width: 160px;
    z-index: 1000;
    overflow: hidden;
  }

  .language-option {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    color: #ffffff;
  }

  .language-option:hover {
    background-color: #2a2a2a;
  }

  .language-option.active {
    background-color: transparent;
    color: #4caf50;
  }

  .flag-icon {
    margin-right: 8px;
    border-radius: 2px;
  }

  .language-name {
    font-size: 14px;
    font-weight: 500;
  }

  /* 移动端样式 */
  @media (max-width: 768px) {
    .language-selector {
      margin-right: 12px;
    }

    .language-dropdown {
      right: -10px;
      min-width: 140px;
    }

    .language-option {
      padding: 8px 12px;
    }

    .language-name {
      font-size: 13px;
    }
  }
</style>