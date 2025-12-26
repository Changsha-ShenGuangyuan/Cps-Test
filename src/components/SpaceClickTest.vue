<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { t } from '../i18n/index';
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';
  // 导入结果弹窗组件
  import ResultModal from './ResultModal.vue';

  // 组件功能：空格点击速度测试组件

  // 历史记录类型定义
  interface HistoryRecord {
    id: number;
    testTime: number;
    clicks: number;
    cps: number;
    date: string;
  }

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

  // 根据测试时间获取对应的FAQ
  const currentFaq = computed(() => {
    const time = testTime.value;
    // 返回当前时间对应的FAQ翻译数组
    return [
      {
        q: t(`spaceFaq${time}Q1`),
        a: t(`spaceFaq${time}A1`),
        relatedQuestions: [t(`spaceFaq${time}Q2`), t(`spaceFaq${time}Q3`)],
      },
      {
        q: t(`spaceFaq${time}Q2`),
        a: t(`spaceFaq${time}A2`),
        relatedQuestions: [t(`spaceFaq${time}Q1`), t(`spaceFaq${time}Q4`)],
      },
      {
        q: t(`spaceFaq${time}Q3`),
        a: t(`spaceFaq${time}A3`),
        relatedQuestions: [t(`spaceFaq${time}Q1`), t(`spaceFaq${time}Q2`)],
      },
      {
        q: t(`spaceFaq${time}Q4`),
        a: t(`spaceFaq${time}A4`),
        relatedQuestions: [t(`spaceFaq${time}Q2`), t(`spaceFaq${time}Q3`)],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t(`spaceFaq${testTime.value}Q1`), t(`spaceFaq${testTime.value}Q2`), t('homeFaqQ1')];
  });

  // 状态管理
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameReady = ref(false); // 游戏是否准备就绪（点击SPACEBAR按钮后）
  const isGameOver = ref(false); // 游戏是否结束（专门用于标识最终状态）
  const showPressHint = ref(true); // 是否显示"Press SPACE to click"提示
  const startTime = ref(0); // 游戏开始时间戳
  const endTime = ref(0); // 游戏结束时间戳
  const clicks = ref(0); // 点击次数
  const cps = ref(0); // 最终CPS值（每秒点击次数）
  const timer = ref(0); // 定时器ID
  const elapsedTime = ref(0); // 已用时间（毫秒级精度）
  const isSpacePressed = ref(false); // 空格键是否被按住
  const showResultModal = ref(false); // 结果弹窗显示状态

  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]); // 历史记录数组

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('spaceClickTestHistory');
    if (saved) {
      const loaded = JSON.parse(saved);
      historyRecords.value = loaded;
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem('spaceClickTestHistory', JSON.stringify(historyRecords.value));
  };

  // 初始化加载历史记录
  loadHistory();

  // 计算属性：判断时间是否到了
  const isTimeUp = computed(() => {
    // 游戏未开始或已结束，返回false
    if (!isPlaying.value || isGameOver.value) return false;

    // 计算已用时间（秒）
    const elapsed = (Date.now() - startTime.value) / 1000;
    return elapsed >= testTime.value; // 已用时间大于等于测试时间则返回true
  });

  // 计算属性：实时计算当前CPS
  const currentCps = computed(() => {
    // 游戏结束时，显示最终CPS值
    if (isGameOver.value) {
      return cps.value;
    }

    // 游戏未开始或无点击则返回0
    if (!isPlaying.value || clicks.value === 0) return 0;

    // 使用 Timer (elapsedTime) 和 Score (clicks) 进行实时计算
    // 避免除以0或极小值导致的Infinity
    if (elapsedTime.value < 0.1) return 0;

    // 计算CPS并保留2位小数
    return Math.round((clicks.value / elapsedTime.value) * 100) / 100;
  });

  // 计算属性：根据当前测试时长筛选历史记录
  const filteredHistory = computed(() => {
    return historyRecords.value.filter((record) => record.testTime === testTime.value);
  });

  // 游戏开始函数
  const startGame = () => {
    if (isPlaying.value) return; // 防止重复开始

    // 重置游戏状态
    clicks.value = 0;
    startTime.value = Date.now(); // 记录开始时间
    isPlaying.value = true;
    isGameOver.value = false; // 确保游戏未结束
    elapsedTime.value = 0; // 重置已用时间

    // 设置定时器，每50ms更新一次状态
    timer.value = window.setInterval(() => {
      // 计算并更新已用时间（毫秒级）
      const elapsed = (Date.now() - startTime.value) / 1000;
      elapsedTime.value = Math.min(elapsed, testTime.value);

      // 检查时间是否结束（直接计算，不依赖isTimeUp）
      if (elapsed >= testTime.value) {
        endGame();
      }
    }, 50); // 50ms更新一次，确保毫秒级显示流畅
  };

  // 游戏结束函数
  const endGame = () => {
    isPlaying.value = false; // 标记游戏结束
    isGameOver.value = true; // 设置最终结束状态
    endTime.value = Date.now(); // 记录结束时间

    // 计算最终CPS，使用规定的测试时间，确保与clicks保持一致
    cps.value = testTime.value > 0 ? Math.round((clicks.value / testTime.value) * 100) / 100 : 0;

    // 确保已用时间显示为规定的测试时间，而不是实际的游戏持续时间
    elapsedTime.value = testTime.value;

    // 清除定时器
    clearInterval(timer.value);

    // 创建历史记录
    const newRecord: HistoryRecord = {
      id: Date.now(),
      testTime: testTime.value,
      clicks: clicks.value,
      cps: cps.value,
      date: new Date().toLocaleString(),
    };

    // 添加到历史记录数组
    historyRecords.value.unshift(newRecord);

    // 限制历史记录数量（最多保存10条）
    if (historyRecords.value.length > 10) {
      historyRecords.value = historyRecords.value.slice(0, 10);
    }

    // 保存到localStorage
    saveHistory();

    // 显示结果弹窗
    showResultModal.value = true;

    // 游戏结束时不移除空格键事件监听，继续阻止默认行为
    // removeSpaceListener()
  };

  // 点击空格键按钮处理函数
  const handleSpacebarClick = () => {
    // 标记游戏准备就绪
    isGameReady.value = true;
    // 重新显示"Press SPACE to click"提示
    showPressHint.value = true;
  };

  // 空格键按下处理函数
  const handleSpaceDown = (event: KeyboardEvent) => {
    // 只处理空格键
    if (event.code !== 'Space') return;

    // 阻止空格的默认行为（防止页面滚动）
    event.preventDefault();

    // 游戏结束或时间到了，不处理点击事件
    if (isGameOver.value || isTimeUp.value) {
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

    // 隐藏"Press SPACE to click"提示
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

    // 游戏结束或时间到了，不处理点击事件
    if (isGameOver.value || isTimeUp.value) {
      return;
    }

    // 游戏未准备就绪，不处理点击事件
    if (!isGameReady.value) {
      return;
    }

    // 标记空格键已释放
    isSpacePressed.value = false;

    // 更新点击次数（游戏进行中且时间未到）
    if (isPlaying.value && !isTimeUp.value) {
      clicks.value++;
    }
  };

  // 添加空格键事件监听
  const addSpaceEventListener = () => {
    window.addEventListener('keydown', handleSpaceDown);
    window.addEventListener('keyup', handleSpaceUp);
  };

  // 移除空格键事件监听
  const removeSpaceEventListener = () => {
    window.removeEventListener('keydown', handleSpaceDown);
    window.removeEventListener('keyup', handleSpaceUp);
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    addSpaceEventListener();
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    removeSpaceEventListener();
    clearInterval(timer.value);
  });

  // 重新开始游戏时添加事件监听
  const addSpaceListener = () => {
    addSpaceEventListener();
  };

  // 重置游戏函数
  const resetGame = () => {
    // 重置所有游戏状态，回到初始状态，需要重新走一遍完整游戏流程
    isPlaying.value = false;
    isGameReady.value = false; // 重置准备状态，需要重新点击SPACEBAR按钮
    isGameOver.value = false;
    isSpacePressed.value = false; // 重置空格键按下状态
    clicks.value = 0;
    cps.value = 0;
    elapsedTime.value = 0;
    showPressHint.value = true; // 重置提示显示
    showResultModal.value = false; // 关闭结果弹窗

    // 清除定时器
    clearInterval(timer.value);

    // 重新开始游戏时重新注册空格键事件监听
    addSpaceListener();
  };

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
        <h2 class="game-title">
          {{ t('spaceClickTest') }}
        </h2>

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

        <!-- 点击区域 -->
        <div
          ref="clickAreaRef"
          class="click-area"
          :class="{
            playing: isPlaying,
            'time-up': isTimeUp,
            'space-pressed': isSpacePressed,
          }"
        >
          <!-- 游戏结束显示 -->
          <div v-if="isGameOver" class="game-over-content">
            <!-- 游戏结束后显示空内容，结果通过弹窗展示 -->
          </div>

          <!-- 游戏进行中显示 -->
          <div v-else-if="isPlaying" class="playing-content">
            <!-- 空格键图标 -->
            <div class="spacebar-icon">
              <div class="spacebar-key" :class="{ 'space-pressed': isSpacePressed }">
                {{ t('spaceBar') }}
              </div>
            </div>

            <!-- 提示文字 -->
            <div v-if="showPressHint" class="hints">{{ t('pressSpaceToStart') }}</div>
          </div>

          <!-- 游戏准备就绪显示 -->
          <div v-else-if="isGameReady" class="ready-content">
            <!-- 提示文字 -->
            <div class="ready-text">{{ t('readyToStart') }}</div>

            <!-- 空格键图标 -->
            <div class="spacebar-icon">
              <div class="spacebar-key" :class="{ 'space-pressed': isSpacePressed }">
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
              >
                {{ t('spaceBar') }}
              </div>
              <div class="spacebar-hint">{{ t('clickSpaceToStart') }}</div>
            </div>
          </div>
        </div>

        <!-- 相关测试推荐组件 -->
        <RelatedTests current-test="spaceClickTest" />

        <!-- 历史记录区域 - 移到点击区域下方，FAQ上方 -->
        <div class="history-sidebar">
          <!-- 历史记录标题 -->
          <div class="history-header">
            <h3>
              <img
                src="/src/assets/icons/history.png"
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
                  <span class="tag clicks-tag">{{ record.clicks }}次</span>
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
            <h4>{{ t('spaceFaqTitle', { time: testTime }) }}</h4>
            <p>{{ t('spaceFaqDesc', { time: testTime }) }}</p>
          </div>

          <!-- 使用通用FAQ组件 -->
          <FAQComponent
            :title="t('faq')"
            :faq="currentFaq"
            :show-popular="true"
            :popular-questions="popularQuestions"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 结果弹窗组件 -->
  <ResultModal
    :visible="showResultModal"
    :type="'space'"
    :cps="cps"
    :time="testTime"
    @close="resetGame"
  />
