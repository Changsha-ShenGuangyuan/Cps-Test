<script setup lang="ts">
  import { t } from '../i18n/index';
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // 游戏状态常量
  const GameState = {
    WAITING: 0, // 等待开始
    PLAYING: 1, // 游戏进行中
    TOO_SOON: 2, // 过早点击
    WRONG_KEY: 3, // 按错键
    SHOWING_RESULT: 4, // 显示正确结果
    FINISHED: 5, // 游戏结束
  } as const;

  type GameStateType = (typeof GameState)[keyof typeof GameState];

  // 方向键状态类型
  interface DirectionKey {
    key: string; // W/A/S/D
    position: 'up' | 'down' | 'left' | 'right'; // 位置
    isActive: boolean; // 是否高亮
    isPressed: boolean; // 是否被按下
  } // 游戏状态
  const gameState = ref<GameStateType>(GameState.WAITING);

  // 方向键数据，不包含动态翻译的text属性
  const directionKeys = ref<DirectionKey[]>([
    { key: 'W', position: 'up', isActive: false, isPressed: false },
    { key: 'A', position: 'left', isActive: false, isPressed: false },
    { key: 'S', position: 'down', isActive: false, isPressed: false },
    { key: 'D', position: 'right', isActive: false, isPressed: false },
  ]);

  const currentActiveKey = ref<string | null>(null); // 当前高亮的按键
  const startTime = ref(0); // 高亮开始时间
  const reactionTimes = ref<number[]>([]); // 反应时间数组
  const currentReactionTime = ref(0); // 当前反应时间
  const progress = ref(0); // 进度（百分比）
  const round = ref(0); // 当前轮次
  const totalRounds = 5; // 总轮次
  let keyTimer: number | null = null; // 按键高亮定时器
  let greenShowTimer: number | null = null; // 绿色显示定时器

  // 开始游戏
  const startGame = () => {
    gameState.value = GameState.PLAYING;
    round.value = 0;
    reactionTimes.value = [];
    progress.value = 0;
    showRandomKey();
  };

  // 显示随机按键
  const showRandomKey = () => {
    // 重置所有按键状态
    directionKeys.value.forEach((key) => {
      key.isActive = false;
      key.isPressed = false;
    });

    // 重置当前激活的按键
    currentActiveKey.value = null;

    // 随机延迟1-3秒后显示绿色按键
    const delay = Math.random() * 2000 + 1000;
    greenShowTimer = setTimeout(() => {
      // 随机选择一个按键
      const randomIndex = Math.floor(Math.random() * directionKeys.value.length);
      const activeKey = directionKeys.value[randomIndex];
      if (activeKey) activeKey.isActive = true;
      if (activeKey) {
        currentActiveKey.value = activeKey.key;
      }

      // 记录高亮开始时间
      startTime.value = Date.now();
    }, delay);
  };

  // 处理按键按下
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toUpperCase();

    // 只对W、A、S、D按键做出响应
    if (!['W', 'A', 'S', 'D'].includes(key)) {
      return;
    }

    // 处理过早点击（绿色还没显示）
    if (gameState.value === GameState.PLAYING && !currentActiveKey.value) {
      gameState.value = GameState.TOO_SOON;
      return;
    }

    // 处理游戏中按键
    if (gameState.value === GameState.PLAYING && currentActiveKey.value) {
      // 清除绿色显示定时器
      if (greenShowTimer) {
        clearTimeout(greenShowTimer);
        greenShowTimer = null;
      }

      // 检查是否按下了正确的按键
      if (key === currentActiveKey.value) {
        // 计算反应时间
        const endTime = Date.now();
        currentReactionTime.value = endTime - startTime.value;
        reactionTimes.value.push(currentReactionTime.value);

        // 更新按键状态
        const pressedKey = directionKeys.value.find((k) => k.key === key);
        if (pressedKey) {
          pressedKey.isPressed = true;
        }

        // 计算进度
        round.value++;
        progress.value = Math.round((round.value / totalRounds) * 100);

        // 检查是否完成所有轮次
        if (round.value >= totalRounds) {
          gameState.value = GameState.FINISHED;
        } else {
          // 显示结果
          gameState.value = GameState.SHOWING_RESULT;
        }
      } else {
        // 按错键
        gameState.value = GameState.WRONG_KEY;
      }
    } else if (
      gameState.value === GameState.TOO_SOON ||
      gameState.value === GameState.WRONG_KEY ||
      gameState.value === GameState.SHOWING_RESULT
    ) {
      // 在错误状态下按任何键返回重试
      restartRound();
    }
  };

  // 处理按键释放
  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toUpperCase();

    // 只对W、A、S、D按键做出响应
    if (!['W', 'A', 'S', 'D'].includes(key)) {
      return;
    }

    const releasedKey = directionKeys.value.find((k) => k.key === key);
    if (releasedKey) {
      releasedKey.isPressed = false;
    }
  };

  // 重新开始当前轮次
  const restartRound = () => {
    // 清除所有定时器
    if (keyTimer) {
      clearTimeout(keyTimer);
      keyTimer = null;
    }
    if (greenShowTimer) {
      clearTimeout(greenShowTimer);
      greenShowTimer = null;
    }

    // 重置按键状态
    directionKeys.value.forEach((key) => {
      key.isActive = false;
      key.isPressed = false;
    });

    currentActiveKey.value = null;
    gameState.value = GameState.PLAYING;
    showRandomKey();
  };

  // 重新开始游戏
  const restartGame = () => {
    // 清除所有定时器
    if (keyTimer) {
      clearTimeout(keyTimer);
      keyTimer = null;
    }
    if (greenShowTimer) {
      clearTimeout(greenShowTimer);
      greenShowTimer = null;
    }
    startGame();
  };

  // 继续游戏（显示结果后）
  const continueGame = () => {
    gameState.value = GameState.PLAYING;
    showRandomKey();
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (keyTimer) {
      clearTimeout(keyTimer);
    }
  });

  // 获取平均反应时间
  const getAverageReactionTime = () => {
    if (reactionTimes.value.length === 0) return 0;
    const sum = reactionTimes.value.reduce((a, b) => a + b, 0);
    return Math.round(sum / reactionTimes.value.length);
  };

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsKeyReactionTest'),
        a: t('whatIsKeyReactionTestDesc'),
        relatedQuestions: [t('howToGetBetterScore'), t('howResultsCalculated')],
      },
      {
        q: t('howToGetBetterScore'),
        a: t('howToGetBetterScoreDesc'),
        relatedQuestions: [t('whatIsKeyReactionTest'), t('howResultsCalculated')],
      },
      {
        q: t('howResultsCalculated'),
        a: t('howResultsCalculatedDesc'),
        relatedQuestions: [t('whatIsKeyReactionTest'), t('howToGetBetterScore')],
      },
      {
        q: t('whyTooSoon'),
        a: t('whyTooSoonDesc'),
        relatedQuestions: [t('whatIsKeyReactionTest'), t('howToGetBetterScore')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsKeyReactionTest'), t('howToGetBetterScore')];
  });
