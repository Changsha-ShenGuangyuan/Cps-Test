<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { t } from '../i18n/index';

  const router = useRouter();

  // 导航到指定路由
  const navigateTo = (path: string) => {
    router.push(path);
  };

  // 定义测试类型接口
  interface TestType {
    name: string;
    path: string;
    title: string;
    description: string;
    icon?: string;
  }

  // 测试类型列表
  const testTypes: TestType[] = [
    {
      name: 'clickTest',
      path: '/click-test/1',
      title: 'clickTest',
      description: 'clickTestDesc',
    },
    {
      name: 'spaceClickTest',
      path: '/space-click-test/1',
      title: 'spaceClickTest',
      description: 'spaceClickTestDesc',
    },
    {
      name: 'kohiClickTest',
      path: '/kohi-click-test',
      title: 'kohiClickTest',
      description: 'kohiClickTestDesc',
    },
    {
      name: 'reactionTest',
      path: '/reaction-time-test',
      title: 'reactionTest',
      description: 'reactionTestDesc',
    },
    {
      name: 'colorReactionTest',
      path: '/color-reaction-test',
      title: 'colorReactionTest',
      description: 'colorReactionTestDesc',
    },
    {
      name: 'keyReactionTest',
      path: '/key-reaction-test',
      title: 'keyReactionTest',
      description: 'keyReactionTestDesc',
    },
    {
      name: 'targetEliminationGame',
      path: '/target-elimination-game',
      title: 'targetEliminationGame',
      description: 'targetEliminationGameDesc',
    },
    {
      name: 'mouseScrollTest',
      path: '/mouse-scroll-test',
      title: 'mouseScrollTest',
      description: 'mouseScrollTestDesc',
    },
    {
      name: 'mouseDragTest',
      path: '/mouse-drag-test',
      title: 'mouseDragTest',
      description: 'mouseDragTestDesc',
    },
    {
      name: 'keyboardTest',
      path: '/keyboard-test',
      title: 'keyboardTest',
      description: 'keyboardTestDesc',
    },
    {
      name: 'typingTest',
      path: '/typing-test/1',
      title: 'typingTest',
      description: 'typingTestDesc',
    },
    {
      name: 'doubleClickTest',
      path: '/multi-click-test/double',
      title: 'doubleClickTest',
      description: 'doubleClickTestDesc',
    },
    {
      name: 'tripleClickTest',
      path: '/multi-click-test/triple',
      title: 'tripleClickTest',
      description: 'tripleClickTestDesc',
    },
  ];

  // 接收当前测试名称作为props
  const props = defineProps<{
    currentTest: string;
    limit?: number;
  }>();

  // 默认显示6个相关测试
  const limit = computed(() => props.limit || 6);

  // 计算相关测试推荐
  const relatedTests = computed(() => {
    // 排除当前测试
    const filteredTests = testTypes.filter((test) => test.name !== props.currentTest);

    // 随机排序
    const shuffled = [...filteredTests].sort(() => Math.random() - 0.5);

    // 返回指定数量的推荐测试
    return shuffled.slice(0, limit.value);
  });
</script>

<template>
  <div class="quick-start-buttons">
    <button
      v-for="test in relatedTests"
      :key="test.name"
      :class="['start-btn', test.name]"
      @click="navigateTo(test.path)"
    >
      <span class="btn-text">{{ t(test.title) }}</span>
    </button>
  </div>
</template>

