<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { t } from '../i18n/index';
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 静态导入结果弹窗组件
  import ResultModal from './ResultModal.vue';
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // 导入composable函数
  import { useClickTestGame } from '../composables/useClickTestGame';
  import { useRippleEffect } from '../composables/useRippleEffect';
  import { useClickTestHistory } from '../composables/useClickTestHistory';

  // 导入图标资源
  const historyIconUrl = new URL('@/assets/icons/history.png', import.meta.url).href;
  const historyIconUrlRelative = new URL('../assets/icons/history.png', import.meta.url).href;

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 监听窗口大小变化
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1201;
  };

  // 路由相关
  const route = useRoute(); // 获取路由实例

  // 支持的测试时间数组
  const supportedTimes = [1, 2, 5, 10, 15, 30, 60];

  // 路由参数：从URL中获取时间参数
  const routeTime = computed(() => route.params.time);

  // 测试时间：根据路由参数确定测试时长
  const testTime = computed(() => {
    const time = routeTime.value;
    const parsedTime = typeof time === 'string' ? parseInt(time) : 1; // 默认1秒
    return supportedTimes.includes(parsedTime) ? parsedTime : 1;
  });

  // 根据测试时间获取对应的FAQ翻译
  const currentFaq = computed(() => {
    const time = testTime.value;
    // 返回当前时间对应的FAQ翻译数组
    return [
      {
        q: t(`faqClick${time}Q1`),
        a: t(`faqClick${time}A1`),
        relatedQuestions: [t(`faqClick${time}Q2`), t(`faqClick${time}Q3`)],
      },
      {
        q: t(`faqClick${time}Q2`),
        a: t(`faqClick${time}A2`),
        relatedQuestions: [t(`faqClick${time}Q1`), t(`faqClick${time}Q4`)],
      },
      {
        q: t(`faqClick${time}Q3`),
        a: t(`faqClick${time}A3`),
        relatedQuestions: [t(`faqClick${time}Q1`), t(`faqClick${time}Q2`)],
      },
      {
        q: t(`faqClick${time}Q4`),
        a: t(`faqClick${time}A4`),
        relatedQuestions: [t(`faqClick${time}Q2`), t(`faqClick${time}Q3`)],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t(`faqClick${testTime.value}Q1`), t(`faqClick${testTime.value}Q2`), t('homeFaqQ1')];
  });

  // 鼠标按键选择状态
  const mouseButtonOptions = computed(() => [
    // 可选按键列表，使用computed实现响应式翻译
    { value: 0, label: t('leftMouseButton') }, // 左键
    { value: 2, label: t('rightMouseButton') }, // 右键
  ]);

  // 点击区域DOM引用
  const clickAreaRef = ref<HTMLElement | null>(null);

  // 使用composable函数
  const { ripples, addRipple, clearRipples } = useRippleEffect();
  const { addHistoryRecord, filteredHistory: getFilteredHistory } =
    useClickTestHistory('clickTest');

  // 计算属性：根据当前测试时长筛选历史记录
  const filteredHistory = computed(() => getFilteredHistory(testTime.value));

  // 游戏状态和方法
  const isPlaying = ref(false);
  const isGameOver = ref(false);
  const clicks = ref(0);
  const cps = ref(0);
  const elapsedTime = ref(0);
  const showResultModal = ref(false);
  const selectedMouseButton = ref(0);
  const isTimeUp = ref(false);
  const currentCps = ref(0);

  // 游戏方法
  let gameInstance: any = null;

  // 初始化游戏实例
  const initGame = (time: number) => {
    gameInstance = useClickTestGame(time);

    // 同步游戏状态到本地ref
    isPlaying.value = gameInstance.isPlaying.value;
    isGameOver.value = gameInstance.isGameOver.value;
    clicks.value = gameInstance.clicks.value;
    cps.value = gameInstance.cps.value;
    elapsedTime.value = gameInstance.elapsedTime.value;
    showResultModal.value = gameInstance.showResultModal.value;
    selectedMouseButton.value = gameInstance.selectedMouseButton.value;
    isTimeUp.value = gameInstance.isTimeUp.value;
    currentCps.value = gameInstance.currentCps.value;

    // 监听游戏实例状态变化，实时同步到本地ref
    watch(
      () => gameInstance.isPlaying.value,
      (newValue) => {
        isPlaying.value = newValue;
      }
    );

    // 监听已用时间变化，实时更新
    watch(
      () => gameInstance.elapsedTime.value,
      (newValue) => {
        elapsedTime.value = newValue;
      }
    );

    // 监听当前CPS变化，实时更新
    watch(
      () => gameInstance.currentCps.value,
      (newValue) => {
        currentCps.value = newValue;
      }
    );

    // 监听点击次数变化，实时更新
    watch(
      () => gameInstance.clicks.value,
      (newValue) => {
        clicks.value = newValue;
      }
    );

    // 监听游戏结束状态变化，实时更新
    watch(
      () => gameInstance.isGameOver.value,
      (newValue) => {
        isGameOver.value = newValue;
        // 当游戏结束时，保存历史记录
        if (newValue) {
          endGame();
        }
      }
    );

    // 监听结果弹窗状态变化，实时更新
    watch(
      () => gameInstance.showResultModal.value,
      (newValue) => {
        showResultModal.value = newValue;
        // 当结果弹窗显示时，同步所有状态，确保cps值正确
        if (newValue) {
          isPlaying.value = gameInstance.isPlaying.value;
          isGameOver.value = gameInstance.isGameOver.value;
          clicks.value = gameInstance.clicks.value;
          cps.value = gameInstance.cps.value;
          elapsedTime.value = gameInstance.elapsedTime.value;
          isTimeUp.value = gameInstance.isTimeUp.value;
          currentCps.value = gameInstance.currentCps.value;
        }
      }
    );

    // 监听时间是否到了状态变化，实时更新
    watch(
      () => gameInstance.isTimeUp.value,
      (newValue) => {
        isTimeUp.value = newValue;
      }
    );

    // 监听cps变化，实时更新
    watch(
      () => gameInstance.cps.value,
      (newValue) => {
        cps.value = newValue;
      }
    );
  };

  // 初始化游戏
  initGame(testTime.value);

  // 监听testTime变化，更新游戏状态
  watch(testTime, (newTime) => {
    initGame(newTime);
    resetGame();
  });

  // 游戏方法
  const handleGameClick = (button: number) => {
    if (gameInstance) {
      const result = gameInstance.handleClick(button);

      // 同步游戏状态到本地ref
      isPlaying.value = gameInstance.isPlaying.value;
      isGameOver.value = gameInstance.isGameOver.value;
      clicks.value = gameInstance.clicks.value;
      cps.value = gameInstance.cps.value;
      elapsedTime.value = gameInstance.elapsedTime.value;
      showResultModal.value = gameInstance.showResultModal.value;
      selectedMouseButton.value = gameInstance.selectedMouseButton.value;
      isTimeUp.value = gameInstance.isTimeUp.value;
      currentCps.value = gameInstance.currentCps.value;

      return result;
    }
    return false;
  };

  const resetGame = () => {
    if (gameInstance) {
      gameInstance.resetGame();
      // 同步状态
      isPlaying.value = gameInstance.isPlaying.value;
      isGameOver.value = gameInstance.isGameOver.value;
      clicks.value = gameInstance.clicks.value;
      cps.value = gameInstance.cps.value;
      elapsedTime.value = gameInstance.elapsedTime.value;
      showResultModal.value = gameInstance.showResultModal.value;
      selectedMouseButton.value = gameInstance.selectedMouseButton.value;
      isTimeUp.value = gameInstance.isTimeUp.value;
      currentCps.value = gameInstance.currentCps.value;
    }
    clearRipples();
  };

  const endGame = () => {
    if (gameInstance) {
      // 检查游戏是否已经结束
      if (!gameInstance.isGameOver.value) {
        // 游戏还没有结束，调用gameInstance.endGame()函数
        const result = gameInstance.endGame();
        if (result) {
          addHistoryRecord(result.testTime, result.clicks, result.cps);
          // 同步状态
          isPlaying.value = gameInstance.isPlaying.value;
          isGameOver.value = gameInstance.isGameOver.value;
          clicks.value = gameInstance.clicks.value;
          cps.value = gameInstance.cps.value;
          elapsedTime.value = gameInstance.elapsedTime.value;
          showResultModal.value = gameInstance.showResultModal.value;
          isTimeUp.value = gameInstance.isTimeUp.value;
          currentCps.value = gameInstance.currentCps.value;
        }
        return result;
      } else {
        // 游戏已经结束，保存历史记录
        addHistoryRecord(testTime.value, gameInstance.clicks.value, gameInstance.cps.value);
        // 同步状态
        isPlaying.value = gameInstance.isPlaying.value;
        isGameOver.value = gameInstance.isGameOver.value;
        clicks.value = gameInstance.clicks.value;
        cps.value = gameInstance.cps.value;
        elapsedTime.value = gameInstance.elapsedTime.value;
        showResultModal.value = gameInstance.showResultModal.value;
        isTimeUp.value = gameInstance.isTimeUp.value;
        currentCps.value = gameInstance.currentCps.value;
        // 返回结果
        return {
          clicks: gameInstance.clicks.value,
          cps: gameInstance.cps.value,
          testTime: testTime.value,
        };
      }
    }
    return null;
  };

  // 选择鼠标按键
  const selectMouseButton = (button: number) => {
    if (gameInstance) {
      gameInstance.selectMouseButton(button);
      selectedMouseButton.value = gameInstance.selectedMouseButton.value;
    }
  };

  // 点击事件处理函数
  const handleClick = (event: MouseEvent) => {
    // 获取点击位置相对于点击区域的坐标
    let x = 0;
    let y = 0;

    if (clickAreaRef.value) {
      // 每次点击都获取最新的位置信息，确保坐标准确
      const rect = clickAreaRef.value.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // 处理游戏点击逻辑
    const clicked = handleGameClick(event.button);

    // 如果点击有效，添加涟漪特效
    if (clicked) {
      addRipple(x, y);
    }
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  // 路由更新前钩子：当路由切换时重置游戏数据
  // 实现每次点击侧边栏切换路由时，重置当前组件的数据
  onBeforeRouteUpdate(() => {
    resetGame();
  });
</script>

<template>
  <div class="game-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧游戏区域 -->
      <div class="game-area">
        <!-- 标题栏 -->
        <h2 class="game-title">{{ testTime }} {{ t('secClickTest') }}</h2>
        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card timer-card">
            <div class="stat-value">
              {{ !isPlaying && clicks === 0 ? 0 : elapsedTime.toFixed(3) }}
            </div>
            <div class="stat-label">{{ t('timer') }}</div>
          </div>
          <div class="stat-card click-rate-card">
            <div class="stat-value">
              {{ !isPlaying && clicks === 0 ? 0 : currentCps.toFixed(2) }}
            </div>
            <div class="stat-label">{{ t('clickPerSecond') }}</div>
          </div>
          <div class="stat-card score-card">
            <div class="stat-value">{{ clicks }}</div>
            <div class="stat-label">{{ t('score') }}</div>
          </div>
        </div>

        <!-- 鼠标按键选择器 -->
        <div class="mouse-button-selector">
          <h3>{{ t('selectMouseButton') }}</h3>
          <div class="button-options">
            <button
              v-for="option in mouseButtonOptions"
              :key="option.value"
              class="button-option"
              :class="{ active: selectedMouseButton === option.value }"
              @click="selectMouseButton(option.value)"
            >
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <!-- 点击区域 -->
        <div
          ref="clickAreaRef"
          class="click-area"
          :class="{ playing: isPlaying, 'time-up': isTimeUp }"
          @click="(e) => handleClick(e)"
          @contextmenu.prevent="(e) => handleClick(e)"
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

          <div v-if="isPlaying">
            <!-- 游戏进行中 -->
          </div>
          <div v-else class="start-text">{{ t('clickHere') }} {{ t('startGame') }}</div>
        </div>

        <!-- 相关测试推荐组件 -->
        <component :is="RelatedTests" current-test="clickTest" />

        <!-- 历史记录区域 - 中等屏幕和移动端显示在相关测试推荐组件下方 -->
        <div v-if="!isDesktop" class="history-sidebar">
          <div class="history-header">
            <h3>
              <img
                :src="historyIconUrl"
                width="30"
                height="30"
                :alt="t('historyIconAlt')"
                class="history-icon"
              />
              {{ t('history') }}
            </h3>
          </div>

          <div class="history-list">
            <div v-if="filteredHistory.length === 0" class="no-history">
              {{ t('noHistory') }}
            </div>
            <div v-for="record in filteredHistory" :key="record.id" class="history-item">
              <div class="history-item-content">
                <div class="main-data">
                  <span class="cps-value">{{ record.cps }}</span>
                  <span class="unit">CPS</span>
                </div>
                <div class="tags">
                  <span class="tag clicks-tag">{{ record.clicks }}{{ t('clicks') }}</span>
                </div>
                <div class="record-time">
                  {{ record.date }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 新的通用FAQ组件 -->
        <div class="faq-section">
          <!-- 顶部大标题FAQ项 -->
          <div class="faq-intro">
            <h4>{{ t('faqTitle', { time: testTime }) }}</h4>
            <p>{{ t('faqDesc', { time: testTime }) }}</p>
          </div>

          <!-- 使用通用FAQ组件 -->
          <component
            :is="FAQComponent"
            :title="t('faq')"
            :faq="currentFaq"
            :show-popular="true"
            :popular-questions="popularQuestions"
          />
        </div>
      </div>

      <!-- 历史记录区域 - 桌面端显示在右侧 -->
      <div v-if="isDesktop" class="history-sidebar">
        <div class="history-header">
          <h3>
            <img
              :src="historyIconUrlRelative"
              width="30"
              height="30"
              :alt="t('historyIconAlt')"
              class="history-icon"
            />
            {{ t('history') }}
          </h3>
        </div>

        <div class="history-list">
          <div v-if="filteredHistory.length === 0" class="no-history">
            {{ t('noHistory') }}
          </div>
          <div v-for="record in filteredHistory" :key="record.id" class="history-item">
            <div class="history-item-content">
              <div class="main-data">
                <span class="cps-value">{{ record.cps }}</span>
                <span class="unit">CPS</span>
              </div>
              <div class="tags">
                <span class="tag clicks-tag">{{ record.clicks }}{{ t('clicks') }}</span>
              </div>
              <div class="record-time">
                {{ record.date }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 结果弹窗组件 -->
  <component
    :is="ResultModal"
    :visible="showResultModal"
    :type="'clickTest'"
    :cps="cps"
    :time="testTime"
    @close="resetGame"
  />
</template>

<style scoped>
  /* 游戏容器 */
  .game-container {
    margin: 0 auto;
    text-align: center;
    padding: clamp(10px, 2vw, 20px);
    background-color: #000000;
    box-shadow: none;
    width: 100%;
    border-radius: 10px;
    box-sizing: border-box;
  }

  /* 主内容区域 - 左侧游戏 + 右侧历史记录 */
  .main-content {
    display: flex;
    gap: clamp(10px, 2vw, 20px);
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }

  /* 电脑端布局：历史记录显示在右侧 */
  @media (min-width: 1201px) {
    .main-content {
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    .game-area {
      flex: 1;
      width: auto;
    }

    .history-sidebar {
      flex: 0 0 clamp(250px, 20vw, 350px);
      margin-top: 0;
      margin-right: 0;
      height: clamp(280px, 50vh, 400px);
    }
  }

  /* 中等屏幕布局优化：历史记录显示在相关测试推荐组件下方 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .main-content {
      flex-direction: column;
      align-items: center;
    }

    .game-area {
      max-width: 100%;
      width: 100%;
    }

    .history-sidebar {
      width: 100%;
      max-width: 100%;
      margin: 20px auto 0;
      height: clamp(280px, 40vh, 350px);
    }
  }

  /* 左侧游戏区域 */
  .game-area {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 clamp(10px, 2vw, 20px) 0;
    font-size: clamp(24px, 4vw, 28px);
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  /* 右侧历史记录侧边栏 */
  .history-sidebar {
    width: 100%;
    background-color: #1a1a1a;
    border-radius: 8px;
    padding: clamp(10px, 2vw, 15px);
    height: clamp(280px, 50vh, 400px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    margin-top: 10px;
    margin-right: 0;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  /* 历史记录标题 */
  .history-header {
    margin-bottom: 15px;
  }

  .history-header h3 {
    color: #ffffff; /* 设置文字颜色为白色，确保在深色背景上清晰可见 */
    font-size: 18px; /* 设置字体大小为18像素，作为标题层级的标准大小 */
    margin: 0 0 12px 0; /* 清除上下外边距，只保留底部12像素外边距，与下方内容保持适当距离 */
    text-align: left; /* 设置文字左对齐，符合标题的常规排版 */
    display: flex; /* 使用flex布局，便于图标和文字的水平排列 */
    align-items: center; /* 垂直居中对齐，确保图标和文字在同一水平线上 */
    gap: 8px; /* 设置图标与文字之间的间距为8像素，保证视觉层次感 */
  }

  /* 历史记录列表 */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    overflow-y: auto;
    padding: 5px;
  }

  /* 无历史记录提示 */
  .no-history {
    color: #888;
    text-align: center;
    padding: 40px 10px;
    font-style: italic;
    font-size: 13px;
  }

  /* 历史记录项 */
  .history-item {
    background-color: #2a2a2a;
    border-radius: 4px;
    padding: 8px 10px;
    transition: all 0.2s ease;
    border: 1px solid #333;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
  }

  .history-item:hover {
    background-color: #333;
    border-color: #4caf50;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    z-index: 2;
  }

  /* 历史记录图标 */
  .history-icon {
    font-size: 20px;
  }

  /* 历史记录项内容 */
  .history-item-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  /* 主要数据 */
  .main-data {
    display: flex;
    align-items: baseline;
    gap: 5px;
    flex: 0 0 auto;
  }

  .main-data .cps-value {
    color: #ffa500;
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
  }

  .main-data .unit {
    color: #888;
    font-size: 11px;
    font-weight: normal;
  }

  /* 标签区域 */
  .tags {
    display: flex;
    gap: 8px;
    flex: 1;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
  }

  /* 标签样式 */
  .tag {
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* 点击次数标签 */
  .clicks-tag {
    background-color: #2196f3;
    color: #ffffff;
  }

  /* 记录时间 */
  .record-time {
    color: #888;
    font-size: 11px;
    font-weight: normal;
    text-align: right;
    white-space: nowrap;
    flex: 0 0 auto;
  }

  /* 滚动条样式 */
  .history-list::-webkit-scrollbar {
    width: 6px;
  }

  .history-list::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 3px;
    margin: 8px 0;
  }

  .history-list::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  .history-list::-webkit-scrollbar-thumb:hover {
    background: #45a049;
    transform: scaleX(1.2);
  }

  .history-list::-webkit-scrollbar-thumb:active {
    background: #3d8b40;
  }

  /* 滚动条角落 */
  .history-list::-webkit-scrollbar-corner {
    background: #1a1a1a;
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

  /* 点击区域 */
  .click-area {
    width: clamp(90%, 98vw, 100%);
    height: clamp(250px, 50vh, 400px);
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
  }

  .click-area:hover {
    transform: none;
  }

  .click-area.playing {
    background-color: #000000;
  }

  .click-area.time-up {
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
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); /* 减弱发光效果 */
    border: 1px solid rgba(255, 255, 255, 0.2); /* 更淡的白色边框 */
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

  /* 开始文字 */
  .start-text {
    position: relative;
    z-index: 2;
    font-size: clamp(20px, 3vw, 24px);
    font-weight: bold;
    color: white;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    text-align: center;
    padding: 0 20px;
  }

  /* FAQ 部分 */
  .faq-section {
    margin-top: 30px;
    margin-bottom: 30px;
    width: 100%;
  }

  /* FAQ 介绍部分 */
  .faq-intro {
    text-align: center;
    margin-bottom: 20px;
    padding: 20px;
    background-color: rgba(20, 20, 20, 0.8);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    width: 100%;
    box-sizing: border-box;
  }

  .faq-intro h4 {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: clamp(18px, 3vw, 22px);
  }

  .faq-intro p {
    color: #cccccc;
    margin: 0;
    line-height: 1.6;
    font-size: clamp(12px, 2vw, 14px);
    padding: 0 10px;
  }

  /* 鼠标按键选择器样式 */
  .mouse-button-selector {
    text-align: center;
    margin: 10px auto; /* 水平居中，上下间距20px */
    padding: 12px 15px; /* 减少垂直内边距，保持水平内边距 */
    background-color: #1a1a1a;
    border-radius: 8px;
    width: 100%; /* 响应式宽度 */
    max-width: 700px; /* 最大宽度限制 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直方向排列 */
    align-items: center; /* 水平居中对齐 */
    justify-content: center; /* 垂直居中对齐 */
    box-sizing: border-box; /* 确保padding不会影响宽度 */
  }

  .mouse-button-selector h3 {
    color: #4caf50;
    margin-bottom: 10px; /* 减少底部外边距 */
    font-size: 18px;
    margin-top: 0; /* 确保顶部没有多余间距 */
  }

  .button-options {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 5px; /* 减少顶部外边距 */
    margin-bottom: 0; /* 确保底部没有多余间距 */
  }

  .button-option {
    padding: 10px 20px;
    border: 2px solid #4caf50;
    background-color: #2a2a2a;
    color: #4caf50;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: bold;
    font-size: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: none;
    outline: none;
  }

  .button-option::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background-color: rgba(76, 175, 80, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.4s,
      height 0.4s;
    z-index: 0;
  }

  .button-option span {
    position: relative;
    z-index: 1;
  }

  .button-option:active::before {
    width: 300px;
    height: 300px;
  }

  .button-option:hover {
    background-color: #4caf50;
    color: white;
    transform: translateY(-2px);
    box-shadow: none;
  }

  .button-option:active {
    transform: translateY(0);
    box-shadow: none;
    transition: all 0.05s ease;
  }

  .button-option.active {
    background-color: #4caf50;
    color: white;
    box-shadow: none;
  }

  .button-option:focus {
    outline: none;
    box-shadow: none;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 历史记录在移动端显示在点击区域下方，FAQ上方 */
    .main-content {
      flex-direction: column;
      align-items: center;
    }

    .game-area {
      max-width: 100%;
    }

    .history-sidebar {
      width: 100%;
      max-width: 100%;
      margin: 20px auto 0;
      height: clamp(250px, 40vh, 300px);
    }

    .faq-section {
      margin-top: 20px;
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
      font-size: clamp(20px, 5vw, 24px);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: clamp(10px, 2vw, 12px);
    }

    /* 点击区域优化 */
    .click-area {
      height: clamp(200px, 40vh, 300px);
      font-size: clamp(18px, 4vw, 20px);
      width: clamp(95%, 98vw, 98%);
    }

    /* 历史记录列表优化 */
    .history-item {
      padding: clamp(8px, 2vw, 12px);
    }

    .history-item-content {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .tags {
      justify-content: flex-start;
    }

    .record-time {
      width: auto;
      text-align: right;
      font-size: clamp(10px, 2vw, 12px);
    }

    /* 鼠标按键选择器移动端适配 */
    .mouse-button-selector {
      margin: clamp(10px, 2vw, 15px) 0;
      padding: clamp(8px, 2vw, 12px);
    }

    .mouse-button-selector h3 {
      font-size: clamp(14px, 3vw, 16px);
      margin-bottom: clamp(8px, 2vw, 12px);
    }

    .button-option {
      padding: clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px);
      font-size: clamp(12px, 2.5vw, 14px);
    }
  }

  /* 超小屏幕适配 */
  @media (max-width: 480px) {
    .click-area {
      height: clamp(180px, 35vh, 250px);
    }

    .history-sidebar {
      height: clamp(220px, 35vh, 280px);
    }

    .game-title {
      font-size: clamp(20px, 5vw, 24px);
    }
  }
</style>
