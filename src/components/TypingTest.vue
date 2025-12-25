<script setup lang="ts">
  import { ref, computed, onUnmounted, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { t } from '../i18n'; // 导入翻译函数
  // 导入通用FAQ组件
  import FAQComponent from './FAQComponent.vue';
  // 导入相关测试推荐组件
  import RelatedTests from './RelatedTests.vue';

  // 组件功能：打字速度测试，支持不同时长

  // 组件属性
  const props = defineProps<{
    time: string; // 测试时长（分钟）
  }>();

  // 路由实例，用于重定向
  const router = useRouter();

  // 支持的测试时间数组（分钟）
  const supportedTimes = [1, 3, 5, 10, 15];

  // 参数验证：验证时间参数是否有效
  const validateTimeParam = () => {
    const parsedTime = parseInt(props.time);
    // 检查 parsedTime 是否为有效数字且在支持的时间列表中
    if (isNaN(parsedTime) || !supportedTimes.includes(parsedTime)) {
      // 如果时间参数无效，重定向到404页面
      router.replace('/404');
    }
  };

  // 组件挂载时验证参数
  onMounted(() => {
    validateTimeParam();
  });

  // 监听props变化，重新验证参数
  watch(
    () => props.time,
    () => {
      validateTimeParam();
    }
  );

  // 获取当前FAQ内容
  const currentFaq = computed(() => {
    return [
      {
        q: t('whatIsTypingTest'),
        a: t('whatIsTypingTestDesc'),
        relatedQuestions: [t('whatIsTypingTestUse'), t('howToImproveTypingSpeed')],
      },
      {
        q: t('whatIsTypingTestUse'),
        a: t('whatIsTypingTestUseDesc'),
        relatedQuestions: [t('whatIsTypingTest'), t('whatIsWPM')],
      },
      {
        q: t('howToImproveTypingSpeed'),
        a: t('howToImproveTypingSpeedDesc'),
        relatedQuestions: [t('whatIsTypingTest'), t('whatIsGoodAccuracy')],
      },
      {
        q: t('whatIsWPM'),
        a: t('whatIsWPMDesc'),
        relatedQuestions: [t('whatIsTypingTestUse'), t('whatIsGoodAccuracy')],
      },
      {
        q: t('whatIsGoodAccuracy'),
        a: t('whatIsGoodAccuracyDesc'),
        relatedQuestions: [t('howToImproveTypingSpeed'), t('whatIsWPM')],
      },
    ];
  });

  // 热门问题列表
  const popularQuestions = computed(() => {
    return [t('whatIsTypingTest'), t('whatIsWPM'), t('howToImproveTypingSpeed')];
  });

  // 状态管理
  const isPlaying = ref(false); // 游戏是否正在进行中
  const isGameOver = ref(false); // 游戏是否结束
  const gameTime = ref(parseInt(props.time) * 60); // 游戏时长（秒）
  const remainingTime = ref(gameTime.value); // 剩余时间（秒）
  const inputText = ref(''); // 用户输入的文本
  const typedChars = ref(0); // 当前已输入字符数
  const correctChars = ref(0); // 当前正确输入字符数
  const errorChars = ref(0); // 当前错误输入字符数
  const totalTypedChars = ref(0); // 总累积已输入字符数
  const totalCorrectChars = ref(0); // 总累积正确字符数
  const totalErrorChars = ref(0); // 总累积错误字符数
  const wpm = ref(0); // 每分钟单词数
  const accuracy = ref(100); // 准确率
  const gameTimer = ref<number | null>(null); // 游戏倒计时定时器
  const showCelebration = ref(false); // 是否显示庆祝动画

  // 重置游戏数据
  const resetGameData = () => {
    // 清除定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }

    // 重置游戏状态
    isPlaying.value = false;
    isGameOver.value = false;
    showCelebration.value = false;
    gameTime.value = parseInt(props.time) * 60;
    remainingTime.value = gameTime.value;
    inputText.value = '';
    typedChars.value = 0;
    correctChars.value = 0;
    errorChars.value = 0;
    totalTypedChars.value = 0;
    totalCorrectChars.value = 0;
    totalErrorChars.value = 0;
    wpm.value = 0;
    accuracy.value = 100;

    // 重新选择随机文本
    currentText.value = textLibrary[Math.floor(Math.random() * textLibrary.length)];
  };

  // 监听props变化，当time改变时重置游戏数据
  watch(
    () => props.time,
    () => {
      resetGameData();
    }
  );

  // 随机文本库
  const textLibrary = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. It's commonly used for testing typing speed and accuracy.",
    'Programming is the art of telling a computer what to do. It requires logical thinking and problem-solving skills. Practice makes perfect when it comes to coding.',
    'Reading books is a great way to expand your knowledge and improve your vocabulary. It can transport you to different worlds and introduce you to new ideas.',
    'Exercise is important for maintaining good health. It strengthens your muscles, improves your cardiovascular system, and boosts your mood.',
    'Traveling allows you to experience different cultures, try new foods, and meet interesting people. It broadens your perspective on life.',
    "Music has the power to evoke emotions and create memories. It can calm you down when you're stressed or energize you when you're feeling tired.",
    "Cooking is a useful skill that can save you money and help you eat healthier. It's also a fun activity to do with friends and family.",
    'Science has made incredible advancements over the years, from space exploration to medical breakthroughs. It continues to push the boundaries of what we know.',
    'Art comes in many forms, including painting, sculpture, music, and literature. It allows people to express themselves creatively.',
    "Technology is constantly evolving, changing the way we live, work, and communicate. It's important to stay updated with the latest trends and developments.",
    'Education is the key to unlocking your potential. It provides you with the knowledge and skills needed to succeed in life.',
    'Nature is full of beauty and wonder. Spending time outdoors can reduce stress and improve your overall well-being.',
    'Friendship is one of the most valuable things in life. Good friends support you, make you laugh, and share your joys and sorrows.',
    'History teaches us valuable lessons about the past, helping us understand the present and prepare for the future.',
    'Mathematics is the language of the universe. It helps us understand patterns, solve problems, and make sense of the world around us.',
    "Philosophy encourages us to think deeply about life's big questions, such as the meaning of existence, morality, and truth.",
    'Astronomy explores the vastness of space, studying stars, planets, galaxies, and the origins of the universe.',
    'Biology is the study of life, from the smallest cells to the largest ecosystems. It helps us understand how living organisms function and evolve.',
    'Chemistry is the science of matter and its transformations. It plays a crucial role in medicine, materials science, and environmental protection.',
    'Physics seeks to explain the fundamental laws of nature, from the behavior of subatomic particles to the motion of galaxies.',
    'Literature allows us to experience different perspectives and emotions. It can inspire, challenge, and entertain us.',
    'The internet has revolutionized communication and access to information. It has transformed how we learn, work, and connect with others.',
    'Climate change is one of the most pressing issues facing our planet today. It requires global cooperation and urgent action.',
    'Renewable energy sources, such as solar and wind power, offer a sustainable alternative to fossil fuels.',
    "Biodiversity is essential for maintaining healthy ecosystems. Protecting endangered species and habitats is crucial for our planet's future.",
    'Mental health is just as important as physical health. Taking care of your mind is essential for overall well-being.',
    "Creativity is the ability to generate new ideas and solutions. It's important in all fields, from art and design to science and business.",
    'Teamwork is essential for achieving common goals. It allows individuals to combine their strengths and work together effectively.',
    'Leadership involves inspiring and guiding others towards a shared vision. Good leaders are empathetic, decisive, and supportive.',
    'Ethics is the study of moral principles that govern human behavior. It helps us make decisions that are fair, just, and responsible.',
    'Communication is key to building strong relationships. It involves listening actively, speaking clearly, and expressing yourself effectively.',
    'Time management is the ability to plan and organize your time effectively. It helps you be more productive and reduce stress.',
    "Critical thinking involves analyzing information, evaluating arguments, and making reasoned judgments. It's an essential skill for navigating the modern world.",
    "Adaptability is the ability to adjust to new situations and challenges. It's an important skill in a rapidly changing world.",
    'Resilience is the ability to bounce back from setbacks and adversity. It helps you overcome challenges and keep moving forward.',
    "Empathy is the ability to understand and share the feelings of others. It's essential for building meaningful connections and fostering kindness.",
    'Gratitude involves recognizing and appreciating the good things in life. It can improve your mood and overall well-being.',
    'Curiosity drives learning and discovery. It encourages you to ask questions, explore new ideas, and seek out new experiences.',
    "Patience is the ability to wait calmly for something without getting frustrated. It's an important virtue in many aspects of life.",
    'Honesty is the foundation of trust. Being truthful and transparent in your interactions with others builds strong, lasting relationships.',
    'Courage is the ability to face fear, danger, or difficulty with bravery. It allows you to take risks and pursue your goals.',
    'Generosity involves giving freely to others without expecting anything in return. It can bring joy to both the giver and the receiver.',
    'Humility is the quality of being humble and modest. It involves recognizing your limitations and valuing the contributions of others.',
    'Integrity means acting in accordance with your values and principles. It involves being honest, reliable, and consistent in your actions.',
    'Optimism is the tendency to see the positive side of things. It can help you cope with challenges and maintain a positive outlook on life.',
    "Persistence is the quality of continuing to try despite difficulties or setbacks. It's essential for achieving long-term goals.",
    "Self-discipline is the ability to control your impulses and follow through on your commitments. It's key to achieving success in many areas of life.",
    'Confidence is the belief in your own abilities. It allows you to take on challenges and pursue your dreams.',
    "Kindness involves being friendly, generous, and considerate towards others. It can make a big difference in someone's day.",
    'Respect is treating others with dignity and consideration. It involves valuing differences and recognizing the worth of every individual.',
  ];

  // 当前测试文本
  const currentText = ref(textLibrary[Math.floor(Math.random() * textLibrary.length)]);

  // 计算属性：格式化剩余时间
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // 计算属性：当前输入位置
  // const currentPosition = computed(() => {
  //   // 当前输入位置，用于高亮下一个待输入字符
  //   return inputText.value.length
  // })

  // 计算属性：是否所有文本都已输入
  const isTextCompleted = computed(
    () => inputText.value.length >= (currentText.value?.length ?? 0)
  );

  // 开始游戏
  const startGame = () => {
    // 重置游戏状态
    isPlaying.value = true;
    isGameOver.value = false;
    remainingTime.value = gameTime.value;
    inputText.value = '';
    typedChars.value = 0;
    correctChars.value = 0;
    errorChars.value = 0;
    totalTypedChars.value = 0;
    totalCorrectChars.value = 0;
    totalErrorChars.value = 0;
    wpm.value = 0;
    accuracy.value = 100;

    // 不重新选择随机文本，使用页面初始显示的文本

    // 设置游戏定时器
    gameTimer.value = window.setInterval(() => {
      remainingTime.value--;

      // 更新 WPM
      updateWPM();

      // 检查游戏是否结束（只检查时间，文本完成时自动生成新内容）
      if (remainingTime.value <= 0) {
        endGame();
      }
    }, 1000) as unknown as number;
  };

  // 结束游戏
  const endGame = () => {
    // 清除定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }

    // 将当前输入的文本计入累积统计数据
    totalTypedChars.value += typedChars.value;
    totalCorrectChars.value += correctChars.value;
    totalErrorChars.value += errorChars.value;

    // 更新最终数据
    updateWPM();

    // 更新游戏状态
    isPlaying.value = false;
    isGameOver.value = true;
  };

  // 更新 WPM
  const updateWPM = () => {
    // 计算总累积字符数（包括当前输入的字符）
    const totalChars = totalTypedChars.value + typedChars.value;
    const totalCorrect = totalCorrectChars.value + correctChars.value;

    if (totalChars === 0) {
      wpm.value = 0;
      accuracy.value = 100;
      return;
    }

    // 计算准确率（使用总累积数据）
    accuracy.value = Math.round((totalCorrect / totalChars) * 100);

    // 计算 WPM (使用总累积字符数，假设每个单词平均5个字符)
    const minutesElapsed = (gameTime.value - remainingTime.value) / 60;
    if (minutesElapsed > 0) {
      const wordsTyped = Math.floor(totalChars / 5);
      wpm.value = Math.round(wordsTyped / minutesElapsed);
    } else {
      wpm.value = 0;
    }
  };

  // 处理输入事件
  const handleInput = (e: Event) => {
    const inputElement = e.target as HTMLInputElement;
    const newInput = inputElement.value;

    // 更新输入文本
    inputText.value = newInput;

    // 计算当前输入的字符数
    typedChars.value = newInput.length;

    // 计算当前输入的正确和错误字符数
    let currentCorrect = 0;
    let currentError = 0;

    for (let i = 0; i < newInput.length; i++) {
      if (currentText.value && i < currentText.value.length) {
        if (newInput[i] === currentText.value[i]) {
          currentCorrect++;
        } else {
          currentError++;
        }
      } else {
        currentError++;
      }
    }

    // 更新当前统计数据（仅用于显示当前输入的正确性）
    correctChars.value = currentCorrect;
    errorChars.value = currentError;

    // 更新 WPM
    updateWPM();

    // 检查是否完成所有文本，如果完成则生成新内容
    if (isTextCompleted.value) {
      // 更新累积统计数据
      totalTypedChars.value += newInput.length;
      totalCorrectChars.value += currentCorrect;
      totalErrorChars.value += currentError;

      // 触发庆祝动画
      showCelebration.value = true;

      // 生成新的随机文本
      currentText.value = textLibrary[Math.floor(Math.random() * textLibrary.length)];
      // 清空输入框，继续输入
      inputText.value = '';
      // 重置当前统计数据，但保留累积数据
      typedChars.value = 0;
      correctChars.value = 0;
      errorChars.value = 0;

      // 3秒后隐藏庆祝动画
      setTimeout(() => {
        showCelebration.value = false;
      }, 3000);
    }
  };

  // 重置游戏
  const resetGame = () => {
    // 清除定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }

    // 重置游戏状态
    isPlaying.value = false;
    isGameOver.value = false;
    remainingTime.value = gameTime.value;
    inputText.value = '';
    typedChars.value = 0;
    correctChars.value = 0;
    errorChars.value = 0;
    totalTypedChars.value = 0;
    totalCorrectChars.value = 0;
    totalErrorChars.value = 0;
    wpm.value = 0;
    accuracy.value = 100;
  };

  // 组件卸载
  onUnmounted(() => {
    // 清除定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
  });
