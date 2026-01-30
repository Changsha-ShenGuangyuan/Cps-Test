import { ref } from 'vue';

// 涟漪特效类型定义
export interface Ripple {
  id: number; // 涟漪唯一标识
  x: number; // 涟漪中心X坐标
  y: number; // 涟漪中心Y坐标
}

/**
 * 涟漪特效管理composable
 * @param rippleDuration 涟漪动画持续时间（毫秒）
 */
export function useRippleEffect(rippleDuration: number = 600) {
  // 涟漪特效数组
  const ripples = ref<Ripple[]>([]);
  // 涟漪ID计数器，确保每个涟漪都有唯一ID
  let rippleIdCounter = 0;

  /**
   * 添加涟漪特效
   * @param x 涟漪中心X坐标
   * @param y 涟漪中心Y坐标
   */
  const addRipple = (x: number, y: number) => {
    // 创建涟漪特效，使用自增计数器确保唯一ID
    const rippleId = ++rippleIdCounter;

    // 创建新的涟漪对象
    const newRipple: Ripple = {
      id: rippleId,
      x: x,
      y: y,
    };

    // 添加涟漪到数组（触发响应式更新）
    ripples.value = [...ripples.value, newRipple];

    // 动画结束后自动移除涟漪（使用setTimeout一次性移除，避免频繁操作）
    setTimeout(() => {
      ripples.value = ripples.value.filter((r) => r.id !== rippleId);
    }, rippleDuration);

    return rippleId;
  };

  /**
   * 清除所有涟漪特效
   */
  const clearRipples = () => {
    ripples.value = [];
  };

  return {
    ripples,
    addRipple,
    clearRipples,
  };
}
