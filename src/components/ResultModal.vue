<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { t } from '../i18n/index';

  // 组件属性
  const props = defineProps<{
    visible: boolean;
    type: string;
    cps: number;
    time: number;
  }>();

  // 定义分享参数类型
  interface ShareParams {
    cps: number;
    time: number;
    type: string;
  }

  // 对比数据响应式变量
  const friendData = ref<ShareParams | null>(null);

  // 从sessionStorage获取分享参数
  const getShareParams = () => {
    try {
      const paramsJson = sessionStorage.getItem('sharedParams');
      if (paramsJson) {
        return JSON.parse(paramsJson);
      }
    } catch (error) {
      console.error('Failed to get shared params from sessionStorage:', error);
    }
    return null;
  };

  // 解密分享参数的函数
  const decodeShareParams = (encodedParams: string) => {
    try {
      // Base64解码
      const paramsJson = atob(encodedParams);
      // 解析为JSON对象
      const params = JSON.parse(paramsJson);
      // 返回解密后的参数
      return params;
    } catch (error) {
      console.error('Failed to decode share params:', error);
      return null;
    }
  };

  // 检查分享参数的函数
  const checkShareParams = () => {
    // 先检查sessionStorage中是否有分享参数
    let sharedParams = getShareParams();

    if (!sharedParams) {
      // 如果sessionStorage中没有，再检查URL中是否有分享参数
      const shareParams = new URLSearchParams(window.location.search).get('share');
      if (shareParams) {
        // 解密分享参数
        const decodedParams = decodeShareParams(shareParams);
        if (decodedParams) {
          // 保存到sessionStorage
          try {
            sessionStorage.setItem('sharedParams', JSON.stringify(decodedParams));
          } catch (error) {
            console.error('Failed to save shared params to sessionStorage:', error);
          }
          sharedParams = decodedParams;
        }
      }
    }

    if (sharedParams) {
      // 打印解密后的参数（可以根据需要使用这些参数）
      console.log('Decoded share params in ResultModal:', sharedParams);

      // 检查是否与当前测试匹配
      if (sharedParams.type === props.type && sharedParams.time === props.time) {
        // 匹配成功，保存对比数据
        friendData.value = sharedParams;
        console.log('好友对比数据匹配成功:', friendData.value);
      } else {
        // 匹配失败，清空对比数据
        friendData.value = null;
        console.log('好友对比数据不匹配:', sharedParams, props);
      }
    } else {
      // 没有获取到分享参数，清空对比数据
      friendData.value = null;
    }
  };

  // 在组件挂载时检查分享参数
  onMounted(() => {
    checkShareParams();
  });

  // 监听visible变化，重新检查分享参数
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 弹窗显示时重新检查分享参数
        checkShareParams();
      }
    }
  );

  // 组件事件
  const emit = defineEmits(['close']);

  // 关闭弹窗
  const handleClose = () => {
    emit('close');
  };

  // 键盘事件处理函数
  const handleKeyDown = (event: KeyboardEvent) => {
    // 按下 Esc 键关闭弹窗
    if (event.key === 'Escape' || event.key === 'Esc') {
      handleClose();
    }
  };

  // 阻止滚动的事件处理函数
  const preventScroll = (e: Event) => {
    if (e instanceof WheelEvent || e instanceof TouchEvent) {
      e.preventDefault();
    } else if (e instanceof KeyboardEvent) {
      const scrollKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' ',
        'PageUp',
        'PageDown',
        'Home',
        'End',
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  // 禁用滚动函数
  const disableScroll = () => {
    // 获取当前滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // 保存当前滚动位置
    document.body.dataset.scrollTop = scrollTop.toString();
    document.body.dataset.scrollLeft = scrollLeft.toString();

    // 保存原始样式
    document.body.dataset.originalScrollbarWidth = document.body.style.scrollbarWidth;

    // 隐藏滚动条视觉样式 - 不改变overflow属性，保持滚动条存在
    document.body.style.scrollbarWidth = 'none'; // Firefox

    // 添加WebKit滚动条隐藏样式
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-style';
    style.textContent = `
      /* WebKit浏览器：隐藏滚动条但保持其功能 */
      body::-webkit-scrollbar {
        display: none !important;
      }
      
      /* IE/Edge：隐藏滚动条但保持其功能 */
      body {
        -ms-overflow-style: none !important;
      }
      
      /* 确保overflow保持auto，不改变页面布局 */
      body {
        overflow: auto !important;
      }
    `;
    document.head.appendChild(style);

    // 阻止滚动事件，锁定背景滚动
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('keydown', preventScroll, { passive: false });
  };

  // 启用滚动函数
  const enableScroll = () => {
    // 恢复滚动位置
    const scrollTop = parseInt(document.body.dataset.scrollTop || '0');
    const scrollLeft = parseInt(document.body.dataset.scrollLeft || '0');

    // 恢复原始滚动条样式
    document.body.style.scrollbarWidth = document.body.dataset.originalScrollbarWidth || '';

    // 移除滚动条隐藏样式
    const style = document.getElementById('hide-scrollbar-style');
    if (style) {
      document.head.removeChild(style);
    }

    // 移除滚动阻止事件
    document.removeEventListener('wheel', preventScroll);
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('keydown', preventScroll);

    // 恢复滚动位置
    window.scrollTo(scrollLeft, scrollTop);

    // 清除保存的属性
    delete document.body.dataset.scrollTop;
    delete document.body.dataset.scrollLeft;
    delete document.body.dataset.originalScrollbarWidth;
  };

  // 监听 visible 属性变化，只在弹窗可见时添加事件监听
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 弹窗显示时添加事件监听和禁用滚动
        window.addEventListener('keydown', handleKeyDown);
        disableScroll();
      } else {
        // 弹窗隐藏时移除事件监听和启用滚动
        window.removeEventListener('keydown', handleKeyDown);
        enableScroll();
      }
    }
  );

  // 组件销毁时确保移除事件监听和启用滚动
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    enableScroll();
  });

  // 计算对比结果
  const comparisonResult = computed(() => {
    if (!friendData.value) return null;

    const difference = props.cps - friendData.value.cps;
    const isBetter = difference > 0;
    const isWorse = difference < 0;
    const isEqual = difference === 0;

    return {
      difference: Math.abs(difference).toFixed(2),
      isBetter,
      isWorse,
      isEqual,
    };
  });

  // 获取测试类型的所有相关片段标识符
  const getAllFragmentIdentifiers = () => {
    switch (props.type) {
      case 'clickTest':
        return ['#CpsTest', '#ClickTest', '#ClickSpeedTest', '#MouseClickTest'];
      case 'spaceClickTest':
        return [
          '#CpsTest',
          '#SpaceClickTest',
          '#SpacebarTest',
          '#SpaceClickSpeed',
          '#SpacebarClickTest',
        ];
      case 'kohiClickTest':
        return ['#CpsTest', '#KohiClickTest', '#KohiTest', '#MinecraftClickTest', '#McClickTest'];
      default:
        return ['#CpsTest'];
    }
  };

  // 分享文本生成
  const getShareText = () => {
    // 获取友好的测试类型名称
    const getFriendlyTestType = () => {
      switch (props.type) {
        case 'clickTest':
          return t('resultModal.ShareClickTest');
        case 'spaceClickTest':
          return t('resultModal.ShareSpaceClickTest');
        case 'kohiClickTest':
          return t('resultModal.ShareKohiClickTest');
        default:
          return 'CPSTest';
      }
    };

    const count = Math.round(props.cps * props.time);
    const testType = getFriendlyTestType();
    return `${t('resultModal.shareText', { cps: props.cps, time: props.time, testType, count })}`;
  };

  // 分享链接生成
  const getShareLinks = () => {
    const text = getShareText();

    // 创建包含参数的对象
    const shareParams = {
      cps: props.cps,
      time: props.time,
      type: props.type,
    };

    // 将参数对象转换为JSON字符串，然后进行Base64编码（前端简单加密）
    const paramsJson = JSON.stringify(shareParams);
    const encodedParams = btoa(paramsJson);

    // 获取所有片段标识符并使用第一个作为URL片段（URL规范只允许一个片段标识符）
    const fragmentIds = getAllFragmentIdentifiers();

    // 构建包含参数和片段标识符的分享链接
    const shareUrl = `${window.location.origin}?share=${encodedParams}`;
    // 生成完整的分享文本，包含标签和所有片段标识符
    const allFragmentIdsText = fragmentIds.join(' ');
    const fullShareText = `${text} ${shareUrl} ${allFragmentIdsText}`;
    // 编码分享文本和链接
    const encodedText = encodeURIComponent(fullShareText);

    return {
      // X (Twitter) 分享链接 - 包含完整的分享文本、加密参数和标签
      x: `https://twitter.com/intent/tweet?text=${encodedText}`,
      // WhatsApp 分享链接 - 包含完整的分享文本和参数化链接
      whatsapp: `https://wa.me/?text=${encodedText}`,
    };
  };

  // 计算属性：当前分享链接
  const shareLinks = computed(() => getShareLinks());

  // 分享函数
  const shareTo = (platform: string) => {
    // 其他平台正常分享
    const link = shareLinks.value[platform as keyof typeof shareLinks.value];
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };
</script>

