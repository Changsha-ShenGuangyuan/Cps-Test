<template>
  <div class="mouse-drag-test-container">
    <!-- 测试区域 -->
    <h1>{{ t('mouseDragTest') }}</h1>

    <div class="test-panel">
      <!-- 测试区域 -->
      <div
        ref="testAreaRef"
        class="test-area-drag"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 可拖拽的鼠标icon -->
        <div
          v-show="isIconVisible"
          class="hand-icon"
          :style="{
            transform: `translate(${iconX}px, ${iconY}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }"
          @mousedown="handleIconMouseDown"
          @touchstart="handleIconTouchStart"
        >
          🖱️
        </div>
      </div>
    </div>

    <!-- 相关测试推荐组件 -->
    <RelatedTests current-test="mouseDragTest" />

    <!-- FAQ区域 -->
    <div class="faq-section">
      <!-- 使用通用FAQ组件 -->
      <FAQComponent
        :title="t('mouseDragTest')"
        :faq="currentFaq"
        :show-popular="true"
        :popular-questions="popularQuestions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { t } from '../i18n/index';
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 测试状态
  const isDragging = ref(false);
  const isIconVisible = ref(true); // 控制icon显示/隐藏
  // 鼠标icon位置
  const iconX = ref(0); // 初始位置，将动态计算
  const iconY = ref(0); // 初始位置，将动态计算
  // 偏移量
  let offsetX = 0;
  let offsetY = 0;

  // 计算并设置图标在测试区域中的中间位置
  const calculateCenterPosition = () => {
    if (testAreaRef.value) {
      const rect = testAreaRef.value.getBoundingClientRect();
      // 计算中间位置，考虑图标的大小（50px）
      const iconSize = 50;
      iconX.value = rect.width / 2 - iconSize / 2;
      iconY.value = rect.height / 2 - iconSize / 2;
    }
  };

  // 初始化测试
  const initTest = () => {
    isDragging.value = false;
    isIconVisible.value = true; // 确保重置后显示icon
    // 重置到中间位置
    calculateCenterPosition();
  };

  // 获取游戏区域元素的引用
  const testAreaRef = ref<HTMLElement | null>(null);

  // 添加全局鼠标和触摸事件监听，确保在游戏区域外也能流畅拖动
  const addGlobalListeners = () => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    // 添加触摸事件监听
    document.addEventListener('touchmove', handleGlobalTouchMove);
    document.addEventListener('touchend', handleGlobalTouchEnd);
  };

  const removeGlobalListeners = () => {
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    // 移除触摸事件监听
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
  };

  // 处理鼠标按下事件（在icon上）
  const handleIconMouseDown = (event: MouseEvent) => {
    // 计算鼠标相对于icon左上角的偏移量
    offsetX = event.clientX - iconX.value;
    offsetY = event.clientY - iconY.value;
    isDragging.value = true;

    // 添加全局事件监听，确保在游戏区域外也能流畅拖动
    addGlobalListeners();

    // 阻止默认行为，防止文字选中等
    event.preventDefault();
  };

  // 处理触摸开始事件（在icon上）
  const handleIconTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 0) {
      const touch = event.touches[0]!; // 使用非空断言，因为我们已经检查了长度
      // 计算触摸点相对于icon左上角的偏移量
      offsetX = touch.clientX - iconX.value;
      offsetY = touch.clientY - iconY.value;
      isDragging.value = true;

      // 添加全局事件监听，确保在游戏区域外也能流畅拖动
      addGlobalListeners();

      // 阻止默认行为，防止页面滚动等
      event.preventDefault();
    }
  };

  // 处理游戏区域内的鼠标移动事件
  const handleMouseMove = (event: MouseEvent) => {
    handleGlobalMouseMove(event);
  };

  // 处理游戏区域内的触摸移动事件
  const handleTouchMove = (event: TouchEvent) => {
    handleGlobalTouchMove(event);
  };

  // 处理全局鼠标移动事件
  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (isDragging.value) {
      // 计算新位置
      iconX.value = event.clientX - offsetX;
      iconY.value = event.clientY - offsetY;

      if (testAreaRef.value) {
        // 获取游戏区域的边界
        const rect = testAreaRef.value.getBoundingClientRect();

        // 检查鼠标是否在游戏区域内
        const isMouseInArea =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        // 如果鼠标在区域内，显示icon；否则隐藏icon
        isIconVisible.value = isMouseInArea;
      }

      // 阻止默认行为，确保流畅拖动
      event.preventDefault();
    }
  };

  // 处理全局触摸移动事件
  const handleGlobalTouchMove = (event: TouchEvent) => {
    if (isDragging.value && event.touches.length > 0) {
      const touch = event.touches[0]!; // 使用非空断言，因为我们已经检查了长度
      // 计算新位置
      iconX.value = touch.clientX - offsetX;
      iconY.value = touch.clientY - offsetY;

      if (testAreaRef.value) {
        // 获取游戏区域的边界
        const rect = testAreaRef.value.getBoundingClientRect();

        // 检查触摸点是否在游戏区域内
        const isTouchInArea =
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom;

        // 如果触摸点在区域内，显示icon；否则隐藏icon
        isIconVisible.value = isTouchInArea;
      }

      // 阻止默认行为，确保流畅拖动
      event.preventDefault();
    }
  };

  // 处理游戏区域内的鼠标释放事件
  const handleMouseUp = (event: MouseEvent) => {
    handleGlobalMouseUp(event);
  };

  // 处理游戏区域内的触摸结束事件
  const handleTouchEnd = (event: TouchEvent) => {
    handleGlobalTouchEnd(event);
  };

  // 处理全局鼠标释放事件
  const handleGlobalMouseUp = (event: MouseEvent) => {
    if (isDragging.value) {
      // 移除全局事件监听
      removeGlobalListeners();

      if (testAreaRef.value) {
        // 获取游戏区域的边界
        const rect = testAreaRef.value.getBoundingClientRect();

        // 检查鼠标是否在游戏区域内
        const isMouseInArea =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!isMouseInArea) {
          // 如果鼠标在区域外释放，重置游戏
          initTest();
        } else {
          // 如果鼠标在区域内释放，显示icon
          isIconVisible.value = true;
        }
      }

      isDragging.value = false;
    }
  };

  // 处理全局触摸结束事件
  const handleGlobalTouchEnd = (event: TouchEvent) => {
    if (isDragging.value) {
      // 移除全局事件监听
      removeGlobalListeners();

      if (testAreaRef.value) {
        // 获取游戏区域的边界
        const rect = testAreaRef.value.getBoundingClientRect();

        // 检查触摸点是否在游戏区域内
        let isTouchInArea = false;
        if (event.changedTouches.length > 0) {
          const touch = event.changedTouches[0]!; // 使用非空断言，因为我们已经检查了长度
          isTouchInArea =
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom;
        }

        if (!isTouchInArea) {
          // 如果触摸点在区域外释放，重置游戏
          initTest();
        } else {
          // 如果触摸点在区域内释放，显示icon
          isIconVisible.value = true;
        }
      }

      isDragging.value = false;
    }
  };

  // 组件挂载
  onMounted(() => {
    // 初始计算中间位置
    calculateCenterPosition();

    // 添加窗口大小变化监听
    window.addEventListener('resize', calculateCenterPosition);

    initTest();
  });

  // 组件卸载前清理
  onUnmounted(() => {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', calculateCenterPosition);
  });

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsMouseDragTestQ1'),
        a: t('whatIsMouseDragTestA1'),
        relatedQuestions: [t('faqMouseDragQ1'), t('faqMouseDragQ2')],
      },
      {
        q: t('faqMouseDragQ1'),
        a: t('faqMouseDragA1'),
        relatedQuestions: [t('whatIsMouseDragTestQ1'), t('faqMouseDragQ2')],
      },
      {
        q: t('faqMouseDragQ2'),
        a: t('faqMouseDragA2'),
        relatedQuestions: [t('whatIsMouseDragTestQ1'), t('faqMouseDragQ1')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsMouseDragTestQ1'), t('faqMouseDragQ1')];
  });
</script>

<style scoped>
  .mouse-drag-test-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0px;
    text-align: center;
  }

  h1 {
    font-size: 36px;
    color: #4caf50;
    margin-bottom: 20px;
  }

  .test-panel {
    background-color: #2a2a2a;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;
  }

  .stats-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background-color: #333;
    padding: 15px 25px;
    border-radius: 8px;
    min-width: 180px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .stat-label {
    font-size: 14px;
    color: #cccccc;
    white-space: nowrap;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #4caf50;
    text-align: right;
    min-width: 80px;
  }

  .test-area-drag {
    width: 100%;
    max-width: 800px;
    height: 400px;
    margin: 0 auto 25px;
    background-color: #333;
    border: 4px solid #4caf50;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .hand-icon {
    font-size: 64px;
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(0, 0);
    transition: none;
    z-index: 10;
    /* 优化拖动流畅度 */
    will-change: transform;
    pointer-events: auto;
    user-select: none;
    touch-action: none; /* 阻止触摸动作的默认行为 */
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
    margin-bottom: 15px;
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
    h1 {
      font-size: 28px;
      margin-bottom: 15px;
    }

    .test-panel {
      padding: 20px;
      margin-bottom: 30px;
    }

    .test-area-drag {
      width: 100%;
      height: 300px;
      border-width: 3px;
    }

    .hand-icon {
      font-size: 50px;
    }

    .stats-container {
      flex-direction: column;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-item {
      min-width: 250px;
      padding: 12px 20px;
    }

    .stat-label {
      font-size: 13px;
    }

    .stat-value {
      font-size: 20px;
    }

    .control-buttons {
      flex-direction: column;
      align-items: center;
    }

    .control-btn {
      width: 200px;
    }

    .faq-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .faq-column {
      gap: 20px;
    }

    .faq-item {
      padding: 20px;
    }

    .faq-item h4 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    .faq-item p {
      font-size: 14px;
      line-height: 1.6;
    }
  }
</style>
