<script setup lang="ts">
  import { ref, onUnmounted, computed } from 'vue';
  import { t } from '../i18n'; // 导入翻译函数
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 组件功能：鼠标滚动测试，测试玩家在滚动区域内每秒最高滚动像素

  // 滚动数据类型定义
  interface ScrollData {
    delta: number;
    timestamp: number;
  }

  // 状态管理
  const currentSpeed = ref(0); // 当前滚动速度
  const maxSpeed = ref(0); // 最大滚动速度
  const scrollHistory = ref<ScrollData[]>([]); // 滚动历史
  const speedDecayTimer = ref<number | null>(null); // 速度衰减定时器
  const isMouseInside = ref(false); // 鼠标是否在测试区域内
  const lastScrollTime = ref(Date.now()); // 最后一次滚动时间
  const isInitialized = ref(false); // 游戏是否已初始化

  // 初始化游戏
  const initializeGame = () => {
    if (isInitialized.value) return;

    // 重置游戏状态
    currentSpeed.value = 0;
    maxSpeed.value = 0;
    scrollHistory.value = [];
    lastScrollTime.value = Date.now();

    // 设置速度衰减定时器（每秒更新60次）
    speedDecayTimer.value = window.setInterval(() => {
      decaySpeed();
    }, 16.67) as unknown as number;

    isInitialized.value = true;
  };

  // 处理鼠标滚轮事件
  const handleWheel = (event: WheelEvent) => {
    // 初始化游戏（如果尚未初始化）
    initializeGame();

    // 阻止默认滚动行为
    event.preventDefault();

    // 记录当前滚动数据，包含时间戳
    const scrollData: ScrollData = {
      delta: event.deltaY,
      timestamp: Date.now(),
    };

    // 记录滚动历史
    scrollHistory.value.push(scrollData);

    // 更新最后滚动时间
    lastScrollTime.value = Date.now();

    // 实时更新滚动速度
    updateScrollSpeed();
  };

  // 速度衰减函数
  const decaySpeed = () => {
    // 计算距离上次滚动的时间
    const timeSinceLastScroll = Date.now() - lastScrollTime.value;

    // 如果鼠标不在测试区域内，或者长时间没有滚动，速度快速衰减
    if (!isMouseInside.value || timeSinceLastScroll > 50) {
      // 增加衰减系数，让速度下降更快
      const decayFactor = !isMouseInside.value ? 0.7 : 0.85;
      // 直接计算衰减后的值，不四舍五入，确保能衰减到0
      const newSpeed = currentSpeed.value * decayFactor;
      // 当速度小于1时，直接设置为0，避免陷入循环
      currentSpeed.value = Math.max(0, Math.floor(newSpeed));
    }
  };

  // 更新滚动速度
  const updateScrollSpeed = () => {
    if (scrollHistory.value.length === 0) return;

    // 获取当前时间
    const now = Date.now();

    // 只保留最近1秒内的滚动数据
    const oneSecondAgo = now - 1000;
    const recentScroll = scrollHistory.value.filter((item) => item.timestamp >= oneSecondAgo);

    // 更新滚动历史，移除过期数据，优化性能
    scrollHistory.value = recentScroll;

    // 计算总滚动距离（deltaY绝对值之和）
    const totalDistance = recentScroll.reduce((sum, item) => sum + Math.abs(item.delta), 0);

    // 总距离即为像素/秒
    const speed = Math.round(totalDistance);

    // 更新当前速度
    currentSpeed.value = speed;

    // 更新最大速度
    if (currentSpeed.value > maxSpeed.value) {
      maxSpeed.value = currentSpeed.value;
    }
  };

  // 组件卸载
  onUnmounted(() => {
    // 清除所有定时器
    if (speedDecayTimer.value) {
      clearInterval(speedDecayTimer.value);
      speedDecayTimer.value = null;
    }
  });

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsMouseScrollTest'),
        a: t('whatIsMouseScrollTestDesc'),
        relatedQuestions: [t('howToImproveScrollSpeed'), t('whatDoResultsMean')],
      },
      {
        q: t('howToImproveScrollSpeed'),
        a: t('howToImproveScrollSpeedDesc'),
        relatedQuestions: [t('whatIsMouseScrollTest'), t('whatDoResultsMean')],
      },
      {
        q: t('whatDoResultsMean'),
        a: t('whatDoResultsMeanDesc'),
        relatedQuestions: [t('whatIsMouseScrollTest'), t('isThereTimeLimit')],
      },
      {
        q: t('isThereTimeLimit'),
        a: t('isThereTimeLimitDesc'),
        relatedQuestions: [t('whatIsMouseScrollTest'), t('whatDoResultsMean')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsMouseScrollTest'), t('howToImproveScrollSpeed')];
  });
