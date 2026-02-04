<template>
  <div class="home-container">
    <!-- 5秒空格速度测试 -->
    <section class="space-test-section">
      <div class="game-container">
        <div class="main-content">
          <!-- 左侧游戏区域 -->
          <div class="game-area">
            <h1 class="game-title" :key="localeKey">Spacebar clicker - {{ gameTitle }}</h1>

            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card timer-card">
                <div class="stat-value">
                  {{
                    !gameState.isPlaying && gameState.clicks === 0
                      ? 0
                      : gameState.elapsedTime.toFixed(3)
                  }}
                </div>
                <div class="stat-label">{{ t('time') }}</div>
              </div>
              <div class="stat-card click-rate-card">
                <div class="stat-value">
                  {{ !gameState.isPlaying && gameState.clicks === 0 ? 0 : currentCps.toFixed(2) }}
                </div>
                <div class="stat-label">{{ t('clicksPerSecond') }}</div>
              </div>
              <div class="stat-card score-card">
                <div class="stat-value">{{ gameState.clicks }}</div>
                <div class="stat-label">{{ t('score') }}</div>
              </div>
            </div>

            <!-- 点击区域 -->
            <div
              class="click-area"
              :class="{
                playing: gameState.isPlaying,
                'space-pressed': gameState.isSpacePressed,
              }"
            >
              <!-- 游戏进行中显示 -->
              <div v-if="gameState.isPlaying" class="playing-content">
                <!-- 空格键图标 -->
                <div class="spacebar-icon">
                  <div
                    class="spacebar-key"
                    :class="{ 'space-pressed': gameState.isSpacePressed }"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    @touchcancel="handleTouchEnd"
                  >
                    {{ t('spaceBar') }}
                  </div>
                </div>

                <!-- 提示文字 -->
                <div v-if="gameState.showPressHint" class="hints">{{ t('holdSpaceBar') }}</div>
              </div>

              <!-- 游戏准备就绪显示 -->
              <div v-else-if="gameState.isGameReady" class="ready-content">
                <!-- 提示文字 -->
                <div class="ready-text">{{ t('gettingReady') }}</div>

                <!-- 空格键图标 -->
                <div class="spacebar-icon">
                  <div
                    class="spacebar-key"
                    :class="{ 'space-pressed': gameState.isSpacePressed }"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    @touchcancel="handleTouchEnd"
                  >
                    {{ t('spaceBar') }}
                  </div>
                </div>

                <!-- 提示文字 -->
                <div class="hints">{{ t('pressSpaceToStart') }}</div>
              </div>

              <!-- 初始状态显示 -->
              <div v-else class="start-content">
                <!-- 空格键图标 -->
                <div class="spacebar-icon">
                  <div
                    class="spacebar-key"
                    :class="{ 'space-pressed': gameState.isSpacePressed }"
                    style="cursor: pointer"
                    @click="handleSpacebarClick"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    @touchcancel="handleTouchEnd"
                  >
                    {{ t('spaceBar') }}
                  </div>
                  <div class="spacebar-hint">{{ t('clickSpaceToStart') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间选择区域 -->
      <div class="time-select-section">
        <h2 class="time-select-title">{{ t('selectTime') }}</h2>
        <div class="time-select-list">
          <button
            v-for="time in supportedTimes"
            :key="time"
            class="time-select-item"
            :class="{ active: time === selectedTime }"
            @click="
              selectedTime = time;
              navigateTo('/space-click-test/' + time);
            "
          >
            {{ time }} <span>{{ t('secondsTest') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 结果弹窗组件 -->
    <component
      :is="ResultModal"
      :visible="gameState.showResultModal"
      :type="'space'"
      :cps="gameState.cps"
      :time="testDuration"
      @close="resetGame"
    />

    <!-- 快速开始区域 -->
    <section v-if="!isMobile || isQuickStartVisible" class="quick-start-section">
      <div class="quick-start-buttons">
        <button
          v-for="(button, index) in quickStartButtons"
          :key="index"
          :class="['start-btn', button.type]"
          @click="navigateTo(button.path)"
        >
          <span class="btn-text">{{ t(button.text) }}</span>
        </button>
      </div>
    </section>

    <!-- 点击技巧展示区域 -->
    <section v-if="!isMobile || isClickTypesVisible" class="click-types-section">
      <div class="container">
        <h2 class="section-title">{{ t('clickTypes') }}</h2>
        <div class="click-types-grid">
          <div class="click-type-item butterfly">
            <h3 class="click-type-title">{{ t('butterflyClick') }}</h3>
            <p class="click-type-description">{{ t('butterflyClickDesc') }}</p>
          </div>
          <div class="click-type-item jitter">
            <h3 class="click-type-title">{{ t('jitterClick') }}</h3>
            <p class="click-type-description">{{ t('jitterClickDesc') }}</p>
          </div>
          <div class="click-type-item drag">
            <h3 class="click-type-title">{{ t('dragClick') }}</h3>
            <p class="click-type-description">{{ t('dragClickDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ区域 -->
    <section v-if="!isMobile || isFaqVisible" id="faq" class="faq-section">
      <div class="faq-container">
        <article v-for="(item, index) in faqItems" :key="index" class="faq-item">
          <h3 class="faq-question">{{ t(item.question) }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t(item.answer))"></p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';

  import { t, langState } from '../i18n/index';
  // 懒加载结果弹窗组件 - 优化版本
  import { defineAsyncComponent } from 'vue';
  const ResultModal = defineAsyncComponent({
    loader: () => import('./ResultModal.vue'),
    delay: 0, // 立即开始加载，不延迟
    timeout: 5000, // 增加超时时间
    suspensible: false, // 避免Suspense相关性能问题
  });

  // 优化LCP：预计算游戏标题，减少h1渲染延迟
  const gameTitle = ref('5 Second Space Test');
  const localeKey = ref(langState.current);

  // 监听语言变化，更新标题
  watch(() => langState.current, (newLang) => {
    localeKey.value = newLang;
    // 延迟更新游戏标题，避免阻塞初始渲染
    setTimeout(() => {
      gameTitle.value = t('fiveSecondSpaceTest');
    }, 0);
  }, { immediate: false });

  // 预加载ResultModal组件（当用户接近可能触发结果的区域时）
  let resultModalPreloaded = false;
  const preloadResultModal = () => {
    if (ResultModal && !resultModalPreloaded) {
      resultModalPreloaded = true;
      // 触发预加载
      import('./ResultModal.vue').catch(() => {});
    }
  };

  const router = useRouter();

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 直接使用已导入的 t 函数获取当前语言
    // 避免重复导入 i18n 模块，提高性能
    let fullPath = path;
    import('../i18n/index').then((i18n) => {
      if (i18n.langState.current !== 'en') {
        // 确保路径以斜杠开头
        const basePath = path.startsWith('/') ? path : `/${path}`;
        fullPath = `/${i18n.langState.current}${basePath}`;
      }
      router.push(fullPath);
    });
  };

  // 缓存关键词正则表达式，避免重复创建
  const keywordRegexCache = new Map();
  // 缓存格式化答案结果，避免重复计算
  const formattedAnswerCache = new Map();

  // 需要突出显示的关键词列表
  const keywords = [
    'CPS Test',
    '点击速度测试',
    'Clicks Per Second',
    '蝴蝶点击',
    '抖动点击',
    '拖动点击',
    '高精度计时',
    'performance.now()',
    '防作弊机制',
    '爆发力',
    '耐力',
    '肌肉记忆',
    '高回报率鼠标',
    '1000Hz',
    '1秒',
    '5秒',
    '10秒',
    '15秒',
    '30秒',
    '60秒',
    '移动端',
    '桌面端',
    '本地存储',
    'Minecraft',
    'CS:GO',
    '反应速度',
    '手眼协调',
    '策略意识',
    '人体工学',
    'PvP能力',
    '电竞领域',
    'AI分析',
  ];

  // 预创建所有关键词的正则表达式
  keywords.forEach((keyword) => {
    if (!keywordRegexCache.has(keyword)) {
      const regex = new RegExp(`(${keyword})`, 'gi');
      keywordRegexCache.set(keyword, regex);
    }
  });

  // 格式化答案，将换行符转换为<br>标签，并将关键词替换为绿色样式
  const formatAnswer = (answer: string) => {
    // 检查缓存中是否已有格式化结果
    if (formattedAnswerCache.has(answer)) {
      return formattedAnswerCache.get(answer);
    }

    // 将答案转换为HTML，替换换行符
    let htmlAnswer = answer.replace(/\n/g, '<br>');

    // 替换关键词为绿色样式
    keywords.forEach((keyword) => {
      // 从缓存中获取正则表达式
      const regex = keywordRegexCache.get(keyword);
      if (regex) {
        // 替换为带有绿色样式的span标签
        htmlAnswer = htmlAnswer.replace(
          regex,
          '<span style="color: #4CAF50; font-weight: 500;">$1</span>'
        );
      }
    });

    // 缓存格式化结果
    formattedAnswerCache.set(answer, htmlAnswer);

    return htmlAnswer;
  };

  // 支持的测试时间数组 - 静态数据，不需要响应式
  const supportedTimes = [1, 5, 10, 15, 30, 60];
  // 当前选中的时间
  const selectedTime = ref(5);

  // 快速开始按钮数据数组 - 静态数据，不需要响应式
  const quickStartButtons = [
    { path: '/click-test/1', text: 'clickTest', type: 'click-test' },
    { path: '/reaction-time-test', text: 'simpleReactionTest', type: 'reaction-test' },
    { path: '/typing-test/1', text: 'typingTest', type: 'typing-test' },
    { path: '/space-click-test/1', text: 'spaceClickTest', type: 'space-test' },
    { path: '/kohi-click-test', text: 'kohiClickTest', type: 'kohi-test' },
    { path: '/color-reaction-test', text: 'colorReactionTest', type: 'color-test' },
    { path: '/key-reaction-test', text: 'keyReactionTest', type: 'key-test' },
    { path: '/target-elimination-game', text: 'targetEliminationGame', type: 'target-test' },
    { path: '/mouse-scroll-test', text: 'mouseScrollTest', type: 'scroll-test' },
    { path: '/mouse-drag-test', text: 'mouseDragTest', type: 'drag-test' },
    { path: '/keyboard-test', text: 'keyboardTest', type: 'keyboard-test' },
  ];

  // 5秒空格速度测试相关变量
  const gameState = ref({
    isPlaying: false,
    isGameReady: false,
    isGameOver: false,
    showPressHint: true,
    clicks: 0,
    cps: 0,
    elapsedTime: 0,
    isSpacePressed: false,
    showResultModal: false,
  });
  let startTime = 0; // 不需要响应式，仅用于游戏逻辑
  let rafId: number | null = null; // 存储requestAnimationFrame的ID
  const testDuration = 5; // 5秒测试 - 常量，不需要响应式

  // 上一次计算的CPS值
  let lastCpsValue = 0;
  // 上一次计算的时间戳
  let lastCpsCalcTime = 0;
  // CPS计算节流间隔（毫秒）
  const cpsCalcInterval = 100;

  // 实时计算当前CPS，添加节流优化
  const currentCps = computed(() => {
    // 游戏结束时，显示最终CPS值
    if (gameState.value.isGameOver) {
      return gameState.value.cps;
    }

    // 游戏未开始或无点击则返回0
    if (!gameState.value.isPlaying || gameState.value.clicks === 0) return 0;

    // 避免除以0或极小值导致的Infinity
    if (gameState.value.elapsedTime < 0.1) return 0;

    // 获取当前时间戳
    const now = Date.now();

    // 节流处理：限制计算频率
    if (now - lastCpsCalcTime < cpsCalcInterval) {
      return lastCpsValue;
    }

    // 计算CPS并保留2位小数
    const cpsValue = Math.round((gameState.value.clicks / gameState.value.elapsedTime) * 100) / 100;

    // 更新缓存值和时间戳
    lastCpsValue = cpsValue;
    lastCpsCalcTime = now;

    return cpsValue;
  });

  // 点击空格键按钮处理函数
  const handleSpacebarClick = () => {
    // 标记游戏准备就绪
    gameState.value.isGameReady = true;
    // 重新显示提示
    gameState.value.showPressHint = true;
  };

  // 游戏循环函数 - 使用requestAnimationFrame
  const gameLoop = () => {
    // 计算并更新已用时间（秒）
    const elapsed = (Date.now() - startTime) / 1000;
    gameState.value.elapsedTime = Math.min(elapsed, testDuration);

    // 检查时间是否结束
    if (elapsed >= testDuration) {
      endGame();
    } else {
      // 继续下一帧
      rafId = requestAnimationFrame(gameLoop);
    }
  };

  // 游戏开始函数
  const startGame = () => {
    if (gameState.value.isPlaying) return; // 防止重复开始

    // 重置游戏状态
    gameState.value.clicks = 0;
    startTime = Date.now(); // 记录开始时间
    gameState.value.isPlaying = true;
    gameState.value.isGameOver = false; // 确保游戏未结束
    gameState.value.elapsedTime = 0; // 重置已用时间

    // 使用requestAnimationFrame开始游戏循环
    rafId = requestAnimationFrame(gameLoop);
  };

  // 游戏结束函数
  const endGame = () => {
    gameState.value.isPlaying = false; // 标记游戏结束
    gameState.value.isGameOver = true; // 设置最终结束状态

    // 计算最终CPS，使用规定的测试时间
    gameState.value.cps =
      testDuration > 0 ? Math.round((gameState.value.clicks / testDuration) * 100) / 100 : 0;

    // 确保已用时间显示为规定的测试时间
    gameState.value.elapsedTime = testDuration;

    // 清除requestAnimationFrame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // 显示结果弹窗
    gameState.value.showResultModal = true;
  };

  // 重置游戏函数
  const resetGame = () => {
    // 重置所有游戏状态，回到初始状态
    gameState.value.isPlaying = false;
    gameState.value.isGameReady = false; // 重置准备状态，需要重新点击空格键
    gameState.value.isGameOver = false;
    gameState.value.isSpacePressed = false; // 重置空格键按下状态
    gameState.value.clicks = 0;
    gameState.value.cps = 0;
    gameState.value.elapsedTime = 0;
    gameState.value.showPressHint = true; // 重置提示显示
    gameState.value.showResultModal = false; // 关闭结果弹窗

    // 清除requestAnimationFrame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  // 通用的空格键按下处理逻辑
  const handleKeyDown = () => {
    // 游戏结束，不处理点击事件
    if (gameState.value.isGameOver) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!gameState.value.isGameReady) {
      return;
    }

    // 如果已经按下，不再处理
    if (gameState.value.isSpacePressed) {
      return;
    }

    // 标记空格键已按下
    gameState.value.isSpacePressed = true;

    // 隐藏提示
    gameState.value.showPressHint = false;

    // 游戏未开始，开始游戏
    if (!gameState.value.isPlaying) {
      startGame();
    }
  };

  // 通用的空格键释放处理逻辑
  const handleKeyUp = () => {
    // 游戏结束，不处理点击事件
    if (gameState.value.isGameOver) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!gameState.value.isGameReady) {
      return;
    }

    // 标记空格键已释放
    gameState.value.isSpacePressed = false;

    // 更新点击次数（游戏进行中）
    if (gameState.value.isPlaying) {
      gameState.value.clicks++;
    }
  };

  // 空格键按下处理函数
  const handleSpaceDown = (event: KeyboardEvent) => {
    // 只处理空格键
    if (event.code !== 'Space') return;

    // 阻止空格的默认行为（防止页面滚动）
    event.preventDefault();

    handleKeyDown();
  };

  // 空格键释放处理函数
  const handleSpaceUp = (event: KeyboardEvent) => {
    // 只处理空格键
    if (event.code !== 'Space') return;

    // 阻止空格的默认行为（防止页面滚动）
    event.preventDefault();

    handleKeyUp();
  };

  // 触摸开始处理函数 - 模拟空格键按下
  const handleTouchStart = (event: TouchEvent) => {
    // 只有当事件可取消时才调用preventDefault()
    if (event.cancelable) {
      event.preventDefault();
    }

    // 游戏结束，不处理点击事件
    if (gameState.value.isGameOver) {
      return;
    }

    // 如果已经按下，不再处理
    if (gameState.value.isSpacePressed) {
      return;
    }

    // 标记空格键已按下
    gameState.value.isSpacePressed = true;

    // 隐藏提示
    gameState.value.showPressHint = false;

    // 游戏未准备就绪，先设置为准备就绪状态
    if (!gameState.value.isGameReady) {
      gameState.value.isGameReady = true;
      return;
    }

    // 游戏未开始，开始游戏
    if (!gameState.value.isPlaying) {
      startGame();
    }
  };

  // 触摸结束处理函数 - 模拟空格键释放
  const handleTouchEnd = (event: TouchEvent) => {
    // 只有当事件可取消时才调用preventDefault()
    if (event.cancelable) {
      event.preventDefault();
    }

    handleKeyUp();
  };

  // 窗口大小变化处理函数
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
  };

  // 设备检测变量
  const isMobile = ref(false);

  // 处理滚动事件，预加载ResultModal
  const handleScroll = () => {
    // 当用户滚动到页面20%或更多时预加载
    if (window.scrollY > window.innerHeight * 0.2) {
      preloadResultModal();
      // 移除监听器，避免重复触发
      window.removeEventListener('scroll', handleScroll);
    }
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    // 立即更新游戏标题，确保h1快速渲染
    gameTitle.value = t('fiveSecondSpaceTest');

    // 检测设备类型 - 关键操作，立即执行
    isMobile.value = window.innerWidth <= 768;

    // 监听键盘事件 - 关键操作，立即执行
    window.addEventListener('keydown', handleSpaceDown);
    window.addEventListener('keyup', handleSpaceUp);

    // 延迟执行其他非关键操作，避免阻塞初始渲染
    setTimeout(() => {
      // 监听窗口 resize 事件
      window.addEventListener('resize', handleResize);

      // 执行非关键操作
      if (typeof requestIdleCallback === 'function') {
        // 使用 requestIdleCallback 延迟执行
        requestIdleCallback(() => {
          renderFeatureStructuredData();
          renderGuideStructuredData();
          setupIntersectionObservers();
        });
      } else {
        // 降级方案：使用 setTimeout 延迟执行
        setTimeout(() => {
          renderFeatureStructuredData();
          renderGuideStructuredData();
          setupIntersectionObservers();
        }, 100);
      }
    }, 0);

    // 首屏加载完成后（3秒后）再添加滚动监听器和预加载
    setTimeout(() => {
      // 监听滚动事件，用于预加载
      window.addEventListener('scroll', handleScroll);
      
      // 测试开始按钮点击时预加载
      const startButtons = document.querySelectorAll('.start-test-btn');
      startButtons.forEach(button => {
        button.addEventListener('click', preloadResultModal);
      });
    }, 3000);
  });

  // 按需渲染相关变量
  const isFaqVisible = ref(false);
  const isClickTypesVisible = ref(false);
  const isQuickStartVisible = ref(false);
  let faqObserver: IntersectionObserver | null = null;
  let clickTypesObserver: IntersectionObserver | null = null;
  let quickStartObserver: IntersectionObserver | null = null;

  // FAQ 数据数组
  const faqItems = [
    { question: 'homeFaqQ1', answer: 'homeFaqA1' },
    { question: 'homeFaqQ2', answer: 'homeFaqA2' },
    { question: 'homeFaqQ3', answer: 'homeFaqA3' },
    { question: 'homeFaqQ9', answer: 'homeFaqA9' },
    { question: 'homeFaqQ11', answer: 'homeFaqA11' },
    { question: 'homeFaqQ12', answer: 'homeFaqA12' },
    { question: 'kohiFaqQ1', answer: 'kohiFaqA1' },
  ];

  // 实现按需渲染功能，优化Intersection Observer配置
  const setupIntersectionObservers = () => {
    // 检查浏览器是否支持 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 如果不支持，直接显示所有内容
      isFaqVisible.value = true;
      isClickTypesVisible.value = true;
      isQuickStartVisible.value = true;
      return;
    }

    // 通用的交叉观察回调函数
    const observerCallback = (visibleRef: any, observer: IntersectionObserver | null) => {
      return (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleRef.value = true;
            // 停止观察，因为内容已经渲染
            if (observer) {
              observer.unobserve(entry.target);
            }
          }
        });
      };
    };

    // 优化的观察选项
    const observerOptions = {
      threshold: 0.05, // 当元素5%进入视口时触发，提高灵敏度
      rootMargin: '100px 0px', // 提前100px开始观察，更好的预加载效果
      root: null, // 使用默认根元素（视口）
    };

    // FAQ区域观察者
    faqObserver = new IntersectionObserver(
      observerCallback(isFaqVisible, faqObserver),
      observerOptions
    );

    // 点击技巧区域观察者
    clickTypesObserver = new IntersectionObserver(
      observerCallback(isClickTypesVisible, clickTypesObserver),
      observerOptions
    );

    // 快速开始区域观察者
    quickStartObserver = new IntersectionObserver(
      observerCallback(isQuickStartVisible, quickStartObserver),
      observerOptions
    );

    // 观察目标元素
    const faqElement = document.getElementById('faq');
    const clickTypesElement = document.querySelector('.click-types-section');
    const quickStartElement = document.querySelector('.quick-start-section');

    if (faqElement) {
      faqObserver.observe(faqElement);
    } else {
      // 如果找不到元素，直接显示内容
      isFaqVisible.value = true;
    }

    if (clickTypesElement) {
      clickTypesObserver.observe(clickTypesElement);
    } else {
      // 如果找不到元素，直接显示内容
      isClickTypesVisible.value = true;
    }

    if (quickStartElement) {
      quickStartObserver.observe(quickStartElement);
    } else {
      // 如果找不到元素，直接显示内容
      isQuickStartVisible.value = true;
    }
  };

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    const existingFeatureData = document.getElementById('feature-structured-data');
    if (existingFeatureData) {
      existingFeatureData.remove();
    }

    const existingGuideData = document.getElementById('guide-structured-data');
    if (existingGuideData) {
      existingGuideData.remove();
    }

    window.removeEventListener('keydown', handleSpaceDown);
    window.removeEventListener('keyup', handleSpaceUp);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);

    // 清理观察者
    if (faqObserver) {
      faqObserver.disconnect();
      faqObserver = null;
    }
    if (clickTypesObserver) {
      clickTypesObserver.disconnect();
      clickTypesObserver = null;
    }
    if (quickStartObserver) {
      quickStartObserver.disconnect();
      quickStartObserver = null;
    }

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  // 通用结构化数据生成函数 - 优化DOM操作
  const renderStructuredData = (id: string, data: any) => {
    // 使用try-catch包装，避免DOM操作失败影响整体功能
    try {
      // 检查是否已存在结构化数据元素
      let structuredDataElement: HTMLScriptElement | null = document.getElementById(
        id
      ) as HTMLScriptElement | null;
      if (!structuredDataElement) {
        // 创建新元素
        structuredDataElement = document.createElement('script');
        structuredDataElement.id = id;
        structuredDataElement.type = 'application/ld+json';
        // 使用appendChild添加到head
        document.head.appendChild(structuredDataElement);
      }

      // 优化JSON字符串化，使用更高效的方式处理数据
      // 预检查数据结构，避免复杂的replacer函数
      structuredDataElement.textContent = JSON.stringify(data);
    } catch (error) {
      // 静默处理错误，避免影响其他功能
      console.warn('Failed to render structured data:', error);
    }
  };

  // 生成功能特性结构化数据
  const renderFeatureStructuredData = () => {
    // 创建结构化数据
    const featureStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('multipleTestTypes'),
          description: t('multipleTestTypesDesc'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('realTimeStats'),
          description: t('realTimeStatsDesc'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: t('historyRecords'),
          description: t('historyRecordsDesc'),
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: t('gamifiedExperience'),
          description: t('gamifiedExperienceDesc'),
        },
      ],
    };

    renderStructuredData('feature-structured-data', featureStructuredData);
  };

  // 生成测试指南结构化数据
  const renderGuideStructuredData = () => {
    // 创建HowTo结构化数据
    const guideStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: t('testGuide'),
      description: t('testGuideDescription'),
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: t('selectTestType'),
          text: t('selectTestTypeDesc'),
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: t('startTest'),
          text: t('startTestDesc'),
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: t('viewResults'),
          text: t('viewResultsDesc'),
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: t('practiceContinuously'),
          text: t('practiceContinuouslyDesc'),
        },
      ],
    };

    renderStructuredData('guide-structured-data', guideStructuredData);
  };
