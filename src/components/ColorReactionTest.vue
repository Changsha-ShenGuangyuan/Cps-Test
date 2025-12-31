<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { t } from '../i18n'; // 导入翻译函数
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 监听窗口大小变化
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1201;
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
  });

  // 游戏状态常量
  const GameState = {
    WAITING: 0, // 等待开始
    PLAYING: 1, // 游戏进行中
    ERROR: 2, // 点击太早错误
    SHOWING_RESULT: 3, // 显示单次结果
    FINISHED: 4, // 全部结束
  } as const;

  type GameStateType = (typeof GameState)[keyof typeof GameState];

  // 游戏状态
  const gameState = ref<GameStateType>(GameState.WAITING);
  const currentRound = ref(1);
  const totalRounds = 5;
  const reactionTimes = ref<number[]>([]);
  const currentReactionTime = ref(0);
  const startTime = ref(0);
  const backgroundColor = ref('#000000'); // 未开始时黑色
  const isGreen = ref(false);
  const currentColorCount = ref(0); // 当前轮次中显示的颜色计数
  let totalColorsPerRound = 5; // 每轮显示的颜色数量（随机3-5种，最后一种必绿）
  let colorTimer: number | null = null; // 颜色切换定时器

  // 随机颜色数组（不包含绿色）
  const colors = [
    '#FF5722', // 橙色
    '#F44336', // 红色
    '#E91E63', // 粉色
    '#9C27B0', // 紫色
    '#2196F3', // 蓝色
    '#FFC107', // 黄色
  ];

  // 重置游戏
  const resetGame = () => {
    // 清除定时器
    if (colorTimer) {
      clearTimeout(colorTimer);
      colorTimer = null;
    }
    gameState.value = GameState.WAITING;
    currentRound.value = 1;
    currentColorCount.value = 0;
    totalColorsPerRound = 5; // 重置为默认值
    reactionTimes.value = [];
    currentReactionTime.value = 0;
    backgroundColor.value = '#000000'; // 重置为黑色
    isGreen.value = false;
  };

  // 显示随机颜色
  const showRandomColor = () => {
    // 检查是否是第5种颜色（必为绿色）
    if (currentColorCount.value === totalColorsPerRound - 1) {
      // 第5种颜色必为绿色
      isGreen.value = true;
      backgroundColor.value = '#4CAF50'; // 绿色
      startTime.value = Date.now();
    } else {
      // 前4种颜色随机且非绿色
      isGreen.value = false;
      const randomColor = colors[Math.floor(Math.random() * colors.length)] as string;
      backgroundColor.value = randomColor;

      // 增加颜色计数
      currentColorCount.value++;

      // 随机延迟1-3秒后显示下一种颜色
      const delay = Math.random() * 2000 + 1000;
      // 清除之前的定时器（如果有）
      if (colorTimer) {
        clearTimeout(colorTimer);
      }
      // 设置新的定时器
      colorTimer = setTimeout(() => {
        if (gameState.value === GameState.PLAYING) {
          showRandomColor();
        }
      }, delay) as unknown as number;
    }
  };

  // 开始游戏
  const startGame = () => {
    currentColorCount.value = 0; // 重置颜色计数
    totalColorsPerRound = Math.floor(Math.random() * 3) + 3; // 随机3-5种颜色
    gameState.value = GameState.PLAYING;
    showRandomColor();
  };

  // 处理游戏区域点击
  const handleGameClick = () => {
    if (gameState.value === GameState.PLAYING) {
      if (isGreen.value) {
        // 点击到绿色，记录反应时间
        const endTime = Date.now();
        currentReactionTime.value = endTime - startTime.value;
        reactionTimes.value.push(currentReactionTime.value);

        // 检查是否是最后一轮
        if (currentRound.value < totalRounds) {
          // 不是最后一轮，显示结果并等待点击继续
          gameState.value = GameState.SHOWING_RESULT;
        } else {
          // 最后一轮，直接显示最终结果
          backgroundColor.value = '#000000'; // 设置背景为黑色

          // 保存历史记录
          const newRecord: HistoryRecord = {
            id: Date.now(),
            bestTime: getBestReactionTime(),
            averageTime: getAverageReactionTime(),
            date: new Date().toLocaleString(),
            totalTests: totalRounds,
          };

          // 添加到历史记录数组
          historyRecords.value.unshift(newRecord);

          // 限制历史记录数量（最多保存5条）
          if (historyRecords.value.length > 5) {
            historyRecords.value = historyRecords.value.slice(0, 5);
          }

          // 保存到localStorage
          saveHistory();

          gameState.value = GameState.FINISHED;
        }
      } else {
        // 点击到其他颜色，进入错误状态
        backgroundColor.value = '#000000'; // 设置背景为黑色
        gameState.value = GameState.ERROR;
      }
    }
  };

  // 继续游戏
  const continueGame = () => {
    if (gameState.value === GameState.SHOWING_RESULT) {
      if (currentRound.value < totalRounds) {
        // 清除定时器
        if (colorTimer) {
          clearTimeout(colorTimer);
          colorTimer = null;
        }
        currentRound.value++;
        currentColorCount.value = 0; // 重置颜色计数
        totalColorsPerRound = Math.floor(Math.random() * 3) + 3; // 随机3-5种颜色
        gameState.value = GameState.PLAYING;
        showRandomColor();
      } else {
        // 所有轮次结束
        backgroundColor.value = '#000000'; // 设置背景为黑色
        gameState.value = GameState.FINISHED;
      }
    }
  };

  // 重新开始本轮游戏
  const restartRound = () => {
    // 清除定时器
    if (colorTimer) {
      clearTimeout(colorTimer);
      colorTimer = null;
    }
    currentColorCount.value = 0; // 重置颜色计数
    totalColorsPerRound = Math.floor(Math.random() * 3) + 3; // 随机3-5种颜色
    gameState.value = GameState.PLAYING;
    showRandomColor();
  };

  // 获取平均反应时间
  const getAverageReactionTime = () => {
    if (reactionTimes.value.length === 0) return 0;
    const sum = reactionTimes.value.reduce((a, b) => a + b, 0);
    return Math.round(sum / reactionTimes.value.length);
  };

  // 获取游戏状态文本
  const getGameStateText = () => {
    switch (gameState.value) {
      case GameState.PLAYING:
        return isGreen.value ? t('clickHere') : t('waiting');
      case GameState.SHOWING_RESULT:
        return `${t('yourAverageReactionTime')} ${currentReactionTime.value} ${t('ms')}`;
      case GameState.FINISHED:
        return t('finish');
      default:
        return '';
    }
  };

  // 获取继续游戏文本
  const getContinueText = () => {
    if (gameState.value === GameState.SHOWING_RESULT) {
      if (currentRound.value < totalRounds) {
        return t('continue');
      } else {
        return t('viewResults');
      }
    }
    return '';
  };

  // 历史记录类型定义
  interface HistoryRecord {
    id: number;
    bestTime: number; // 最佳反应时间（毫秒）
    averageTime: number; // 平均反应时间（毫秒）
    date: string; // 游戏开始的历史时间
    totalTests: number; // 测试总次数
  }

  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]);

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('colorReactionTimeHistory');
    if (saved) {
      historyRecords.value = JSON.parse(saved);
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem('colorReactionTimeHistory', JSON.stringify(historyRecords.value));
  };

  // 初始化加载历史记录
  loadHistory();

  // 计算最佳反应时间
  const getBestReactionTime = () => {
    if (reactionTimes.value.length === 0) return 0;
    return Math.min(...reactionTimes.value);
  };

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsColorReactionTest'),
        a: t('whatIsColorReactionTestDesc'),
        relatedQuestions: [t('howToGetBetterScore'), t('howResultsCalculated')],
      },
      {
        q: t('howToGetBetterScore'),
        a: t('howToGetBetterScoreDesc'),
        relatedQuestions: [t('whatIsColorReactionTest'), t('howResultsCalculated')],
      },
      {
        q: t('howResultsCalculated'),
        a: t('howResultsCalculatedDesc'),
        relatedQuestions: [t('whatIsColorReactionTest'), t('howToGetBetterScore')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsColorReactionTest'), t('howToGetBetterScore')];
  });

  // 计算平均反应时间（已有的getAverageReactionTime函数保留）
