<template>
  <div class="keyboard-test-container">
    <h1>{{ t('keyboardTest') }}</h1>
    <p class="test-description">{{ t('keyboardTestDesc') }}</p>
    <!-- 按键历史记录显示 -->
    <div class="key-history-text">
      {{ displayedKeys }}
    </div>

    <!-- 区域一：键盘区域 -->
    <div class="keyboard">
      <!-- 区域一：主键盘 -->
      <div class="area-1">
        <!-- 第一行：功能键 -->
        <div class="key" :class="{ active: activeKeys.has('Escape') }" data-key="Escape">Esc</div>
        <div
          class="key"
          :class="{ active: activeKeys.has('F1') }"
          data-key="F1"
          style="margin-left: 50px"
        >
          F1
        </div>
        <div class="key" :class="{ active: activeKeys.has('F2') }" data-key="F2">F2</div>
        <div class="key" :class="{ active: activeKeys.has('F3') }" data-key="F3">F3</div>
        <div
          class="key"
          :class="{ active: activeKeys.has('F4') }"
          data-key="F4"
          style="margin-left: 25px"
        >
          F4
        </div>
        <div class="key" :class="{ active: activeKeys.has('F5') }" data-key="F5">F5</div>
        <div class="key" :class="{ active: activeKeys.has('F6') }" data-key="F6">F6</div>
        <div class="key" :class="{ active: activeKeys.has('F7') }" data-key="F7">F7</div>
        <div
          class="key"
          :class="{ active: activeKeys.has('F8') }"
          data-key="F8"
          style="margin-left: 25px"
        >
          F8
        </div>
        <div class="key" :class="{ active: activeKeys.has('F9') }" data-key="F9">F9</div>
        <div class="key" :class="{ active: activeKeys.has('F10') }" data-key="F10">F10</div>
        <div class="key" :class="{ active: activeKeys.has('F11') }" data-key="F11">F11</div>
        <div class="key" :class="{ active: activeKeys.has('F12') }" data-key="F12">F12</div>

        <!-- 第二行：数字键 -->
        <div class="key" :class="{ active: activeKeys.has('Backquote') }" data-key="Backquote">
          <span>~</span><span>`</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit1') }" data-key="Digit1">
          <span>!</span><span>1</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit2') }" data-key="Digit2">
          <span>@</span><span>2</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit3') }" data-key="Digit3">
          <span>#</span><span>3</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit4') }" data-key="Digit4">
          <span>$</span><span>4</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit5') }" data-key="Digit5">
          <span>%</span><span>5</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit6') }" data-key="Digit6">
          <span>^</span><span>6</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit7') }" data-key="Digit7">
          <span>&</span><span>7</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit8') }" data-key="Digit8">
          <span>*</span><span>8</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit9') }" data-key="Digit9">
          <span>(</span><span>9</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Digit0') }" data-key="Digit0">
          <span>)</span><span>0</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Minus') }" data-key="Minus">
          <span>-</span><span>-</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Equal') }" data-key="Equal">
          <span>=</span><span>+</span>
        </div>
        <div
          class="key backspace"
          :class="{ active: activeKeys.has('Backspace') }"
          data-key="Backspace"
          style="width: 90px"
        >
          ←
        </div>

        <!-- 第三行：QWERTY键 -->
        <div
          class="key tab"
          :class="{ active: activeKeys.has('Tab') }"
          data-key="Tab"
          style="width: 70px"
        >
          Tab
        </div>
        <div class="key" :class="{ active: activeKeys.has('KeyQ') }" data-key="KeyQ">Q</div>
        <div class="key" :class="{ active: activeKeys.has('KeyW') }" data-key="KeyW">W</div>
        <div class="key" :class="{ active: activeKeys.has('KeyE') }" data-key="KeyE">E</div>
        <div class="key" :class="{ active: activeKeys.has('KeyR') }" data-key="KeyR">R</div>
        <div class="key" :class="{ active: activeKeys.has('KeyT') }" data-key="KeyT">T</div>
        <div class="key" :class="{ active: activeKeys.has('KeyY') }" data-key="KeyY">Y</div>
        <div class="key" :class="{ active: activeKeys.has('KeyU') }" data-key="KeyU">U</div>
        <div class="key" :class="{ active: activeKeys.has('KeyI') }" data-key="KeyI">I</div>
        <div class="key" :class="{ active: activeKeys.has('KeyO') }" data-key="KeyO">O</div>
        <div class="key" :class="{ active: activeKeys.has('KeyP') }" data-key="KeyP">P</div>
        <div class="key" :class="{ active: activeKeys.has('BracketLeft') }" data-key="BracketLeft">
          <span>[</span><span>{</span>
        </div>
        <div
          class="key"
          :class="{ active: activeKeys.has('BracketRight') }"
          data-key="BracketRight"
        >
          <span>]</span><span>}</span>
        </div>
        <div
          class="key backslash"
          :class="{ active: activeKeys.has('Backslash') }"
          data-key="Backslash"
          style="width: 60px"
        >
          <span>\</span><span>|</span>
        </div>

        <!-- 第四行：ASDF键 -->
        <div
          class="key caps"
          :class="{ active: activeKeys.has('CapsLock') }"
          data-key="CapsLock"
          style="width: 85px"
        >
          Caps Lock
        </div>
        <div class="key" :class="{ active: activeKeys.has('KeyA') }" data-key="KeyA">A</div>
        <div class="key" :class="{ active: activeKeys.has('KeyS') }" data-key="KeyS">S</div>
        <div class="key" :class="{ active: activeKeys.has('KeyD') }" data-key="KeyD">D</div>
        <div class="key" :class="{ active: activeKeys.has('KeyF') }" data-key="KeyF">F</div>
        <div class="key" :class="{ active: activeKeys.has('KeyG') }" data-key="KeyG">G</div>
        <div class="key" :class="{ active: activeKeys.has('KeyH') }" data-key="KeyH">H</div>
        <div class="key" :class="{ active: activeKeys.has('KeyJ') }" data-key="KeyJ">J</div>
        <div class="key" :class="{ active: activeKeys.has('KeyK') }" data-key="KeyK">K</div>
        <div class="key" :class="{ active: activeKeys.has('KeyL') }" data-key="KeyL">L</div>
        <div class="key" :class="{ active: activeKeys.has('Semicolon') }" data-key="Semicolon">
          <span>;</span><span>:</span>
        </div>
        <div
          class="key"
          :class="{ active: activeKeys.has('Quote') }"
          data-key="Quote"
          style="width: 40px"
        >
          <span>'</span><span>"</span>
        </div>
        <div
          class="key enter"
          :class="{ active: activeKeys.has('Enter') }"
          data-key="Enter"
          style="width: 95px"
        >
          Enter
        </div>

        <!-- 第五行：ZXCV键 -->
        <div
          class="key shift left"
          :class="{ active: activeKeys.has('ShiftLeft') }"
          data-key="ShiftLeft"
          style="width: 115px"
        >
          Shift
        </div>
        <div class="key" :class="{ active: activeKeys.has('KeyZ') }" data-key="KeyZ">Z</div>
        <div class="key" :class="{ active: activeKeys.has('KeyX') }" data-key="KeyX">X</div>
        <div class="key" :class="{ active: activeKeys.has('KeyC') }" data-key="KeyC">C</div>
        <div class="key" :class="{ active: activeKeys.has('KeyV') }" data-key="KeyV">V</div>
        <div class="key" :class="{ active: activeKeys.has('KeyB') }" data-key="KeyB">B</div>
        <div class="key" :class="{ active: activeKeys.has('KeyN') }" data-key="KeyN">N</div>
        <div class="key" :class="{ active: activeKeys.has('KeyM') }" data-key="KeyM">M</div>
        <div class="key" :class="{ active: activeKeys.has('Comma') }" data-key="Comma">
          <span>,</span><span>&lt;</span>
        </div>
        <div class="key" :class="{ active: activeKeys.has('Period') }" data-key="Period">
          <span>.</span><span>></span>
        </div>
        <div
          class="key"
          :class="{ active: activeKeys.has('Slash') }"
          data-key="Slash"
          style="width: 40px"
        >
          <span>/</span><span>?</span>
        </div>
        <div
          class="key shift right"
          :class="{ active: activeKeys.has('ShiftRight') }"
          data-key="ShiftRight"
          style="width: 115px"
        >
          Shift
        </div>

        <!-- 第六行：控制键 -->
        <div
          class="key ctrl"
          :class="{ active: activeKeys.has('ControlLeft') }"
          data-key="ControlLeft"
          style="width: 50px"
        >
          Ctrl
        </div>
        <div
          class="key win"
          :class="{ active: activeKeys.has('MetaLeft') }"
          data-key="MetaLeft"
          style="width: 50px"
        >
          <div class="windows-logo"><span></span><span></span></div>
        </div>
        <div
          class="key"
          :class="{ active: activeKeys.has('AltLeft') }"
          data-key="AltLeft"
          style="width: 50px"
        >
          Alt
        </div>
        <div
          class="key space"
          :class="{ active: activeKeys.has('Space') }"
          data-key="Space"
          style="width: 270px"
        ></div>
        <div
          class="key"
          :class="{ active: activeKeys.has('AltRight') }"
          data-key="AltRight"
          style="width: 50px"
        >
          Alt
        </div>
        <div
          class="key win"
          :class="{ active: activeKeys.has('MetaRight') }"
          data-key="MetaRight"
          style="width: 50px"
        >
          <div class="windows-logo"><span></span><span></span></div>
        </div>
        <div
          class="key"
          :class="{ active: activeKeys.has('ContextMenu') }"
          data-key="ContextMenu"
          style="width: 100px"
        >
          ☰
        </div>
        <div
          class="key ctrl"
          :class="{ active: activeKeys.has('ControlRight') }"
          data-key="ControlRight"
          style="width: 50px"
        >
          Ctrl
        </div>
      </div>

      <!-- 区域二：辅助键 -->
      <div class="area-2">
        <!-- 上 -->
        <div class="area-2-item">
          <div
            class="key"
            :class="{ active: activeKeys.has('PrintScreen') }"
            data-key="PrintScreen"
          >
            Print
          </div>
          <div class="key" :class="{ active: activeKeys.has('ScrollLock') }" data-key="ScrollLock">
            Lock
          </div>
          <div class="key" :class="{ active: activeKeys.has('Pause') }" data-key="Pause">Pause</div>
          <div class="key" :class="{ active: activeKeys.has('Insert') }" data-key="Insert">Ins</div>
          <div class="key" :class="{ active: activeKeys.has('Home') }" data-key="Home">Home</div>
          <div class="key" :class="{ active: activeKeys.has('PageUp') }" data-key="PageUp">UP</div>
          <div class="key" :class="{ active: activeKeys.has('Delete') }" data-key="Delete">Del</div>
          <div class="key" :class="{ active: activeKeys.has('End') }" data-key="End">End</div>
          <div class="key" :class="{ active: activeKeys.has('PageDown') }" data-key="PageDown">
            Down
          </div>
        </div>
        <!-- 下 -->
        <div class="area-2-item">
          <div class="key-empty"></div>
          <div class="key" :class="{ active: activeKeys.has('ArrowUp') }" data-key="ArrowUp">↑</div>
          <div class="key-empty"></div>
          <div class="key" :class="{ active: activeKeys.has('ArrowLeft') }" data-key="ArrowLeft">
            ←
          </div>
          <div class="key" :class="{ active: activeKeys.has('ArrowDown') }" data-key="ArrowDown">
            ↓
          </div>
          <div class="key" :class="{ active: activeKeys.has('ArrowRight') }" data-key="ArrowRight">
            →
          </div>
        </div>
      </div>

      <!-- 区域三：数字键盘 -->
      <div class="area-3">
        <!-- 数字小键盘 -->
        <div class="area-3-number" style="margin-top: 50px">
          <!-- 左 -->
          <div class="area-3-number-item">
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('NumLock') }"
              data-key="NumLock"
            >
              Num
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('NumpadDivide') }"
              data-key="NumpadDivide"
            >
              /
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('NumpadMultiply') }"
              data-key="NumpadMultiply"
            >
              *
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad7') }"
              data-key="Numpad7"
            >
              7
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad8') }"
              data-key="Numpad8"
            >
              8
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad9') }"
              data-key="Numpad9"
            >
              9
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad4') }"
              data-key="Numpad4"
            >
              4
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad5') }"
              data-key="Numpad5"
            >
              5
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad6') }"
              data-key="Numpad6"
            >
              6
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad1') }"
              data-key="Numpad1"
            >
              1
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad2') }"
              data-key="Numpad2"
            >
              2
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('Numpad3') }"
              data-key="Numpad3"
            >
              3
            </div>
            <div
              class="key numpad zero"
              :class="{ active: activeKeys.has('Numpad0') }"
              data-key="Numpad0"
              style="width: 90px"
            >
              0
            </div>
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('NumpadDecimal') }"
              data-key="NumpadDecimal"
            >
              .
            </div>
          </div>
          <!-- 右 -->
          <div class="area-3-number-item">
            <div
              class="key numpad"
              :class="{ active: activeKeys.has('NumpadSubtract') }"
              data-key="NumpadSubtract"
            >
              -
            </div>
            <div
              class="key numpad plus"
              :class="{ active: activeKeys.has('NumpadAdd') }"
              data-key="NumpadAdd"
              style="height: 90px"
            >
              +
            </div>
            <div
              class="key numpad enter"
              :class="{ active: activeKeys.has('NumpadEnter') }"
              data-key="NumpadEnter"
              style="height: 90px"
            >
              Enter
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 相关测试推荐组件 -->
    <component :is="RelatedTests" current-test="keyboardTest" />

    <!-- 使用通用FAQ组件 -->
    <component 
      :is="FAQComponent"
      :title="t('keyboardTest')"
      :faq="currentFaq"
      :show-popular="true"
      :popular-questions="popularQuestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { t } from '../i18n/index';
// 懒加载通用FAQ组件
const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
// 懒加载相关测试推荐组件
const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // 按键代码映射表，将KeyboardEvent.code转换为更简洁的表示
  const keyCodeMap: Record<string, string> = {
    // 字母键
    KeyA: 'A',
    KeyB: 'B',
    KeyC: 'C',
    KeyD: 'D',
    KeyE: 'E',
    KeyF: 'F',
    KeyG: 'G',
    KeyH: 'H',
    KeyI: 'I',
    KeyJ: 'J',
    KeyK: 'K',
    KeyL: 'L',
    KeyM: 'M',
    KeyN: 'N',
    KeyO: 'O',
    KeyP: 'P',
    KeyQ: 'Q',
    KeyR: 'R',
    KeyS: 'S',
    KeyT: 'T',
    KeyU: 'U',
    KeyV: 'V',
    KeyW: 'W',
    KeyX: 'X',
    KeyY: 'Y',
    KeyZ: 'Z',

    // 数字键
    Digit1: '1',
    Digit2: '2',
    Digit3: '3',
    Digit4: '4',
    Digit5: '5',
    Digit6: '6',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    Digit0: '0',

    // 功能键
    Escape: 'Esc',
    Enter: 'Enter',
    Tab: 'Tab',
    Backspace: 'Backspace',
    Space: 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    ShiftLeft: 'ShiftLeft',
    ShiftRight: 'ShiftRight',
    ControlLeft: 'Ctrl',
    ControlRight: 'Ctrl',
    AltLeft: 'Alt',
    AltRight: 'Alt',
    MetaLeft: 'Win',
    MetaRight: 'Win',
    ContextMenu: 'Menu',

    // 特殊符号键
    Backquote: '`',
    Minus: '-',
    Equal: '=',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    Comma: ',',
    Period: '.',
    Slash: '/',

    // 数字键盘
    Numpad0: 'num 0',
    Numpad1: 'num 1',
    Numpad2: 'num 2',
    Numpad3: 'num 3',
    Numpad4: 'num 4',
    Numpad5: 'num 5',
    Numpad6: 'num 6',
    Numpad7: 'num 7',
    Numpad8: 'num 8',
    Numpad9: 'num 9',
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.',
    NumpadEnter: 'Enter',
  };

  // 响应式状态
  const activeKeys = ref<Set<string>>(new Set());
  const pressedKeys = ref<string[]>([]);
  const keyHistory = ref<string[]>([]);
  const displayedKeys = ref<string>('');
  const MAX_KEYS_DISPLAY = 145; // 最大显示字符数

  // 处理键盘按下事件
  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();

    let keyCode = event.code;

    // 使用location区分左右Shift键，兼容不同设备的location值差异
    if (event.key === 'Shift') {
      // 优先使用event.code，如果code不可靠则使用location
      if (event.code === 'ShiftLeft' || event.location === 1) {
        keyCode = 'ShiftLeft';
      } else if (event.code === 'ShiftRight' || event.location === 2 || event.location === 0) {
        keyCode = 'ShiftRight';
      } else {
        keyCode = 'Shift';
      }
    }

    // 添加当前按键到活跃按键集合
    activeKeys.value.add(keyCode);

    // 添加到已按下按键数组
    if (!pressedKeys.value.includes(keyCode)) {
      pressedKeys.value.push(keyCode);
    }
  };

  // 更新显示的按键内容
  const updateDisplayedKeys = () => {
    // 在每个按键记录之间添加空格作为间隔
    let fullText = keyHistory.value.join(' ');

    // 如果超出最大长度，删除最先输入的完整<>格式内容块
    if (fullText.length > MAX_KEYS_DISPLAY) {
      // 从数组末尾开始，找到需要保留的记录
      let tempHistory = [...keyHistory.value];
      let tempText = tempHistory.join(' ');

      // 当总长度超过最大限制时，移除最先输入的记录（数组末尾的元素）
      while (tempText.length > MAX_KEYS_DISPLAY && tempHistory.length > 0) {
        tempHistory.pop(); // 移除最后一个元素（最先输入的）
        tempText = tempHistory.join(' ');
      }

      fullText = tempText;
    }

    displayedKeys.value = fullText;
  };

  // 处理键盘释放事件
  const handleKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();

    let keyCode = event.code;

    // 使用location区分左右Shift键，兼容不同设备的location值差异
    if (event.key === 'Shift') {
      // 优先使用event.code，如果code不可靠则使用location
      if (event.code === 'ShiftLeft' || event.location === 1) {
        keyCode = 'ShiftLeft';
      } else if (event.code === 'ShiftRight' || event.location === 2 || event.location === 0) {
        keyCode = 'ShiftRight';
      } else {
        keyCode = 'Shift';
      }
    }

    // 只移除当前释放的按键
    activeKeys.value.delete(keyCode);

    // 从已按下按键数组中移除
    const index = pressedKeys.value.indexOf(keyCode);
    if (index > -1) {
      pressedKeys.value.splice(index, 1);
    }

    // 获取简洁的按键表示
    const keyDisplay = `<${keyCodeMap[keyCode] || keyCode}>`;
    // 添加到按键历史记录（新内容添加到开头）
    keyHistory.value.unshift(keyDisplay);

    // 限制历史记录的长度，避免内存占用过多
    if (keyHistory.value.length > 100) {
      keyHistory.value.pop();
    }

    // 更新显示内容
    updateDisplayedKeys();
  };

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsKeyboardTest'),
        a: t('keyboardTestPurpose'),
        relatedQuestions: [],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsKeyboardTest')];
  });
