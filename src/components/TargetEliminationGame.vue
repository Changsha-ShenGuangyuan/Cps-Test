<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { t } from '../i18n'; // 导入翻译函数
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 组件功能：目标消除反应训练游戏，测试用户的反应速度和手眼协调能力
  // 支持随机生成多个目标，倒计时，消除目标，统计分数等功能

  // 游戏状态枚举
  const GameState = {
    READY: 'ready', // 准备状态
    COUNTING_DOWN: 'countingDown', // 倒计时状态
    PLAYING: 'playing', // 游戏进行中
    PAUSED: 'paused', // 游戏暂停
    GAME_OVER: 'gameOver', // 游戏结束
  } as const;

  // 目标类型定义
  interface Target {
    id: number; // 目标唯一标识
    x: number; // 目标X坐标
    y: number; // 目标Y坐标
    size: number; // 目标大小
    color: string; // 目标颜色
    speedX: number; // 水平移动速度
    speedY: number; // 垂直移动速度
    active: boolean; // 目标是否活跃
  }

  // 状态管理
  const gameState = ref<(typeof GameState)[keyof typeof GameState]>(GameState.READY); // 当前游戏状态
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameOver = ref(false); // 游戏是否结束
  // 游戏时长选项
  const gameTimeOptions = [30, 60, 100, 300]; // 游戏时长选项：30秒，60秒，100秒，300秒
  // 方块大小选项
  const targetSizeOptions = {
    small: 30, // 小方块
    medium: 50, // 中方块
    large: 70, // 大方块
  } as const;
  // 方块大小类型
  const targetSizeLabel = ref<'small' | 'medium' | 'large'>('medium'); // 当前方块大小标签
  const gameTime = ref(30); // 游戏时长（秒）
  const remainingTime = ref(gameTime.value); // 剩余时间（秒）
  const score = ref(0); // 当前分数
  const bestScore = ref(0); // 最佳分数
  const countdown = ref(3); // 倒计时（秒）
  const targets = ref<Target[]>([]); // 所有目标
  const targetCount = ref(5); // 目标数量
  const targetSize = ref(targetSizeOptions[targetSizeLabel.value]); // 目标大小，根据标签动态计算
  const spawnInterval = ref(1000); // 目标生成间隔（毫秒）
  const spawnTimer = ref<number | null>(null); // 目标生成定时器
  const gameTimer = ref<number | null>(null); // 游戏倒计时定时器
  const countdownTimer = ref<number | null>(null); // 3秒倒计时定时器
  const gameContainerRef = ref<HTMLElement | null>(null); // 游戏容器引用
  const targetIdCounter = ref(0); // 目标ID计数器，用于生成唯一ID
  const gameMode = ref<'static' | 'dynamic'>('static'); // 游戏模式：静态或动态
  const speedLevel = ref(1); // 速度等级：1-3，1为最慢，3为最快

  // 计算属性：游戏容器尺寸
  const containerSize = ref({ width: 600, height: 400 });

  // 计算属性：格式化剩余时间
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // 随机颜色数组
  const colors = [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#F44336',
    '#9C27B0',
    '#3F51B5',
    '#00BCD4',
    '#FFEB3B',
  ];

  // 生成随机颜色
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 生成随机目标
  const spawnTarget = () => {
    // 如果游戏已结束，不再生成目标
    if (gameState.value !== GameState.PLAYING) return;

    // 如果活跃目标数量已达到上限，不再生成目标
    const activeTargetCount = targets.value.filter((target) => target.active).length;
    if (activeTargetCount >= targetCount.value) return;

    // 生成随机位置和速度
    const size = targetSize.value;
    const x = Math.random() * (containerSize.value.width - size);
    const y = Math.random() * (containerSize.value.height - size);

    // 根据游戏模式和速度等级设置速度
    const baseSpeed = gameMode.value === 'static' ? 0 : speedLevel.value * 1.7;
    const speedX = gameMode.value === 'static' ? 0 : (Math.random() - 0.5) * baseSpeed;
    const speedY = gameMode.value === 'static' ? 0 : (Math.random() - 0.5) * baseSpeed;

    // 创建新目标
    const newTarget: Target = {
      id: targetIdCounter.value++,
      x,
      y,
      size,
      color: getRandomColor() || '#4CAF50',
      speedX,
      speedY,
      active: true,
    };

    // 添加到目标数组
    targets.value.push(newTarget);
  };

  // 更新目标位置
  const updateTargets = () => {
    // 如果游戏未在进行中，不更新目标位置
    if (gameState.value !== GameState.PLAYING) return;

    // 更新所有目标位置
    targets.value = targets.value.map((target) => {
      if (!target.active) return target;

      // 更新位置
      let newX = target.x + target.speedX;
      let newY = target.y + target.speedY;
      let newSpeedX = target.speedX;
      let newSpeedY = target.speedY;

      // 碰撞检测和反弹
      if (newX <= 0 || newX >= containerSize.value.width - target.size) {
        newSpeedX = -newSpeedX;
        newX = newX <= 0 ? 0 : containerSize.value.width - target.size;
      }
      if (newY <= 0 || newY >= containerSize.value.height - target.size) {
        newSpeedY = -newSpeedY;
        newY = newY <= 0 ? 0 : containerSize.value.height - target.size;
      }

      return {
        ...target,
        x: newX,
        y: newY,
        speedX: newSpeedX,
        speedY: newSpeedY,
      };
    });
  };

  // 消除目标
  const eliminateTarget = (id: number) => {
    // 如果游戏未在进行中，不处理点击
    if (gameState.value !== GameState.PLAYING) return;

    // 直接过滤活跃的目标，提高性能
    const target = targets.value.find((t) => t.id === id && t.active);
    if (target) {
      // 标记为不活跃
      target.active = false;
      // 增加分数
      score.value += 10;
      // 移除目标（缩短延迟，提高响应速度）
      setTimeout(() => {
        targets.value = targets.value.filter((t) => t.id !== id);
      }, 50);
      // 生成新目标
      spawnTarget();
    }
  };

  // 开始游戏
  const startGame = () => {
    // 重置游戏状态
    gameState.value = GameState.COUNTING_DOWN;
    isPlaying.value = true;
    isGameOver.value = false;
    remainingTime.value = gameTime.value;
    score.value = 0;
    countdown.value = 3; // 重置倒计时
    targetIdCounter.value = 0; // 重置目标ID计数器
    targets.value = [];

    // 3秒倒计时
    countdownTimer.value = window.setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer.value as number);
        countdownTimer.value = null;
        // 开始游戏
        gameState.value = GameState.PLAYING;
        // 设置游戏定时器
        gameTimer.value = window.setInterval(() => {
          remainingTime.value--;
          if (remainingTime.value <= 0) {
            endGame();
          }
        }, 1000) as unknown as number;
        // 设置目标生成定时器
        spawnTimer.value = window.setInterval(
          spawnTarget,
          spawnInterval.value
        ) as unknown as number;
        // 生成初始目标
        for (let i = 0; i < targetCount.value; i++) {
          setTimeout(
            () => {
              spawnTarget();
            },
            (i * spawnInterval.value) / targetCount.value
          );
        }
      }
    }, 1000) as unknown as number;
  };

  // 结束游戏
  const endGame = () => {
    // 清除定时器
    if (spawnTimer.value) {
      clearInterval(spawnTimer.value);
      spawnTimer.value = null;
    }
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }

    // 更新最佳分数
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      // 保存最佳分数到本地存储
      localStorage.setItem('targetEliminationBestScore', bestScore.value.toString());
    }

    // 更新游戏状态
    gameState.value = GameState.GAME_OVER;
    isPlaying.value = false;
    isGameOver.value = true;
  };

  // 重置游戏
  const resetGame = () => {
    // 清除定时器
    if (spawnTimer.value) {
      clearInterval(spawnTimer.value);
      spawnTimer.value = null;
    }
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }

    // 重置游戏状态
    gameState.value = GameState.READY;
    isPlaying.value = false;
    isGameOver.value = false;
    remainingTime.value = gameTime.value;
    score.value = 0;
    targetIdCounter.value = 0; // 重置目标ID计数器
    targets.value = [];
  };

  // 游戏循环
  let gameLoop: number | null = null;
  const startGameLoop = () => {
    const loop = () => {
      updateTargets();
      gameLoop = requestAnimationFrame(loop);
    };
    gameLoop = requestAnimationFrame(loop);
  };

  // 停止游戏循环
  const stopGameLoop = () => {
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
      gameLoop = null;
    }
  };

  // 更新容器尺寸并调整现有目标位置
  const updateContainerSize = () => {
    if (gameContainerRef.value) {
      const oldWidth = containerSize.value.width;
      const oldHeight = containerSize.value.height;

      // 更新容器尺寸
      containerSize.value = {
        width: gameContainerRef.value.offsetWidth,
        height: gameContainerRef.value.offsetHeight,
      };

      // 如果容器尺寸变化，调整现有目标位置，确保它们不会超出边界
      if (oldWidth !== containerSize.value.width || oldHeight !== containerSize.value.height) {
        targets.value = targets.value.map((target) => {
          if (!target.active) return target;

          // 确保目标X坐标在新容器内
          let newX = target.x;
          if (newX + target.size > containerSize.value.width) {
            newX = containerSize.value.width - target.size;
          }
          if (newX < 0) {
            newX = 0;
          }

          // 确保目标Y坐标在新容器内
          let newY = target.y;
          if (newY + target.size > containerSize.value.height) {
            newY = containerSize.value.height - target.size;
          }
          if (newY < 0) {
            newY = 0;
          }

          return {
            ...target,
            x: newX,
            y: newY,
          };
        });
      }
    }
  };

  // 组件挂载
  onMounted(() => {
    // 加载最佳分数
    const savedBestScore = localStorage.getItem('targetEliminationBestScore');
    if (savedBestScore) {
      bestScore.value = parseInt(savedBestScore);
    }
    // 开始游戏循环
    startGameLoop();
    // 设置容器尺寸
    updateContainerSize();
    // 添加窗口大小变化监听
    window.addEventListener('resize', updateContainerSize);
  });

  // 组件卸载
  onUnmounted(() => {
    // 停止游戏循环
    stopGameLoop();
    // 清除定时器
    if (spawnTimer.value) {
      clearInterval(spawnTimer.value);
      spawnTimer.value = null;
    }
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
    // 移除窗口大小变化监听
    window.removeEventListener('resize', updateContainerSize);
  });

  // 监听游戏模式变化，重置游戏
  watch(
    () => gameMode.value,
    () => {
      resetGame();
    }
  );

  // 监听速度等级变化，重置游戏
  watch(
    () => speedLevel.value,
    () => {
      resetGame();
    }
  );

  // 监听游戏时长变化，重置游戏
  watch(
    () => gameTime.value,
    () => {
      resetGame();
    }
  );

  // 监听方块大小变化，更新实际大小并重置游戏
  watch(
    () => targetSizeLabel.value,
    (newLabel) => {
      targetSize.value = targetSizeOptions[newLabel];
      resetGame();
    }
  );

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsTargetEliminationGame'),
        a: t('whatIsTargetEliminationGameDesc'),
        relatedQuestions: [t('gameRules'), t('whatIsTargetEliminationGameUsefulFor')],
      },
      {
        q: t('gameRules'),
        a: t('gameRulesDesc'),
        relatedQuestions: [
          t('whatIsTargetEliminationGame'),
          t('howToImproveTargetEliminationScore'),
        ],
      },
      {
        q: t('whatIsTargetEliminationGameUsefulFor'),
        a: t('whatIsTargetEliminationGameUsefulForDesc'),
        relatedQuestions: [
          t('whatIsTargetEliminationGame'),
          t('targetEliminationGameDesignPrinciple'),
        ],
      },
      {
        q: t('howToImproveTargetEliminationScore'),
        a: t('howToImproveTargetEliminationScoreDesc'),
        relatedQuestions: [t('gameRules'), t('targetEliminationGameDesignPrinciple')],
      },
      {
        q: t('targetEliminationGameDesignPrinciple'),
        a: t('targetEliminationGameDesignPrincipleDesc'),
        relatedQuestions: [
          t('whatIsTargetEliminationGameUsefulFor'),
          t('howToImproveTargetEliminationScore'),
        ],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [
      t('whatIsTargetEliminationGame'),
      t('gameRules'),
      t('howToImproveTargetEliminationScore'),
    ];
  });
