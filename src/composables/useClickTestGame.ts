import { ref, computed } from 'vue';

/**
 * 点击测试游戏逻辑管理composable
 * @param testTime 测试时间（秒）
 */
export function useClickTestGame(testTime: number) {
  // 状态管理
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameOver = ref(false); // 游戏是否结束（专门用于标识最终状态）
  const startTime = ref(0); // 游戏开始时间戳
  const endTime = ref(0); // 游戏结束时间戳
  const clicks = ref(0); // 点击次数
  const cps = ref(0); // 最终CPS值（每秒点击次数）
  const timer = ref(0); // 定时器ID
  const elapsedTime = ref(0); // 已用时间（毫秒级精度）
  const showResultModal = ref(false); // 结果弹窗显示状态

  // 鼠标按键选择状态
  const selectedMouseButton = ref(0); // 当前选择的鼠标按键，默认左键

  // 计算属性：判断时间是否到了
  const isTimeUp = computed(() => {
    // 游戏未开始或已结束，返回false
    if (!isPlaying.value || isGameOver.value) return false;

    // 计算已用时间（秒）
    const elapsed = (Date.now() - startTime.value) / 1000;
    return elapsed >= testTime; // 已用时间大于等于测试时间则返回true
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
      elapsedTime.value = Math.min(elapsed, testTime);

      // 检查时间是否结束（直接计算，不依赖isTimeUp）
      if (elapsed >= testTime) {
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
    cps.value = testTime > 0 ? Math.round((clicks.value / testTime) * 100) / 100 : 0;

    // 确保已用时间显示为规定的测试时间，而不是实际的游戏持续时间
    elapsedTime.value = testTime;

    // 清除定时器
    clearInterval(timer.value);

    // 显示结果弹窗
    showResultModal.value = true;

    return {
      clicks: clicks.value,
      cps: cps.value,
      testTime,
    };
  };

  // 点击事件处理函数
  const handleClick = (eventButton: number) => {
    // 检查是否是选择的鼠标按键
    if (eventButton !== selectedMouseButton.value) {
      return false;
    }

    // 游戏结束或时间到了，不处理点击事件
    if (isGameOver.value || isTimeUp.value) {
      return false;
    }

    // 游戏未开始且不是第一次点击，不处理点击事件
    if (!isPlaying.value && clicks.value > 0) {
      return false;
    }

    // 直接开始游戏（如果是第一次点击）
    if (!isPlaying.value && clicks.value === 0) {
      startGame();
    }

    // 更新点击次数（游戏进行中且时间未到）
    if (isPlaying.value && !isTimeUp.value) {
      clicks.value++;
      return true;
    }

    return false;
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

    // 关闭结果弹窗
    showResultModal.value = false;
  };

  // 选择鼠标按键
  const selectMouseButton = (button: number) => {
    selectedMouseButton.value = button;
    resetGame();
  };

  return {
    // 状态
    isPlaying,
    isGameOver,
    clicks,
    cps,
    elapsedTime,
    showResultModal,
    selectedMouseButton,
    isTimeUp,
    currentCps,

    // 方法
    startGame,
    endGame,
    handleClick,
    resetGame,
    selectMouseButton,
  };
}