</script>

<template>
  <div class="game-container">
    <!-- 标题栏 -->
    <div class="header">
      <h2 class="game-title">{{ t('mouseScrollTest') }}</h2>
      <p class="subtitle">{{ t('testYourMouseScrollSpeed') }}</p>
    </div>

    <!-- 游戏区域 -->
    <div
      class="test-area"
      @wheel="handleWheel"
      @mouseenter="isMouseInside = true"
      @mouseleave="isMouseInside = false"
    >
      <!-- 速度显示 -->
      <div class="speed-display">
        <div class="speed-value">{{ currentSpeed }} {{ t('pixelsPerSecond') }}</div>
        <div class="scroll-prompt">
          {{
            currentSpeed > 0 || maxSpeed <= 0
              ? t('scrollAsFastAsPossible')
              : `${t('yourBestScore')} ${maxSpeed} ${t('pixelsPerSecond')}`
          }}
        </div>
      </div>
    </div>

    <!-- 相关测试推荐组件 -->
    <RelatedTests current-test="mouseScrollTest" />

    <!-- 游戏说明 -->
    <div class="game-instructions">
      <!-- 使用通用FAQ组件 -->
      <FAQComponent
        :title="t('mouseScrollTest')"
        :faq="currentFaq"
        :show-popular="true"
        :popular-questions="popularQuestions"
      />
    </div>
  </div>
</template>

<style scoped>
  /* 游戏容器 */
  .game-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    background-color: #121212;
    color: white;
    box-sizing: border-box;
    font-family: 'Arial', sans-serif;
    border-radius: 10px;
  }

  /* 标题栏 */
  .header {
    text-align: center;
    margin-bottom: 30px;
    padding: 0;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
  }

  .header .subtitle {
    font-size: 18px;
    color: #cccccc;
    margin: 0;
    opacity: 0.8;
  }

  /* 测试区域 */
  .test-area {
    width: 80%;
    max-width: 700px;
    height: 250px;
    border-radius: 15px;
    border: 2px solid #333;
    position: relative;
    overflow: hidden; /* 防止真实滚动 */
    cursor: pointer;
    background: linear-gradient(135deg, #1e3a8a, #6366f1);
    transition:
      background 0.3s ease,
      transform 0.2s ease;
    margin: 0 auto 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .test-area:hover {
    transform: scale(1.01);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  /* 速度显示 */
  .speed-display {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }

  /* 速度值 */
  .speed-value {
    font-size: 48px;
    font-weight: bold;
    color: white;
    margin-bottom: 20px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  /* 滚动提示 */
  .scroll-prompt {
    font-size: 24px;
    font-weight: bold;
    color: #ff6b6b;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }

  /* 游戏说明 */
  .game-instructions {
    border-radius: 15px; /* 设置圆角边框 */
    padding: 25px; /* 设置内边距 */
    margin: 10px auto 10px; /* 设置外边距，顶部30px，水平居中 */
    width: 80%; /* 设置宽度为父容器的80% */
    max-width: 700px; /* 设置最大宽度为700px */
  }

  /* 响应式设计 */
  @media (max-width: 600px) {
    .game-title {
      font-size: 24px;
    }

    .header .subtitle {
      font-size: 16px;
    }

    .speed-value {
      font-size: 32px;
    }

    .scroll-prompt {
      font-size: 18px;
    }

    .test-area {
      height: 200px;
      width: 90%;
    }

    .game-instructions {
      width: 90%;
      padding: 15px;
    }
  }
</style>