</script>

<template>
  <div class="game-container">
    <!-- 游戏标题 -->
    <h2 class="game-title">{{ t('targetEliminationGame') }}</h2>

    <!-- 游戏数据统计 -->
    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">{{ t('time') }}</span>
        <span class="stat-value">{{ formattedTime }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ t('score') }}</span>
        <span class="stat-value score-value">{{ score }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ t('bestScore') }}</span>
        <span class="stat-value best-score-value">{{ bestScore }}</span>
      </div>
    </div>

    <!-- 游戏和设置区域 -->
    <div class="game-and-settings">
      <!-- 游戏区域 -->
      <div
        ref="gameContainerRef"
        class="game-area"
        :class="{
          playing: gameState === GameState.PLAYING,
          'counting-down': gameState === GameState.COUNTING_DOWN,
          'game-over': gameState === GameState.GAME_OVER,
        }"
      >
        <!-- 准备状态 -->
        <div v-if="gameState === GameState.READY" class="ready-state">
          <h3>{{ t('readyToStart') }}</h3>
          <p>{{ t('targetEliminationGameDesc') }}</p>
          <p>{{ t('gameDuration') }}：{{ gameTime }} {{ t('sec') }}</p>
          <button class="start-btn" @click="startGame">{{ t('startGame') }}</button>
        </div>

        <!-- 倒计时状态 -->
        <div v-else-if="gameState === GameState.COUNTING_DOWN" class="countdown-state">
          <div class="countdown-number">{{ countdown }}</div>
        </div>

        <!-- 游戏进行中 -->
        <div v-else-if="gameState === GameState.PLAYING" class="playing-state">
          <!-- 所有目标 -->
          <div
            v-for="target in targets"
            :key="target.id"
            class="target"
            :class="{ eliminated: !target.active }"
            :style="{
              left: `${target.x}px`,
              top: `${target.y}px`,
              width: `${target.size}px`,
              height: `${target.size}px`,
              backgroundColor: target.color,
            }"
            @mousedown.stop="eliminateTarget(target.id)"
          ></div>
        </div>

        <!-- 游戏结束 -->
        <div v-else-if="gameState === GameState.GAME_OVER" class="game-over-state">
          <h3>{{ t('gameOver') }}</h3>
          <div class="final-score">{{ t('finalScore') }}: {{ score }}</div>
          <div v-if="score === bestScore && score > 0" class="new-record">
            {{ t('newRecord') }}！
          </div>
          <button class="restart-btn" @click="resetGame">{{ t('restartGame') }}</button>
        </div>
      </div>

      <!-- 外部设置面板（始终显示，根据游戏模式调整样式） -->
      <div
        class="external-settings-panel"
        :class="{ 'dynamic-mode': gameMode === 'dynamic', 'static-mode': gameMode === 'static' }"
      >
        <h4 class="settings-title">⚙️{{ t('settings') }}</h4>

        <!-- 游戏时长选择 -->
        <div class="settings-section">
          <h5>{{ t('gameDuration') }}</h5>
          <div class="options-grid">
            <label
              v-for="option in gameTimeOptions"
              :key="option"
              class="setting-option"
              :class="{ active: gameTime === option }"
            >
              <input v-model="gameTime" type="radio" :value="option" />
              <span>{{ option }} {{ t('sec') }}</span>
            </label>
          </div>
        </div>

        <!-- 方块大小选择 -->
        <div class="settings-section">
          <h5>{{ t('blockSize') }}</h5>
          <div class="options-grid">
            <label class="setting-option" :class="{ active: targetSizeLabel === 'small' }">
              <input v-model="targetSizeLabel" type="radio" value="small" />
              <span>{{ t('small') }}</span>
            </label>
            <label class="setting-option" :class="{ active: targetSizeLabel === 'medium' }">
              <input v-model="targetSizeLabel" type="radio" value="medium" />
              <span>{{ t('medium') }}</span>
            </label>
            <label class="setting-option" :class="{ active: targetSizeLabel === 'large' }">
              <input v-model="targetSizeLabel" type="radio" value="large" />
              <span>{{ t('large') }}</span>
            </label>
          </div>
        </div>

        <!-- 游戏模式选择 -->
        <div class="settings-section">
          <h5>{{ t('gameMode') }}</h5>
          <div class="options-grid">
            <label class="setting-option" :class="{ active: gameMode === 'static' }">
              <input v-model="gameMode" type="radio" value="static" />
              <span>{{ t('static') }}</span>
            </label>
            <label class="setting-option" :class="{ active: gameMode === 'dynamic' }">
              <input v-model="gameMode" type="radio" value="dynamic" />
              <span>{{ t('dynamic') }}</span>
            </label>
          </div>
        </div>

        <!-- 速度控制 -->
        <div v-if="gameMode === 'dynamic'" class="settings-section">
          <h5>{{ t('movementSpeed') }}</h5>
          <div class="options-grid">
            <label class="setting-option" :class="{ active: speedLevel === 1 }">
              <input v-model="speedLevel" type="radio" :value="1" />
              <span>{{ t('slow') }}</span>
            </label>
            <label class="setting-option" :class="{ active: speedLevel === 2 }">
              <input v-model="speedLevel" type="radio" :value="2" />
              <span>{{ t('medium') }}</span>
            </label>
            <label class="setting-option" :class="{ active: speedLevel === 3 }">
              <input v-model="speedLevel" type="radio" :value="3" />
              <span>{{ t('fast') }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions info">
      <div class="faq-section">
        <!-- 使用通用FAQ组件 -->
        <FAQComponent
          :title="t('targetEliminationGame')"
          :faq="currentFaq"
          :show-popular="true"
          :popular-questions="popularQuestions"
        />
      </div>

      <!-- 相关测试推荐组件 -->
      <RelatedTests current-test="targetEliminationGame" />
    </div>
  </div>
</template>

<style scoped>
  /* 游戏容器 */
  .game-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
    background-color: #121212;
    color: white;
    position: relative;
    box-sizing: border-box;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 25px;
    align-items: center;
    overflow: hidden;
    width: 100%;
  }

  /* 游戏和设置区域 */
  .game-and-settings {
    display: grid;
    grid-template-columns: 1fr minmax(250px, 28%);
    grid-template-rows: auto;
    gap: clamp(15px, 3vw, 30px);
    width: 100%;
    justify-content: center;
    max-width: 100%;
    box-sizing: border-box;
  }

  /* 游戏区域 */
  .game-area {
    grid-column: 1;
    grid-row: 1;
    height: 430px;
    width: 100%;
    background-color: #000000;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    cursor: crosshair;
    border: 2px solid #333;
    box-sizing: border-box;
    margin: 0;
  }

  /* 外部设置面板 */
  .external-settings-panel {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 20px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  /* 游戏统计信息 - 参考ClickTest.vue样式 */
  .game-stats {
    display: flex; /* 使用flex布局 */
    justify-content: center; /* 卡片居中对齐 */
    margin: clamp(15px, 3vw, 25px) auto; /* 响应式外边距 */
    max-width: 900px; /* 最大宽度 */
    width: 95%; /* 响应式宽度 */
    background-color: #333; /* 背景色 */
    border-radius: 15px; /* 圆角 */
    overflow: hidden; /* 隐藏溢出内容 */
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4); /* 阴影效果 */
    border: 2px solid #444; /* 边框 */
  }

  /* 单个统计项 */
  .stat-item {
    flex: 1; /* 平均分配空间 */
    min-width: clamp(80px, 22vw, 160px); /* 响应式最小宽度 */
    padding: clamp(12px, 2.5vw, 18px) clamp(8px, 1.5vw, 12px); /* 响应式内边距 */
    color: white; /* 文本颜色 */
    font-weight: bold; /* 文本粗细 */
    text-align: center; /* 文本居中 */
    height: auto; /* 自动高度 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直排列 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    gap: 5px; /* 内部元素间距 */
  }

  /* 统计标签 */
  .stat-label {
    font-size: clamp(12px, 1.6vw, 14px); /* 响应式字体大小 */
    opacity: 0.95; /* 透明度 */
    line-height: 1; /* 行高 */
    font-weight: 500; /* 文本粗细 */
    color: white; /* 文本颜色 */
    margin: 0; /* 清除外边距 */
    text-transform: uppercase; /* 大写转换 */
    letter-spacing: 0.5px; /* 字间距 */
  }

  /* 统计值 */
  .stat-value {
    font-size: clamp(20px, 3.5vw, 30px); /* 响应式字体大小 */
    margin-bottom: 4px; /* 底部外边距 */
    line-height: 1; /* 行高 */
    font-weight: 800; /* 文本粗细 */
    white-space: nowrap; /* 不换行 */
    overflow: visible; /* 可见溢出 */
    text-align: center; /* 文本居中 */
    color: white; /* 文本颜色 */
    margin: 0; /* 清除外边距 */
  }

  /* 时间统计项 - 渐变背景 */
  .stat-item:nth-child(1) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 紫色渐变 */
  }

  /* 分数统计项 - 渐变背景 */
  .stat-item:nth-child(2) {
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); /* 粉色渐变 */
  }

  /* 最佳分数统计项 - 渐变背景 */
  .stat-item:nth-child(3) {
    background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); /* 青色渐变 */
  }

  /* 分数值特殊样式 */
  .score-value {
    color: white;
    animation: pulse 1.5s infinite;
  }

  /* 最佳分数特殊样式 */
  .best-score-value {
    color: white;
  }

  /* 准备状态 */
  .ready-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    gap: 20px;
    padding: 40px;
    box-sizing: border-box;
  }

  /* 外部设置面板 */
  .external-settings-panel {
    width: clamp(250px, 28%, 320px);
    background-color: rgba(40, 40, 40, 0.95);
    border-radius: 15px;
    padding: clamp(12px, 2vw, 15px);
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2vw, 15px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(80, 80, 80, 0.5);
    height: auto;
    max-height: 550px;
    overflow-y: auto;
    box-sizing: border-box;
    transition: all 0.3s ease;
    transform: translateX(0);
    flex-shrink: 0;
    margin-top: 0;
  }

  /* 动态模式下的设置面板样式 */
  .external-settings-panel.dynamic-mode {
    max-height: 600px;
  }

  /* 静态模式下的设置面板样式 */
  .external-settings-panel.static-mode {
    max-height: 500px;
  }

  /* 设置标题 */
  .settings-title {
    color: #4caf50;
    margin: 0;
    font-size: clamp(18px, 2vw, 22px);
    text-align: left;
    font-weight: bold;
    line-height: 1;
    padding: 0;
  }

  /* 设置区块 */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* 区块标题 */
  .settings-section h5 {
    color: #ffffff;
    margin: 0;
    font-size: clamp(14px, 1.5vw, 16px);
    font-weight: bold;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0;
    line-height: 1;
    padding: 0;
  }

  /* 选项网格 */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  /* 单个设置选项 */
  .setting-option {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 8px;
    background-color: rgba(60, 60, 60, 0.8);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.1s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid transparent;
    user-select: none;
    font-size: 11px;
    line-height: 1;
    min-height: auto;
    min-width: 60px;
    white-space: nowrap;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  /* 选项激活状态 */
  .setting-option.active {
    background-color: #4caf50;
    border-color: #4caf50;
  }

  /* 选项悬停效果 */
  .setting-option:hover {
    background-color: rgba(80, 80, 80, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .setting-option.active:hover {
    background-color: #45a049;
  }

  /* 选项点击效果 */
  .setting-option:active {
    transform: scale(0.95);
    outline: none; /* 移除点击时的轮廓 */
  }

  /* 隐藏原生radio按钮 */
  .setting-option input[type='radio'] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    outline: none; /* 移除radio按钮的轮廓 */
  }

  /* 选项文本 */
  .setting-option span {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    z-index: 2;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  /* 选项激活时文本颜色 */
  .setting-option.active span {
    color: #ffffff;
  }

  .ready-state h3 {
    font-size: 28px;
    margin-bottom: 15px;
    color: #4caf50;
  }

  .ready-state p {
    font-size: 18px;
    margin-bottom: 15px;
    opacity: 0.8;
    max-width: 600px;
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
    margin-top: 20px;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .start-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  .start-btn:active {
    background-color: #388e3c;
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    outline: none; /* 移除点击时的轮廓 */
  }

  .start-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  /* 倒计时状态 */
  .countdown-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    z-index: 10;
    position: relative;
  }

  .countdown-number {
    font-size: 150px;
    font-weight: bold;
    color: #ff7b00;
    animation: pulse 1s ease-in-out infinite;
  }

  /* 游戏进行中 */
  .playing-state {
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* 目标元素 */
  .target {
    position: absolute;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    transform: scale(1);
    z-index: 10;
    border-radius: 8px;
  }

  /* 目标被消除 */
  .target.eliminated {
    transform: scale(0);
    opacity: 0;
    transition: all 0.1s ease;
    animation: clickPulse 0.1s ease-out forwards;
  }

  /* 目标悬停效果 */
  .target:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    z-index: 11;
  }

  /* 目标点击效果 */
  .target:active {
    animation: clickPulse 0.2s ease-out forwards;
  }

  /* 点击脉冲动画 */
  @keyframes clickPulse {
    0% {
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    50% {
      transform: scale(1.3);
      opacity: 0.8;
      box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
    }
    100% {
      transform: scale(0);
      opacity: 0;
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
  }

  /* 游戏结束状态 */
  .game-over-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    z-index: 10;
    position: relative;
  }

  .game-over-state h3 {
    font-size: 36px;
    margin-bottom: 20px;
    color: #f44336;
  }

  /* 最终分数 */
  .final-score {
    font-size: 72px;
    font-weight: bold;
    color: #4caf50;
    margin-bottom: 20px;
  }

  /* 新纪录 */
  .new-record {
    font-size: 24px;
    color: #ffeb3b;
    margin-bottom: 30px;
    animation: pulse 1s ease-in-out infinite;
  }

  /* 重新开始按钮 */
  .restart-btn {
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

  .restart-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  .restart-btn:active {
    background-color: #388e3c;
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    outline: none; /* 移除点击时的轮廓 */
  }

  .restart-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  /* 游戏说明 */
  .game-instructions {
    margin-top: 0px;
    padding: 0;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    text-align: center;
  }

  /* FAQ 部分 */
  .faq-section {
    border-radius: 12px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* FAQ 主标题 */
  .faq-section h2 {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
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

  /* 全宽样式 */
  .full-width {
    grid-column: 1 / -1;
    background-color: rgba(40, 40, 40, 0.8);
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

  /* 脉动动画 */
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 目标生成动画 */
  @keyframes spawn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 游戏区域状态样式 */
  .game-area.playing {
    background-color: #000000;
  }

  .game-area.counting-down {
    background-color: #000000;
  }

  .game-area.game-over {
    background-color: #000000;
  }

  /* 中等屏幕适配 */
  @media (max-width: 1024px) {
    /* 外部设置面板优化 */
    .external-settings-panel {
      width: clamp(240px, 35%, 300px);
      max-height: 500px;
    }
  }

  /* 汉堡菜单显示时的适配 */
  @media (max-width: 1200px) {
    /* 游戏和设置区域 - 垂直排列 */
    .game-and-settings {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    /* 游戏区域容器 - 宽度100% */
    .game-section {
      grid-column: 1;
      grid-row: 1;
      width: 100%;
      min-width: auto;
      gap: 12px;
    }

    /* 外部设置面板 - 显示在游戏点击区域下方 */
    .external-settings-panel {
      grid-column: 1;
      grid-row: 2;
      width: 100%;
      max-width: 100%;
      margin-top: 0;
      margin-right: 0;
      padding: clamp(10px, 3vw, 15px);
      border-radius: 10px;
      max-height: none;
      height: auto;
      transform: translateX(0px);
      align-self: center;
    }

    /* 游戏容器优化 */
    .game-container {
      padding: 10px 5px;
      gap: 15px;
      border-radius: 0;
    }

    /* 游戏区域优化 */
    .game-area {
      height: 350px;
      width: 100%;
      margin: 0 auto;
      border-radius: 10px;
    }

    /* 游戏标题优化 */
    .game-title {
      font-size: 24px;
      margin-bottom: 15px;
      margin-top: 10px;
    }

    /* 统计信息优化 */
    .game-stats {
      gap: 0;
      margin-bottom: 15px;
      width: 100%;
      flex-wrap: nowrap;
    }

    /* 统计卡片横向排列，缩小样式 */
    .stat-item {
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

    /* 选项网格优化 */
    .options-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: clamp(6px, 2vw, 10px);
    }

    /* 设置标题优化 */
    .settings-title {
      font-size: 18px;
      text-align: center;
    }

    /* 设置选项优化 */
    .settings-section {
      gap: 8px;
    }

    .settings-section h5 {
      font-size: 14px;
      text-align: center;
    }

    .options-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .setting-option {
      padding: 10px 15px;
      font-size: 14px;
    }

    .setting-option span {
      font-size: 14px;
    }

    /* 准备状态优化 */
    .ready-state {
      padding: 20px;
      gap: 15px;
    }

    .ready-state h3 {
      font-size: 24px;
      margin: 0;
    }

    .ready-state p {
      font-size: 14px;
      margin: 0;
      padding: 0 10px;
    }

    /* 开始按钮优化 */
    .start-btn,
    .restart-btn {
      padding: 12px 24px;
      font-size: 18px;
    }

    /* 倒计时优化 */
    .countdown-number {
      font-size: 100px;
    }

    /* 游戏结束状态优化 */
    .game-over-state h3 {
      font-size: 28px;
      margin-bottom: 15px;
    }

    .final-score {
      font-size: 56px;
      margin-bottom: 15px;
    }

    .new-record {
      font-size: 20px;
      margin-bottom: 20px;
    }

    /* 游戏说明优化 */
    .game-instructions {
      margin-top: 20px;
      padding: 0 5px;
    }

    /* FAQ部分优化 */
    .faq-section {
      padding: 20px;
      gap: 20px;
    }

    .faq-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .faq-item {
      padding: 20px;
    }

    .faq-item h4 {
      font-size: 16px;
    }

    .faq-item p {
      font-size: 13px;
    }

    /* 目标大小优化 */
    .target {
      border-radius: 6px;
    }

    /* 目标消除动画优化 */
    .target.eliminated {
      transition: all 0.08s ease;
    }

    /* 脉动动画优化 */
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  }
</style>
