<script setup lang="ts">
  import { computed, onUnmounted, watch } from 'vue';
  import { t } from '../i18n/index';

  // 组件属性
  const props = defineProps<{
    visible: boolean;
    type: string;
    cps: number;
    time: number;
  }>();

  // 组件事件
  const emit = defineEmits<{
    (e: 'close'): void;
  }>();

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

  // 禁用滚动函数
  const disableScroll = () => {
    // 获取当前滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // 保存当前滚动位置
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollTop}px`;
    document.body.style.left = `-${scrollLeft}px`;
    document.body.style.width = '100%';
  };

  // 启用滚动函数
  const enableScroll = () => {
    // 恢复滚动位置
    const top = document.body.style.top;
    const left = document.body.style.left;
    
    // 移除固定定位
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    
    // 恢复滚动位置
    window.scrollTo(parseInt(left || '0') * -1, parseInt(top || '0') * -1);
  };

  // 监听 visible 属性变化，只在弹窗可见时添加事件监听
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      // 弹窗显示时添加事件监听和禁用滚动
      window.addEventListener('keydown', handleKeyDown);
      disableScroll();
    } else {
      // 弹窗隐藏时移除事件监听和启用滚动
      window.removeEventListener('keydown', handleKeyDown);
      enableScroll();
    }
  });

  // 组件销毁时确保移除事件监听和启用滚动
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    enableScroll();
  });

  // 根据CPS值获取描述类型
  const getDescType = () => {
    const cps = props.cps;
    if (cps < 3) return 'slow';
    if (cps < 6) return 'average';
    if (cps < 9) return 'fast';
    if (cps < 12) return 'superFast';
    return 'ultraFast';
  };

  // 随机获取描述语句
  const getRandomDescription = () => {
    const descType = getDescType();
    // 从i18n中获取对应类型的描述数组
    const descKeys = [
      t(`resultModal.${descType}.desc1`),
      t(`resultModal.${descType}.desc2`)
    ];
    const randomIndex = Math.floor(Math.random() * descKeys.length);
    return descKeys[randomIndex];
  };

  // 计算属性：当前描述语句
  const currentDescription = computed(() => getRandomDescription());
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
        <h2>{{ cps }} {{ t('cps') }}</h2>
      </div>

      <!-- 描述语句 -->
      <div class="result-description">
        <p>{{ currentDescription }}</p>
      </div>

      <!-- 详细信息 -->
      <div class="result-details">
        <p>{{ t('resultModal.details', { time: time, clicks: Math.round(cps * time) }) }}</p>
        <p v-if="cps < 3">{{ t('resultModal.feedback.slow') }}</p>
        <p v-else-if="cps < 6">{{ t('resultModal.feedback.average') }}</p>
        <p v-else-if="cps < 9">{{ t('resultModal.feedback.fast') }}</p>
        <p v-else-if="cps < 12">{{ t('resultModal.feedback.superFast') }}</p>
        <p v-else>{{ t('resultModal.feedback.ultraFast') }}</p>
      </div>

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
    padding: 5px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    outline: none;
  }

  .close-btn:hover {
    background-color: rgba(76, 175, 80, 0.1);
    color: #45a049;
    transform: translateY(-2px);
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

  /* 图片 */
  .result-image {
    text-align: center;
    margin-bottom: 20px;
  }

  .result-image img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }

  /* 描述语句 */
  .result-description {
    text-align: center;
    margin-bottom: 20px;
  }

  .result-description p {
    font-size: 18px;
    color: white;
    margin: 0;
    font-weight: 500;
  }

  /* 详细信息 */
  .result-details {
    text-align: center;
    margin-bottom: 30px;
    color: #888;
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
    font-weight: bold;
    transition: all 0.2s ease;
    outline: none;
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
      width: 25px;
      height: 25px;
    }

    /* 调整分数结果 */
    .cps-result h2 {
      font-size: 36px;
      margin-bottom: 15px;
    }

    /* 调整描述语句 */
    .result-description p {
      font-size: 16px;
      margin-bottom: 15px;
    }

    /* 调整详细信息 */
    .result-details {
      margin-bottom: 20px;
      font-size: 14px;
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

    /* 进一步减小标题字体 */
    .cps-result h2 {
      font-size: 32px;
    }

    /* 进一步减小描述字体 */
    .result-description p {
      font-size: 15px;
    }

    /* 进一步减小按钮大小 */
    .ok-btn {
      padding: 9px 18px;
      font-size: 13px;
    }
  }
</style>