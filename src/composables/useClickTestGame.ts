import { ref, computed } from 'vue';

/**
 * 点击测试游戏逻辑管理composable
 * @param testTime 测试时间（秒）
 */
export function useClickTestGame(testTime: number) {
  // 状态管理
  const isPlaying = ref(false);
  const isGameOver = ref(false);
  const startTime = ref(0);
  const clicks = ref(0);
  const cps = ref(0);
  const timer = ref(0);
  const elapsedTime = ref(0);
  const showResultModal = ref(false);

  // 鼠标按键选择状态
  const selectedMouseButton = ref(0);

  // 计算属性：判断时间是否到了
  const isTimeUp = computed(() => {
    if (!isPlaying.value || isGameOver.value) return false;
    const elapsed = (Date.now() - startTime.value) / 1000;
    return elapsed >= testTime;
  });

  // 计算属性：实时计算当前CPS
  const currentCps = computed(() => {
    if (isGameOver.value) {
      return cps.value;
    }
    if (!isPlaying.value || clicks.value === 0) return 0;
    if (elapsedTime.value < 0.1) return 0;
    return Math.round((clicks.value / elapsedTime.value) * 100) / 100;
  });

  // 游戏开始函数
  const startGame = () => {
    if (isPlaying.value) return;

    // 重置游戏状态
    clicks.value = 0;
    startTime.value = Date.now();
    isPlaying.value = true;
    isGameOver.value = false;
    elapsedTime.value = 0;

    // 设置定时器，每50ms更新一次状态
    timer.value = window.setInterval(() => {
      const elapsed = (Date.now() - startTime.value) / 1000;
      elapsedTime.value = Math.min(elapsed, testTime);

      // 检查时间是否结束
      if (elapsed >= testTime) {
        endGame();
      }
    }, 50);
  };

  // 游戏结束函数
  const endGame = () => {
    isPlaying.value = false;
    isGameOver.value = true;

    // 计算最终CPS
    cps.value = testTime > 0 ? Math.round((clicks.value / testTime) * 100) / 100 : 0;

    // 确保已用时间显示为规定的测试时间
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
