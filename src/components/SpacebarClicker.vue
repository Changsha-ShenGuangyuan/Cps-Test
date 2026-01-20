<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import { t } from '../i18n/index';

  // 游戏状态管理
  const clickCount = ref(0); // 总空格点击数量
  const manualClickCount = ref(0); // 手动点击数量
  const autoClickCount = ref(0); // 自动点击数量
  const isPlaying = ref(false); // 游戏是否正在进行
  const autoCPS = ref(0); // 自动每秒点击数
  const lastClickTime = ref(Date.now()); // 上次点击时间
  const manualClickHistory = ref<number[]>([]); // 手动点击历史记录

  // FAQ数据结构
  interface FAQStep {
    id: string;
    title: string;
    content: string;
  }

  interface FAQItem {
    id: string;
    question: string;
    answer: string;
    steps?: FAQStep[];
  }

  const faqs = ref<FAQItem[]>([
    {
      id: 'what-is',
      question: 'faqSpacebarQ1',
      answer: 'faqSpacebarA1',
    },
    {
      id: 'how-to-play',
      question: 'faqSpacebarQ2',
      answer: 'faqSpacebarA2',
      steps: [
        {
          id: 'step-1',
          title: 'faqSpacebarStep1Title',
          content: 'faqSpacebarStep1Content',
        },
        {
          id: 'step-2',
          title: 'faqSpacebarStep2Title',
          content: 'faqSpacebarStep2Content',
        },
      ],
    },
  ]);

  // 空格键按钮状态
  const spacebarAnimating = ref(false);
  const spacebarPressed = ref(false);

  // BUFF类型定义
  interface Buff {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    currentLevel: number;
    maxLevel: number;
    unlocked: boolean;
    effect: () => void;
    interval?: number; // 间隔效果的时间间隔（毫秒）
    effectValue: number; // 效果值
    effectType: 'passive' | 'interval'; // 效果类型：被动或间隔
    priceArray?: number[]; // 价格数组，每个等级对应一个价格
    priceMultiplier?: number; // 价格增长倍数（兼容旧模式）
  }

  // 初始化BUFF列表 - 只存储翻译键，名称和描述在模板中动态翻译
  const buffs = ref<Buff[]>([
    {
      id: 'internZhang',
      name: '', // 动态翻译，模板中使用t('buff.internZhang.name')
      description: '', // 动态翻译，模板中使用t('buff.internZhang.description')
      basePrice: 50, // 从10调整为50
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 2000,
      effectValue: 2, // 调整为2，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.15,
    },
    {
      id: 'roomba',
      name: '',
      description: '',
      basePrice: 100, // 从25调整为100
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 3000,
      effectValue: 3, // 调整为3，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.18,
    },
    {
      id: 'typewriter',
      name: '',
      description: '',
      basePrice: 200, // 从100调整为200
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 5, // 调整为5，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.2,
    },
    {
      id: 'serverFan',
      name: '',
      description: '',
      basePrice: 500, // 从120调整为500
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 8, // 调整为8，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.22,
    },
    {
      id: 'aiScript',
      name: '',
      description: '',
      basePrice: 1000, // 从300调整为1000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 12, // 调整为12，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.24,
    },
    {
      id: 'octopus',
      name: '',
      description: '',
      basePrice: 2500, // 从700调整为2500
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 20, // 调整为20，保持平衡
      effectType: 'interval',
      priceMultiplier: 1.26,
    },
    {
      id: 'quantumTwin',
      name: '',
      description: '',
      basePrice: 5000, // 从1500调整为5000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        // 被动效果，在handleManualClick中处理
      },
      effectValue: 2, // 从1调整为2，被动效果翻倍
      effectType: 'passive',
      // 价格数组：第一次购买便宜，后续逐步增长
      priceArray: [
        5000, // 等级 0 → 1
        15000, // 等级 1 → 2
        45000, // 等级 2 → 3
        135000, // 等级 3 → 4
        405000, // 等级 4 → 5
        1215000, // 等级 5 → 6
        3645000, // 等级 6 → 7
        10935000, // 等级 7 → 8
        32805000, // 等级 8 → 9
        98415000, // 等级 9 → 10
        // 后续等级价格可以继续扩展，或者使用默认的价格倍数计算
      ],
      // 当价格数组不够时，使用价格倍数作为备选
      priceMultiplier: 3,
    },
    {
      id: 'hamsterWheel',
      name: '',
      description: '',
      basePrice: 5000, // 从3500调整为5000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 60, // 从6调整为60，大幅提高效率
      effectType: 'interval',
      priceMultiplier: 1.32,
    },
    {
      id: 'parrot',
      name: '',
      description: '',
      basePrice: 10000, // 从8000调整为10000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 100, // 从10调整为100，大幅提高效率
      effectType: 'interval',
      priceMultiplier: 1.35,
    },
    {
      id: 'brokenArm',
      name: '',
      description: '',
      basePrice: 20000, // 从15000调整为20000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 200, // 从20调整为200，大幅提高效率
      effectType: 'interval',
      priceMultiplier: 1.38,
    },
    {
      id: 'starlink',
      name: '',
      description: '',
      basePrice: 50000, // 从30000调整为50000
      currentLevel: 0,
      maxLevel: 100,
      unlocked: false,
      effect: function () {
        handleAutoClick(this.effectValue);
      },
      interval: 1000,
      effectValue: 500, // 从40调整为500，大幅提高效率
      effectType: 'interval',
      priceMultiplier: 1.4,
    },
  ]);

  // 计算已解锁的BUFF列表
  const unlockedBuffs = computed(() => {
    return buffs.value.filter((buff) => buff.unlocked);
  });

  // 计算BUFF的当前价格
  const getBuffPrice = (buff: Buff): number => {
    if (buff.currentLevel >= buff.maxLevel) return Infinity;

    // 如果有价格数组，使用对应等级的价格
    if (buff.priceArray && buff.priceArray[buff.currentLevel] !== undefined) {
      return buff.priceArray[buff.currentLevel] as number;
    }

    // 否则使用价格倍数计算（兼容旧模式）
    if (buff.priceMultiplier) {
      return Math.floor(buff.basePrice * Math.pow(buff.priceMultiplier, buff.currentLevel));
    }

    // 默认返回基础价格
    return buff.basePrice;
  };

  // 购买BUFF
  const buyBuff = (buff: Buff, element: HTMLElement) => {
    const price = getBuffPrice(buff);
    if (clickCount.value >= price && buff.currentLevel < buff.maxLevel) {
      clickCount.value -= price;
      buff.currentLevel++;

      // 创建购买特效
      createBuyBuffEffect(buff, element);
      // 创建粒子爆发特效
      createBuyBuffParticleEffect(element);

      // 检查是否解锁新BUFF
      checkUnlockBuffs();

      // 保存游戏状态
      saveGameState();
    }
  };

  // 保存自动点击的累积点击数（包括小数）
  const autoClickAccumulator = ref(0);
  // 自动点击的时间间隔（毫秒）
  const AUTO_CLICK_INTERVAL = 100; // 每100ms增加一次点击

  // 游戏状态键名
  const GAME_STATE_KEY = 'spacebarClickerGameState';

  // 保存游戏状态到localStorage
  const saveGameState = () => {
    const gameState = {
      clickCount: clickCount.value,
      manualClickCount: manualClickCount.value,
      autoClickCount: autoClickCount.value,
      buffs: buffs.value.map((buff) => ({
        id: buff.id,
        currentLevel: buff.currentLevel,
        unlocked: buff.unlocked,
      })),
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  };

  // 从localStorage加载游戏状态
  const loadGameState = () => {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);

        // 恢复点击次数
        clickCount.value = gameState.clickCount || 0;
        manualClickCount.value = gameState.manualClickCount || 0;
        autoClickCount.value = gameState.autoClickCount || 0;

        // 恢复BUFF状态
        if (gameState.buffs) {
          gameState.buffs.forEach((savedBuff: any) => {
            const buff = buffs.value.find((b) => b.id === savedBuff.id);
            if (buff) {
              buff.currentLevel = savedBuff.currentLevel || 0;
              buff.unlocked = savedBuff.unlocked || false;
            }
          });
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    }
  };

  // 更新每秒点击数
  const updateClicksPerSecond = () => {
    const now = Date.now();

    // 更新手动CPS
    manualClickHistory.value = manualClickHistory.value.filter((time) => now - time < 1000);

    // 计算自动CPS：所有已购买BUFF的每秒点击贡献之和
    let totalAutoCPS = 0;

    for (const buff of buffs.value) {
      if (buff.currentLevel > 0 && buff.interval) {
        // 计算该BUFF每秒贡献的点击数：(effectValue * 等级) / (间隔秒数)
        const intervalSeconds = buff.interval / 1000;
        const buffCPS = (buff.effectValue * buff.currentLevel) / intervalSeconds;
        totalAutoCPS += buffCPS;
      }
    }

    // 直接更新autoCPS值，不需要平滑过渡
    autoCPS.value = totalAutoCPS;
  };

  // 处理空格键按下
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      spacebarPressed.value = true;
    }
  };

  // 处理空格键松开
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      spacebarPressed.value = false;
      playSpacebarAnimation();
      handleManualClick();
      createClickEffectForKeyboard();
    }
  };

  // 处理手动点击事件
  const handleManualClick = () => {
    if (!isPlaying.value) {
      isPlaying.value = true;
    }

    // 记录点击时间
    const now = Date.now();
    manualClickHistory.value.push(now);
    lastClickTime.value = now;

    // 播放空格键动画
    playSpacebarAnimation();

    // 计算基础点击值
    const baseClickValue = 1;

    // 计算点击倍数（量子纠缠触发器）：每次点击的数值翻倍
    const quantumBuff = buffs.value.find((b) => b.id === 'quantumTwin');
    const clickMultiplier = quantumBuff
      ? Math.pow(quantumBuff.effectValue, quantumBuff.currentLevel)
      : 1;

    // 玩家每次点击的最终值：基础值 * 量子纠缠触发器倍数
    const clickValue = baseClickValue * clickMultiplier;
    manualClickCount.value += clickValue;
    clickCount.value += clickValue;

    // 检查是否解锁新BUFF
    checkUnlockBuffs();

    // 更新每秒点击数
    updateClicksPerSecond();

    // 保存游戏状态
    saveGameState();
  };

  // 为键盘操作创建点击特效
  const createClickEffectForKeyboard = () => {
    // 计算点击倍数（量子纠缠触发器）：每次点击的数值翻倍
    const quantumBuff = buffs.value.find((b) => b.id === 'quantumTwin');
    const clickMultiplier = quantumBuff
      ? Math.pow(quantumBuff.effectValue, quantumBuff.currentLevel)
      : 1;
    const clickValue = 1 * clickMultiplier;

    // 获取按钮中心位置
    const spacebarButton = document.querySelector('.spacebar-button');
    if (!spacebarButton) return;

    const buttonRect = spacebarButton.getBoundingClientRect();

    // 计算按钮中心在窗口中的坐标
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    // 创建特效元素
    const effectElement = document.createElement('div');
    effectElement.className = 'click-effect';
    effectElement.textContent = `+${clickValue}`;

    // 设置位置
    effectElement.style.left = `${centerX}px`;
    effectElement.style.top = `${centerY}px`;

    // 添加到文档body
    document.body.appendChild(effectElement);

    // 动画结束后移除元素
    effectElement.addEventListener('animationend', () => {
      effectElement.remove();
    });

    // 添加备用机制，确保元素被移除
    setTimeout(() => {
      effectElement.remove();
    }, 800);
  };

  // 处理自动点击
  const handleAutoClick = (clickValue: number) => {
    // 更新自动点击计数
    autoClickCount.value += clickValue;
    clickCount.value += clickValue;

    // 更新每秒点击数（只更新手动CPS）
    updateClicksPerSecond();

    // 保存游戏状态
    saveGameState();
  };

  // 播放空格键动画
  const playSpacebarAnimation = () => {
    spacebarAnimating.value = true;
    setTimeout(() => {
      spacebarAnimating.value = false;
    }, 200);
  };

  // 检查是否解锁新BUFF
  const checkUnlockBuffs = () => {
    // 第一个BUFF：点击次数大于10时永久开启
    if (clickCount.value > 10) {
      buffs.value[0]!.unlocked = true;
    }

    // 后续BUFF：只有购买了前一个BUFF，才能解锁下一个
    for (let i = 1; i < buffs.value.length; i++) {
      // 如果当前BUFF未解锁，检查前一个BUFF是否至少有1级
      if (!buffs.value[i]!.unlocked) {
        if (buffs.value[i - 1]!.currentLevel > 0) {
          buffs.value[i]!.unlocked = true;
        }
      }
    }
  };

  // 格式化大数字，添加千分位分隔符
  const formatNumber = (num: number, decimalPlaces: number = 0) => {
    if (num >= 1000000) {
      const formatted = num / 1000000;
      // 智能处理小数位数：如果小数部分为0，只显示整数
      const displayValue = formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1);
      // 为百万级数字也添加千分位分隔符
      return displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'M';
    }

    // 智能处理小数位数：如果小数部分为0，只显示整数
    const displayValue =
      decimalPlaces > 0 && num % 1 !== 0 ? num.toFixed(decimalPlaces) : num.toFixed(0);
    // 为普通数字添加千分位分隔符
    return displayValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 格式化文本，将换行符转换为<br>标签
  const formatAnswer = (answer: string) => {
    // 将答案转换为HTML，替换换行符
    return answer.replace(/\n/g, '<br>');
  };

  // 高亮description中的阿拉伯数字
  const highlightDescription = (text: string) => {
    // 匹配阿拉伯数字的模式
    const result = text.replace(/(\d+)/g, '<span class="highlight-value">$1</span>');
    return result;
  };

  // 创建点击特效
  const createClickEffect = (event: MouseEvent) => {
    // 计算点击倍数（量子纠缠触发器）：每次点击的数值翻倍
    const quantumBuff = buffs.value.find((b) => b.id === 'quantumTwin');
    const clickMultiplier = quantumBuff
      ? Math.pow(quantumBuff.effectValue, quantumBuff.currentLevel)
      : 1;
    const clickValue = 1 * clickMultiplier;

    // 创建特效元素
    const effectElement = document.createElement('div');
    effectElement.className = 'click-effect';
    effectElement.textContent = `+${clickValue}`;

    // 设置精确位置
    effectElement.style.left = `${event.clientX}px`;
    effectElement.style.top = `${event.clientY}px`;

    // 添加到文档body
    document.body.appendChild(effectElement);

    // 动画结束后移除元素
    effectElement.addEventListener('animationend', () => {
      effectElement.remove();
    });

    // 添加备用机制，确保元素被移除
    setTimeout(() => {
      effectElement.remove();
    }, 800);
  };

  // 创建BUFF购买特效
  const createBuyBuffEffect = (buff: Buff, element: HTMLElement) => {
    // 获取BUFF卡片的位置信息
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 创建特效元素
    const effectElement = document.createElement('div');
    effectElement.className = 'buy-buff-effect';
    effectElement.innerHTML = `
      <span class="buff-name">${t(`buff.${buff.id}.name`)}</span>
      <span class="buff-level-up">+1</span>
    `;

    // 设置位置
    effectElement.style.left = `${centerX}px`;
    effectElement.style.top = `${centerY}px`;

    // 添加到文档body
    document.body.appendChild(effectElement);

    // 动画结束后移除元素
    effectElement.addEventListener('animationend', () => {
      effectElement.remove();
    });

    // 添加备用机制，确保元素被移除
    setTimeout(() => {
      effectElement.remove();
    }, 1000);
  };

  // 创建BUFF购买粒子爆发特效
  const createBuyBuffParticleEffect = (element: HTMLElement) => {
    // 获取BUFF卡片的位置信息
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 创建粒子容器
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);

    // 创建粒子
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'buy-particle';

      // 设置随机颜色
      const colors = ['#4caf50', '#ffd700', '#2196f3', '#ff4081', '#9c27b0'];
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)] || '#4caf50';

      // 设置随机大小
      const size = Math.random() * 6 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // 设置起始位置
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      // 设置随机方向和距离
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = Math.random() * 100 + 50;
      const translateX = Math.cos(angle) * distance;
      const translateY = Math.sin(angle) * distance;

      // 设置动画
      particle.style.setProperty('--translate-x', `${translateX}px`);
      particle.style.setProperty('--translate-y', `${translateY}px`);

      // 添加到容器
      particlesContainer.appendChild(particle);
    }

    // 动画结束后移除容器
    setTimeout(() => {
      particlesContainer.remove();
    }, 1000);
  };

  // 每秒更新一次点击速度
  let cpsUpdateTimer: number;
  // 全局自动点击定时器
  let globalAutoClickTimer: number;

  // 组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 加载游戏状态
    loadGameState();

    // 更新每秒点击速度
    updateClicksPerSecond();

    // 每秒更新一次点击速度
    cpsUpdateTimer = window.setInterval(updateClicksPerSecond, 100);

    // 设置全局自动点击定时器，每100ms触发一次，实现平滑增加
    globalAutoClickTimer = window.setInterval(() => {
      // 根据当前autoCPS计算这段时间应增加的点击数
      // autoCPS是每秒点击数，所以每100ms增加的点击数是 autoCPS * 0.1
      const clicksToAdd = autoCPS.value * (AUTO_CLICK_INTERVAL / 1000);

      // 只有当有点击数要增加时才处理
      if (clicksToAdd > 0) {
        // 将点击数添加到累积器
        autoClickAccumulator.value += clicksToAdd;

        // 计算本次应增加的整数点击数
        const integerClicks = Math.floor(autoClickAccumulator.value);

        // 如果有整数点击数，就增加到总点击数
        if (integerClicks > 0) {
          handleAutoClick(integerClicks);
          // 从累积器中减去已增加的整数点击数
          autoClickAccumulator.value -= integerClicks;
        }
      }
    }, AUTO_CLICK_INTERVAL);
  });

  // 组件卸载时移除事件监听和定时器
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    // 清除CPS更新定时器
    clearInterval(cpsUpdateTimer);

    // 清除全局自动点击定时器
    clearInterval(globalAutoClickTimer);
  });
