<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { t } from '../i18n/index';
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 懒加载结果弹窗组件
  const ResultModal = defineAsyncComponent(() => import('./ResultModal.vue'));
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // TypeScript 类型定义
  interface Ripple {
    id: number;
    x: number;
    y: number;
  }

  interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    clicks: number;
    cps: number;
    elapsedTime: number;
    showResultModal: boolean;
    selectedMouseButton: number;
    isTimeUp: boolean;
    currentCps: number;
  }

  interface HistoryRecord {
    id: number;
    testTime: number;
    clicks: number;
    cps: number;
    date: string;
  }

  interface RippleEffect {
    ripples: any;
    addRipple: (x: number, y: number) => number;
    clearRipples: () => void;
  }

  interface ClickTestGame {
    isPlaying: { value: boolean };
    isGameOver: { value: boolean };
    clicks: { value: number };
    cps: { value: number };
    elapsedTime: { value: number };
    showResultModal: { value: boolean };
    selectedMouseButton: { value: number };
    isTimeUp: { value: boolean };
    currentCps: { value: number };
    handleClick: (button: number) => boolean;
    resetGame: () => void;
    selectMouseButton: (button: number) => void;
  }

  interface ClickTestHistory {
    addHistoryRecord: (time: number, clicks: number, cps: number) => void;
    filteredHistory: (time: number) => HistoryRecord[];
  }

  type UseClickTestGame = (time: number) => ClickTestGame;
  type UseClickTestHistory = (testType: string) => ClickTestHistory;
  type UseRippleEffect = () => RippleEffect;

  // 动态导入所有composable函数，避免在组件加载时立即加载
  let useClickTestGame: UseClickTestGame | null = null;
  let useClickTestHistory: UseClickTestHistory | null = null;
  let useRippleEffect: UseRippleEffect | null = null;

  // 懒加载composable函数
  const loadComposables = async () => {
    if (!useClickTestGame || !useClickTestHistory || !useRippleEffect) {
      const { useClickTestGame: gameComposable } = await import('../composables/useClickTestGame');
      const { useClickTestHistory: historyComposable } =
        await import('../composables/useClickTestHistory');
      const { useRippleEffect: rippleComposable } = await import('../composables/useRippleEffect');
      useClickTestGame = gameComposable;
      useClickTestHistory = historyComposable;
      useRippleEffect = rippleComposable;
    }
  };

  // 导入图标资源（静态数据）
  const historyIconUrl = new URL('@/assets/icons/history.png', import.meta.url).href;

  // 支持的测试时间数组（静态数据）
  const supportedTimes = [1, 2, 5, 10, 15, 30, 60];

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 节流函数，减少频繁触发
  const throttle = (func: Function, delay: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), delay);
      }
    };
  };

  // 监听窗口大小变化（使用节流优化）
  const handleResize = throttle(() => {
    isDesktop.value = window.innerWidth >= 1201;
  }, 200);

  // 路由相关
  const route = useRoute(); // 获取路由实例

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

  // 涟漪效果相关
  let ripples: Ripple[] = [];
  let addRipple: ((x: number, y: number) => void) | null = null;
  let clearRipples: (() => void) | null = null;

  // 游戏状态和方法
  const gameState = ref<GameState>({
    isPlaying: false,
    isGameOver: false,
    clicks: 0,
    cps: 0,
    elapsedTime: 0,
    showResultModal: false,
    selectedMouseButton: 0,
    isTimeUp: false,
    currentCps: 0,
  });

  // 历史记录相关
  let addHistoryRecord: ((time: number, clicks: number, cps: number) => void) | null = null;
  const getFilteredHistory = ref<((time: number) => HistoryRecord[]) | null>(null);
  let historyInstance: any = null;

  // 历史记录相关
  // 计算属性：根据当前测试时长筛选历史记录
  const filteredHistory = computed<HistoryRecord[]>(() => {
    if (getFilteredHistory.value) {
      return getFilteredHistory.value(testTime.value);
    }
    return [];
  });

  // 游戏方法
  let gameInstance: ClickTestGame | null = null;

  // 初始化游戏实例
  const initGame = async (time: number) => {
    await loadComposables();
    
    // 确保 useClickTestGame 不为 null
    if (useClickTestGame) {
      gameInstance = useClickTestGame(time);

      // 初始化涟漪效果
      if (useRippleEffect) {
        const rippleEffects = useRippleEffect();
        ripples = rippleEffects.ripples;
        addRipple = rippleEffects.addRipple;
        clearRipples = rippleEffects.clearRipples;
      }

      // 同步游戏状态到本地ref
      const syncGameState = () => {
        if (gameInstance) {
          gameState.value.isPlaying = gameInstance.isPlaying.value;
          gameState.value.isGameOver = gameInstance.isGameOver.value;
          gameState.value.clicks = gameInstance.clicks.value;
          gameState.value.cps = gameInstance.cps.value;
          gameState.value.elapsedTime = gameInstance.elapsedTime.value;
          gameState.value.showResultModal = gameInstance.showResultModal.value;
          gameState.value.selectedMouseButton = gameInstance.selectedMouseButton.value;
          gameState.value.isTimeUp = gameInstance.isTimeUp.value;
          gameState.value.currentCps = gameInstance.currentCps.value;
        }
      };

      // 初始同步
      syncGameState();

      // 监听游戏结束状态变化，实时更新
      watch(
        () => gameInstance?.isGameOver.value || false,
        (newValue) => {
          gameState.value.isGameOver = newValue;
        }
      );

      // 监听结果弹窗状态变化，实时更新
      watch(
        () => gameInstance?.showResultModal.value || false,
        async (newValue) => {
          gameState.value.showResultModal = newValue;
          // 当结果弹窗显示时，同步所有状态，确保cps值正确
          if (newValue && gameInstance) {
            syncGameState();
            // 当结果弹窗显示时，保存历史记录
            if (addHistoryRecord) {
              addHistoryRecord(testTime.value, gameInstance.clicks.value, gameInstance.cps.value);
            }
          }
        }
      );

      // 监听已用时间变化，实时更新
      watch(
        () => gameInstance?.elapsedTime.value || 0,
        (newValue) => {
          gameState.value.elapsedTime = newValue;
        }
      );

      // 监听当前CPS变化，实时更新
      watch(
        () => gameInstance?.currentCps.value || 0,
        (newValue) => {
          gameState.value.currentCps = newValue;
        }
      );

      // 监听游戏进行状态变化，实时更新
      watch(
        () => gameInstance?.isPlaying.value || false,
        (newValue) => {
          gameState.value.isPlaying = newValue;
        }
      );

      // 监听点击次数变化，实时更新
      watch(
        () => gameInstance?.clicks.value || 0,
        (newValue) => {
          gameState.value.clicks = newValue;
        }
      );
    }
  };

  // 初始化历史记录
  const initHistory = async () => {
    await loadComposables();
    if (useClickTestHistory) {
      historyInstance = useClickTestHistory('clickTest');
      if (historyInstance) {
        addHistoryRecord = historyInstance.addHistoryRecord;
        getFilteredHistory.value = historyInstance.filteredHistory;
      }
    }
  };

  // 组件挂载时初始化
  onMounted(async () => {
    await initHistory();
    await initGame(testTime.value);
  });

  // 监听testTime变化，更新游戏状态
  watch(testTime, async (newTime) => {
    await initGame(newTime);
    resetGame();
  });

  // 游戏方法
  const handleGameClick = (button: number) => {
    if (gameInstance) {
      const result = gameInstance.handleClick(button);
      // 同步游戏状态到本地ref
      gameState.value.isPlaying = gameInstance.isPlaying.value;
      gameState.value.clicks = gameInstance.clicks.value;
      gameState.value.currentCps = gameInstance.currentCps.value;
      gameState.value.elapsedTime = gameInstance.elapsedTime.value;
      return result;
    }
    return false;
  };

  const resetGame = () => {
    if (gameInstance) {
      gameInstance.resetGame();
      // 同步状态
      gameState.value.isPlaying = gameInstance.isPlaying.value;
      gameState.value.isGameOver = gameInstance.isGameOver.value;
      gameState.value.clicks = gameInstance.clicks.value;
      gameState.value.cps = gameInstance.cps.value;
      gameState.value.elapsedTime = gameInstance.elapsedTime.value;
      gameState.value.showResultModal = gameInstance.showResultModal.value;
      gameState.value.selectedMouseButton = gameInstance.selectedMouseButton.value;
      gameState.value.isTimeUp = gameInstance.isTimeUp.value;
      gameState.value.currentCps = gameInstance.currentCps.value;
    }
    // 检查clearRipples是否已初始化
    if (clearRipples) {
      clearRipples();
    }
  };

  // 选择鼠标按键
  const selectMouseButton = (button: number) => {
    if (gameInstance) {
      gameInstance.selectMouseButton(button);
      gameState.value.selectedMouseButton = gameInstance.selectedMouseButton.value;
    }
  };

  // 处理键盘事件的函数
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // 使用点击区域的中心作为默认点击位置
      const x = clickAreaRef.value ? clickAreaRef.value.offsetWidth / 2 : 0;
      const y = clickAreaRef.value ? clickAreaRef.value.offsetHeight / 2 : 0;
      processClick(x, y, gameState.value.selectedMouseButton);
    }
  };

  // 涟漪效果性能优化：限制同时存在的涟漪数量
  const MAX_RIPPLES = 10;
  let rippleCount = 0;

  // 统一的点击处理函数
  const processClick = (x: number, y: number, button: number = 0) => {
    // 处理游戏点击逻辑
    const clicked = handleGameClick(button);

    // 如果点击有效，添加涟漪特效
    if (clicked && rippleCount < MAX_RIPPLES) {
      // 检查addRipple是否已初始化
      if (addRipple) {
        addRipple(x, y);
        rippleCount++;
        
        // 300ms后减少涟漪计数，允许新的涟漪生成
        setTimeout(() => {
          rippleCount = Math.max(0, rippleCount - 1);
        }, 300);
      }
    }
    return clicked;
  };

  // 点击事件处理函数
  const handleClick = (event: MouseEvent) => {
    // 获取点击位置相对于点击区域的坐标
    let x = 0;
    let y = 0;

    if (clickAreaRef.value) {
      // 每次点击都获取最新的位置信息，确保点击位置和涟漪效果位置一致
      const rect = clickAreaRef.value.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // 调用统一的点击处理函数
    return processClick(x, y, event.button);
  };

  // 触摸事件处理函数 - 优化移动端体验
  const handleTouch = (event: TouchEvent) => {
    // 防止触摸事件的默认行为，避免滚动和缩放干扰
    event.preventDefault();
    event.stopPropagation();

    // 获取触摸位置相对于点击区域的坐标
    let x = 0;
    let y = 0;

    if (clickAreaRef.value && event.touches.length > 0) {
      const rect = clickAreaRef.value.getBoundingClientRect();
      const touch = event.touches[0];
      if (touch) {
        // 优化触摸坐标计算，确保在不同设备和屏幕方向下都能准确计算
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
        
        // 限制坐标范围，确保触摸位置在点击区域内
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));
      }
    }

    // 调用统一的点击处理函数（默认使用左键）
    return processClick(x, y, 0);
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
        <h2 class="game-title" aria-label="{{ testTime }} {{ t('secClickTest') }}">{{ testTime }} {{ t('secClickTest') }}</h2>
        <!-- 统计卡片 -->
        <div class="stats-cards" role="group" aria-label="{{ t('gameStats') }}">
          <div class="stat-card timer-card" role="status" aria-live="polite">
            <div class="stat-value" aria-label="{{ t('timer') }}: {{ !gameState.isPlaying && gameState.clicks === 0 ? 0 : gameState.elapsedTime.toFixed(3) }} {{ t('seconds') }}">
              {{ 
                !gameState.isPlaying && gameState.clicks === 0
                  ? 0
                  : gameState.elapsedTime.toFixed(3)
              }}
            </div>
            <div class="stat-label">{{ t('timer') }}</div>
          </div>
          <div class="stat-card click-rate-card" role="status" aria-live="polite">
            <div class="stat-value" aria-label="{{ t('clickPerSecond') }}: {{ !gameState.isPlaying && gameState.clicks === 0 ? 0 : gameState.currentCps.toFixed(2) }}">
              {{ 
                !gameState.isPlaying && gameState.clicks === 0 ? 0 : gameState.currentCps.toFixed(2)
              }}
            </div>
            <div class="stat-label">{{ t('clickPerSecond') }}</div>
          </div>
          <div class="stat-card score-card" role="status" aria-live="polite">
            <div class="stat-value" aria-label="{{ t('score') }}: {{ gameState.clicks }}">{{ gameState.clicks }}</div>
            <div class="stat-label">{{ t('score') }}</div>
          </div>
        </div>

        <!-- 鼠标按键选择器 -->
        <div class="mouse-button-selector" role="radiogroup" aria-label="{{ t('selectMouseButton') }}">
          <h3>{{ t('selectMouseButton') }}</h3>
          <div class="button-options">
            <button
              v-for="option in mouseButtonOptions"
              :key="option.value"
              class="button-option"
              :class="{ active: gameState.selectedMouseButton === option.value }"
              @click="selectMouseButton(option.value)"
              role="radio"
              :aria-checked="gameState.selectedMouseButton === option.value"
              :aria-label="option.label"
              tabindex="0"
            >
              <span>{{ option.label }}</span>
            </button>
          </div>
        </div>

        <!-- 点击区域 -->
        <div
          ref="clickAreaRef"
          class="click-area"
          :class="{ playing: gameState.isPlaying, 'time-up': gameState.isTimeUp }"
          @click="(e) => handleClick(e)"
          @contextmenu.prevent="(e) => handleClick(e)"
          @touchstart.prevent="(e) => handleTouch(e)"
          @touchmove.prevent
          @touchend.prevent
          role="button"
          :aria-label="!gameState.isPlaying ? t('clickHere') + ' ' + t('startGame') : t('clickToPlay')"
          :aria-pressed="gameState.isPlaying"
          tabindex="0"
          @keydown="handleKeyDown"
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

          <div v-if="!gameState.isPlaying" class="start-text">
            {{ t('clickHere') }} {{ t('startGame') }}
          </div>
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

          <div 
            ref="historyContainerRef" 
            class="history-list"
          >
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
              :src="historyIconUrl"
              width="30"
              height="30"
              :alt="t('historyIconAlt')"
              class="history-icon"
            />
            {{ t('history') }}
          </h3>
        </div>

        <div 
            ref="historyContainerRef" 
            class="history-list"
          >
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
    :visible="gameState.showResultModal"
    :type="'clickTest'"
    :cps="gameState.cps"
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
    width: 100%;
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
    color: #ffffff;
    font-size: 18px;
    margin: 0 0 12px 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 历史记录列表 */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    overflow-y: auto;
    padding: 5px;
    min-height: 0;
  }

  /* 无历史记录提示 */
  .history-sidebar .no-history {
    color: #888;
    text-align: center;
    padding: 40px 10px;
    font-style: italic;
    font-size: 13px;
  }

  /* 更多历史记录提示 */
  .history-sidebar .history-more {
    color: #4caf50;
    text-align: center;
    padding: 10px;
    font-size: 12px;
    font-weight: bold;
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: 4px;
    margin-top: 12px;
  }

  /* 历史记录项 */
  .history-sidebar .history-item {
    background-color: #2a2a2a !important;
    border-radius: 4px !important;
    padding: 8px 10px !important;
    transition: all 0.2s ease !important;
    border: 1px solid #333 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    position: relative !important;
    z-index: 1 !important;
    line-height: 1 !important;
    height: auto !important;
    min-height: 36px !important;
  }

  .history-sidebar .history-item:hover {
    background-color: #333 !important;
    border-color: #4caf50 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3) !important;
    z-index: 2 !important;
  }

  /* 历史记录图标 */
  .history-icon {
    font-size: 20px;
  }

  /* 历史记录项内容 */
  .history-sidebar .history-item-content {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    flex: 1 !important;
    min-width: 0 !important;
  }

  /* 主要数据 */
  .history-sidebar .main-data {
    display: flex !important;
    align-items: baseline !important;
    gap: 5px !important;
    flex: 0 0 auto !important;
  }

  .history-sidebar .main-data .cps-value {
    color: #ffa500 !important;
    font-size: 20px !important;
    font-weight: bold !important;
    line-height: 1 !important;
  }

  .history-sidebar .main-data .unit {
    color: #888 !important;
    font-size: 11px !important;
    font-weight: normal !important;
  }

  /* 标签区域 */
  .history-sidebar .tags {
    display: flex !important;
    gap: 8px !important;
    flex: 1 !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    align-items: center !important;
  }

  /* 标签样式 */
  .history-sidebar .tag {
    padding: 3px 6px !important;
    border-radius: 3px !important;
    font-size: 11px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    letter-spacing: 0.3px !important;
  }

  /* 点击次数标签 */
  .history-sidebar .clicks-tag {
    background-color: #2196f3 !important;
    color: #ffffff !important;
  }

  /* 记录时间 */
  .history-sidebar .record-time {
    color: #888 !important;
    font-size: 11px !important;
    font-weight: normal !important;
    text-align: right !important;
    white-space: nowrap !important;
    flex: 0 0 auto !important;
  }

  /* 滚动条样式 */
  .history-sidebar .history-list::-webkit-scrollbar {
    width: 6px;
  }

  .history-sidebar .history-list::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 3px;
    margin: 8px 0;
  }

  .history-sidebar .history-list::-webkit-scrollbar-thumb {
    background: #4caf50;
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  .history-sidebar .history-list::-webkit-scrollbar-thumb:hover {
    background: #45a049;
    transform: scaleX(1.2);
  }

  .history-sidebar .history-list::-webkit-scrollbar-thumb:active {
    background: #3d8b40;
  }

  /* 滚动条角落 */
  .history-sidebar .history-list::-webkit-scrollbar-corner {
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
    will-change: transform, opacity, width, height;
  }

  /* 涟漪动画 */
  @keyframes ripple-animation {
    0% {
      width: 0px;
      height: 0px;
      opacity: 0.8;
    }
    100% {
      width: 400px;
      height: 400px;
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
    will-change: transform, background-color, color, box-shadow;
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
      margin: 16px 0 0;
      height: 280px;
    }

    .faq-section {
      margin-top: 16px;
    }

    /* 点击区域优化 */
    .click-area {
      height: 250px;
      font-size: 18px;
      width: 98%;
      border-radius: 12px;
    }

    /* 鼠标按键选择器移动端适配 */
    .mouse-button-selector {
      margin: 10px 0;
      padding: 10px;
    }

    .mouse-button-selector h3 {
      font-size: 14px;
      margin-bottom: 8px;
    }

    .button-option {
      padding: 8px 12px;
      font-size: 12px;
      transition: all 0.1s ease;
    }

    /* 简化移动端动画效果 */
    .ripple {
      animation: ripple-animation 400ms ease-out forwards;
    }

    @keyframes ripple-animation {
      0% {
        width: 0px;
        height: 0px;
        opacity: 0.7;
      }
      100% {
        width: 300px;
        height: 300px;
        opacity: 0;
      }
    }
  }
</style>
