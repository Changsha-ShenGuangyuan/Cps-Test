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
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
  import { t } from '../i18n/index';
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 响应式变量：屏幕尺寸
  const isDesktop = ref(window.innerWidth >= 1201);

  // 监听窗口大小变化
  const handleResize = () => {
    isDesktop.value = window.innerWidth >= 1201;
    // 重新计算中心位置
    calculateCenterPosition();
  };

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
    window.addEventListener('resize', handleResize);

    initTest();
  });

  // 组件卸载前清理
  onBeforeUnmount(() => {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', handleResize);
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
    max-width: 1400px;
    margin: 0 auto;
    padding: clamp(10px, 2vw, 20px);
    text-align: center;
    background-color: #121212;
    border-radius: 10px;
    box-shadow: none;
    width: 100%;
    box-sizing: border-box;
  }

  h1 {
    font-size: clamp(24px, 4vw, 36px);
    color: #4caf50;
    margin-bottom: clamp(15px, 2vw, 20px);
  }

  .test-panel {
    background-color: #2a2a2a;
    padding: clamp(20px, 3vw, 30px);
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    margin-bottom: clamp(30px, 4vw, 40px);
  }

  .test-area-drag {
    width: clamp(90%, 98vw, 100%);
    max-width: 800px;
    height: clamp(300px, 50vh, 400px);
    margin: 0 auto 25px;
    background-color: #333;
    border: 4px solid #4caf50;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .hand-icon {
    font-size: clamp(50px, 8vw, 64px);
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

  /* 响应式设计 */
  @media (max-width: 1200px) {
    /* 中等屏幕布局优化 */
    .test-area-drag {
      max-width: 100%;
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    h1 {
      font-size: clamp(24px, 4vw, 28px);
      margin-bottom: 15px;
    }

    .test-panel {
      padding: 20px;
      margin-bottom: 30px;
    }

    .test-area-drag {
      height: clamp(250px, 40vh, 300px);
      border-width: 3px;
    }

    .hand-icon {
      font-size: clamp(40px, 10vw, 50px);
    }
  }

  /* 超小屏幕适配 */
  @media (max-width: 480px) {
    .test-area-drag {
      height: clamp(200px, 35vh, 250px);
    }

    .hand-icon {
      font-size: clamp(36px, 12vw, 44px);
    }
  }
</style>
