<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { t, langState } from '../i18n/index';

  const router = useRouter();

  // 导航到指定路由
  const navigateTo = (path: string) => {
    // 根据当前语言添加语言前缀
    let fullPath = path;
    if (langState.current !== 'en') {
      // 确保路径以斜杠开头
      const basePath = path.startsWith('/') ? path : `/${path}`;
      fullPath = `/${langState.current}${basePath}`;
    }
    router.push(fullPath);
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
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin: 20px 0;
  }

  /* 开始按钮基础样式 */
  .start-btn {
    padding: 16px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    width: auto;
    background-color: #333;
  }

  /* 开始按钮聚焦样式 */
  .start-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }

  /* 开始按钮基础悬停效果 */
  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* 开始按钮点击效果 */
  .start-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  /* 按钮颜色样式 - 简化版 */
  .start-btn.clickTest, .start-btn.tripleClickTest {
    background: #2196f3;
  }

  .start-btn.spaceClickTest {
    background: #4caf50;
  }

  .start-btn.kohiClickTest {
    background: #ff5722;
  }

  .start-btn.reactionTest {
    background: #ff9800;
  }

  .start-btn.colorReactionTest {
    background: #e91e63;
  }

  .start-btn.keyReactionTest {
    background: #00bcd4;
  }

  .start-btn.targetEliminationGame {
    background: #673ab7;
  }

  .start-btn.mouseScrollTest {
    background: #ffc107;
  }

  .start-btn.mouseDragTest {
    background: #8bc34a;
  }

  .start-btn.keyboardTest {
    background: #00e676;
  }

  .start-btn.typingTest {
    background: #9c27b0;
  }

  .start-btn.doubleClickTest {
    background: #3f51b5;
  }

  /* 按钮文本样式 */
  .btn-text {
    line-height: 1.2;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .quick-start-buttons {
      gap: 10px;
    }

    .start-btn {
      padding: 14px 18px;
      font-size: 14px;
    }
  }
</style>