</script>

<template>
  <div class="game-container">
    <h2 class="game-title">{{ t('keyReactionTest') }}</h2>

    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 等待和游戏进行中状态 -->
      <template v-if="gameState === GameState.WAITING || gameState === GameState.PLAYING">
        <!-- 方向键布局 -->
        <div class="keys-container">
          <!-- W键（上） -->
          <div
            class="key up-key"
            :class="{ active: directionKeys[0]!.isActive, pressed: directionKeys[0]!.isPressed }"
          >
            {{ directionKeys[0]!.key }}
            <div class="key-text">{{ t(directionKeys[0]!.position) }}</div>
          </div>

          <!-- 中间三键：A（左）、S（下）、D（右） -->
          <div class="middle-row">
            <div
              class="key left-key"
              :class="{ active: directionKeys[1]!.isActive, pressed: directionKeys[1]!.isPressed }"
            >
              {{ directionKeys[1]!.key }}
              <div class="key-text">{{ t(directionKeys[1]!.position) }}</div>
            </div>
            <div
              class="key down-key"
              :class="{ active: directionKeys[2]!.isActive, pressed: directionKeys[2]!.isPressed }"
            >
              {{ directionKeys[2]!.key }}
              <div class="key-text">{{ t(directionKeys[2]!.position) }}</div>
            </div>
            <div
              class="key right-key"
              :class="{ active: directionKeys[3]!.isActive, pressed: directionKeys[3]!.isPressed }"
            >
              {{ directionKeys[3]!.key }}
              <div class="key-text">{{ t(directionKeys[3]!.position) }}</div>
            </div>
          </div>
        </div>

        <!-- 提示文字 -->
        <div class="instruction">
          {{ t('keyReactionTestDesc') }}
        </div>

        <!-- 开始按钮 -->
        <button v-if="gameState === GameState.WAITING" class="start-btn" @click="startGame">
          {{ t('clickToStart') }}
        </button>
      </template>

      <!-- 过早点击 -->
      <div v-else-if="gameState === GameState.TOO_SOON" class="full-screen-state error-state">
        <h3>{{ t('tooSoon') }}</h3>
        <p>{{ t('pressWasdToReturn') }}</p>
        <button class="try-again-btn" @click="restartRound">{{ t('tryAgain') }}</button>
      </div>

      <!-- 按错键 -->
      <div v-else-if="gameState === GameState.WRONG_KEY" class="full-screen-state error-state">
        <h3>{{ t('wrongKey') }}</h3>
        <p>{{ t('pressTheGreenOne') }}</p>
        <button class="try-again-btn" @click="restartRound">{{ t('tryAgain') }}</button>
      </div>

      <!-- 显示正确结果 -->
      <div
        v-else-if="gameState === GameState.SHOWING_RESULT"
        class="full-screen-state success-state"
      >
        <div class="success-icon">⏱️</div>
        <h3>{{ t('yourReactionTime') }}</h3>
        <div class="reaction-time">{{ currentReactionTime }} ms</div>
        <p>{{ t('clickToContinue') }}</p>
        <div class="continue-btn" @click="continueGame"></div>
      </div>

      <!-- 游戏结束结果 -->
      <div v-else-if="gameState === GameState.FINISHED" class="full-screen-state final-result">
        <div class="result-title">{{ t('keyReactionTestResults') }}</div>

        <!-- 轮次结果卡片 -->
        <div class="round-results-cards">
          <div v-for="(time, index) in reactionTimes" :key="index" class="round-result-card">
            <div class="round-time">{{ time }}</div>
            <div class="round-label">{{ t('round') }} {{ index + 1 }}</div>
          </div>
        </div>

        <!-- 平均反应时间 -->
        <div class="average-container">
          <div class="average-label">{{ t('yourAverageReactionTime') }}</div>
          <div class="average-time">{{ getAverageReactionTime() }} ms</div>
        </div>

        <!-- 鼓励文字 -->
        <div class="encouragement">
          <div class="encouragement-title">{{ t('youCanDoBetter') }}</div>
          <div class="encouragement-text">
            {{ t('notTheFastestStart') }}
          </div>
        </div>

        <!-- 重新开始按钮 -->
        <button class="try-again-btn" @click="restartGame">{{ t('restartGame') }}</button>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button class="control-btn restart" @click="restartGame">
        <span class="control-icon">🔄</span>
      </button>
      <button class="control-btn settings">
        <span class="control-icon">⚙️</span>
      </button>
    </div>

    <!-- 相关测试推荐组件 -->
    <component :is="RelatedTests" current-test="keyReactionTest" />

    <!-- FAQ部分 -->
    <div class="info">
      <!-- 使用通用FAQ组件 -->
      <component
        :is="FAQComponent"
        :title="t('keyReactionTest')"
        :faq="currentFaq"
        :show-popular="true"
        :popular-questions="popularQuestions"
      />
    </div>
  </div>