</template>

<style scoped>
  /* 游戏容器 */
  .game-container {
    max-width: 1400px;
    margin: 0 0 0 auto;
    text-align: center;
    padding: 20px;
    background-color: #121212;
    border-radius: 10px;
    box-shadow: none;
    width: calc(100% - 20px);
  }

  /* 主内容区域 - 左侧游戏 + 右侧历史记录 */
  .main-content {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: flex-start;
  }

  /* 电脑端布局：历史记录显示在右侧 */
  @media (min-width: 1201px) {
    .game-area {
      position: relative;
    }

    .game-area .history-sidebar {
      position: absolute;
      right: -300px;
      top: 0;
      margin-right: 0;
    }
  }

  /* 左侧游戏区域 */
  .game-area {
    flex: 1;
    max-width: 800px;
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

  /* 右侧历史记录侧边栏 */
  .history-sidebar {
    width: 280px;
    background-color: #1a1a1a;
    border-radius: 8px;
    padding: 15px;
    height: 280px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    margin-top: 10px;
    margin-right: 10px;
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
  }

  .history-item:hover {
    background-color: #333;
    border-color: #4caf50;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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
    }
  }

  /* 标题栏 */
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    padding: 0;
    background-color: #1e1e1e;
    border-radius: 8px;
    width: 100%;
  }

  /* 带背景框的标题 */
  .title-with-bg {
    color: #ffffff;
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    padding: 12px 24px;
    background-color: transparent;
    border-radius: 0;
    box-shadow: none;
  }

  /* 统计卡片 */
  .stats-cards {
    display: flex; /* 使用flex布局 */
    gap: 16px; /* 卡片之间的间距 */
    justify-content: center; /* 卡片居中对齐 */
    margin-bottom: 20px; /* 底部外边距 */
    flex-wrap: wrap; /* 允许卡片换行 */
  }

  .stat-card {
    flex: 0 0 auto; /* 固定大小，不伸缩 */
    width: 180px; /* 卡片宽度 */
    padding: 16px 20px; /* 内边距 */
    border-radius: 12px; /* 圆角边框 */
    color: white; /* 文字颜色 */
    font-weight: bold; /* 文字粗细 */
    text-align: center; /* 文字居中 */
    height: auto; /* 自适应高度 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直方向排列 */
    justify-content: center; /* 内容垂直居中 */
    align-items: center; /* 内容水平居中 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* 阴影效果 */
  }

  .timer-card {
    background-color: #646cff; /* 蓝色 */
  }

  .click-rate-card {
    background-color: #ff7b00; /* 橙色 */
  }

  .score-card {
    background-color: #4caf50; /* 绿色 */
  }

  .stat-value {
    font-size: 32px; /* 数值字体大小 */
    margin-bottom: 4px; /* 数值与标签间距 */
    line-height: 1;
  }

  .stat-label {
    font-size: 16px; /* 标签字体大小 */
    opacity: 0.95; /* 标签透明度 */
    line-height: 1;
    font-weight: normal; /* 标签字体粗细 */
  }

  /* 点击区域 */
  .click-area {
    width: 90%; /* 点击区域宽度，响应式设计 */
    max-width: 800px; /* 最大宽度限制，防止在大屏幕上过大 */
    height: 400px; /* 固定高度 */
    background-color: #000000; /* 背景颜色：黑色 */
    color: white; /* 文字颜色：白色 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直方向排列内容 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    border-radius: 20px; /* 圆角边框 */
    cursor: pointer; /* 鼠标指针样式：手型 */
    transition: all 0.2s ease; /* 过渡效果：所有属性变化0.2秒完成 */
    font-size: 24px; /* 字体大小 */
    font-weight: bold; /* 字体粗细：粗体 */
    margin: 0 auto 20px; /* 居中对齐，下外边距20px */
    border: 2px solid #333; /* 边框：2px实线，深灰色 */
    position: relative; /* 相对定位，用于涟漪特效 */
    overflow: hidden; /* 溢出隐藏，用于涟漪特效 */
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
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
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
    outline: none; /* 移除点击时的轮廓 */
  }

  .spacebar-key:focus {
    outline: none; /* 移除聚焦轮廓 */
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
  }

  .faq-intro h4 {
    color: #4caf50;
    margin: 0 0 10px 0;
    font-size: 22px;
  }

  .faq-intro p {
    color: #cccccc;
    margin: 0;
    line-height: 1.6;
    font-size: 14px;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 统计卡片横向排列，缩小样式 */
    .stats-cards {
      flex-direction: row;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .stat-card {
      flex: none;
      width: 80px;
      max-width: none;
      padding: 8px 12px;
      min-width: auto;
    }

    /* 点击区域优化 */
    .click-area {
      height: 300px;
      width: 95%;
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
    }

    /* 历史记录优化 - 移动端显示在点击区域下方 */
    .history-sidebar {
      width: 90%;
      max-width: 800px;
      margin: 20px auto 0;
    }

    /* FAQ部分优化 */
    .faq-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .faq-item {
      padding: 20px;
    }

    /* 时间选择器优化 */
    .time-selector {
      padding: 15px;
    }

    .time-options {
      gap: 10px;
    }

    .time-btn {
      padding: 8px 16px;
      font-size: 14px;
    }

    .faq-section {
      margin-top: 20px; /* 确保FAQ在历史记录下方 */
      margin-left: 0px;
    }
  }
</style>