</script>

<template>
  <div class="spacebar-clicker-container">
    <!-- 点击计数显示 -->
    <div class="click-counter">
      <div class="click-number">{{ formatNumber(clickCount) }}</div>
      <div class="cps-display">
        <span class="cps-item auto-cps"
          >{{ t('perSecond') }}: <span class="cps-value">{{ formatNumber(autoCPS, 1) }}</span></span
        >
      </div>
    </div>

    <!-- 大型空格键按钮 -->
    <div class="spacebar-section">
      <div ref="clickEffectsContainer" class="click-effects-container"></div>
      <button
        class="spacebar-button"
        :class="{ animating: spacebarAnimating, pressed: spacebarPressed }"
        @contextmenu.prevent=""
        @mousedown="spacebarPressed = true"
        @mouseup="
          spacebarPressed = false;
          playSpacebarAnimation();
          handleManualClick();
          createClickEffect($event);
        "
        @mouseleave="spacebarPressed = false"
      >
        <span class="spacebar-text">{{ t('spacebar') }}</span>
      </button>
    </div>

    <!-- BUFF列表 -->
    <div class="buffs-section">
      <div class="buffs-content">
        <div class="buffs-grid">
          <div
            v-for="buff in unlockedBuffs"
            :id="`buff-${buff.id}`"
            :key="buff.id"
            class="buff-card"
            :class="{
              'max-level': buff.currentLevel >= buff.maxLevel,
              'not-enough': clickCount < getBuffPrice(buff) && buff.currentLevel < buff.maxLevel,
            }"
            @click="
              clickCount >= getBuffPrice(buff) &&
              buff.currentLevel < buff.maxLevel &&
              buyBuff(buff, $event.currentTarget as HTMLElement)
            "
          >
            <div class="buff-header">
              <h3>{{ t(`buff.${buff.id}.name`) }}</h3>
              <div class="buff-count">
                <span class="buff-x">x</span>
                <span class="buff-level">{{ buff.currentLevel }}</span>
              </div>
            </div>
            <p
              class="buff-description"
              v-html="highlightDescription(t(`buff.${buff.id}.description`))"
            ></p>
            <div class="buff-footer">
              <div class="buff-price">
                <span>{{ formatNumber(getBuffPrice(buff)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ部分 -->
    <div class="faq-section">
      <div class="faq-container-alt">
        <div
          v-for="(faq, index) in faqs"
          :key="faq.id"
          class="faq-item-alt"
          :class="{
            'faq-item-alt-1': index % 2 === 0,
            'faq-item-alt-2': index % 2 === 1,
          }"
        >
          <h3 class="faq-question-alt">{{ t(faq.question) }}</h3>
          <div class="faq-content-alt">
            <p class="faq-answer-alt" v-html="formatAnswer(t(faq.answer))"></p>

            <!-- 如果有步骤，显示步骤列表 -->
            <div v-if="faq.steps && faq.steps.length > 0" class="faq-steps-alt">
              <div v-for="(step, stepIndex) in faq.steps" :key="step.id" class="faq-step-item-alt">
                <div class="faq-step-number">{{ stepIndex + 1 }}</div>
                <div class="faq-step-content-wrapper">
                  <h4 class="faq-step-title-alt">{{ t(step.title) }}</h4>
                  <p class="faq-step-content-alt" v-html="formatAnswer(t(step.content))"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .spacebar-clicker-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    text-align: center;
    min-height: 100vh;
    color: white;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #000000;
    border-radius: 10px;
  }

  /* 点击计数显示 */
  .click-counter {
    margin-bottom: 40px;
  }

  .click-number {
    font-size: 120px;
    font-weight: bold;
    color: #4caf50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    margin-bottom: 10px;
    line-height: 1;
    font-family: 'Courier New', monospace;
  }

  /* CPS显示样式 */
  .cps-display {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: -10px;
    font-family: 'Courier New', monospace;
  }

  .cps-item {
    font-size: 24px;
    font-weight: bold;
    color: white;
  }

  .auto-cps {
    color: white;
  }

  .cps-value {
    color: #4caf50;
    font-weight: bold;
  }

  /* 空格键按钮 */
  .spacebar-section {
    margin-bottom: 45px;
    display: flex;
    justify-content: center;
    position: relative;
  }

  /* 点击特效容器 */
  .click-effects-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
  }

  /* 点击特效样式 - 全局样式，用于动态添加的元素 */
  :global(.click-effect) {
    position: fixed;
    font-size: 24px;
    font-weight: bold;
    color: #4caf50;
    text-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
    /* 确保从点击位置开始 */
    transform: translate(-50%, -50%);
    /* 落叶飘落效果动画 */
    animation: clickEffect 1.2s ease-in-out forwards;
    z-index: 10000;
    pointer-events: none;
    font-family: 'Courier New', monospace;
    /* 确保动画流畅 */
    will-change: transform, opacity;
  }

  /* 点击特效动画 - 落叶飘落效果，平滑渐变消失 */
  @keyframes clickEffect {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(0deg) scale(1);
    }
    10% {
      opacity: 1;
      transform: translate(-65%, -65px) rotate(-5deg) scale(1.05);
    }
    20% {
      opacity: 0.9;
      transform: translate(-35%, -80px) rotate(3deg) scale(1.1);
    }
    30% {
      opacity: 0.8;
      transform: translate(-70%, -95px) rotate(-7deg) scale(1.15);
    }
    40% {
      opacity: 0.7;
      transform: translate(-30%, -110px) rotate(5deg) scale(1.2);
    }
    50% {
      opacity: 0.6;
      transform: translate(-60%, -125px) rotate(-9deg) scale(1.25);
    }
    60% {
      opacity: 0.5;
      transform: translate(-40%, -140px) rotate(7deg) scale(1.3);
    }
    70% {
      opacity: 0.4;
      transform: translate(-55%, -160px) rotate(-11deg) scale(1.35);
    }
    80% {
      opacity: 0.3;
      transform: translate(-45%, -180px) rotate(9deg) scale(1.4);
    }
    90% {
      opacity: 0.15;
      transform: translate(-50%, -190px) rotate(-5deg) scale(1.45);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -200px) rotate(0deg) scale(1.5);
    }
  }

  /* BUFF购买特效样式 - 全局样式，用于动态添加的元素 */
  :global(.buy-buff-effect) {
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: translate(-50%, -50%);
    /* 购买特效动画 */
    animation: buyBuffEffect 1s ease-in-out forwards;
    z-index: 10001;
    pointer-events: none;
    font-family: 'Courier New', monospace;
    /* 确保动画流畅 */
    will-change: transform, opacity, filter;
  }

  /* BUFF名称样式 */
  :global(.buff-name) {
    font-size: 18px;
    font-weight: bold;
    color: #4caf50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.8);
    margin-bottom: 5px;
  }

  /* 等级提升样式 */
  :global(.buff-level-up) {
    font-size: 32px;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.9);
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
    padding: 10px 20px;
    border-radius: 50%;
  }

  /* BUFF购买特效动画 */
  @keyframes buyBuffEffect {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
      filter: brightness(0.5) blur(5px);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
      filter: brightness(1.5) blur(0px);
    }
    40% {
      transform: translate(-50%, -50%) scale(0.95) rotate(-3deg);
      filter: brightness(1.2) blur(0px);
    }
    60% {
      transform: translate(-50%, -50%) scale(1.1) rotate(2deg);
      filter: brightness(1.3) blur(0px);
    }
    80% {
      opacity: 1;
      transform: translate(-50%, -70px) scale(1) rotate(0deg);
      filter: brightness(1.1) blur(0px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -100px) scale(0.8) rotate(0deg);
      filter: brightness(0.8) blur(3px);
    }
  }

  /* 粒子容器样式 */
  :global(.particles-container) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10000;
  }

  /* 粒子样式 */
  :global(.buy-particle) {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: buyParticleEffect 1s ease-out forwards;
    will-change: transform, opacity;
  }

  /* 粒子动画 */
  @keyframes buyParticleEffect {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.5);
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--translate-x)), calc(-50% + var(--translate-y)))
        scale(0);
    }
  }

  .spacebar-button {
    width: 80%;
    max-width: 800px;
    height: 120px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 28px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.1s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    text-transform: uppercase;
    letter-spacing: 4px;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spacebar-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.7;
  }

  .spacebar-button::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.7;
  }

  .spacebar-button:focus {
    outline: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .spacebar-button:hover {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  .spacebar-button.pressed {
    background: linear-gradient(90deg, #5a6fd8 0%, #6a4190 100%);
    transform: scale(0.97) translateY(3px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transition: all 0.1s ease;
  }

  .spacebar-button.animating {
    animation: release 0.1s ease;
  }

  @keyframes release {
    0% {
      transform: scale(0.97) translateY(3px);
      background: linear-gradient(90deg, #5a6fd8 0%, #6a4190 100%);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    100% {
      transform: scale(1) translateY(0);
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
  }

  .spacebar-text {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  /* BUFF列表容器 */
  .buffs-section {
    width: 100%;
    margin: -20px auto 0;
    display: flex;
    justify-content: center;
  }

  /* BUFF列表内容 */
  .buffs-content {
    max-width: 850px;
    width: 100%;
    max-height: 550px; /* 限制高度，最多显示4个BUFF */
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 10px;
  }

  /* 自定义滚动条样式 */
  .buffs-content::-webkit-scrollbar {
    width: 8px;
  }

  .buffs-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .buffs-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  .buffs-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .buffs-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 40px;
    padding-top: 10px;
    width: 100%;
    box-sizing: border-box;
  }

  .buff-card {
    background-color: rgba(0, 0, 0, 0.35);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 15px;
    text-align: left;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .buff-card:hover {
    transform: translateY(-5px);
    border-color: #4caf50;
    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.15);
  }

  .buff-card.locked {
    opacity: 0.6;
    filter: grayscale(100%);
  }

  .buff-card.max-level {
    border-color: #ffd700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
  }

  .buff-card.max-level:hover {
    border-color: #ffd700;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.25);
  }

  .buff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .buff-header h3 {
    font-size: 18px;
    color: #4caf50;
    margin: 0;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }

  .buff-count {
    color: #4caf50;
    padding: 3px 12px;
    border-radius: 15px;
    font-weight: bold;
    font-family: 'Courier New', monospace;
    display: inline-flex;
    align-items: baseline;
    gap: 2px;
    background-color: rgba(76, 175, 80, 0.1);
  }

  .buff-x {
    font-size: 12px;
    opacity: 0.8;
  }

  .buff-level {
    font-size: 20px;
    font-weight: bold;
    text-shadow:
      0 2px 4px rgba(76, 175, 80, 0.5),
      0 0 10px rgba(76, 175, 80, 0.3);
  }

  .buff-description {
    color: #ddd;
    font-size: 13px;
    margin-bottom: 8px;
    line-height: 1.4;
    font-family: 'Arial', sans-serif;
  }

  :deep(.highlight-value) {
    color: #4caf50;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }

  .buff-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .buff-price {
    font-size: 16px;
    font-weight: bold;
    color: white;
    font-family: 'Courier New', monospace;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .buff-price {
    display: flex;
    align-items: center;
  }

  .buff-price span {
    transform: translateY(1px);
  }

  .buff-price::before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
    margin-right: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  /* 添加BUFF卡片点击效果 */
  .buff-card {
    cursor: pointer;
  }

  .buff-card.locked {
    cursor: not-allowed;
  }

  .buff-card.max-level {
    cursor: not-allowed;
  }

  /* 点击次数不足时的样式 */
  .buff-card.not-enough {
    cursor: not-allowed;
    position: relative;
    filter: grayscale(80%);
    opacity: 0.7;
    transition: all 0.3s ease;
    user-select: none;
    pointer-events: none;
  }

  .buff-card.not-enough::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    pointer-events: none;
    z-index: 1;
  }

  /* 确保内容在蒙板之上 */
  .buff-card > * {
    position: relative;
    z-index: 2;
  }

  /* BUFF卡片样式 */
  .buff-card {
    position: relative;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease,
      background-color 0.3s ease;
    z-index: 1;
  }

  /* BUFF卡片悬停效果 */
  .buff-card:hover {
    transform: translateY(-5px);
    border-color: #4caf50;
    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 5;
  }

  /* 修复点击数不足时的闪烁特效消失问题：添加闪烁动画 */
  .buff-card:hover:not(.max-level):not(.not-enough) {
    animation: cardBlink 1.5s ease-in-out infinite;
  }

  @keyframes cardBlink {
    0%,
    100% {
      box-shadow:
        0 10px 30px rgba(76, 175, 80, 0.2),
        0 0 0 rgba(76, 175, 80, 0);
    }
    50% {
      box-shadow:
        0 10px 30px rgba(76, 175, 80, 0.2),
        0 0 20px rgba(76, 175, 80, 0.5);
    }
  }

  /* 响应式设计 */
  /* 超大屏幕设备 */
  @media (min-width: 1200px) {
    .spacebar-clicker-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .buffs-content {
      max-width: 1000px;
    }

    .buff-card {
      max-width: 900px;
    }
  }

  /* 大屏幕设备 */
  @media (max-width: 1199px) and (min-width: 992px) {
    .spacebar-clicker-container {
      max-width: 980px;
      margin: 0 auto;
    }

    .buffs-content {
      max-width: 850px;
    }

    .buff-card {
      max-width: 800px;
    }
  }

  /* 中等屏幕设备 */
  @media (max-width: 991px) and (min-width: 769px) {
    .spacebar-clicker-container {
      max-width: 750px;
      margin: 0 auto;
    }

    .buffs-content {
      max-width: 700px;
    }

    .buff-card {
      max-width: 650px;
    }

    .spacebar-button {
      width: 85%;
      max-width: 700px;
    }

    .click-number {
      font-size: 100px;
    }
  }

  /* 平板设备 */
  @media (max-width: 768px) {
    .spacebar-clicker-container {
      padding: 20px 15px;
    }

    .spacebar-section {
      margin-bottom: 40px;
    }

    .spacebar-button {
      width: 95%;
      height: 100px;
      font-size: 26px;
      letter-spacing: 2px;
      border: none;
      border-radius: 12px;
      margin-top: -10px;
    }

    .click-number {
      font-size: 80px;
    }

    .cps-item {
      font-size: 20px;
    }

    .buffs-content {
      max-width: 100%;
      margin: -10px auto 0;
      padding-right: 10px;
    }

    .buff-card {
      padding: 12px;
    }

    .buff-header h3 {
      font-size: 16px;
    }

    .buff-count {
      font-size: 13px;
      padding: 3px 10px;
    }

    .buff-level {
      font-size: 18px;
    }

    .buff-description {
      font-size: 12px;
      margin-bottom: 6px;
    }

    .buff-footer {
      padding: 5px 8px;
    }

    .buff-price {
      font-size: 14px;
    }

    .buff-price::before {
      width: 24px;
      height: 14px;
    }
  }

  /* 小屏手机设备 */
  @media (max-width: 480px) {
    .spacebar-clicker-container {
      padding: 15px 10px;
    }

    .click-number {
      font-size: 60px;
    }

    .cps-item {
      font-size: 18px;
    }

    .cps-display {
      gap: 15px;
    }

    .spacebar-section {
      margin-bottom: 30px;
    }

    .spacebar-button {
      height: 85px;
      font-size: 22px;
      letter-spacing: 1px;
      margin-top: -8px;
    }

    .buffs-content {
      margin: -8px auto 0;
      max-height: 450px;
      padding-right: 10px;
    }

    .buff-card {
      padding: 10px;
    }

    .buff-header {
      margin-bottom: 4px;
    }

    .buff-header h3 {
      font-size: 15px;
    }

    .buff-count {
      padding: 2px 8px;
    }

    .buff-level {
      font-size: 16px;
    }

    .buff-description {
      font-size: 11px;
      margin-bottom: 5px;
    }

    .buff-price {
      font-size: 13px;
      gap: 3px;
    }

    .buff-price::before {
      width: 22px;
      height: 12px;
    }
  }

  /* FAQ样式 */
  .faq-section {
    width: 100%;
    margin: 40px auto 0;
    padding: 0;
    background-color: transparent;
    box-shadow: none;
  }

  /* 第二种FAQ布局 - 无图标设计 */
  .faq-container-alt {
    display: grid;
    gap: 30px;
    max-width: 850px;
    margin: 0 auto;
  }

  .faq-item-alt {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }

  /* 多样化样式 - 项目样式1 */
  .faq-item-alt-1 {
    border-left: 4px solid #4caf50;
    border-top: none;
  }

  .faq-item-alt-1:hover {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.2);
    border-color: rgba(76, 175, 80, 0.5);
  }

  /* 多样化样式 - 项目样式2 */
  .faq-item-alt-2 {
    border-left: 4px solid #667eea;
    border-top: none;
  }

  .faq-item-alt-2:hover {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }

  .faq-question-alt {
    font-size: 20px;
    font-weight: bold;
    color: white;
    margin: 0;
    padding: 20px 25px;
    background: rgba(255, 255, 255, 0.03);
    font-family: 'Courier New', monospace;
    cursor: pointer;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .faq-item-alt-1 .faq-question-alt {
    color: #4caf50;
  }

  .faq-item-alt-2 .faq-question-alt {
    color: #667eea;
  }

  .faq-question-alt:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .faq-content-alt {
    padding: 0 25px 25px;
    box-sizing: border-box;
  }

  .faq-answer-alt {
    font-size: 15px;
    line-height: 1.6;
    color: #e0e0e0;
    margin: 0 0 20px 0;
    padding: 20px 0 0;
    box-sizing: border-box;
  }

  /* 步骤列表样式 - 无图标设计 */
  .faq-steps-alt {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 0;
    margin: 0;
  }

  .faq-step-item-alt {
    display: flex;
    gap: 15px;
    align-items: flex-start;
    position: relative;
    padding: 0;
    margin: 0;
  }

  .faq-step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 3px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .faq-item-alt-1 .faq-step-number {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
  }

  .faq-item-alt-2 .faq-step-number {
    background: linear-gradient(135deg, #667eea, #5a6fd8);
    color: white;
  }

  .faq-step-content-wrapper {
    flex: 1;
    min-width: 0;
  }

  .faq-step-title-alt {
    font-size: 17px;
    font-weight: bold;
    color: #ffffff;
    margin: 0 0 8px 0;
    font-family: 'Courier New', monospace;
    box-sizing: border-box;
  }

  .faq-step-content-alt {
    font-size: 14px;
    line-height: 1.6;
    color: #cccccc;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    word-wrap: break-word;
  }

  /* FAQ响应式设计 - 无图标布局 */
  @media (max-width: 768px) {
    .faq-section {
      margin: 30px auto 0;
    }

    .faq-container-alt {
      gap: 25px;
    }

    .faq-question-alt {
      font-size: 18px;
      padding: 18px 20px;
    }

    .faq-content-alt {
      padding: 0 20px 20px;
    }

    .faq-answer-alt {
      font-size: 14px;
      padding: 18px 0 0;
    }

    .faq-step-item-alt {
      gap: 12px;
    }

    .faq-step-number {
      width: 26px;
      height: 26px;
      font-size: 14px;
    }

    .faq-step-title-alt {
      font-size: 16px;
    }

    .faq-step-content-alt {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    .faq-section {
      margin: 25px auto 0;
    }

    .faq-container-alt {
      gap: 20px;
    }

    .faq-question-alt {
      font-size: 17px;
      padding: 15px 18px;
    }

    .faq-content-alt {
      padding: 0 18px 18px;
    }

    .faq-answer-alt {
      font-size: 13px;
      padding: 15px 0 0;
    }

    .faq-step-item-alt {
      gap: 10px;
    }

    .faq-step-number {
      width: 24px;
      height: 24px;
      font-size: 13px;
    }

    .faq-step-title-alt {
      font-size: 15px;
    }

    .faq-step-content-alt {
      font-size: 12px;
    }
  }
</style>