</script>

<template>
  <div class="typing-test-container">
    <!-- 标题栏 -->
    <h2 class="game-title">{{ props.time }} {{ t('minTypingTest') }}</h2>

    <!-- 游戏信息 -->
    <div class="game-info">
      <div class="info-item">
        <span class="label">{{ t('time') }}:</span>
        <span class="value">{{ formattedTime }}</span>
      </div>
      <div class="info-item">
        <span class="label">WPM:</span>
        <span class="value">{{ wpm }}</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('accuracy') }}:</span>
        <span class="value">{{ accuracy }}%</span>
      </div>
      <div class="info-item">
        <span class="label">{{ t('characters') }}:</span>
        <span class="value">{{ totalTypedChars + typedChars }}</span>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div class="game-area">
      <!-- 庆祝动画 -->
      <div v-if="showCelebration" class="celebration">
        <div class="celebration-text">{{ t('textCompleted') }}！</div>
        <div class="confetti-container">
          <div v-for="i in 50" :key="i" class="confetti"></div>
        </div>
      </div>

      <!-- 文本显示 -->
      <div class="text-display">
        <span
          v-for="(char, index) in currentText"
          :key="index"
          :class="{
            correct: index < inputText.length && inputText[index] === char,
            incorrect: index < inputText.length && inputText[index] !== char,
            current: index === inputText.length,
          }"
        >
          {{ char }}
        </span>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <input
          v-if="!isGameOver"
          v-model="inputText"
          type="text"
          class="typing-input"
          :disabled="!isPlaying"
          :placeholder="t('clickToStartThenTypeHere')"
          autofocus
          @input="handleInput"
          @paste.prevent
          @drop.prevent
        />
        <div v-else class="game-over-message">
          <h3>{{ t('testFinished') }}！</h3>
          <h4>{{ t('finalScore') }}</h4>
          <div class="final-score">
            <div class="score-item primary">
              <div class="score-label">WPM</div>
              <div class="score-value">{{ wpm }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">{{ t('accuracy') }}</div>
              <div class="score-value">{{ accuracy }}%</div>
            </div>
            <div class="score-item">
              <div class="score-label">{{ t('totalCharacters') }}</div>
              <div class="score-value">{{ totalTypedChars + typedChars }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">{{ t('correctCharacters') }}</div>
              <div class="score-value">{{ totalCorrectChars + correctChars }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">{{ t('wrongCharacters') }}</div>
              <div class="score-value">{{ totalErrorChars + errorChars }}</div>
            </div>
          </div>
          <div class="button-container">
            <button class="restart-btn" @click="resetGame">{{ t('restartGame') }}</button>
          </div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <div v-if="!isPlaying && !isGameOver" class="start-section">
        <button class="start-btn" @click="startGame">{{ t('startTest') }}</button>
        <p>
          {{ t('clickToStartThenTypeHere') }}。{{ t('time') }}：{{ props.time }}
          {{ t('minTypingTest').split(' ')[0] }}
        </p>
      </div>
    </div>

    <!-- 相关测试推荐组件 -->
    <RelatedTests current-test="typingTest" />

    <!-- 游戏说明 -->
    <div class="game-instructions info">
      <div class="faq-section">
        <!-- 使用通用FAQ组件 -->
        <FAQComponent
          :title="t('typingTest')"
          :faq="currentFaq"
          :show-popular="true"
          :popular-questions="popularQuestions"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 打字测试容器 */
  .typing-test-container {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
    background-color: #121212;
    color: white;
    position: relative;
    box-sizing: border-box;
    border-radius: 10px;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 20px 0;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
  }

  /* 游戏信息 */
  .game-info {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  /* 信息项 */
  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 120px;
    padding: 15px;
    background-color: #1a1a1a;
    border-radius: 8px;
  }

  /* 信息标签 */
  .label {
    font-size: 16px;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  /* 信息值 */
  .value {
    font-size: 28px;
    font-weight: bold;
    color: #4caf50;
  }

  /* 游戏区域 */
  .game-area {
    width: 100%;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a, #1a1a1a);
    background-size: 400% 400%;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    animation: backgroundGradient 15s ease infinite;
  }

  /* 动态背景渐变动画 */
  @keyframes backgroundGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* 文本显示 */
  .text-display {
    font-size: 24px;
    line-height: 1.6;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #000000;
    border-radius: 10px;
    text-align: left;
    min-height: 150px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
  }

  /* 文本字符样式 */
  .text-display span {
    position: relative;
    display: inline-block;
    transition: all 0.1s ease;
  }

  /* 正确字符 */
  .text-display span.correct {
    color: #4caf50;
    animation: correctChar 0.3s ease-in-out;
  }

  /* 错误字符 */
  .text-display span.incorrect {
    color: #f44336;
    background-color: rgba(244, 67, 54, 0.2);
    text-decoration: underline;
    animation: incorrectChar 0.3s ease-in-out;
  }

  /* 当前字符 */
  .text-display span.current::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background-color: #2196f3;
    animation:
      blink 1s infinite,
      pulse 1s infinite;
  }

  /* 正确字符动画 */
  @keyframes correctChar {
    0% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 错误字符动画 */
  @keyframes incorrectChar {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  /* 脉冲动画 */
  @keyframes pulse {
    0%,
    100% {
      box-shadow:
        0 0 5px #2196f3,
        0 0 10px #2196f3;
    }
    50% {
      box-shadow:
        0 0 10px #2196f3,
        0 0 20px #2196f3;
    }
  }

  /* 光标闪烁动画 */
  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  /* 庆祝动画 */
  .celebration {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    pointer-events: none;
    text-align: center;
  }

  /* 庆祝文本 */
  .celebration-text {
    font-size: 48px;
    font-weight: bold;
    color: #4caf50;
    text-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
    animation: celebrationPulse 1s infinite alternate;
    margin-bottom: 20px;
  }

  /* 庆祝脉冲动画 */
  @keyframes celebrationPulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  /* 彩色纸屑容器 */
  .confetti-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  /* 彩色纸屑 */
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #4caf50;
    animation: confettiFall 3s infinite linear;
    opacity: 0;
  }

  /* 彩色纸屑动画 */
  @keyframes confettiFall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  /* 为不同彩色纸屑设置不同颜色和动画延迟 */
  .confetti:nth-child(1n) {
    background-color: #4caf50;
    animation-delay: 0s;
    left: 10%;
  }
  .confetti:nth-child(2n) {
    background-color: #2196f3;
    animation-delay: 0.2s;
    left: 20%;
  }
  .confetti:nth-child(3n) {
    background-color: #ff9800;
    animation-delay: 0.4s;
    left: 30%;
  }
  .confetti:nth-child(4n) {
    background-color: #f44336;
    animation-delay: 0.6s;
    left: 40%;
  }
  .confetti:nth-child(5n) {
    background-color: #9c27b0;
    animation-delay: 0.8s;
    left: 50%;
  }
  .confetti:nth-child(6n) {
    background-color: #ffc107;
    animation-delay: 1s;
    left: 60%;
  }
  .confetti:nth-child(7n) {
    background-color: #00bcd4;
    animation-delay: 1.2s;
    left: 70%;
  }
  .confetti:nth-child(8n) {
    background-color: #e91e63;
    animation-delay: 1.4s;
    left: 80%;
  }
  .confetti:nth-child(9n) {
    background-color: #673ab7;
    animation-delay: 1.6s;
    left: 90%;
  }
  .confetti:nth-child(10n) {
    background-color: #795548;
    animation-delay: 1.8s;
    left: 5%;
  }

  /* 为不同彩色纸屑设置不同大小和旋转速度 */
  .confetti:nth-child(odd) {
    width: 8px;
    height: 8px;
    animation-duration: 2.5s;
  }
  .confetti:nth-child(even) {
    width: 12px;
    height: 12px;
    animation-duration: 3.5s;
  }
  .confetti:nth-child(3n) {
    width: 15px;
    height: 15px;
    animation-duration: 3s;
  }

  /* 输入区域 */
  .input-area {
    margin-bottom: 20px;
  }

  /* 打字输入框 */
  .typing-input {
    width: 100%;
    padding: 15px;
    font-size: 24px;
    border: 2px solid #333;
    border-radius: 10px;
    background-color: #000000;
    color: white;
    font-family: monospace;
    outline: none;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
  }

  .typing-input:focus {
    border-color: #4caf50;
  }

  .typing-input:disabled {
    background-color: #222;
    cursor: not-allowed;
  }

  /* 游戏结束消息 */
  .game-over-message {
    text-align: center;
    padding: 40px 20px;
    background-color: #000000;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .game-over-message h3 {
    color: #4caf50;
    margin: 0;
    font-size: 36px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  }

  .game-over-message h4 {
    color: #ffffff;
    margin: 0;
    font-size: 24px;
    opacity: 0.8;
    font-weight: normal;
  }

  /* 最终成绩 */
  .final-score {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
    margin: 20px 0;
    padding: 20px;
    background-color: #1a1a1a;
    border-radius: 15px;
    width: 100%;
    max-width: 800px;
    box-sizing: border-box;
  }

  /* 成绩项 */
  .score-item {
    background-color: #2a2a2a;
    padding: 25px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .score-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }

  /* 主要成绩项（WPM） */
  .score-item.primary {
    background-color: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
    grid-column: span 2;
  }

  /* 成绩标签 */
  .score-label {
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 8px;
    color: #cccccc;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* 成绩数值 */
  .score-value {
    font-size: 36px;
    font-weight: bold;
    color: #4caf50;
    line-height: 1;
  }

  /* 主要成绩数值 */
  .score-item.primary .score-value {
    font-size: 48px;
    color: #4caf50;
  }

  /* 按钮容器 */
  .button-container {
    margin-top: 10px;
  }

  /* 开始区域 */
  .start-section {
    text-align: center;
  }

  /* 开始按钮 */
  .start-btn {
    padding: 15px 30px;
    font-size: 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    margin-top: 20px;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
  }

  .start-btn:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
  }

  .start-btn:focus {
    outline: none; /* 移除聚焦轮廓 */
  }

  .start-btn:active {
    background-color: #3d8b40;
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    outline: none; /* 移除点击时的轮廓 */
  }

  /* 重新开始按钮 */
  .restart-btn {
    padding: 18px 40px;
    font-size: 22px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    outline: none; /* 移除默认轮廓 */
    -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
    transition: all 0.3s ease;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    margin-top: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    min-width: 200px;
  }

  .restart-btn:hover {
    background-color: #45a049;
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  }

  .restart-btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* 游戏说明 */
  .game-instructions {
    margin-top: 20px;
    padding: 20px;
    border-radius: 10px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
  }

  .game-instructions h3 {
    color: #4caf50;
    margin-bottom: 15px;
    font-size: 20px;
  }

  .game-instructions ul {
    color: #cccccc;
    line-height: 1.6;
    font-size: 16px;
    padding-left: 20px;
  }

  .game-instructions li {
    margin-bottom: 10px;
  }

  /* FAQ 部分 */
  .faq-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 0;
    padding: 0;
  }

  /* 网格布局 */
  .faq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* 单列布局 */
  .faq-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 全宽样式 */
  .full-width {
    grid-column: 1 / -1;
    background-color: rgba(50, 50, 50, 0.7);
  }

  /* FAQ 项目 */
  .faq-item {
    background-color: rgba(50, 50, 50, 0.5);
    padding: 25px;
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    text-align: left;
  }

  .faq-item:hover {
    background-color: rgba(50, 50, 50, 0.8);
    border-color: #4caf50;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  /* FAQ 标题 */
  .faq-item h4 {
    color: #4caf50;
    margin: 0 0 15px 0;
    font-size: 20px;
    font-weight: bold;
  }

  /* FAQ 内容 */
  .faq-item p {
    color: #cccccc;
    margin: 0;
    line-height: 1.7;
    font-size: 16px;
    text-align: left;
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    /* 游戏标题优化 */
    .game-title {
      font-size: 20px;
      margin-bottom: 15px;
    }

    /* 游戏信息优化 - 横向排列 */
    .game-info {
      flex-wrap: nowrap;
      justify-content: space-between;
      gap: 8px;
      overflow-x: auto;
      padding: 0 5px;
      margin-bottom: 15px;
    }

    /* 信息项优化 - 缩小卡片宽度 */
    .info-item {
      min-width: auto;
      max-width: 80px;
      padding: 8px 10px;
      gap: 2px;
      flex: 1;
    }

    /* 信息标签优化 */
    .label {
      font-size: 12px;
      margin-bottom: 2px;
    }

    /* 信息值优化 */
    .value {
      font-size: 18px;
    }

    /* 文本显示优化 */
    .text-display {
      font-size: 16px;
      padding: 15px;
      min-height: 120px;
    }

    /* 成绩项优化 */
    .score-grid {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .score-item {
      padding: 15px;
    }

    .score-item.primary {
      grid-column: span 2;
    }

    .score-value {
      font-size: 28px;
    }

    .score-item.primary .score-value {
      font-size: 36px;
    }

    /* 输入框优化 */
    .typing-input {
      padding: 12px;
      font-size: 16px;
    }

    /* 按钮优化 */
    .start-btn,
    .restart-btn {
      padding: 12px 24px;
      font-size: 18px;
    }

    /* FAQ部分优化 */
    .faq-grid {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .faq-item {
      padding: 20px;
    }

    /* 游戏说明优化 */
    .game-instructions {
      margin: 20px 10px 0;
      padding: 15px;
    }
  }
</style>