</template>

<style scoped>
  .game-container {
    text-align: center;
    padding: 20px;
    background-color: #121212;
    color: white;
    min-height: 100vh;
    border-radius: 10px;
  }

  .game-area {
    width: 80%;
    max-width: 800px;
    min-height: 500px;
    background-color: #1a1a1a;
    border-radius: 15px;
    margin: 0 auto 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 20px;
  }

  /* 控制按钮 */
  .controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background-color: #333;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .control-btn:hover {
    background-color: #4caf50;
    transform: scale(1.05);
  }

  .control-btn:active {
    background-color: #388e3c;
    transform: scale(0.95);
    outline: none; /* 移除点击时的轮廓 */
  }

  .control-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  /* 方向键容器 */
  .keys-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
  }

  /* 中间行：左/下/右 */
  .middle-row {
    display: flex;
    gap: 15px;
  }

  /* 按键样式 */
  .key {
    width: 100px;
    height: 100px;
    background-color: #333;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    color: #666;
    transition: all 0.2s ease;
    user-select: none;
  }

  .key-text {
    font-size: 12px;
    margin-top: 5px;
    text-transform: uppercase;
  }

  /* 按键高亮状态 */
  .key.active {
    background-color: #4caf50;
    color: white;
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
  }

  /* 按键按下状态 */
  .key.pressed {
    transform: scale(0.95);
    background-color: #388e3c;
  }

  /* 位置特定样式 */
  .up-key {
    margin-bottom: 5px;
  }

  /* 提示文字 */
  .instruction {
    font-size: 16px;
    color: #ccc;
    margin-bottom: 30px;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 20px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
  }

  /* 开始按钮 */
  .start-btn {
    padding: 15px 40px;
    font-size: 18px;
    background-color: #ff4081;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(255, 64, 129, 0.5);
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .start-btn:hover {
    background-color: #f50057;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 64, 129, 0.7);
  }

  .start-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .start-btn:active {
    background-color: #e91e63;
    transform: scale(0.98); /* 轻微缩放效果 */
    box-shadow: 0 2px 10px rgba(255, 64, 129, 0.8); /* 调整阴影，增强点击反馈 */
    outline: none; /* 移除点击时的轮廓 */
  }

  /* 进度条 */
  .progress-container {
    width: 80%;
    max-width: 800px;
    margin: 0 auto;
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background-color: #333;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .progress-fill {
    height: 100%;
    background-color: #4caf50;
    transition: width 0.3s ease;
    border-radius: 5px;
  }

  .progress-text {
    text-align: right;
    color: #666;
    font-size: 14px;
  }

  /* 游戏区域样式 */
  .game-area {
    background-color: #000000 !important;
  }

  /* 全屏状态样式 */
  .full-screen-state {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 15px;
    background-color: #000000;
    border-radius: 15px;
    padding: 20px;
    margin: 0;
    z-index: 10;
    overflow-y: auto;
  }

  /* 错误状态样式 */
  .error-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    text-align: center;
    width: 100%;
    height: 100%;
  }

  .error-state h3 {
    font-size: 36px;
    color: white;
    margin: 0;
  }

  .error-state p {
    color: #ccc;
    margin: 0;
    font-size: 16px;
  }

  .try-again-btn {
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
    box-shadow: 0 4px 15px rgba(255, 65, 108, 0.5);
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .try-again-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 65, 108, 0.7);
  }

  .try-again-btn:active {
    background: linear-gradient(90deg, #e6005c 0%, #e6005c 100%);
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(255, 65, 108, 0.8);
    outline: none; /* 移除点击时的轮廓 */
  }

  .try-again-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  /* 成功状态样式 */
  .success-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    text-align: center;
    width: 100%;
    height: 100%;
    background-color: #4caf50;
    border-radius: 15px;
    padding: 20px;
    margin: 0;
    position: relative;
    overflow: hidden;
  }

  .success-state::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.1) 75%,
      transparent 75%,
      transparent
    );
    background-size: 50px 50px;
    opacity: 0.3;
    pointer-events: none;
  }

  .success-icon {
    font-size: 64px;
    color: white;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
  }

  .success-state h3 {
    font-size: 24px;
    color: white;
    margin: 0;
    position: relative;
    z-index: 1;
  }

  .reaction-time {
    font-size: 48px;
    font-weight: bold;
    color: white;
    margin: 10px 0;
    position: relative;
    z-index: 1;
  }

  .success-state p {
    color: white;
    margin: 0;
    font-size: 16px;
    position: relative;
    z-index: 1;
  }

  .continue-btn {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    z-index: 2;
  }

  /* 最终结果样式 */
  .final-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    padding: 30px 20px;
    background-color: transparent;
    border-radius: 0;
    max-width: 100%;
    height: 100%;
    overflow-y: auto;
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
    gap: 8px;
    background-color: rgba(30, 30, 30, 0.8);
    padding: 12px;
    border-radius: 10px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
    overflow: hidden;
  }

  /* 单轮结果卡片 */
  .round-result-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 70px;
    padding: 0 8px;
  }

  /* 轮次时间 */
  .round-time {
    font-size: 24px;
    font-weight: bold;
    color: white;
    line-height: 1;
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
    gap: 8px;
    background-color: rgba(30, 30, 30, 0.8);
    padding: 15px;
    border-radius: 10px;
    width: 100%;
    max-width: 90%;
    overflow: hidden;
  }

  /* 平均反应时间标签 */
  .average-label {
    font-size: 16px;
    color: #999;
    text-align: center;
    line-height: 1.2;
  }

  /* 平均反应时间 */
  .average-time {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 32px;
    font-weight: bold;
    color: #ffd700;
    max-width: 95%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
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
    font-size: 18px;
    font-weight: bold;
    color: white;
    margin-bottom: 8px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  /* 鼓励文字内容 */
  .encouragement-text {
    font-size: 13px;
    color: #ccc;
    line-height: 1.4;
    margin-bottom: 10px;
    max-width: 100%;
    overflow: hidden;
    text-align: center;
    word-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  /* 重新开始按钮 */
  .try-again-btn {
    max-width: 200px;
    width: 100%;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* FAQ部分样式 */
  .info {
    margin-top: 30px; /* 顶部外边距，与游戏区域保持距离 */
    padding: 20px; /* 内边距，增加内容与边框的间距 */
    background-color: #121212; /* 背景色，与游戏区域黑色背景形成对比 */
    border-radius: 15px; /* 圆角边框，提升视觉效果 */
    width: 80%; /* 宽度占父容器的80% */
    max-width: 800px; /* 最大宽度限制，确保在大屏幕上不会太宽 */
    margin: 30px auto 0; /* 居中显示，顶部外边距30px */
    text-align: left; /* 文本左对齐，提高可读性 */
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 游戏容器优化 */
    .game-container {
      padding: 10px 5px;
      min-height: 100vh;
    }

    /* 游戏区域优化 */
    .game-area {
      width: 90%;
      min-height: 500px;
      padding: 15px;
    }

    /* 按键布局优化 */
    .keys-container {
      gap: 8px;
      margin-bottom: 15px;
    }

    /* 中间行按键布局优化 */
    .middle-row {
      gap: 8px;
    }

    /* 按键大小优化 */
    .key {
      width: 75px;
      height: 75px;
      font-size: 18px;
      border-radius: 8px;
    }

    .key-text {
      font-size: 9px;
    }

    /* 文字大小优化 */
    .game-title {
      font-size: 24px;
      margin-bottom: 15px;
    }

    .instruction {
      font-size: 13px;
      margin-bottom: 15px;
      text-align: center;
      padding: 0 10px;
    }

    /* 开始按钮优化 */
    .start-btn {
      padding: 12px 30px;
      font-size: 16px;
    }

    /* 全屏状态优化 */
    .full-screen-state {
      padding: 15px;
      gap: 12px;
      border-radius: 10px;
    }

    /* 错误状态优化 */
    .error-state h3,
    .success-state h3 {
      font-size: 24px;
      line-height: 1.2;
    }

    .error-state p,
    .success-state p {
      font-size: 14px;
      line-height: 1.4;
      padding: 0 10px;
    }

    /* 反应时间显示优化 */
    .reaction-time {
      font-size: 36px;
      line-height: 1;
    }

    /* 成功图标优化 */
    .success-icon {
      font-size: 48px;
    }

    /* 最终结果优化 */
    .final-result {
      gap: 15px;
      padding: 20px 15px;
      height: 100%;
    }

    /* 轮次结果卡片优化 */
    .round-results-cards {
      gap: 6px;
      padding: 10px;
    }

    .round-result-card {
      min-width: 65px;
      gap: 5px;
    }

    .round-time {
      font-size: 20px;
    }

    .round-label {
      font-size: 10px;
    }

    /* 平均反应时间优化 */
    .average-container {
      padding: 12px;
      gap: 6px;
    }

    .average-label {
      font-size: 14px;
    }

    .average-time {
      font-size: 28px;
    }

    /* 鼓励文字优化 */
    .encouragement-title {
      font-size: 16px;
    }

    .encouragement-text {
      font-size: 12px;
      line-height: 1.3;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }

    /* 按钮优化 */
    .try-again-btn {
      padding: 12px 25px;
      font-size: 14px;
      max-width: 180px;
    }

    /* 进度条优化 */
    .progress-container {
      width: 95%;
    }

    /* 控制按钮优化 */
    .controls {
      top: 15px;
      right: 15px;
      gap: 8px;
    }

    .control-btn {
      width: 35px;
      height: 35px;
      font-size: 16px;
    }

    /* FAQ部分优化 */
    .info {
      width: 90%;
      padding: 15px;
      margin-top: 20px;
    }
  }
</style>
