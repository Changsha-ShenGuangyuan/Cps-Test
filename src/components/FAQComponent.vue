<template>
  <div class="faq-container">
    <!-- 热门问题板块 -->
    <div v-if="showPopular && filteredPopularQuestions.length > 0" class="popular-faq-section">
      <h4>{{ t('popularQuestions') }}</h4>
      <div class="popular-faq-list">
        <div
          v-for="(question, index) in filteredPopularQuestions"
          :key="`popular-${index}`"
          class="popular-faq-item"
          @click="scrollToQuestion(question)"
        >
          {{ question }}
        </div>
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="faq-list">
      <div v-for="(item, index) in filteredFaq" :key="index" class="faq-item">
        <!-- FAQ问题（可点击折叠/展开） -->
        <div class="faq-question" :class="{ active: faqOpen[index] }" @click="toggleFaq(index)">
          <h4>{{ item.q }}</h4>
          <span class="faq-toggle-icon">
            {{ faqOpen[index] ? '▼' : '▶' }}
          </span>
        </div>

        <!-- FAQ答案 -->
        <div class="faq-answer" :class="{ open: faqOpen[index] }">
          <div class="faq-answer-content">
            <!-- 支持多行文本和换行 -->
            <p v-html="formatAnswer(item.a)"></p>
          </div>

          <!-- 相关问题推荐 -->
          <div
            v-if="item.relatedQuestions && item.relatedQuestions.length > 0"
            class="related-questions"
          >
            <h5>{{ t('relatedQuestions') }}:</h5>
            <ul>
              <li
                v-for="(related, relatedIndex) in item.relatedQuestions"
                :key="relatedIndex"
                @click="scrollToQuestion(related)"
              >
                {{ related }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 没有匹配结果 -->
      <div v-if="filteredFaq.length === 0" class="no-faq-results">
        {{ t('noQuestionFound') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { t } from '../i18n';

  // 定义FAQ项类型
  interface FAQItem {
    q: string;
    a: string;
    relatedQuestions?: string[];
  }

  // 定义热门问题类型
  type PopularQuestion = string;

  // Props
  const props = defineProps<{
    // FAQ标题
    title?: string;
    // FAQ数据
    faq: FAQItem[];
    // 是否显示热门问题
    showPopular?: boolean;
    // 热门问题列表
    popularQuestions?: PopularQuestion[];
  }>();

  const showPopular = computed(() => props.showPopular || false);
  const popularQuestions = computed(() => props.popularQuestions || []);

  // 搜索查询
  const searchQuery = ref('');

  // FAQ展开状态
  const faqOpen = ref<boolean[]>([]);

  // 过滤后的热门问题列表
  const filteredPopularQuestions = computed(() => {
    return popularQuestions.value.filter((question) => {
      const lowerQuestion = question.toLowerCase();
      return (
        !lowerQuestion.includes('什么是cps test') &&
        !lowerQuestion.includes('what is cps test') &&
        !lowerQuestion.includes('cpsテストとは') &&
        !lowerQuestion.includes('cps 테스트란')
      );
    });
  });

  // 初始化FAQ展开状态
  onMounted(() => {
    // 默认展开第一个FAQ
    faqOpen.value = props.faq.map((_, index) => index === 0);
    renderStructuredData();
  });

  // 监听FAQ数据变化
  watch(
    () => props.faq,
    () => {
      // 重置展开状态
      faqOpen.value = props.faq.map((_, index) => index === 0);
      renderStructuredData();
    },
    { deep: true }
  );

  // 过滤后的FAQ
  const filteredFaq = computed(() => {
    let faqs = [...props.faq];

    // 移除"什么是CPS测试?"的FAQ项
    faqs = faqs.filter((item) => {
      const question = item.q.toLowerCase();
      return (
        !question.includes('什么是cps test') &&
        !question.includes('what is cps test') &&
        !question.includes('cpsテストとは') &&
        !question.includes('cps 테스트란')
      );
    });

    // 搜索过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      faqs = faqs.filter(
        (item) => item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      );
    }

    return faqs;
  });

  // 切换FAQ展开/折叠（点击一个FAQ时关闭其他所有FAQ）
  const toggleFaq = (index: number) => {
    // 关闭所有FAQ，然后只展开当前点击的FAQ
    faqOpen.value = faqOpen.value.map((_, i) => (i === index ? !faqOpen.value[index] : false));
  };

  // 滚动到指定问题
  const scrollToQuestion = (question: string) => {
    // 查找问题在过滤后的FAQ列表中的索引
    const index = filteredFaq.value.findIndex((item) => item.q === question);
    if (index !== -1) {
      // 关闭所有FAQ，然后只展开当前点击的FAQ
      faqOpen.value = faqOpen.value.map((_, i) => (i === index ? true : false));
      // 滚动到该问题
      setTimeout(() => {
        const element = document.querySelector(`.faq-item:nth-child(${index + 1})`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // 格式化答案，将换行符转换为<br>标签
  const formatAnswer = (answer: string) => {
    return answer.replace(/\n/g, '<br>');
  };

  // 生成FAQ结构化数据
  const faqStructuredData = computed(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
  });

  // 渲染结构化数据
  const renderStructuredData = () => {
    // 检查是否已存在结构化数据元素
    let structuredDataElement: HTMLScriptElement | null = document.getElementById(
      'faq-structured-data'
    ) as HTMLScriptElement | null;

    if (!structuredDataElement) {
      structuredDataElement = document.createElement('script');
      structuredDataElement.id = 'faq-structured-data';
      structuredDataElement.type = 'application/ld+json';
      document.head.appendChild(structuredDataElement);
    }

    // 更新结构化数据内容
    structuredDataElement.textContent = JSON.stringify(faqStructuredData.value);
  };

  // 组件卸载时清理结构化数据
  onUnmounted(() => {
    const structuredDataElement = document.getElementById('faq-structured-data');
    if (structuredDataElement) {
      structuredDataElement.remove();
    }
  });
</script>

<style scoped>
  /* 主容器样式 */
  .faq-container {
    background-color: #1a1a1a;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    /* 字体优化 */
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-smooth: always;
    text-rendering: optimizeLegibility;
  }

  /* 热门问题区块 */
  .popular-faq-section {
    background-color: #252525;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .popular-faq-section h4 {
    color: #4caf50;
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 20px;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 热门问题列表 */
  .popular-faq-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* 热门问题项 */
  .popular-faq-item {
    background-color: #333;
    color: white;
    padding: 8px 15px;
    border-radius: 15px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #444;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .popular-faq-item:hover {
    background-color: #4caf50;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  /* FAQ列表 */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* FAQ项 */
  .faq-item {
    background-color: #252525;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s ease;
    border: 1px solid #333;
  }

  .faq-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    border-color: #4caf50;
  }

  /* FAQ问题 */
  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 15px;
    background-color: #2a2a2a;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .faq-question:hover {
    background-color: #333;
  }

  .faq-question.active {
    background-color: #333;
    border-bottom: 1px solid #444;
  }

  /* FAQ问题标题 */
  .faq-question h4 {
    margin: 0;
    color: white;
    font-size: 18px;
    font-weight: 600;
    flex: 1;
    line-height: 1.5;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.3px;
  }

  /* 切换图标 */
  .faq-toggle-icon {
    color: #4caf50;
    font-size: 16px;
    margin-left: 10px;
    transition: transform 0.2s ease;
    transform-origin: center;
  }

  /* 展开状态的图标旋转 */
  .faq-question.active .faq-toggle-icon {
    transform: rotate(90deg);
    color: #81c784;
  }

  /* FAQ答案 */
  .faq-answer {
    overflow: hidden;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    padding: 0 15px;
    height: 0;
  }

  /* 展开状态的答案 */
  .faq-answer.open {
    opacity: 1;
    transform: translateY(0);
    height: auto;
    padding: 15px;
  }

  /* 答案内容 */
  .faq-answer-content p {
    margin: 0;
    color: #ccc;
    line-height: 1.7;
    font-size: 16px;
    font-weight: 400;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.2px;
  }

  /* 相关问题 */
  .related-questions {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #333;
  }

  /* 相关问题标题 */
  .related-questions h5 {
    margin: 0 0 10px 0;
    color: #4caf50;
    font-size: 16px;
    font-weight: 500;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 相关问题列表 */
  .related-questions ul {
    margin: 0;
    padding-left: 20px;
  }

  /* 相关问题项 */
  .related-questions li {
    color: #999;
    font-size: 15px;
    margin-bottom: 5px;
    cursor: pointer;
    transition: color 0.2s ease;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .related-questions li:hover {
    color: #4caf50;
  }

  /* 无结果状态 */
  .no-faq-results {
    text-align: center;
    color: #888;
    padding: 30px;
    font-style: italic;
    font-size: 16px;
    /* 字体渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .faq-container {
      padding: 15px;
      margin: 15px 0;
    }

    .popular-faq-section {
      padding: 12px;
    }

    .popular-faq-list {
      gap: 8px;
    }

    .popular-faq-item {
      padding: 6px 12px;
      font-size: 14px;
    }

    .faq-question {
      padding: 12px;
    }

    .faq-question h4 {
      font-size: 17px;
    }

    .faq-answer.open {
      padding: 12px;
    }
  }
</style>
