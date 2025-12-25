<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { t } from '../i18n/index';

  // 组件挂载时添加结构化数据
  onMounted(() => {
    renderStructuredData();
  });

  // 生成404页面结构化数据
  const renderStructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t('pageNotFound'),
      description: t('pageNotFoundDescription'),
      url: window.location.href,
      isPartOf: {
        '@type': 'WebSite',
        name: t('websiteName'),
        url: window.location.origin,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    // 创建并添加结构化数据脚本
    const script = document.createElement('script');
    script.id = '404-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };

  // 返回首页按钮点击事件
  const router = useRouter();
  const goHome = () => {
    router.push('/');
  };

  // 搜索功能
  const searchQuery = ref('');

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      // 这里可以添加搜索逻辑，暂时跳转到首页
      router.push('/');
    }
  };

  // 热门测试推荐
  const popularTests = computed(() => [
    { name: t('clickTest'), path: '/click-test/1' },
    { name: t('simpleReactionTest'), path: '/reaction-time-test' },
    { name: t('typingTest'), path: '/typing-test/1' },
    { name: t('spaceClickTest'), path: '/space-click-test/1' },
    { name: t('kohiClickTest'), path: '/kohi-click-test' },
    { name: t('colorReactionTest'), path: '/color-reaction-test' },
  ]);

  const navigateToTest = (path: string) => {
    router.push(path);
  };
</script>

<template>
  <div class="not-found-container">
    <h1 class="not-found-title">404</h1>
    <h2 class="not-found-subtitle">{{ t('pageNotFound') }}</h2>
    <p class="not-found-description">{{ t('pageNotFoundDescription') }}</p>
    <button class="go-home-btn" @click="goHome">{{ t('goHome') }}</button>

    <!-- 搜索功能 -->
    <div class="search-section" role="search" :aria-label="t('searchTest')">
      <h3 id="search-title" class="section-title">{{ t('searchTest') }}</h3>
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="t('searchPlaceholder')"
          aria-labelledby="search-title"
          aria-describedby="search-desc"
          autofocus
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" :aria-label="t('search')" @click="handleSearch">
          <span class="search-text">{{ t('search') }}</span>
        </button>
      </div>
      <p id="search-desc" class="sr-only">{{ t('searchDescription') }}</p>
    </div>

    <!-- 热门测试推荐 -->
    <div class="popular-tests-section">
      <h3 class="section-title">{{ t('popularTests') }}</h3>
      <div class="popular-tests-grid">
        <button
          v-for="(test, index) in popularTests"
          :key="index"
          class="test-card"
          @click="navigateToTest(test.path)"
        >
          {{ test.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .not-found-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 120px);
    text-align: center;
    padding: 20px;
    color: #ffffff;
  }

  .not-found-title {
    font-size: 120px;
    font-weight: bold;
    margin: 0;
    color: #4caf50;
    text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
  }

  .not-found-subtitle {
    font-size: 36px;
    margin: 10px 0;
    color: #cccccc;
  }

  .not-found-description {
    font-size: 18px;
    margin: 20px 0 40px;
    color: #888888;
    max-width: 500px;
    line-height: 1.6;
  }

  .go-home-btn {
    padding: 12px 30px;
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    background-color: #4caf50;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    position: relative;
    overflow: hidden;
  }

  .go-home-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }

  .go-home-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    background-color: #3d8b40;
    transition: all 0.1s ease;
  }

  .go-home-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }

  /* 搜索功能样式 */
  .search-section {
    margin-top: 50px;
    width: 100%;
    max-width: 600px;
  }

  .section-title {
    font-size: 24px;
    color: #4caf50;
    margin-bottom: 20px;
  }

  .search-container {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .search-input {
    flex: 1;
    padding: 12px 15px;
    font-size: 16px;
    border: 2px solid #333;
    border-radius: 8px;
    background-color: #2a2a2a;
    color: white;
    outline: none;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  .search-btn {
    padding: 12px 25px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background-color: #4caf50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }

  .search-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }

  .search-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    background-color: #3d8b40;
    transition: all 0.1s ease;
  }

  .search-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }

  /* 屏幕阅读器专用样式 */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* 热门测试推荐样式 */
  .popular-tests-section {
    margin-top: 40px;
    width: 100%;
    max-width: 800px;
  }

  .popular-tests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    width: 100%;
  }

  .test-card {
    /* 基础样式 */
    padding: 20px 25px;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
    background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
    border: 2px solid #333;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    position: relative;
    overflow: hidden;
    /* 提升视觉层次 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    /* 确保文本可读性 */
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  /* 悬停效果 */
  .test-card:hover {
    /* 背景色变化 */
    background: linear-gradient(135deg, #333 0%, #2a2a2a 100%);
    /* 边框颜色变化 */
    border-color: #4caf50;
    /* 轻微上浮效果 */
    transform: translateY(-3px);
    /* 增强阴影 */
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
    /* 边框发光效果 */
    box-shadow:
      0 8px 25px rgba(76, 175, 80, 0.4),
      0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  /* 点击效果 */
  .test-card:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    transition: all 0.1s ease;
  }

  /* 焦点样式 - 提升可访问性 */
  .test-card:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
  }

  /* 添加装饰元素 - 增强视觉吸引力 */
  .test-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.1), transparent);
    transition: all 0.5s ease;
  }

  .test-card:hover::before {
    left: 100%;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .not-found-title {
      font-size: 80px;
    }

    .not-found-subtitle {
      font-size: 24px;
    }

    .not-found-description {
      font-size: 16px;
      padding: 0 20px;
    }

    .go-home-btn {
      padding: 10px 25px;
      font-size: 16px;
    }

    .search-section,
    .popular-tests-section {
      margin-top: 30px;
      padding: 0 20px;
    }

    .section-title {
      font-size: 20px;
    }

    .search-container {
      flex-direction: column;
    }

    .popular-tests-grid {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 15px;
    }

    .test-card {
      padding: 16px 20px;
      font-size: 15px;
    }
  }

  /* 小屏设备优化 */
  @media (max-width: 480px) {
    .popular-tests-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .test-card {
      padding: 14px 16px;
      font-size: 14px;
    }
  }
</style>