</script>

<style scoped>
  /* 首页主容器样式 */
  .home-container {
    max-width: 1200px; /* 最大宽度，确保内容居中 */
    margin: 0 auto; /* 水平居中 */
    padding: 20px; /* 内边距 */
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 5秒空格速度测试样式 */
  .space-test-section {
    background: linear-gradient(135deg, #000000 0%, #000000 100%);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* 游戏容器 */
  .game-container {
    margin: 0 auto;
    text-align: center;
    padding: clamp(5px, 1vw, 10px);
    background-color: transparent;
    box-shadow: none;
    width: 100%;
    border-radius: 10px;
    box-sizing: border-box;
  }

  /* 主内容区域 - 左侧游戏 + 右侧时间选择 */
  .main-content {
    display: flex;
    gap: clamp(10px, 2vw, 20px);
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }

  /* 时间选择区域 */
  .time-select-section {
    padding: 15px 10px 0;
    text-align: center;
    margin-top: -180px;
  }

  /* 时间选择标题 */
  .time-select-title {
    color: #4caf50;
    font-size: clamp(18px, 4vw, 20px);
    font-weight: bold;
    margin-bottom: clamp(16px, 3vw, 20px);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 时间选择列表 - 横向排列 */
  .time-select-list {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    gap: clamp(8px, 1.5vw, 15px);
    margin: 0 auto;
    width: 100%;
  }

  /* 响应式调整：在小屏幕上允许换行 */
  @media (max-width: 768px) {
    .time-select-list {
      flex-wrap: wrap;
    }
  }

  /* 时间选择项 */
  .time-select-item {
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
    border: none;
    border-radius: 8px;
    padding: clamp(10px, 3vw, 15px) clamp(12px, 4vw, 20px);
    color: #ffffff;
    font-size: clamp(13px, 3vw, 16px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    outline: none;
    min-width: 80px;
  }

  /* 时间选择项悬停效果 */
  .time-select-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
    background: linear-gradient(145deg, #4caf50, #45a049);
    color: #ffffff;
  }

  /* 时间选择项激活状态 */
  .time-select-item.active {
    background: linear-gradient(145deg, #4caf50, #45a049);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
    color: #ffffff;
  }

  /* 时间选择项焦点状态 */
  .time-select-item:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }

  /* 时间选择项点击状态 */
  .time-select-item:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* 桌面端布局 */
  @media (min-width: 1200px) {
    .main-content {
      flex-wrap: nowrap;
    }

    .game-area {
      flex: 1;
    }
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .time-select-section {
      padding: 10px;
      margin-bottom: 10px;
      margin-top: -300px;
    }

    /* 时间选择列表横向排列，缩小样式 */
    .time-select-list {
      gap: clamp(6px, 1.5vw, 10px);
    }

    .time-select-item {
      padding: clamp(8px, 2vw, 12px) clamp(10px, 3vw, 16px);
      font-size: clamp(12px, 2.5vw, 14px);
      min-width: 70px;
    }
  }

  /* 游戏区域 */
  .game-area {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 clamp(10px, 2vw, 20px) 0;
    font-size: clamp(20px, 4vw, 26px);
    font-weight: bold;
    text-align: center;
    margin-top: 0;
    word-wrap: break-word;
    white-space: normal;
    line-height: 1.2;
  }

  /* 统计卡片 */
  .stats-cards {
    display: flex;
    justify-content: center;
    margin: clamp(15px, 3vw, 25px) auto;
    max-width: 900px;
    width: 95%;
    background-color: #333;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    border: 2px solid #444;
  }

  .stat-card {
    flex: 1;
    min-width: clamp(80px, 22vw, 160px);
    padding: clamp(12px, 2.5vw, 18px) clamp(8px, 1.5vw, 12px);
    color: white;
    font-weight: bold;
    text-align: center;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .timer-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .click-rate-card {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  }

  .score-card {
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  }

  .stat-value {
    font-size: clamp(20px, 3.5vw, 30px);
    margin-bottom: 4px;
    line-height: 1;
    font-weight: 800;
    white-space: nowrap;
    overflow: visible;
    text-align: center;
  }

  .stat-label {
    font-size: clamp(12px, 1.6vw, 14px);
    opacity: 0.95;
    line-height: 1;
    font-weight: 500;
    text-align: center;
  }

  /* 中等屏幕布局优化 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .stats-cards {
      width: 98%;
    }

    .stat-card {
      min-width: clamp(70px, 18vw, 140px);
      padding: 10px 6px;
    }

    .stat-value {
      font-size: clamp(18px, 3vw, 26px);
    }

    .stat-label {
      font-size: clamp(11px, 1.3vw, 13px);
    }
  }

  /* 小屏幕布局优化 */
  @media (max-width: 768px) {
    .stat-value {
      font-size: clamp(16px, 3vw, 22px);
    }

    .stat-label {
      font-size: clamp(11px, 1.3vw, 13px);
    }
  }

  /* 点击区域 */
  .click-area {
    width: 100%;
    height: clamp(300px, 50vh, 450px);
    background-color: #000000;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: clamp(20px, 4vw, 24px);
    font-weight: bold;
    margin: 0 auto clamp(15px, 3vw, 20px);
    border: 2px solid #333;
    position: relative;
    box-sizing: border-box;
  }

  .click-area.playing {
    background-color: #000000;
  }

  /* 空格键图标 */
  .spacebar-icon {
    margin-bottom: 20px;
    perspective: 1000px;
  }

  .spacebar-key {
    width: 300px;
    height: 60px;
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
    border: 1px solid #444;
    border-radius: 8px;
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.1s ease;
    position: relative;
    transform-style: preserve-3d;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  .spacebar-key:hover {
    transform: translateY(-2px);
    box-shadow:
      0 10px 25px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .spacebar-key:active {
    transform: translateY(0);
    box-shadow:
      0 6px 15px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    outline: none;
  }

  .spacebar-key:focus {
    outline: none;
  }

  /* 空格键按下特效 */
  .spacebar-key.space-pressed {
    transform: translateY(2px) scale(0.98);
    background: linear-gradient(145deg, #4caf50, #45a049);
    box-shadow:
      0 4px 10px rgba(76, 175, 80, 0.3),
      inset 0 2px 0 rgba(0, 0, 0, 0.2);
    border-color: #4caf50;
    color: #ffffff;
    /* 移除动画，使用简单的状态变化 */
  }

  /* 点击区域按下特效 */
  .click-area.space-pressed {
    background-color: #000000;
    border-color: #4caf50;
    box-shadow: inset 0 0 30px rgba(76, 175, 80, 0.2);
    /* 移除动画，使用简单的状态变化 */
  }

  /* 空格键提示 */
  .spacebar-hint {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 提示文字 */
  .hints {
    font-size: 16px;
    opacity: 0.6;
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 开始状态内容 */
  .start-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  /* 游戏准备就绪内容 */
  .ready-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .ready-text {
    font-size: 64px;
    font-weight: bold;
    color: #4caf50;
    margin-bottom: 30px;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  /* 游戏进行中内容 */
  .playing-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 动画优化 - 减少不必要的动画和过渡 */
    /* 简化空格键按下效果 */
    .spacebar-key.space-pressed {
      transform: translateY(2px);
      transition: none; /* 移除过渡效果，提高响应速度 */
    }

    /* 简化点击区域效果 */
    .click-area.space-pressed {
      transition: none; /* 移除过渡效果，提高响应速度 */
    }

    /* 简化按钮效果 */
    .start-btn:hover {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: none; /* 移除过渡效果，提高响应速度 */
    }

    /* 简化所有过渡效果 */
    .time-select-item,
    .start-btn,
    .click-type-item {
      transition: none; /* 移除过渡效果，提高响应速度 */
    }

    /* 主要样式优化 */
    .space-test-section {
      padding: 10px;
    }

    /* 统计卡片横向排列，缩小样式 */
    .stats-cards {
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    .stat-card {
      flex: 1;
      min-width: clamp(70px, 20vw, 80px);
      max-width: none;
      padding: clamp(6px, 2vw, 8px) clamp(8px, 2vw, 12px);
    }

    .stat-value {
      font-size: clamp(22px, 5vw, 26px);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: clamp(12px, 2vw, 14px);
    }

    /* 点击区域优化 */
    .click-area {
      height: clamp(200px, 40vh, 300px);
      font-size: clamp(18px, 4vw, 20px);
      width: clamp(95%, 98vw, 98%);
    }

    /* 空格键优化 */
    .spacebar-key {
      width: 250px;
      height: 50px;
      font-size: 16px;
    }

    /* 准备就绪文字优化 */
    .ready-text {
      font-size: 48px;
      margin-bottom: 20px;
    }

    /* 提示文字优化 - 往上移 */
    .hints {
      margin-top: 5px;
      transform: translateY(-10px);
    }

    /* 时间选择区域优化 */
    .time-select-title {
      font-size: 19px;
      margin-bottom: 18px;
    }

    .time-select-item {
      padding: 13px 18px;
      font-size: 14px;
    }

    .time-select-list {
      gap: 8px;
    }

    /* 快速开始按钮布局 */
    .quick-start-buttons {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    /* 容器内边距优化 */
    .home-container {
      padding: 10px;
    }

    /* 按钮样式优化 */
    .start-btn {
      padding: 15px 10px;
      font-size: 15px;
      min-height: 60px;
      transition: none;
    }

    .start-btn:hover {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: transparent;
    }

    /* FAQ项目优化 */
    .faq-item {
      padding: 20px 16px;
    }

    .faq-question {
      font-size: 19px;
      margin-bottom: 12px;
    }

    .faq-question:before {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    .faq-answer {
      font-size: 16px;
      margin-left: 28px;
      line-height: 1.6;
    }

    /* 点击类型区域优化 */
    .click-types-section {
      padding: 40px 15px;
      margin: 40px 0;
    }

    .click-types-section .section-title {
      font-size: 28px;
      margin-bottom: 30px;
    }

    .click-types-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .click-type-item {
      padding: 25px;
    }

    .click-type-title {
      font-size: 20px;
    }

    .click-type-description {
      font-size: 15px;
    }
  }

  /* 快速开始区域样式 */
  .quick-start-section {
    margin-bottom: 50px; /* 底部外边距 */
    text-align: center; /* 文本居中 */
  }

  /* 快速开始按钮网格布局 */
  .quick-start-buttons {
    display: grid; /* 使用CSS Grid布局 */
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); /* 自适应列数，最小列宽160px */
    gap: 15px; /* 列间距 */
  }

  /* 开始按钮基础样式 */
  .start-btn {
    padding: 18px 12px; /* 内边距 */
    border-radius: 8px; /* 圆角边框 */
    cursor: pointer; /* 鼠标悬停时显示指针 */
    transition: all 0.3s ease; /* 过渡动画 */
    border: 2px solid transparent; /* 透明边框，悬停时显示 */
    text-align: center; /* 文本居中 */
    display: flex; /* 弹性布局 */
    align-items: center; /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    color: #ffffff; /* 白色文本 */
    font-family: inherit; /* 继承父元素字体 */
    font-size: 16px; /* 字号 */
    font-weight: 600; /* 加粗文本，提高可读性 */
    position: relative; /* 相对定位，用于伪元素 */
    overflow: visible; /* 允许伪元素超出 */
  }

  /* 开始按钮聚焦样式 */
  .start-btn:focus {
    outline: none; /* 移除默认轮廓 */
  }

  /* 开始按钮基础悬停效果 */
  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* 开始按钮点击效果 */
  .start-btn:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  /* 移动端优化：移除所有过渡效果以提高响应速度 */
  @media (max-width: 768px) {
    .start-btn {
      transition: none;
    }

    .start-btn:hover {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border-color: transparent;
    }

    .start-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
  }

  /* 点击测试按钮 - 蓝色 */
  .start-btn.click-test {
    background: #1976d2;
  }

  .start-btn.click-test:hover {
    background: #1565c0;
  }

  /* 反应测试按钮 - 橙色 */
  .start-btn.reaction-test {
    background: #f57c00;
  }

  .start-btn.reaction-test:hover {
    background: #e65100;
  }

  /* 打字测试按钮 - 紫色 */
  .start-btn.typing-test {
    background: #7b1fa2;
  }

  .start-btn.typing-test:hover {
    background: #6a1b9a;
  }

  /* 空格点击测试按钮 - 绿色 */
  .start-btn.space-test {
    background: #388e3c;
  }

  .start-btn.space-test:hover {
    background: #2e7d32;
  }

  /* Kohi点击测试按钮 - 深橙色 */
  .start-btn.kohi-test {
    background: #e64a19;
  }

  .start-btn.kohi-test:hover {
    background: #bf360c;
  }

  /* 颜色反应测试按钮 - 粉色 */
  .start-btn.color-test {
    background: #c2185b;
  }

  .start-btn.color-test:hover {
    background: #ad1457;
  }

  /* 按键反应测试按钮 - 青色 */
  .start-btn.key-test {
    background: #0097a7;
  }

  .start-btn.key-test:hover {
    background: #00838f;
  }

  /* 目标消除游戏按钮 - 紫色 */
  .start-btn.target-test {
    background: #512da8;
  }

  .start-btn.target-test:hover {
    background: #4527a0;
  }

  /* 鼠标滚动测试按钮 - 深黄色 */
  .start-btn.scroll-test {
    background: #e65100;
    color: #ffffff;
  }

  .start-btn.scroll-test:hover {
    background: #bf360c;
  }

  /* 鼠标拖动测试按钮 - 绿色 */
  .start-btn.drag-test {
    background: #558b2f;
  }

  .start-btn.drag-test:hover {
    background: #33691e;
  }

  /* 键盘测试按钮 - 深绿色 */
  .start-btn.keyboard-test {
    background: #2e7d32;
  }

  .start-btn.keyboard-test:hover {
    background: #1b5e20;
  }

  /* 按钮文本样式 */
  .btn-text {
    line-height: 1.2; /* 行高 */
  }

  /* FAQ容器样式 - 网格布局 */
  .faq-container {
    max-width: 100%; /* 最大宽度，与主容器匹配 */
    margin: 0 auto; /* 水平居中 */
    text-align: left; /* 文本左对齐 */
    display: grid; /* 使用CSS Grid布局 */
    grid-template-columns: 1fr; /* 单列布局，纵向排列 */
    gap: 20px; /* 列间距 */
    margin-bottom: 40px;
  }

  /* FAQ项目样式 */
  .faq-item {
    padding: 24px;
    background-color: #2a2a2a;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid #333;
    height: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  /* FAQ项目悬停效果 */
  .faq-item:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    border-color: #444;
    transform: translateY(0);
  }

  /* FAQ项目触摸反馈效果 */
  .faq-item:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* FAQ问题样式 */
  .faq-question {
    color: #ffffff;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    flex-shrink: 0;
    line-height: 1.5;
    position: relative;
    padding-bottom: 10px;
    border-bottom: 1px solid #333;
  }

  /* FAQ问题前缀图标 - 使用伪元素 */
  .faq-question:before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background-image: url('@/assets/icons/question.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 12px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  /* 移动端优化：使用更小的图标尺寸 */
  @media (max-width: 768px) {
    .faq-question:before {
      width: 20px;
      height: 20px;
      margin-right: 8px;
      margin-top: 1px;
    }
  }

  /* FAQ答案样式 */
  .faq-answer {
    color: #cccccc;
    font-size: 18px;
    line-height: 1.65;
    margin-top: 16px;
    margin-left: 36px;
    flex-grow: 1;
    word-break: break-word;
  }

  /* FAQ答案中的列表样式 */
  .faq-answer ul {
    padding-left: 20px;
    margin: 10px 0;
  }

  /* FAQ答案中的列表项样式 */
  .faq-answer li {
    margin-bottom: 8px;
  }

  /* FAQ答案中的绿色关键词样式 */
  .faq-answer span {
    color: #4caf50; /* 绿色关键词 */
    font-weight: 500;
  }

  /* FAQ链接样式 */
  .faq-link {
    color: #4caf50; /* 主题色 */
    text-decoration: none; /* 移除下划线 */
    font-weight: 500; /* 中等粗细 */
    transition: all 0.2s ease; /* 过渡动画 */
    border-bottom: 1px solid transparent; /* 透明下划线 */
    padding-bottom: 2px; /* 底部内边距 */
  }

  /* FAQ链接悬停效果 */
  .faq-link:hover {
    color: #66bb6a; /* 亮绿色 */
    border-bottom-color: #4caf50; /* 主题色下划线 */
    text-decoration: none; /* 确保没有下划线 */
  }

  /* 桌面端快速开始按钮布局 */
  @media (min-width: 1201px) {
    .quick-start-buttons {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  /* 中等屏幕快速开始按钮布局 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .quick-start-buttons {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* 移动端快速开始按钮布局 */
  @media (max-width: 768px) {
    .quick-start-buttons {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  /* 桌面端FAQ容器 */
  @media (min-width: 1201px) {
    .faq-container {
      gap: 24px;
    }
  }

  /* 点击类型展示区域样式 */
  .click-types-section {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    padding: 60px 20px;
    margin: 60px 0;
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .click-types-section .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .click-types-section .section-title {
    color: #4caf50;
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  /* 点击类型网格布局 */
  .click-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    justify-items: center;
  }

  /* 点击类型项样式 */
  .click-type-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 30px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    width: 100%;
    box-sizing: border-box;
  }

  /* 不同点击类型的独特样式 */
  .click-type-item.butterfly {
    border-left: 5px solid #e91e63;
  }

  .click-type-item.jitter {
    border-left: 5px solid #9c27b0;
  }

  .click-type-item.drag {
    border-left: 5px solid #3f51b5;
  }

  /* 悬停效果 */
  .click-type-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  /* 点击类型标题样式 */
  .click-type-title {
    color: #ffffff;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: center;
  }

  /* 不同点击类型标题的独特颜色 */
  .click-type-item.butterfly .click-type-title {
    color: #e91e63;
  }

  .click-type-item.jitter .click-type-title {
    color: #9c27b0;
  }

  .click-type-item.drag .click-type-title {
    color: #3f51b5;
  }

  /* 点击类型描述样式 */
  .click-type-description {
    color: #e0e0e0;
    font-size: 16px;
    line-height: 1.6;
    text-align: center;
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .click-types-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }
  }

  @media (max-width: 768px) {
    .click-types-section {
      padding: 40px 15px;
      margin: 40px 0;
    }

    .click-types-section .section-title {
      font-size: 28px;
      margin-bottom: 30px;
    }

    .click-types-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .click-type-item {
      padding: 25px;
    }

    .click-type-title {
      font-size: 20px;
    }

    .click-type-description {
      font-size: 15px;
    }
  }

  /* 超小屏幕适配 */
  @media (max-width: 480px) {
    /* 时间选择项超小屏幕适配 */
    .time-select-item {
      padding: 8px 10px;
      font-size: 12px;
      min-width: 60px;
    }

    /* 点击区域优化 */
    .click-area {
      height: clamp(180px, 35vh, 250px);
    }

    /* 游戏标题优化 */
    .game-title {
      font-size: clamp(20px, 5vw, 24px);
    }

    /* 空格键优化 */
    .spacebar-key {
      width: 200px;
      height: 45px;
      font-size: 14px;
    }

    /* 提示文字优化 */
    .hints {
      margin-top: 0;
      transform: translateY(-5px);
      font-size: 14px;
    }

    /* 准备就绪文字优化 */
    .ready-text {
      font-size: 36px;
      margin-bottom: 15px;
    }

    /* 时间选择区域优化 */
    .time-select-title {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .time-select-sidebar {
      padding: 16px;
    }

    /* 按钮优化 */
    .start-btn {
      padding: 12px 8px;
      font-size: 14px;
      min-height: 50px;
    }

    /* FAQ优化 */
    .faq-item {
      padding: 18px 14px;
    }

    .faq-question {
      font-size: 18px;
    }

    .faq-answer {
      font-size: 15px;
      margin-left: 24px;
    }

    .faq-question:before {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }

    /* 点击类型区域优化 */
    .click-types-section .section-title {
      font-size: 24px;
      margin-bottom: 25px;
    }

    .click-type-item {
      padding: 20px;
    }

    .click-type-title {
      font-size: 18px;
    }

    .click-type-description {
      font-size: 14px;
    }
  }
</style>
