<template>
  <div class="triple-click-test-container">
    <!-- 测试区域 -->
    <section class="test-area">
      <h1>{{ t('tripleClickTest') }}</h1>

      <!-- 统计信息 -->
      <div class="keys-stats">
        <!-- 左键统计 -->
        <div class="key-stats-panel">
          <h3 class="key-title">{{ t('leftButton') }}</h3>
          <div class="stat-item">
            <span class="stat-label">{{ t('totalClicks') }}:</span>
            <span class="stat-value">{{ leftStats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('tripleClicks') }}:</span>
            <span class="stat-value">{{ leftStats.triple }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestTripleSpeed') }}:</span>
            <span class="stat-value">{{
              leftStats.bestTripleSpeed > 0 ? leftStats.bestTripleSpeed + 'ms' : '-'
            }}</span>
          </div>
        </div>

        <!-- 中键统计 -->
        <div class="key-stats-panel">
          <h3 class="key-title">{{ t('middleButton') }}</h3>
          <div class="stat-item">
            <span class="stat-label">{{ t('totalClicks') }}:</span>
            <span class="stat-value">{{ middleStats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('tripleClicks') }}:</span>
            <span class="stat-value">{{ middleStats.triple }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestTripleSpeed') }}:</span>
            <span class="stat-value">{{
              middleStats.bestTripleSpeed > 0 ? middleStats.bestTripleSpeed + 'ms' : '-'
            }}</span>
          </div>
        </div>

        <!-- 右键统计 -->
        <div class="key-stats-panel">
          <h3 class="key-title">{{ t('rightButton') }}</h3>
          <div class="stat-item">
            <span class="stat-label">{{ t('totalClicks') }}:</span>
            <span class="stat-value">{{ rightStats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('tripleClicks') }}:</span>
            <span class="stat-value">{{ rightStats.triple }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestTripleSpeed') }}:</span>
            <span class="stat-value">{{
              rightStats.bestTripleSpeed > 0 ? rightStats.bestTripleSpeed + 'ms' : '-'
            }}</span>
          </div>
        </div>
      </div>
      <div class="test-panel">
        <!-- 测试按钮 -->
        <div
          ref="testButtonRef"
          class="test-button"
          :class="{ playing: isTesting }"
          @click.left="handleClick('left', $event)"
          @click.middle="handleClick('middle', $event)"
          @click.right="handleClick('right', $event)"
          @contextmenu.prevent
        >
          <!-- 涟漪特效容器 -->
          <div class="ripple-container">
            <div
              v-for="ripple in ripples"
              :key="ripple.id"
              class="ripple"
              :style="{
                left: ripple.x + 'px',
                top: ripple.y + 'px',
              }"
            ></div>
          </div>

          <div class="ready-text">{{ t('clickHereToTest') }}</div>
        </div>

        <!-- 控制按钮 -->
        <div class="control-buttons">
          <button class="control-btn reset-btn" @click="resetTest">
            {{ t('reset') }}
          </button>
        </div>
      </div>
    </section>

    <!-- 相关测试推荐组件 -->
    <component :is="RelatedTests" current-test="tripleClickTest" />

    <!-- FAQ区域 -->
    <div class="faq-section">
      <!-- 使用通用FAQ组件 -->
      <component
        :is="FAQComponent"
        :title="t('tripleClickTest')"
        :faq="currentFaq"
        :show-popular="true"
        :popular-questions="popularQuestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, defineAsyncComponent } from 'vue';
  import { t } from '../i18n/index';
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // 测试状态
  const isTesting = ref(false);

  // 点击统计
  interface ClickStats {
    total: number;
    triple: number;
    bestTripleSpeed: number;
  }

  // 三种按键的统计数据
  const leftStats = ref<ClickStats>({ total: 0, triple: 0, bestTripleSpeed: 0 });
  const middleStats = ref<ClickStats>({ total: 0, triple: 0, bestTripleSpeed: 0 });
  const rightStats = ref<ClickStats>({ total: 0, triple: 0, bestTripleSpeed: 0 });

  // 用于记录上一次点击时间，计算三连击速度
  const lastClickTime = ref<Record<string, number[]>>({
    left: [],
    middle: [],
    right: [],
  });

  // 动态导入composable函数
  let useRippleEffect: any = null;

  // 测试按钮引用
  const testButtonRef = ref<HTMLElement | null>(null);

  // 涟漪效果相关
  let ripples: any = null;
  let addRipple: any = null;
  let clearRipples: any = null;

  // 懒加载composable函数
  const loadComposables = async () => {
    if (!useRippleEffect) {
      const { useRippleEffect: rippleComposable } = await import('../composables/useRippleEffect');
      useRippleEffect = rippleComposable;

      // 初始化涟漪效果
      if (useRippleEffect) {
        const rippleEffects = useRippleEffect();
        ripples = rippleEffects.ripples;
        addRipple = rippleEffects.addRipple;
        clearRipples = rippleEffects.clearRipples;
      }
    }
  };

  // 添加点击特效
  const addClickEffect = async (event: MouseEvent) => {
    if (!testButtonRef.value) return;

    // 确保加载了composables
    await loadComposables();

    // 获取测试按钮的位置信息
    const rect = testButtonRef.value.getBoundingClientRect();

    // 计算点击位置在测试按钮内的相对坐标
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 创建涟漪特效
    if (addRipple) {
      addRipple(x, y);
    }
  };

  // 开始测试
  const startTest = () => {
    if (!isTesting.value) {
      isTesting.value = true;
      resetClicks();
    }
  };

  // 重置点击统计
  const resetClicks = () => {
    leftStats.value = { total: 0, triple: 0, bestTripleSpeed: 0 };
    middleStats.value = { total: 0, triple: 0, bestTripleSpeed: 0 };
    rightStats.value = { total: 0, triple: 0, bestTripleSpeed: 0 };
    lastClickTime.value = { left: [], middle: [], right: [] };
  };

  // 重置测试
  const resetTest = () => {
    isTesting.value = false;
    resetClicks();
    // 清除所有涟漪特效
    if (clearRipples) {
      clearRipples();
    }
  };

  // 处理单击事件
  const handleClick = async (button: 'left' | 'middle' | 'right', event: MouseEvent) => {
    startTest(); // 点击区域直接开始测试

    // 添加点击特效
    await addClickEffect(event);

    // 更新对应按键的总点击次数
    if (button === 'left') {
      leftStats.value.total++;
    } else if (button === 'middle') {
      middleStats.value.total++;
    } else {
      rightStats.value.total++;
    }

    // 三连击事件会先触发三次单击事件，所以我们需要在单击事件中记录时间，用于三连击速度计算
    const currentTime = Date.now();

    // 获取上一次点击时间数组
    const clickTimes = lastClickTime.value[button] || [];
    clickTimes.push(currentTime);

    // 只保留最近3次点击的时间
    if (clickTimes.length > 3) {
      clickTimes.shift();
    }

    // 更新最后点击时间
    lastClickTime.value[button] = clickTimes;

    // 如果有3次点击，计算三连击速度
    if (clickTimes.length === 3) {
      // 计算三次点击之间的时间差，使用类型断言确保元素存在
      const timeDiff = (clickTimes[2] as number) - (clickTimes[0] as number);

      // 如果时间差小于500ms，视为有效三连击
      if (timeDiff < 500) {
        // 更新三连击统计
        if (button === 'left') {
          leftStats.value.triple++;
          // 更新最佳三连击速度（越小越好）
          if (
            timeDiff > 0 &&
            (leftStats.value.bestTripleSpeed === 0 || timeDiff < leftStats.value.bestTripleSpeed)
          ) {
            leftStats.value.bestTripleSpeed = timeDiff;
          }
        } else if (button === 'middle') {
          middleStats.value.triple++;
          if (
            timeDiff > 0 &&
            (middleStats.value.bestTripleSpeed === 0 ||
              timeDiff < middleStats.value.bestTripleSpeed)
          ) {
            middleStats.value.bestTripleSpeed = timeDiff;
          }
        } else {
          rightStats.value.triple++;
          if (
            timeDiff > 0 &&
            (rightStats.value.bestTripleSpeed === 0 || timeDiff < rightStats.value.bestTripleSpeed)
          ) {
            rightStats.value.bestTripleSpeed = timeDiff;
          }
        }
      }
    }
  };

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('faqTripleClickQ1'),
        a: t('faqTripleClickA1'),
        relatedQuestions: [t('faqTripleClickQ2')],
      },
      {
        q: t('faqTripleClickQ2'),
        a: t('faqTripleClickA2'),
        relatedQuestions: [t('faqTripleClickQ1')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('faqTripleClickQ1')];
  });