<template>
  <!-- 黑色蒙板 -->
  <div v-if="visible" class="modal-overlay">
    <!-- 弹窗内容 -->
    <div class="modal-content">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">
        <span>×</span>
      </button>

      <!-- 分数结果 -->
      <div class="cps-result">
        <h2>{{ cps }} CPS</h2>
      </div>

      <!-- 详细信息 -->
      <div class="result-details">
        <p>
          <span class="detail-text">{{ t('resultModal.detailsText') }}</span>
          <span class="detail-value">{{ time }}</span>
          <span class="detail-text">{{ t('resultModal.seconds') }}</span>
          <span class="detail-text">{{ t('resultModal.clickText') }}</span>
          <span class="detail-value">{{ Math.round(cps * time) }}</span>
          <span class="detail-text">{{ t('resultModal.timesText') }}</span>
        </p>
        <p v-if="cps >= 0 && cps < 3">{{ t('resultModal.feedback.slow') }}</p>
        <p v-else-if="cps >= 3 && cps < 6">{{ t('resultModal.feedback.average') }}</p>
        <p v-else-if="cps >= 6 && cps < 9">{{ t('resultModal.feedback.fast') }}</p>
        <p v-else-if="cps >= 9 && cps <= 10">{{ t('resultModal.feedback.superFast') }}</p>
        <p v-else>{{ t('resultModal.feedback.ultraFast') }}</p>
      </div>

      <!-- 好友对比区域 -->
      <div v-if="friendData" class="comparison-section">
        <!-- 分割线 -->
        <div class="divider"></div>

        <h3 class="comparison-title">{{ t('resultModal.comparisonTitle') }}</h3>

        <div class="comparison-content">
          <div class="comparison-item">
            <div class="comparison-label">{{ t('resultModal.yourCps') }}</div>
            <div class="comparison-value user-value">{{ cps.toFixed(2) }}</div>
          </div>

          <div class="comparison-vs">{{ t('resultModal.vs') }}</div>

          <div class="comparison-item">
            <div class="comparison-label">{{ t('resultModal.friendCps') }}</div>
            <div class="comparison-value friend-value">{{ friendData.cps.toFixed(2) }}</div>
          </div>
        </div>

        <div v-if="comparisonResult" class="comparison-result">
          <div v-if="comparisonResult.isBetter" class="result-better">
            {{ t('resultModal.resultBetter', { difference: comparisonResult.difference }) }}
          </div>
          <div v-else-if="comparisonResult.isWorse" class="result-worse">
            {{ t('resultModal.resultWorse', { difference: comparisonResult.difference }) }}
          </div>
          <div v-else class="result-equal">{{ t('resultModal.resultEqual') }}</div>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 分享按钮区域 -->
      <div class="share-section">
        <p class="share-title">{{ t('resultModal.shareTitle') }}</p>
        <div class="share-buttons">
          <button class="share-btn x-btn" title="Share to X" @click="shareTo('x')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
              ></path>
            </svg>
            <span>{{ t('resultModal.shareX') }}</span>
          </button>
          <button
            class="share-btn whatsapp-btn"
            title="Share to WhatsApp"
            @click="shareTo('whatsapp')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              ></path>
            </svg>
            <span>{{ t('resultModal.shareWhatsApp') }}</span>
          </button>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="divider"></div>

      <!-- 按钮区域 -->
      <div class="modal-buttons">
        <button class="ok-btn" @click="handleClose">{{ t('resultModal.okButton') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 黑色蒙板 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* 弹窗内容 */
  .modal-content {
    background-color: #282828;
    border-radius: 20px;
    padding: 30px;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0 8px 32px rgba(76, 175, 80, 0.2);
    border: 2px solid #333;
    opacity: 0;
    transform: scale(0.6) translateY(50px);
    animation: scaleIn 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-size: 16px;
  }

  /* 淡入动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 缩放淡入动画 */
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.6) translateY(50px);
    }
    70% {
      opacity: 1;
      transform: scale(1.05) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* CPS结果动画 */
  .cps-result h2 {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
    animation: cpsFadeIn 0.8s cubic-bezier(0.68, -0.6, 0.32, 1.6) 0.4s forwards;
  }

  /* 详细信息动画 */
  .result-details p {
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 0.8s forwards;
  }

  /* 按钮动画 */
  .ok-btn {
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 1s forwards;
    pointer-events: none;
    animation-fill-mode: forwards;
  }

  /* 动画结束后启用点击 */
  @keyframes textFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
    to {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  }

  /* CPS结果动画 */
  @keyframes cpsFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    60% {
      opacity: 1;
      transform: scale(1.1) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* 关闭按钮 */
  .close-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #4caf50;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    outline: none;
    /* 优化居中显示 */
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    z-index: 10;
  }

  .close-btn:hover {
    background-color: rgba(76, 175, 80, 0.1);
    color: #45a049;
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  /* 分数结果 */
  .cps-result {
    text-align: center;
    margin-bottom: 20px;
  }

  .cps-result h2 {
    color: #4caf50;
    font-size: 48px;
    margin: 0;
    font-weight: bold;
  }

  /* 详细信息 */
  .result-details {
    text-align: center;
    margin-bottom: 30px;
    color: #888;
    line-height: 1.8;
  }

  .result-details p {
    font-size: 20px;
    margin-bottom: 12px;
    font-weight: 400;
    line-height: 1.6;
  }

  /* 详细信息文本样式 */
  .detail-text {
    color: #cccccc;
    font-size: 24px;
  }

  /* 详细信息数值样式 - 绿色高亮 */
  .detail-value {
    color: #4caf50;
    font-size: 20px;
    font-weight: 600;
    margin: 0 5px;
  }

  /* 分割线样式 */
  .divider {
    width: 100%;
    height: 1px;
    background-color: #3a3a3a;
    margin: 20px 0;
    opacity: 0.5;
    transition: opacity 0.3s ease;
    animation: textFadeIn 0.6s ease-out 1s forwards;
    opacity: 0;
  }

  .divider:hover {
    opacity: 0.8;
  }

  /* 分享区域 */
  .share-section {
    text-align: center;
    margin-bottom: 25px;
    opacity: 0;
    transform: translateY(20px);
    animation: textFadeIn 0.6s ease-out 1.2s forwards;
  }

  /* 分享标题 */
  .share-title {
    font-size: 18px;
    color: #aaa;
    margin-bottom: 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* 分享按钮容器 */
  .share-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  /* 分享按钮基础样式 */
  .share-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.2s ease;
    outline: none;
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 1.4s forwards;
    font-family: inherit;
    letter-spacing: 0.3px;
    pointer-events: none;
    animation-fill-mode: forwards;
  }

  /* 分享按钮动画延迟 */
  .share-btn.x-btn {
    animation-delay: 1.4s;
  }

  .share-btn.whatsapp-btn {
    animation-delay: 1.6s;
  }

  /* X (Twitter) 按钮样式 */
  .share-btn.x-btn {
    background-color: #1da1f2;
    color: white;
  }

  .share-btn.x-btn:hover {
    background-color: #0d8bd9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
  }

  /* WhatsApp 按钮样式 */
  .share-btn.whatsapp-btn {
    background-color: #25d366;
    color: white;
  }

  .share-btn.whatsapp-btn:hover {
    background-color: #1ebe57;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  }

  /* 分享按钮激活状态 */
  .share-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* 分享按钮图标样式 */
  .share-btn svg {
    flex-shrink: 0;
  }

  /* 好友对比区域样式 */
  .comparison-section {
    text-align: center;
    margin-bottom: 25px;
    opacity: 0;
    animation: textFadeIn 0.6s ease-out 1.2s forwards;
  }

  /* 对比标题样式 */
  .comparison-title {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    margin-top: 10px;
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 1.3s forwards;
  }

  /* 对比内容样式 */
  .comparison-content {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20px;
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 1.4s forwards;
  }

  /* 对比项样式 */
  .comparison-item {
    flex: 1;
    text-align: center;
  }

  /* 对比标签样式 */
  .comparison-label {
    color: #888888;
    font-size: 18px;
    margin-bottom: 8px;
    font-weight: 400;
  }

  /* 对比数值样式 */
  .comparison-value {
    font-size: 32px;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  /* 用户数值样式 */
  .comparison-value.user-value {
    color: #4caf50;
  }

  /* 好友数值样式 */
  .comparison-value.friend-value {
    color: #2196f3;
  }

  /* VS样式 */
  .comparison-vs {
    font-size: 24px;
    font-weight: 600;
    color: #ff9800;
    margin: 0 20px;
    opacity: 0.8;
  }

  /* 对比结果样式 */
  .comparison-result {
    margin-top: 20px;
    padding: 15px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0;
    transform: translateY(10px);
    animation: textFadeIn 0.6s ease-out 1.5s forwards;
  }

  /* 结果更好样式 */
  .result-better {
    color: #4caf50;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.6;
  }

  /* 结果更差样式 */
  .result-worse {
    color: #f44336;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.6;
  }

  /* 结果平局样式 */
  .result-equal {
    color: #ff9800;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.6;
  }

  /* 按钮区域 */
  .modal-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  /* 确定按钮 */
  .ok-btn {
    padding: 12px 24px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    transition: all 0.2s ease;
    outline: none;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .ok-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  .ok-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.5);
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 调整弹窗内容 */
    .modal-content {
      padding: 20px;
      width: 95%;
      max-width: 400px;
    }

    /* 调整关闭按钮 */
    .close-btn {
      top: 10px;
      right: 10px;
      font-size: 20px;
      width: 35px;
      height: 35px;
      padding: 0;
    }

    /* 调整分数结果 */
    .cps-result h2 {
      font-size: 36px;
      margin-bottom: 15px;
    }

    /* 调整详细信息 */
    .result-details {
      margin-bottom: 20px;
    }

    .result-details p {
      font-size: 16px;
      margin-bottom: 8px;
    }

    /* 移动端详细信息文本样式 */
    .detail-text {
      font-size: 16px;
    }

    /* 移动端详细信息数值样式 */
    .detail-value {
      font-size: 18px;
      margin: 0 4px;
    }

    /* 移动端对比区域样式 */
    .comparison-section {
      margin-bottom: 20px;
    }

    /* 移动端对比标题样式 */
    .comparison-title {
      font-size: 18px;
      margin-bottom: 15px;
    }

    /* 移动端对比内容样式 */
    .comparison-content {
      margin-bottom: 15px;
    }

    /* 移动端对比标签样式 */
    .comparison-label {
      font-size: 14px;
      margin-bottom: 6px;
    }

    /* 移动端对比数值样式 */
    .comparison-value {
      font-size: 24px;
    }

    /* 移动端VS样式 */
    .comparison-vs {
      font-size: 18px;
      margin: 0 15px;
    }

    /* 移动端对比结果样式 */
    .comparison-result {
      margin-top: 15px;
      padding: 12px;
    }

    /* 移动端结果文本样式 */
    .result-better,
    .result-worse,
    .result-equal {
      font-size: 16px;
      line-height: 1.4;
    }

    /* 调整分享区域 */
    .share-section {
      margin-bottom: 20px;
    }

    /* 调整分享标题 */
    .share-title {
      font-size: 14px;
      margin-bottom: 12px;
    }

    /* 调整分享按钮容器 */
    .share-buttons {
      gap: 10px;
    }

    /* 调整分享按钮 */
    .share-btn {
      padding: 9px 16px;
      font-size: 13px;
      gap: 6px;
    }

    /* 调整分享按钮图标 */
    .share-btn svg {
      width: 18px;
      height: 18px;
    }

    /* 调整按钮 */
    .ok-btn {
      padding: 10px 20px;
      font-size: 14px;
    }

    /* 调整按钮区域间距 */
    .modal-buttons {
      gap: 10px;
    }
  }

  /* 小屏移动端适配 */
  @media (max-width: 480px) {
    /* 进一步减小弹窗内边距 */
    .modal-content {
      padding: 15px;
    }

    /* 调整小屏关闭按钮 */
    .close-btn {
      width: 32px;
      height: 32px;
      font-size: 18px;
      padding: 0;
    }

    /* 进一步减小标题字体 */
    .cps-result h2 {
      font-size: 32px;
    }

    /* 进一步减小对比数值 */
    .comparison-value {
      font-size: 20px;
    }

    /* 进一步减小VS字体 */
    .comparison-vs {
      font-size: 16px;
      margin: 0 10px;
    }

    /* 进一步减小结果文本 */
    .result-better,
    .result-worse,
    .result-equal {
      font-size: 14px;
    }

    /* 进一步减小按钮大小 */
    .ok-btn {
      padding: 9px 18px;
      font-size: 13px;
    }
  }
</style>