</script>

<template>
  <div class="game-container">
    <!-- 主内容区域 - 左侧游戏 + 右侧历史记录 -->
    <div class="main-content">
      <!-- 左侧游戏区域 -->
      <div class="game-area-container">
        <h2 class="game-title">{{ t('colorReactionTest') }}</h2>

        <!-- 进度条 -->
        <div v-if="gameState !== GameState.WAITING" class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${(currentRound / totalRounds) * 100}%` }">
              <div class="progress-text">{{ Math.round((currentRound / totalRounds) * 100) }}%</div>
            </div>
          </div>
        </div>

        <!-- 游戏区域 -->
        <div class="click-area" :style="{ backgroundColor }" @click="handleGameClick">
          <!-- 等待开始状态 -->
          <div v-if="gameState === GameState.WAITING" class="waiting-state">
            <button class="start-btn" @click.stop="startGame">{{ t('startGame') }}</button>
          </div>

          <!-- 游戏中状态 -->
          <div v-else-if="gameState === GameState.PLAYING" class="game-state">
            {{ getGameStateText() }}
          </div>

          <!-- 点击太早错误状态 -->
          <div v-else-if="gameState === GameState.ERROR" class="error-state">
            <h3 class="error-title">{{ t('tooSoon') }}</h3>
            <p class="error-subtitle">{{ t('pressTheGreenOne') }}</p>
            <button class="error-btn" @click.stop="restartRound">{{ t('restartGame') }}</button>
          </div>

          <!-- 显示结果状态 -->
          <div v-else-if="gameState === GameState.SHOWING_RESULT" class="result-state">
            <div class="game-state">{{ getGameStateText() }}</div>
            <div class="continue-text clickable" @click.stop="continueGame">
              {{ getContinueText() }}
            </div>
          </div>

          <!-- 最终结果状态 -->
          <div v-else-if="gameState === GameState.FINISHED" class="final-result">
            <div class="result-title">{{ t('colorReactionTest') }} {{ t('results') }}</div>

            <!-- 轮次结果卡片 -->
            <div class="round-results-cards">
              <div v-for="(time, index) in reactionTimes" :key="index" class="round-result-card">
                <div class="round-time">{{ time }}</div>
                <div class="round-label">{{ index + 1 }} {{ t('round') }}</div>
              </div>
            </div>

            <!-- 平均反应时间 -->
            <div class="average-container">
              <div class="average-label">{{ t('yourAverageReactionTime') }}</div>
              <div class="average-time">{{ getAverageReactionTime() }} {{ t('ms') }}</div>
            </div>

            <!-- 鼓励文字 -->
            <div class="encouragement">
              <div class="encouragement-title">{{ t('youCanDoBetter') }}</div>
              <div class="encouragement-text">
                {{ t('notTheFastestStart') }}
              </div>
            </div>

            <!-- 重新开始按钮 -->
            <button class="try-again-btn" @click="resetGame">{{ t('restartGame') }}</button>
          </div>
        </div>

        <!-- 历史记录区域 - 中等屏幕和移动端显示在相关测试推荐组件下方 -->
        <div v-if="!isDesktop" class="history-sidebar">
          <div class="history-header">
            <h3>
              <img
                src="@/assets/icons/history.png"
                width="30"
                height="30"
                :alt="t('historyIconAlt')"
                class="history-icon"
                loading="lazy"
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

        <!-- 相关测试推荐组件 -->
        <RelatedTests current-test="colorReactionTest" />

        <!-- FAQ部分 -->
        <div class="faq-section">
          <!-- 使用通用FAQ组件 -->
          <FAQComponent
            :title="t('colorReactionTest')"
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
              src="@/assets/icons/history.png"
              width="30"
              height="30"
              :alt="t('historyIconAlt')"
              class="history-icon"
              loading="lazy"
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
    max-width: 1400px;
    margin: 20px auto;
    text-align: center;
    padding: clamp(20px, 4vw, 30px);
    background-color: #121212;
    color: white;
    position: relative;
    box-sizing: border-box;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
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
  .game-area-container {
    flex: 1;
    width: 100%;
    min-width: 0;
    text-align: center;
  }

  /* 游戏区域内的历史记录容器 */
  .game-area-container .history-sidebar {
    display: inline-block;
    vertical-align: top;
    margin: 20px auto 0;
  }

  /* 中等屏幕布局优化：历史记录显示在相关测试推荐组件下方 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .main-content {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .game-area-container {
      max-width: 100%;
      width: 100%;
    }

    /* 确保游戏区域内的历史记录居中 */
    .game-area-container .history-sidebar {
      width: 100%;
      max-width: 800px;
      margin: 20px auto 0;
      height: clamp(280px, 40vh, 350px);
    }
  }

  /* 电脑端布局：历史记录显示在右侧 */
  @media (min-width: 1201px) {
    .main-content {
      justify-content: center;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    .game-area-container {
      flex: 1;
      width: auto;
      max-width: none;
      min-width: 0;
      text-align: left;
    }

    /* 桌面端历史记录不使用inline-block */
    .game-area-container .history-sidebar {
      display: flex;
    }

    .history-sidebar {
      flex: 0 0 clamp(250px, 20vw, 350px);
      margin-top: 0;
      margin-right: 0;
      height: clamp(280px, 50vh, 400px);
      margin-left: 0;
      margin-right: 0;
      display: flex;
    }
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
    text-align: center;
  }

  /* 历史记录统计 */
  .history-stats {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: center;
  }

  /* 历史记录统计项 */
  .history-stats .stat-item {
    display: flex;
    justify-content: space-around;
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
    margin: 0 0 20px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-top: 15px;
  }

  /* 为所有文本添加黑色0.5px描边 */
  .game-container h2,
  .game-container h3,
  .game-container p,
  .game-state,
  .continue-text,
  .error-title,
  .error-subtitle,
  .round-result,
  .average-result,
  .start-btn {
    text-shadow:
      0.5px 0.5px 0 #000000,
      -0.5px -0.5px 0 #000000,
      0.5px -0.5px 0 #000000,
      -0.5px 0.5px 0 #000000;
  }

  /* 进度条样式 */
  .progress-container {
    margin: 20px auto;
    width: 80%;
    max-width: 800px;
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
    font-size: 16px;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    pointer-events: none;
    white-space: nowrap;
    padding: 0 10px;
  }

  .click-area {
    width: 80%;
    max-width: 800px;
    height: 450px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 24px;
    font-weight: bold;
    margin: 0 auto 20px;
    user-select: none;
    border: 2px solid #333;
  }

  .click-area:hover {
    /* 移除悬停放大效果 */
    transform: none;
  }

  .game-state {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .continue-text {
    font-size: 20px;
    opacity: 0.8;
  }

  .continue-text.clickable {
    cursor: pointer;
    text-decoration: none;
    opacity: 1;
  }

  .continue-text.clickable:hover {
    color: white;
  }

  .start-btn {
    padding: 20px 40px;
    font-size: 24px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */
  }

  .start-btn:hover {
    background-color: #45a049;
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4); /* 增强阴影 */
  }

  .start-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .start-btn:active {
    background-color: #3d8b40;
    transform: scale(0.98); /* 轻微缩放效果 */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5); /* 减小阴影 */
    outline: none; /* 移除点击时的轮廓 */
  }

  .waiting-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  /* 最终结果样式 */
  .final-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 10px;
    background-color: transparent;
    border-radius: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* 结果标题 */
  .result-title {
    background-color: rgba(30, 30, 30, 0.8);
    color: white;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 轮次结果卡片容器 */
  .round-results-cards {
    display: flex;
    gap: 10px;
    background-color: rgba(30, 30, 30, 0.8);
    padding: 15px;
    border-radius: 10px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 95%;
    overflow: hidden;
  }

  /* 单轮结果卡片 */
  .round-result-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 80px;
    padding: 0 10px;
  }

  /* 轮次时间 */
  .round-time {
    font-size: 28px;
    font-weight: bold;
    color: white;
  }

  /* 轮次标签 */
  .round-label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 平均反应时间容器 */
  .average-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background-color: rgba(30, 30, 30, 0.8);
    padding: 15px;
    border-radius: 10px;
    width: 100%;
    max-width: 90%;
    overflow: hidden;
  }

  /* 平均反应时间标签 */
  .average-label {
    font-size: 18px;
    color: #999;
  }

  /* 平均反应时间 */
  .average-time {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 36px;
    font-weight: bold;
    color: #ffd700;
    max-width: 95%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 鼓励文字容器 */
  .encouragement {
    text-align: center;
    max-width: 90%;
    padding: 0 10px;
    overflow: hidden;
  }

  /* 鼓励文字标题 */
  .encouragement-title {
    font-size: 20px;
    font-weight: bold;
    color: white;
    margin-bottom: 8px;
    max-width: 95%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* 鼓励文字内容 */
  .encouragement-text {
    font-size: 14px;
    color: #ccc;
    line-height: 1.4;
    margin-bottom: 10px;
    max-width: 95%;
    overflow: hidden;
  }

  /* 重新开始按钮 */
  .try-again-btn {
    padding: 12px 28px;
    font-size: 16px;
    background-color: #6200ea;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(98, 0, 234, 0.3);
    max-width: 90%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .try-again-btn:hover {
    background-color: #5300d4;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(98, 0, 234, 0.5);
  }

  .try-again-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .try-again-btn:active {
    background-color: #4500b8;
    transform: scale(0.98); /* 轻微缩放效果 */
    box-shadow: 0 2px 10px rgba(98, 0, 234, 0.6); /* 减小阴影 */
    outline: none; /* 移除点击时的轮廓 */
  }

  /* 结果状态样式 */
  .result-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  /* 错误状态样式 */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    text-align: center;
  }

  .error-title {
    color: #ffffff;
    font-size: 48px;
    margin: 0;
    font-weight: bold;
  }

  .error-subtitle {
    color: #cccccc;
    font-size: 18px;
    margin: 0;
  }

  .error-btn {
    padding: 15px 40px;
    font-size: 18px;
    background: linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3); /* 添加初始阴影 */
    position: relative; /* 相对定位，用于增强发光效果 */
    overflow: visible; /* 允许阴影溢出 */
  }

  .error-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(255, 65, 108, 0.6); /* 增强发光效果 */
  }

  .error-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .error-btn:active {
    transform: scale(0.98); /* 轻微缩放效果 */
    box-shadow: 0 2px 10px rgba(255, 65, 108, 0.8); /* 调整阴影，增强点击反馈 */
    background: linear-gradient(90deg, #e5395f 0%, #e64a19 100%); /* 点击时颜色加深 */
    outline: none; /* 移除点击时的轮廓 */
  }

  /* FAQ部分样式 */
  .faq-section {
    display: flex; /* 设置为flex布局 */
    flex-direction: column; /* 子元素垂直方向排列 */
    gap: 10px; /* 子元素之间间距为15px */
    margin-top: 0px; /* 顶部外边距为20px */
    width: 100%; /* 设置宽度为父容器的100% */
    max-width: 1200px; /* 设置最大宽度为1200px */
    margin-left: auto; /* 水平居中对齐 */
    margin-right: auto; /* 水平居中对齐 */
    margin-bottom: 20px;
  }

  .faq-item {
    text-align: left; /* 文本左对齐 */
    background-color: rgba(50, 50, 50, 0.5); /* 半透明深灰色背景 */
    border: 1px solid transparent; /* 透明边框 */
    border-radius: 8px; /* 8px圆角边框 */
    padding: 25px; /* 25px内边距 */
    transition: all 0.3s ease; /* 所有属性变化0.3秒过渡效果 */
  }

  .faq-item:hover {
    background-color: rgba(50, 50, 50, 0.8);
    border-color: #4caf50;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .faq-item h4 {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: bold;
  }

  .faq-item p {
    color: #ccc;
    margin: 0;
    line-height: 1.5;
    font-size: 14px;
  }

  /* 右侧历史记录侧边栏 */
  .history-sidebar {
    width: 100%;
    max-width: 800px;
    background-color: #1a1a1a;
    border-radius: 15px;
    padding: clamp(20px, 4vw, 25px);
    height: clamp(300px, 55vh, 500px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    margin-top: 20px;
    margin-right: 0;
    margin-bottom: 20px;
    margin-left: auto;
    margin-right: auto;
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
    padding-right: 5px;
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
  }

  .history-item:hover {
    background-color: #333;
    border-color: #4caf50;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
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

  /* 统计项 */
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }

  /* 统计标签 */
  .stat-label {
    color: #ffffff;
    font-size: 14px;
    font-weight: normal;
  }

  /* 统计值 */
  .stat-value {
    color: white;
    font-size: 16px;
    font-weight: bold;
  }

  /* 最佳时间特殊样式 */
  .best-time {
    color: #4caf50;
  }

  /* 平均时间特殊样式 */
  .avg-time {
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

  /* 滚动条角落 */
  .history-list::-webkit-scrollbar-corner {
    background: #1a1a1a;
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .main-content {
      flex-direction: column;
      align-items: center;
    }

    .history-sidebar {
      width: 100%;
      max-width: 800px;
      margin-top: 20px;
      height: 350px;
    }
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 游戏容器优化 */
    .game-container {
      padding: 10px;
      border-radius: 0;
      box-shadow: none;
    }

    /* 游戏主区域优化 */
    .game-area-container {
      max-width: 100%;
    }

    /* 游戏标题优化 */
    .game-title {
      font-size: 24px;
      margin-bottom: 15px;
    }

    /* 点击区域优化 */
    .click-area {
      width: 95%;
      height: 450px;
      font-size: 20px;
    }

    /* 开始按钮优化 */
    .start-btn {
      padding: 15px 30px;
      font-size: 20px;
    }

    /* 进度条优化 */
    .progress-container {
      margin: 15px auto;
      width: 90%;
    }

    /* 进度条文本优化 */
    .progress-text {
      font-size: 14px;
    }

    /* 游戏状态文本优化 */
    .game-state {
      font-size: 28px;
    }

    /* 继续文本优化 */
    .continue-text {
      font-size: 18px;
    }

    /* 错误状态优化 */
    .error-title {
      font-size: 36px;
    }

    .error-subtitle {
      font-size: 16px;
    }

    .error-btn {
      padding: 12px 30px;
      font-size: 16px;
    }

    /* 结果状态优化 */
    .result-state {
      gap: 10px;
    }

    /* 最终结果优化 */
    .final-result {
      gap: 10px;
      padding: 5px;
    }

    /* 结果标题优化 */
    .result-title {
      font-size: 14px;
      padding: 5px 12px;
    }

    /* 轮次结果卡片优化 */
    .round-results-cards {
      padding: 10px;
      gap: 8px;
    }

    /* 单轮结果卡片优化 */
    .round-result-card {
      min-width: 70px;
      padding: 0 8px;
    }

    /* 轮次时间优化 */
    .round-time {
      font-size: 24px;
    }

    /* 轮次标签优化 */
    .round-label {
      font-size: 11px;
    }

    /* 平均反应时间容器优化 */
    .average-container {
      padding: 10px;
      gap: 8px;
    }

    /* 平均反应时间标签优化 */
    .average-label {
      font-size: 16px;
    }

    /* 平均反应时间优化 */
    .average-time {
      font-size: 32px;
    }

    /* 鼓励文字优化 */
    .encouragement {
      padding: 0 5px;
    }

    /* 鼓励文字标题优化 */
    .encouragement-title {
      font-size: 18px;
    }

    /* 鼓励文字内容优化 */
    .encouragement-text {
      font-size: 13px;
    }

    /* 重新开始按钮优化 */
    .try-again-btn {
      padding: 10px 24px;
      font-size: 14px;
    }

    /* 历史记录侧边栏优化 */
    .history-sidebar {
      width: 95% !important;
      max-width: 95% !important;
      margin: 20px auto 0 !important;
      height: clamp(280px, 40vh, 350px) !important;
      display: flex !important;
      flex-direction: column;
    }

    /* 历史记录列表优化 */
    .history-list {
      width: 100%;
    }

    /* 历史记录项优化 */
    .history-item {
      width: 100%;
      max-width: 100%;
      padding: 10px;
    }

    /* FAQ标题优化 */
    .faq-item h4 {
      font-size: 15px;
    }

    /* FAQ内容优化 */
    .faq-item p {
      font-size: 13px;
    }

    /* 历史记录日期优化 */
    .history-date {
      font-size: 14px;
      text-align: center;
    }

    /* 历史记录统计优化 */
    .history-stats {
      text-align: center;
    }

    /* 统计项优化 */
    .stat-item {
      justify-content: space-around;
    }

    /* 统计标签优化 */
    .stat-label {
      font-size: 13px;
    }

    /* 统计值优化 */
    .stat-value {
      font-size: 14px;
    }
  }
</style>
