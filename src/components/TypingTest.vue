<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { t } from '../i18n'; // 导入翻译函数
  // 懒加载通用FAQ组件
  const FAQComponent = defineAsyncComponent(() => import('./FAQComponent.vue'));
  // 懒加载相关测试推荐组件
  const RelatedTests = defineAsyncComponent(() => import('./RelatedTests.vue'));

  // 处理键盘按下事件
  const handleKeyDown = (e: KeyboardEvent) => {
    // 定义允许开始游戏的按键类型：数字、字母、符号
    const isAllowedKey = e.key.length === 1;

    // 如果游戏未开始，只有按下允许的键才开始游戏
    if (!isPlaying.value && !isGameOver.value && isAllowedKey) {
      startGame();
    }

    // 只有在游戏进行中才处理输入
    if (isPlaying.value && !isGameOver.value) {
      // 屏蔽空格键的默认滚动行为
      if (e.key === ' ') {
        e.preventDefault();
      }

      // 处理退格键
      if (e.key === 'Backspace') {
        inputText.value = inputText.value.slice(0, -1);
      }
      // 处理普通字符键（只允许输入文本中存在的字符类型）
      else if (isAllowedKey) {
        inputText.value += e.key;
      }

      // 更新输入处理
      handleInput({ target: { value: inputText.value } } as unknown as Event);
    }
  };

  // 组件功能：打字速度测试，支持不同时长

  // 组件属性
  const props = defineProps({
    time: {
      type: String,
      required: true,
      default: '1', // 默认1分钟
    }, // 测试时长（分钟）
  });

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

  // 组件挂载时的初始化逻辑
  onMounted(() => {
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    // 验证时间参数
    validateTimeParam();
    // 分割文本为段落
    splitTextIntoParagraphs();
    // 添加窗口大小变化事件监听
    window.addEventListener('resize', splitTextIntoParagraphs);
  });

  // 组件卸载时的清理逻辑
  onBeforeUnmount(() => {
    // 移除键盘事件监听
    window.removeEventListener('keydown', handleKeyDown);
    // 移除窗口大小变化事件监听
    window.removeEventListener('resize', splitTextIntoParagraphs);
    // 恢复滚动条
    document.body.style.overflow = '';
    // 清除定时器
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
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

  // 监听游戏结束状态，控制滚动条
  watch(
    () => isGameOver.value,
    (newValue) => {
      if (newValue) {
        // 游戏结束，禁用滚动条
        document.body.style.overflow = 'hidden';
      } else {
        // 游戏未结束，恢复滚动条
        document.body.style.overflow = '';
      }
    }
  );

  // 随机文本库
  const textLibrary = [
    "The digital revolution has transformed every aspect of modern life, from how we communicate and work to how we learn and entertain ourselves. This technological evolution has brought unprecedented convenience and connectivity, but it has also presented new challenges and complexities. As we navigate this rapidly changing landscape, it's important to understand both the benefits and the potential pitfalls of our increasingly digital world.\n\nOne of the most significant impacts of the digital age is on communication. Social media platforms, messaging apps, and video conferencing tools have made it easier than ever to stay connected with friends, family, and colleagues across the globe. These technologies have broken down geographical barriers and created new opportunities for collaboration and community building. However, they have also raised concerns about privacy, misinformation, and the erosion of face-to-face interaction.\n\nIn the workplace, digital technologies have revolutionized how we do business. Remote work has become more prevalent than ever, allowing employees to work from anywhere with an internet connection. Cloud computing has enabled businesses to store and access vast amounts of data efficiently, while artificial intelligence and machine learning are transforming industries from healthcare to finance. Despite these advances, the digital workplace also presents challenges such as cybersecurity threats, digital fatigue, and the need for constant upskilling.",
    'Climate change is one of the most pressing issues facing our planet today, with far-reaching implications for ecosystems, economies, and human societies. The scientific consensus is clear: human activities, particularly the burning of fossil fuels, are driving global temperatures to rise at an unprecedented rate. This warming trend is causing a range of impacts, including more frequent and severe weather events, rising sea levels, melting ice caps, and disruptions to ecosystems and biodiversity.\n\nAddressing climate change requires urgent and coordinated action at all levels, from individuals to governments and international organizations. Transitioning to renewable energy sources such as solar, wind, and hydropower is critical to reducing greenhouse gas emissions. Additionally, improving energy efficiency, promoting sustainable agriculture, and protecting forests and other carbon sinks are essential strategies for mitigating climate change.\n\nAdapting to the impacts of climate change is also crucial. This includes investing in resilient infrastructure, developing early warning systems for extreme weather events, and supporting communities most vulnerable to climate impacts. By taking proactive steps to both mitigate and adapt to climate change, we can work towards a more sustainable and resilient future for all.',
    "The human brain is one of the most complex and fascinating organs in the body, responsible for our thoughts, emotions, memories, and actions. Despite decades of research, scientists are still uncovering the mysteries of how the brain works. Recent advances in neuroscience, such as functional magnetic resonance imaging (fMRI) and optogenetics, have provided new insights into brain function and connectivity.\n\nOne of the most remarkable aspects of the brain is its plasticity, or ability to change and adapt throughout life. This neuroplasticity allows us to learn new skills, recover from injuries, and adapt to new environments. It's also the basis for how we form memories, with experiences shaping the connections between neurons in our brains.\n\nMental health is an integral part of brain health, and understanding the brain has important implications for treating mental illnesses such as depression, anxiety, and schizophrenia. Research into the brain's chemistry and circuitry is leading to more effective treatments, including new medications and therapies. As our understanding of the brain continues to grow, so too does our ability to promote brain health and well-being throughout the lifespan.",
    "Literature has the power to transport us to different times and places, introduce us to diverse characters, and explore complex ideas and emotions. From ancient epics to modern novels, literature reflects the human experience and helps us make sense of the world around us. It can challenge our assumptions, expand our perspectives, and foster empathy by allowing us to see the world through others' eyes.\n\nReading literature has numerous benefits for cognitive development and mental well-being. It improves vocabulary, comprehension, and critical thinking skills, while also reducing stress and promoting relaxation. Studies have shown that reading literary fiction can enhance empathy and social cognition, helping us better understand and connect with others.\n\nThe evolution of literature mirrors the evolution of human society, with different genres and styles emerging to reflect the concerns and values of their time. From the oral traditions of ancient cultures to the digital literature of today, storytelling remains a fundamental human activity. As technology continues to change how we create and consume literature, its power to inform, entertain, and inspire remains as strong as ever.",
    "Travel is one of life's greatest teachers, offering opportunities to learn about different cultures, cuisines, and ways of life. Stepping outside our comfort zones and immersing ourselves in new environments can broaden our horizons, challenge our assumptions, and foster personal growth. Whether exploring a bustling city, a remote village, or a breathtaking natural landscape, travel has the power to transform our perspectives and create lasting memories.\n\nCultural immersion is one of the most rewarding aspects of travel, allowing us to experience local customs, traditions, and ways of thinking firsthand. Trying new foods, participating in cultural festivals, and engaging with local communities can deepen our understanding and appreciation of different cultures. These experiences can also foster greater tolerance and respect for diversity, helping to bridge cultural divides.\n\nTravel also offers opportunities for adventure and exploration, whether hiking a mountain trail, snorkeling in a coral reef, or exploring ancient ruins. These experiences can build confidence, resilience, and a sense of adventure. They also remind us of the beauty and diversity of our planet, inspiring us to protect and preserve it for future generations.",
    'The history of human civilization is a rich and complex tapestry, woven from the stories of countless individuals and societies. From the earliest human settlements to the globalized world of today, civilizations have risen and fallen, leaving behind legacies that continue to shape our world. Studying history allows us to understand the origins of our current institutions, beliefs, and values, and to learn from the successes and failures of the past.\n\nAncient civilizations such as Mesopotamia, Egypt, Greece, and Rome laid the foundations for many aspects of modern society, including writing, mathematics, philosophy, and governance. The Middle Ages saw the rise of great empires and the spread of major religions, while the Renaissance sparked a revolution in art, science, and thought. The Industrial Revolution transformed economies and societies, leading to unprecedented technological progress and social change.\n\nUnderstanding history is essential for making informed decisions about the future. By studying the patterns and trends of the past, we can better understand the challenges facing our world today and work towards creating a more just, peaceful, and prosperous future for all.',
    'Science and technology have transformed our world in ways unimaginable just a few centuries ago. From the discovery of electricity to the development of the internet, scientific breakthroughs have revolutionized how we live, work, and interact with the world around us. Science is a systematic process of inquiry that seeks to understand the natural world through observation, experimentation, and analysis.\n\nThe scientific method is the foundation of modern science, providing a rigorous framework for testing hypotheses and advancing knowledge. This process involves making observations, formulating questions, developing hypotheses, conducting experiments, analyzing data, and drawing conclusions. Through this iterative process, scientists have made remarkable discoveries about everything from the smallest subatomic particles to the vast expanse of the universe.\n\nTechnology, the application of scientific knowledge for practical purposes, has had a profound impact on human society. From the wheel to the smartphone, technological innovations have improved our quality of life and expanded our capabilities. Today, emerging technologies such as artificial intelligence, biotechnology, and quantum computing are poised to transform our world once again, presenting both exciting opportunities and significant challenges.',
    'Education is the cornerstone of personal and societal development, providing individuals with the knowledge, skills, and values needed to thrive in a complex world. It is a lifelong process that begins in early childhood and continues throughout our lives. Quality education not only equips individuals with the tools to succeed in the workforce but also fosters critical thinking, creativity, and citizenship.\n\nThe purpose of education extends beyond academic achievement to include the development of the whole person. It should promote intellectual curiosity, emotional intelligence, and social responsibility. Education should also prepare individuals to be active and engaged citizens, capable of contributing to their communities and participating in democratic processes.\n\nAccess to quality education is a fundamental human right, yet millions of children and adults around the world lack access to basic education. Addressing educational inequality requires concerted efforts to ensure that all individuals, regardless of their background or circumstances, have the opportunity to receive a quality education. This includes investing in teachers, improving school infrastructure, and leveraging technology to expand access to education in underserved communities.',
    'Art is a universal language that transcends cultural and linguistic barriers, allowing us to express and communicate ideas, emotions, and experiences. From prehistoric cave paintings to contemporary digital art, art has been an integral part of human culture for thousands of years. It reflects the values, beliefs, and concerns of the societies that create it, while also inspiring and challenging viewers.\n\nArt takes many forms, including painting, sculpture, music, dance, literature, theater, and film. Each art form has its own unique language and techniques, yet all share the ability to evoke emotion, stimulate thought, and create connections between people. Art can be a powerful tool for social commentary, challenging injustice and inspiring change, or it can simply bring beauty and joy into our lives.\n\nThe creative process itself is a journey of exploration and self-discovery, requiring imagination, discipline, and courage. Artists draw inspiration from a variety of sources, including their personal experiences, the natural world, and the works of other artists. Through their creations, artists offer us new perspectives on the world and help us see things in ways we might not have considered before.',
    "Health and well-being are essential for living a fulfilling and productive life. While physical health is often the first thing that comes to mind, true well-being encompasses physical, mental, and social dimensions. Achieving and maintaining good health requires a holistic approach that addresses all aspects of our lives.\n\nPhysical health involves taking care of our bodies through regular exercise, balanced nutrition, sufficient sleep, and preventive care. Regular physical activity strengthens our muscles and bones, improves cardiovascular health, and boosts our immune system. A balanced diet provides the nutrients our bodies need to function properly, while adequate sleep is essential for physical and mental recovery.\n\nMental health is equally important, involving our emotional, psychological, and social well-being. It affects how we think, feel, and act, and helps determine how we handle stress, relate to others, and make choices. Taking care of our mental health includes practicing self-care, seeking support when needed, and cultivating positive relationships.\n\nSocial well-being involves our connections with others and our sense of belonging to a community. Strong social ties can provide emotional support, reduce stress, and improve overall health outcomes. Building and maintaining healthy relationships, participating in community activities, and contributing to others' well-being are all important for social health.",
    "The future of work is being shaped by rapid technological change, globalization, and shifting societal values. As we move further into the 21st century, the nature of work is evolving at an unprecedented pace, with new jobs emerging and traditional roles being transformed or replaced. Understanding these changes is essential for individuals, businesses, and policymakers alike.\n\nAutomation and artificial intelligence are among the most significant drivers of change in the workplace. While these technologies have the potential to increase productivity and create new opportunities, they also raise concerns about job displacement and the need for new skills. The jobs of the future will require a combination of technical skills, such as digital literacy and data analysis, and soft skills, such as creativity, critical thinking, and emotional intelligence.\n\nThe rise of the gig economy and remote work is also transforming how we work. More people are choosing flexible work arrangements that allow them to balance work and personal life, while advances in technology make it easier to work from anywhere. This shift offers both opportunities and challenges, including the need for new policies to protect workers' rights and ensure fair compensation.\n\nAs we navigate the future of work, it's important to prioritize lifelong learning and adaptability. Individuals will need to continuously update their skills to remain competitive in the job market, while businesses will need to invest in their employees' development and create inclusive work environments that foster innovation and collaboration.",
    'Space exploration has captivated the human imagination for centuries, pushing the boundaries of what we know and what we can achieve. From the first moon landing to the exploration of Mars and beyond, space missions have expanded our understanding of the universe and our place in it. These missions have also led to numerous technological advancements that benefit life on Earth.\n\nThe exploration of space has yielded valuable scientific discoveries, from understanding the origins of the universe to studying the potential for life on other planets. Telescopes such as the Hubble Space Telescope have provided stunning images of distant galaxies and nebulae, while robotic missions to Mars and other planets have gathered data about their geology, atmosphere, and potential habitability.\n\nSpace exploration also has practical applications for life on Earth. Many technologies developed for space missions, such as GPS, weather satellites, and medical imaging devices, have become integral parts of our daily lives. Space research has also contributed to advances in materials science, energy production, and environmental monitoring.\n\nThe future of space exploration holds even more exciting possibilities, including crewed missions to Mars, the establishment of lunar bases, and the search for extraterrestrial life. These ambitious goals will require continued innovation, international cooperation, and a commitment to expanding our knowledge of the universe.',
  ];

  // 当前测试文本
  const currentText = ref(textLibrary[Math.floor(Math.random() * textLibrary.length)]);

  // 分段显示处理
  const paragraphs = ref<string[]>([]); // 所有段落
  const currentParagraphIndex = ref(0); // 当前显示的段落索引
  const textDisplayRef = ref<HTMLElement | null>(null); // 文本显示容器引用

  // 测量文本高度并分割为段落
  const splitTextIntoParagraphs = () => {
    const text = currentText.value || '';
    if (!textDisplayRef.value) {
      paragraphs.value = [text];
      return;
    }

    // 获取文本显示容器的高度（减去padding）
    const computedStyle = window.getComputedStyle(textDisplayRef.value);
    const containerHeight =
      textDisplayRef.value.clientHeight -
      parseInt(computedStyle.paddingTop) -
      parseInt(computedStyle.paddingBottom);

    // 创建临时元素用于测量文本高度
    const tempDiv = document.createElement('div');
    tempDiv.style.fontSize = computedStyle.fontSize;
    tempDiv.style.fontFamily = computedStyle.fontFamily;
    tempDiv.style.lineHeight = computedStyle.lineHeight;
    tempDiv.style.whiteSpace = computedStyle.whiteSpace;
    tempDiv.style.width = textDisplayRef.value.clientWidth + 'px';
    tempDiv.style.padding = '0';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    document.body.appendChild(tempDiv);

    // 按字符逐个添加，测量高度，当接近容器高度时分割为段落
    const result: string[] = [];
    let currentParagraph = '';

    for (let i = 0; i < text.length; i++) {
      currentParagraph += text[i];
      tempDiv.textContent = currentParagraph;

      // 当文本高度接近容器高度（95%）时，分割段落，充分利用空间
      if (tempDiv.offsetHeight >= containerHeight) {
        // 找到最后一个空格或标点符号，避免在单词中间分割
        const lastSpaceIndex = currentParagraph.lastIndexOf(' ');
        const lastPunctIndex = currentParagraph.search(/[.!?,;:\n"]\s*$/);
        const splitIndex = lastPunctIndex > lastSpaceIndex ? lastPunctIndex + 1 : lastSpaceIndex;

        if (splitIndex > 0) {
          // 分割段落
          result.push(currentParagraph.slice(0, splitIndex).trim());
          currentParagraph = currentParagraph.slice(splitIndex).trim();
        } else {
          // 如果没有找到合适的分割点，直接分割
          result.push(currentParagraph.trim());
          currentParagraph = '';
        }
      }
    }

    // 添加最后一个段落
    if (currentParagraph.trim()) {
      result.push(currentParagraph.trim());
    }

    // 清理临时元素
    document.body.removeChild(tempDiv);

    // 如果没有分割出段落，使用原文本
    paragraphs.value = result.length > 0 ? result : [text];
  };

  // 获取当前显示的段落
  const currentParagraph = computed(() => {
    return paragraphs.value[currentParagraphIndex.value] || '';
  });

  // 监听文本变化
  watch(currentText, () => {
    splitTextIntoParagraphs();
    currentParagraphIndex.value = 0;
  });

  // 计算属性：格式化剩余时间
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  // 计算属性：是否当前段落已输入完成
  const isParagraphCompleted = computed(
    () => inputText.value.length >= currentParagraph.value.length
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

    // 保留当前文本，不立即重置，让用户可以看到最终输入结果
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

    const fullText = currentText.value;

    for (let i = 0; i < newInput.length; i++) {
      if (fullText && i < fullText.length) {
        if (newInput[i] === fullText[i]) {
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

    // 检查是否完成当前段落
    if (isParagraphCompleted.value) {
      // 更新累积统计数据
      totalTypedChars.value += newInput.length;
      totalCorrectChars.value += currentCorrect;
      totalErrorChars.value += currentError;

      // 触发庆祝动画
      showCelebration.value = true;

      // 检查是否还有下一段
      if (currentParagraphIndex.value < paragraphs.value.length - 1) {
        // 切换到下一段
        currentParagraphIndex.value++;
      } else {
        // 所有段落都已完成，生成新的随机文本
        currentText.value = textLibrary[Math.floor(Math.random() * textLibrary.length)];
      }

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

    // 选择新的随机文本
    currentText.value = textLibrary[Math.floor(Math.random() * textLibrary.length)];

    // 重置段落索引
    currentParagraphIndex.value = 0;
  };
</script>

<template>
  <div class="typing-test-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧游戏区域 -->
      <div class="game-area">
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
        <div class="typing-game-area">
          <!-- 庆祝动画 -->
          <div v-if="showCelebration" class="celebration">
            <div class="celebration-text">{{ t('textCompleted') }}！</div>
            <div class="confetti-container">
              <div v-for="i in 50" :key="i" class="confetti"></div>
            </div>
          </div>

          <!-- 文本显示 -->
          <div ref="textDisplayRef" class="text-display">
            <div class="text-content">
              <span
                v-for="(char, index) in currentParagraph"
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
          </div>

          <!-- 游戏结束弹窗 -->
          <div v-if="isGameOver" class="game-over-message">
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

        <!-- 相关测试推荐组件 -->
        <component :is="RelatedTests" current-test="typingTest" />

        <!-- FAQ区域 -->
        <div class="faq-section">
          <!-- 使用通用FAQ组件 -->
          <component
            :is="FAQComponent"
            :title="t('typingTest')"
            :faq="currentFaq"
            :show-popular="true"
            :popular-questions="popularQuestions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 打字测试容器 */
  .typing-test-container {
    width: 100%;
    margin: 0 auto;
    text-align: center;
    padding: clamp(10px, 2vw, 20px);
    color: white;
    position: relative;
    box-sizing: border-box;
    background-color: #000000;
    border-radius: 10px;
  }

  /* 主内容区域 */
  .main-content {
    display: flex;
    gap: clamp(10px, 2vw, 20px);
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }

  /* 电脑端布局 */
  @media (min-width: 1201px) {
    .main-content {
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: nowrap;
    }

    .game-area {
      flex: 1;
      width: auto;
    }
  }

  /* 中等屏幕布局优化 */
  @media (min-width: 769px) and (max-width: 1200px) {
    .main-content {
      flex-direction: column;
      align-items: center;
    }

    .game-area {
      max-width: 100%;
      width: 100%;
    }
  }

  /* 左侧游戏区域 */
  .game-area {
    flex: 1;
    width: 100%;
    min-width: 0;
  }

  /* 游戏标题样式 */
  .game-title {
    color: #4caf50;
    margin: 0 0 clamp(10px, 2vw, 20px) 0;
    font-size: clamp(24px, 4vw, 28px);
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  /* 游戏信息 */
  .game-info {
    display: flex;
    gap: clamp(8px, 2vw, 20px);
    justify-content: center;
    margin-bottom: clamp(15px, 3vw, 20px);
    flex-wrap: wrap;
    width: 100%;
  }

  /* 信息项 */
  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: clamp(100px, 25vw, 120px);
    padding: clamp(12px, 3vw, 15px);
    background-color: #1a1a1a;
    border-radius: 8px;
  }

  /* 信息标签 */
  .label {
    font-size: clamp(14px, 2.5vw, 16px);
    opacity: 0.8;
    margin-bottom: 5px;
  }

  /* 信息值 */
  .value {
    font-size: clamp(24px, 5vw, 28px);
    font-weight: bold;
    color: #4caf50;
  }

  /* 打字游戏区域 */
  .typing-game-area {
    width: 100%;
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a, #1a1a1a);
    background-size: 400% 400%;
    border-radius: 15px;
    padding: clamp(15px, 3vw, 20px);
    margin-bottom: clamp(15px, 3vw, 20px);
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
    font-size: clamp(16px, 3vw, 24px);
    line-height: 1.6;
    margin-bottom: clamp(15px, 3vw, 20px);
    padding: clamp(15px, 3vw, 20px);
    border-radius: 10px;
    text-align: left;
    height: 300px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
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

  /* 游戏结束消息 */
  .game-over-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 40px 20px;
    background-color: #000000;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 1000;
    width: 90%;
    max-width: 800px;
    box-shadow: 0 0 30px rgba(76, 175, 80, 0.5);
    border: 2px solid #4caf50;
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

  /* 移动端结果弹窗优化 */
  @media (max-width: 768px) {
    /* 调整弹窗整体样式 */
    .game-over-message {
      padding: 20px 12px;
      gap: 12px;
      width: 85%;
      max-height: 90vh;
      overflow-y: auto;
    }

    /* 调整标题大小 */
    .game-over-message h3 {
      font-size: 24px;
    }

    .game-over-message h4 {
      font-size: 18px;
    }

    /* 优化最终成绩网格布局 */
    .final-score {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 10px 0;
      padding: 12px;
    }

    /* 调整成绩项样式 */
    .score-item {
      padding: 15px 8px;
    }

    /* 主要成绩项在移动端也只占一列 */
    .score-item.primary {
      grid-column: span 1;
    }

    /* 调整成绩标签和数值大小 */
    .score-label {
      font-size: 11px;
      margin-bottom: 3px;
    }

    .score-value {
      font-size: 24px;
    }

    .score-item.primary .score-value {
      font-size: 30px;
    }

    /* 调整按钮大小 */
    .restart-btn {
      padding: 12px 28px;
      font-size: 16px;
      min-width: 140px;
    }
  }

  /* 按钮容器 */
  .button-container {
    margin-top: 10px;
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
    margin-top: 30px;
    margin-bottom: 30px;
    width: 100%;
  }

  /* 网格布局 */
  .faq-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(clamp(300px, 100%, 400px), 1fr));
    gap: clamp(15px, 3vw, 25px);
  }

  /* 单列布局 */
  .faq-column {
    display: flex;
    flex-direction: column;
    gap: clamp(15px, 3vw, 25px);
  }

  /* 全宽样式 */
  .full-width {
    grid-column: 1 / -1;
    background-color: rgba(40, 40, 40, 0.8);
    margin-bottom: 15px;
  }

  /* FAQ 项目 */
  .faq-item {
    background-color: rgba(50, 50, 50, 0.7);
    padding: clamp(20px, 3vw, 25px);
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid rgba(80, 80, 80, 0.5);
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .faq-item:hover {
    background-color: rgba(60, 60, 60, 0.9);
    border-color: #4caf50;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-3px);
  }

  /* FAQ 标题 */
  .faq-item h4 {
    color: #4caf50;
    margin: 0 0 15px 0;
    font-size: clamp(16px, 2vw, 18px);
    font-weight: bold;
    line-height: 1.3;
  }

  /* FAQ 内容 */
  .faq-item p {
    color: #e0e0e0;
    margin: 0;
    line-height: 1.7;
    font-size: clamp(14px, 2vw, 16px);
    text-align: left;
    opacity: 0.9;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .faq-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .faq-column {
      gap: 20px;
    }

    .faq-item {
      padding: 20px;
    }

    .faq-item h4 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    .faq-item p {
      font-size: 14px;
      line-height: 1.6;
    }
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

    /* 按钮优化 */
    .restart-btn {
      padding: 12px 24px;
      font-size: 18px;
    }

    /* 游戏说明优化 */
    .game-instructions {
      margin: 20px 10px 0;
      padding: 15px;
    }
  }
</style>
