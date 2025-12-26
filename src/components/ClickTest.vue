<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { t } from '../i18n/index';
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  import RelatedTests from './RelatedTests.vue';
  // 导入结果弹窗组件
  import ResultModal from './ResultModal.vue';

  // 组件功能：点击速度测试组件，支持固定时间测试和自定义时间测试
  // 支持涟漪特效、实时CPS计算、毫秒级计时等功能

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

  // 涟漪特效类型定义
  interface Ripple {
    id: number; // 涟漪唯一标识
    x: number; // 涟漪中心X坐标
    y: number; // 涟漪中心Y坐标
    size: number; // 涟漪大小
    opacity: number; // 涟漪透明度
  }

  // 历史记录类型定义
  interface HistoryRecord {
    id: number;
    testTime: number;
    clicks: number;
    cps: number;
    date: string;
  }

  // 状态管理
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameOver = ref(false); // 游戏是否结束（专门用于标识最终状态）
  const startTime = ref(0); // 游戏开始时间戳
  const endTime = ref(0); // 游戏结束时间戳
  const clicks = ref(0); // 点击次数
  const cps = ref(0); // 最终CPS值（每秒点击次数）
  const timer = ref(0); // 定时器ID
  const elapsedTime = ref(0); // 已用时间（毫秒级精度）
  const ripples = ref<Ripple[]>([]); // 涟漪特效数组
  const clickAreaRef = ref<HTMLElement | null>(null); // 点击区域DOM引用
  const showResultModal = ref(false); // 结果弹窗显示状态

  // 鼠标按键选择状态
  const mouseButtonOptions = computed(() => [
    // 可选按键列表，使用computed实现响应式翻译
    { value: 0, label: t('leftMouseButton') }, // 左键
    { value: 2, label: t('rightMouseButton') }, // 右键
  ]);
  const selectedMouseButton = ref(0); // 当前选择的鼠标按键，默认左键

  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]); // 历史记录数组

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('clickTestHistory');
    if (saved) {
      const loaded = JSON.parse(saved);
      // 移除可能存在的description字段，确保数据结构一致
      historyRecords.value = loaded.map((record: any) => {
        const { description, ...rest } = record;
        return rest;
      });
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem('clickTestHistory', JSON.stringify(historyRecords.value));
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
  };

  // 点击事件处理函数
  const handleClick = (event: MouseEvent) => {
    // 检查是否是选择的鼠标按键
    if (event.button !== selectedMouseButton.value) {
      return;
    }

    // 游戏结束或时间到了，不处理点击事件
    if (isGameOver.value || isTimeUp.value) {
      return;
    }

    // 游戏未开始且不是第一次点击，不处理点击事件
    if (!isPlaying.value && clicks.value > 0) {
      return;
    }

    // 获取点击位置相对于点击区域的坐标
    let x = 0;
    let y = 0;

    if (clickAreaRef.value) {
      const rect = clickAreaRef.value.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // 创建涟漪特效
    const rippleId = Date.now();

    // 涟漪动画配置
    const animationDuration = 600; // 动画持续时间（毫秒）
    const maxSize = 500; // 涟漪最大大小（像素）
    const steps = 20; // 动画步数
    const stepDuration = animationDuration / steps; // 每步持续时间

    // 创建新的涟漪对象
    const newRipple: Ripple = {
      id: rippleId,
      x: x,
      y: y,
      size: 0, // 初始大小为0
      opacity: 1, // 初始完全不透明
    };

    // 添加涟漪到数组（触发响应式更新）
    ripples.value = [...ripples.value, newRipple];

    // 动画计数器
    let step = 0;

    // 涟漪动画函数
    const animate = () => {
      step++;
      if (step <= steps) {
        // 计算当前动画进度（0-1）
        const progress = step / steps;

        // 查找当前涟漪并更新
        const index = ripples.value.findIndex((r) => r.id === rippleId);
        if (index > -1) {
          const updatedRipple = ripples.value[index];
          if (updatedRipple) {
            // 更新涟漪大小
            updatedRipple.size = maxSize * progress;

            // 更新涟漪透明度（先保持不透明，后逐渐消失）
            if (progress < 0.5) {
              updatedRipple.opacity = 0.9;
            } else {
              updatedRipple.opacity = 0.9 - (progress - 0.5) * 1.8;
            }

            // 创建新数组触发Vue响应式更新
            ripples.value = [...ripples.value];
          }
        }

        // 继续下一帧动画
        setTimeout(animate, stepDuration);
      } else {
        // 动画结束，移除涟漪
        ripples.value = ripples.value.filter((r) => r.id !== rippleId);
      }
    };

    // 立即开始动画
    animate();

    // 开始游戏（如果是第一次点击）
    if (!isPlaying.value && clicks.value === 0) {
      startGame();
    }

    // 更新点击次数（游戏进行中且时间未到）
    if (isPlaying.value && !isTimeUp.value) {
      clicks.value++;
    }
  };

  // 重置游戏函数
  const resetGame = () => {
    // 重置所有游戏状态
    isPlaying.value = false;
    isGameOver.value = false;
    clicks.value = 0;
    cps.value = 0;
    elapsedTime.value = 0;

    // 清除定时器
    clearInterval(timer.value);

    // 清除所有涟漪特效
    ripples.value = [];

    // 关闭结果弹窗
    showResultModal.value = false;
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
              @click="
                selectedMouseButton = option.value;
                resetGame();
              "
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
          @dblclick.prevent="(e) => handleClick(e)"
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
                width: ripple.size + 'px',
                height: ripple.size + 'px',
                opacity: ripple.opacity,
              }"
            ></div>
          </div>

          <div v-if="isPlaying">
            <!-- 游戏进行中 -->
          </div>
          <div v-else class="start-text">{{ t('clickHere') }} {{ t('startGame') }}</div>
        </div>

        <!-- 相关测试推荐组件 -->
        <RelatedTests current-test="clickTest" />

        <!-- 历史记录区域 - 移到点击区域下方，FAQ上方 -->
        <div class="history-sidebar">
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
            <h4>{{ t('faqTitle', { time: testTime }) }}</h4>
            <p>{{ t('faqDesc', { time: testTime }) }}</p>
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
    :type="'click'"
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
    box-shadow: none;
    width: calc(100% - 20px);
    border-radius: 10px;
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
      max-width: 800px;
    }

    .game-area .history-sidebar {
      position: absolute;
      right: -300px;
      top: 0;
      margin-right: 0;
      width: 280px;
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

  /* CPS值特殊样式 */
  .cps-value {
    color: #ffa500;
    font-size: 16px;
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

  /* 时间选择器 */
  .time-selector {
    text-align: center;
    margin: 20px 0;
    padding: 20px;
    background-color: #1a1a1a;
    border-radius: 8px;
  }

  .time-selector h3 {
    color: #4caf50;
    margin-bottom: 15px;
    font-size: 18px;
  }

  .time-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }

  .time-btn {
    padding: 10px 20px;
    border: 2px solid #4caf50;
    background-color: #2a2a2a;
    color: #4caf50;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: bold;
    font-size: 16px;
  }

  .time-btn:hover {
    background-color: #4caf50;
    color: white;
    transform: translateY(-2px);
  }

  .time-btn.active {
    background-color: #4caf50;
    color: white;
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

  /* 涟漪样式 - 调整为更淡的颜色 */
  .ripple {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: rgba(76, 175, 80, 0.5); /* 更淡的绿色，降低透明度 */
    pointer-events: none;
    z-index: 1;
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); /* 减弱发光效果 */
    border: 1px solid rgba(255, 255, 255, 0.2); /* 更淡的白色边框 */
  }

  /* 开始文字 */
  .start-text {
    position: relative;
    z-index: 2;
    font-size: 24px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
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

  /* 鼠标按键选择器样式 */
  .mouse-button-selector {
    text-align: center;
    margin: 10px auto; /* 水平居中，上下间距20px */
    padding: 12px 15px; /* 减少垂直内边距，保持水平内边距 */
    background-color: #1a1a1a;
    border-radius: 8px;
    width: 90%; /* 响应式宽度 */
    max-width: 700px; /* 最大宽度限制 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直方向排列 */
    align-items: center; /* 水平居中对齐 */
    justify-content: center; /* 垂直居中对齐 */
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
    .history-sidebar {
      width: 90%;
      max-width: 800px;
      margin: 20px auto 0;
    }

    .faq-section {
      margin-top: 20px; /* 确保FAQ在历史记录下方 */
    }
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

    .stat-value {
      font-size: 24px;
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 12px;
    }

    /* 点击区域优化 */
    .click-area {
      height: 300px;
      font-size: 20px;
      width: 95%;
    }

    /* 文字大小优化 */
    .result {
      font-size: 28px;
    }

    .final-cps {
      font-size: 36px;
    }

    /* 历史记录列表优化 */
    .history-item {
      padding: 12px;
    }

    .history-item-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .tags {
      justify-content: flex-start;
    }

    .record-time {
      width: 100%;
      text-align: left;
    }

    /* 鼠标按键选择器移动端适配 */
    .mouse-button-selector {
      margin: 15px 0;
      padding: 12px;
    }

    .mouse-button-selector h3 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    .button-option {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
</style>
