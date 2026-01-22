<script setup lang="ts">
  import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
  import { t } from '../i18n/index';

  // 导入图标资源
  const historyIconUrl = new URL('@/assets/icons/history.png', import.meta.url).href;
  const historyIconUrlRelative = new URL('../assets/icons/history.png', import.meta.url).href;

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 监听窗口大小变化
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1201;
  };

  // 组件功能：反应时间测试组件，测试用户的反应速度
  // 支持随机出现目标，计算反应时间，显示统计数据等功能
  // 支持两种测试模式：简单反应测试和颜色反应测试

  // 获取当前FAQ内容
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  const currentFaq = computed(() => {
    return [
      {
        q: t('reactionTestDescription'),
        a: t('reactionTestDescriptionText'),
        relatedQuestions: [t('reactionTestUsefulness'), t('reactionTimeRange')],
      },
      {
        q: t('reactionTestUsefulness'),
        a: t('reactionTestUsefulnessText'),
        relatedQuestions: [t('reactionTestDescription'), t('howToImproveReaction')],
      },
      {
        q: t('reactionTimeRange'),
        a: t('reactionTimeRangeText'),
        relatedQuestions: [t('reactionTestDescription'), t('reactionTestPrinciple')],
      },
      {
        q: t('howToImproveReaction'),
        a: t('howToImproveReactionText'),
        relatedQuestions: [t('reactionTestUsefulness'), t('reactionTestPrinciple')],
      },
      {
        q: t('reactionTestPrinciple'),
        a: t('reactionTestPrincipleText'),
        relatedQuestions: [t('reactionTestDescription'), t('reactionTimeRange')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('reactionTestDescription'), t('reactionTestUsefulness'), t('howToImproveReaction')];
  });

  // 测试模式枚举
  const TestMode = {
    SIMPLE: 'simple', // 简单反应测试
    COLOR: 'color', // 颜色反应测试
  } as const;

  // 游戏状态枚举
  const GameState = {
    READY: 'ready', // 准备状态
    WAITING: 'waiting', // 等待目标出现
    ACTIVE: 'active', // 目标已出现，等待用户点击
    RESULT: 'result', // 显示结果
  } as const;

  // 预定义颜色集合
  const COLORS = {
    RED: '#FF0000',
    GREEN: '#00FF00',
    BLUE: '#0000FF',
    YELLOW: '#FFFF00',
    BLACK: '#000000',
    WHITE: '#FFFFFF',
  } as const;

  // 颜色名称映射
  const COLOR_NAMES = {
    [COLORS.RED]: '红色',
    [COLORS.GREEN]: '绿色',
    [COLORS.BLUE]: '蓝色',
    [COLORS.YELLOW]: '黄色',
    [COLORS.BLACK]: '黑色',
    [COLORS.WHITE]: '白色',
  } as const;

  // 状态管理
  const gameState = ref(GameState.READY); // 当前游戏状态
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameOver = ref(false); // 游戏是否结束
  // 固定使用简单反应测试模式
  const testMode = ref<(typeof TestMode)[keyof typeof TestMode]>(TestMode.SIMPLE);
  const startTime = ref(0); // 目标出现时间戳
  const endTime = ref(0); // 用户点击时间戳
  const reactionTime = ref(0); // 单次反应时间（毫秒）
  const bestReactionTime = ref(0); // 最佳反应时间（毫秒）
  const averageReactionTime = ref(0); // 平均反应时间（毫秒）
  const totalTests = ref(0); // 测试总次数
  const currentRound = ref(0); // 当前测试轮次
  const maxRounds = ref(5); // 最大测试轮次
  const testResults = ref<number[]>([]); // 所有测试结果
  const targetPosition = ref({ x: 0, y: 0 }); // 目标位置
  const targetVisible = ref(false); // 目标是否可见
  const waitTime = ref(0); // 等待时间（毫秒）
  const countdown = ref(3); // 开始倒计时

  // 颜色测试相关状态
  const targetBgColor = ref<string>(COLORS.GREEN); // 目标背景色
  const targetTextColor = ref<string>(COLORS.WHITE); // 目标文字色
  const targetTextContent = ref<string>('绿色'); // 目标文字内容
  const correctAnswer = ref<string>(''); // 正确答案

  // 计算属性：格式化反应时间
  const formattedReactionTime = computed(() => {
    return reactionTime.value.toFixed(2);
  });

  // 计算属性：格式化最佳反应时间
  const formattedBestTime = computed(() => {
    return bestReactionTime.value > 0 ? bestReactionTime.value.toFixed(2) : '0.00';
  });

  // 计算属性：格式化平均反应时间
  const formattedAverageTime = computed(() => {
    return averageReactionTime.value > 0 ? averageReactionTime.value.toFixed(2) : '0.00';
  });

  // 历史记录类型定义
  interface HistoryRecord {
    id: number;
    bestTime: number; // 最佳反应时间（毫秒）
    averageTime: number; // 平均反应时间（毫秒）
    date: string; // 游戏开始的历史时间
    totalTests: number; // 测试总次数
  }

  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]); // 历史记录数组

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('reactionTimeHistory');
    if (saved) {
      historyRecords.value = JSON.parse(saved);
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem('reactionTimeHistory', JSON.stringify(historyRecords.value));
  };

  // 初始化加载历史记录
  loadHistory();

  // 监听游戏区域大小变化，更新containerSize
  onMounted(() => {
    // 初始设置容器大小
    if (typeof window !== 'undefined') {
      const updateContainerSize = () => {
        const activeArea = document.querySelector('.active-state');
        if (activeArea) {
          // 保存当前位置和容器大小（用于计算相对位置）
          const oldContainerWidth = containerSize.value.width;
          const oldContainerHeight = containerSize.value.height;
          const oldPositionX = targetPosition.value.x;
          const oldPositionY = targetPosition.value.y;

          // 更新容器大小 - 使用 active-state 的尺寸，因为目标元素是相对于它定位的
          const rect = activeArea.getBoundingClientRect();
          containerSize.value = { width: rect.width, height: rect.height };

          // 如果目标当前可见，保持相对位置并确保在容器内
          if (targetVisible.value && oldContainerWidth > 0 && oldContainerHeight > 0) {
            // 根据屏幕尺寸确定目标大小
            const targetSize = window.innerWidth <= 768 ? 70 : 100; // 移动端70px，桌面端100px

            // 计算相对位置比例
            const relativeX = oldPositionX / (oldContainerWidth - targetSize);
            const relativeY = oldPositionY / (oldContainerHeight - targetSize);

            // 根据新容器大小计算新位置
            const newX = relativeX * (containerSize.value.width - targetSize);
            const newY = relativeY * (containerSize.value.height - targetSize);

            // 更新位置，确保不超出边界
            targetPosition.value = {
              x: Math.max(0, Math.min(newX, containerSize.value.width - targetSize)),
              y: Math.max(0, Math.min(newY, containerSize.value.height - targetSize)),
            };
          }
        }
      };

      // 初始更新
      updateContainerSize();

      // 窗口大小变化时更新
      window.addEventListener('resize', updateContainerSize);
      // 添加屏幕尺寸监听
      window.addEventListener('resize', handleResize);

      // 组件卸载前清理
      return () => {
        window.removeEventListener('resize', updateContainerSize);
        window.removeEventListener('resize', handleResize);
      };
    }
  });

  // 游戏容器尺寸（用于计算目标位置）
  const containerSize = ref({ width: 800, height: 400 });

  // 生成随机位置
  const generateRandomPosition = () => {
    // 根据屏幕尺寸确定目标大小
    const targetSize = window.innerWidth <= 768 ? 70 : 100; // 移动端70px，桌面端100px

    // 确保容器尺寸有效，避免在容器尺寸尚未初始化时计算错误位置
    let containerWidth = containerSize.value.width;
    let containerHeight = containerSize.value.height;

    // 如果容器尺寸无效，使用默认值
    if (containerWidth <= 0 || containerHeight <= 0) {
      containerWidth = window.innerWidth * 0.8; // 使用窗口宽度的80%
      containerHeight = window.innerHeight * 0.5; // 使用窗口高度的50%
    }

    // 确保目标完全在容器内，根据目标大小动态计算
    const x = Math.random() * (containerWidth - targetSize);
    const y = Math.random() * (containerHeight - targetSize);
    return { x, y };
  };

  // 生成随机等待时间（1-3秒）
  const generateRandomWaitTime = () => {
    return Math.random() * 2000 + 1000;
  };

  // 获取随机颜色
  const getRandomColor = (): string => {
    // 排除白色和黑色，只使用彩色
    const colorValues = Object.values(COLORS).filter(
      (color) => color !== COLORS.WHITE && color !== COLORS.BLACK
    );
    const randomColor = colorValues[Math.floor(Math.random() * colorValues.length)];
    // 确保返回值不为undefined
    return randomColor || COLORS.RED;
  };

  // 生成颜色反应测试的目标
  const generateColorTarget = () => {
    // 获取随机背景色
    const bgColor = getRandomColor();

    // 获取随机文字色，确保与背景色不同
    let textColor = getRandomColor();
    while (textColor === bgColor) {
      textColor = getRandomColor();
    }

    // 获取随机文字内容（随机颜色名称）
    const colorNames = Object.values(COLOR_NAMES);
    const textContent = colorNames[Math.floor(Math.random() * colorNames.length)] || '红色';

    // 设置目标属性
    targetBgColor.value = bgColor;
    targetTextColor.value = textColor;
    targetTextContent.value = textContent;

    // 正确答案是文字内容对应的颜色
    // 例如：文字是"红色"，则正确答案是红色
    // 玩家需要点击与文字内容匹配的颜色
    const correctColorName = textContent;
    const correctColor =
      Object.entries(COLOR_NAMES).find(([, name]) => name === correctColorName)?.[0] || COLORS.RED;
    correctAnswer.value = correctColor;
  };

  // 开始游戏
  const startGame = () => {
    // 重置游戏状态
    isPlaying.value = true;
    isGameOver.value = false;
    currentRound.value = 0;
    gameState.value = GameState.WAITING as any;
    countdown.value = 3;

    // 重置测试数据
    reactionTime.value = 0;
    bestReactionTime.value = 0;
    averageReactionTime.value = 0;
    totalTests.value = 0;
    testResults.value = [];

    // 开始倒计时
    const countdownInterval = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        startNextTest();
      }
    }, 1000);
  };

  // 开始下一次测试
  const startNextTest = () => {
    gameState.value = GameState.WAITING as any;
    targetVisible.value = false;

    // 生成随机等待时间
    waitTime.value = generateRandomWaitTime();

    // 等待随机时间后显示目标
    setTimeout(() => {
      // 如果游戏已经结束，不再显示目标
      if (isGameOver.value) return;

      // 先切换到 ACTIVE 状态，确保 .active-state 元素已经渲染
      gameState.value = GameState.ACTIVE as any;

      // 强制更新 DOM，确保 .active-state 元素已经存在
      setTimeout(() => {
        // 更新容器尺寸
        if (typeof window !== 'undefined') {
          const activeArea = document.querySelector('.active-state');
          if (activeArea) {
            const rect = activeArea.getBoundingClientRect();
            containerSize.value = { width: rect.width, height: rect.height };
          }
        }

        // 生成随机位置
        targetPosition.value = generateRandomPosition();

        // 根据测试模式生成不同的目标
        if (testMode.value === TestMode.COLOR) {
          generateColorTarget();
        }

        targetVisible.value = true;
        startTime.value = Date.now();
      }, 10); // 短暂延迟，确保 DOM 已经更新
    }, waitTime.value);
  };

  // 处理目标点击
  const handleTargetClick = () => {
    // 只有在目标可见且游戏活跃状态下才处理点击
    if (gameState.value !== (GameState.ACTIVE as any) || !targetVisible.value) return;

    // 计算反应时间（毫秒）
    endTime.value = Date.now();
    reactionTime.value = ((endTime.value - startTime.value) / 1000) * 1000;

    // 更新测试结果
    testResults.value.push(reactionTime.value);
    totalTests.value++;
    currentRound.value++;

    // 更新最佳反应时间
    if (bestReactionTime.value === 0 || reactionTime.value < bestReactionTime.value) {
      bestReactionTime.value = reactionTime.value;
    }

    // 更新平均反应时间
    const sum = testResults.value.reduce((acc, val) => acc + val, 0);
    averageReactionTime.value = sum / testResults.value.length;

    // 隐藏目标，显示结果
    targetVisible.value = false;
    gameState.value = GameState.RESULT as any;

    // 检查是否达到最大轮次
    if (currentRound.value >= maxRounds.value) {
      // 保存历史记录
      const newRecord: HistoryRecord = {
        id: Date.now(),
        bestTime: bestReactionTime.value,
        averageTime: averageReactionTime.value,
        date: new Date().toLocaleString(),
        totalTests: totalTests.value,
      };

      // 添加到历史记录数组
      historyRecords.value.unshift(newRecord);

      // 限制历史记录数量（最多保存5条）
      if (historyRecords.value.length > 5) {
        historyRecords.value = historyRecords.value.slice(0, 5);
      }

      // 保存到localStorage
      saveHistory();

      // 2秒后结束游戏，回到开始界面
      setTimeout(() => {
        isPlaying.value = false;
        isGameOver.value = true;
        gameState.value = GameState.READY as any;
      }, 2000);
    } else {
      // 2秒后开始下一次测试
      setTimeout(() => {
        startNextTest();
      }, 2000);
    }
  };
