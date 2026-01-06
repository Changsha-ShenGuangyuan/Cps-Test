<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { onBeforeRouteUpdate } from 'vue-router';
  import { t } from '../i18n'; // 导入翻译函数

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 监听窗口大小变化
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1201;
  };

  // 组件功能：Kohi点击测试组件，支持10秒固定时间测试
  // 支持涟漪特效、实时CPS计算、毫秒级计时等功能

  // 历史记录类型定义
  interface HistoryRecord {
    id: number;
    testTime: number;
    clicks: number;
    cps: number;
    date: string;
  }

  // 测试时间：Kohi测试固定为10秒
  const testTime = computed(() => {
    return 10; // Kohi测试固定为10秒
  });

  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';
  // 导入结果弹窗组件
  import ResultModal from './ResultModal.vue';

  // 获取10秒测试的FAQ
  const currentFaq = computed(() => {
    // 返回Kohi测试的FAQ翻译数组
    return [
      {
        q: t('kohiFaqQ1'),
        a: t('kohiFaqA1'),
        relatedQuestions: [t('kohiFaqQ2'), t('kohiFaqQ3')],
      },
      {
        q: t('kohiFaqQ2'),
        a: t('kohiFaqA2'),
        relatedQuestions: [t('kohiFaqQ1'), t('kohiFaqQ4')],
      },
      {
        q: t('kohiFaqQ3'),
        a: t('kohiFaqA3'),
        relatedQuestions: [t('kohiFaqQ1'), t('kohiFaqQ2')],
      },
      {
        q: t('kohiFaqQ4'),
        a: t('kohiFaqA4'),
        relatedQuestions: [t('kohiFaqQ2'), t('kohiFaqQ3')],
      },
    ];
  });

  // 涟漪特效类型定义
  interface Ripple {
    id: number; // 涟漪唯一标识
    x: number; // 涟漪中心X坐标
    y: number; // 涟漪中心Y坐标
    size: number; // 涟漪大小
    opacity: number; // 涟漪透明度
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

  // 历史记录相关
  const historyRecords = ref<HistoryRecord[]>([]); // 历史记录数组

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('kohiClickTestHistory');
    if (saved) {
      const loaded = JSON.parse(saved);
      historyRecords.value = loaded;
    }
  };

  // 保存历史记录到localStorage
  const saveHistory = () => {
    localStorage.setItem('kohiClickTestHistory', JSON.stringify(historyRecords.value));
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
    showResultModal.value = false; // 关闭结果弹窗

    // 清除定时器
    clearInterval(timer.value);

    // 清除所有涟漪特效
    ripples.value = [];
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
        <h2 class="game-title">
          {{ t('kohiClickTest') }}
        </h2>

        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card timer-card">
            <div class="stat-value">
              {{ !isPlaying && clicks === 0 ? 0 : elapsedTime.toFixed(3) }}
            </div>
            <div class="stat-label">{{ t('time') }}</div>
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
          :class="{ playing: isPlaying, 'time-up': isTimeUp }"
          @click="(e) => handleClick(e)"
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

          <div v-if="isGameOver" class="game-over-content">
            <!-- 游戏结束后显示空内容，结果通过弹窗展示 -->
          </div>
          <div v-else-if="isPlaying">
            <!-- 游戏进行中 -->
          </div>
          <div v-else class="start-text">
            {{ t('clickToStart') }}
          </div>
        </div>

        <!-- 相关测试推荐组件 -->
        <RelatedTests current-test="kohiClickTest" />

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

        <!-- FAQ区域 -->
        <div class="faq-section">
          <!-- 顶部大标题FAQ项 -->
          <div class="faq-intro">
            <h4>{{ t('kohiClickTest') }}</h4>
            <p>{{ t('kohiFaqDesc') }}</p>
          </div>

          <!-- 使用通用FAQ组件 -->
          <FAQComponent :title="t('faq')" :faq="currentFaq" :show-popular="false" />
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
    </div>
  </div>

  <!-- 结果弹窗组件 -->
  <ResultModal
    :visible="showResultModal"
    :type="'kohiClickTest'"
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
    background-color: #121212;
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
      max-width: none;
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

  /* 历史记录图标 */
  .history-icon {
    font-size: 20px;
  }

  /* 历史记录列表 */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
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

  /* 历史记录项悬停效果 */
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
    width: clamp(90%, 98vw, 100%); /* 点击区域宽度，响应式设计 */
    height: clamp(250px, 50vh, 400px); /* 固定高度 */
    background-color: #000000; /* 背景颜色：黑色 */
    color: white; /* 文字颜色：白色 */
    display: flex; /* 使用flex布局 */
    flex-direction: column; /* 垂直方向排列内容 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    border-radius: 20px; /* 圆角边框 */
    cursor: pointer; /* 鼠标指针样式：手型 */
    transition: all 0.2s ease; /* 过渡效果：所有属性变化0.2秒完成 */
    font-size: clamp(20px, 4vw, 24px); /* 字体大小 */
    font-weight: bold; /* 字体粗细：粗体 */
    margin: 0 auto clamp(15px, 3vw, 20px); /* 居中对齐，下外边距20px */
    border: 2px solid #333; /* 边框：2px实线，深灰色 */
    position: relative; /* 相对定位，用于涟漪特效 */
    overflow: hidden; /* 溢出隐藏，用于涟漪特效 */
  }

  .click-area:hover {
    transform: scale(1.01);
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
    background-color: rgba(56, 214, 201, 0.5);
    pointer-events: none;
    z-index: 1;
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); /* 减弱发光效果 */
    border: 1px solid rgba(255, 255, 255, 0.2); /* 更淡的白色边框 */
  }

  /* 开始文字 */
  .start-text {
    position: relative;
    z-index: 2;
    font-size: clamp(20px, 4vw, 24px);
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
      margin-left: 0;
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
      font-size: clamp(22px, 5vw, 26px);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: clamp(12px, 2vw, 14px);
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
      font-size: clamp(10px, 2vw, 12px);
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
