<template>
  <div class="double-click-test-container">
    <!-- 测试区域 -->
    <section class="test-area">
      <h1>{{ t('doubleClickTest') }}</h1>

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
            <span class="stat-label">{{ t('doubleClicks') }}:</span>
            <span class="stat-value">{{ leftStats.double }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestDoubleSpeed') }}:</span>
            <span class="stat-value">{{
              leftStats.bestDoubleSpeed > 0 ? leftStats.bestDoubleSpeed + 'ms' : '-'
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
            <span class="stat-label">{{ t('doubleClicks') }}:</span>
            <span class="stat-value">{{ middleStats.double }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestDoubleSpeed') }}:</span>
            <span class="stat-value">{{
              middleStats.bestDoubleSpeed > 0 ? middleStats.bestDoubleSpeed + 'ms' : '-'
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
            <span class="stat-label">{{ t('doubleClicks') }}:</span>
            <span class="stat-value">{{ rightStats.double }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('bestDoubleSpeed') }}:</span>
            <span class="stat-value">{{
              rightStats.bestDoubleSpeed > 0 ? rightStats.bestDoubleSpeed + 'ms' : '-'
            }}</span>
          </div>
        </div>
      </div>
      <div class="test-panel">
        <!-- 测试按钮 -->
        <div
          ref="testButtonRef"
          class="test-button"
          @click.left="handleClick('left', $event)"
          @click.middle="handleClick('middle', $event)"
          @click.right="handleClick('right', $event)"
          @dblclick.left="handleDoubleClick"
          @dblclick.middle="handleDoubleClick"
          @dblclick.right="handleDoubleClick"
          @contextmenu.prevent
        >
          <div class="ready-text">{{ t('clickHereToTest') }}</div>
          <!-- 点击特效容器 -->
          <div ref="clickEffectsContainerRef" class="click-effects-container"></div>
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
    <RelatedTests current-test="doubleClickTest" />

    <!-- FAQ区域 -->
    <div class="faq-section">
      <!-- 使用通用FAQ组件 -->
      <FAQComponent
        :title="t('doubleClickTest')"
        :faq="currentFaq"
        :show-popular="true"
        :popular-questions="popularQuestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { t } from '../i18n/index';
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 测试状态
  const isTesting = ref(false);

  // 点击统计
  interface ClickStats {
    total: number;
    double: number;
    bestDoubleSpeed: number;
  }

  // 三种按键的统计数据
  const leftStats = ref<ClickStats>({ total: 0, double: 0, bestDoubleSpeed: 0 });
  const middleStats = ref<ClickStats>({ total: 0, double: 0, bestDoubleSpeed: 0 });
  const rightStats = ref<ClickStats>({ total: 0, double: 0, bestDoubleSpeed: 0 });

  // 用于记录上一次点击时间，计算双击速度
  const lastClickTime = ref<Record<string, number>>({ left: 0, middle: 0, right: 0 });

  // 测试按钮引用
  const testButtonRef = ref<HTMLElement | null>(null);

  // 点击特效容器引用
  const clickEffectsContainerRef = ref<HTMLElement | null>(null);

  // 添加点击特效
  const addClickEffect = (event: MouseEvent) => {
    if (!testButtonRef.value || !clickEffectsContainerRef.value) return;

    // 获取测试按钮的位置信息
    const rect = testButtonRef.value.getBoundingClientRect();

    // 计算点击位置在测试按钮内的相对坐标
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 创建点击特效元素
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.style.left = `${x - 10}px`; // 减去一半的宽度，使特效居中
    clickEffect.style.top = `${y - 10}px`; // 减去一半的高度，使特效居中

    // 添加到特效容器
    clickEffectsContainerRef.value.appendChild(clickEffect);

    // 动画结束后移除元素
    setTimeout(() => {
      clickEffect.remove();
    }, 600); // 与动画时长一致
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
    leftStats.value = { total: 0, double: 0, bestDoubleSpeed: 0 };
    middleStats.value = { total: 0, double: 0, bestDoubleSpeed: 0 };
    rightStats.value = { total: 0, double: 0, bestDoubleSpeed: 0 };
    lastClickTime.value = { left: 0, middle: 0, right: 0 };
  };

  // 重置测试
  const resetTest = () => {
    isTesting.value = false;
    resetClicks();
  };

  // 处理单击事件
  const handleClick = (button: 'left' | 'middle' | 'right', event: MouseEvent) => {
    startTest(); // 点击区域直接开始测试

    // 添加点击特效
    addClickEffect(event);

    // 更新对应按键的总点击次数
    if (button === 'left') {
      leftStats.value.total++;
    } else if (button === 'middle') {
      middleStats.value.total++;
    } else {
      rightStats.value.total++;
    }

    // 双击事件会先触发两次单击事件，所以我们需要在单击事件中记录时间，用于双击速度计算
    // 但不能在双击事件中再次更新，否则会导致计算错误
    const currentTime = Date.now();

    // 获取上一次点击时间
    const lastTime = lastClickTime.value[button] || 0;

    // 计算两次单击之间的时间差，如果小于300ms，视为双击
    if (lastTime > 0 && currentTime - lastTime < 300) {
      // 这是一个双击，更新双击统计
      if (button === 'left') {
        leftStats.value.double++;
        // 更新最佳双击速度（越小越好）
        if (
          currentTime - lastTime > 0 &&
          (leftStats.value.bestDoubleSpeed === 0 ||
            currentTime - lastTime < leftStats.value.bestDoubleSpeed)
        ) {
          leftStats.value.bestDoubleSpeed = currentTime - lastTime;
        }
      } else if (button === 'middle') {
        middleStats.value.double++;
        if (
          currentTime - lastTime > 0 &&
          (middleStats.value.bestDoubleSpeed === 0 ||
            currentTime - lastTime < middleStats.value.bestDoubleSpeed)
        ) {
          middleStats.value.bestDoubleSpeed = currentTime - lastTime;
        }
      } else {
        rightStats.value.double++;
        if (
          currentTime - lastTime > 0 &&
          (rightStats.value.bestDoubleSpeed === 0 ||
            currentTime - lastTime < rightStats.value.bestDoubleSpeed)
        ) {
          rightStats.value.bestDoubleSpeed = currentTime - lastTime;
        }
      }
    }

    // 更新上一次点击时间
    lastClickTime.value[button] = currentTime;
  };

  // 处理双击事件 - 只用于防止双击时的默认行为，实际双击逻辑在handleClick中处理
  const handleDoubleClick = () => {
    startTest(); // 点击区域直接开始测试
    // 双击事件的主要逻辑已经在handleClick中处理，这里不需要额外操作
  };

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('faqDoubleClickQ1'),
        a: t('faqDoubleClickA1'),
        relatedQuestions: [t('faqDoubleClickQ2')],
      },
      {
        q: t('faqDoubleClickQ2'),
        a: t('faqDoubleClickA2'),
        relatedQuestions: [t('faqDoubleClickQ1')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('faqDoubleClickQ1')];
  });
</script>

<style scoped>
  .double-click-test-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 20px;
    text-align: center;
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
    width: 100%;
    max-width: 1000px;
    height: 150px;
    margin: 0 auto 25px;
    background-color: #333;
    border: 4px solid #4caf50;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 24px;
    color: white;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .test-button:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.6);
    background-color: #45a049;
    outline: none; /* 移除点击时的轮廓 */
  }

  .test-button:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .ready-text {
    font-size: 18px;
    color: #4caf50;
  }

  /* 点击特效容器 */
  .click-effects-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  /* 点击特效样式 */
  .click-effect {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #4caf50;
    border-radius: 50%;
    transform: scale(0);
    animation: clickEffect 0.6s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  }

  /* 点击特效动画 */
  @keyframes clickEffect {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    50% {
      transform: scale(2);
      opacity: 0.8;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
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
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
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

  .start-btn {
    background-color: #4caf50;
    color: white;
  }

  .start-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
  }

  .start-btn:disabled {
    background-color: #666;
    cursor: not-allowed;
  }

  .start-btn:active:not(:disabled) {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.6);
    outline: none; /* 移除点击时的轮廓 */
  }

  .start-btn:focus:not(:disabled) {
    outline: none; /* 移除聚焦轮廓 */
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

  /* 网格布局 */
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 25px;
  }

  /* 单列布局 */
  .faq-column {
    display: flex;
    flex-direction: column;
    gap: 25px;
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

  /* 响应式设计 */
  @media (max-width: 768px) {
    /* 游戏容器样式优化 */
    .double-click-test-container {
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
      max-width: none;
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
      margin-bottom: 8px;
      padding: 0;
      gap: 0px;
      white-space: nowrap;
    }

    .stat-label {
      font-size: 12px;
      white-space: nowrap;
      flex: 1;
      text-align: left;
    }

    .stat-value {
      font-size: 14px;
      min-width: 30px;
      white-space: nowrap;
      text-align: right;
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

    /* FAQ优化 */
    .faq-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .faq-item {
      padding: 20px;
    }

    /* 测试面板边距优化，增加宽度确保统计信息显示完全 */
    .test-panel {
      padding: 20px 15px;
      width: 100%;
      max-width: none;
      box-sizing: border-box;
    }
  }
</style>
