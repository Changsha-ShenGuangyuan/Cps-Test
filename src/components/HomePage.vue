<template>
  <div class="home-container">
    <!-- 5秒空格速度测试 -->
    <section class="space-test-section">
      <div class="game-container">
        <div class="main-content">
          <!-- 左侧游戏区域 -->
          <div class="game-area">
            <h1 class="game-title">Spacebar clicker - {{ t('fiveSecondSpaceTest') }}</h1>

            <!-- 统计卡片 -->
            <div class="stats-cards">
              <div class="stat-card timer-card">
                <div class="stat-value">
                  {{ !isPlaying && clicks === 0 ? 0 : elapsedTime.toFixed(3) }}
                </div>
                <div class="stat-label">{{ t('time') }}</div>
              </div>
              <div class="stat-card click-rate-card">
                <div class="stat-value">
                  {{ !isPlaying && clicks === 0 ? 0 : currentCps.toFixed(2) }}
                </div>
                <div class="stat-label">{{ t('clicksPerSecond') }}</div>
              </div>
              <div class="stat-card score-card">
                <div class="stat-value">{{ clicks }}</div>
                <div class="stat-label">{{ t('score') }}</div>
              </div>
            </div>

            <!-- 点击区域 -->
            <div
              class="click-area"
              :class="{
                playing: isPlaying,
                'space-pressed': isSpacePressed,
              }"
            >
              <!-- 游戏进行中显示 -->
              <div v-if="isPlaying" class="playing-content">
                <!-- 空格键图标 -->
                <div class="spacebar-icon">
                  <div
                    class="spacebar-key"
                    :class="{ 'space-pressed': isSpacePressed }"
                    @touchstart="handleTouchStart"
                    @touchend="handleTouchEnd"
                    @touchcancel="handleTouchEnd"
                  >
                    {{ t('spaceBar') }}
                  </div>
                </div>

                <!-- 提示文字 -->
                <div v-if="showPressHint" class="hints">{{ t('holdSpaceBar') }}</div>
              </div>

              <!-- 游戏准备就绪显示 -->
              <div v-else-if="isGameReady" class="ready-content">
                <!-- 提示文字 -->
                <div class="ready-text">{{ t('gettingReady') }}</div>

                <!-- 空格键图标 -->
                <div class="spacebar-icon">
                  <div
                    class="spacebar-key"
                    :class="{ 'space-pressed': isSpacePressed }"
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
                    :class="{ 'space-pressed': isSpacePressed }"
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
        <h3 class="time-select-title">{{ t('selectTime') }}</h3>
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
      :visible="showResultModal"
      :type="'space'"
      :cps="cps"
      :time="testDuration"
      @close="resetGame"
    />

    <!-- 快速开始区域 -->
    <section class="quick-start-section">
      <div class="quick-start-buttons">
        <button class="start-btn click-test" @click="navigateTo('/click-test/1')">
          <span class="btn-text">{{ t('clickTest') }}</span>
        </button>
        <button class="start-btn reaction-test" @click="navigateTo('/reaction-time-test')">
          <span class="btn-text">{{ t('simpleReactionTest') }}</span>
        </button>
        <button class="start-btn typing-test" @click="navigateTo('/typing-test/1')">
          <span class="btn-text">{{ t('typingTest') }}</span>
        </button>
        <button class="start-btn space-test" @click="navigateTo('/space-click-test/1')">
          <span class="btn-text">{{ t('spaceClickTest') }}</span>
        </button>
        <button class="start-btn kohi-test" @click="navigateTo('/kohi-click-test')">
          <span class="btn-text">{{ t('kohiClickTest') }}</span>
        </button>
        <button class="start-btn color-test" @click="navigateTo('/color-reaction-test')">
          <span class="btn-text">{{ t('colorReactionTest') }}</span>
        </button>
        <button class="start-btn key-test" @click="navigateTo('/key-reaction-test')">
          <span class="btn-text">{{ t('keyReactionTest') }}</span>
        </button>
        <button class="start-btn target-test" @click="navigateTo('/target-elimination-game')">
          <span class="btn-text">{{ t('targetEliminationGame') }}</span>
        </button>
        <button class="start-btn scroll-test" @click="navigateTo('/mouse-scroll-test')">
          <span class="btn-text">{{ t('mouseScrollTest') }}</span>
        </button>
        <button class="start-btn drag-test" @click="navigateTo('/mouse-drag-test')">
          <span class="btn-text">{{ t('mouseDragTest') }}</span>
        </button>
        <button class="start-btn keyboard-test" @click="navigateTo('/keyboard-test')">
          <span class="btn-text">{{ t('keyboardTest') }}</span>
        </button>
      </div>
    </section>

    <!-- 点击技巧展示区域 -->
    <section class="click-types-section">
      <div class="container">
        <h2 class="section-title">{{ t('clickTypes') }}</h2>
        <div class="click-types-grid">
          <div v-if="isClickTypesVisible" class="click-type-item butterfly">
            <h3 class="click-type-title">{{ t('butterflyClick') }}</h3>
            <p class="click-type-description">{{ t('butterflyClickDesc') }}</p>
          </div>
          <div v-if="isClickTypesVisible" class="click-type-item jitter">
            <h3 class="click-type-title">{{ t('jitterClick') }}</h3>
            <p class="click-type-description">{{ t('jitterClickDesc') }}</p>
          </div>
          <div v-if="isClickTypesVisible" class="click-type-item drag">
            <h3 class="click-type-title">{{ t('dragClick') }}</h3>
            <p class="click-type-description">{{ t('dragClickDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ区域 -->
    <section id="faq" class="faq-section">
      <div class="faq-container">
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ1') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA1'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ2') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA2'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ3') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA3'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ9') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA9'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ11') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA11'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('homeFaqQ12') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('homeFaqA12'))"></p>
        </div>
        <div v-if="isFaqVisible" class="faq-item">
          <h3 class="faq-question">{{ t('kohiFaqQ1') }}</h3>
          <p class="faq-answer" v-html="formatAnswer(t('kohiFaqA1'))"></p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { ref, onMounted, computed, onBeforeUnmount } from 'vue';

  import { t } from '../i18n/index';
  // 静态导入结果弹窗组件
  import ResultModal from './ResultModal.vue';

  const router = useRouter();

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 根据当前语言添加语言前缀
    import('../i18n/index').then((i18n) => {
      let fullPath = path;
      if (i18n.langState.current !== 'en') {
        // 确保路径以斜杠开头
        const basePath = path.startsWith('/') ? path : `/${path}`;
        fullPath = `/${i18n.langState.current}${basePath}`;
      }
      router.push(fullPath);
    });
  };

  // 格式化答案，将换行符转换为<br>标签，并将关键词替换为绿色样式
  const formatAnswer = (answer: string) => {
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

    // 将答案转换为HTML，替换换行符
    let htmlAnswer = answer.replace(/\n/g, '<br>');

    // 替换关键词为绿色样式
    keywords.forEach((keyword) => {
      // 创建正则表达式，使用全局匹配和不区分大小写
      const regex = new RegExp(`(${keyword})`, 'gi');
      // 替换为带有绿色样式的span标签
      htmlAnswer = htmlAnswer.replace(
        regex,
        '<span style="color: #4CAF50; font-weight: 500;">$1</span>'
      );
    });

    return htmlAnswer;
  };

  // 支持的测试时间数组 - 静态数据，不需要响应式
  const supportedTimes = [1, 5, 10, 15, 30, 60];
  // 当前选中的时间
  const selectedTime = ref(5);

  // 5秒空格速度测试相关变量
  const isPlaying = ref(false);
  const isGameReady = ref(false);
  const isGameOver = ref(false);
  const showPressHint = ref(true);
  let startTime = 0; // 不需要响应式，仅用于游戏逻辑
  const clicks = ref(0);
  const cps = ref(0);
  let timer: number | null = null; // 不需要响应式，仅用于游戏逻辑
  const elapsedTime = ref(0);
  const isSpacePressed = ref(false);
  const showResultModal = ref(false);
  const testDuration = 5; // 5秒测试 - 常量，不需要响应式

  // 实时计算当前CPS
  const currentCps = computed(() => {
    // 游戏结束时，显示最终CPS值
    if (isGameOver.value) {
      return cps.value;
    }

    // 游戏未开始或无点击则返回0
    if (!isPlaying.value || clicks.value === 0) return 0;

    // 避免除以0或极小值导致的Infinity
    if (elapsedTime.value < 0.1) return 0;

    // 计算CPS并保留2位小数
    return Math.round((clicks.value / elapsedTime.value) * 100) / 100;
  });

  // 点击空格键按钮处理函数
  const handleSpacebarClick = () => {
    // 标记游戏准备就绪
    isGameReady.value = true;
    // 重新显示提示
    showPressHint.value = true;
  };

  // 游戏开始函数
  const startGame = () => {
    if (isPlaying.value) return; // 防止重复开始

    // 重置游戏状态
    clicks.value = 0;
    startTime = Date.now(); // 记录开始时间
    isPlaying.value = true;
    isGameOver.value = false; // 确保游戏未结束
    elapsedTime.value = 0; // 重置已用时间

    // 设置定时器，每50ms更新一次状态
    timer = window.setInterval(() => {
      // 计算并更新已用时间（秒）
      const elapsed = (Date.now() - startTime) / 1000;
      elapsedTime.value = Math.min(elapsed, testDuration);

      // 检查时间是否结束
      if (elapsed >= testDuration) {
        endGame();
      }
    }, 50); // 50ms更新一次，确保毫秒级显示流畅
  };

  // 游戏结束函数
  const endGame = () => {
    isPlaying.value = false; // 标记游戏结束
    isGameOver.value = true; // 设置最终结束状态

    // 计算最终CPS，使用规定的测试时间
    cps.value = testDuration > 0 ? Math.round((clicks.value / testDuration) * 100) / 100 : 0;

    // 确保已用时间显示为规定的测试时间
    elapsedTime.value = testDuration;

    // 清除定时器
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    // 显示结果弹窗
    showResultModal.value = true;
  };

  // 重置游戏函数
  const resetGame = () => {
    // 重置所有游戏状态，回到初始状态
    isPlaying.value = false;
    isGameReady.value = false; // 重置准备状态，需要重新点击空格键
    isGameOver.value = false;
    isSpacePressed.value = false; // 重置空格键按下状态
    clicks.value = 0;
    cps.value = 0;
    elapsedTime.value = 0;
    showPressHint.value = true; // 重置提示显示
    showResultModal.value = false; // 关闭结果弹窗

    // 清除定时器
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // 空格键按下处理函数
  const handleSpaceDown = (event: KeyboardEvent) => {
    // 只处理空格键
    if (event.code !== 'Space') return;

    // 阻止空格的默认行为（防止页面滚动）
    event.preventDefault();

    // 游戏结束，不处理点击事件
    if (isGameOver.value) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!isGameReady.value) {
      return;
    }

    // 如果已经按下，不再处理
    if (isSpacePressed.value) {
      return;
    }

    // 标记空格键已按下
    isSpacePressed.value = true;

    // 隐藏提示
    showPressHint.value = false;

    // 游戏未开始，开始游戏
    if (!isPlaying.value) {
      startGame();
    }
  };

  // 空格键释放处理函数
  const handleSpaceUp = (event: KeyboardEvent) => {
    // 只处理空格键
    if (event.code !== 'Space') return;

    // 阻止空格的默认行为（防止页面滚动）
    event.preventDefault();

    // 游戏结束，不处理点击事件
    if (isGameOver.value) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!isGameReady.value) {
      return;
    }

    // 标记空格键已释放
    isSpacePressed.value = false;

    // 更新点击次数（游戏进行中）
    if (isPlaying.value) {
      clicks.value++;
    }
  };

  // 触摸开始处理函数 - 模拟空格键按下
  const handleTouchStart = (event: TouchEvent) => {
    // 只有当事件可取消时才调用preventDefault()
    if (event.cancelable) {
      event.preventDefault();
    }

    // 游戏结束，不处理点击事件
    if (isGameOver.value) {
      return;
    }

    // 如果已经按下，不再处理
    if (isSpacePressed.value) {
      return;
    }

    // 标记空格键已按下
    isSpacePressed.value = true;

    // 隐藏提示
    showPressHint.value = false;

    // 游戏未准备就绪，先设置为准备就绪状态
    if (!isGameReady.value) {
      isGameReady.value = true;
      return;
    }

    // 游戏未开始，开始游戏
    if (!isPlaying.value) {
      startGame();
    }
  };

  // 触摸结束处理函数 - 模拟空格键释放
  const handleTouchEnd = (event: TouchEvent) => {
    // 只有当事件可取消时才调用preventDefault()
    if (event.cancelable) {
      event.preventDefault();
    }

    // 游戏结束，不处理点击事件
    if (isGameOver.value) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!isGameReady.value) {
      return;
    }

    // 标记空格键已释放
    isSpacePressed.value = false;

    // 更新点击次数（游戏进行中）
    if (isPlaying.value) {
      clicks.value++;
    }
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    renderFeatureStructuredData();
    renderGuideStructuredData();
    window.addEventListener('keydown', handleSpaceDown);
    window.addEventListener('keyup', handleSpaceUp);

    // 设置交叉观察者
    setupIntersectionObservers();
  });

  // 按需渲染相关变量
  const isFaqVisible = ref(false);
  const isClickTypesVisible = ref(false);
  let faqObserver: IntersectionObserver | null = null;
  let clickTypesObserver: IntersectionObserver | null = null;

  // 实现按需渲染功能
  const setupIntersectionObservers = () => {
    // FAQ区域观察者
    faqObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isFaqVisible.value = true;
            faqObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // 点击技巧区域观察者
    clickTypesObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isClickTypesVisible.value = true;
            clickTypesObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // 观察目标元素
    const faqElement = document.getElementById('faq');
    const clickTypesElement = document.querySelector('.click-types-section');

    if (faqElement) {
      faqObserver.observe(faqElement);
    }

    if (clickTypesElement) {
      clickTypesObserver.observe(clickTypesElement);
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

    // 清理观察者
    if (faqObserver) {
      faqObserver.disconnect();
    }
    if (clickTypesObserver) {
      clickTypesObserver.disconnect();
    }

    if (timer) {
      clearInterval(timer);
    }
  });

  // 通用结构化数据生成函数
  const renderStructuredData = (id: string, data: any) => {
    // 检查是否已存在结构化数据元素
    let structuredDataElement: HTMLScriptElement | null = document.getElementById(
      id
    ) as HTMLScriptElement | null;
    if (!structuredDataElement) {
      structuredDataElement = document.createElement('script');
      structuredDataElement.id = id;
      structuredDataElement.type = 'application/ld+json';
      document.head.appendChild(structuredDataElement);
    }

    // 更新结构化数据内容
    structuredDataElement.textContent = JSON.stringify(data);
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
      description: 'CPSTest 平台使用指南，帮助您快速开始测试',
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
    margin-top: 0;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 紫色渐变 */
  }

  .click-rate-card {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); /* 粉色渐变 */
  }

  .score-card {
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); /* 青色渐变 */
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
    animation: pulse 0.2s ease-in-out;
  }

  /* 点击区域按下特效 */
  .click-area.space-pressed {
    background-color: #000000;
    border-color: #4caf50;
    box-shadow: inset 0 0 30px rgba(76, 175, 80, 0.2);
    animation: clickGlow 0.3s ease-in-out;
  }

  /* 脉动动画 */
  @keyframes pulse {
    0% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(3px) scale(0.97);
    }
    100% {
      transform: translateY(2px) scale(0.98);
    }
  }

  /* 点击发光动画 */
  @keyframes clickGlow {
    0% {
      box-shadow: inset 0 0 0 rgba(76, 175, 80, 0);
    }
    50% {
      box-shadow: inset 0 0 50px rgba(76, 175, 80, 0.3);
    }
    100% {
      box-shadow: inset 0 0 30px rgba(76, 175, 80, 0.2);
    }
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
    /* 动画优化 - 减少不必要的动画 */
    /* 简化空格键按下动画 */
    .spacebar-key.space-pressed {
      animation: none;
      transform: translateY(2px);
    }

    /* 简化点击区域发光动画 */
    .click-area.space-pressed {
      animation: none;
    }

    /* 简化按钮脉动动画 */
    .start-btn:hover::before {
      animation: none;
      opacity: 0.4;
    }

    /* 简化按钮悬停效果 */
    .start-btn:hover {
      transform: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
    .time-select-sidebar {
      padding: 18px;
    }

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

    .start-btn:hover::before {
      display: none;
    }

    .start-btn::before {
      display: none;
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

  /* 快速开始区域标题样式 */
  .quick-start-section h2 {
    color: #4caf50; /* 主题色 */
    margin-bottom: 30px; /* 底部外边距 */
    font-size: 32px;
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
    font-weight: 500; /* 中等粗细 */
    position: relative; /* 相对定位，用于伪元素 */
    overflow: visible; /* 允许伪元素超出 */
  }

  /* 开始按钮聚焦样式 */
  .start-btn:focus {
    outline: none; /* 移除默认轮廓 */
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3); /* 聚焦阴影效果 */
  }

  /* 开始按钮基础悬停效果 */
  .start-btn:hover {
    transform: translateY(-2px); /* 向上移动2px */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); /* 增强阴影 */
    border-color: rgba(255, 255, 255, 0.3); /* 边框颜色变为半透明白色 */
  }

  /* 开始按钮点击效果 */
  .start-btn:active {
    transform: translateY(0); /* 恢复原位 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* 减小阴影 */
  }

  /* 按钮围绕发光特效 - 基础样式 */
  .start-btn::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
    filter: blur(4px); /* 模糊效果 */
    background: linear-gradient(45deg, currentColor, transparent);
  }

  /* 悬停时显示发光特效 */
  .start-btn:hover::before {
    opacity: 0.6;
    animation: pulse 2s infinite; /* 脉动动画 */
  }

  /* 脉动动画 */
  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }

  /* 点击测试按钮 - 蓝色渐变 */
  .start-btn.click-test {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }

  .start-btn.click-test:hover {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  }

  /* 点击测试按钮 - 蓝色发光 */
  .start-btn.click-test::before {
    background: linear-gradient(45deg, #2196f3, transparent);
  }

  /* 反应测试按钮 - 橙色渐变 */
  .start-btn.reaction-test {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  }

  .start-btn.reaction-test:hover {
    background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  }

  /* 反应测试按钮 - 橙色发光 */
  .start-btn.reaction-test::before {
    background: linear-gradient(45deg, #ff9800, transparent);
  }

  /* 打字测试按钮 - 紫色渐变 */
  .start-btn.typing-test {
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  }

  .start-btn.typing-test:hover {
    background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
  }

  /* 打字测试按钮 - 紫色发光 */
  .start-btn.typing-test::before {
    background: linear-gradient(45deg, #9c27b0, transparent);
  }

  /* 空格点击测试按钮 - 绿色渐变 */
  .start-btn.space-test {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }

  .start-btn.space-test:hover {
    background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  }

  /* 空格点击测试按钮 - 绿色发光 */
  .start-btn.space-test::before {
    background: linear-gradient(45deg, #4caf50, transparent);
  }

  /* Kohi点击测试按钮 - 深橙色渐变 */
  .start-btn.kohi-test {
    background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  }

  .start-btn.kohi-test:hover {
    background: linear-gradient(135deg, #e64a19 0%, #bf360c 100%);
  }

  /* Kohi点击测试按钮 - 深橙色发光 */
  .start-btn.kohi-test::before {
    background: linear-gradient(45deg, #ff5722, transparent);
  }

  /* 颜色反应测试按钮 - 粉色渐变 */
  .start-btn.color-test {
    background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  }

  .start-btn.color-test:hover {
    background: linear-gradient(135deg, #c2185b 0%, #ad1457 100%);
  }

  /* 颜色反应测试按钮 - 粉色发光 */
  .start-btn.color-test::before {
    background: linear-gradient(45deg, #e91e63, transparent);
  }

  /* 按键反应测试按钮 - 青色渐变 */
  .start-btn.key-test {
    background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
  }

  .start-btn.key-test:hover {
    background: linear-gradient(135deg, #0097a7 0%, #00838f 100%);
  }

  /* 按键反应测试按钮 - 青色发光 */
  .start-btn.key-test::before {
    background: linear-gradient(45deg, #00bcd4, transparent);
  }

  /* 目标消除游戏按钮 - 紫色渐变（不同色调） */
  .start-btn.target-test {
    background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
  }

  .start-btn.target-test:hover {
    background: linear-gradient(135deg, #512da8 0%, #4527a0 100%);
  }

  /* 目标消除游戏按钮 - 紫色发光 */
  .start-btn.target-test::before {
    background: linear-gradient(45deg, #673ab7, transparent);
  }

  /* 鼠标滚动测试按钮 - 黄色渐变 */
  .start-btn.scroll-test {
    background: linear-gradient(135deg, #ffc107 0%, #ffa000 100%);
  }

  .start-btn.scroll-test:hover {
    background: linear-gradient(135deg, #ffa000 0%, #ff8f00 100%);
  }

  /* 鼠标滚动测试按钮 - 黄色发光 */
  .start-btn.scroll-test::before {
    background: linear-gradient(45deg, #ffc107, transparent);
  }

  /* 鼠标拖动测试按钮 - 绿色渐变（不同色调） */
  .start-btn.drag-test {
    background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
  }

  .start-btn.drag-test:hover {
    background: linear-gradient(135deg, #689f38 0%, #558b2f 100%);
  }

  /* 鼠标拖动测试按钮 - 绿色发光 */
  .start-btn.drag-test::before {
    background: linear-gradient(45deg, #8bc34a, transparent);
  }

  /* 键盘测试按钮 - 绿色渐变（不同色调） */
  .start-btn.keyboard-test {
    background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  }

  .start-btn.keyboard-test:hover {
    background: linear-gradient(135deg, #00c853 0%, #00bfa5 100%);
  }

  /* 键盘测试按钮 - 绿色发光 */
  .start-btn.keyboard-test::before {
    background: linear-gradient(45deg, #00e676, transparent);
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
    padding: 24px; /* 内边距，增加空间 */
    background-color: #2a2a2a; /* 深色背景，接近黑色 */
    border-radius: 8px; /* 圆角边框 */
    transition: all 0.3s ease; /* 过渡动画 */
    border: 1px solid #333; /* 深色边框 */
    height: auto; /* 自动高度 */
    display: flex; /* 弹性布局 */
    flex-direction: column; /* 垂直方向排列 */
    box-sizing: border-box; /* 确保内边距不影响总宽度 */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
  }

  /* FAQ项目悬停效果 */
  .faq-item:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* 增强阴影效果 */
    border-color: #444; /* 边框颜色加深 */
    transform: translateY(0); /* 取消悬停上移效果 */
  }

  /* FAQ项目触摸反馈效果 */
  .faq-item:active {
    transform: translateY(0); /* 取消触摸上移效果 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 减小阴影 */
  }

  /* FAQ问题样式 */
  .faq-question {
    color: #ffffff; /* 白色文本 */
    margin-bottom: 16px; /* 底部外边距，增加间距 */
    font-size: 20px; /* 中号字号 */
    font-weight: 600; /* 加粗，突出问题 */
    display: flex; /* 弹性布局 */
    align-items: flex-start; /* 顶部对齐 */
    flex-shrink: 0; /* 不收缩，保持原尺寸 */
    line-height: 1.5; /* 行高，增强可读性 */
    position: relative;
    padding-bottom: 10px;
    border-bottom: 1px solid #333; /* 添加底部分割线 */
  }

  /* FAQ问题前缀图标 - 使用伪元素 */
  .faq-question:before {
    content: ''; /* 清除文本内容 */
    display: inline-block;
    width: 24px; /* 图片宽度 */
    height: 24px; /* 图片高度 */
    background-image: url('@/assets/icons/question.png'); /* 使用资源图片 */
    background-size: contain; /* 背景图片自适应 */
    background-repeat: no-repeat; /* 不重复 */
    background-position: center; /* 居中显示 */
    margin-right: 12px; /* 右侧外边距 */
    margin-top: 2px; /* 顶部微调 */
    flex-shrink: 0; /* 不收缩 */
  }

  /* FAQ答案样式 */
  .faq-answer {
    color: #cccccc; /* 浅灰色文本，增强可读性 */
    font-size: 18px; /* 小号字号 */
    line-height: 1.65; /* 行高，增强可读性 */
    margin-top: 16px; /* 顶部外边距 */
    margin-left: 36px; /* 左侧缩进，与问题图标对齐 */
    flex-grow: 1; /* 弹性增长，占据剩余空间 */
    word-break: break-word; /* 确保长单词换行 */
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