</script>

<style scoped>
  /* 全局样式 */
  .keyboard-test-container {
    max-width: 100%;
    margin: 0;
    padding: 0px;
    text-align: left;
    color: #ffffff;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 移除移动端滚动，保持键盘左对齐等比缩放 */
  @media (max-width: 1300px) {
    .keyboard-test-container {
      overflow: hidden;
      width: 100%;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* 标题保持居中 */
  .keyboard-test-container h1 {
    text-align: center;
  }

  .keyboard-test-container h1 {
    font-size: 40px;
    margin-bottom: 15px;
  }

  h1 {
    font-size: 36px;
    color: #4caf50;
    margin-bottom: 20px;
  }

  .test-description {
    color: #b0b0b0;
    margin-bottom: 10px;
    font-size: 18px;
  }

  /* 键盘 */
  .keyboard {
    display: flex;
    border-radius: 10px;
    box-shadow:
      0px 0px 20px 1px #111 inset,
      0px 0px 5px 1px #444;
    background-color: #222222;
    padding: 30px;
    gap: 10px;
    /* 移除flex-wrap: wrap，保持固定布局 */
    justify-content: flex-start;
    /* 设置最小宽度，确保布局不换行 */
    min-width: 1100px;
    width: fit-content;
    /* 左对齐显示 */
    margin: 0;
    /* 确保缩放时从左边开始 */
    transform-origin: left top;
  }

  /* 按键 */
  .key {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: #333333;
    box-shadow:
      3px 3px 8px 2px #111,
      -3px -3px 8px 2px #555;
    color: #ffffff;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.1s ease;
    user-select: none;
    position: relative;
    font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
    font-weight: 500;
  }

  .key:hover,
  .key.active {
    background-color: #4caf50;
    box-shadow: 0 0 8px 2px #4caf50;
    color: #ffffff;
  }

  .key:hover .windows-logo::before,
  .key.active .windows-logo::before {
    background-color: #ffffff;
  }

  .key:hover .windows-logo::after,
  .key.active .windows-logo::after {
    background-color: #4caf50;
    box-shadow: 7px 0 0 0 #4caf50;
  }

  .key span:first-child {
    font-size: 10px;
    margin-bottom: 2px;
  }

  /* Windows徽标 */
  .windows-logo {
    width: 22px;
    height: 22px;
    position: relative;
  }

  /* 简化的Windows徽标 - 四个白色方块 */
  .windows-logo::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: #ffffff;
    /* 左上 */
    top: 2px;
    left: 2px;
    /* 右上 */
    box-shadow: 10px 0 0 0 #ffffff;
    /* 左下 */
    box-shadow:
      10px 0 0 0 #ffffff,
      0 10px 0 0 #ffffff;
    /* 右下 */
    box-shadow:
      10px 0 0 0 #ffffff,
      0 10px 0 0 #ffffff,
      10px 10px 0 0 #ffffff;
  }

  /* 空键 */
  .key-empty {
    width: 40px;
    height: 40px;
  }

  /* 区域一：主键盘 */
  .area-1 {
    width: 740px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: baseline;
  }

  /* 区域二：辅助键 */
  .area-2 {
    width: 140px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .area-2-item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* 区域三：数字键盘 */
  .area-3 {
    width: 190px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .area-3-number {
    display: flex;
    gap: 10px;
  }

  .area-3-number-item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }



  .key-history-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 24px; /* 行高等于高度，确保垂直居中 */
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: #333;
    padding: 0 8px; /* 只保留水平内边距 */
    border-radius: 5px;
    border: 1px solid #4caf50;
    text-align: left;
    box-sizing: border-box;
    width: 100%;
    height: 24px; /* 固定精确高度 */
    display: block;
    margin: 0;
    overflow: hidden; /* 确保内容不会溢出 */
    margin-bottom: 15px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* 响应式设计 - 等比例缩放 */
  @media (max-width: 1200px) {
    .keyboard {
      transform: scale(0.9);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 1024px) {
    .keyboard {
      transform: scale(0.75);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 900px) {
    .keyboard {
      transform: scale(0.65);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 800px) {
    .keyboard {
      transform: scale(0.6);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 700px) {
    .keyboard {
      transform: scale(0.5);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 600px) {
    .keyboard {
      transform: scale(0.45);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 500px) {
    .keyboard {
      transform: scale(0.38);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 400px) {
    .keyboard {
      transform: scale(0.3);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }

  @media (max-width: 350px) {
    .keyboard {
      transform: scale(0.25);
      transform-origin: left top;
      margin: 0;
      /* 确保缩放后不被裁剪 */
      width: fit-content;
      min-width: 1100px;
    }
  }


</style>