<style scoped>
  /* 快速开始按钮横向布局 */
  .quick-start-buttons {
    display: flex; /* 使用Flexbox布局 */
    flex-direction: row; /* 横向排列 */
    flex-wrap: wrap; /* 允许换行 */
    gap: 15px; /* 间距 */
    justify-content: center; /* 水平居中对齐 */
    align-items: center; /* 垂直居中对齐 */
    width: 100%; /* 全宽显示 */
    margin: 20px 0; /* 上下外边距 */
  }

  /* 开始按钮基础样式 */
  .start-btn {
    padding: 18px 25px; /* 内边距 */
    border-radius: 8px; /* 圆角边框 */
    cursor: pointer; /* 鼠标悬停时显示指针 */
    transition: all 0.3s ease; /* 过渡动画 */
    border: 2px solid transparent; /* 透明边框，悬停时显示 */
    text-align: center; /* 文本居中 */
    display: flex; /* 弹性布局 */
    align-items: center; /* 水平居中 */
    justify-content: center; /* 垂直居中 */
    color: #ffffff; /* 白色文本 */
    font-family: inherit; /* 继承父元素字体 */
    font-size: 16px; /* 字号 */
    font-weight: 500; /* 中等粗细 */
    position: relative; /* 相对定位，用于伪元素 */
    overflow: visible; /* 允许伪元素超出 */
    background-color: transparent; /* 透明背景，继承父元素 */
    white-space: nowrap; /* 防止文本换行 */
    width: auto; /* 宽度根据内容自动调整 */
  }

  /* 开始按钮聚焦样式 */
  .start-btn:focus {
    outline: none; /* 移除默认轮廓 */
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3); /* 聚焦阴影效果 */
  }

  /* 开始按钮基础悬停效果 */
  .start-btn:hover {
    transform: translateY(-2px); /* 向上移动2px */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4); /* 增强阴影 */
    border-color: rgba(255, 255, 255, 0.3); /* 边框颜色变为半透明白色 */
  }

  /* 开始按钮点击效果 */
  .start-btn:active {
    transform: translateY(0); /* 恢复原位 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4); /* 减小阴影 */
  }

  /* 按钮围绕发光特效 - 基础样式 */
  .start-btn::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    border-radius: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
    filter: blur(4px); /* 模糊效果 */
    background: linear-gradient(45deg, currentColor, transparent);
  }

  /* 悬停时显示发光特效 */
  .start-btn:hover::before {
    opacity: 0.6;
    animation: pulse 2s infinite; /* 脉动动画 */
  }

  /* 脉动动画 */
  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }

  /* 点击测试按钮 - 蓝色渐变 */
  .start-btn.clickTest {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }

  .start-btn.clickTest:hover {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  }

  /* 点击测试按钮 - 蓝色发光 */
  .start-btn.clickTest::before {
    background: linear-gradient(45deg, #2196f3, transparent);
  }

  /* 反应测试按钮 - 橙色渐变 */
  .start-btn.reactionTest {
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  }

  .start-btn.reactionTest:hover {
    background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  }

  /* 反应测试按钮 - 橙色发光 */
  .start-btn.reactionTest::before {
    background: linear-gradient(45deg, #ff9800, transparent);
  }

  /* 打字测试按钮 - 紫色渐变 */
  .start-btn.typingTest {
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  }

  .start-btn.typingTest:hover {
    background: linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%);
  }

  /* 打字测试按钮 - 紫色发光 */
  .start-btn.typingTest::before {
    background: linear-gradient(45deg, #9c27b0, transparent);
  }

  /* 空格点击测试按钮 - 绿色渐变 */
  .start-btn.spaceClickTest {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }

  .start-btn.spaceClickTest:hover {
    background: linear-gradient(135deg, #388e3c 0%, #2e7d32 100%);
  }

  /* 空格点击测试按钮 - 绿色发光 */
  .start-btn.spaceClickTest::before {
    background: linear-gradient(45deg, #4caf50, transparent);
  }

  /* Kohi点击测试按钮 - 深橙色渐变 */
  .start-btn.kohiClickTest {
    background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
  }

  .start-btn.kohiClickTest:hover {
    background: linear-gradient(135deg, #e64a19 0%, #bf360c 100%);
  }

  /* Kohi点击测试按钮 - 深橙色发光 */
  .start-btn.kohiClickTest::before {
    background: linear-gradient(45deg, #ff5722, transparent);
  }

  /* 颜色反应测试按钮 - 粉色渐变 */
  .start-btn.colorReactionTest {
    background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  }

  .start-btn.colorReactionTest:hover {
    background: linear-gradient(135deg, #c2185b 0%, #ad1457 100%);
  }

  /* 颜色反应测试按钮 - 粉色发光 */
  .start-btn.colorReactionTest::before {
    background: linear-gradient(45deg, #e91e63, transparent);
  }

  /* 按键反应测试按钮 - 青色渐变 */
  .start-btn.keyReactionTest {
    background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
  }

  .start-btn.keyReactionTest:hover {
    background: linear-gradient(135deg, #0097a7 0%, #00838f 100%);
  }

  /* 按键反应测试按钮 - 青色发光 */
  .start-btn.keyReactionTest::before {
    background: linear-gradient(45deg, #00bcd4, transparent);
  }

  /* 目标消除游戏按钮 - 紫色渐变（不同色调） */
  .start-btn.targetEliminationGame {
    background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
  }

  .start-btn.targetEliminationGame:hover {
    background: linear-gradient(135deg, #512da8 0%, #4527a0 100%);
  }

  /* 目标消除游戏按钮 - 紫色发光 */
  .start-btn.targetEliminationGame::before {
    background: linear-gradient(45deg, #673ab7, transparent);
  }

  /* 鼠标滚动测试按钮 - 黄色渐变 */
  .start-btn.mouseScrollTest {
    background: linear-gradient(135deg, #ffc107 0%, #ffa000 100%);
  }

  .start-btn.mouseScrollTest:hover {
    background: linear-gradient(135deg, #ffa000 0%, #ff8f00 100%);
  }

  /* 鼠标滚动测试按钮 - 黄色发光 */
  .start-btn.mouseScrollTest::before {
    background: linear-gradient(45deg, #ffc107, transparent);
  }

  /* 鼠标拖动测试按钮 - 绿色渐变（不同色调） */
  .start-btn.mouseDragTest {
    background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
  }

  .start-btn.mouseDragTest:hover {
    background: linear-gradient(135deg, #689f38 0%, #558b2f 100%);
  }

  /* 鼠标拖动测试按钮 - 绿色发光 */
  .start-btn.mouseDragTest::before {
    background: linear-gradient(45deg, #8bc34a, transparent);
  }

  /* 键盘测试按钮 - 绿色渐变（不同色调） */
  .start-btn.keyboardTest {
    background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  }

  .start-btn.keyboardTest:hover {
    background: linear-gradient(135deg, #00c853 0%, #00bfa5 100%);
  }

  /* 键盘测试按钮 - 绿色发光 */
  .start-btn.keyboardTest::before {
    background: linear-gradient(45deg, #00e676, transparent);
  }

  /* 双击测试按钮 - 蓝色渐变 */
  .start-btn.doubleClickTest {
    background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%);
  }

  .start-btn.doubleClickTest:hover {
    background: linear-gradient(135deg, #303f9f 0%, #283593 100%);
  }

  /* 双击测试按钮 - 蓝色发光 */
  .start-btn.doubleClickTest::before {
    background: linear-gradient(45deg, #3f51b5, transparent);
  }

  /* 三击测试按钮 - 蓝色渐变 */
  .start-btn.tripleClickTest {
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  }

  .start-btn.tripleClickTest:hover {
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  }

  /* 三击测试按钮 - 蓝色发光 */
  .start-btn.tripleClickTest::before {
    background: linear-gradient(45deg, #2196f3, transparent);
  }

  /* 按钮文本样式 */
  .btn-text {
    line-height: 1.2; /* 行高 */
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 快速开始按钮网格布局适配移动端 */
    .quick-start-buttons {
      grid-template-columns: repeat(auto-fill, minmax(auto, max-content)); /* 根据内容自适应列数 */
      gap: 12px; /* 减小间距 */
      justify-content: center; /* 按钮居中显示 */
    }

    /* 调整按钮内边距，长度根据文本内容适配 */
    .start-btn {
      padding: 15px 20px; /* 调整内边距 */
      font-size: 16px; /* 调整字号 */
      min-width: auto; /* 移除最小宽度，让按钮长度根据文本内容适配 */
      margin: 0; /* 移除居中显示 */
    }
  }
</style>