</script>

<template>
  <div class="game-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧游戏区域 -->
      <div class="game-main-area">
        <!-- 标题栏 -->
        <h2 class="game-title">
          {{ testMode === TestMode.SIMPLE ? t('simpleReactionTest') : t('colorReactionTest') }}
        </h2>

        <!-- 统计信息 -->
        <div class="stats-container">
          <div class="stat-card best-time-card">
            <div class="stat-value">{{ formattedBestTime }}</div>
            <div class="stat-label">{{ t('best') }} {{ t('time') }} (ms)</div>
          </div>
          <div class="stat-card average-time-card">
            <div class="stat-value">{{ formattedAverageTime }}</div>
            <div class="stat-label">{{ t('average') }} {{ t('time') }} (ms)</div>
          </div>
        </div>

        <!-- 轮次进度条 -->
        <div v-if="isPlaying" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(currentRound / maxRounds) * 100}%` }">
              <div v-if="currentRound > 0" class="progress-text">
                {{ Math.round((currentRound / maxRounds) * 100) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏区域 -->
        <div class="game-area-inner">
          <!-- 准备状态 -->
          <div v-if="gameState === GameState.READY" class="ready-state">
            <h3>{{ t('readyToStart') }}</h3>
            <p v-if="testMode === TestMode.SIMPLE">{{ t('simpleReactionTestDesc') }}</p>
            <p v-else>{{ t('colorReactionTestDesc') }}</p>
            <button class="start-btn" @click="startGame">{{ t('startTest') }}</button>
          </div>

          <!-- 倒计时状态 -->
          <div v-else-if="gameState === GameState.WAITING && countdown > 0" class="countdown-state">
            <h2>{{ countdown }}</h2>
            <p>{{ t('gettingReady') }}</p>
          </div>

          <!-- 等待目标出现状态 -->
          <div v-else-if="gameState === GameState.WAITING" class="waiting-state">
            <h3>{{ t('waiting') }}...</h3>
            <p v-if="testMode === TestMode.SIMPLE">{{ t('simpleReactionTestWaiting') }}</p>
            <p v-else>{{ t('colorReactionTestWaiting') }}</p>
          </div>

          <!-- 目标显示状态 -->
          <div v-else-if="gameState === GameState.ACTIVE" class="active-state">
            <div
              v-if="targetVisible"
              class="target"
              :style="{
                left: `${targetPosition.x}px`,
                top: `${targetPosition.y}px`,
                backgroundColor: testMode === TestMode.COLOR ? targetBgColor : COLORS.GREEN,
                color: testMode === TestMode.COLOR ? targetTextColor : COLORS.BLACK,
              }"
              @mousedown="handleTargetClick"
            >
              <span v-if="testMode === TestMode.COLOR" class="target-text">{{
                targetTextContent
              }}</span>
            </div>
          </div>

          <!-- 结果显示状态 -->
          <div v-else-if="gameState === GameState.RESULT" class="result-state">
            <h3>{{ t('reactionTime') }}</h3>
            <div class="reaction-time">{{ formattedReactionTime }} {{ t('ms') }}</div>
            <p>{{ t('nextTestComing') }}</p>
          </div>
        </div>

        <!-- 相关测试推荐组件 -->
        <component :is="RelatedTests" current-test="reactionTimeTest" />

        <!-- 历史记录区域 - 中等屏幕和移动端显示在相关测试推荐组件下方 -->
        <div v-if="!isDesktop" class="history-sidebar">
          <div class="history-header">
            <h3>
              <img
                v-lazy="historyIconUrl"
                width="30"
                height="30"
                :alt="t('historyIconAlt')"
                class="history-icon"
              />
              {{ t('history') }}
            </h3>
          </div>

          <div class="history-list">
            <div v-if="historyRecords.length === 0" class="no-history">
              {{ t('noHistory') }}
            </div>
            <div v-for="record in historyRecords" :key="record.id" class="history-item">
              <div class="history-item-content">
                <div class="history-date">{{ record.date }}</div>
                <div class="history-stats">
                  <div class="stat-item">
                    <span class="stat-label">{{ t('best') }} {{ t('time') }}:</span>
                    <span class="stat-value best-time"
                      >{{ record.bestTime.toFixed(2) }} {{ t('ms') }}</span
                    >
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">{{ t('average') }} {{ t('time') }}:</span>
                    <span class="stat-value avg-time"
                      >{{ record.averageTime.toFixed(2) }} {{ t('ms') }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏说明 -->
        <div class="faq-section">
          <!-- 使用通用FAQ组件 -->
          <component
            :is="FAQComponent"
            :title="t('reactionTest')"
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
              v-lazy="historyIconUrlRelative"
              width="30"
              height="30"
              :alt="t('historyIconAlt')"
              class="history-icon"
            />
            {{ t('history') }}
          </h3>
        </div>

        <div class="history-list">
          <div v-if="historyRecords.length === 0" class="no-history">
            {{ t('noHistory') }}
          </div>
          <div v-for="record in historyRecords" :key="record.id" class="history-item">
            <div class="history-item-content">
              <div class="history-date">{{ record.date }}</div>
              <div class="history-stats">
                <div class="stat-item">
                  <span class="stat-label">{{ t('best') }} {{ t('time') }}:</span>
                  <span class="stat-value best-time"
                    >{{ record.bestTime.toFixed(2) }} {{ t('ms') }}</span
                  >
                </div>
                <div class="stat-item">
                  <span class="stat-label">{{ t('average') }} {{ t('time') }}:</span>
                  <span class="stat-value avg-time"
                    >{{ record.averageTime.toFixed(2) }} {{ t('ms') }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 游戏容器 */
  .game-container {
    width: 100%;
    max-width: none;
    margin: 20px auto;
    text-align: center;
    padding: clamp(20px, 4vw, 30px);
    color: white;
    position: relative;
    box-sizing: border-box;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    background-color: #000000;
    border-radius: 10px;
  }

  /* 主内容区域 - 左侧游戏 + 右侧历史记录 */
  .main-content {
    display: flex;
    gap: clamp(10px, 2vw, 20px);
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    margin: 0 auto;
  }

  /* 左侧游戏区域 */
  .game-main-area {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  /* 电脑端布局：历史记录显示在右侧 */
  @media (min-width: 1201px) {
    .main-content {
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    .game-main-area {
      flex: 1;
      width: auto;
      max-width: none;
    }

    .history-sidebar {
      flex: 0 0 clamp(250px, 20vw, 350px);
      margin-top: 0;
      margin-right: 0;
      height: clamp(280px, 50vh, 400px);
    }
  }

  /* 游戏区域内部 */
  .game-area-inner {
    width: 100%;
    max-width: 1400px;
    height: clamp(300px, 55vh, 500px);
    background-color: #000000;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    margin: 20px auto 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
    box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
    background-image: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 70%
    );
  }

  /* 准备状态 */
  .ready-state {
    padding: 30px;
    text-align: center;
  }

  .ready-state h3 {
    font-size: clamp(24px, 4vw, 32px);
    margin-bottom: 20px;
    color: #4caf50;
  }

  .ready-state p {
    font-size: clamp(14px, 2vw, 16px);
    margin-bottom: 30px;
    opacity: 0.9;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  /* 倒计时状态 */
  .countdown-state {
    padding: 30px;
    text-align: center;
  }

  .countdown-state h2 {
    font-size: clamp(48px, 10vw, 80px);
    margin-bottom: 20px;
    color: #ff9800;
  }

  .countdown-state p {
    font-size: clamp(14px, 2vw, 16px);
    opacity: 0.9;
  }

  /* 等待状态 */
  .waiting-state {
    padding: 30px;
    text-align: center;
  }

  .waiting-state h3 {
    font-size: clamp(24px, 4vw, 32px);
    margin-bottom: 20px;
    color: #2196f3;
  }

  .waiting-state p {
    font-size: clamp(14px, 2vw, 16px);
    margin-bottom: 20px;
    opacity: 0.9;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  /* 结果显示状态 */
  .result-state {
    padding: 30px;
    text-align: center;
  }

  .result-state h3 {
    font-size: clamp(24px, 4vw, 32px);
    margin-bottom: 20px;
    color: #4caf50;
  }

  .reaction-time {
    font-size: clamp(48px, 10vw, 80px);
    margin-bottom: 20px;
    color: #4caf50;
    font-weight: bold;
  }

  .result-state p {
    font-size: clamp(14px, 2vw, 16px);
    opacity: 0.9;
  }

  /* 右侧历史记录侧边栏 */
  .history-sidebar {
    width: 100%;
    background-color: #1a1a1a;
    border-radius: 15px;
    padding: clamp(20px, 4vw, 25px);
    height: clamp(300px, 55vh, 500px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    margin-top: 20px;
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
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 历史记录图标 */
  .history-icon {
    font-size: 20px;
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
    padding: 20px 10px;
    font-style: italic;
    font-size: 13px;
  }

  /* 历史记录项 */
  .history-item {
    background-color: #2a2a2a;
    border-radius: 6px;
    padding: 10px;
    transition: all 0.2s ease;
    border: 1px solid #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;
  }

  .history-item:hover {
    background-color: #333;
    border-color: #4caf50;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    z-index: 2;
  }

  /* 历史记录项内容 */
  .history-item-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* 历史记录日期 */
  .history-date {
    color: #888;
    font-size: 16px;
    font-style: italic;
    text-align: left;
  }

  /* 历史记录统计 */
  .history-stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  /* 历史记录统计项 */
  .history-stats .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }

  /* 历史记录统计标签 */
  .history-stats .stat-label {
    color: #ffffff;
    font-size: 14px;
    font-weight: normal;
  }

  /* 历史记录统计值 */
  .history-stats .stat-value {
    color: white;
    font-size: 16px;
    font-weight: bold;
  }

  /* 最佳时间特殊样式 */
  .history-stats .best-time {
    color: #4caf50;
  }

  /* 平均时间特殊样式 */
  .history-stats .avg-time {
    color: #646cff;
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

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 clamp(10px, 2vw, 20px) 0;
    font-size: clamp(24px, 4vw, 28px);
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  /* 统计信息容器 */
  .stats-container {
    display: flex;
    gap: clamp(15px, 3vw, 40px);
    justify-content: center;
    margin: 20px auto;
    flex-wrap: wrap;
    width: 100%;
    max-width: 1200px;
  }

  /* 统计卡片 */
  .stat-card {
    flex: 1;
    min-width: clamp(150px, 22vw, 180px);
    max-width: 220px;
    padding: clamp(15px, 3vw, 20px);
    border-radius: 12px;
    color: white;
    font-weight: bold;
    text-align: center;
    background-color: #646cff;
    box-shadow: 0 4px 15px rgba(100, 108, 255, 0.3);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    aspect-ratio: 2.5 / 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  /* 最佳时间卡片特殊样式 */
  .best-time-card {
    background-color: #4caf50;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  }

  .best-time-card:hover {
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
  }

  /* 平均时间卡片特殊样式 */
  .average-time-card {
    background-color: #646cff;
    box-shadow: 0 4px 15px rgba(100, 108, 255, 0.3);
  }

  .average-time-card:hover {
    box-shadow: 0 6px 20px rgba(100, 108, 255, 0.5);
  }

  /* 统计值 */
  .stat-value {
    font-size: 28px;
    margin-bottom: 8px;
    line-height: 1.2;
  }

  /* 统计标签 */
  .stat-label {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.4;
  }

  /* 进度条样式 */
  .progress-container {
    margin: 20px auto;
    width: 100%;
    max-width: none;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background-color: #2a2a2a;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .progress-text {
    color: white;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    pointer-events: none;
    white-space: nowrap;
    padding: 0 10px;
  }

  /* 开始按钮 */
  .start-btn {
    padding: 15px 30px;
    font-size: 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .start-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  .start-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .start-btn:active {
    background-color: #3d8b40;
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    outline: none; /* 移除点击时的轮廓 */
  }

  /* 活跃状态 */
  .active-state {
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* 目标元素 */
  .target {
    width: 100px;
    height: 100px;
    background-color: #4caf50;
    border-radius: 0;
    cursor: pointer;
    position: absolute;
    transition: all 0.1s ease;
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }

  .target:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px rgba(76, 175, 80, 1);
  }

  /* 目标文字 */
  .target-text {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
  }

  /* 重置按钮 */
  .reset-btn {
    padding: 12px 24px;
    font-size: 18px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .reset-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  /* FAQ 部分 */
  .faq-section {
    margin-top: 30px;
    margin-bottom: 30px;
    width: 100%;
  }

  /* 脉动动画 */
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 闪烁动画 */
  @keyframes blink {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }

  /* 中等屏幕布局优化：历史记录显示在相关测试推荐组件下方 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .main-content {
      flex-direction: column;
      align-items: center;
    }

    .game-main-area {
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

  /* 移动端适配（768px以下） */
  @media (max-width: 768px) {
    /* 游戏容器优化 */
    .game-container {
      padding: 10px;
      border-radius: 0;
      box-shadow: none;
    }

    /* 游戏主区域优化 */
    .game-main-area {
      max-width: 100%;
    }

    /* 游戏标题优化 */
    .game-title {
      font-size: 24px;
      margin-bottom: 15px;
    }

    /* 统计信息容器优化 */
    .stats-container {
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }

    /* 统计卡片优化 */
    .stat-card {
      width: 80px;
      min-width: 80px;
      max-width: 120px;
      padding: 8px;
      aspect-ratio: 3 / 1;
    }

    .stat-value {
      font-size: 16px;
    }

    .stat-label {
      font-size: 10px;
    }

    /* 进度条优化 */
    .progress-container {
      margin: 15px auto;
      width: 90%;
    }

    /* 游戏区域内部优化 */
    .game-area-inner {
      height: 300px;
      width: 100%;
      margin-bottom: 15px;
    }

    /* 准备状态优化 */
    .ready-state h3 {
      font-size: 22px;
    }

    .ready-state p {
      font-size: 15px;
      margin-bottom: 20px;
      padding: 0 20px;
    }

    /* 按钮优化 */
    .start-btn,
    .reset-btn {
      padding: 10px 20px;
      font-size: 16px;
    }

    /* 倒计时优化 */
    .countdown-state h2 {
      font-size: 70px;
    }

    .countdown-state p {
      font-size: 18px;
    }

    /* 等待状态优化 */
    .waiting-state h3 {
      font-size: 24px;
    }

    .waiting-state p {
      font-size: 16px;
      padding: 0 20px;
    }

    /* 目标元素优化 */
    .target {
      width: 70px;
      height: 70px;
    }

    .target-text {
      font-size: 18px;
    }

    /* 结果状态优化 */
    .result-state h3 {
      font-size: 22px;
    }

    .reaction-time {
      font-size: 48px;
    }

    .result-state p {
      font-size: 16px;
    }

    /* FAQ部分优化 */
    .faq-section {
      margin-left: 0;
      margin-bottom: 20px;
      padding: 0 10px;
    }

    /* 历史记录侧边栏优化 */
    .history-sidebar {
      width: 100%;
      max-width: 100%;
      margin: 15px auto 0;
      height: clamp(250px, 40vh, 300px);
      margin-left: 0;
      margin-right: 0;
    }

    /* 历史记录项优化 */
    .history-item {
      padding: 10px;
    }

    .history-date {
      font-size: 14px;
    }

    .history-stats .stat-label {
      font-size: 13px;
    }

    .history-stats .stat-value {
      font-size: 14px;
    }
  }
</style>