</script>

<style scoped>
  .triple-click-test-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 20px;
    text-align: center;
    background-color: #000000;
    border-radius: 10px;
  }

  /* 测试区域样式 */
  .test-area {
    margin-bottom: 40px;
    padding: 10px 20px;
    text-align: center;
  }

  h1 {
    font-size: 36px;
    color: #4caf50;
    margin: 10px 0 20px 0;
  }

  .test-panel {
    border-radius: 10px;
    margin-bottom: 30px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .test-button {
    width: clamp(70%, 100%, 800px);
    height: clamp(180px, 35vh, 280px);
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
    overflow: hidden;
    box-sizing: border-box;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  .test-button:hover {
    transform: none;
  }

  .test-button.playing {
    background-color: #000000;
  }

  /* 涟漪特效容器 */
  .ripple-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  /* 涟漪样式 - 使用CSS动画实现更流畅的效果 */
  .ripple {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: rgba(56, 214, 201, 0.5);
    pointer-events: none;
    z-index: 1;
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 0px;
    height: 0px;
    opacity: 0.9;
    animation: ripple-animation 600ms ease-out forwards;
  }

  /* 涟漪动画 */
  @keyframes ripple-animation {
    0% {
      width: 0px;
      height: 0px;
      opacity: 0.9;
    }
    50% {
      opacity: 0.9;
    }
    100% {
      width: 500px;
      height: 500px;
      opacity: 0;
    }
  }

  /* 准备文字 */
  .ready-text {
    position: relative;
    z-index: 2;
    font-size: clamp(20px, 3vw, 24px);
    font-weight: bold;
    color: #4caf50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    text-align: center;
    padding: 0 20px;
  }

  .keys-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 30px;
    width: 100%;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .key-stats-panel {
    background-color: #333;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  .key-stats-panel:hover {
    transform: translateY(-3px);
  }

  .key-title {
    color: #4caf50;
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: bold;
    text-align: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    justify-content: space-between;
    gap: 10px;
  }

  .stat-item:last-child {
    margin-bottom: 0;
  }

  .stat-label {
    font-size: 13px;
    color: #cccccc;
    white-space: nowrap;
  }

  .stat-value {
    font-size: 22px;
    font-weight: bold;
    color: #4caf50;
    min-width: 70px;
    text-align: right;
  }

  .control-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 10px;
  }

  .control-btn {
    padding: 10px 25px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .reset-btn {
    background-color: #f44336;
    color: white;
  }

  .reset-btn:hover {
    background-color: #da190b;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
  }

  .reset-btn:active {
    background-color: #c62828;
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.6);
    outline: none; /* 移除点击时的轮廓 */
  }

  .reset-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  /* FAQ 项目 */
  .faq-item {
    background-color: rgba(50, 50, 50, 0.7);
    padding: 25px;
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid rgba(80, 80, 80, 0.5);
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .faq-item:hover {
    background-color: rgba(60, 60, 60, 0.9);
    border-color: #4caf50;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-3px);
  }

  /* FAQ 标题 */
  .faq-item h4 {
    color: #4caf50;
    margin: 0 0 15px 0;
    font-size: 18px;
    font-weight: bold;
    line-height: 1.3;
  }

  /* FAQ 内容 */
  .faq-item p {
    color: #e0e0e0;
    margin: 0;
    line-height: 1.7;
    font-size: 16px;
    text-align: left;
    opacity: 0.9;
  }

  /* 桌面端布局优化 */
  @media (min-width: 1201px) {
    /* 增加内容最大宽度，优化桌面端显示 */
    .triple-click-test-container {
      max-width: 1400px;
    }
  }

  /* 中等屏幕布局优化 */
  @media (min-width: 769px) and (max-width: 1200px) {
    /* 保持响应式布局，适当调整间距 */
    .keys-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      max-width: 900px;
    }

    .test-button {
      max-width: 800px;
    }
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 移除游戏容器和测试区域的宽度限制，确保统计信息显示完全 */
    /* 游戏容器样式优化 */
    .triple-click-test-container {
      max-width: none; /* 移除最大宽度限制，允许容器自适应屏幕宽度 */
      width: 100%; /* 设置容器宽度为100%，充分利用可用空间 */
      padding: 10px 5px; /* 调整内边距，上下10px，左右5px，在小屏幕上提供更多空间 */
      box-sizing: border-box; /* 确保内边距和边框不增加元素总宽度 */
    }

    /* 测试区域样式优化 */
    .test-area {
      max-width: none; /* 移除最大宽度限制，允许测试区域自适应屏幕宽度 */
      width: 100%; /* 设置测试区域宽度为100%，充分利用可用空间 */
      padding: 10px 5px; /* 调整内边距，上下10px，左右5px，在小屏幕上提供更多空间 */
      box-sizing: border-box; /* 确保内边距和边框不增加元素总宽度 */
    }

    /* 统计面板横向排列，确保不超出屏幕 */
    .keys-stats {
      display: flex;
      flex-direction: row;
      gap: 10px;
      width: 100%;
      max-width: none;
      padding: 0 5px;
      box-sizing: border-box;
      justify-content: center;
      flex-wrap: nowrap;
    }

    /* 统计卡片样式优化，确保内容显示完整 */
    .key-stats-panel {
      flex: 1;
      min-width: 120px;
      max-width: 150px;
      padding: 12px 10px;
      box-sizing: border-box;
      background-color: #333;
      border-radius: 8px;
    }

    .key-title {
      font-size: 14px;
      margin-bottom: 10px;
      padding: 0;
      white-space: nowrap;
      text-align: center;
    }

    .stat-item {
      margin-bottom: 12px;
      padding: 0;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 11px;
      white-space: nowrap;
      text-align: center;
      margin-right: 0;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: bold;
      min-width: 30px;
      white-space: nowrap;
      text-align: center;
    }

    /* 控制按钮优化 */
    .control-buttons {
      flex-direction: row;
      justify-content: center;
      gap: 10px;
    }

    .control-btn {
      width: auto;
      padding: 8px 16px;
      font-size: 14px;
    }

    /* 测试按钮优化 */
    .test-button {
      width: 100%;
      max-width: 500px;
      height: 140px;
      font-size: 16px;
    }

    /* 测试面板边距优化，增加宽度确保统计信息显示完全 */
    .test-panel {
      padding: 20px 15px;
      width: 100%;
      max-width: none;
      box-sizing: border-box;
    }
  }

  /* 超小屏幕适配 */
  @media (max-width: 480px) {
    /* 调整标题字号 */
    h1 {
      font-size: 28px;
      margin: 5px 0 15px 0;
    }

    /* 进一步优化统计卡片 */
    .key-stats-panel {
      min-width: 130px;
      padding: 8px 6px;
    }

    .key-title {
      font-size: 12px;
      margin-bottom: 8px;
    }

    .stat-item {
      margin-bottom: 10px;
    }

    .stat-label {
      font-size: 10px;
      text-align: center;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 14px;
      min-width: 25px;
      text-align: center;
    }

    /* 调整测试按钮尺寸 */
    .test-button {
      height: 120px;
      font-size: 14px;
    }
  }
</style>
