import { reactive, computed, nextTick } from 'vue';
import { updateMetaTags } from '../router/index';
import router from '../router/index';
import { CookieManager, COOKIE_NAMES } from '../utils/cookie';

// 定义翻译资源类型 - 支持嵌套对象
interface TranslationValue {
  [key: string]: string | TranslationValue;
}

interface TranslationResources {
  [key: string]: TranslationValue;
}

// 翻译资源
const resources: TranslationResources = {
  'zh-CN': {
    websiteName: 'CPS Test - 点击速度与反应能力训练平台',
    metaDescription:
      'CPS Test - 免费、专业、快速的点击速度测试平台，提供实时反馈和全面的测试项目，包括反应时间测试、打字测试等多种测试，支持多语言，记录历史成绩',
    metaKeywords:
      'CPS Test,免费测试,专业测试,实时测试,快速测试,全面测试,点击速度测试,反应时间测试,打字测试,鼠标滚动测试,空格点击测试',
    ogDescription:
      'CPS Test平台，免费、专业的点击速度测试训练系统，提供快速、实时的测试反馈和全面的训练项目，支持多语言，记录历史成绩',
    schemaDescription:
      'CPS Test平台，免费、专业的点击速度测试训练系统，提供快速、实时的测试反馈和全面的训练项目，支持多语言，记录历史成绩',
    schemaName: 'CPS Test - 点击速度与反应能力训练平台',
    schemaPublisher: 'CPS Test平台',
    home: '首页',
    popularTests: '热门测试',
    quickLinks: '快速链接',
    clickTest: '点击速度测试',
    clickSeriesTest: '连点测试',
    doubleClickTest: '双击连点测试',
    clicks: '次',
    secClickTest: '秒点击测试',
    '1secClickTest': '1秒点击测试',
    '2secClickTest': '2秒点击测试',
    '5secClickTest': '5秒点击测试',
    '10secClickTest': '10秒点击测试',
    '15secClickTest': '15秒点击测试',
    '30secClickTest': '30秒点击测试',
    '60secClickTest': '60秒点击测试',
    spaceClickTest: '空格点击测试',
    secSpaceTest: '秒空格速度测试',
    '1secSpaceTest': '1秒空格速度测试',
    '5secSpaceTest': '5秒空格速度测试',
    '10secSpaceTest': '10秒空格速度测试',
    '15secSpaceTest': '15秒空格速度测试',
    '30secSpaceTest': '30秒空格速度测试',
    '60secSpaceTest': '60秒空格速度测试',
    kohiClickTest: 'Kohi点击测试',
    typingTest: '打字测试',
    '1minTypingTest': '1分钟打字速度测试',
    '3minTypingTest': '3分钟打字速度测试',
    '5minTypingTest': '5分钟打字速度测试',
    '10minTypingTest': '10分钟打字速度测试',
    '15minTypingTest': '15分钟打字速度测试',
    reactionTest: '反应时间测试',
    simpleReactionTest: '简单反应测试',
    colorReactionTest: '颜色反应测试',
    keyReactionTest: '关键按键测试（WASD）',
    targetEliminationGame: '目标消除反应训练游戏',
    mouseScrollTest: '鼠标滚动测试',
    login: '登录',
    justNow: '刚刚',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    removeAll: '清除全部',
    startGame: '开始游戏',
    clickHere: '点击这里',
    cps: '点击速度',
    timer: '时间',
    clickPerSecond: '点击/秒',
    score: '分数',
    reactionTime: '反应时间',
    average: '平均',
    best: '最佳',
    round: '轮次',
    time: '时间',
    reset: '重置',
    continue: '继续',
    finish: '结束',
    tryAgain: '重试',
    ms: '毫秒',
    readyToStart: '准备开始测试',
    simpleReactionTestDesc: '点击下方按钮开始测试，当绿色方块出现时，尽快点击它！',
    colorReactionTestDesc:
      '点击下方按钮开始测试，当彩色文字出现时，忽略文字内容，尽快点击与文字内容匹配的颜色方块！',
    startTest: '开始测试',
    leftButton: '鼠标左键',
    middleButton: '鼠标滚动键',
    rightButton: '鼠标右键',
    leftMouseButton: '鼠标左键',
    rightMouseButton: '鼠标右键',
    selectMouseButton: '选择鼠标按键',
    totalClicks: '总点击次数',
    doubleClicks: '双击次数',
    bestDoubleSpeed: '最佳速度',
    clickHereToTest: '点击游戏区域开始测试',
    gettingReady: '准备...',
    faqDoubleClickQ1: '什么是双击测试？',
    faqDoubleClickA1:
      '双击测试是一种测试您的双击速度和准确性的测试。系统会记录您的总点击次数、双击次数以及最佳双击速度。',
    faqDoubleClickQ2: '如何提高双击速度？',
    faqDoubleClickA2:
      '提高双击速度需要练习，建议使用稳定的鼠标，调整合适的鼠标灵敏度，并找到适合自己的点击节奏。',
    tripleClickTest: '三连点击测试',
    tripleClicks: '三连点击次数',
    bestTripleSpeed: '最佳速度',
    faqTripleClickQ1: '什么是三连点击测试？',
    faqTripleClickA1:
      '三连点击测试是一种测试您的三连点击速度和准确性的测试。系统会记录您的总点击次数、三连点击次数以及最佳三连点击速度。',
    faqTripleClickQ2: '如何提高三连点击速度？',
    faqTripleClickA2:
      '提高三连点击速度需要练习，建议使用稳定的鼠标，调整合适的鼠标灵敏度，并找到适合自己的点击节奏。',
    waiting: '等待',
    simpleReactionTestWaiting: '请集中注意力，绿色方块即将出现！',
    colorReactionTestWaiting: '请集中注意力，彩色文字即将出现！',
    nextTestComing: '下一次测试即将开始...',
    history: '历史记录',
    noHistory: '暂无历史记录',
    reactionTestQ1: '反应时间测试是什么？',
    reactionTestDescriptionText:
      '反应时间测试是一种测试您的视觉反应速度的游戏。测试时，屏幕上会随机出现绿色方块，您需要尽快点击它。系统会记录您的反应时间，并计算平均反应时间和最佳反应时间。反应时间测试允许您测试自己的反应速度和注意力水平。',
    reactionTestUsefulness: '反应时间测试有什么用？',
    reactionTestUsefulnessText:
      '反应时间测试可以帮助您了解自己的反应速度和注意力水平。对于游戏玩家、运动员和需要快速反应的职业从业者来说，良好的反应时间是非常重要的。',
    reactionTimeRange: '什么是正常的反应时间范围？',
    reactionTimeRangeText:
      '人类的平均视觉反应时间约为250-300毫秒。优秀的反应时间通常在150-250毫秒之间，专业运动员或游戏玩家可以达到100-150毫秒。',
    howToImproveReaction: '如何提高反应时间？',
    howToImproveReactionText:
      '提高反应时间需要练习。建议进行注意力训练、视觉追踪练习和反应速度游戏。保持良好的睡眠和健康的生活方式也有助于提高反应速度。',
    reactionTestPrinciple: '反应时间测试的原理是什么？',
    reactionTestPrincipleText:
      '反应时间测试基于人类的视觉感知和运动反应机制。测试通过测量从视觉刺激（目标出现）到运动反应（点击鼠标）的时间间隔，来评估您的反应速度。',
    // 方向键相关
    up: '上',
    down: '下',
    left: '左',
    right: '右',
    // 关键按键测试相关
    keyReactionTestDesc: '箭头亮起时按W/A/S/D。',
    clickToStart: '点击开始',
    tooSoon: '太快了...',
    pressWasdToReturn: '按W/A/S/D返回或点击重试。',
    wrongKey: '按键错误!',
    pressTheGreenOne: '按绿色的那个。',
    clickToContinue: '点击继续...',
    keyReactionTestResults: '按键反应测试结果',
    yourAverageReactionTime: '⏳ 你的反应时间',
    yourReactionTime: '你的反应时间',
    youCanDoBetter: '你可以做得更好！',
    notTheFastestStart:
      '不是最快的开始，但不要担心—反应速度会随着练习变得更快。继续训练，你很快就会成为闪电侠！⚡',
    restartGame: '重新开始',
    whatIsKeyReactionTest: '什么是关键按键测试？',
    whatIsKeyReactionTestDesc:
      '关键按键测试是一种评估您对WASD按键反应速度的测试。游戏会随机高亮一个按键，您需要尽快按下对应的按键，系统会记录您的反应时间。',
    whatIsColorReactionTest: '什么是颜色反应测试？',
    whatIsColorReactionTestDesc:
      '颜色反应测试是一种评估您对颜色识别和反应速度的测试。游戏会随机显示彩色文字，您需要忽略文字内容，尽快点击与文字内容匹配的颜色方块。',
    howToGetBetterScore: '如何获得更好的成绩？',
    howToGetBetterScoreDesc:
      '保持手指在WASD按键上，专注于屏幕，放松心情，不要过度紧张。通过多次练习可以提高您的按键反应速度。',
    howResultsCalculated: '测试结果如何计算？',
    howResultsCalculatedDesc: '系统会记录您每轮的反应时间，最后计算5轮的平均反应时间作为最终成绩。',
    whyTooSoon: '为什么有时候会显示"太快了"？',
    whyTooSoonDesc: '这表示您在按键高亮前就按下了按键。请等待按键变绿后再按下对应的按键。',
    // 通用游戏术语
    spaceBar: '空格键',
    pressSpaceToStart: '按空格键开始',
    clickSpaceToStart: '点击空格键开始',
    // 首页相关
    welcomeToCps: '欢迎来到 CPS 测试平台',
    improveSkills: '提升你的反应速度和点击技能',
    multipleTestTypes: '多种测试类型',
    multipleTestTypesDesc: '提供点击测试、反应测试、打字测试等多种测试类型，全面提升你的技能',
    realTimeStats: '实时统计',
    realTimeStatsDesc: '实时显示测试结果和统计数据，帮助你了解自己的表现',
    historyRecords: '历史记录',
    historyRecordsDesc: '保存你的测试历史，追踪你的进步和成长',
    gamifiedExperience: '游戏化体验',
    gamifiedExperienceDesc: '有趣的游戏化设计，让测试变得更加生动有趣',
    quickStart: '快速开始',
    testYourClickSpeed: '测试你的点击速度',
    testYourReactionSpeed: '测试你的反应速度',
    testYourTypingSpeed: '测试你的打字速度',
    testYourSpaceClickSpeed: '测试你的空格点击速度',
    professionalMinecraftClickTest: '专业的Minecraft点击测试',
    testYourColorReactionSpeed: '测试你的颜色识别反应速度',
    testYourWasdReactionSpeed: '测试你的WASD按键反应速度',
    trainYourReactionAndAim: '训练你的反应和瞄准能力',
    testYourMouseScrollSpeed: '测试你的鼠标滚动速度',
    testYourMouseDragSpeed: '测试你的鼠标拖动速度',
    keyboardTest: '键盘测试',
    keyboardTestDesc: '在这里您可以检查所有键盘按钮：',
    faq: '常见问题',
    whatIsKeyboardTest: '键盘测试是做什么的？',
    keyboardTestPurpose:
      '键盘测试用于检测您的键盘按键是否正常工作，同时记录您的按键顺序和响应时间。通过这个测试，您可以了解键盘的灵敏度和按键状态，帮助您判断键盘是否需要清洁或更换。',
    pressedKeys: '已按下的按键',
    noKeysPressed: '没有按下任何按键',
    platformFeatures: '平台特色',
    accurateTesting: '精准测试',
    accurateTestingDesc: '采用高精度计时和统计算法，确保测试结果的准确性',
    responsiveDesign: '响应式设计',
    responsiveDesignDesc: '适配各种设备，随时随地进行测试',
    achievementSystem: '成就系统',
    achievementSystemDesc: '完成不同难度的测试，解锁各种成就',
    communityFeatures: '社区功能',
    communityFeaturesDesc: '与其他用户比较成绩，分享你的进步',
    testGuide: '测试指南',
    selectTestType: '选择测试类型',
    selectTestTypeDesc: '从左侧菜单选择你想要进行的测试类型',
    startTestDesc: '按照提示开始测试，专注于测试过程',
    viewResults: '查看结果',
    viewResultsDesc: '测试结束后查看你的成绩和统计数据',
    practiceContinuously: '持续练习',
    practiceContinuouslyDesc: '通过多次测试提升你的技能，追踪你的进步',
    // FAQ相关
    faqTitle: '{time}秒点击测试FAQ',
    faqDesc:
      '{time}秒点击测试是评估你在固定时间内点击速度的测试。根据不同的测试时长，你可以评估自己的爆发力、短期稳定性或长期耐力。测试结束后，系统会计算你的每秒点击次数(CPS)。',
    spaceFaqTitle: '{time}秒空格点击测试FAQ',
    spaceFaqDesc:
      '{time}秒空格点击测试是评估你在固定时间内空格键点击速度的测试。根据不同的测试时长，你可以评估自己的爆发力、短期稳定性或长期耐力。测试结束后，系统会计算你的每秒点击次数(CPS)。',
    // 1秒点击测试FAQ
    faqClick1Q1: '1秒鼠标点击测试主要测什么？',
    faqClick1A1:
      '1秒鼠标点击测试测量瞬时爆发力，考验手指在极短时间内能达到的最高点击速度。这是最经典的CPS Test，能快速评估手速潜力。',
    faqClick1Q2: '1秒鼠标点击测试多少CPS算合格？',
    faqClick1A2:
      '参考标准：\n新手：6-8 CPS\n普通：8-10 CPS\n熟练：10-12 CPS\n优秀：12-15 CPS\n专业：15+ CPS',
    faqClick1Q3: '为什么1秒鼠标点击测试结果波动大？',
    faqClick1A3: '原因包括：起始节奏不稳定手指紧张导致卡顿注意力不集中设备响应延迟',
    faqClick1Q4: '如何提高1秒鼠标点击测试的成绩？',
    faqClick1A4:
      '建议：保持手指放松，不要过度用力找到适合自己的点击节奏测试前做手部热身使用高回报率鼠标（1000Hz）',
    // 1秒空格点击测试FAQ
    spaceFaq1Q1: '1秒空格点击测试主要测什么？',
    spaceFaq1A1:
      '1秒空格点击测试测量瞬时爆发力，考验手指在极短时间内能达到的最高点击速度。这是最经典的空格键CPS Test，能快速评估空格键手速潜力。',
    spaceFaq1Q2: '1秒空格点击测试多少CPS算合格？',
    spaceFaq1A2: '参考标准：新手：5-7 CPS普通：7-9 CPS熟练：9-11 CPS优秀：11-14 CPS专业：14+ CPS',
    spaceFaq1Q3: '为什么1秒空格点击测试结果波动大？',
    spaceFaq1A3: '原因包括：起始节奏不稳定手指紧张导致卡顿注意力不集中键盘响应延迟',
    spaceFaq1Q4: '如何提高1秒空格点击测试成绩？',
    spaceFaq1A4:
      '建议：保持手指放松，不要过度用力找到适合自己的点击节奏测试前做手部热身使用机械键盘或高响应键盘',
    // 2秒空格点击测试FAQ
    spaceFaq2Q1: '2秒空格点击测试和1秒测试有什么区别？',
    spaceFaq2A1:
      '2秒空格点击测试在1秒的基础上增加了短期稳定性要求。1秒测试只看爆发力，2秒测试需要维持高速点击，更能反映真实水平。',
    spaceFaq2Q2: '2秒空格点击测试的CPS应该比1秒低吗？',
    spaceFaq2A2:
      '是的，正常情况：2秒CPS ≈ 1秒CPS × 0.9-0.95如果差距过大（如2秒CPS < 1秒CPS × 0.85），说明耐力不足',
    spaceFaq2Q3: '2秒空格点击测试适合什么人群？',
    spaceFaq2A3:
      '适合：想从1秒过渡到更长测试的初学者需要评估短期稳定性的玩家作为日常训练的基准测试',
    spaceFaq2Q4: '2秒空格点击测试的练习方法？',
    spaceFaq2A4:
      '建议：每天做5组2秒测试，记录平均成绩关注后1秒是否明显下降结合1秒和5秒测试综合训练',
    // 5秒空格点击测试FAQ
    spaceFaq5Q1: '5秒空格点击测试的核心价值是什么？',
    spaceFaq5A1:
      '5秒空格点击测试是平衡爆发力与耐力的最佳时间窗口。既能体现爆发力，又能考验短期耐力，是评估综合能力的重要指标。',
    spaceFaq5Q2: '5秒空格点击测试的CPS参考标准？',
    spaceFaq5A2:
      '参考：新手：5-7 CPS（25-35次）普通：7-9 CPS（35-45次）熟练：9-11 CPS（45-55次）优秀：11+ CPS（55+次）',
    spaceFaq5Q3: '5秒空格点击测试时后几秒速度下降怎么办？',
    spaceFaq5A3:
      '应对策略：调整起始速度，不要一开始就全力建立稳定的点击节奏加强手部耐力训练关注呼吸节奏，保持放松',
    spaceFaq5Q4: '5秒空格点击测试如何判断进步？',
    spaceFaq5A4:
      '观察指标：CPS提升：整体速度提高稳定性改善：后几秒衰减率降低点击曲线平滑：波动减少',
    // 10秒空格点击测试FAQ
    spaceFaq10Q1: '10秒空格点击测试主要考验什么？',
    spaceFaq10A1:
      '10秒空格点击测试重点评估持久力和抗疲劳能力。能反映你在较长时间内维持稳定点击的能力，是耐力训练的重要指标。',
    spaceFaq10Q2: '10秒空格点击测试的CPS参考标准？',
    spaceFaq10A2:
      '参考：新手：4-6 CPS（40-60次）普通：6-8 CPS（60-80次）熟练：8-10 CPS（80-100次）优秀：10+ CPS（100+次）',
    spaceFaq10Q3: '10秒空格点击测试时手部疲劳怎么办？',
    spaceFaq10A3:
      '应对方法：测试前充分热身保持手腕放松，不要僵硬找到适合自己的节奏如果出现疼痛立即停止',
    spaceFaq10Q4: '10秒空格点击测试的耐力如何提升？',
    spaceFaq10A4:
      '训练建议：从5秒开始，逐步延长到7秒、10秒每周增加1-2秒训练时间关注后5秒的CPS衰减率（目标＜15%）结合手部力量训练',
    // 15秒空格点击测试FAQ
    spaceFaq15Q1: '15秒空格点击测试有什么特点？',
    spaceFaq15A1:
      '15秒空格点击测试是中长距离耐力测试，介于10秒和30秒之间。能更准确地评估持续点击能力，同时避免30秒测试的过度疲劳。',
    spaceFaq15Q2: '15秒空格点击测试的CPS参考标准？',
    spaceFaq15A2:
      '参考：新手：4-5 CPS（60-75次）普通：5-7 CPS（75-105次）熟练：7-9 CPS（105-135次）优秀：9+ CPS（135+次）',
    spaceFaq15Q3: '15秒空格点击测试如何分配体力？',
    spaceFaq15A3:
      '策略建议：前5秒：保持90%速度，建立节奏中间5秒：维持稳定，关注呼吸后5秒：适当加速冲刺，或保持稳定',
    spaceFaq15Q4: '15秒空格点击测试适合什么训练目标？',
    spaceFaq15A4: '适合：想从10秒过渡到30秒的进阶训练评估中等时间耐力作为日常训练的常规测试项目',
    // 30秒空格点击测试FAQ
    spaceFaq30Q1: '30秒空格点击测试的核心价值是什么？',
    spaceFaq30A1:
      '30秒空格点击测试是标准耐力测试，能全面评估手部肌肉的持久力和抗疲劳能力。这是专业训练和电竞选手常用的测试时间。',
    spaceFaq30Q2: '30秒空格点击测试的CPS参考标准？',
    spaceFaq30A2:
      '参考：新手：3-5 CPS（90-150次）普通：5-7 CPS（150-210次）熟练：7-9 CPS（210-270次）优秀：9+ CPS（270+次）',
    spaceFaq30Q3: '30秒空格点击测试如何应对疲劳？',
    spaceFaq30A3:
      '应对策略：心理准备：接受后10秒速度会下降节奏控制：前10秒不要过快，保持80%速度呼吸配合：深呼吸，保持放松手部放松：每5秒轻微放松手指',
    spaceFaq30Q4: '30秒空格点击测试的常见问题？',
    spaceFaq30A4:
      '常见问题：前快后慢，衰减过大（＞25%）手部僵硬，影响速度注意力不集中，节奏混乱设备不适，键盘过重或键程不合适',
    // 60秒空格点击测试FAQ
    spaceFaq60Q1: '60秒空格点击测试的意义是什么？',
    spaceFaq60A1:
      '60秒空格点击测试是极限耐力测试，考验手部肌肉的极限持久力。能全面评估抗疲劳能力和意志力，是专业选手的终极测试。',
    spaceFaq60Q2: '60秒空格点击测试的CPS参考标准？',
    spaceFaq60A2:
      '参考：新手：3-4 CPS（180-240次）普通：4-6 CPS（240-360次）熟练：6-8 CPS（360-480次）优秀：8+ CPS（480+次）',
    spaceFaq60Q3: '60秒空格点击测试如何分配体力？',
    spaceFaq60A3:
      '体力分配策略：0-15秒：稳定起跑，保持85%速度15-30秒：找到节奏，维持稳定30-45秒：最困难阶段，保持意志力45-60秒：全力冲刺或保持稳定',
    spaceFaq60Q4: '60秒空格点击测试的注意事项？',
    spaceFaq60A4:
      '重要提醒：充分热身：至少5分钟手部拉伸设备检查：确保键盘状态良好环境准备：选择安静、舒适的环境健康第一：出现疼痛立即停止，不要硬撑适度训练：60秒测试强度大，每周不超过2次',
    // Kohi点击测试FAQ
    kohiFaqDesc:
      'Kohi点击测试是一种特殊的点击速度测试，源自Minecraft服务器Kohi。测试时长固定为10秒，玩家需要尽可能快地点击屏幕，测试结束后会显示最终的CPS值。Kohi测试是专门为Minecraft玩家设计的，更加注重持续点击的稳定性。',
    kohiFaqQ1: 'Kohi点击测试是什么？',
    kohiFaqA1:
      'Kohi点击测试是一种特殊的点击速度测试，源自Minecraft服务器Kohi。测试时长固定为10秒，玩家需要尽可能快地点击屏幕，测试结束后会显示最终的CPS值。Kohi测试是专门为Minecraft玩家设计的，更加注重持续点击的稳定性。',
    kohiFaqQ2: 'Kohi点击测试与普通CPS Test有什么不同？',
    kohiFaqA2:
      'Kohi点击测试是专门为Minecraft玩家设计的，测试时长固定为10秒，更加注重持续点击的稳定性。它在Minecraft社区中广泛使用，用于衡量玩家的PvP能力。',
    kohiFaqQ3: 'Kohi测试有什么用？',
    kohiFaqA3:
      'Kohi测试可以帮助Minecraft玩家了解自己的点击速度和稳定性，这在PvP战斗中非常重要。高Kohi CPS可以让玩家在战斗中获得优势，尤其是在近距离战斗中。',
    kohiFaqQ4: '如何提高Kohi CPS？',
    kohiFaqA4:
      '提高Kohi CPS需要练习特定的点击技巧，如蝴蝶点击、抖动点击或drag clicking。同时，使用合适的鼠标和鼠标垫也可以提高点击速度和稳定性。',
    // 2秒点击测试FAQ
    faqClick2Q1: '2秒鼠标点击测试和1秒测试有什么区别？',
    faqClick2A1:
      '2秒鼠标点击测试在1秒的基础上增加了短期稳定性要求。1秒测试只看爆发力，2秒测试需要维持高速点击，更能反映真实水平。',
    faqClick2Q2: '2秒鼠标点击测试的CPS应该比1秒低吗？',
    faqClick2A2:
      '是的，正常情况：2秒CPS ≈ 1秒CPS × 0.9-0.95如果差距过大（如2秒CPS < 1秒CPS × 0.85），说明耐力不足',
    faqClick2Q3: '2秒鼠标点击测试适合什么人群？',
    faqClick2A3:
      '适合：想从1秒过渡到更长测试的初学者需要评估短期稳定性的玩家作为日常训练的基准测试',
    faqClick2Q4: '2秒鼠标点击测试的练习方法？',
    faqClick2A4:
      '建议：每天做5组2秒测试，记录平均成绩关注后1秒是否明显下降结合1秒和5秒测试综合训练',
    // 5秒点击测试FAQ
    faqClick5Q1: '5秒鼠标点击测试的核心价值是什么？',
    faqClick5A1:
      '5秒鼠标点击测试是平衡爆发力与耐力的最佳时间窗口。既能体现爆发力，又能考验短期耐力，是评估综合能力的重要指标。',
    faqClick5Q2: '5秒鼠标点击测试的CPS参考标准？',
    faqClick5A2:
      '参考：新手：5-7 CPS（25-35次）普通：7-9 CPS（35-45次）熟练：9-11 CPS（45-55次）优秀：11+ CPS（55+次）',
    faqClick5Q3: '5秒鼠标点击测试时后几秒速度下降怎么办？',
    faqClick5A3:
      '应对策略：调整起始速度，不要一开始就全力建立稳定的点击节奏加强手部耐力训练关注呼吸节奏，保持放松',
    faqClick5Q4: '5秒鼠标点击测试如何判断进步？',
    faqClick5A4:
      '观察指标：CPS提升：整体速度提高稳定性改善：后几秒衰减率降低点击曲线平滑：波动减少',
    // 10秒点击测试FAQ
    faqClick10Q1: '10秒鼠标点击测试主要考验什么？',
    faqClick10A1:
      '10秒鼠标点击测试重点评估持久力和抗疲劳能力。能反映你在较长时间内维持稳定点击的能力，是耐力训练的重要指标。',
    faqClick10Q2: '10秒鼠标点击测试的CPS参考标准？',
    faqClick10A2:
      '参考：新手：4-6 CPS（40-60次）普通：6-8 CPS（60-80次）熟练：8-10 CPS（80-100次）优秀：10+ CPS（100+次）',
    faqClick10Q3: '10秒鼠标点击测试时手部疲劳怎么办？',
    faqClick10A3:
      '应对方法：测试前充分热身保持手腕放松，不要僵硬找到适合自己的节奏如果出现疼痛立即停止',
    faqClick10Q4: '10秒鼠标点击测试的耐力如何提升？',
    faqClick10A4:
      '训练建议：从5秒开始，逐步延长到7秒、10秒每周增加1-2秒训练时间关注后5秒的CPS衰减率（目标＜15%）结合手部力量训练',
    // 15秒点击测试FAQ
    faqClick15Q1: '15秒鼠标点击测试有什么特点？',
    faqClick15A1:
      '15秒鼠标点击测试是中长距离耐力测试，介于10秒和30秒之间。能更准确地评估持续点击能力，同时避免30秒测试的过度疲劳。',
    faqClick15Q2: '15秒鼠标点击测试的CPS参考标准？',
    faqClick15A2:
      '参考：新手：4-5 CPS（60-75次）普通：5-7 CPS（75-105次）熟练：7-9 CPS（105-135次）优秀：9+ CPS（135+次）',
    faqClick15Q3: '15秒鼠标点击测试如何分配体力？',
    faqClick15A3:
      '策略建议：前5秒：保持90%速度，建立节奏中间5秒：维持稳定，关注呼吸后5秒：适当加速冲刺，或保持稳定',
    faqClick15Q4: '15秒鼠标点击测试适合什么训练目标？',
    faqClick15A4: '适合：想从10秒过渡到30秒的进阶训练评估中等时间耐力作为日常训练的常规测试项目',
    // 30秒点击测试FAQ
    faqClick30Q1: '30秒鼠标点击测试的核心价值是什么？',
    faqClick30A1:
      '30秒鼠标点击测试是标准耐力测试，能全面评估手部肌肉的持久力和抗疲劳能力。这是专业训练和电竞选手常用的测试时间。',
    faqClick30Q2: '30秒鼠标点击测试的CPS参考标准？',
    faqClick30A2:
      '参考：新手：3-5 CPS（90-150次）普通：5-7 CPS（150-210次）熟练：7-9 CPS（210-270次）优秀：9+ CPS（270+次）',
    faqClick30Q3: '30秒鼠标点击测试如何应对疲劳？',
    faqClick30A3:
      '应对策略：心理准备：接受后10秒速度会下降节奏控制：前10秒不要过快，保持80%速度呼吸配合：深呼吸，保持放松手部放松：每5秒轻微放松手指',
    faqClick30Q4: '30秒鼠标点击测试的常见问题？',
    faqClick30A4:
      '常见问题：前快后慢，衰减过大（＞25%）手部僵硬，影响速度注意力不集中，节奏混乱设备不适，鼠标过重或垫子不顺滑',
    // 60秒点击测试FAQ
    faqClick60Q1: '60秒鼠标点击测试的意义是什么？',
    faqClick60A1:
      '60秒鼠标点击测试是极限耐力测试，考验手部肌肉的极限持久力。能全面评估抗疲劳能力和意志力，是专业选手的终极测试。',
    faqClick60Q2: '60秒鼠标点击测试的CPS参考标准？',
    faqClick60A2:
      '参考：新手：3-4 CPS（180-240次）普通：4-6 CPS（240-360次）熟练：6-8 CPS（360-480次）优秀：8+ CPS（480+次）',
    faqClick60Q3: '60秒鼠标点击测试如何分配体力？',
    faqClick60A3:
      '体力分配策略：0-15秒：稳定起跑，保持85%速度15-30秒：找到节奏，维持稳定30-45秒：最困难阶段，保持意志力45-60秒：全力冲刺或保持稳定',
    faqClick60Q4: '60秒鼠标点击测试的注意事项？',
    faqClick60A4:
      '重要提醒：充分热身：至少5分钟手部拉伸设备检查：确保鼠标和垫子状态良好环境准备：选择安静、舒适的环境健康第一：出现疼痛立即停止，不要硬撑适度训练：60秒测试强度大，每周不超过2次',
    // 打字测试相关
    minTypingTest: '分钟打字速度测试',
    accuracy: '准确率',
    characters: '字符数',
    textCompleted: '文本已完成',
    clickToStartThenTypeHere: '点击开始后在此输入',
    testFinished: '测试已结束',
    finalScore: '最终成绩',
    totalCharacters: '总字符数',
    correctCharacters: '正确字符数',
    wrongCharacters: '错误字符数',
    // 打字测试FAQ
    whatIsTypingTest: '打字测试是什么？',
    whatIsTypingTestDesc:
      '打字测试是一种评估您的打字速度和准确率的测试。您需要在规定时间内输入显示的文本，系统会计算您的每分钟单词数(WPM)和准确率。打字测试允许您测试键盘上的打字速度和准确性，以判断您的打字能力。',
    whatIsTypingTestUse: '打字测试有什么用？',
    whatIsTypingTestUseDesc:
      '打字测试可以帮助您了解自己的打字速度和准确率，提高工作效率，为求职或游戏竞技做准备。对于办公室工作人员、学生和游戏玩家来说，良好的打字技能都是非常重要的。',
    howToImproveTypingSpeed: '如何提高打字速度？',
    howToImproveTypingSpeedDesc:
      '提高打字速度需要练习。建议使用正确的打字姿势，使用盲打技巧，定期进行打字练习。使用打字测试工具可以帮助您跟踪进步并发现需要改进的地方。',
    whatIsWPM: '什么是WPM？',
    whatIsWPMDesc:
      'WPM(Words Per Minute)是指每分钟单词数，是衡量打字速度的标准指标。一般来说，普通用户的打字速度在30-60 WPM之间，熟练用户可以达到60-100 WPM，专业打字员可以达到100 WPM以上。',
    whatIsGoodAccuracy: '什么是良好的打字准确率？',
    whatIsGoodAccuracyDesc:
      '良好的打字准确率应该在95%以上。如果您的准确率低于90%，建议先注重准确性，然后再提高速度。',
    bestScore: '最佳分数',
    targetEliminationGameDesc: '点击屏幕上的彩色目标来消除它们，在规定时间内获得尽可能高的分数！',
    gameDuration: '游戏时长',
    sec: '秒',
    whatIsTargetEliminationGame: '什么是目标消除反应训练游戏？',
    whatIsTargetEliminationGameDesc:
      '目标消除反应训练游戏是一种测试用户反应速度和手眼协调能力的游戏。玩家需要在规定时间内点击屏幕上出现的彩色目标，消除它们并获得分数。游戏会随机生成多个目标，目标会在屏幕上移动，增加游戏难度。',
    gameRules: '游戏规则',
    gameRulesDesc:
      '1. 点击屏幕上的彩色目标来消除它们2. 每消除一个目标获得10分3. 游戏时长为30秒4. 目标会在屏幕上随机移动5. 游戏结束后会显示最终分数和最佳分数',
    whatIsTargetEliminationGameUsefulFor: '目标消除反应训练游戏有什么用？',
    whatIsTargetEliminationGameUsefulForDesc:
      '目标消除反应训练游戏可以帮助玩家提高反应速度、手眼协调能力和注意力。这些技能对于游戏玩家、运动员和需要快速反应的职业从业者来说都非常重要。定期进行反应训练可以保持大脑的敏捷性，提高在各种情况下的反应速度。',
    howToImproveTargetEliminationScore: '如何提高目标消除反应训练游戏的分数？',
    howToImproveTargetEliminationScoreDesc:
      '1. 保持注意力集中，时刻关注屏幕上的目标2. 练习手眼协调，提高点击准确性3. 找到适合自己的点击节奏4. 定期进行训练，逐渐提高反应速度5. 保持放松，避免紧张影响反应速度',
    targetEliminationGameDesignPrinciple: '目标消除反应训练游戏的设计原理是什么？',
    targetEliminationGameDesignPrincipleDesc:
      '目标消除反应训练游戏基于视觉感知和运动反应机制设计。游戏通过随机生成移动的目标，刺激玩家的视觉系统，然后玩家需要通过手部动作点击目标，这一过程涉及到视觉信息处理、决策制定和运动执行三个阶段。游戏难度通过目标数量和移动速度进行调节，适合不同水平的玩家进行训练。',
    newRecord: '新纪录',
    gameOver: '游戏结束',
    pixelsPerSecond: '像素/秒',
    scrollAsFastAsPossible: '尽可能快地滚动鼠标滚轮！',
    yourBestScore: '你的最佳成绩：',
    settings: '设置',
    blockSize: '方块大小',
    small: '小',
    medium: '中',
    large: '大',
    gameMode: '游戏模式',
    static: '静止',
    dynamic: '移动',
    movementSpeed: '移动速度',
    slow: '慢',
    fast: '快',
    whatIsMouseScrollTest: '什么是鼠标滚动测试？',
    whatIsMouseScrollTestDesc:
      '鼠标滚动测试是一种测试玩家在滚动区域内每秒最高滚动像素的测试。玩家需要在测试区域内快速滚动鼠标滚轮，系统会实时计算滚动速度并记录最高速度。',
    howToImproveScrollSpeed: '如何提高鼠标滚动速度？',
    howToImproveScrollSpeedDesc:
      '1. 使用高品质的鼠标，选择合适的滚轮灵敏度设置2. 练习手腕和手指的协调性3. 找到适合自己的滚动节奏4. 保持放松，避免过度紧张5. 定期进行滚动训练',
    whatDoResultsMean: '测试结果意味着什么？',
    whatDoResultsMeanDesc:
      '测试结果显示的是你在1秒内能够滚动的最大像素数。一般来说，普通玩家的滚动速度在500-1500像素/秒之间，熟练玩家可以达到1500-3000像素/秒，专业玩家甚至可以超过3000像素/秒。',
    isThereTimeLimit: '是否有时间限制？',
    isThereTimeLimitDesc:
      '鼠标滚动测试没有时间限制，你可以无限期地进行测试。系统会持续记录你的最高滚动速度，直到你刷新页面或关闭浏览器。',
    // 首页FAQ相关
    homeFaqQ1: '什么是CPS Test？',
    homeFaqA1:
      'CPS Test（点击速度测试）是一种测量你在特定时间内能够点击鼠标多少次的测试，通过计算每秒点击次数（Clicks Per Second）来评估你的点击速度。它不仅可以帮助你了解自己的手速水平，还能通过长期训练追踪进步，对于游戏玩家、电竞选手和需要快速操作的职业从业者具有重要参考价值。',
    homeFaqQ2: '如何科学地提高点击速度？',
    homeFaqA2:
      '提高点击速度需要系统的练习和正确的方法：\n1. 技巧选择：根据个人习惯选择适合的点击方式（蝴蝶点击、抖动点击、拖动点击等）\n2. 定期训练：每天进行15-30分钟的针对性练习，保持肌肉记忆\n3. 手部热身：测试前进行简单的手部拉伸和放松运动\n4. 设备优化：使用高回报率鼠标（1000Hz）和适合的鼠标垫\n5. 节奏控制：建立稳定的点击节奏，避免过度紧张导致的速度下降\n6. 交叉训练：结合不同时长的测试（1秒、5秒、30秒）全面提升爆发力和耐力',
    homeFaqQ3: 'CPS测试结果的准确性如何保证？',
    homeFaqA3:
      '我们的CPS测试采用可靠的计时和计算方法，确保结果准确可信：\n1. 高精度计时：使用专业的时间测量技术，精度可达0.1毫秒，确保每一次点击都被准确记录\n2. 智能防作弊：内置算法检测异常点击模式，确保测试结果真实可靠\n3. 设备自适应：自动调整不同设备和浏览器的延迟差异，保证公平性\n4. 多次测试建议：建议进行3-5次测试，取平均值作为参考，这样结果更能反映真实水平\n5. 结果影响因素：设备性能、网络状况、测试环境和个人状态都会对结果产生轻微影响，建议在稳定环境下测试',
    homeFaqQ4: '移动设备上的CPS测试与桌面设备有何不同？',
    homeFaqA4:
      '移动设备上的CPS测试具有以下特点：\n1. 操作方式：使用触摸屏点击，而非鼠标物理按键\n2. 速度差异：由于触摸延迟和操作方式不同，移动端CPS通常比桌面端低20-30%\n3. 设备影响：不同手机的屏幕刷新率和触摸响应速度会影响测试结果\n4. 测试体验：我们优化了移动端界面，确保在各种尺寸的设备上都能获得良好的测试体验\n5. 结果参考：移动端测试结果适合横向比较，而非与桌面端直接对比',
    homeFaqQ5: '测试数据如何存储和保护？',
    homeFaqA5:
      '我们采用本地存储机制保护你的测试数据：\n1. 存储位置：所有测试结果保存在你的浏览器本地存储中，不会上传到服务器\n2. 数据安全：数据仅存储在你的设备上，不会被第三方访问\n3. 数据管理：你可以随时清除浏览器缓存来删除测试记录\n4. 跨设备同步：目前不支持跨设备数据同步，建议在固定设备上进行测试\n5. 隐私保护：我们不会收集或分析你的个人测试数据，完全尊重用户隐私',
    homeFaqQ6: '蝴蝶点击（Butterfly Clicking）的原理和技巧是什么？',
    homeFaqA6:
      '蝴蝶点击是一种高级点击技巧，通过快速交替使用食指和中指点击鼠标左键：\n1. 工作原理：利用鼠标微动开关的物理特性，通过双手手指的快速交替动作产生连续点击\n2. 速度范围：熟练掌握后可达到20-30 CPS，甚至更高\n3. 练习方法：保持手腕稳定，手指放松，通过反复练习找到最佳的交替节奏\n4. 适用场景：适合需要短时间爆发高CPS的游戏场景\n5. 设备要求：需要点击感清脆、回弹快的鼠标，不适合按键沉重的办公鼠标',
    homeFaqQ7: '抖动点击（Jitter Clicking）的核心技术和注意事项是什么？',
    homeFaqA7:
      '抖动点击通过快速抖动手臂和手腕来产生连续点击：\n1. 核心原理：利用肌肉的微小抖动驱动手指快速点击鼠标按钮\n2. 速度范围：通常可以实现10-15 CPS，最高可达20 CPS\n3. 练习要点：保持手臂放松，利用手腕的自然抖动，避免过度用力导致肌肉疲劳\n4. 注意事项：长期高强度练习可能导致手腕不适，建议控制练习时间\n5. 适用人群：适合鼠标按键较硬，或不适合蝴蝶点击的用户',
    homeFaqQ8: '拖动点击（Drag Clicking）的实现条件和技巧有哪些？',
    homeFaqA8:
      '拖动点击通过在鼠标按钮上拖动手指来产生连续点击：\n1. 实现原理：利用鼠标微动开关的物理特性，通过摩擦产生的震动触发多次点击\n2. 速度范围：根据鼠标和手法的不同，可实现10-25 CPS\n3. 设备要求：需要特殊的鼠标设计（如磨砂按键表面）和适合的鼠标垫\n4. 练习技巧：找到合适的手指角度和压力，保持稳定的拖动速度\n5. 常见问题：不同鼠标的拖动效果差异较大，需要尝试找到适合的设备\n6. 注意事项：频繁拖动可能会加速鼠标按键的磨损',
    homeFaqQ9: '不同时长的CPS测试分别评估什么能力？',
    homeFaqA9:
      '不同时长的测试评估不同维度的能力：\n1. 1秒测试：评估瞬时爆发力和手速潜力\n2. 5秒测试：平衡爆发力与短期稳定性，是最常用的综合评估指标\n3. 10秒测试：评估持续点击的耐力和节奏保持能力\n4. 30秒测试：标准耐力测试，适合评估长时间操作的稳定性\n5. 60秒测试：极限耐力测试，考验手部肌肉的抗疲劳能力\n建议结合多种时长的测试，全面了解自己的手速特点',
    homeFaqQ10: 'CPS测试结果与实际游戏表现有何关联？',
    homeFaqA10:
      'CPS测试结果与游戏表现有一定关联，但并非绝对：\n1. 相关性：高CPS在需要快速点击的游戏（如Minecraft、CS:GO等）中具有优势\n2. 局限性：游戏表现还取决于反应速度、手眼协调、策略意识等多种因素\n3. 参考价值：CPS测试可以作为手速训练的参考指标，但不能完全代表游戏水平\n4. 专项训练：针对特定游戏的操作需求进行针对性训练，比单纯追求高CPS更有效\n5. 平衡发展：建议将CPS训练与反应速度、准确性训练结合起来',
    homeFaqQ11: '如何避免CPS训练导致的手部疲劳或损伤？',
    homeFaqA11:
      '保护手部健康至关重要，建议遵循以下原则：\n1. 适度训练：每次练习不超过30分钟，避免长时间高强度操作\n2. 正确姿势：保持手腕自然伸直，避免过度弯曲或扭曲\n3. 定期休息：每练习10分钟休息1-2分钟，活动手腕和手指\n4. 手部放松：练习前后进行手部拉伸和按摩\n5. 设备适配：选择符合人体工学的鼠标，调整适合的鼠标灵敏度\n6. 注意信号：如出现手腕疼痛或麻木，应立即停止练习并休息\n7. 交叉活动：定期进行其他非鼠标操作的活动，避免单一动作重复',
    homeFaqQ12: 'CPS测试的历史和发展趋势是什么？',
    homeFaqA12:
      'CPS测试的发展历程和趋势：\n1. 起源：最早源于Minecraft等游戏社区，用于评估玩家的PvP能力\n2. 发展：逐渐扩展到电竞领域，成为手速评估的标准工具\n3. 技术进步：从简单的计数工具发展到具有数据分析和训练建议的专业平台\n4. 多样化：除了鼠标点击，还扩展到空格键点击、键盘按键等多种测试类型\n5. 智能化：未来将融入AI分析，提供个性化的训练方案和进步预测\n6. 社区化：建立玩家排行榜和训练社区，促进相互交流和进步',
    // 鼠标拖动测试相关
    mouseDragTest: '鼠标拖动测试',
    totalDistance: '总距离',
    averageSpeed: '平均速度',
    testDuration: '测试时长',
    clickAndDragToTest: '点击并拖动开始测试',
    dragToStart: '拖动开始',
    dragCompleted: '拖动完成',
    whatIsMouseDragTestQ1: '如何做鼠标拖动测试？',
    whatIsMouseDragTestA1:
      '用鼠标做拖拽测试：将光标放在“鼠标”对象上，按住要测试的鼠标图片，在测试区域内向任意方向移动光标，如果对象一直拖动直到您松开按钮，则您的鼠标拖动功能运行良好。对于触摸屏拖拽测试：触摸“鼠标”图片，在测试区域向任意方向移动，如果它移动，则您的屏幕拖动功能运行良好。',
    faqMouseDragQ1: '你可以用鼠标哪些按钮进行测试？',
    faqMouseDragA1:
      '你可以用鼠标的左键、中键和右键进行测试。虽然几乎都用左键测试，但你也可以用中键或右键测试，具体取决于你的需求和偏好。',
    faqMouseDragQ2: '为什么要测试鼠标拖动？',
    faqMouseDragA2:
      '当你在应用程序或屏幕中拖动某物时，它突然停止移动，尽管你一直在移动鼠标或手指。这可能是应用程序错误或鼠标按钮或屏幕问题',
    // 图片alt属性翻译
    logoAlt: 'CPS Test图标',
    historyIconAlt: '历史记录图标',
    multipleTestTypesIconAlt: '多种测试类型图标',
    realTimeStatsIconAlt: '实时统计数据图标',
    gameifiedExperienceIconAlt: '游戏化体验图标',
    // FAQ组件翻译
    searchQuestion: '搜索问题...',
    popularQuestions: '热门问题',
    relatedQuestions: '相关问题',
    noQuestionFound: '没有找到相关问题，请尝试其他关键词',
    // 404页面翻译
    pageNotFound: '页面未找到',
    pageNotFoundDescription: '抱歉，您访问的页面不存在。请检查URL是否正确，或返回首页继续浏览。',
    goHome: '返回首页',
    searchTest: '搜索测试',
    searchPlaceholder: '搜索测试...',
    search: '搜索',
    // 测试类型描述
    clickTestDesc: '测试你的鼠标点击速度，支持多种时间长度',
    clickTestDescription:
      'CPSTest点击速度测试，支持1秒、2秒、5秒、10秒、15秒、30秒、60秒等多种时间测试，实时显示点击速度和总点击次数，测试结束后提供详细的统计数据和历史记录',
    clickTestKeywords:
      '点击速度测试,CPSTest,鼠标点击测试,点击速度,点击速度测试在线,点击速度测试工具,CPS测试',
    spaceClickTestDesc: '测试你的空格键点击速度，支持多种时间长度',
    spaceClickTestDescription:
      'CPSTest空格点击测试，支持1秒、2秒、5秒、10秒、15秒、30秒、60秒等多种时间测试，专门测试你的空格键点击速度和耐力',
    spaceClickTestKeywords:
      '空格点击测试,空格键测试,空格速度测试,空格点击速度,空格键点击测试工具,CPSTest',
    kohiClickTestDesc: '专业的Minecraft点击测试，固定10秒',
    kohiClickTestDescription:
      'CPSTest Kohi点击测试，源自Minecraft服务器Kohi，固定10秒时长，专门为Minecraft玩家设计，测试持续点击的稳定性和速度',
    kohiClickTestKeywords:
      'Kohi测试,Kohi点击测试,Minecraft点击测试,MC点击测试,10秒点击测试,CPSTest',
    reactionTestDesc: '测试你的视觉反应速度，测量从刺激到反应的时间',
    reactionTestDescription:
      'CPSTest反应时间测试，测量你的视觉反应速度，从绿色方块出现到鼠标点击的时间间隔，提供平均反应时间和最佳反应时间统计',
    reactionTestKeywords:
      '反应时间测试,反应速度测试,视觉反应测试,反应测试,反应速度测试工具,CPSTest',
    colorReactionTestDescription:
      'CPSTest颜色反应测试，测试你的颜色识别和反应速度，忽略文字内容，点击与文字匹配的颜色方块，挑战你的大脑反应能力',
    colorReactionTestKeywords:
      '颜色反应测试,颜色识别测试,视觉反应测试,颜色反应速度测试,颜色测试,CPSTest',
    keyReactionTestDescription:
      'CPSTest按键反应测试，评估你对WASD按键的反应速度，游戏随机高亮按键，你需要尽快按下对应按键，适合游戏玩家训练',
    keyReactionTestKeywords:
      '按键反应测试,WASD反应测试,游戏反应测试,按键速度测试,游戏玩家训练,CPSTest',
    targetEliminationGameDescription:
      'CPSTest目标消除反应训练游戏，测试你的反应速度和手眼协调能力，在规定时间内点击屏幕上的彩色目标，获得尽可能高的分数',
    targetEliminationGameKeywords:
      '目标消除游戏,反应速度训练,手眼协调训练,反应游戏,目标消除测试,CPSTest',
    mouseScrollTestDesc: '测试你的鼠标滚动速度，测量每秒滚动像素数',
    mouseScrollTestDescription:
      'CPSTest鼠标滚动测试，测试你的鼠标滚动速度，测量每秒滚动的像素数，适合需要快速滚动的游戏和工作场景',
    mouseScrollTestKeywords: '鼠标滚动测试,滚动速度测试,鼠标滚动速度,滚动测试,鼠标测试,CPSTest',
    mouseDragTestDesc: '测试你的鼠标拖动速度和精度',
    mouseDragTestDescription:
      'CPSTest鼠标拖动测试，测试你的鼠标拖动速度和精度，记录拖动距离和平均速度，适合需要精确拖动的工作和游戏场景',
    mouseDragTestKeywords: '鼠标拖动测试,拖动速度测试,鼠标拖动速度,拖动测试,鼠标测试,CPSTest',
    keyboardTestDescription:
      'CPSTest键盘测试，检测你的键盘按键是否正常工作，实时显示按键状态和已按下的按键列表，帮助你了解键盘的灵敏度和按键状态',
    keyboardTestKeywords: '键盘测试,键盘按键测试,键盘功能测试,按键测试,键盘检测,CPSTest',
    typingTestDesc: '测试你的打字速度和准确率，支持多种时间长度',
    typingTestDescription:
      'CPSTest打字测试，测试你的打字速度和准确率，支持1分钟、3分钟、5分钟、10分钟、15分钟等多种时间测试，实时显示打字速度和准确率',
    typingTestKeywords: '打字测试,打字速度测试,打字准确率测试,打字练习,打字速度,CPSTest',
    doubleClickTestDesc: '测试你的双击速度和准确性',
    doubleClickTestDescription:
      'CPSTest双击连点测试，测试你的双击速度和准确性，记录双击次数和最佳双击速度，适合需要快速双击的游戏和工作场景',
    doubleClickTestKeywords: '双击测试,连点测试,双击连点测试,双击速度测试,双击次数测试,CPSTest',
    tripleClickTestDesc: '测试你的三连击速度和准确性',
    tripleClickTestDescription:
      'CPSTest三连击测试，测试你的三连击速度和准确性，记录三连击次数和最佳三连击速度，挑战你的点击技巧极限',
    tripleClickTestKeywords:
      '三连击测试,三连点击测试,三连击速度测试,三连击次数测试,三连击测试工具,CPSTest',
    privacyPolicy: '隐私政策',
    privacyPolicyTitle: '隐私政策 - CPSTestGo.com',
    privacyPolicyDescription: 'CPSTest隐私政策，详细说明我们如何收集、使用和保护您的数据',
    privacyPolicyKeywords: '隐私政策,CPSTest,数据保护,用户隐私',
    privacyIntroductionTitle: '隐私与政策',
    privacyIntroduction:
      '欢迎访问CPSTest（网站地址：<a href="/" style="color: #4CAF50 !important; font-weight: bold !important; text-decoration: none !important;" target="_self">https://www.cpstestgo.com</a>）。本隐私政策（CPS Test隐私政策）旨在向您说明我们如何收集、使用、存储和保护您在使用我们服务时提供的个人信息。我们非常重视您的隐私保护，承诺严格遵守相关法律法规，确保您的个人信息安全。请您仔细阅读本隐私政策，了解我们的隐私保护实践。',
    privacyDataCollectionTitle: '数据收集',
    privacyDataCollection: '当您使用我们的服务时，我们可能会收集以下类型的数据：',
    privacyDataCollection1:
      '设备信息：我们可能会收集您的设备型号、操作系统版本、浏览器类型、IP地址等信息，用于分析服务使用情况和优化服务体验。',
    privacyDataCollection2:
      '使用数据：我们可能会收集您使用我们服务的方式、访问的页面、点击的链接、停留时间等信息，用于改进我们的服务和提供个性化体验。',
    privacyDataCollection3:
      '测试数据：我们可能会收集您在使用测试功能时生成的数据，如点击速度、反应时间等，用于提供测试结果和历史记录。',
    privacyDataUseTitle: '数据使用',
    privacyDataUse: '我们收集的数据将用于以下目的：',
    privacyDataUse1: '提供和维护我们的服务，确保服务的正常运行和安全性。',
    privacyDataUse2: '改进和优化我们的服务，根据用户反馈和使用情况不断提升服务质量。',
    privacyDataUse3: '向您提供个性化的服务体验，如根据您的兴趣推荐相关内容。',
    privacyDataUse4: '生成测试结果和历史记录，方便您查看和比较自己的测试数据。',
    privacyDataUse5: '分析服务使用趋势，优化测试算法和功能设计。',
    privacyConsentTitle: '同意',
    privacyConsentContent: '使用我们的网站即表示您同意我们的隐私政策并同意其条款。',
    privacyDataSharingTitle: '我们为什么收集信息',
    privacyDataSharing:
      '为了向您提供更好的测试服务体验，我们需要收集必要的信息来优化服务质量、提供个性化体验和生成准确的测试结果。我们保证不会出售您的个人信息，也不会将您的个人信息出租或转让给任何第三方用于商业目的。',
    privacyPolicyChangesTitle: '政策变更',
    privacyPolicyChanges:
      '我们可能会不时更新本隐私政策。当我们进行重大变更时，我们会通过网站公告或其他方式通知您。您继续使用我们的服务即表示您接受更新后的隐私政策。',
    privacyDataStorageTitle: '数据存储与安全',
    privacyDataStorage: '我们采用严格的安全措施保护您的数据，包括：',
    privacyDataStorage1: '数据加密：我们使用行业标准的加密技术保护您的数据传输和存储。',
    privacyDataStorage2: '访问控制：我们限制对您数据的访问，只有授权人员才能访问。',
    privacyDataStorage3: '安全审计：我们定期进行安全审计，确保我们的安全措施有效。',
    privacyUserRightsTitle: '用户权利',
    privacyUserRights: '根据相关法律法规，您享有以下权利：',
    privacyUserRights1: '访问权：您有权访问我们收集的关于您的个人信息。',
    privacyUserRights2: '更正权：您有权更正我们收集的关于您的不准确个人信息。',
    privacyUserRights3: '删除权：在特定情况下，您有权要求我们删除您的个人信息。',
    privacyUserRights4: '数据可携带权：您有权要求我们以结构化、机器可读的格式提供您的个人信息。',
    privacyUserRights5: '拒绝权：您有权拒绝我们处理您的个人信息，除非我们有合法理由继续处理。',
    privacyCookiePolicyTitle: 'Cookie政策',
    privacyCookiePolicy:
      '我们使用Cookie来改善您的浏览体验和服务质量。Cookie是存储在您设备上的小型文本文件，用于识别您的设备和偏好。',
    privacyCookiePolicy1:
      '必要Cookie：这些Cookie对于我们服务的正常运行至关重要，无法在不影响功能的情况下禁用。',
    privacyCookiePolicy2:
      '分析Cookie：这些Cookie帮助我们了解您如何使用我们的服务，以便我们改进服务。',
    privacyCookiePolicy3: '功能Cookie：这些Cookie允许我们为您提供个性化体验和记住您的偏好。',
    privacyCookiePolicy4:
      '如何管理Cookie：您可以通过浏览器设置管理或删除Cookie。请注意，禁用某些Cookie可能会影响您的服务体验。',
    privacyThirdPartyServicesTitle: '第三方服务',
    privacyThirdPartyServices:
      '我们可能会使用第三方服务来帮助我们提供和改进我们的服务。这些第三方服务可能会收集您的信息，因此我们建议您阅读他们的隐私政策：',
    privacyThirdPartyServices1:
      '分析服务：我们使用Google Analytics等服务来分析网站流量和用户行为。',
    privacyThirdPartyServices2: '广告服务：我们可能会使用第三方广告服务来展示相关广告。',
    privacyThirdPartyServices3: '支付服务：如果我们提供付费服务，我们会使用安全的第三方支付服务。',
    privacyChildrenPrivacyTitle: '儿童隐私保护',
    privacyChildrenPrivacy:
      '我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现我们收集了13岁以下儿童的个人信息，我们会立即删除这些信息。',
    privacyDataRetentionTitle: '数据保留与删除',
    privacyDataRetention: '我们会根据以下原则保留您的数据：',
    privacyDataRetention1: '必要期限：我们会在提供服务所需的期限内保留您的数据。',
    privacyDataRetention2: '法律要求：如果法律要求，我们会在规定的期限内保留您的数据。',
    privacyDataRetention3:
      '删除政策：当您要求删除数据或数据不再需要时，我们会安全地删除或匿名化您的数据。',
    copyright: '© 2025 CPSTestGo - 版权所有',
    // ResultModal组件翻译
    resultModal: {
      // 详细信息
      details: '{time}秒内单击{clicks}次点击次',
      // 按钮文本
      okButton: '好',
      // 不同CPS范围的描述
      slow: {
        desc1: '你的点击速度较慢，还需要多加练习！',
        desc2: '不要灰心，继续努力，你会变得更快！'
      },
      average: {
        desc1: '你的点击速度一般，还有提升空间！',
        desc2: '不错的表现，继续保持这个节奏！'
      },
      fast: {
        desc1: '你的点击速度很快，已经超过了大多数人！',
        desc2: '太棒了，你的手速真的很快！'
      },
      superFast: {
        desc1: '你的点击速度超级快，简直像闪电一样！',
        desc2: '太惊人了，你是天生的点击高手！'
      },
      ultraFast: {
        desc1: '你的点击速度突破了极限，你是点击之神！',
        desc2: '不可能！你的手速已经超越了人类的认知！'
      },
      // CPS反馈
      feedback: {
        slow: '结果不好，很慢。',
        average: '结果不错，继续努力！',
        fast: '结果很好，你是点击高手！',
        superFast: '结果非常好，你是点击大师！',
        ultraFast: '结果太棒了，你是点击之神！'
      }
    },
  },
  en: {
    websiteName: 'CPS Test - Click Speed and Reaction Training Platform',
    metaDescription:
      'CPS Test - Free, professional, fast click speed testing platform with real-time feedback and comprehensive test items, including reaction time test, typing test and more, supporting multiple languages and recording historical scores',
    metaKeywords:
      'CPS Test,free test,professional test,real-time test,fast test,comprehensive test,click speed test,reaction time test,typing test,mouse scroll test,space click test',
    ogDescription:
      'CPS Test platform, free, professional click speed training system, providing fast, real-time test feedback and comprehensive training items, supporting multiple languages and recording historical scores',
    schemaDescription:
      'CPS Test platform, free, professional click speed training system, providing fast, real-time test feedback and comprehensive training items, supporting multiple languages and recording historical scores',
    schemaName: 'CPS Test - Click Speed and Reaction Training Platform',
    schemaPublisher: 'CPS Test Platform',
    home: 'Home',
    popularTests: 'Popular Tests',
    quickLinks: 'Quick Links',
    clickTest: 'Click Speed Test',
    clickSeriesTest: 'Click Series Test',
    doubleClickTest: 'Double Click Test',
    clicks: 'clicks',
    secClickTest: 'Second Click Test',
    '1secClickTest': '1 Second Click Test',
    '2secClickTest': '2 Second Click Test',
    '5secClickTest': '5 Second Click Test',
    '10secClickTest': '10 Second Click Test',
    '15secClickTest': '15 Second Click Test',
    '30secClickTest': '30 Second Click Test',
    '60secClickTest': '60 Second Click Test',
    spaceClickTest: 'Space Click Test',
    secSpaceTest: 'Second Space Test',
    '1secSpaceTest': '1 Second Space Test',
    '5secSpaceTest': '5 Second Space Test',
    '10secSpaceTest': '10 Second Space Test',
    '15secSpaceTest': '15 Second Space Test',
    '30secSpaceTest': '30 Second Space Test',
    '60secSpaceTest': '60 Second Space Test',
    kohiClickTest: 'Kohi Click Test',
    typingTest: 'Typing Test',
    '1minTypingTest': '1 Minute Typing Test',
    '3minTypingTest': '3 Minute Typing Test',
    '5minTypingTest': '5 Minute Typing Test',
    '10minTypingTest': '10 Minute Typing Test',
    '15minTypingTest': '15 Minute Typing Test',
    reactionTest: 'Reaction Time Test',
    simpleReactionTest: 'Simple Reaction Test',
    colorReactionTest: 'Color Reaction Test',
    keyReactionTest: 'Key Reaction Test (WASD)',
    targetEliminationGame: 'Target Elimination Reaction Training Game',
    mouseScrollTest: 'Mouse Scroll Test',
    login: 'Login',
    justNow: 'Just Now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    removeAll: 'Clear All',
    startGame: 'Start Game',
    clickHere: 'Click Here',
    cps: 'Clicks Per Second',
    timer: 'Timer',
    clickPerSecond: 'clicks/second',
    score: 'Score',
    reactionTime: 'Reaction Time',
    average: 'Average',
    best: 'Best',
    round: 'Round',
    time: 'Time',
    reset: 'Reset',
    continue: 'Continue',
    finish: 'Finish',
    tryAgain: 'Try Again',
    ms: 'ms',
    readyToStart: 'Ready to Start',
    simpleReactionTestDesc:
      'Click the button below to start the test. When the green square appears, click it as quickly as possible!',
    colorReactionTestDesc:
      'Click the button below to start the test. When colored text appears, ignore the text content and click the color square that matches the text content as quickly as possible!',
    startTest: 'Start Test',
    leftButton: 'Left Mouse Button',
    middleButton: 'Mouse Scroll Wheel',
    rightButton: 'Right Mouse Button',
    leftMouseButton: 'Left Mouse Button',
    rightMouseButton: 'Right Mouse Button',
    selectMouseButton: 'Select Mouse Button',
    totalClicks: 'Total Clicks',
    doubleClicks: 'Double Clicks',
    bestDoubleSpeed: 'Best Speed',
    clickHereToTest: 'Click the Game Area to Start Testing',
    gettingReady: 'Getting Ready...',
    faqDoubleClickQ1: 'What is the double click test?',
    faqDoubleClickA1:
      'The double click test is a test to measure your double click speed and accuracy. The system will record your total clicks, double clicks, and best double click speed.',
    faqDoubleClickQ2: 'How to improve double click speed?',
    faqDoubleClickA2:
      'Improving double click speed requires practice. It is recommended to use a stable mouse, adjust appropriate mouse sensitivity, and find a clicking rhythm that suits you.',
    tripleClickTest: 'Triple Click Test',
    tripleClicks: 'Triple Clicks',
    bestTripleSpeed: 'Best Speed',
    faqTripleClickQ1: 'What is the triple click test?',
    faqTripleClickA1:
      'The triple click test is a test to measure your triple click speed and accuracy. The system will record your total clicks, triple clicks, and best triple click speed.',
    faqTripleClickQ2: 'How to improve triple click speed?',
    faqTripleClickA2:
      'Improving triple click speed requires practice. It is recommended to use a stable mouse, adjust appropriate mouse sensitivity, and find a clicking rhythm that suits you.',
    waiting: 'Waiting',
    simpleReactionTestWaiting: 'Please focus, the green square is about to appear!',
    colorReactionTestWaiting: 'Please focus, the colored text is about to appear!',
    nextTestComing: 'Next test coming soon...',
    history: 'History',
    noHistory: 'No history yet',
    reactionTestQ1: 'What is the reaction time test?',
    reactionTestDescriptionText:
      'The reaction time test is a game that measures your visual reaction speed. During the test, green squares will randomly appear on the screen, and you need to click them as quickly as possible. The system will record your reaction time, calculate the average reaction time and the best reaction time. The reaction time test allows you to test your reaction speed and attention level.',
    reactionTestUsefulness: 'What is the use of the reaction time test?',
    reactionTestUsefulnessText:
      'The reaction time test can help you understand your reaction speed and attention level. For gamers, athletes and professionals who need quick reactions, good reaction time is very important.',
    reactionTimeRange: 'What is the normal reaction time range?',
    reactionTimeRangeText:
      'The average human visual reaction time is approximately 250-300 milliseconds. Excellent reaction time is usually between 150-250 milliseconds, and professional athletes or gamers can achieve 100-150 milliseconds.',
    howToImproveReaction: 'How to improve reaction time?',
    howToImproveReactionText:
      'Improving reaction time requires practice. It is recommended to do attention training, visual tracking exercises, and reaction speed games. Maintaining good sleep and a healthy lifestyle also helps improve reaction speed.',
    reactionTestPrinciple: 'What is the principle of the reaction time test?',
    reactionTestPrincipleText:
      'The reaction time test is based on human visual perception and motor response mechanisms. The test evaluates your reaction speed by measuring the time interval from visual stimulus (target appearance) to motor response (mouse click).',
    // Direction keys
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    // Key reaction test related
    keyReactionTestDesc: 'Press W/A/S/D when the arrow lights up.',
    clickToStart: 'Click to Start',
    tooSoon: 'Too soon...',
    pressWasdToReturn: 'Press W/A/S/D to return or click Retry.',
    wrongKey: 'Wrong key!',
    pressTheGreenOne: 'Press the green one.',
    clickToContinue: 'Click to continue...',
    keyReactionTestResults: 'Key Reaction Test Results',
    yourAverageReactionTime: '⏳ Your Reaction Time',
    yourReactionTime: 'Your Reaction Time',
    youCanDoBetter: 'You can do better!',
    notTheFastestStart:
      "Not the fastest start, but don't worry—reaction speed gets faster with practice. Keep training and you'll be a flash soon! ⚡",
    restartGame: 'Restart Game',
    whatIsKeyReactionTest: 'What is the key reaction test?',
    whatIsKeyReactionTestDesc:
      'The key reaction test is a test to evaluate your reaction speed to WASD keys. The game will randomly highlight a key, and you need to press the corresponding key as quickly as possible. The system will record your reaction time.',
    whatIsColorReactionTest: 'What is the color reaction test?',
    whatIsColorReactionTestDesc:
      'The color reaction test is a test to evaluate your color recognition and reaction speed. The game will randomly display colored text, and you need to ignore the text content and click the color square that matches the text content as quickly as possible.',
    howToGetBetterScore: 'How to get a better score?',
    howToGetBetterScoreDesc:
      "Keep your fingers on the WASD keys, focus on the screen, relax, and don't be too nervous. You can improve your key reaction speed through multiple practices.",
    howResultsCalculated: 'How are test results calculated?',
    howResultsCalculatedDesc:
      'The system will record your reaction time for each round, and finally calculate the average reaction time of 5 rounds as the final score.',
    whyTooSoon: 'Why does it sometimes show "Too soon"?',
    whyTooSoonDesc:
      'This means you pressed the key before it was highlighted. Please wait for the key to turn green before pressing the corresponding key.',
    // Common game terms
    spaceBar: 'Space Bar',
    pressSpaceToStart: 'Press Space to Start',
    clickSpaceToStart: 'Click Space to Start',
    // Home page related
    welcomeToCps: 'Welcome to CPS Test Platform',
    improveSkills: 'Improve Your Reaction Speed and Clicking Skills',
    multipleTestTypes: 'Multiple Test Types',
    multipleTestTypesDesc:
      'Provide multiple test types including click test, reaction test, typing test, etc., to comprehensively improve your skills',
    realTimeStats: 'Real-time Statistics',
    realTimeStatsDesc:
      'Display test results and statistics in real-time to help you understand your performance',
    historyRecords: 'History Records',
    historyRecordsDesc: 'Save your test history to track your progress and growth',
    gamifiedExperience: 'Gamified Experience',
    gamifiedExperienceDesc: 'Interesting gamified design makes testing more vivid and fun',
    quickStart: 'Quick Start',
    testYourClickSpeed: 'Test Your Click Speed',
    testYourReactionSpeed: 'Test Your Reaction Speed',
    testYourTypingSpeed: 'Test Your Typing Speed',
    testYourSpaceClickSpeed: 'Test Your Space Click Speed',
    professionalMinecraftClickTest: 'Professional Minecraft Click Test',
    testYourColorReactionSpeed: 'Test Your Color Recognition Reaction Speed',
    testYourWasdReactionSpeed: 'Test Your WASD Key Reaction Speed',
    trainYourReactionAndAim: 'Train Your Reaction and Aim',
    testYourMouseScrollSpeed: 'Test Your Mouse Scroll Speed',
    testYourMouseDragSpeed: 'Test Your Mouse Drag Speed',
    keyboardTest: 'Keyboard Test',
    keyboardTestDesc: 'You can check all keyboard buttons here:',
    faq: 'FAQ',
    whatIsKeyboardTest: 'What is the keyboard test for?',
    keyboardTestPurpose:
      'The keyboard test is used to detect whether your keyboard keys are working normally, while recording your keystroke sequence and response time. Through this test, you can understand the sensitivity and key status of the keyboard, helping you determine whether the keyboard needs cleaning or replacement.',
    pressedKeys: 'Pressed Keys',
    noKeysPressed: 'No keys pressed',
    platformFeatures: 'Platform Features',
    accurateTesting: 'Accurate Testing',
    accurateTestingDesc:
      'Adopt high-precision timing and statistical algorithms to ensure the accuracy of test results',
    responsiveDesign: 'Responsive Design',
    responsiveDesignDesc: 'Adapt to various devices, conduct tests anytime, anywhere',
    achievementSystem: 'Achievement System',
    achievementSystemDesc:
      'Complete tests of different difficulty levels to unlock various achievements',
    communityFeatures: 'Community Features',
    communityFeaturesDesc: 'Compare scores with other users and share your progress',
    testGuide: 'Test Guide',
    selectTestType: 'Select Test Type',
    selectTestTypeDesc: 'Select the test type you want to perform from the left menu',
    startTestDesc: 'Start the test according to the prompts and focus on the test process',
    viewResults: 'View Results',
    viewResultsDesc: 'View your scores and statistics after the test ends',
    practiceContinuously: 'Practice Continuously',
    practiceContinuouslyDesc: 'Improve your skills through multiple tests and track your progress',
    // FAQ related
    faqTitle: '{time} Second Click Test FAQ',
    faqDesc:
      '{time} Second Click Test is a test to evaluate your clicking speed within a fixed time. Depending on different test durations, you can evaluate your explosive power, short-term stability, or long-term endurance. After the test, the system will calculate your Clicks Per Second (CPS).',
    spaceFaqTitle: '{time} Second Space Click Test FAQ',
    spaceFaqDesc:
      '{time} Second Space Click Test is a test to evaluate your space bar clicking speed within a fixed time. Depending on different test durations, you can evaluate your explosive power, short-term stability, or long-term endurance. After the test, the system will calculate your Clicks Per Second (CPS).',
    // 1 second click test FAQ
    faqClick1Q1: 'What does the 1-second mouse click test mainly measure?',
    faqClick1A1:
      'The 1-second mouse click test measures instantaneous explosive power, testing the maximum clicking speed your fingers can achieve in a very short time. This is the most classic CPS Test, which can quickly evaluate hand speed potential.',
    faqClick1Q2: 'How many CPS is considered qualified in the 1-second mouse click test?',
    faqClick1A2:
      'Reference standards:\nBeginner: 6-8 CPS\nAverage: 8-10 CPS\nSkilled: 10-12 CPS\nExcellent: 12-15 CPS\nProfessional: 15+ CPS',
    faqClick1Q3: 'Why do the results of the 1-second mouse click test fluctuate greatly?',
    faqClick1A3:
      'Reasons include: unstable starting rhythm, finger tension causing卡顿, inattention, device response delay',
    faqClick1Q4: 'How to improve the score of the 1-second mouse click test?',
    faqClick1A4:
      'Suggestions: Keep your fingers relaxed, do not use excessive force, find a clicking rhythm that suits you, do hand warm-up before testing, use a high polling rate mouse (1000Hz)',
    // 1 second space click test FAQ
    spaceFaq1Q1: 'What does the 1-second space click test mainly measure?',
    spaceFaq1A1:
      'The 1-second space click test measures instantaneous explosive power, testing the maximum clicking speed your fingers can achieve in a very short time. This is the most classic space bar CPS Test, which can quickly evaluate space bar hand speed potential.',
    spaceFaq1Q2: 'How many CPS is considered qualified in the 1-second space click test?',
    spaceFaq1A2:
      'Reference standards: Beginner: 5-7 CPS Average: 7-9 CPS Skilled: 9-11 CPS Excellent: 11-14 CPS Professional: 14+ CPS',
    spaceFaq1Q3: 'Why do the results of the 1-second space click test fluctuate greatly?',
    spaceFaq1A3:
      'Reasons include: unstable starting rhythm, finger tension causing卡顿, inattention, keyboard response delay',
    spaceFaq1Q4: 'How to improve the score of the 1-second space click test?',
    spaceFaq1A4:
      'Suggestions: Keep your fingers relaxed, do not use excessive force, find a clicking rhythm that suits you, do hand warm-up before testing, use a mechanical keyboard or high-response keyboard',
    // 2 second space click test FAQ
    spaceFaq2Q1:
      'What is the difference between the 2-second space click test and the 1-second test?',
    spaceFaq2A1:
      'The 2-second space click test adds short-term stability requirements to the 1-second test. The 1-second test only looks at explosive power, while the 2-second test requires maintaining high-speed clicking, which better reflects the real level.',
    spaceFaq2Q2:
      'Should the CPS of the 2-second space click test be lower than that of the 1-second test?',
    spaceFaq2A2:
      'Yes, normal situation: 2-second CPS ≈ 1-second CPS × 0.9-0.95 If the gap is too large (e.g., 2-second CPS < 1-second CPS × 0.85), it indicates insufficient endurance',
    spaceFaq2Q3: 'What crowd is the 2-second space click test suitable for?',
    spaceFaq2A3:
      'Suitable for: beginners who want to transition from 1-second to longer tests, players who need to evaluate short-term stability, as a benchmark test for daily training',
    spaceFaq2Q4: 'Practice method for the 2-second space click test?',
    spaceFaq2A4:
      'Suggestions: Do 5 sets of 2-second tests every day, record the average score, pay attention to whether the last 1 second drops significantly, combine 1-second and 5-second tests for comprehensive training',
    // 5 second space click test FAQ
    spaceFaq5Q1: 'What is the core value of the 5-second space click test?',
    spaceFaq5A1:
      'The 5-second space click test is the best time window to balance explosive power and endurance. It can reflect both explosive power and test short-term endurance, and is an important indicator to evaluate comprehensive ability.',
    spaceFaq5Q2: 'What is the CPS reference standard for the 5-second space click test?',
    spaceFaq5A2:
      'Reference: Beginner: 5-7 CPS (25-35 times) Average: 7-9 CPS (35-45 times) Skilled: 9-11 CPS (45-55 times) Excellent: 11+ CPS (55+ times)',
    spaceFaq5Q3:
      'What to do if the speed drops in the later seconds during the 5-second space click test?',
    spaceFaq5A3:
      'Coping strategies: Adjust the starting speed, do not go all out at the beginning, establish a stable clicking rhythm, strengthen hand endurance training, pay attention to breathing rhythm, keep relaxed',
    spaceFaq5Q4: 'How to judge progress in the 5-second space click test?',
    spaceFaq5A4:
      'Observation indicators: CPS improvement: overall speed increase, stability improvement: reduced attenuation rate in later seconds, smooth clicking curve: reduced fluctuations',
    // 10 second space click test FAQ
    spaceFaq10Q1: 'What does the 10-second space click test mainly test?',
    spaceFaq10A1:
      'The 10-second space click test focuses on assessing endurance and anti-fatigue ability. It can reflect your ability to maintain stable clicking over a longer period of time, and is an important indicator for endurance training.',
    spaceFaq10Q2: 'What is the CPS reference standard for the 10-second space click test?',
    spaceFaq10A2:
      'Reference: Beginner: 4-6 CPS (40-60 times) Average: 6-8 CPS (60-80 times) Skilled: 8-10 CPS (80-100 times) Excellent: 10+ CPS (100+ times)',
    spaceFaq10Q3: 'What to do if your hand gets tired during the 10-second space click test?',
    spaceFaq10A3:
      'Coping methods: Fully warm up before testing, keep your wrist relaxed, do not stiffen, find a clicking rhythm that suits you, stop immediately if pain occurs',
    spaceFaq10Q4: 'How to improve endurance in the 10-second space click test?',
    spaceFaq10A4:
      'Training suggestions: Start from 5 seconds, gradually extend to 7 seconds, 10 seconds, increase training time by 1-2 seconds per week, pay attention to the CPS attenuation rate in the last 5 seconds (target < 15%), combine with hand strength training',
    // 15 second space click test FAQ
    spaceFaq15Q1: 'What are the characteristics of the 15-second space click test?',
    spaceFaq15A1:
      'The 15-second space click test is a medium-long distance endurance test, between 10 seconds and 30 seconds. It can more accurately evaluate continuous clicking ability while avoiding excessive fatigue from the 30-second test.',
    spaceFaq15Q2: 'What is the CPS reference standard for the 15-second space click test?',
    spaceFaq15A2:
      'Reference: Beginner: 4-5 CPS (60-75 times) Average: 5-7 CPS (75-105 times) Skilled: 7-9 CPS (105-135 times) Excellent: 9+ CPS (135+ times)',
    spaceFaq15Q3: 'How to distribute physical strength in the 15-second space click test?',
    spaceFaq15A3:
      'Strategy suggestions: First 5 seconds: keep 90% speed, establish rhythm, Middle 5 seconds: maintain stability, pay attention to breathing, Last 5 seconds: properly accelerate sprint, or maintain stability',
    spaceFaq15Q4: 'What training goals is the 15-second space click test suitable for?',
    spaceFaq15A4:
      'Suitable for: advanced training from 10 seconds to 30 seconds, evaluate medium-time endurance, as a regular test item for daily training',
    // 30 second space click test FAQ
    spaceFaq30Q1: 'What is the core value of the 30-second space click test?',
    spaceFaq30A1:
      'The 30-second space click test is a standard endurance test, which can comprehensively evaluate the endurance and anti-fatigue ability of hand muscles. This is the test time commonly used by professional training and esports players.',
    spaceFaq30Q2: 'What is the CPS reference standard for the 30-second space click test?',
    spaceFaq30A2:
      'Reference: Beginner: 3-5 CPS (90-150 times) Average: 5-7 CPS (150-210 times) Skilled: 7-9 CPS (210-270 times) Excellent: 9+ CPS (270+ times)',
    spaceFaq30Q3: 'How to deal with fatigue in the 30-second space click test?',
    spaceFaq30A3:
      'Coping strategies: Psychological preparation: accept that speed will drop in the last 10 seconds, Rhythm control: do not go too fast in the first 10 seconds, keep 80% speed, Breathing coordination: deep breathing, keep relaxed, Hand relaxation: slightly relax fingers every 5 seconds',
    spaceFaq30Q4: 'Common problems in the 30-second space click test?',
    spaceFaq30A4:
      'Common problems: fast at first, slow later, excessive attenuation (>25%), stiff hands affecting speed, inattention, rhythm chaos, uncomfortable equipment, keyboard too heavy or key travel inappropriate',
    // 60 second space click test FAQ
    spaceFaq60Q1: 'What is the significance of the 60-second space click test?',
    spaceFaq60A1:
      'The 60-second space click test is an extreme endurance test, testing the limit endurance of hand muscles. It can comprehensively evaluate anti-fatigue ability and willpower, and is the ultimate test for professional players.',
    spaceFaq60Q2: 'What is the CPS reference standard for the 60-second space click test?',
    spaceFaq60A2:
      'Reference: Beginner: 3-4 CPS (180-240 times) Average: 4-6 CPS (240-360 times) Skilled: 6-8 CPS (360-480 times) Excellent: 8+ CPS (480+ times)',
    spaceFaq60Q3: 'How to distribute physical strength in the 60-second space click test?',
    spaceFaq60A3:
      'Physical distribution strategy: 0-15 seconds: stable start, keep 85% speed, 15-30 seconds: find rhythm, maintain stability, 30-45 seconds: most difficult stage, maintain willpower, 45-60 seconds: all-out sprint or maintain stability',
    spaceFaq60Q4: 'Notes for the 60-second space click test?',
    spaceFaq60A4:
      'Important reminders: Fully warm up: at least 5 minutes of hand stretching, Equipment check: ensure keyboard is in good condition, Environment preparation: choose a quiet, comfortable environment, Health first: stop immediately if pain occurs, do not force, Moderate training: 60-second test is intensive, no more than 2 times a week',
    // Kohi click test FAQ
    kohiFaqDesc:
      'The Kohi click test is a special click speed test originating from the Minecraft server Kohi. The test duration is fixed at 10 seconds, and players need to click the screen as quickly as possible. After the test, the final CPS value will be displayed. Kohi test is specially designed for Minecraft players, with more emphasis on the stability of continuous clicking.',
    kohiFaqQ1: 'What is the Kohi click test?',
    kohiFaqA1:
      'The Kohi click test is a special click speed test originating from the Minecraft server Kohi. The test duration is fixed at 10 seconds, and players need to click the screen as quickly as possible. After the test, the final CPS value will be displayed. Kohi test is specially designed for Minecraft players, with more emphasis on the stability of continuous clicking.',
    kohiFaqQ2: 'What is the difference between Kohi click test and ordinary CPS Test?',
    kohiFaqA2:
      "The Kohi click test is specially designed for Minecraft players, with a fixed test duration of 10 seconds, and more emphasis on the stability of continuous clicking. It is widely used in the Minecraft community to measure players' PvP ability.",
    kohiFaqQ3: 'What is the use of Kohi test?',
    kohiFaqA3:
      'Kohi test can help Minecraft players understand their clicking speed and stability, which is very important in PvP battles. High Kohi CPS can give players an advantage in battles, especially in close combat.',
    kohiFaqQ4: 'How to improve Kohi CPS?',
    kohiFaqA4:
      'Improving Kohi CPS requires practicing specific clicking techniques, such as butterfly clicking, jitter clicking, or drag clicking. At the same time, using a suitable mouse and mouse pad can also improve clicking speed and stability.',
    // 2 second click test FAQ
    faqClick2Q1:
      'What is the difference between the 2-second mouse click test and the 1-second test?',
    faqClick2A1:
      'The 2-second mouse click test adds short-term stability requirements to the 1-second test. The 1-second test only looks at explosive power, while the 2-second test requires maintaining high-speed clicking, which better reflects the real level.',
    faqClick2Q2:
      'Should the CPS of the 2-second mouse click test be lower than that of the 1-second test?',
    faqClick2A2:
      'Yes, normal situation: 2-second CPS ≈ 1-second CPS × 0.9-0.95. If the gap is too large (e.g., 2-second CPS < 1-second CPS × 0.85), it indicates insufficient endurance.',
    faqClick2Q3: 'What crowd is the 2-second mouse click test suitable for?',
    faqClick2A3:
      'Suitable for: beginners who want to transition from 1-second to longer tests, players who need to evaluate short-term stability, as a benchmark test for daily training',
    faqClick2Q4: 'Practice method for the 2-second mouse click test?',
    faqClick2A4:
      'Suggestions: Do 5 sets of 2-second tests every day, record the average score, pay attention to whether the last 1 second drops significantly, combine 1-second and 5-second tests for comprehensive training',
    // 5 second click test FAQ
    faqClick5Q1: 'What is the core value of the 5-second mouse click test?',
    faqClick5A1:
      'The 5-second mouse click test is the best time window to balance explosive power and endurance. It can reflect both explosive power and test short-term endurance, and is an important indicator to evaluate comprehensive ability.',
    faqClick5Q2: 'What is the CPS reference standard for the 5-second mouse click test?',
    faqClick5A2:
      'Reference: Beginner: 5-7 CPS (25-35 times) Average: 7-9 CPS (35-45 times) Skilled: 9-11 CPS (45-55 times) Excellent: 11+ CPS (55+ times)',
    faqClick5Q3:
      'What to do if the speed drops in the later seconds during the 5-second mouse click test?',
    faqClick5A3:
      'Coping strategies: Adjust the starting speed, do not go all out at the beginning, establish a stable clicking rhythm, strengthen hand endurance training, pay attention to breathing rhythm, keep relaxed',
    faqClick5Q4: 'How to judge progress in the 5-second mouse click test?',
    faqClick5A4:
      'Observation indicators: CPS improvement: overall speed increase, stability improvement: reduced attenuation rate in later seconds, smooth clicking curve: reduced fluctuations',
    // 10 second click test FAQ
    faqClick10Q1: 'What does the 10-second mouse click test mainly test?',
    faqClick10A1:
      'The 10-second mouse click test focuses on assessing endurance and anti-fatigue ability. It can reflect your ability to maintain stable clicking over a longer period of time, and is an important indicator for endurance training.',
    faqClick10Q2: 'What is the CPS reference standard for the 10-second mouse click test?',
    faqClick10A2:
      'Reference: Beginner: 4-6 CPS (40-60 times) Average: 6-8 CPS (60-80 times) Skilled: 8-10 CPS (80-100 times) Excellent: 10+ CPS (100+ times)',
    faqClick10Q3: 'What to do if your hand gets tired during the 10-second mouse click test?',
    faqClick10A3:
      'Coping methods: Fully warm up before testing, keep your wrist relaxed, do not stiffen, find a clicking rhythm that suits you, stop immediately if pain occurs',
    faqClick10Q4: 'How to improve endurance in the 10-second mouse click test?',
    faqClick10A4:
      'Training suggestions: Start from 5 seconds, gradually extend to 7 seconds, 10 seconds, increase training time by 1-2 seconds per week, pay attention to the CPS attenuation rate in the last 5 seconds (target < 15%), combine with hand strength training',
    // 15 second click test FAQ
    faqClick15Q1: 'What are the characteristics of the 15-second mouse click test?',
    faqClick15A1:
      'The 15-second mouse click test is a medium-long distance endurance test, between 10 seconds and 30 seconds. It can more accurately evaluate continuous clicking ability while avoiding excessive fatigue from the 30-second test.',
    faqClick15Q2: 'What is the CPS reference standard for the 15-second mouse click test?',
    faqClick15A2:
      'Reference: Beginner: 4-5 CPS (60-75 times) Average: 5-7 CPS (75-105 times) Skilled: 7-9 CPS (105-135 times) Excellent: 9+ CPS (135+ times)',
    faqClick15Q3: 'How to distribute physical strength in the 15-second mouse click test?',
    faqClick15A3:
      'Strategy suggestions: First 5 seconds: keep 90% speed, establish rhythm, Middle 5 seconds: maintain stability, pay attention to breathing, Last 5 seconds: properly accelerate sprint, or maintain stability',
    faqClick15Q4: 'What training goals is the 15-second mouse click test suitable for?',
    faqClick15A4:
      'Suitable for: advanced training from 10 seconds to 30 seconds, evaluate medium-time endurance, as a regular test item for daily training',
    // 30 second click test FAQ
    faqClick30Q1: 'What is the core value of the 30-second mouse click test?',
    faqClick30A1:
      'The 30-second mouse click test is a standard endurance test, which can comprehensively evaluate the endurance and anti-fatigue ability of hand muscles. This is the test time commonly used by professional training and esports players.',
    faqClick30Q2: 'What is the CPS reference standard for the 30-second mouse click test?',
    faqClick30A2:
      'Reference: Beginner: 3-5 CPS (90-150 times) Average: 5-7 CPS (150-210 times) Skilled: 7-9 CPS (210-270 times) Excellent: 9+ CPS (270+ times)',
    faqClick30Q3: 'How to deal with fatigue in the 30-second mouse click test?',
    faqClick30A3:
      'Coping strategies: Psychological preparation: accept that speed will drop in the last 10 seconds, Rhythm control: do not go too fast in the first 10 seconds, keep 80% speed, Breathing coordination: deep breathing, keep relaxed, Hand relaxation: slightly relax fingers every 5 seconds',
    faqClick30Q4: 'Common problems in the 30-second mouse click test?',
    faqClick30A4:
      'Common problems: fast at first, slow later, excessive attenuation (>25%), stiff hands affecting speed, inattention, rhythm chaos, uncomfortable equipment, mouse too heavy or pad not smooth',
    // 60 second click test FAQ
    faqClick60Q1: 'What is the significance of the 60-second mouse click test?',
    faqClick60A1:
      'The 60-second mouse click test is an extreme endurance test, testing the limit endurance of hand muscles. It can comprehensively evaluate anti-fatigue ability and willpower, and is the ultimate test for professional players.',
    faqClick60Q2: 'What is the CPS reference standard for the 60-second mouse click test?',
    faqClick60A2:
      'Reference: Beginner: 3-4 CPS (180-240 times) Average: 4-6 CPS (240-360 times) Skilled: 6-8 CPS (360-480 times) Excellent: 8+ CPS (480+ times)',
    faqClick60Q3: 'How to distribute physical strength in the 60-second mouse click test?',
    faqClick60A3:
      'Physical distribution strategy: 0-15 seconds: stable start, keep 85% speed, 15-30 seconds: find rhythm, maintain stability, 30-45 seconds: most difficult stage, maintain willpower, 45-60 seconds: all-out sprint or maintain stability',
    faqClick60Q4: 'Notes for the 60-second mouse click test?',
    faqClick60A4:
      'Important reminders: Fully warm up: at least 5 minutes of hand stretching, Equipment check: ensure mouse and pad are in good condition, Environment preparation: choose a quiet, comfortable environment, Health first: stop immediately if pain occurs, do not force, Moderate training: 60-second test is intensive, no more than 2 times a week',
    // Typing test related
    minTypingTest: 'Minute Typing Speed Test',
    accuracy: 'Accuracy',
    characters: 'Characters',
    textCompleted: 'Text Completed',
    clickToStartThenTypeHere: 'Click to Start Then Type Here',
    testFinished: 'Test Finished',
    finalScore: 'Final Score',
    totalCharacters: 'Total Characters',
    correctCharacters: 'Correct Characters',
    wrongCharacters: 'Wrong Characters',
    // Typing test FAQ
    whatIsTypingTest: 'What is the typing test?',
    whatIsTypingTestDesc:
      'The typing test is a test to evaluate your typing speed and accuracy. You need to input the displayed text within the specified time, and the system will calculate your Words Per Minute (WPM) and accuracy. The typing test allows you to test your typing speed and accuracy on the keyboard to judge your typing ability.',
    whatIsTypingTestUse: 'What is the use of the typing test?',
    whatIsTypingTestUseDesc:
      'The typing test can help you understand your typing speed and accuracy, improve work efficiency, and prepare for job hunting or game competition. Good typing skills are very important for office workers, students, and gamers.',
    howToImproveTypingSpeed: 'How to improve typing speed?',
    howToImproveTypingSpeedDesc:
      'Improving typing speed requires practice. It is recommended to use the correct typing posture, use touch typing skills, and perform regular typing exercises. Using typing test tools can help you track progress and identify areas for improvement.',
    whatIsWPM: 'What is WPM?',
    whatIsWPMDesc:
      'WPM (Words Per Minute) refers to the number of words per minute, which is a standard indicator for measuring typing speed. Generally speaking, the typing speed of ordinary users is between 30-60 WPM, skilled users can reach 60-100 WPM, and professional typists can reach more than 100 WPM.',
    whatIsGoodAccuracy: 'What is good typing accuracy?',
    whatIsGoodAccuracyDesc:
      'Good typing accuracy should be above 95%. If your accuracy is below 90%, it is recommended to focus on accuracy first, and then improve speed.',
    bestScore: 'Best Score',
    targetEliminationGameDesc:
      'Click the colored targets on the screen to eliminate them and get as high a score as possible within the specified time!',
    gameDuration: 'Game Duration',
    sec: 'sec',
    whatIsTargetEliminationGame: 'What is the target elimination reaction training game?',
    whatIsTargetEliminationGameDesc:
      "The target elimination reaction training game is a game that tests users' reaction speed and hand-eye coordination. Players need to click the colored targets appearing on the screen within the specified time to eliminate them and get points. The game will randomly generate multiple targets, and the targets will move on the screen, increasing the game difficulty.",
    gameRules: 'Game Rules',
    gameRulesDesc:
      '1. Click the colored targets on the screen to eliminate them 2. Get 10 points for each target eliminated 3. Game duration is 30 seconds 4. Targets will move randomly on the screen 5. The final score and best score will be displayed after the game ends',
    whatIsTargetEliminationGameUsefulFor:
      'What is the use of the target elimination reaction training game?',
    whatIsTargetEliminationGameUsefulForDesc:
      'The target elimination reaction training game can help players improve reaction speed, hand-eye coordination, and attention. These skills are very important for gamers, athletes, and professionals who need quick reactions. Regular reaction training can keep the brain agile and improve reaction speed in various situations.',
    howToImproveTargetEliminationScore:
      'How to improve the score of the target elimination reaction training game?',
    howToImproveTargetEliminationScoreDesc:
      '1. Keep your attention focused and always pay attention to the targets on the screen 2. Practice hand-eye coordination to improve clicking accuracy 3. Find a clicking rhythm that suits you 4. Train regularly to gradually improve reaction speed 5. Keep relaxed and avoid tension affecting reaction speed',
    targetEliminationGameDesignPrinciple:
      'What is the design principle of the target elimination reaction training game?',
    targetEliminationGameDesignPrincipleDesc:
      "The target elimination reaction training game is designed based on visual perception and motor response mechanisms. The game stimulates players' visual systems by randomly generating moving targets, and then players need to click the targets through hand movements. This process involves three stages: visual information processing, decision making, and motor execution. The game difficulty is adjusted through the number of targets and movement speed, suitable for players of different levels to train.",
    newRecord: 'New Record',
    gameOver: 'Game Over',
    pixelsPerSecond: 'Pixels Per Second',
    scrollAsFastAsPossible: 'Scroll the mouse wheel as fast as possible!',
    yourBestScore: 'Your Best Score:',
    settings: 'Settings',
    blockSize: 'Block Size',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    gameMode: 'Game Mode',
    static: 'Static',
    dynamic: 'Dynamic',
    movementSpeed: 'Movement Speed',
    slow: 'Slow',
    fast: 'Fast',
    whatIsMouseScrollTest: 'What is the mouse scroll test?',
    whatIsMouseScrollTestDesc:
      'The mouse scroll test is a test to measure the maximum pixels players can scroll per second in the scroll area. Players need to scroll the mouse wheel quickly in the test area, and the system will calculate the scroll speed in real-time and record the maximum speed.',
    howToImproveScrollSpeed: 'How to improve mouse scroll speed?',
    howToImproveScrollSpeedDesc:
      '1. Use a high-quality mouse and choose appropriate scroll wheel sensitivity settings 2. Practice wrist and finger coordination 3. Find a scroll rhythm that suits you 4. Keep relaxed and avoid excessive tension 5. Train regularly to improve scroll speed',
    whatDoResultsMean: 'What do the test results mean?',
    whatDoResultsMeanDesc:
      'The test results show the maximum number of pixels you can scroll in 1 second. Generally speaking, the scroll speed of ordinary players is between 500-1500 pixels per second, skilled players can reach 1500-3000 pixels per second, and professional players can even exceed 3000 pixels per second.',
    isThereTimeLimit: 'Is there a time limit?',
    isThereTimeLimitDesc:
      'The mouse scroll test has no time limit, you can test indefinitely. The system will continue to record your maximum scroll speed until you refresh the page or close the browser.',
    // Home page FAQ related
    homeFaqQ1: 'What is CPS Test?',
    homeFaqA1:
      'CPS Test (Click Speed Test) is a test to measure how many times you can click the mouse within a specific time, evaluating your clicking speed by calculating Clicks Per Second. It not only helps you understand your hand speed level but also tracks progress through long-term training, which has important reference value for gamers, esports players, and professionals who need fast operation.',
    homeFaqQ2: 'How to scientifically improve clicking speed?',
    homeFaqA2:
      'Improving clicking speed requires systematic practice and correct methods:\n1. Technique selection: Choose a clicking method that suits your habits (butterfly clicking, jitter clicking, drag clicking, etc.)\n2. Regular training: Conduct 15-30 minutes of targeted practice every day to maintain muscle memory\n3. Hand warm-up: Perform simple hand stretching and relaxation exercises before testing\n4. Equipment optimization: Use a high polling rate mouse (1000Hz) and a suitable mouse pad\n5. Rhythm control: Establish a stable clicking rhythm, avoid speed decrease due to excessive tension\n6. Cross training: Combine tests of different durations (1 second, 5 seconds, 30 seconds) to comprehensively improve explosive power and endurance',
    homeFaqQ3: 'How is the accuracy of CPS test results guaranteed?',
    homeFaqA3:
      'Our CPS test uses reliable timing and calculation methods to ensure accurate and trustworthy results:\n1. High-precision timing: Uses professional time measurement technology with accuracy up to 0.1 milliseconds, ensuring every click is accurately recorded\n2. Intelligent anti-cheat: Built-in algorithm detects abnormal click patterns, ensuring authentic and reliable test results\n3. Device adaptation: Automatically adjusts delay differences across different devices and browsers to ensure fairness\n4. Multiple tests recommendation: It is recommended to conduct 3-5 tests and take the average value as a reference for more accurate results\n5. Result influencing factors: Device performance, network conditions, test environment and personal state will all have a slight impact on the results. We recommend testing in a stable environment',
    homeFaqQ4: 'What is the difference between CPS test on mobile devices and desktop devices?',
    homeFaqA4:
      'The CPS test on mobile devices has the following characteristics:\n1. Operation method: Use touch screen clicking instead of physical mouse buttons\n2. Speed difference: Due to touch delay and different operation methods, mobile CPS is usually 20-30% lower than desktop CPS\n3. Device influence: Different phone screen refresh rates and touch response speeds will affect test results\n4. Test experience: We have optimized the mobile interface to ensure a good test experience on various size devices\n5. Result reference: Mobile test results are suitable for horizontal comparison, not direct comparison with desktop results',
    homeFaqQ5: 'How are test data stored and protected?',
    homeFaqA5:
      "We use local storage mechanisms to protect your test data:\n1. Storage location: All test results are saved in your browser's local storage and will not be uploaded to the server\n2. Data security: Data is only stored on your device and will not be accessed by third parties\n3. Data management: You can clear browser cache at any time to delete test records\n4. Cross-device synchronization: Currently does not support cross-device data synchronization, it is recommended to test on a fixed device\n5. Privacy protection: We will not collect or analyze your personal test data, fully respecting user privacy",
    homeFaqQ6: 'What are the principles and techniques of butterfly clicking?',
    homeFaqA6:
      "Butterfly clicking is an advanced clicking technique that uses the index finger and middle finger to quickly alternate clicking the left mouse button:\n1. Working principle: Utilize the physical characteristics of mouse micro switches, generating continuous clicks through the rapid alternating movement of both hands' fingers\n2. Speed range: Can reach 20-30 CPS or even higher after proficient mastery\n3. Practice method: Keep the wrist stable, fingers relaxed, and find the best alternating rhythm through repeated practice\n4. Applicable scenarios: Suitable for game scenarios that require short-term burst high CPS\n5. Device requirements: Need a mouse with crisp clicking feel and fast rebound, not suitable for heavy office mice",
    homeFaqQ7: 'What are the core techniques and precautions of jitter clicking?',
    homeFaqA7:
      'Jitter clicking generates continuous clicks by quickly shaking the arm and wrist:\n1. Core principle: Use small muscle vibrations to drive fingers to quickly click mouse buttons\n2. Speed range: Usually can achieve 10-15 CPS, up to 20 CPS\n3. Practice points: Keep the arm relaxed, use the natural shaking of the wrist, avoid excessive force leading to muscle fatigue\n4. Precautions: Long-term high-intensity practice may cause wrist discomfort, it is recommended to control practice time\n5. Applicable crowd: Suitable for users with hard mouse buttons or unsuitable for butterfly clicking',
    homeFaqQ8: 'What are the implementation conditions and techniques of drag clicking?',
    homeFaqA8:
      'Drag clicking generates continuous clicks by dragging fingers on mouse buttons:\n1. Implementation principle: Utilize the physical characteristics of mouse micro switches, triggering multiple clicks through vibrations generated by friction\n2. Speed range: Depending on the mouse and technique, can achieve 10-25 CPS\n3. Device requirements: Need special mouse design (such as frosted button surface) and suitable mouse pad\n4. Practice techniques: Find the appropriate finger angle and pressure, maintain a stable drag speed\n5. Common problems: Different mice have large differences in drag effect, need to try to find suitable equipment\n6. Precautions: Frequent dragging may accelerate the wear of mouse buttons',
    homeFaqQ9: 'What abilities do CPS tests of different durations evaluate respectively?',
    homeFaqA9:
      'Tests of different durations evaluate different dimensions of abilities:\n1. 1-second test: Evaluate instantaneous explosive power and hand speed potential\n2. 5-second test: Balance explosive power and short-term stability, it is the most commonly used comprehensive evaluation indicator\n3. 10-second test: Evaluate continuous clicking endurance and rhythm maintenance ability\n4. 30-second test: Standard endurance test, suitable for evaluating long-term operation stability\n5. 60-second test: Extreme endurance test, testing the anti-fatigue ability of hand muscles\nIt is recommended to combine tests of multiple durations to comprehensively understand your hand speed characteristics',
    homeFaqQ10: 'What is the relationship between CPS test results and actual game performance?',
    homeFaqA10:
      'CPS test results have a certain correlation with game performance, but it is not absolute:\n1. Correlation: High CPS has advantages in games that require fast clicking (such as Minecraft, CS:GO, etc.)\n2. Limitations: Game performance also depends on multiple factors such as reaction speed, hand-eye coordination, and strategic awareness\n3. Reference value: CPS test can be used as a reference indicator for hand speed training, but cannot completely represent game level\n4. Specialized training: Targeted training for specific game operation needs is more effective than simply pursuing high CPS\n5. Balanced development: It is recommended to combine CPS training with reaction speed and accuracy training',
    homeFaqQ11: 'How to avoid hand fatigue or injury caused by CPS training?',
    homeFaqA11:
      'Protecting hand health is crucial, it is recommended to follow these principles:\n1. Moderate training: Do not practice for more than 30 minutes each time, avoid long-term high-intensity operation\n2. Correct posture: Keep the wrist naturally straight, avoid excessive bending or twisting\n3. Regular rest: Rest for 1-2 minutes every 10 minutes of practice, move the wrist and fingers\n4. Hand relaxation: Perform hand stretching and massage before and after practice\n5. Equipment adaptation: Choose an ergonomic mouse and adjust suitable mouse sensitivity\n6. Pay attention to signals: If wrist pain or numbness occurs, stop practicing immediately and rest\n7. Cross-activity: Regularly perform other non-mouse operation activities to avoid repeated single actions',
    homeFaqQ12: 'What is the history and development trend of CPS test?',
    homeFaqA12:
      "The development history and trends of CPS test:\n1. Origin: Originally originated from game communities such as Minecraft, used to evaluate players' PvP ability\n2. Development: Gradually expanded to the esports field, becoming a standard tool for hand speed evaluation\n3. Technological progress: From simple counting tools to professional platforms with data analysis and training suggestions\n4. Diversification: In addition to mouse clicking, it has expanded to multiple test types such as space bar clicking and keyboard keys\n5. Intelligence: In the future, AI analysis will be integrated to provide personalized training plans and progress predictions\n6. Communityization: Establish player leaderboards and training communities to promote mutual communication and progress",
    // Mouse drag test related
    mouseDragTest: 'Mouse Drag Test',
    totalDistance: 'Total Distance',
    averageSpeed: 'Average Speed',
    testDuration: 'Test Duration',
    clickAndDragToTest: 'Click and Drag to Start Test',
    dragToStart: 'Drag to Start',
    dragCompleted: 'Drag Completed',
    whatIsMouseDragTestQ1: 'How to do the mouse drag test?',
    whatIsMouseDragTestA1:
      'To do the drag test with mouse: Place the cursor on the "mouse" object, hold down the mouse image you want to test, move the cursor in any direction within the test area. If the object keeps dragging until you release the button, your mouse drag function is working well. For touch screen drag test: Touch the "mouse" image and move it in any direction within the test area. If it moves, your screen drag function is working well.',
    faqMouseDragQ1: 'Which mouse buttons can you test with?',
    faqMouseDragA1:
      'You can test with the left, middle, and right buttons of the mouse. Although almost all tests are done with the left button, you can also test with the middle or right button, depending on your needs and preferences.',
    faqMouseDragQ2: 'Why test mouse dragging?',
    faqMouseDragA2:
      'When you drag something in an application or screen, it suddenly stops moving even though you keep moving the mouse or finger. This may be an application error or a mouse button or screen problem',
    // Image alt attributes
    logoAlt: 'CPS Test Icon',
    historyIconAlt: 'History Icon',
    multipleTestTypesIconAlt: 'Multiple Test Types Icon',
    realTimeStatsIconAlt: 'Real-time Statistics Icon',
    gameifiedExperienceIconAlt: 'Gamified Experience Icon',
    // FAQ component
    searchQuestion: 'Search Question...',
    popularQuestions: 'Popular Questions',
    relatedQuestions: 'Related Questions',
    noQuestionFound: 'No related questions found, please try other keywords',
    // 404 page
    pageNotFound: 'Page Not Found',
    pageNotFoundDescription:
      'Sorry, the page you are looking for does not exist. Please check if the URL is correct, or return to the home page to continue browsing.',
    goHome: 'Go Home',
    searchTest: 'Search Test',
    searchPlaceholder: 'Search Test...',
    search: 'Search',
    // Test type descriptions
    clickTestDesc: 'Test your mouse clicking speed, supporting multiple time lengths',
    clickTestDescription:
      'CPSTest Click Speed Test, supporting 1 second, 2 seconds, 5 seconds, 10 seconds, 15 seconds, 30 seconds, 60 seconds and other time lengths, real-time display of click speed and total clicks, providing detailed statistics and historical records after the test',
    clickTestKeywords:
      'click speed test,CPSTest,mouse click test,click speed,online click speed test,click speed test tool,CPS test',
    spaceClickTestDesc: 'Test your space bar clicking speed, supporting multiple time lengths',
    spaceClickTestDescription:
      'CPSTest Space Click Test, supporting 1 second, 2 seconds, 5 seconds, 10 seconds, 15 seconds, 30 seconds, 60 seconds and other time lengths, specially testing your space bar clicking speed and endurance',
    spaceClickTestKeywords:
      'space click test,space bar test,space speed test,space click speed,space bar click test tool,CPSTest',
    kohiClickTestDesc: 'Professional Minecraft click test, fixed at 10 seconds',
    kohiClickTestDescription:
      'CPSTest Kohi Click Test, originated from Minecraft server Kohi, fixed at 10 seconds, specially designed for Minecraft players, testing continuous clicking stability and speed',
    kohiClickTestKeywords:
      'Kohi test,Kohi click test,Minecraft click test,MC click test,10 second click test,CPSTest',
    reactionTestDesc:
      'Test your visual reaction speed, measuring the time from stimulus to reaction',
    reactionTestDescription:
      'CPSTest Reaction Time Test, measuring your visual reaction speed, the time interval from green square appearance to mouse click, providing average reaction time and best reaction time statistics',
    reactionTestKeywords:
      'reaction time test,reaction speed test,visual reaction test,reaction test,reaction speed test tool,CPSTest',
    colorReactionTestDescription:
      'CPSTest Color Reaction Test, testing your color recognition and reaction speed, ignore text content, click the color square that matches the text, challenge your brain reaction ability',
    colorReactionTestKeywords:
      'color reaction test,color recognition test,visual reaction test,color reaction speed test,color test,CPSTest',
    keyReactionTestDescription:
      'CPSTest Key Reaction Test, evaluating your reaction speed to WASD keys, game randomly highlights keys, you need to press the corresponding key as quickly as possible, suitable for game players training',
    keyReactionTestKeywords:
      'key reaction test,WASD reaction test,game reaction test,key speed test,game player training,CPSTest',
    targetEliminationGameDescription:
      'CPSTest Target Elimination Reaction Training Game, testing your reaction speed and hand-eye coordination ability, click colored targets on the screen within the specified time to get as high a score as possible',
    targetEliminationGameKeywords:
      'target elimination game,reaction speed training,hand-eye coordination training,reaction game,target elimination test,CPSTest',
    mouseScrollTestDesc: 'Test your mouse scroll speed, measuring pixels per second',
    mouseScrollTestDescription:
      'CPSTest Mouse Scroll Test, testing your mouse scroll speed, measuring pixels scrolled per second, suitable for game and work scenarios that require quick scrolling',
    mouseScrollTestKeywords:
      'mouse scroll test,scroll speed test,mouse scroll speed,scroll test,mouse test,CPSTest',
    mouseDragTestDesc: 'Test your mouse drag speed and accuracy',
    mouseDragTestDescription:
      'CPSTest Mouse Drag Test, testing your mouse drag speed and accuracy, recording drag distance and average speed, suitable for work and game scenarios that require precise dragging',
    mouseDragTestKeywords:
      'mouse drag test,drag speed test,mouse drag speed,drag test,mouse test,CPSTest',
    keyboardTestDescription:
      'CPSTest Keyboard Test, detecting whether your keyboard keys work normally, real-time display of key status and pressed keys list, helping you understand keyboard sensitivity and key status',
    keyboardTestKeywords:
      'keyboard test,keyboard key test,keyboard function test,key test,keyboard detection,CPSTest',
    typingTestDesc: 'Test your typing speed and accuracy, supporting multiple time lengths',
    typingTestDescription:
      'CPSTest Typing Test, testing your typing speed and accuracy, supporting 1 minute, 3 minutes, 5 minutes, 10 minutes, 15 minutes and other time lengths, real-time display of typing speed and accuracy',
    typingTestKeywords:
      'typing test,typing speed test,typing accuracy test,typing practice,typing speed,CPSTest',
    doubleClickTestDesc: 'Test your double click speed and accuracy',
    doubleClickTestDescription:
      'CPSTest Double Click Test, testing your double click speed and accuracy, recording double click count and best double click speed, suitable for game and work scenarios that require quick double clicking',
    doubleClickTestKeywords:
      'double click test,click series test,double click series test,double click speed test,double click count test,CPSTest',
    tripleClickTestDesc: 'Test your triple click speed and accuracy',
    tripleClickTestDescription:
      'CPSTest Triple Click Test, test your triple click speed and accuracy, record triple click count and best triple click speed, challenge your click skill limits',
    tripleClickTestKeywords:
      'triple click test,triple clicking test,triple click speed test,triple click count test,triple click test tool,CPSTest',
    privacyPolicy: 'Privacy Policy',
    privacyPolicyTitle: 'Privacy Policy - CPSTestGo.com',
    privacyPolicyDescription:
      'CPSTest Privacy Policy, detailing how we collect, use and protect your data',
    privacyPolicyKeywords: 'Privacy Policy,CPSTest,data protection,user privacy',
    privacyIntroductionTitle: 'Privacy and Policy',
    privacyIntroduction:
      'Welcome to CPSTest (Website address: <a href="/" style="color: #4CAF50 !important; font-weight: bold !important; text-decoration: none !important;" target="_self">https://www.cpstestgo.com</a>). This Privacy Policy (CPS Test Privacy Policy) is intended to explain how we collect, use, store and protect your personal information when you use our services. We take your privacy protection very seriously and commit to strictly complying with relevant laws and regulations to ensure the security of your personal information. Please read this Privacy Policy carefully to understand our privacy protection practices.',
    privacyDataCollectionTitle: 'Data Collection',
    privacyDataCollection: 'When you use our services, we may collect the following types of data:',
    privacyDataCollection1:
      'Device information: We may collect your device model, operating system version, browser type, IP address and other information to analyze service usage and optimize service experience.',
    privacyDataCollection2:
      'Usage data: We may collect information about how you use our services, pages visited, links clicked, time spent, etc., to improve our services and provide personalized experiences.',
    privacyDataCollection3:
      'Test data: We may collect data generated when you use the test functions, such as click speed, reaction time, etc., to provide test results and historical records.',
    privacyDataUseTitle: 'Data Use',
    privacyDataUse: 'The data we collect will be used for the following purposes:',
    privacyDataUse1:
      'Provide and maintain our services to ensure the normal operation and security of the services.',
    privacyDataUse2:
      'Improve and optimize our services, continuously improve service quality based on user feedback and usage.',
    privacyDataUse3:
      'Provide you with a personalized service experience, such as recommending relevant content based on your interests.',
    privacyDataUse4:
      'Generate test results and historical records for you to view and compare your test data.',
    privacyDataUse5: 'Analyze service usage trends, optimize test algorithms and function design.',
    privacyConsentTitle: 'Consent',
    privacyConsentContent: 'By using our website, you agree to our privacy policy and its terms.',
    privacyDataSharingTitle: 'Why we collect information',
    privacyDataSharing:
      'In order to provide you with a better testing service experience, we need to collect necessary information to optimize service quality, offer a personalized experience, and generate accurate test results. We guarantee that we will not sell your personal information, nor will we rent or transfer it to any third party for commercial purposes.',
    privacyPolicyChangesTitle: 'Policy Changes',
    privacyPolicyChanges:
      'We may update this Privacy Policy from time to time. When we make significant changes, we will notify you through website announcements or other means. Your continued use of our services indicates that you accept the updated Privacy Policy.',
    privacyDataStorageTitle: 'Data Storage and Security',
    privacyDataStorage: 'We adopt strict security measures to protect your data, including:',
    privacyDataStorage1:
      'Data encryption: We use industry-standard encryption technology to protect your data transmission and storage.',
    privacyDataStorage2:
      'Access control: We restrict access to your data, and only authorized personnel can access it.',
    privacyDataStorage3:
      'Security audits: We conduct regular security audits to ensure our security measures are effective.',
    privacyUserRightsTitle: 'User Rights',
    privacyUserRights: 'According to relevant laws and regulations, you have the following rights:',
    privacyUserRights1:
      'Right of access: You have the right to access your personal information we collected.',
    privacyUserRights2:
      'Right of correction: You have the right to correct inaccurate personal information we collected about you.',
    privacyUserRights3:
      'Right of deletion: In specific cases, you have the right to request us to delete your personal information.',
    privacyUserRights4:
      'Right to data portability: You have the right to request us to provide your personal information in a structured, machine-readable format.',
    privacyUserRights5:
      'Right to object: You have the right to object to our processing of your personal information, unless we have a legitimate reason to continue processing.',
    privacyCookiePolicyTitle: 'Cookie Policy',
    privacyCookiePolicy:
      'We use cookies to improve your browsing experience and service quality. Cookies are small text files stored on your device to identify your device and preferences.',
    privacyCookiePolicy1:
      'Necessary cookies: These cookies are essential for the normal operation of our services and cannot be disabled without affecting functionality.',
    privacyCookiePolicy2:
      'Analytics cookies: These cookies help us understand how you use our services so we can improve them.',
    privacyCookiePolicy3:
      'Functional cookies: These cookies allow us to provide personalized experiences and remember your preferences.',
    privacyCookiePolicy4:
      'How to manage cookies: You can manage or delete cookies through your browser settings. Please note that disabling certain cookies may affect your service experience.',
    privacyThirdPartyServicesTitle: 'Third-Party Services',
    privacyThirdPartyServices:
      'We may use third-party services to help us provide and improve our services. These third-party services may collect your information, so we recommend you read their privacy policies:',
    privacyThirdPartyServices1:
      'Analytics services: We use services like Google Analytics to analyze website traffic and user behavior.',
    privacyThirdPartyServices2:
      'Advertising services: We may use third-party advertising services to display relevant ads.',
    privacyThirdPartyServices3:
      'Payment services: If we offer paid services, we will use secure third-party payment services.',
    privacyChildrenPrivacyTitle: "Children's Privacy Protection",
    privacyChildrenPrivacy:
      'Our services are not intended for children under 13 years of age. We do not intentionally collect personal information from children under 13. If we discover that we have collected personal information from children under 13, we will immediately delete that information.',
    privacyDataRetentionTitle: 'Data Retention and Deletion',
    privacyDataRetention: 'We retain your data according to the following principles:',
    privacyDataRetention1:
      'Necessary period: We will retain your data for the period necessary to provide our services.',
    privacyDataRetention2:
      'Legal requirements: If required by law, we will retain your data for the specified period.',
    privacyDataRetention3:
      'Deletion policy: When you request data deletion or when data is no longer needed, we will securely delete or anonymize your data.',
    copyright: '© 2025 CPSTestGo - All Rights Reserved',
    // ResultModal component
    resultModal: {
      // Details
      details: '{time} seconds with {clicks} clicks',
      // Button text
      okButton: 'Okay',
      // Different CPS range descriptions
      slow: {
        desc1: 'Your clicking speed is slow, you need more practice!',
        desc2: 'Don\'t be discouraged, keep trying, you will get faster!'
      },
      average: {
        desc1: 'Your clicking speed is average, there is still room for improvement!',
        desc2: 'Good performance, keep this rhythm!'
      },
      fast: {
        desc1: 'Your clicking speed is fast, you have surpassed most people!',
        desc2: 'Great job, your hand speed is really fast!'
      },
      superFast: {
        desc1: 'Your clicking speed is super fast, like lightning!',
        desc2: 'Amazing, you are a natural clicking master!'
      },
      ultraFast: {
        desc1: 'Your clicking speed has broken the limit, you are the clicking god!',
        desc2: 'Impossible! Your hand speed has exceeded human cognition!'
      },
      // CPS feedback
      feedback: {
        slow: 'The result is not good, very slow.',
        average: 'Good result, keep trying!',
        fast: 'Great result, you are a clicking master!',
        superFast: 'Excellent result, you are a clicking legend!',
        ultraFast: 'Incredible result, you are the clicking god!'
      }
    },
  },
  ja: {
    websiteName: 'CPS Test - クリックスピードと反応トレーニングプラットフォーム',
    metaDescription:
      'CPS Test - 無料、プロフェッショナル、高速なクリックスピードテストプラットフォームで、リアルタイムフィードバックと包括的なテスト項目を提供、反応時間テスト、タイピングテストなど、複数言語に対応、履歴スコアを記録',
    privacyPolicy: 'プライバシーポリシー',
    privacyPolicyTitle: 'プライバシーポリシー - CPSTestGo.com',
    privacyPolicyDescription:
      'CPSTestプライバシーポリシーは、データの収集、使用、保護方法について詳細に説明します',
    privacyPolicyKeywords: 'プライバシーポリシー,CPSTest,データ保護,ユーザープライバシー',
    privacyIntroductionTitle: 'プライバシーとポリシー',
    privacyIntroduction:
      'CPSTestへようこそ（ウェブサイトアドレス：<a href="/" style="color: #4CAF50 !important; font-weight: bold !important; text-decoration: none !important;" target="_self">https://www.cpstestgo.com</a>）。このプライバシーポリシー（CPS Testプライバシーポリシー）は、当社のサービスを使用する際に、あなたの個人情報をどのように収集、使用、保存、保護するかを説明することを目的としています。私たちはあなたのプライバシー保護を非常に重視しており、関連法令を厳守し、あなたの個人情報の安全性を確保することを約束します。私たちのプライバシー保護の実践を理解するために、このプライバシーポリシーをよく読んでください。',
    privacyDataCollectionTitle: 'データの収集',
    privacyDataCollection:
      '当社のサービスを使用する際、私たちは以下のタイプのデータを収集する場合があります:',
    privacyDataCollection1:
      'デバイス情報: デバイスモデル、オペレーティングシステムのバージョン、ブラウザの種類、IPアドレスなどの情報を収集し、サービスの使用状況の分析やサービス体験の最適化に使用します。',
    privacyDataCollection2:
      '使用データ: 当社のサービスの使用方法、訪問したページ、クリックしたリンク、滞在時間などの情報を収集し、サービスの改善や個別化された体験の提供に使用します。',
    privacyDataCollection3:
      'テストデータ: テスト機能を使用する際に生成されるデータ（クリックスピード、反応時間など）を収集し、テスト結果や履歴記録を提供します。',
    privacyDataUseTitle: 'データの使用',
    privacyDataUse: '収集したデータは、以下の目的で使用されます:',
    privacyDataUse1:
      '当社のサービスを提供・維持し、サービスの正常な運用とセキュリティを確保します。',
    privacyDataUse2:
      'サービスの改善と最適化を行い、ユーザーのフィードバックと使用状況に基づいてサービスの質を継続的に向上させます。',
    privacyDataUse3: '個別化されたサービス体験を提供し、興味に基づいて関連コンテンツを推奨します。',
    privacyDataUse4:
      'テスト結果と履歴記録を生成し、あなたが自分のテストデータを表示および比較できるようにします。',
    privacyDataUse5: 'サービス利用動向を分析し、テストアルゴリズムと機能設計を最適化します。',
    privacyConsentTitle: '同意',
    privacyConsentContent:
      '当社のウェブサイトを使用することで、あなたは当社のプライバシーポリシーとその条項に同意したものとみなされます。',
    privacyDataSharingTitle: '私たちはなぜ情報を収集するのですか',
    privacyDataSharing:
      'より良いテストサービス体験を提供するために、サービスの質を最適化し、パーソナライズされた体験を提供し、正確なテスト結果を生成するために必要な情報を収集する必要があります。お客様の個人情報を販売したり、第三者に商業目的で貸与・譲渡することはありません。',
    privacyPolicyChangesTitle: 'ポリシーの変更',
    privacyPolicyChanges:
      'このプライバシーポリシーは、随時更新される場合があります。重要な変更を行う場合には、ウェブサイトのお知らせまたはその他の方法でお知らせします。当社のサービスの使用を継続することで、更新されたプライバシーポリシーを受け入れたものとみなされます。',
    privacyDataStorageTitle: 'データの保存とセキュリティ',
    privacyDataStorage:
      '当社は、以下を含む厳格なセキュリティ対策を講じて、お客様のデータを保護しています：',
    privacyDataStorage1:
      'データ暗号化：業界標準の暗号化技術を使用して、お客様のデータの送信と保存を保護します。',
    privacyDataStorage2:
      'アクセス制御：お客様のデータへのアクセスを制限し、承認されたスタッフのみがアクセスできます。',
    privacyDataStorage3:
      'セキュリティ監査：定期的にセキュリティ監査を実施し、セキュリティ対策が効果的であることを確認します。',
    privacyUserRightsTitle: 'ユーザーの権利',
    privacyUserRights: '関連法令に基づき、お客様は以下の権利を有します：',
    privacyUserRights1: 'アクセス権：当社が収集したお客様の個人情報にアクセスする権利があります。',
    privacyUserRights2: '訂正権：当社が収集したお客様の不正確な個人情報を訂正する権利があります。',
    privacyUserRights3: '削除権：特定の場合に、お客様の個人情報の削除を要求する権利があります。',
    privacyUserRights4:
      'データの移動可能性の権利：構造化された機械可読形式でお客様の個人情報を提供するよう要求する権利があります。',
    privacyUserRights5:
      '異議申し立て権：正当な理由がない限り、当社の個人情報処理に異議を申し立てる権利があります。',
    privacyCookiePolicyTitle: 'クッキーポリシー',
    privacyCookiePolicy:
      'ブラウジング体験とサービス品質を向上させるために、クッキーを使用しています。クッキーは、お客様のデバイスに保存される小さなテキストファイルで、お客様のデバイスと設定を識別するために使用されます。',
    privacyCookiePolicy1:
      '必要なクッキー：これらのクッキーは、当社のサービスの正常な運用に不可欠であり、機能に影響を与えずに無効にすることはできません。',
    privacyCookiePolicy2:
      '分析クッキー：これらのクッキーは、当社のサービスの使用方法を理解するのに役立ち、サービスを改善することができます。',
    privacyCookiePolicy3:
      '機能クッキー：これらのクッキーにより、個別化された体験を提供し、お客様の設定を記憶することができます。',
    privacyCookiePolicy4:
      'クッキーの管理方法：ブラウザの設定を通じて、クッキーを管理または削除することができます。特定のクッキーを無効にすると、サービス体験に影響を与える可能性があることに注意してください。',
    privacyThirdPartyServicesTitle: '第三者サービス',
    privacyThirdPartyServices:
      '当社は、サービスの提供と改善を支援するために、第三者サービスを使用する場合があります。これらの第三者サービスは、お客様の情報を収集する場合があるため、それらのプライバシーポリシーをお読みください：',
    privacyThirdPartyServices1:
      '分析サービス：Google Analyticsなどのサービスを使用して、ウェブサイトのトラフィックとユーザーの行動を分析します。',
    privacyThirdPartyServices2:
      '広告サービス：関連する広告を表示するために、第三者の広告サービスを使用する場合があります。',
    privacyThirdPartyServices3:
      '決済サービス：有料サービスを提供する場合、安全な第三者決済サービスを使用します。',
    privacyChildrenPrivacyTitle: '児童のプライバシー保護',
    privacyChildrenPrivacy:
      '当社のサービスは、13歳未満の児童を対象としていません。13歳未満の児童の個人情報を故意に収集することはありません。13歳未満の児童の個人情報を収集したことを発見した場合、直ちにその情報を削除します。',
    privacyDataRetentionTitle: 'データの保持と削除',
    privacyDataRetention: '当社は、以下の原則に従ってお客様のデータを保持します：',
    privacyDataRetention1:
      '必要な期間：サービスを提供するために必要な期間、お客様のデータを保持します。',
    privacyDataRetention2:
      '法律上の要求：法律によって要求される場合、規定された期間、お客様のデータを保持します。',
    privacyDataRetention3:
      '削除ポリシー：データの削除を要求された場合、またはデータが不要になった場合、安全に削除または匿名化します。',
    metaKeywords:
      'CPS Test,無料テスト,プロフェッショナルテスト,リアルタイムテスト,高速テスト,包括的テスト,クリックスピードテスト,反応時間テスト,タイピングテスト,マウススクロールテスト,スペースクリックテスト',
    ogDescription:
      'CPS Testプラットフォーム、無料、プロフェッショナルなクリックスピードトレーニングシステム、高速、リアルタイムのテストフィードバックと包括的なトレーニング項目を提供、複数言語に対応、履歴スコアを記録',
    schemaDescription:
      'CPS Testプラットフォーム、無料、プロフェッショナルなクリックスピードトレーニングシステム、高速、リアルタイムのテストフィードバックと包括的なトレーニング項目を提供、複数言語に対応、履歴スコアを記録',
    schemaName: 'CPS Test - クリックスピードと反応トレーニングプラットフォーム',
    schemaPublisher: 'CPS Testプラットフォーム',
    home: 'ホーム',
    popularTests: '人気テスト',
    quickLinks: 'クイックリンク',
    clickTest: 'クリックスピードテスト',
    clickSeriesTest: '連続クリックテスト',
    doubleClickTest: 'ダブルクリックテスト',
    clicks: '回',
    secClickTest: '秒クリックテスト',
    '1secClickTest': '1秒クリックテスト',
    '2secClickTest': '2秒クリックテスト',
    '5secClickTest': '5秒クリックテスト',
    '10secClickTest': '10秒クリックテスト',
    '15secClickTest': '15秒クリックテスト',
    '30secClickTest': '30秒クリックテスト',
    '60secClickTest': '60秒クリックテスト',
    spaceClickTest: 'スペースクリックテスト',
    secSpaceTest: '秒スペーステスト',
    '1secSpaceTest': '1秒スペーステスト',
    '5secSpaceTest': '5秒スペーステスト',
    '10secSpaceTest': '10秒スペーステスト',
    '15secSpaceTest': '15秒スペーステスト',
    '30secSpaceTest': '30秒スペーステスト',
    '60secSpaceTest': '60秒スペーステスト',
    kohiClickTest: 'Kohiクリックテスト',
    typingTest: 'タイピングテスト',
    '1minTypingTest': '1分タイピングテスト',
    '3minTypingTest': '3分タイピングテスト',
    '5minTypingTest': '5分タイピングテスト',
    '10minTypingTest': '10分タイピングテスト',
    '15minTypingTest': '15分タイピングテスト',
    reactionTest: '反応時間テスト',
    simpleReactionTest: 'シンプル反応テスト',
    colorReactionTest: 'カラー反応テスト',
    keyReactionTest: 'キー反応テスト（WASD）',
    targetEliminationGame: 'ターゲット消去反応トレーニングゲーム',
    mouseScrollTest: 'マウススクロールテスト',
    login: 'ログイン',
    justNow: 'たった今',
    minutesAgo: '分前',
    hoursAgo: '時間前',
    daysAgo: '日前',
    removeAll: '全て削除',
    startGame: 'ゲーム開始',
    clickHere: 'ここをクリック',
    cps: 'クリック/秒',
    timer: 'タイマー',
    clickPerSecond: 'クリック/秒',
    score: 'スコア',
    reactionTime: '反応時間',
    average: '平均',
    best: 'ベスト',
    round: 'ラウンド',
    time: '時間',
    reset: 'リセット',
    continue: '続ける',
    finish: '終了',
    tryAgain: '再試行',
    ms: 'ミリ秒',
    readyToStart: 'テストの準備完了',
    simpleReactionTestDesc:
      '下のボタンをクリックしてテストを開始します。緑の四角が表示されたら、できるだけ早くクリックしてください！',
    colorReactionTestDesc:
      '下のボタンをクリックしてテストを開始します。カラフルなテキストが表示されたら、テキストの内容を無視して、テキストの色に一致する色の四角をできるだけ早くクリックしてください！',
    startTest: 'テスト開始',
    leftButton: 'マウス左ボタン',
    middleButton: 'マウススクロールボタン',
    rightButton: 'マウス右ボタン',
    leftMouseButton: 'マウス左ボタン',
    rightMouseButton: 'マウス右ボタン',
    selectMouseButton: 'マウスボタンを選択',
    totalClicks: '総クリック数',
    doubleClicks: 'ダブルクリック数',
    bestDoubleSpeed: '最高速度',
    clickHereToTest: 'ゲームエリアをクリックしてテストを開始',
    gettingReady: '準備中...',
    faqDoubleClickQ1: 'ダブルクリックテストとは？',
    faqDoubleClickA1:
      'ダブルクリックテストは、ダブルクリックの速度と正確性を測定するテストです。システムは総クリック数、ダブルクリック数、および最高のダブルクリック速度を記録します。',
    faqDoubleClickQ2: 'ダブルクリック速度を上げるにはどうすればよいですか？',
    faqDoubleClickA2:
      'ダブルクリック速度を上げるには練習が必要です。安定したマウスを使用し、適切なマウス感度を調整し、自分に合ったクリックリズムを見つけることをお勧めします。',
    tripleClickTest: 'トリプルクリックテスト',
    tripleClicks: 'トリプルクリック数',
    bestTripleSpeed: '最高速度',
    faqTripleClickQ1: 'トリプルクリックテストとは？',
    faqTripleClickA1:
      'トリプルクリックテストは、トリプルクリックの速度と正確性を測定するテストです。システムは総クリック数、トリプルクリック数、および最高のトリプルクリック速度を記録します。',
    faqTripleClickQ2: 'トリプルクリック速度を上げるにはどうすればよいですか？',
    faqTripleClickA2:
      'トリプルクリック速度を上げるには練習が必要です。安定したマウスを使用し、適切なマウス感度を調整し、自分に合ったクリックリズムを見つけることをお勧めします。',
    waiting: '待機中',
    simpleReactionTestWaiting: '集中してください、緑の四角が表示されます！',
    colorReactionTestWaiting: '集中してください、カラーテキストが表示されます！',
    nextTestComing: '次のテストがまもなく開始されます...',
    history: '履歴',
    noHistory: '履歴がありません',
    reactionTestQ1: '反応時間テストとは？',
    reactionTestDescriptionText:
      '反応時間テストは、視覚的な反応速度を測定するゲームです。テスト中に、画面にランダムに緑の四角が表示されます。できるだけ早くクリックしてください。システムは反応時間を記録し、平均反応時間と最高反応時間を計算します。反応時間テストにより、反応速度と注意力レベルをテストすることができます。',
    reactionTestUsefulness: '反応時間テストの用途は？',
    reactionTestUsefulnessText:
      '反応時間テストは、反応速度と注意力レベルを理解するのに役立ちます。ゲーマー、アスリート、および迅速な反応が必要な職業の従事者にとって、良好な反応時間は非常に重要です。',
    reactionTimeRange: '正常な反応時間の範囲は？',
    reactionTimeRangeText:
      '人間の平均的な視覚反応時間は約250-300ミリ秒です。優れた反応時間は通常150-250ミリ秒の間で、プロのアスリートやゲーマーは100-150ミリ秒を達成することができます。',
    howToImproveReaction: '反応時間を改善するにはどうすればよいですか？',
    howToImproveReactionText:
      '反応時間を改善するには練習が必要です。注意力トレーニング、視覚追跡練習、および反応速度ゲームをすることをお勧めします。良好な睡眠と健康的なライフスタイルも反応速度の改善に役立ちます。',
    reactionTestPrinciple: '反応時間テストの原理は？',
    reactionTestPrincipleText:
      '反応時間テストは、人間の視覚知覚と運動反応メカニズムに基づいています。テストでは、視覚刺激（目標の出現）から運動反応（マウスのクリック）までの時間間隔を測定することで、反応速度を評価します。',
    // 方向键
    up: '上',
    down: '下',
    left: '左',
    right: '右',
    // 关键按键测试相关
    keyReactionTestDesc: '矢印が点灯したらW/A/S/Dを押してください。',
    clickToStart: 'クリックして開始',
    tooSoon: '早すぎます...',
    pressWasdToReturn: 'W/A/S/Dを押して戻るか、再試行をクリックしてください。',
    wrongKey: '間違ったキー！',
    pressTheGreenOne: '緑のものを押してください。',
    clickToContinue: 'クリックして続けてください...',
    keyReactionTestResults: 'キー反応テスト結果',
    yourAverageReactionTime: '⏳ あなたの反応時間',
    yourReactionTime: 'あなたの反応時間',
    youCanDoBetter: 'もっと良くできます！',
    notTheFastestStart:
      '最速のスタートではありませんが、心配しないでください—反応速度は練習とともに速くなります。トレーニングを続けると、すぐにスピードスターになれます！⚡',
    restartGame: 'ゲームを再開',
    whatIsKeyReactionTest: 'キー反応テストとは？',
    whatIsKeyReactionTestDesc:
      'キー反応テストは、WASDキーに対する反応速度を評価するテストです。ゲームはランダムにキーを強調表示し、できるだけ早く対応するキーを押す必要があります。システムは反応時間を記録します。',
    whatIsColorReactionTest: 'カラー反応テストとは？',
    whatIsColorReactionTestDesc:
      'カラー反応テストは、色の認識と反応速度を評価するテストです。ゲームはランダムにカラーテキストを表示し、テキストの内容を無視して、テキストの内容に一致する色の四角をできるだけ早くクリックする必要があります。',
    howToGetBetterScore: 'より良いスコアを取得するにはどうすればよいですか？',
    howToGetBetterScoreDesc:
      '指をWASDキーの上に置き、画面に集中し、リラックスしてください。何度も練習することで、キーの反応速度を向上させることができます。',
    howResultsCalculated: 'テスト結果はどのように計算されますか？',
    howResultsCalculatedDesc:
      'システムは各ラウンドの反応時間を記録し、最後に5ラウンドの平均反応時間を最終スコアとして計算します。',
    whyTooSoon: '「早すぎます」と表示されることがあるのはなぜですか？',
    whyTooSoonDesc:
      'これは、キーが強調表示される前にキーを押したことを意味します。キーが緑色に変わってから対応するキーを押してください。',
    // 通用游戏术语
    spaceBar: 'スペースバー',
    pressSpaceToStart: 'スペースキーを押して開始',
    clickSpaceToStart: 'スペースキーをクリックして開始',
    // 首页相关
    welcomeToCps: 'CPSテストプラットフォームへようこそ',
    improveSkills: '反応速度とクリックスキルを向上させる',
    multipleTestTypes: '複数のテストタイプ',
    multipleTestTypesDesc:
      'クリックテスト、反応テスト、タイピングテストなど、スキルを総合的に向上させるための複数のテストタイプを提供',
    realTimeStats: 'リアルタイム統計',
    realTimeStatsDesc:
      'テスト結果と統計データをリアルタイムで表示し、自分のパフォーマンスを理解するのに役立ちます',
    historyRecords: '履歴記録',
    historyRecordsDesc: 'テスト履歴を保存し、進歩と成長を追跡',
    gamifiedExperience: 'ゲーミフィケーション体験',
    gamifiedExperienceDesc:
      '面白いゲーミフィケーションデザインにより、テストがより生き生きとして楽しくなります',
    quickStart: 'クイックスタート',
    testYourClickSpeed: 'クリック速度をテスト',
    testYourReactionSpeed: '反応速度をテスト',
    testYourTypingSpeed: 'タイピング速度をテスト',
    testYourSpaceClickSpeed: 'スペースキーのクリック速度をテスト',
    professionalMinecraftClickTest: 'プロのMinecraftクリックテスト',
    testYourColorReactionSpeed: '色認識反応速度をテスト',
    testYourWasdReactionSpeed: 'WASDキーの反応速度をテスト',
    trainYourReactionAndAim: '反応と照準を訓練',
    testYourMouseScrollSpeed: 'マウススクロール速度をテスト',
    testYourMouseDragSpeed: 'マウスドラッグ速度をテスト',
    keyboardTest: 'キーボードテスト',
    keyboardTestDesc: 'ここですべてのキーボードボタンを確認できます：',
    faq: 'よくある質問',
    whatIsKeyboardTest: 'キーボードテストは何のためのものですか？',
    keyboardTestPurpose:
      'キーボードテストは、キーボードのキーが正常に動作しているかどうかを検出するために使用されます。同時に、キーストロークの順序と応答時間を記録します。このテストにより、キーボードの感度とキーの状態を理解し、キーボードが清掃または交換を必要とするかどうかを判断するのに役立ちます。',
    pressedKeys: '押されたキー',
    noKeysPressed: 'キーが押されていません',
    platformFeatures: 'プラットフォームの特徴',
    accurateTesting: '高精度テスト',
    accurateTestingDesc: '高精度の計時と統計アルゴリズムを採用し、テスト結果の正確性を確保',
    responsiveDesign: 'レスポンシブデザイン',
    responsiveDesignDesc: 'さまざまなデバイスに対応し、いつでもどこでもテスト可能',
    achievementSystem: '実績システム',
    achievementSystemDesc: 'さまざまな難易度のテストを完了し、さまざまな実績を解錠',
    communityFeatures: 'コミュニティ機能',
    communityFeaturesDesc: '他のユーザーとスコアを比較し、進歩を共有',
    testGuide: 'テストガイド',
    selectTestType: 'テストタイプを選択',
    selectTestTypeDesc: '左側のメニューから実行したいテストタイプを選択',
    startTestDesc: '指示に従ってテストを開始し、テストプロセスに集中',
    viewResults: '結果を表示',
    viewResultsDesc: 'テスト終了後にスコアと統計データを表示',
    practiceContinuously: '継続的に練習',
    practiceContinuouslyDesc: '複数回のテストを通じてスキルを向上させ、進歩を追跡',
    // FAQ相关
    faqTitle: '{time}秒クリックテストFAQ',
    faqDesc:
      '{time}秒クリックテストは、固定時間内のクリック速度を評価するテストです。テスト時間に応じて、瞬発力、短期安定性、または長期持久力を評価できます。テスト後、システムは毎秒のクリック数（CPS）を計算します。',
    spaceFaqTitle: '{time}秒スペースクリックテストFAQ',
    spaceFaqDesc:
      '{time}秒スペースクリックテストは、固定時間内のスペースバーのクリック速度を評価するテストです。テスト時間に応じて、瞬発力、短期安定性、または長期持久力を評価できます。テスト後、システムは毎秒のクリック数（CPS）を計算します。',
    // 1秒クリックテストFAQ
    faqClick1Q1: '1秒マウスクリックテストは主に何を測定しますか？',
    faqClick1A1:
      '1秒マウスクリックテストは瞬発力を測定し、非常に短い時間で指が達成できる最高クリック速度を考慮します。これは最も古典的なCPSテストで、手速の潜在能力を迅速に評価できます。',
    faqClick1Q2: '1秒マウスクリックテストでどれくらいのCPSが合格とされますか？',
    faqClick1A2:
      '参考基準：\n初心者：6-8 CPS\n普通：8-10 CPS\n熟練者：10-12 CPS\n優秀：12-15 CPS\nプロ：15+ CPS',
    faqClick1Q3: 'なぜ1秒マウスクリックテストの結果は大きく変動するのですか？',
    faqClick1A3:
      '原因には：開始リズムの不安定性、指の緊張によるカクツキ、注意力の散漫、デバイスの応答遅延が含まれます',
    faqClick1Q4: '1秒マウスクリックテストのスコアを向上させるにはどうすればよいですか？',
    faqClick1A4:
      '提案：指をリラックスさせ、過剰な力を加えないでください。自分に合ったクリックリズムを見つけてください。テスト前に手のウォームアップをしてください。高レスポンスレートのマウス（1000Hz）を使用してください',
    // 1秒スペースクリックテストFAQ
    spaceFaq1Q1: '1秒スペースクリックテストは主に何を測定しますか？',
    spaceFaq1A1:
      '1秒スペースクリックテストは瞬発力を測定し、非常に短い時間で指が達成できる最高クリック速度を考慮します。これは最も古典的なスペースバーCPSテストで、スペースバーの手速の潜在能力を迅速に評価できます。',
    spaceFaq1Q2: '1秒スペースクリックテストでどれくらいのCPSが合格とされますか？',
    spaceFaq1A2:
      '参考基準：初心者：5-7 CPS普通：7-9 CPS熟練者：9-11 CPS優秀：11-14 CPSプロ：14+ CPS',
    spaceFaq1Q3: 'なぜ1秒スペースクリックテストの結果は大きく変動するのですか？',
    spaceFaq1A3:
      '原因には：開始リズムの不安定性、指の緊張によるカクツキ、注意力の散漫、キーボードの応答遅延が含まれます',
    spaceFaq1Q4: '1秒スペースクリックテストのスコアを向上させるにはどうすればよいですか？',
    spaceFaq1A4:
      '提案：指をリラックスさせ、過剰な力を加えないでください。自分に合ったクリックリズムを見つけてください。テスト前に手のウォームアップをしてください。メカニカルキーボードまたは高応答キーボードを使用してください',
    // 2秒スペースクリックテストFAQ
    spaceFaq2Q1: '2秒スペースクリックテストと1秒テストの違いは何ですか？',
    spaceFaq2A1:
      '2秒スペースクリックテストは、1秒のテストに短期安定性の要件を追加します。1秒テストは瞬発力だけを見ますが、2秒テストでは高速クリックを維持する必要があり、より実際のレベルを反映します。',
    spaceFaq2Q2: '2秒スペースクリックテストのCPSは1秒のものより低くなるべきですか？',
    spaceFaq2A2:
      'はい、通常の場合：2秒CPS ≈ 1秒CPS × 0.9-0.95。差が大きすぎる場合（例：2秒CPS < 1秒CPS × 0.85）は、持久力が不足しています',
    spaceFaq2Q3: '2秒スペースクリックテストはどのような人に適していますか？',
    spaceFaq2A3:
      '適しています：1秒からより長いテストに移行したい初心者短期安定性を評価する必要のあるプレイヤー日常トレーニングの基準テストとして',
    spaceFaq2Q4: '2秒スペースクリックテストの練習方法は？',
    spaceFaq2A4:
      '提案：毎日5セットの2秒テストを行い、平均スコアを記録してください。後半1秒が明らかに低下していないかに注意してください。1秒と5秒のテストを組み合わせて総合的なトレーニングを行ってください。',
    // 5秒スペースクリックテストFAQ
    spaceFaq5Q1: '5秒スペースクリックテストのコア価値は何ですか？',
    spaceFaq5A1:
      '5秒スペースクリックテストは、瞬発力と持久力をバランスさせる最適な時間枠です。瞬発力を反映しながら、短期持久力もテストでき、総合的な能力を評価する重要な指標です。',
    spaceFaq5Q2: '5秒スペースクリックテストのCPS参考基準は？',
    spaceFaq5A2:
      '参考：初心者：5-7 CPS（25-35回）普通：7-9 CPS（35-45回）熟練者：9-11 CPS（45-55回）優秀：11+ CPS（55+回）',
    spaceFaq5Q3: '5秒スペースクリックテストで後半の速度が低下したらどうすればよいですか？',
    spaceFaq5A3:
      '対策：開始速度を調整し、最初から全力ではなく安定したクリックリズムを確立します。手の持久力トレーニングを強化します。呼吸リズムに注意し、リラックスします。',
    spaceFaq5Q4: '5秒スペースクリックテストの進歩はどのように判断しますか？',
    spaceFaq5A4:
      '観察指標：CPS向上：全体的な速度が上昇。安定性改善：後半の減衰率が減少。クリック曲線が平滑：変動が減少。',
    // 10秒スペースクリックテストFAQ
    spaceFaq10Q1: '10秒スペースクリックテストは主に何を試験しますか？',
    spaceFaq10A1:
      '10秒スペースクリックテストは、持久力と抗疲労能力を重点的に評価します。長時間安定したクリックを維持する能力を反映し、持久力トレーニングの重要な指標です。',
    spaceFaq10Q2: '10秒スペースクリックテストのCPS参考基準は？',
    spaceFaq10A2:
      '参考：初心者：4-6 CPS（40-60回）普通：6-8 CPS（60-80回）熟練者：8-10 CPS（80-100回）優秀：10+ CPS（100+回）',
    spaceFaq10Q3: '10秒スペースクリックテストで手が疲れたらどうすればよいですか？',
    spaceFaq10A3:
      '対策：テスト前に十分なウォームアップを行います。手首をリラックスさせ、硬くしないでください。自分に合ったクリックリズムを見つけてください。痛みが出たら即座に停止してください。',
    spaceFaq10Q4: '10秒スペースクリックテストの持久力はどのように向上させますか？',
    spaceFaq10A4:
      'トレーニング提案：5秒から始め、7秒、10秒と段階的に延長します。毎週1-2秒トレーニング時間を増やします。後半5秒のCPS減衰率に注意します（目標＜15%）。手の筋力トレーニングを組み合わせます。',
    // 15秒スペースクリックテストFAQ
    spaceFaq15Q1: '15秒スペースクリックテストの特徴は何ですか？',
    spaceFaq15A1:
      '15秒スペースクリックテストは、10秒と30秒の間の中長距離持久力テストです。30秒テストの過度の疲労を避けながら、持続的なクリック能力をより正確に評価できます。',
    spaceFaq15Q2: '15秒スペースクリックテストのCPS参考基準は？',
    spaceFaq15A2:
      '参考：初心者：4-5 CPS（60-75回）普通：5-7 CPS（75-105回）熟練者：7-9 CPS（105-135回）優秀：9+ CPS（135+回）',
    spaceFaq15Q3: '15秒スペースクリックテストで体力をどのように分配しますか？',
    spaceFaq15A3:
      '戦略提案：最初の5秒：90%の速度を維持し、リズムを確立します。中間の5秒：安定を維持し、呼吸に注意します。最後の5秒：適切に加速してスプリントするか、安定を維持します。',
    spaceFaq15Q4: '15秒スペースクリックテストはどのようなトレーニング目標に適していますか？',
    spaceFaq15A4:
      '適しています：10秒から30秒への進級トレーニング。中時間持久力を評価する場合。日常トレーニングの常規テスト項目として。',
    // 30秒スペースクリックテストFAQ
    spaceFaq30Q1: '30秒スペースクリックテストのコア価値は何ですか？',
    spaceFaq30A1:
      '30秒スペースクリックテストは標準的な持久力テストで、手の筋肉の持久力と抗疲労能力を総合的に評価できます。これはプロのトレーニングやeスポーツ選手がよく使用するテスト時間です。',
    spaceFaq30Q2: '30秒スペースクリックテストのCPS参考基準は？',
    spaceFaq30A2:
      '参考：初心者：3-5 CPS（90-150回）普通：5-7 CPS（150-210回）熟練者：7-9 CPS（210-270回）優秀：9+ CPS（270+回）',
    spaceFaq30Q3: '30秒スペースクリックテストで疲労に対応するにはどうすればよいですか？',
    spaceFaq30A3:
      '対策：心理的準備：最後の10秒は速度が落ちることを受け入れます。リズム制御：最初の10秒は速すぎず、80%の速度を維持します。呼吸コーディネーション：深呼吸し、リラックスします。手のリラックス：5秒ごとに指を軽くリラックスします。',
    spaceFaq30Q4: '30秒スペースクリックテストの一般的な問題は？',
    spaceFaq30A4:
      '一般的な問題：最初は速く、後は遅くなる、減衰が大きい（＞25%）。手が硬くなり、速度に影響する。注意力が散漫で、リズムが乱れる。機器が不適切で、キーボードが重すぎるかキーストロークが適切でない。',
    // 60秒スペースクリックテストFAQ
    spaceFaq60Q1: '60秒スペースクリックテストの意義は何ですか？',
    spaceFaq60A1:
      '60秒スペースクリックテストは極限持久力テストで、手の筋肉の限界持久力を試験します。抗疲労能力と意志力を総合的に評価でき、プロ選手の究極のテストです。',
    spaceFaq60Q2: '60秒スペースクリックテストのCPS参考基準は？',
    spaceFaq60A2:
      '参考：初心者：3-4 CPS（180-240回）普通：4-6 CPS（240-360回）熟練者：6-8 CPS（360-480回）優秀：8+ CPS（480+回）',
    spaceFaq60Q3: '60秒スペースクリックテストで体力をどのように分配しますか？',
    spaceFaq60A3:
      '体力分配戦略：0-15秒：安定したスタート、85%の速度を維持。15-30秒：リズムを見つけ、安定を維持。30-45秒：最も困難な段階、意志力を維持。45-60秒：全力でスプリントするか、安定を維持する。',
    spaceFaq60Q4: '60秒スペースクリックテストの注意事項は？',
    spaceFaq60A4:
      '重要な注意事項：十分なウォームアップ：少なくとも5分間の手のストレッチ。機器チェック：キーボードの状態が良好であることを確認します。環境準備：静かで快適な環境を選択します。健康第一：痛みが出たら即座に停止し、無理をしないでください。適度なトレーニング：60秒テストは激しいため、週に2回までに制限します。',
    // KohiクリックテストFAQ
    kohiFaqDesc:
      'Kohiクリックテストは、MinecraftサーバーKohiに起源を持つ特殊なクリック速度テストです。テスト時間は10秒に固定されており、プレイヤーはできるだけ早く画面をクリックする必要があります。テスト後、最終的なCPS値が表示されます。KohiテストはMinecraftプレイヤー向けに特別に設計されており、持続的なクリックの安定性に重点を置いています。',
    kohiFaqQ1: 'Kohiクリックテストとは？',
    kohiFaqA1:
      'Kohiクリックテストは、MinecraftサーバーKohiに起源を持つ特殊なクリック速度テストです。テスト時間は10秒に固定されており、プレイヤーはできるだけ早く画面をクリックする必要があります。テスト後、最終的なCPS値が表示されます。KohiテストはMinecraftプレイヤー向けに特別に設計されており、持続的なクリックの安定性に重点を置いています。',
    kohiFaqQ2: 'Kohiクリックテストと通常のCPSテストの違いは何ですか？',
    kohiFaqA2:
      'KohiクリックテストはMinecraftプレイヤー向けに特別に設計されており、テスト時間は10秒に固定されています。持続的なクリックの安定性に重点を置いています。Minecraftコミュニティでは、プレイヤーのPvP能力を測定するために広く使用されています。',
    kohiFaqQ3: 'Kohiテストは何に役立ちますか？',
    kohiFaqA3:
      'Kohiテストは、Minecraftプレイヤーのクリック速度と安定性を理解するのに役立ちます。これはPvP戦闘で非常に重要で、特に近接戦闘では高いKohi CPSがプレイヤーに優位性を与えます。',
    kohiFaqQ4: 'Kohi CPSを向上させるにはどうすればよいですか？',
    kohiFaqA4:
      'Kohi CPSを向上させるには、特定のクリックテクニック（バタフライクリック、ジッタークリック、またはドラッグクリックなど）を練習する必要があります。同時に、適切なマウスとマウスパッドを使用することで、クリック速度と安定性を向上させることができます。',
    // 2秒クリックテストFAQ
    faqClick2Q1: '2秒マウスクリックテストと1秒テストの違いは何ですか？',
    faqClick2A1:
      '2秒マウスクリックテストは、1秒のテストに短期安定性の要件を追加します。1秒テストは瞬発力だけを見ますが、2秒テストでは高速クリックを維持する必要があり、より実際のレベルを反映します。',
    faqClick2Q2: '2秒マウスクリックテストのCPSは1秒のものより低くなるべきですか？',
    faqClick2A2:
      'はい、通常の場合：2秒CPS ≈ 1秒CPS × 0.9-0.95。差が大きすぎる場合（例：2秒CPS < 1秒CPS × 0.85）は、持久力が不足しています。',
    faqClick2Q3: '2秒マウスクリックテストはどのような人に適していますか？',
    faqClick2A3:
      '適しています：1秒からより長いテストに移行したい初心者。短期安定性を評価する必要のあるプレイヤー。日常トレーニングの基準テストとして。',
    faqClick2Q4: '2秒マウスクリックテストの練習方法は？',
    faqClick2A4:
      '提案：毎日5セットの2秒テストを行い、平均スコアを記録してください。後半1秒が明らかに低下していないかに注意してください。1秒と5秒のテストを組み合わせて総合的なトレーニングを行ってください。',
    // 5秒クリックテストFAQ
    faqClick5Q1: '5秒マウスクリックテストのコア価値は何ですか？',
    faqClick5A1:
      '5秒マウスクリックテストは、瞬発力と持久力をバランスさせる最適な時間枠です。瞬発力を反映しながら、短期持久力もテストでき、総合的な能力を評価する重要な指標です。',
    faqClick5Q2: '5秒マウスクリックテストのCPS参考基準は？',
    faqClick5A2:
      '参考：初心者：5-7 CPS（25-35回）普通：7-9 CPS（35-45回）熟練者：9-11 CPS（45-55回）優秀：11+ CPS（55+回）',
    faqClick5Q3: '5秒マウスクリックテストで後半の速度が低下したらどうすればよいですか？',
    faqClick5A3:
      '対策：開始速度を調整し、最初から全力ではなく安定したクリックリズムを確立します。手の持久力トレーニングを強化します。呼吸リズムに注意し、リラックスします。',
    faqClick5Q4: '5秒マウスクリックテストの進歩はどのように判断しますか？',
    faqClick5A4:
      '観察指標：CPS向上：全体的な速度が上昇。安定性改善：後半の減衰率が減少。クリック曲線が平滑：変動が減少。',
    // 10秒クリックテストFAQ
    faqClick10Q1: '10秒マウスクリックテストは主に何を試験しますか？',
    faqClick10A1:
      '10秒マウスクリックテストは、持久力と抗疲労能力を重点的に評価します。長時間安定したクリックを維持する能力を反映し、持久力トレーニングの重要な指標です。',
    faqClick10Q2: '10秒マウスクリックテストのCPS参考基準は？',
    faqClick10A2:
      '参考：初心者：4-6 CPS（40-60回）普通：6-8 CPS（60-80回）熟練者：8-10 CPS（80-100回）優秀：10+ CPS（100+回）',
    faqClick10Q3: '10秒マウスクリックテストで手が疲れたらどうすればよいですか？',
    faqClick10A3:
      '対策：テスト前に十分なウォームアップを行います。手首をリラックスさせ、硬くしないでください。自分に合ったクリックリズムを見つけてください。痛みが出たら即座に停止してください。',
    faqClick10Q4: '10秒マウスクリックテストの持久力はどのように向上させますか？',
    faqClick10A4:
      'トレーニング提案：5秒から始め、7秒、10秒と段階的に延長します。毎週1-2秒トレーニング時間を増やします。後半5秒のCPS減衰率に注意します（目標＜15%）。手の筋力トレーニングを組み合わせます。',
    // 15秒クリックテストFAQ
    faqClick15Q1: '15秒マウスクリックテストの特徴は何ですか？',
    faqClick15A1:
      '15秒マウスクリックテストは、10秒と30秒の間の中長距離持久力テストです。30秒テストの過度の疲労を避けながら、持続的なクリック能力をより正確に評価できます。',
    faqClick15Q2: '15秒マウスクリックテストのCPS参考基準は？',
    faqClick15A2:
      '参考：初心者：4-5 CPS（60-75回）普通：5-7 CPS（75-105回）熟練者：7-9 CPS（105-135回）優秀：9+ CPS（135+回）',
    faqClick15Q3: '15秒マウスクリックテストで体力をどのように分配しますか？',
    faqClick15A3:
      '戦略提案：最初の5秒：90%の速度を維持し、リズムを確立します。中間の5秒：安定を維持し、呼吸に注意します。最後の5秒：適切に加速してスプリントするか、安定を維持します。',
    faqClick15Q4: '15秒マウスクリックテストはどのようなトレーニング目標に適していますか？',
    faqClick15A4:
      '適しています：10秒から30秒への進級トレーニング。中時間持久力を評価する場合。日常トレーニングの常規テスト項目として。',
    // 30秒クリックテストFAQ
    faqClick30Q1: '30秒マウスクリックテストのコア価値は何ですか？',
    faqClick30A1:
      '30秒マウスクリックテストは標準的な持久力テストで、手の筋肉の持久力と抗疲労能力を総合的に評価できます。これはプロのトレーニングやeスポーツ選手がよく使用するテスト時間です。',
    faqClick30Q2: '30秒マウスクリックテストのCPS参考基準は？',
    faqClick30A2:
      '参考：初心者：3-5 CPS（90-150回）普通：5-7 CPS（150-210回）熟練者：7-9 CPS（210-270回）優秀：9+ CPS（270+回）',
    faqClick30Q3: '30秒マウスクリックテストで疲労に対応するにはどうすればよいですか？',
    faqClick30A3:
      '対策：心理的準備：最後の10秒は速度が落ちることを受け入れます。リズム制御：最初の10秒は速すぎず、80%の速度を維持します。呼吸コーディネーション：深呼吸し、リラックスします。手のリラックス：5秒ごとに指を軽くリラックスします。',
    faqClick30Q4: '30秒マウスクリックテストの一般的な問題は？',
    faqClick30A4:
      '一般的な問題：最初は速く、後は遅くなる、減衰が大きい（＞25%）。手が硬くなり、速度に影響する。注意力が散漫で、リズムが乱れる。機器が不適切で、マウスが重すぎるかマウスパッドが滑らかでない。',
    // 60秒クリックテストFAQ
    faqClick60Q1: '60秒マウスクリックテストの意義は何ですか？',
    faqClick60A1:
      '60秒マウスクリックテストは極限持久力テストで、手の筋肉の限界持久力を試験します。抗疲労能力と意志力を総合的に評価でき、プロ選手の究極のテストです。',
    faqClick60Q2: '60秒マウスクリックテストのCPS参考基準は？',
    faqClick60A2:
      '参考：初心者：3-4 CPS（180-240回）普通：4-6 CPS（240-360回）熟練者：6-8 CPS（360-480回）優秀：8+ CPS（480+回）',
    faqClick60Q3: '60秒マウスクリックテストで体力をどのように分配しますか？',
    faqClick60A3:
      '体力分配戦略：0-15秒：安定したスタート、85%の速度を維持。15-30秒：リズムを見つけ、安定を維持。30-45秒：最も困難な段階、意志力を維持。45-60秒：全力でスプリントするか、安定を維持する。',
    faqClick60Q4: '60秒マウスクリックテストの注意事項は？',
    faqClick60A4:
      '重要な注意事項：十分なウォームアップ：少なくとも5分間の手のストレッチ。機器チェック：マウスとマウスパッドの状態が良好であることを確認します。環境準備：静かで快適な環境を選択します。健康第一：痛みが出たら即座に停止し、無理をしないでください。適度なトレーニング：60秒テストは激しいため、週に2回までに制限します。',
    // タイピングテスト関連
    minTypingTest: '分タイピングスピードテスト',
    accuracy: '正確率',
    characters: '文字数',
    textCompleted: 'テキストが完了しました',
    clickToStartThenTypeHere: 'クリックして開始した後、ここに入力',
    testFinished: 'テストが終了しました',
    finalScore: '最終スコア',
    totalCharacters: '総文字数',
    correctCharacters: '正しい文字数',
    wrongCharacters: '誤った文字数',
    // タイピングテストFAQ
    whatIsTypingTest: 'タイピングテストとは？',
    whatIsTypingTestDesc:
      'タイピングテストは、タイピングスピードと正確率を評価するテストです。指定された時間内に表示されたテキストを入力する必要があり、システムは毎分単語数（WPM）と正確率を計算します。タイピングテストにより、キーボードでのタイピングスピードと正確性をテストし、タイピング能力を判断することができます。',
    whatIsTypingTestUse: 'タイピングテストの用途は？',
    whatIsTypingTestUseDesc:
      'タイピングテストは、タイピングスピードと正確率を把握し、仕事効率を向上させ、求職やゲーム競技の準備に役立ちます。オフィスワーカー、学生、ゲーマーにとって、優れたタイピングスキルは非常に重要です。',
    howToImproveTypingSpeed: 'タイピングスピードを向上させるには？',
    howToImproveTypingSpeedDesc:
      'タイピングスピードを向上させるには練習が必要です。正しいタイピング姿勢を使用し、ブラインドタッチのテクニックを活用し、定期的にタイピング練習を行うことをお勧めします。タイピングテストツールを使用することで、進歩を追跡し、改善点を見つけることができます。',
    whatIsWPM: 'WPMとは？',
    whatIsWPMDesc:
      'WPM（Words Per Minute）は毎分単語数を意味し、タイピングスピードを測定する標準的な指標です。一般的に、普通のユーザーのタイピングスピードは30-60 WPMで、熟練したユーザーは60-100 WPMに達し、プロのタイピストは100 WPM以上になることができます。',
    whatIsGoodAccuracy: '良好なタイピング正確率とは？',
    whatIsGoodAccuracyDesc:
      '良好なタイピング正確率は95%以上であるべきです。正確率が90%を下回る場合は、まず正確性に注力し、その後速度を向上させることをお勧めします。',
    bestScore: 'ベストスコア',
    targetEliminationGameDesc:
      '画面上のカラーターゲットをクリックして消去し、指定時間内に可能な限り高いスコアを獲得しましょう！',
    gameDuration: 'ゲーム時間',
    sec: '秒',
    whatIsTargetEliminationGame: 'ターゲット消去反応トレーニングゲームとは？',
    whatIsTargetEliminationGameDesc:
      'ターゲット消去反応トレーニングゲームは、ユーザーの反応速度と手眼協調能力をテストするゲームです。プレイヤーは指定時間内に画面に出現するカラーターゲットをクリックして消去し、スコアを獲得します。ゲームでは複数のターゲットがランダムに生成され、画面上を移動してゲームの難易度を高めます。',
    gameRules: 'ゲームルール',
    gameRulesDesc:
      '1. 画面上のカラーターゲットをクリックして消去します。2. 1つのターゲットを消去するごとに10点を獲得します。3. ゲーム時間は30秒です。4. ターゲットは画面上をランダムに移動します。5. ゲーム終了後、最終スコアとベストスコアが表示されます。',
    whatIsTargetEliminationGameUsefulFor:
      'ターゲット消去反応トレーニングゲームは何に役立ちますか？',
    whatIsTargetEliminationGameUsefulForDesc:
      'ターゲット消去反応トレーニングゲームは、プレイヤーの反応速度、手眼協調能力、注意力を向上させるのに役立ちます。これらのスキルは、ゲーマー、スポーツ選手、迅速な反応が必要な職業の従事者にとって非常に重要です。定期的な反応トレーニングにより、脳の機敏性を維持し、様々な状況での反応速度を向上させることができます。',
    howToImproveTargetEliminationScore:
      'ターゲット消去反応トレーニングゲームのスコアを向上させるには？',
    howToImproveTargetEliminationScoreDesc:
      '1. 注意力を集中し、常に画面上のターゲットに注意を払います。2. 手眼協調を練習し、クリックの正確性を向上させます。3. 自分に合ったクリックリズムを見つけます。4. 定期的にトレーニングを行い、反応速度を徐々に向上させます。5. リラックスし、緊張による反応速度の低下を避けます。',
    targetEliminationGameDesignPrinciple: 'ターゲット消去反応トレーニングゲームの設計原理は？',
    targetEliminationGameDesignPrincipleDesc:
      'ターゲット消去反応トレーニングゲームは、視覚認知と運動反応メカニズムに基づいて設計されています。ゲームはランダムに移動するターゲットを生成することで、プレイヤーの視覚システムを刺激し、次にプレイヤーは手部動作でターゲットをクリックする必要があります。このプロセスには、視覚情報処理、意思決定、運動実行の3つの段階が含まれます。ゲームの難易度はターゲットの数と移動速度で調整され、さまざまなレベルのプレイヤーに適したトレーニングが可能です。',
    newRecord: '新記録',
    gameOver: 'ゲームオーバー',
    pixelsPerSecond: 'ピクセル/秒',
    scrollAsFastAsPossible: 'できるだけ速くマウスホイールをスクロールしてください！',
    yourBestScore: 'あなたのベストスコア：',
    settings: '設定',
    blockSize: 'ブロックサイズ',
    small: '小',
    medium: '中',
    large: '大',
    gameMode: 'ゲームモード',
    static: '静止',
    dynamic: '移動',
    movementSpeed: '移動速度',
    slow: '遅い',
    fast: '速い',
    whatIsMouseScrollTest: 'マウススクロールテストとは？',
    whatIsMouseScrollTestDesc:
      'マウススクロールテストは、スクロール領域内でプレイヤーが1秒あたりに達成できる最高スクロールピクセル数をテストするものです。プレイヤーはテスト領域内でできるだけ速くマウスホイールをスクロールする必要があり、システムはリアルタイムでスクロール速度を計算し、最高速度を記録します。',
    howToImproveScrollSpeed: 'マウススクロール速度を向上させるには？',
    howToImproveScrollSpeedDesc:
      '1. 高品質のマウスを使用し、適切なホイール感度設定を選択します。2. 手首と指の協調性を練習します。3. 自分に合ったスクロールリズムを見つけます。4. リラックスし、過度な緊張を避けます。5. 定期的にスクロールトレーニングを行います。',
    whatDoResultsMean: 'テスト結果は何を意味しますか？',
    whatDoResultsMeanDesc:
      'テスト結果は、1秒間にスクロールできる最大ピクセル数を示します。一般的に、普通のプレイヤーのスクロール速度は500-1500ピクセル/秒で、熟練したプレイヤーは1500-3000ピクセル/秒に達することができ、プロプレイヤーは3000ピクセル/秒を超えることもあります。',
    isThereTimeLimit: '時間制限はありますか？',
    isThereTimeLimitDesc:
      'マウススクロールテストには時間制限はありません。ページを更新するかブラウザを閉じるまで、システムは最高スクロール速度を記録し続けます。',
    // ホームページFAQ関連
    homeFaqQ1: 'CPS Testとは？',
    homeFaqA1:
      'CPS Test（クリック速度テスト）は、特定の時間内にマウスをクリックできる回数を測定するテストで、毎秒のクリック数（Clicks Per Second）を計算してクリック速度を評価します。手速レベルを把握し、長期的なトレーニングでの進歩を追跡することができ、ゲーマー、eスポーツ選手、迅速な操作が必要な職業の従事者にとって重要な参考価値があります。',
    homeFaqQ2: '科学的にクリック速度を向上させる方法は？',
    homeFaqA2:
      'クリック速度を向上させるには、システマティックな練習と正しい方法が必要です：\n1. テクニック選択：個人の習慣に合わせて適切なクリック方法（バタフライクリック、ジッタークリック、ドラッグクリックなど）を選択\n2. 定期的なトレーニング：毎日15-30分の集中的な練習を行い、筋肉記憶を保持\n3. 手のウォームアップ：テスト前に簡単な手のストレッチとリラックス運動を行う\n4. 機器最適化：高レスポンスマウス（1000Hz）と適切なマウスパッドを使用\n5. リズム制御：安定したクリックリズムを確立し、過度な緊張による速度低下を避ける\n6. クロストレーニング：異なる時間長のテスト（1秒、5秒、30秒）を組み合わせて、瞬発力と持久力を全面的に向上させる',
    homeFaqQ3: 'CPSテスト結果の正確性はどのように保証されていますか？',
    homeFaqA3:
      '当社のCPSテストは信頼性の高い計時と計算方法を採用し、結果の正確性と信頼性を保証しています：\n1. 高精度計時：専門的な時間測定技術を使用し、精度は0.1ミリ秒に達し、すべてのクリックが正確に記録されます\n2. スマート不正防止：異常なクリックパターンを検出するアルゴリズムを内蔵し、テスト結果の真実性と信頼性を確保\n3. デバイス適応：異なるデバイスとブラウザの遅延差を自動調整し、公平性を保証\n4. 複数回テスト推奨：3-5回のテストを実施し、平均値を参考とすることを推奨、これにより結果が真の実力を反映します\n5. 結果影響要因：デバイスのパフォーマンス、ネットワーク状態、テスト環境、個人の状態などが結果に微妙な影響を与える可能性があります。安定した環境でテストを行うことを推奨します',
    homeFaqQ4: 'モバイルデバイスでのCPSテストはデスクトップデバイスとどう違いますか？',
    homeFaqA4:
      'モバイルデバイスでのCPSテストには以下の特徴があります：\n1. 操作方法：マウスの物理ボタンではなく、タッチスクリーンでクリック\n2. 速度の違い：タッチ遅延と操作方法の違いにより、モバイル端末のCPSは通常デスクトップ端末より20-30%低い\n3. デバイスの影響：異なる携帯電話の画面リフレッシュレートとタッチ応答速度がテスト結果に影響\n4. テスト体験：さまざまなサイズのデバイスで良好なテスト体験が得られるように、モバイル端末用インターフェースを最適化\n5. 結果の参考価値：モバイル端末のテスト結果は横比較に適し、デスクトップ端末と直接比較することは推奨されない',
    homeFaqQ5: 'テストデータはどのように保存・保護されていますか？',
    homeFaqA5:
      '当社はローカルストレージメカニズムを採用してテストデータを保護しています：\n1. 保存場所：すべてのテスト結果はブラウザのローカルストレージに保存され、サーバーにアップロードされない\n2. データセキュリティ：データはあなたのデバイスにのみ保存され、第三者からアクセスされることはない\n3. データ管理：ブラウザのキャッシュをクリアすることで、テスト記録をいつでも削除できる\n4. クロスデバイス同期：現在、クロスデバイスのデータ同期はサポートされていないため、固定デバイスでテストを行うことを推奨\n5. プライバシー保護：個人のテストデータを収集・分析することはなく、ユーザーのプライバシーを完全に尊重',
    homeFaqQ6: 'バタフライクリック（Butterfly Clicking）の原理とテクニックは？',
    homeFaqA6:
      'バタフライクリックは、人差し指と中指を素早く交互に使用してマウス左ボタンをクリックする高度なクリックテクニックです：\n1. 仕組み：マウスのマイクロスイッチの物理特性を利用し、両手の指の素早い交互動作によって連続クリックを生成\n2. 速度範囲：熟練者は20-30 CPS、さらにそれ以上を達成できる\n3. 練習方法：手首を安定させ、指をリラックスさせ、反復練習で最適な交互リズムを見つける\n4. 適用シナリオ：短時間で高CPSが必要なゲームシナリオに適している\n5. 機器要件：クリック感が清脆で反発が速いマウスが必要で、重いボタンのオフィスマウスには適していない',
    homeFaqQ7: 'ジッタークリック（Jitter Clicking）のコアテクノロジーと注意事項は？',
    homeFaqA7:
      'ジッタークリックは、腕と手首を素早く振動させて連続クリックを生成するテクニックです：\n1. コア原理：筋肉の微小な振動を利用して指を素早くマウスボタンに押し付ける\n2. 速度範囲：通常10-15 CPSを実現でき、最高で20 CPSに達することもある\n3. 練習ポイント：腕をリラックスさせ、手首の自然な振動を利用し、筋肉疲労を引き起こす過度な力を避ける\n4. 注意事項：長時間の高強度な練習は手首の不快感を引き起こす可能性があるため、練習時間を制限することを推奨\n5. 適用対象：マウスボタンが硬い、またはバタフライクリックに適さないユーザーに適している',
    homeFaqQ8: 'ドラッグクリック（Drag Clicking）の実現条件とテクニックは？',
    homeFaqA8:
      'ドラッグクリックは、マウスボタン上で指をドラッグして連続クリックを生成するテクニックです：\n1. 実現原理：マウスのマイクロスイッチの物理特性を利用し、摩擦による振動で複数回のクリックをトリガー\n2. 速度範囲：マウスと手法によって10-25 CPSを実現できる\n3. 機器要件：特殊なマウス設計（つや消しボタン表面など）と適切なマウスパッドが必要\n4. 練習テクニック：適切な指の角度と圧力を見つけ、安定したドラッグ速度を保持\n5. 一般的な問題：異なるマウスのドラッグ効果には大きな差があるため、適切な機器を見つける必要がある\n6. 注意事項：頻繁なドラッグはマウスボタンの磨耗を加速させる可能性がある',
    homeFaqQ9: '異なる時間長のCPSテストはそれぞれどのような能力を評価しますか？',
    homeFaqA9:
      '異なる時間長のテストは異なる次元の能力を評価します：\n1. 1秒テスト：瞬発力と手速の潜在能力を評価\n2. 5秒テスト：瞬発力と短期安定性のバランスを図り、最も一般的な総合評価指標となる\n3. 10秒テスト：持続的なクリックの持久力とリズム維持能力を評価\n4. 30秒テスト：標準的な持久力テストで、長時間操作の安定性を評価するのに適している\n5. 60秒テスト：極限持久力テストで、手の筋肉の抗疲労能力を試験する\n多様な時間長のテストを組み合わせて、手速の特徴を全面的に把握することを推奨',
    homeFaqQ10: 'CPSテスト結果と実際のゲームパフォーマンスの関連性は？',
    homeFaqA10:
      'CPSテスト結果とゲームパフォーマンスには一定の関連性がありますが、絶対的ではありません：\n1. 相関性：Minecraft、CS:GOなどの素早いクリックが必要なゲームでは、高CPSが優位性を持つ\n2. 限界：ゲームパフォーマンスは、反応速度、手眼協調、戦略意識など多くの要因によって決まる\n3. 参考価値：CPSテストは手速トレーニングの参考指標となるが、ゲームレベルを完全に代表するものではない\n4. 専門的なトレーニング：特定のゲームの操作要件に合わせた専門的なトレーニングは、単純な高CPS追求よりも効果的である\n5. バランスの発展：CPSトレーニングを反応速度、正確性トレーニングと組み合わせることを推奨',
    homeFaqQ11: 'CPSトレーニングによる手の疲労や損傷を回避する方法は？',
    homeFaqA11:
      '手の健康を保護することは非常に重要で、以下の原則に従うことを推奨します：\n1. 適度なトレーニング：1回の練習は30分を超えず、長時間の高強度な操作を避ける\n2. 正しい姿勢：手首を自然に伸ばし、過度な屈曲やねじれを避ける\n3. 定期的な休息：10分間練習するごとに1-2分間休息し、手首と指を動かす\n4. 手のリラックス：練習の前後に手のストレッチとマッサージを行う\n5. 機器の適応：人体工学に合ったマウスを選択し、適切なマウス感度に調整する\n6. 信号に注意：手首の痛みやしびれが発生した場合は、即座に練習を停止して休息する\n7. クロスアクティビティ：定期的にマウス以外の操作を行い、単一動作の繰り返しを避ける',
    homeFaqQ12: 'CPSテストの歴史と発展動向は？',
    homeFaqA12:
      'CPSテストの発展歴史と動向：\n1. 起源：最初はMinecraftなどのゲームコミュニティに起源し、プレイヤーのPvP能力を評価するために使用\n2. 発展：徐々にeスポーツ分野に拡大し、手速評価の標準ツールとなった\n3. 技術進歩：単純なカウントツールから、データ分析とトレーニングアドバイスを備えた専門プラットフォームへと発展\n4. 多様化：マウスクリックだけでなく、スペースバークリック、キーボードキーなど多様なテストタイプに拡張\n5. インテリジェント化：将来はAI分析を導入し、個別化されたトレーニングプランと進歩予測を提供\n6. コミュニティ化：プレイヤーランキングとトレーニングコミュニティを構築し、相互交流と進歩を促進',
    // マウスドラッグテスト関連
    mouseDragTest: 'マウスドラッグテスト',
    totalDistance: '総距離',
    averageSpeed: '平均速度',
    testDuration: 'テスト時間',
    clickAndDragToTest: 'クリックしてドラッグしてテストを開始',
    dragToStart: 'ドラッグして開始',
    dragCompleted: 'ドラッグが完了しました',
    whatIsMouseDragTestQ1: 'マウスドラッグテストのやり方は？',
    whatIsMouseDragTestA1:
      'マウスでドラッグテストを行うには：カーソルを「マウス」オブジェクトに置き、テストしたいマウス画像を押しながらテスト領域内の任意の方向にカーソルを移動します。ボタンを離すまでオブジェクトがドラッグされ続ける場合は、マウスのドラッグ機能が正常に動作しています。タッチスクリーンのドラッグテストの場合は：「マウス」画像をタッチし、テスト領域内の任意の方向に移動します。移動する場合は、画面のドラッグ機能が正常に動作しています。',
    faqMouseDragQ1: 'マウスのどのボタンでテストできますか？',
    faqMouseDragA1:
      'マウスの左ボタン、中ボタン、右ボタンを使用してテストできます。ほとんどの場合左ボタンを使用しますが、ニーズと好みに応じて中ボタンや右ボタンを使用することもできます。',
    faqMouseDragQ2: 'なぜマウスドラッグをテストするのですか？',
    faqMouseDragA2:
      'アプリケーションや画面内で何かをドラッグしているときに、マウスや指を動かし続けているにもかかわらず、突然動きが停止することがあります。これはアプリケーションのエラー、またはマウスボタンや画面の問題である可能性があります。',
    // 画像alt属性翻訳
    logoAlt: 'CPS Testアイコン',
    historyIconAlt: '履歴記録アイコン',
    multipleTestTypesIconAlt: '多様なテストタイプアイコン',
    realTimeStatsIconAlt: 'リアルタイム統計データアイコン',
    gameifiedExperienceIconAlt: 'ゲーム化体験アイコン',
    // FAQコンポーネント翻訳
    searchQuestion: '質問を検索...',
    popularQuestions: '人気の質問',
    relatedQuestions: '関連質問',
    noQuestionFound: '関連する質問が見つかりませんでした。別のキーワードを試してください。',
    // 404ページ翻訳
    pageNotFound: 'ページが見つかりません',
    pageNotFoundDescription:
      '申し訳ありませんが、アクセスしようとしたページは存在しません。URLが正しいか確認するか、ホームページに戻って引き続き閲覧してください。',
    goHome: 'ホームページに戻る',
    searchTest: 'テストを検索',
    searchPlaceholder: 'テストを検索...',
    search: '検索',
    // テストタイプの説明
    clickTestDesc: 'マウスのクリック速度をテストし、複数の時間長をサポート',
    clickTestDescription:
      'CPSTestクリックスピードテスト、1秒、2秒、5秒、10秒、15秒、30秒、60秒などの時間長をサポート、クリックスピードと総クリック数をリアルタイム表示、テスト後に詳細な統計データと履歴記録を提供',
    clickTestKeywords:
      'クリックスピードテスト,CPSTest,マウスクリックテスト,クリックスピード,オンラインクリックスピードテスト,クリックスピードテストツール,CPSテスト',
    spaceClickTestDesc: 'スペースバーのクリック速度をテストし、複数の時間長をサポート',
    spaceClickTestDescription:
      'CPSTestスペースクリックテスト、1秒、2秒、5秒、10秒、15秒、30秒、60秒などの時間長をサポート、スペースバーのクリック速度と耐久力を専門的にテスト',
    spaceClickTestKeywords:
      'スペースクリックテスト,スペースバーテスト,スペーススピードテスト,スペースクリックスピード,スペースバークリックテストツール,CPSTest',
    kohiClickTestDesc: 'プロのMinecraftクリックテスト、固定10秒',
    kohiClickTestDescription:
      'CPSTest Kohiクリックテスト、MinecraftサーバーKohi由来、固定10秒、Minecraftプレイヤー向けに専門設計、継続的なクリックの安定性と速度をテスト',
    kohiClickTestKeywords:
      'Kohiテスト,Kohiクリックテスト,Minecraftクリックテスト,MCクリックテスト,10秒クリックテスト,CPSTest',
    reactionTestDesc: '視覚的な反応速度をテストし、刺激から反応までの時間を測定',
    reactionTestDescription:
      'CPSTest反応時間テスト、視覚的な反応速度を測定、緑色の四角が表示されてからマウスクリックまでの時間間隔、平均反応時間と最高反応時間の統計を提供',
    reactionTestKeywords:
      '反応時間テスト,反応スピードテスト,視覚反応テスト,反応テスト,反応スピードテストツール,CPSTest',
    colorReactionTestDescription:
      'CPSTestカラー反応テスト、色の認識と反応速度をテスト、テキスト内容を無視し、テキストと一致する色の四角をクリック、脳の反応能力に挑戦',
    colorReactionTestKeywords:
      'カラー反応テスト,色認識テスト,視覚反応テスト,色反応スピードテスト,色テスト,CPSTest',
    keyReactionTestDescription:
      'CPSTestキー反応テスト、WASDキーに対する反応速度を評価、ゲームはランダムにキーを強調表示、できるだけ早く対応するキーを押す、ゲームプレイヤーのトレーニングに適し',
    keyReactionTestKeywords:
      'キー反応テスト,WASD反応テスト,ゲーム反応テスト,キースピードテスト,ゲームプレイヤートレーニング,CPSTest',
    targetEliminationGameDescription:
      'CPSTestターゲット消去反応トレーニングゲーム、反応スピードと手眼協調能力をテスト、指定時間内に画面上のカラフルなターゲットをクリックして、できるだけ高いスコアを獲得',
    targetEliminationGameKeywords:
      'ターゲット消去ゲーム,反応スピードトレーニング,手眼協調トレーニング,反応ゲーム,ターゲット消去テスト,CPSTest',
    mouseScrollTestDesc: 'マウススクロール速度をテストし、毎秒のスクロールピクセル数を測定',
    mouseScrollTestDescription:
      'CPSTestマウススクロールテスト、マウススクロール速度をテスト、毎秒のスクロールピクセル数を測定、高速スクロールが必要なゲームや作業シナリオに適し',
    mouseScrollTestKeywords:
      'マウススクロールテスト,スクロールスピードテスト,マウススクロールスピード,スクロールテスト,マウステスト,CPSTest',
    mouseDragTestDesc: 'マウスのドラッグ速度と精度をテスト',
    mouseDragTestDescription:
      'CPSTestマウスドラッグテスト、マウスのドラッグ速度と精度をテスト、ドラッグ距離と平均速度を記録、正確なドラッグが必要な作業やゲームシナリオに適し',
    mouseDragTestKeywords:
      'マウスドラッグテスト,ドラッグスピードテスト,マウスドラッグスピード,ドラッグテスト,マウステスト,CPSTest',
    keyboardTestDescription:
      'CPSTestキーボードテスト、キーボードのキーが正常に動作しているかを検出、キーの状態と押されたキーのリストをリアルタイム表示、キーボードの感度とキーの状態を理解するのに役立つ',
    keyboardTestKeywords:
      'キーボードテスト,キーボードキーテスト,キーボード機能テスト,キーテスト,キーボード検出,CPSTest',
    typingTestDesc: 'タイピングスピードと正確率をテストし、複数の時間長をサポート',
    typingTestDescription:
      'CPSTestタイピングテスト、タイピングスピードと正確率をテスト、1分、3分、5分、10分、15分などの時間長をサポート、タイピングスピードと正確率をリアルタイム表示',
    typingTestKeywords:
      'タイピングテスト,タイピングスピードテスト,タイピング正確率テスト,タイピング練習,タイピングスピード,CPSTest',
    doubleClickTestDesc: 'ダブルクリックの速度と正確性をテスト',
    doubleClickTestDescription:
      'CPSTestダブルクリックテスト、ダブルクリックの速度と正確性をテスト、ダブルクリック数と最高ダブルクリックスピードを記録、クイックダブルクリックが必要なゲームや作業シナリオに適し',
    doubleClickTestKeywords:
      'ダブルクリックテスト,連続クリックテスト,ダブルクリック連続テスト,ダブルクリックスピードテスト,ダブルクリック数テスト,CPSTest',
    tripleClickTestDesc: 'トリプルクリックの速度と正確性をテスト',
    tripleClickTestDescription:
      'CPSTestトリプルクリックテスト、トリプルクリックの速度と正確性をテスト、トリプルクリック数と最高トリプルクリックスピードを記録、クリックスキルの限界に挑戦',
    tripleClickTestKeywords:
      'トリプルクリックテスト,トリプルクリック連続テスト,トリプルクリックスピードテスト,トリプルクリック数テスト,トリプルクリックテストツール,CPSTest',
    copyright: '© 2025 CPSTestGo - 全著作権所有',
    // ResultModalコンポーネント
    resultModal: {
      // 詳細情報
      details: '{time}秒間に{clicks}回クリックしました',
      // ボタンテキスト
      okButton: 'OK',
      // 異なるCPS範囲の説明
      slow: {
        desc1: 'クリック速度が遅いです、もっと練習が必要です！',
        desc2: '落胆しないで、頑張ってください、より速くなります！'
      },
      average: {
        desc1: 'クリック速度は普通です、まだ改善の余地があります！',
        desc2: '良いパフォーマンスです、このリズムを維持してください！'
      },
      fast: {
        desc1: 'クリック速度が速いです、ほとんどの人を超えました！',
        desc2: '素晴らしいです、あなたの手速は本当に速いです！'
      },
      superFast: {
        desc1: 'クリック速度が超高速です、稲妻のようです！',
        desc2: '驚きました、あなたは生まれつきのクリックマスターです！'
      },
      ultraFast: {
        desc1: 'クリック速度が限界を突破しました、あなたはクリックの神です！',
        desc2: '不可能！あなたの手速は人間の認知を超えました！'
      },
      // CPSフィードバック
      feedback: {
        slow: '結果は良くない、非常に遅いです。',
        average: '良い結果です、続けて頑張ってください！',
        fast: '素晴らしい結果です、あなたはクリックマスターです！',
        superFast: '優れた結果です、あなたはクリックの伝説です！',
        ultraFast: '信じられない結果です、あなたはクリックの神です！'
      }
    },
  },
  ko: {
    websiteName: 'CPS Test - 클릭 속도 및 반응 능력 훈련 플랫폼',
    metaDescription:
      'CPS Test - 무료, 전문, 빠른 클릭 속도 테스트 플랫폼으로 실시간 피드백과 반응 시간 테스트, 타자 테스트 등 다양한 테스트 항목을 제공하며 다국어 지원과 기록 관리 기능을 갖추고 있습니다',
    metaKeywords:
      'CPS Test,무료 테스트,전문 테스트,실시간 테스트,빠른 테스트,종합 테스트,클릭 속도 테스트,반응 시간 테스트,타자 테스트,마우스 스크롤 테스트,스페이스바 클릭 테스트',
    ogDescription:
      'CPS Test 플랫폼, 무료·전문적인 클릭 속도 테스트 훈련 시스템으로 빠르고 실시간적인 테스트 피드백과 다양한 훈련 항목을 제공하며 다국어 지원과 기록 관리 기능을 갖추고 있습니다',
    schemaDescription:
      'CPS Test 플랫폼, 무료·전문적인 클릭 속도 테스트 훈련 시스템으로 빠르고 실시간적인 테스트 피드백과 다양한 훈련 항목을 제공하며 다국어 지원과 기록 관리 기능을 갖추고 있습니다',
    privacyPolicy: '개인정보 정책',
    privacyPolicyTitle: '개인정보 정책 - CPSTestGo.com',
    privacyPolicyDescription:
      'CPSTest 개인정보 정책은 어떻게 데이터를 수집, 사용 및 보호하는지 자세히 설명합니다',
    privacyPolicyKeywords: '개인정보 정책,CPSTest,데이터 보호,사용자 프라이버시',
    privacyIntroductionTitle: '개인정보 및 정책',
    privacyIntroduction:
      'CPSTest에 오신 것을 환영합니다 (웹사이트 주소: <a href="/" style="color: #4CAF50 !important; font-weight: bold !important; text-decoration: none !important;" target="_self">https://www.cpstestgo.com</a>). 본 개인정보 정책 (CPS Test 개인정보 정책)은 귀하가 우리 서비스를 사용할 때 귀하의 개인정보를 어떻게 수집, 사용, 저장 및 보호하는지 설명하기 위한 것입니다. 우리는 귀하의 개인정보 보호를 매우 중요시하며, 관련 법규를 엄격히 준수하여 귀하의 개인정보 안전을 보장합니다. 우리의 개인정보 보호 관행을 이해하기 위해 본 개인정보 정책을 주의 깊게 읽어 주십시오.',
    privacyDataCollectionTitle: '데이터 수집',
    privacyDataCollection:
      '우리의 서비스를 사용할 때, 우리는 다음 유형의 데이터를 수집할 수 있습니다:',
    privacyDataCollection1:
      '기기 정보: 기기 모델, 운영 체제 버전, 브라우저 유형, IP 주소 등의 정보를 수집하여 서비스 사용 현황을 분석하고 서비스 경험을 최적화합니다.',
    privacyDataCollection2:
      '사용 데이터: 우리 서비스의 사용 방식, 방문한 페이지, 클릭한 링크, 체류 시간 등의 정보를 수집하여 서비스를 개선하고 개인화된 경험을 제공합니다.',
    privacyDataCollection3:
      '테스트 데이터: 테스트 기능을 사용할 때 생성된 데이터 (클릭 속도, 반응 시간 등)를 수집하여 테스트 결과와 기록을 제공합니다.',
    privacyDataUseTitle: '데이터 사용',
    privacyDataUse: '수집한 데이터는 다음 목적에 사용됩니다:',
    privacyDataUse1:
      '우리 서비스를 제공 및 유지 관리하여 서비스의 정상적인 운영과 보안을 보장합니다.',
    privacyDataUse2:
      '사용자 피드백과 사용 현황에 따라 서비스를 개선하고 최적화하여 서비스 품질을 지속적으로 향상시킵니다.',
    privacyDataUse3: '관심사에 따라 관련 콘텐츠를 추천하는 등 개인화된 서비스 경험을 제공합니다.',
    privacyDataUse4:
      '테스트 결과와 기록을 생성하여 귀하가 자신의 테스트 데이터를 보고 비교할 수 있도록 합니다.',
    privacyDataUse5: '서비스 사용 동향을 분석하여 테스트 알고리즘과 기능 설계를 최적화합니다.',
    privacyConsentTitle: '동의',
    privacyConsentContent:
      '우리 웹사이트를 사용함으로써, 귀하는 우리의 개인정보 정책과 그 조건에 동의한 것으로 간주됩니다.',
    privacyDataSharingTitle: '정보를 수집하는 이유',
    privacyDataSharing:
      '보다 나은 테스트 서비스 경험을 제공하기 위해, 우리는 서비스 품질을 최적화하고 개인화된 경험을 제공하며 정확한 테스트 결과를 생성하기 위해 필요한 정보를 수집해야 합니다. 귀하의 개인정보를 판매하거나 제3자에게 상업적 목적으로 대여하거나 이전하지 않을 것을 보장합니다.',
    privacyPolicyChangesTitle: '정책 변경',
    privacyPolicyChanges:
      '우리는 때때로 본 개인정보 정책을 업데이트할 수 있습니다.重大한 변경이 있을 경우, 웹사이트 공지 또는 기타 방식으로 귀하에게 알릴 것입니다. 서비스 사용을 계속하면 업데이트된 개인정보 정책에 동의하는 것으로 간주됩니다.',
    privacyDataStorageTitle: '데이터 저장 및 보안',
    privacyDataStorage:
      '우리는 귀하의 데이터를 보호하기 위해 엄격한 보안 조치를 채택합니다, 다음을 포함하여:',
    privacyDataStorage1:
      '데이터 암호화: 업계 표준 암호화 기술을 사용하여 귀하의 데이터 전송과 저장을 보호합니다.',
    privacyDataStorage2:
      '접근 제어: 귀하의 데이터에 대한 접근을 제한하며, 권한이 있는 직원만 접근할 수 있습니다.',
    privacyDataStorage3:
      '보안 감사: 정기적으로 보안 감사를 실시하여 보안 조치가 효과적인지 확인합니다.',
    privacyUserRightsTitle: '사용자 권리',
    privacyUserRights: '관련 법규에 따라, 귀하는 다음 권리를 가지고 있습니다:',
    privacyUserRights1: '접근 권리: 우리가 수집한 귀하의 개인정보에 접근할 권리가 있습니다.',
    privacyUserRights2:
      '정정 권리: 우리가 수집한 귀하의 부정확한 개인정보를 정정할 권리가 있습니다.',
    privacyUserRights3:
      '삭제 권리: 특정 경우, 귀하의 개인정보를 삭제하도록 요청할 권리가 있습니다.',
    privacyUserRights4:
      '데이터 이동성 권리: 구조화되고 기계가 읽을 수 있는 형식으로 귀하의 개인정보를 제공하도록 요청할 권리가 있습니다.',
    privacyUserRights5:
      '반대 권리: 합법적인 이유가 없는 경우, 귀하의 개인정보 처리에 반대할 권리가 있습니다.',
    privacyCookiePolicyTitle: '쿠키 정책',
    privacyCookiePolicy:
      '우리는 귀하의 브라우징 경험과 서비스 품질을 개선하기 위해 쿠키를 사용합니다. 쿠키는 귀하의 기기에 저장된 작은 텍스트 파일로, 귀하의 기기와 기호를 식별하는 데 사용됩니다.',
    privacyCookiePolicy1:
      '필수 쿠키: 이러한 쿠키는 우리 서비스의 정상적인 운영에 필수적이며, 기능에 영향을 미치지 않고 비활성화할 수 없습니다.',
    privacyCookiePolicy2:
      '분석 쿠키: 이러한 쿠키는 우리 서비스 사용 방식을 이해하는 데 도움이 되어 서비스를 개선할 수 있습니다.',
    privacyCookiePolicy3:
      '기능 쿠키: 이러한 쿠키는 개인화된 경험을 제공하고 귀하의 기호를 기억할 수 있게 합니다.',
    privacyCookiePolicy4:
      '쿠키 관리 방법: 브라우저 설정을 통해 쿠키를 관리하거나 삭제할 수 있습니다. 특정 쿠키를 비활성화하면 서비스 경험이 영향을 받을 수 있음을 유의하세요.',
    privacyThirdPartyServicesTitle: '제3자 서비스',
    privacyThirdPartyServices:
      '우리는 서비스를 제공하고 개선하기 위해 제3자 서비스를 사용할 수 있습니다. 이러한 제3자 서비스는 귀하의 정보를 수집할 수 있으므로, 해당 서비스의 개인정보 정책을 읽어 보시는 것을 권장합니다:',
    privacyThirdPartyServices1:
      '분석 서비스: Google Analytics 등의 서비스를 사용하여 웹사이트 트래픽과 사용자 행동을 분석합니다.',
    privacyThirdPartyServices2:
      '광고 서비스: 관련 광고를 표시하기 위해 제3자 광고 서비스를 사용할 수 있습니다.',
    privacyThirdPartyServices3:
      '결제 서비스: 유료 서비스를 제공하는 경우, 안전한 제3자 결제 서비스를 사용합니다.',
    privacyChildrenPrivacyTitle: '어린이 개인정보 보호',
    privacyChildrenPrivacy:
      '우리의 서비스는 13세 미만의 어린이를 대상으로 하지 않습니다. 13세 미만 어린이의 개인정보를 고의로 수집하지 않습니다. 13세 미만 어린이의 개인정보를 수집한 것을 발견하면 즉시 해당 정보를 삭제할 것입니다.',
    privacyDataRetentionTitle: '데이터 보존 및 삭제',
    privacyDataRetention: '우리는 다음 원칙에 따라 귀하의 데이터를 보존합니다:',
    privacyDataRetention1:
      '필요한 기간: 서비스 제공에 필요한 기간 동안 귀하의 데이터를 보존합니다.',
    privacyDataRetention2:
      '법적 요구: 법률이 요구하는 경우, 규정된 기간 동안 귀하의 데이터를 보존합니다.',
    privacyDataRetention3:
      '삭제 정책: 데이터 삭제를 요청하거나 데이터가 더 이상 필요하지 않을 때, 안전하게 삭제하거나 익명화할 것입니다.',
    schemaName: 'CPS Test - 클릭 속도 및 반응 능력 훈련 플랫폼',
    schemaPublisher: 'CPS Test 플랫폼',
    home: '홈',
    popularTests: '인기 테스트',
    quickLinks: '빠른 링크',
    clickTest: '클릭 속도 테스트',
    clickSeriesTest: '연속 클릭 테스트',
    doubleClickTest: '더블 클릭 테스트',
    clicks: '회',
    secClickTest: '초 클릭 테스트',
    '1secClickTest': '1초 클릭 테스트',
    '2secClickTest': '2초 클릭 테스트',
    '5secClickTest': '5초 클릭 테스트',
    '10secClickTest': '10초 클릭 테스트',
    '15secClickTest': '15초 클릭 테스트',
    '30secClickTest': '30초 클릭 테스트',
    '60secClickTest': '60초 클릭 테스트',
    spaceClickTest: '스페이스바 클릭 테스트',
    secSpaceTest: '초 스페이스 속도 테스트',
    '1secSpaceTest': '1초 스페이스 속도 테스트',
    '5secSpaceTest': '5초 스페이스 속도 테스트',
    '10secSpaceTest': '10초 스페이스 속도 테스트',
    '15secSpaceTest': '15초 스페이스 속도 테스트',
    '30secSpaceTest': '30초 스페이스 속도 테스트',
    '60secSpaceTest': '60초 스페이스 속도 테스트',
    kohiClickTest: '코히 클릭 테스트',
    typingTest: '타자 테스트',
    '1minTypingTest': '1분 타자 속도 테스트',
    '3minTypingTest': '3분 타자 속도 테스트',
    '5minTypingTest': '5분 타자 속도 테스트',
    '10minTypingTest': '10분 타자 속도 테스트',
    '15minTypingTest': '15분 타자 속도 테스트',
    reactionTest: '반응 시간 테스트',
    simpleReactionTest: '단순 반응 테스트',
    colorReactionTest: '색상 반응 테스트',
    keyReactionTest: '키 반응 테스트（WASD）',
    targetEliminationGame: '표적 제거 반응 훈련 게임',
    mouseScrollTest: '마우스 스크롤 테스트',
    login: '로그인',
    justNow: '방금',
    minutesAgo: '분 전',
    hoursAgo: '시간 전',
    daysAgo: '일 전',
    removeAll: '전체 삭제',
    startGame: '게임 시작',
    clickHere: '여기를 클릭하세요',
    cps: '클릭 속도',
    timer: '타이머',
    clickPerSecond: '클릭/초',
    score: '점수',
    reactionTime: '반응 시간',
    average: '평균',
    best: '최고',
    round: '라운드',
    time: '시간',
    reset: '리셋',
    continue: '계속',
    finish: '종료',
    tryAgain: '다시 시도',
    ms: '밀리초',
    readyToStart: '테스트를 시작할 준비가 되었습니다',
    simpleReactionTestDesc:
      '아래 버튼을 클릭하여 테스트를 시작하세요. 녹색 사각형이 나타나면 가능한 빨리 클릭하세요!',
    colorReactionTestDesc:
      '아래 버튼을 클릭하여 테스트를 시작하세요. 컬러 텍스트가 나타나면 텍스트 내용을 무시하고, 텍스트 내용과 일치하는 색상 사각형을 가능한 빨리 클릭하세요!',
    startTest: '테스트 시작',
    leftButton: '마우스 왼쪽 버튼',
    middleButton: '마우스 스크롤 버튼',
    rightButton: '마우스 오른쪽 버튼',
    leftMouseButton: '마우스 왼쪽 버튼',
    rightMouseButton: '마우스 오른쪽 버튼',
    selectMouseButton: '마우스 버튼 선택',
    totalClicks: '총 클릭 횟수',
    doubleClicks: '더블 클릭 횟수',
    bestDoubleSpeed: '최고 속도',
    clickHereToTest: '게임 영역을 클릭하여 테스트를 시작하세요',
    gettingReady: '준비 중...',
    faqDoubleClickQ1: '더블 클릭 테스트란 무엇입니까?',
    faqDoubleClickA1:
      '더블 클릭 테스트는 더블 클릭 속도와 정확성을 테스트하는 테스트입니다. 시스템은 총 클릭 횟수, 더블 클릭 횟수 및 최고 더블 클릭 속도를 기록합니다.',
    faqDoubleClickQ2: '더블 클릭 속도를 어떻게 향상시킬 수 있나요?',
    faqDoubleClickA2:
      '더블 클릭 속도를 향상시키려면 연습이 필요합니다. 안정적인 마우스를 사용하고, 적절한 마우스 민감도를 조정하며, 자신에게 맞는 클릭 리듬을 찾는 것을 권장합니다.',
    tripleClickTest: '트리플 클릭 테스트',
    tripleClicks: '트리플 클릭 횟수',
    bestTripleSpeed: '최고 속도',
    faqTripleClickQ1: '트리플 클릭 테스트란 무엇입니까?',
    faqTripleClickA1:
      '트리플 클릭 테스트는 트리플 클릭 속도와 정확성을 테스트하는 테스트입니다. 시스템은 총 클릭 횟수, 트리플 클릭 횟수 및 최고 트리플 클릭 속도를 기록합니다.',
    faqTripleClickQ2: '트리플 클릭 속도를 어떻게 향상시킬 수 있나요?',
    faqTripleClickA2:
      '트리플 클릭 속도를 향상시키려면 연습이 필요합니다. 안정적인 마우스를 사용하고, 적절한 마우스 민감도를 조정하며, 자신에게 맞는 클릭 리듬을 찾는 것을 권장합니다.',
    waiting: '대기 중',
    simpleReactionTestWaiting: '집중해 주세요, 녹색 사각형이 곧 나타납니다!',
    colorReactionTestWaiting: '집중해 주세요, 컬러 텍스트가 곧 나타납니다!',
    nextTestComing: '다음 테스트가 곧 시작됩니다...',
    history: '기록',
    noHistory: '기록이 없습니다',
    reactionTestQ1: '반응 시간 테스트란 무엇입니까?',
    reactionTestDescriptionText:
      '반응 시간 테스트는 시각 반응 속도를 테스트하는 게임입니다. 테스트 중 화면에 무작위로 녹색 사각형이 나타나면 가능한 빨리 클릭해야 합니다. 시스템은 반응 시간을 기록하고, 평균 반응 시간과 최고 반응 시간을 계산합니다. 반응 시간 테스트를 통해 반응 속도와 주의력 수준을 테스트할 수 있습니다.',
    reactionTestUsefulness: '반응 시간 테스트가 유용한 이유는 무엇입니까?',
    reactionTestUsefulnessText:
      '반응 시간 테스트는 반응 속도와 주의력 수준을 이해하는 데 도움이 됩니다. 게임 플레이어, 운동선수 및 빠른 반응이 필요한 전문가에게 좋은 반응 시간은 매우 중요합니다.',
    reactionTimeRange: '정상적인 반응 시간 범위는 무엇입니까?',
    reactionTimeRangeText:
      '인간의 평균 시각 반응 시간은 약 250-300밀리초입니다. 우수한 반응 시간은 일반적으로 150-250밀리초 사이이며, 프로 운동선수나 게임 플레이어는 100-150밀리초에 도달할 수 있습니다.',
    howToImproveReaction: '반응 시간을 어떻게 향상시킬 수 있나요?',
    howToImproveReactionText:
      '반응 시간을 향상시키려면 연습이 필요합니다. 주의력 훈련, 시각 추적 연습 및 반응 속도 게임을 권장합니다. 좋은 수면과 건강한 생활 방식도 반응 속도를 향상시키는 데 도움이 됩니다.',
    reactionTestPrinciple: '반응 시간 테스트의 원리는 무엇입니까?',
    reactionTestPrincipleText:
      '반응 시간 테스트는 인간의 시각 지각과 운동 반응 메커니즘을 기반으로 합니다. 테스트는 시각 자극(타겟 나타남)부터 운동 반응(마우스 클릭)까지의 시간 간격을 측정하여 반응 속도를 평가합니다.',
    // 方向键相关
    up: '위',
    down: '아래',
    left: '왼쪽',
    right: '오른쪽',
    // 关键按键测试相关
    keyReactionTestDesc: '화살표가 켜질 때 W/A/S/D를 누르세요.',
    clickToStart: '클릭하여 시작',
    tooSoon: '너무 빠릅니다...',
    pressWasdToReturn: 'W/A/S/D를 눌러 돌아가거나 다시 시도를 클릭하세요.',
    wrongKey: '잘못된 키!',
    pressTheGreenOne: '녹색 것을 누르세요.',
    clickToContinue: '클릭하여 계속...',
    keyReactionTestResults: '키 반응 테스트 결과',
    yourAverageReactionTime: '⏳ 당신의 반응 시간',
    yourReactionTime: '당신의 반응 시간',
    youCanDoBetter: '더 잘 할 수 있습니다!',
    notTheFastestStart:
      '가장 빠른 시작은 아니지만 걱정하지 마세요—반응 속도는 연습하면 더 빨라집니다. 계속 훈련하면 곧 번개가 될 것입니다! ⚡',
    restartGame: '게임 재시작',
    whatIsKeyReactionTest: '키 반응 테스트란 무엇입니까?',
    whatIsKeyReactionTestDesc:
      '키 반응 테스트는 WASD 키에 대한 반응 속도를 평가하는 테스트입니다. 게임에서 랜덤으로 키를 강조 표시하고, 해당 키를 가능한 빨리 누르세요. 시스템은 반응 시간을 기록합니다.',
    whatIsColorReactionTest: '색상 반응 테스트란 무엇입니까?',
    whatIsColorReactionTestDesc:
      '색상 반응 테스트는 색상 인식과 반응 속도를 평가하는 테스트입니다. 게임에서 랜덤으로 컬러 텍스트를 표시하고, 텍스트 내용을 무시하고, 텍스트 내용과 일치하는 색상 사각형을 가능한 빨리 클릭하세요.',
    howToGetBetterScore: '어떻게 더 좋은 성적을 얻을 수 있나요?',
    howToGetBetterScoreDesc:
      '손가락을 WASD 키에 유지하고, 화면에 집중하며, 마음을 편하게 유지하세요. 과도한 긴장은 피하세요. 여러 번 연습하면 키 반응 속도를 향상시킬 수 있습니다.',
    howResultsCalculated: '테스트 결과는 어떻게 계산되나요?',
    howResultsCalculatedDesc:
      '시스템은 각 라운드의 반응 시간을 기록하고, 마지막으로 5라운드의 평균 반응 시간을 최종 성적으로 계산합니다.',
    whyTooSoon: '왜 가끔 "너무 빠릅니다"가 표시되나요?',
    whyTooSoonDesc:
      '이는 키가 강조 표시되기 전에 키를 눌렀음을 의미합니다. 키가 녹색으로 변할 때까지 기다린 후 해당 키를 눌러주세요.',
    // 通用游戏术语
    spaceBar: '스페이스바',
    pressSpaceToStart: '스페이스바를 눌러 시작',
    clickSpaceToStart: '스페이스바를 클릭하여 시작',
    // 首页相关
    welcomeToCps: 'CPS 테스트 플랫폼에 오신 것을 환영합니다',
    improveSkills: '반응 속도와 클릭 기술을 향상시키세요',
    multipleTestTypes: '다양한 테스트 유형',
    multipleTestTypesDesc:
      '클릭 테스트, 반응 테스트, 타자 테스트 등 다양한 테스트 유형을 제공하여 기술을 종합적으로 향상시킬 수 있습니다',
    realTimeStats: '실시간 통계',
    realTimeStatsDesc:
      '테스트 결과와 통계 데이터를 실시간으로 표시하여 자신의 성능을 이해하는 데 도움을 줍니다',
    historyRecords: '기록 관리',
    historyRecordsDesc: '테스트 기록을 저장하여 진행 상황과 성장을 추적할 수 있습니다',
    gamifiedExperience: '게임화 경험',
    gamifiedExperienceDesc: '재미있는 게임화 설계로 테스트를 더욱 생동적이고 흥미롭게 만듭니다',
    quickStart: '빠른 시작',
    testYourClickSpeed: '클릭 속도를 테스트하세요',
    testYourReactionSpeed: '반응 속도를 테스트하세요',
    testYourTypingSpeed: '타자 속도를 테스트하세요',
    testYourSpaceClickSpeed: '스페이스 클릭 속도를 테스트하세요',
    professionalMinecraftClickTest: '전문적인 Minecraft 클릭 테스트',
    testYourColorReactionSpeed: '색상 인식 반응 속도를 테스트하세요',
    testYourWasdReactionSpeed: 'WASD 키 반응 속도를 테스트하세요',
    trainYourReactionAndAim: '반응과 조준 능력을 훈련하세요',
    testYourMouseScrollSpeed: '마우스 스크롤 속도를 테스트하세요',
    testYourMouseDragSpeed: '마우스 드래그 속도를 테스트하세요',
    keyboardTest: '키보드 테스트',
    keyboardTestDesc: '여기에서 모든 키보드 버튼을 확인할 수 있습니다：',
    faq: '자주 묻는 질문',
    whatIsKeyboardTest: '키보드 테스트는 무슨 용도인가요？',
    keyboardTestPurpose:
      '키보드 테스트는 키보드 버튼이 정상 작동하는지 검사하는 동시에 키 누름 순서와 응답 시간을 기록합니다. 이 테스트를 통해 키보드의 민감도와 버튼 상태를 파악할 수 있으며, 키보드가 청소나 교체가 필요한지 판단하는 데 도움이 됩니다.',
    pressedKeys: '누른 키',
    noKeysPressed: '아무 키도 누르지 않았습니다',
    platformFeatures: '플랫폼 특징',
    accurateTesting: '정확한 테스트',
    accurateTestingDesc:
      '고정밀 타이밍과 통계 알고리즘을 채택하여 테스트 결과의 정확성을 보장합니다',
    responsiveDesign: '반응형 디자인',
    responsiveDesignDesc: '다양한 기기에 적응하여 언제 어디서나 테스트를 진행할 수 있습니다',
    achievementSystem: '업적 시스템',
    achievementSystemDesc: '다양한 난이도의 테스트를 완료하여 다양한 업적을 잠금 해제하세요',
    communityFeatures: '커뮤니티 기능',
    communityFeaturesDesc: '다른 사용자와 성적을 비교하고, 당신의 진행 상황을 공유하세요',
    testGuide: '테스트 가이드',
    selectTestType: '테스트 유형 선택',
    selectTestTypeDesc: '좌측 메뉴에서 원하시는 테스트 유형을 선택하세요',
    startTestDesc: '안내에 따라 테스트를 시작하고, 테스트 과정에 집중하세요',
    viewResults: '결과 보기',
    viewResultsDesc: '테스트 종료 후 성적과 통계 데이터를 확인하세요',
    practiceContinuously: '지속적인 연습',
    practiceContinuouslyDesc: '여러 번의 테스트를 통해 기술을 향상시키고, 진행 상황을 추적하세요',
    // FAQ相关
    faqTitle: '{time}초 클릭 테스트 FAQ',
    faqDesc:
      '{time}초 클릭 테스트는 고정 시간 내 클릭 속도를 평가하는 테스트입니다. 다른 테스트 기간에 따라 순간 폭발력, 단기 안정성 또는 장기 내구력을 평가할 수 있습니다. 테스트 종료 후 시스템은 초당 클릭 횟수(CPS)를 계산합니다.',
    spaceFaqTitle: '{time}초 스페이스 클릭 테스트 FAQ',
    spaceFaqDesc:
      '{time}초 스페이스 클릭 테스트는 고정 시간 내 스페이스바 클릭 속도를 평가하는 테스트입니다. 다른 테스트 기간에 따라 순간 폭발력, 단기 안정성 또는 장기 내구력을 평가할 수 있습니다. 테스트 종료 후 시스템은 초당 클릭 횟수(CPS)를 계산합니다.',
    // 1秒点击测试FAQ
    faqClick1Q1: '1초 마우스 클릭 테스트는 주로 무엇을 측정하나요?',
    faqClick1A1:
      '1초 마우스 클릭 테스트는 순간 폭발력을 측정하며, 손가락이 극단적으로 짧은 시간 내에 도달할 수 있는 최고 클릭 속도를 테스트합니다. 이는 가장 고전적인 CPS Test로, 손속 잠재력을 빠르게 평가할 수 있습니다.',
    faqClick1Q2: '1초 마우스 클릭 테스트에서 몇 CPS가 합격인가요?',
    faqClick1A2:
      '참고 기준：\n초보：6-8 CPS\n보통：8-10 CPS\n숙련：10-12 CPS\n우수：12-15 CPS\n전문：15+ CPS',
    faqClick1Q3: '왜 1초 마우스 클릭 테스트 결과가 크게 변동하나요?',
    faqClick1A3:
      '원인에는 다음이 포함됩니다：시작 리듬이 불안정함, 손가락 긴장으로 인한 끊김, 주의력이 집중되지 않음, 기기 응답 지연',
    faqClick1Q4: '1초 마우스 클릭 테스트 성적을 어떻게 향상시킬 수 있나요?',
    faqClick1A4:
      '권장사항：손가락을 편하게 유지하세요, 과도한 힘을 쓰지 마세요, 자신에게 맞는 클릭 리듬을 찾으세요, 테스트 전 손목 워밍업을 하세요, 고주파수 마우스(1000Hz)를 사용하세요',
    // 1秒空格点击测试FAQ
    spaceFaq1Q1: '1초 스페이스 클릭 테스트는 주로 무엇을 측정하나요?',
    spaceFaq1A1:
      '1초 스페이스 클릭 테스트는 순간 폭발력을 측정하며, 손가락이 극단적으로 짧은 시간 내에 도달할 수 있는 최고 클릭 속도를 테스트합니다. 이는 가장 고전적인 스페이스바 CPS Test로, 스페이스바 손속 잠재력을 빠르게 평가할 수 있습니다.',
    spaceFaq1Q2: '1초 스페이스 클릭 테스트에서 몇 CPS가 합격인가요?',
    spaceFaq1A2:
      '참고 기준：\n초보：5-7 CPS\n보통：7-9 CPS\n숙련：9-11 CPS\n우수：11-14 CPS\n전문：14+ CPS',
    spaceFaq1Q3: '왜 1초 스페이스 클릭 테스트 결과가 크게 변동하나요?',
    spaceFaq1A3:
      '원인에는 다음이 포함됩니다：시작 리듬이 불안정함, 손가락 긴장으로 인한 끊김, 주의력이 집중되지 않음, 키보드 응답 지연',
    spaceFaq1Q4: '1초 스페이스 클릭 테스트 성적을 어떻게 향상시킬 수 있나요?',
    spaceFaq1A4:
      '권장사항：손가락을 편하게 유지하세요, 과도한 힘을 쓰지 마세요, 자신에게 맞는 클릭 리듬을 찾으세요, 테스트 전 손목 워밍업을 하세요, 기계식 키보드나 고응답 키보드를 사용하세요',
    // 2秒空格点击测试FAQ
    spaceFaq2Q1: '2초 스페이스 클릭 테스트와 1초 테스트의 차이점은 무엇인가요?',
    spaceFaq2A1:
      '2초 스페이스 클릭 테스트는 1초 테스트에 단기 안정성 요구사항을 추가한 것입니다. 1초 테스트는 순간 폭발력만 보는 반면, 2초 테스트는 고속 클릭을 유지해야 하므로 실제 수준을 더 잘 반영합니다.',
    spaceFaq2Q2: '2초 스페이스 클릭 테스트의 CPS는 1초보다 낮아야 하나요?',
    spaceFaq2A2:
      '예, 정상적인 경우: 2초 CPS ≈ 1초 CPS × 0.9-0.95. 만약 차이가 너무 크다면(예: 2초 CPS < 1초 CPS × 0.85), 내구력이 부족함을 의미합니다.',
    spaceFaq2Q3: '2초 스페이스 클릭 테스트는 어떤 사람들에게 적합한가요?',
    spaceFaq2A3:
      '적합한 대상: 1초에서 더 긴 시간 테스트로 전환하고 싶은 초보자, 단기 안정성을 평가해야 하는 플레이어, 일상 훈련의 기준 테스트로 사용하는 경우',
    spaceFaq2Q4: '2초 스페이스 클릭 테스트의 연습 방법은 무엇인가요?',
    spaceFaq2A4:
      '권장사항: 매일 5세트의 2초 테스트를 실시하고 평균 성적을 기록하세요. 마지막 1초가 명확히 떨어지는지 주의를 기울이세요. 1초와 5초 테스트를 결합하여 종합적인 훈련을 하세요',
    // 5秒空格点击测试FAQ
    spaceFaq5Q1: '5초 스페이스 클릭 테스트의 핵심 가치는 무엇인가요?',
    spaceFaq5A1:
      '5초 스페이스 클릭 테스트는 폭발력과 내구력을 균형있게 평가할 수 있는 최적의 시간 창입니다. 폭발력을 나타낼 수 있을 뿐만 아니라 단기 내구력도 테스트할 수 있어 종합 능력을 평가하는 중요한 지표입니다.',
    spaceFaq5Q2: '5초 스페이스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    spaceFaq5A2:
      '참고：\n초보：5-7 CPS（25-35회）\n보통：7-9 CPS（35-45회）\n숙련：9-11 CPS（45-55회）\n우수：11+ CPS（55+회）',
    spaceFaq5Q3: '5초 스페이스 클릭 테스트에서 후반부 속도가 떨어지면 어떻게 해야 하나요?',
    spaceFaq5A3:
      '대응 전략: 시작 속도를 조정하세요, 처음부터 전력을 쓰지 마세요. 안정적인 클릭 리듬을 설정하세요. 손가락 내구력 훈련을 강화하세요. 호흡 리듬에 주의를 기울이고, 편안하게 유지하세요.',
    spaceFaq5Q4: '5초 스페이스 클릭 테스트에서 진전을 어떻게 판단하나요?',
    spaceFaq5A4:
      '관찰 지표：CPS 향상：전체 속도가 높아짐, 안정성 개선：후반부 감소율이 낮아짐, 클릭 곡선이 부드러움：변동이 줄어듦',
    // 10秒空格点击测试FAQ
    spaceFaq10Q1: '10초 스페이스 클릭 테스트는 주로 무엇을 테스트하나요?',
    spaceFaq10A1:
      '10초 스페이스 클릭 테스트는 지속력과 피로 저항력을 중점으로 평가합니다. 긴 시간 동안 안정적인  클릭을 유지하는 능력을 나타내며, 내구력 훈련의 중요한 지표입니다.',
    spaceFaq10Q2: '10초 스페이스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    spaceFaq10A2:
      '참고：\n초보：4-6 CPS（40-60회）\n보통：6-8 CPS（60-80회）\n숙련：8-10 CPS（80-100회）\n우수：10+ CPS（100+회）',
    spaceFaq10Q3: '10초 스페이스 클릭 테스트에서 손가락이 피곤해지면 어떻게 해야 하나요?',
    spaceFaq10A3:
      '대응 방법: 테스트 전 충분한 워밍업을 하세요. 손목을 편하게 유지하세요, 뻣뻣하게 하지 마세요. 자신에게 맞는 리듬을 찾으세요. 만약 통증이 생기면 즉시 멈춰세요.',
    spaceFaq10Q4: '10초 스페이스 클릭 테스트의 내구력을 어떻게 향상시킬 수 있나요?',
    spaceFaq10A4:
      '훈련 권장사항: 5초부터 시작하여, 점차 7초, 10초로 연장하세요. 매주 1-2초씩 훈련 시간을 증가하세요. 후반부 5초의 CPS 감소율에 주의를 기울이세요(목표＜15%). 손가락 힘 훈련과 결합하세요.',
    // 15秒空格点击测试FAQ
    spaceFaq15Q1: '15초 스페이스 클릭 테스트의 특징은 무엇인가요?',
    spaceFaq15A1:
      '15초 스페이스 클릭 테스트는 중장거리 내구력 테스트로, 10초와 30초 사이에 위치합니다. 지속적인 클릭 능력을 더 정확하게 평가할 수 있으면서, 30초 테스트의 과도한 피로도를 피할 수 있습니다.',
    spaceFaq15Q2: '15초 스페이스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    spaceFaq15A2:
      '참고: \n초보：4-5 CPS（60-75회）\n보통：5-7 CPS（75-105회）\n숙련：7-9 CPS（105-135회）\n우수：9+ CPS（135+회）',
    spaceFaq15Q3: '15초 스페이스 클릭 테스트에서 체력을 어떻게 분배해야 하나요?',
    spaceFaq15A3:
      '전략 제안：첫 5초：90% 속도를 유지하고, 리듬을 설정하세요. 중간 5초：안정성을 유지하고, 호흡에 주의를 기울이세요. 마지막 5초：적절하게 가속하거나 안정성을 유지하세요.',
    spaceFaq15Q4: '15초 스페이스 클릭 테스트는 어떤 훈련 목표에 적합한가요?',
    spaceFaq15A4:
      '적합한 대상：10초에서 30초로 넘어가고 싶은 고급 훈련, 중간 시간 내구력을 평가할 필요가 있는 경우, 일상 훈련의 정규 테스트 항목으로 사용할 경우',
    // 30秒空格点击测试FAQ
    spaceFaq30Q1: '30초 스페이스 클릭 테스트의 핵심 가치는 무엇인가요?',
    spaceFaq30A1:
      '30초 스페이스 클릭 테스트는 표준 내구력 테스트로, 손 근육의 지속력과 피로 저항력을 종합적으로 평가할 수 있습니다. 이는 전문 훈련과 e스포츠 선수들이 자주 사용하는 테스트 시간입니다.',
    spaceFaq30Q2: '30초 스페이스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    spaceFaq30A2:
      '참고: \n초보：3-5 CPS（90-150회）\n보통：5-7 CPS（150-210회）\n숙련：7-9 CPS（210-270회）\n우수：9+ CPS（270+회）',
    spaceFaq30Q3: '30초 스페이스 클릭 테스트에서 피로를 어떻게 처리해야 하나요?',
    spaceFaq30A3:
      '대응 전략：심리 준비：마지막 10초 속도가 떨어질 것을 받아들이세요. 리듬 제어：첫 10초 너무 빠르지 않게 유지하고, 80% 속도를 유지하세요. 호흡 조화：심호흡을 하고, 편안하게 유지하세요. 손가락 휴식：5초마다 손가락을 약간 편하게 하세요.',
    spaceFaq30Q4: '30초 스페이스 클릭 테스트의 일반적인 문제는 무엇인가요?',
    spaceFaq30A4:
      '일반적인 문제：처음은 빠르지만 나중은 느려짐, 감소율이 너무 큼（＞25%）, 손가락이 뻣뻣해져 속도에 영향을 줌, 주의력이 산만해져 리듬이 혼란됨, 기기가 불편함, 키보드가 너무 무거우거나 키 스트로크가 적절하지 않음',
    // 60秒空格点击测试FAQ
    spaceFaq60Q1: '60초 스페이스 클릭 테스트의 의미는 무엇인가요?',
    spaceFaq60A1:
      '60초 스페이스 클릭 테스트는 극한 내구력 테스트로, 손 근육의 극한 지속력을 테스트합니다. 피로 저항력과 의지력을 종합적으로 평가할 수 있어, 전문 선수들의 최종 테스트입니다.',
    spaceFaq60Q2: '60초 스페이스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    spaceFaq60A2:
      '참고: \n초보：3-4 CPS（180-240회）\n보통：4-6 CPS（240-360회）\n숙련：6-8 CPS（360-480회）\n우수：8+ CPS（480+회）',
    spaceFaq60Q3: '60초 스페이스 클릭 테스트에서 체력을 어떻게 분배해야 하나요?',
    spaceFaq60A3:
      '체력 분배 전략：0-15초：안정적인 출발, 85% 속도 유지15-30초：리듬 찾기, 안정성 유지30-45초：가장 어려운 단계, 의지력 유지45-60초：전력으로 질주하거나 안정성 유지',
    spaceFaq60Q4: '60초 스페이스 클릭 테스트의 주의사항은 무엇인가요?',
    spaceFaq60A4:
      '중요한 주의사항：충분한 워밍업：최소 5분간 손가락 스트레칭을 하세요. 기기 확인：키보드 상태가 양호한지 확인하세요. 환경 준비：조용하고 편안한 환경을 선택하세요. 건강 우선：통증이 발생하면 즉시 멈추고, 무리하지 마세요. 적절한 훈련：60초 테스트는 강도가 높으므로, 주당 2회 이하로 제한하세요',
    // Kohi点击测试FAQ
    kohiFaqDesc:
      'Kohi 클릭 테스트는 Minecraft 서버 Kohi에서 유래한 특별한 클릭 속도 테스트입니다. 테스트 시간은 10초로 고정되어 있으며, 플레이어는 가능한 한 빠르게 화면을 클릭해야 합니다. 테스트 종료 후 최종 CPS 값이 표시됩니다. Kohi 테스트는 Minecraft 플레이어를 위해 특별히 설계되었으며, 지속적인 클릭의 안정성에 더 중점을 둡니다.',
    kohiFaqQ1: 'Kohi 클릭 테스트란 무엇인가요?',
    kohiFaqA1:
      'Kohi 클릭 테스트는 Minecraft 서버 Kohi에서 유래한 특별한 클릭 속도 테스트입니다. 테스트 시간은 10초로 고정되어 있으며, 플레이어는 가능한 한 빠르게 화면을 클릭해야 합니다. 테스트 종료 후 최종 CPS 값이 표시됩니다. Kohi 테스트는 Minecraft 플레이어를 위해 특별히 설계되었으며, 지속적인 클릭의 안정성에 더 중점을 둡니다.',
    kohiFaqQ2: 'Kohi 클릭 테스트와 일반 CPS Test의 차이점은 무엇인가요?',
    kohiFaqA2:
      'Kohi 클릭 테스트는 Minecraft 플레이어를 위해 특별히 설계되었으며, 테스트 시간은 10초로 고정되어 있습니다. 지속적인 클릭의 안정성에 더 중점을 둡니다. Minecraft 커뮤니티에서 널리 사용되어 플레이어의 PvP 능력을 측정하는 데 사용됩니다.',
    kohiFaqQ3: 'Kohi 테스트의 용도는 무엇인가요?',
    kohiFaqA3:
      'Kohi 테스트는 Minecraft 플레이어가 자신의 클릭 속도와 안정성을 파악하는 데 도움이 됩니다. 이는 PvP 전투에서 매우 중요합니다. 높은 Kohi CPS는 특히 근접 전투에서 플레이어에게 이점을 제공할 수 있습니다.',
    kohiFaqQ4: 'Kohi CPS를 어떻게 높일 수 있나요?',
    kohiFaqA4:
      'Kohi CPS를 높이려면 나비 클릭, 진동 클릭 또는 drag clicking과 같은 특정 클릭 기술을 연습해야 합니다. 또한 적합한 마우스와 마우스 패드를 사용하면 클릭 속도와 안정성을 높일 수 있습니다.',
    // 2秒点击测试FAQ
    faqClick2Q1: '2초 마우스 클릭 테스트와 1초 테스트의 차이점은 무엇인가요?',
    faqClick2A1:
      '2초 마우스 클릭 테스트는 1초 테스트에 단기 안정성 요구사항을 추가한 것입니다. 1초 테스트는 폭발력만 보는 반면, 2초 테스트는 고속 클릭을 유지해야 하므로 실제 수준을 더 잘 반영합니다.',
    faqClick2Q2: '2초 마우스 클릭 테스트의 CPS는 1초보다 낮아야 하나요?',
    faqClick2A2:
      '예, 정상적인 경우：2초 CPS ≈ 1초 CPS × 0.9-0.95. 만약 차이가 너무 크다면（예：2초 CPS < 1초 CPS × 0.85）, 내구력이 부족함을 의미합니다.',
    faqClick2Q3: '2초 마우스 클릭 테스트는 어떤 사람들에게 적합한가요?',
    faqClick2A3:
      '적합한 대상：1초에서 더 긴 시간 테스트로 전환하고 싶은 초보자, 단기 안정성을 평가해야 하는 플레이어, 일상 훈련의 기준 테스트로 사용하는 경우',
    faqClick2Q4: '2초 마우스 클릭 테스트의 연습 방법은 무엇인가요?',
    faqClick2A4:
      '권장사항：매일 5세트의 2초 테스트를 실시하고 평균 성적을 기록하세요. 마지막 1초가 명확히 떨어지는지 주의를 기울이세요. 1초와 5초 테스트를 결합하여 종합적인 훈련을 하세요',
    // 5秒点击测试FAQ
    faqClick5Q1: '5초 마우스 클릭 테스트의 핵심 가치는 무엇인가요?',
    faqClick5A1:
      '5초 마우스 클릭 테스트는 폭발력과 내구력을 균형있게 평가할 수 있는 최적의 시간 창입니다. 폭발력을 나타낼 수 있을 뿐만 아니라 단기 내구력도 테스트할 수 있어 종합 능력을 평가하는 중요한 지표입니다.',
    faqClick5Q2: '5초 마우스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    faqClick5A2:
      '참고：\n초보：5-7 CPS（25-35회）\n보통：7-9 CPS（35-45회）\n숙련：9-11 CPS（45-55회）\n우수：11+ CPS（55+회）',
    faqClick5Q3: '5초 마우스 클릭 테스트에서 후반부 속도가 떨어지면 어떻게 해야 하나요?',
    faqClick5A3:
      '대응 전략：시작 속도를 조정하세요, 처음부터 전력을 쓰지 마세요. 안정적인 클릭 리듬을 설정하세요. 손가락 내구력 훈련을 강화하세요. 호흡 리듬에 주의를 기울이고, 편안하게 유지하세요.',
    faqClick5Q4: '5초 마우스 클릭 테스트에서 진전을 어떻게 판단하나요?',
    faqClick5A4:
      '관찰 지표：CPS 향상：전체 속도가 높아짐, 안정성 개선：후반부 감소율이 낮아짐, 클릭 곡선이 부드러움：변동이 줄어듦',
    // 10秒点击测试FAQ
    faqClick10Q1: '10초 마우스 클릭 테스트는 주로 무엇을 테스트하나요?',
    faqClick10A1:
      '10초 마우스 클릭 테스트는 지속력과 피로 저항력을 중점으로 평가합니다. 긴 시간 동안 안정적인 클릭을 유지하는 능력을 나타내며, 내구력 훈련의 중요한 지표입니다.',
    faqClick10Q2: '10초 마우스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    faqClick10A2:
      '참고：\n초보：4-6 CPS（40-60회）\n보통：6-8 CPS（60-80회）\n숙련：8-10 CPS（80-100회）\n우수：10+ CPS（100+회）',
    faqClick10Q3: '10초 마우스 클릭 테스트에서 손가락이 피곤해지면 어떻게 해야 하나요?',
    faqClick10A3:
      '대응 방법：테스트 전 충분한 워밍업을 하세요. 손목을 편하게 유지하세요, 뻣뻣하게 하지 마세요. 자신에게 맞는 리듬을 찾으세요. 만약 통증이 생기면 즉시 멈춰세요.',
    faqClick10Q4: '10초 마우스 클릭 테스트의 내구력을 어떻게 향상시킬 수 있나요?',
    faqClick10A4:
      '훈련 권장사항：5초부터 시작하여, 점차 7초, 10초로 연장하세요. 매주 1-2초씩 훈련 시간을 증가하세요. 후반부 5초의 CPS 감소율에 주의를 기울이세요（목표＜15%）. 손가락 힘 훈련과 결합하세요.',
    // 15秒点击测试FAQ
    faqClick15Q1: '15초 마우스 클릭 테스트의 특징은 무엇인가요?',
    faqClick15A1:
      '15초 마우스 클릭 테스트는 중장거리 내구력 테스트로, 10초와 30초 사이에 위치합니다. 지속적인 클릭 능력을 더 정확하게 평가할 수 있으면서, 30초 테스트의 과도한 피로도를 피할 수 있습니다.',
    faqClick15Q2: '15초 마우스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    faqClick15A2:
      '참고：\n초보：4-5 CPS（60-75회）\n보통：5-7 CPS（75-105회）\n숙련：7-9 CPS（105-135회）\n우수：9+ CPS（135+회）',
    faqClick15Q3: '15초 마우스 클릭 테스트에서 체력을 어떻게 분배해야 하나요?',
    faqClick15A3:
      '전략 제안：첫 5초：90% 속도를 유지하고, 리듬을 설정하세요. 중간 5초：안정성을 유지하고, 호흡에 주의를 기울이세요. 마지막 5초：적절하게 가속하거나 안정성을 유지하세요.',
    faqClick15Q4: '15초 마우스 클릭 테스트는 어떤 훈련 목표에 적합한가요?',
    faqClick15A4:
      '적합한 대상：10초에서 30초로 넘어가고 싶은 고급 훈련, 중간 시간 내구력을 평가할 필요가 있는 경우, 일상 훈련의 정규 테스트 항목으로 사용할 경우',
    // 30秒点击测试FAQ
    faqClick30Q1: '30초 마우스 클릭 테스트의 핵심 가치는 무엇인가요?',
    faqClick30A1:
      '30초 마우스 클릭 테스트는 표준 내구력 테스트로, 손 근육의 지속력과 피로 저항력을 종합적으로 평가할 수 있습니다. 이는 전문 훈련과 e스포츠 선수들이 자주 사용하는 테스트 시간입니다.',
    faqClick30Q2: '30초 마우스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    faqClick30A2:
      '참고：\n초보：3-5 CPS（90-150회）\n보통：5-7 CPS（150-210회）\n숙련：7-9 CPS（210-270회）\n우수：9+ CPS（270+회）',
    faqClick30Q3: '30초 마우스 클릭 테스트에서 피로를 어떻게 처리해야 하나요?',
    faqClick30A3:
      '대응 전략：심리 준비：마지막 10초 속도가 떨어질 것을 받아들이세요. 리듬 제어：첫 10초 너무 빠르지 않게 유지하고, 80% 속도를 유지하세요. 호흡 조화：심호흡을 하고, 편안하게 유지하세요. 손가락 휴식：5초마다 손가락을 약간 편하게 하세요.',
    faqClick30Q4: '30초 마우스 클릭 테스트의 일반적인 문제는 무엇인가요?',
    faqClick30A4:
      '일반적인 문제：처음은 빠르지만 나중은 느려짐, 감소율이 너무 큼（＞25%）, 손가락이 뻣뻣해져 속도에 영향을 줌, 주의력이 산만해져 리듬이 혼란됨, 기기가 불편함, 마우스가 너무 무거우거나 패드가 매끄럽지 않음',
    // 60秒点击测试FAQ
    faqClick60Q1: '60초 마우스 클릭 테스트의 의미는 무엇인가요?',
    faqClick60A1:
      '60초 마우스 클릭 테스트는 극한 내구력 테스트로, 손 근육의 극한 지속력을 시험합니다. 피로 저항력과 의지력을 종합적으로 평가할 수 있으며, 전문 선수의 궁극적인 테스트입니다.',
    faqClick60Q2: '60초 마우스 클릭 테스트의 CPS 참고 기준은 무엇인가요?',
    faqClick60A2:
      '참고：초보：3-4 CPS（180-240회）보통：4-6 CPS（240-360회）숙련：6-8 CPS（360-480회）우수：8+ CPS（480+회）',
    faqClick60Q3: '60초 마우스 클릭 테스트에서 체력을 어떻게 분배해야 하나요?',
    faqClick60A3:
      '체력 분배 전략：0-15초：안정적인 출발, 85% 속도 유지 15-30초：리듬 찾기, 안정성 유지 30-45초：가장 어려운 단계, 의지력 유지 45-60초：최대한 질주하거나 안정성 유지',
    faqClick60Q4: '60초 마우스 클릭 테스트의 주의 사항은 무엇인가요?',
    faqClick60A4:
      '중요한 알림：충분한 워밍업：최소 5분 손 스트레칭 장비 검사：마우스와 패드 상태가 양호한지 확인 환경 준비：조용하고 편안한 환경 선택 건강 우선：통증이 발생하면 즉시 중단, 억지로 하지 마세요 적절한 훈련：60초 테스트는 강도가 높으므로 주당 2회를 넘기지 마세요',
    // 打字测试相关
    minTypingTest: '분당 타자 속도 테스트',
    accuracy: '정확도',
    characters: '문자 수',
    textCompleted: '텍스트 완료',
    clickToStartThenTypeHere: '클릭하여 시작한 후 여기에 입력하세요',
    testFinished: '테스트 종료',
    finalScore: '최종 점수',
    totalCharacters: '총 문자 수',
    correctCharacters: '정확한 문자 수',
    wrongCharacters: '잘못된 문자 수',
    // 打字测试FAQ
    whatIsTypingTest: '타이핑 테스트란 무엇인가요?',
    whatIsTypingTestDesc:
      '타이핑 테스트는 사용자의 타이핑 속도와 정확도를 평가하는 테스트입니다. 지정된 시간 내에 표시된 텍스트를 입력해야 하며, 시스템은 분당 단어 수(WPM)와 정확도를 계산합니다. 타이핑 테스트를 통해 키보드에서의 타이핑 속도와 정확성을 테스트하여 사용자의 타이핑 능력을 판단할 수 있습니다.',
    whatIsTypingTestUse: '타이핑 테스트는 어떤 용도가 있나요?',
    whatIsTypingTestUseDesc:
      '타이핑 테스트는 사용자의 타이핑 속도와 정확도를 파악하고, 작업 효율을 높이며, 구직이나 게임 경쟁에 대비하는 데 도움이 됩니다. 사무직 종업원, 학생 및 게임 플레이어에게 좋은 타이핑 기술은 매우 중요합니다.',
    howToImproveTypingSpeed: '타이핑 속도를 어떻게 향상시킬 수 있나요?',
    howToImproveTypingSpeedDesc:
      '타이핑 속도를 향상시키려면 연습이 필요합니다. 올바른 타이핑 자세를 사용하고, 블라인드 타이핑 기술을 사용하며, 정기적으로 타이핑 연습을 하는 것을 권장합니다. 타이핑 테스트 도구를 사용하면 진행 상황을 추적하고 개선이 필요한 부분을 발견할 수 있습니다.',
    whatIsWPM: 'WPM이란 무엇인가요?',
    whatIsWPMDesc:
      'WPM(Words Per Minute)은 분당 단어 수를 의미하며, 타이핑 속도를 측정하는 표준 지표입니다. 일반적으로 일반 사용자의 타이핑 속도는 30-60 WPM이고, 숙련된 사용자는 60-100 WPM, 전문 타이퍼는 100 WPM 이상에 도달할 수 있습니다.',
    whatIsGoodAccuracy: '좋은 타이핑 정확도는 무엇인가요?',
    whatIsGoodAccuracyDesc:
      '좋은 타이핑 정확도는 95% 이상이어야 합니다. 정확도가 90% 미만이라면 먼저 정확성을 중시한 후 속도를 향상시키는 것이 좋습니다.',
    bestScore: '최고 점수',
    targetEliminationGameDesc:
      '화면의 컬러 타겟을 클릭하여 제거하고, 지정된 시간 내에 최고 점수를 얻어보세요!',
    gameDuration: '게임 기간',
    sec: '초',
    whatIsTargetEliminationGame: '타겟 제거 반응 훈련 게임이란 무엇인가요?',
    whatIsTargetEliminationGameDesc:
      '타겟 제거 반응 훈련 게임은 사용자의 반응 속도와 손-눈 협응 능력을 테스트하는 게임입니다. 플레이어는 지정된 시간 내에 화면에 나타나는 컬러 타겟을 클릭하여 제거하고 점수를 얻어야 합니다. 게임은 여러 개의 타겟을 무작위로 생성하고, 타겟이 화면에서 움직이면서 게임 난이도를 높입니다.',
    gameRules: '게임 규칙',
    gameRulesDesc:
      '1. 화면의 컬러 타겟을 클릭하여 제거하세요. \n2. 타겟 하나를 제거할 때마다 10점을 얻습니다. \n3. 게임 시간은 30초입니다. \n4. 타겟은 화면에서 무작위로 이동합니다. \n5. 게임 종료 후 최종 점수와 최고 점수가 표시됩니다.',
    whatIsTargetEliminationGameUsefulFor: '타겟 제거 반응 훈련 게임의 용도는 무엇인가요?',
    whatIsTargetEliminationGameUsefulForDesc:
      '타겟 제거 반응 훈련 게임은 플레이어의 반응 속도, 손-눈 협응 능력 및 주의력을 향상시키는 데 도움이 됩니다. 이러한 기술은 게임 플레이어, 운동선수 및 빠른 반응이 필요한 직업 종사자에게 매우 중요합니다. 정기적인 반응 훈련을 통해 뇌의 민첩성을 유지하고 다양한 상황에서의 반응 속도를 향상시킬 수 있습니다.',
    howToImproveTargetEliminationScore:
      '타겟 제거 반응 훈련 게임의 점수를 어떻게 향상시킬 수 있나요?',
    howToImproveTargetEliminationScoreDesc:
      '1. 주의력을 집중하고, 항상 화면의 타겟에 주의를 기울이세요. \n2. 손-눈 협응을 연습하고, 클릭 정확도를 높이세요. \n3. 자신에게 적합한 클릭 리듬을 찾으세요. \n4. 정기적으로 훈련을 하고, 점차적으로 반응 속도를 높이세요. \n5. 긴장이 반응 속도에 영향을 미치지 않도록 편안하게 유지하세요.',
    targetEliminationGameDesignPrinciple: '타겟 제거 반응 훈련 게임의 설계 원리는 무엇인가요?',
    targetEliminationGameDesignPrincipleDesc:
      '타겟 제거 반응 훈련 게임은 시각 지각과 운동 반응 메커니즘을 기반으로 설계되었습니다. 게임은 이동하는 타겟을 무작위로 생성하여 플레이어의 시각 시스템을 자극하고, 플레이어는 손 동작으로 타겟을 클릭해야 합니다. 이 과정은 시각 정보 처리, 의사 결정 및 운동 실행의 세 단계를 포함합니다. 게임 난이도는 타겟 수와 이동 속도를 통해 조절되어 다양한 수준의 플레이어가 훈련할 수 있습니다.',
    newRecord: '새 기록',
    gameOver: '게임 오버',
    pixelsPerSecond: '픽셀/초',
    scrollAsFastAsPossible: '마우스 휠을 가능한 한 빠르게 스크롤하세요!',
    yourBestScore: '당신의 최고 점수：',
    settings: '설정',
    blockSize: '블록 크기',
    small: '작음',
    medium: '중간',
    large: '큼',
    gameMode: '게임 모드',
    static: '정지',
    dynamic: '이동',
    movementSpeed: '이동 속도',
    slow: '느림',
    fast: '빠름',
    whatIsMouseScrollTest: '마우스 스크롤 테스트란 무엇인가요?',
    whatIsMouseScrollTestDesc:
      '마우스 스크롤 테스트는 스크롤 영역 내에서 플레이어가 초당 최고로 스크롤할 수 있는 픽셀을 테스트하는 것입니다. 플레이어는 테스트 영역 내에서 마우스 휠을 빠르게 스크롤해야 하고, 시스템은 실시간으로 스크롤 속도를 계산하고 최고 속도를 기록합니다.',
    howToImproveScrollSpeed: '마우스 스크롤 속도를 어떻게 향상시킬 수 있나요?',
    howToImproveScrollSpeedDesc:
      '1. 고품질 마우스를 사용하고, 적합한 휠 민감도를 설정하세요. 2. 손목과 손가락의 협응을 연습하세요. 3. 자신에게 적합한 스크롤 리듬을 찾으세요. 4. 과도한 긴장을 피하고 편안하게 유지하세요. 5. 정기적으로 스크롤 훈련을 하세요.',
    whatDoResultsMean: '테스트 결과는 무슨 의미인가요?',
    whatDoResultsMeanDesc:
      '테스트 결과는 1초 동안 스크롤할 수 있는 최대 픽셀 수를 보여줍니다. 일반적으로 일반 플레이어의 스크롤 속도는 500-1500 픽셀/초이고, 숙련된 플레이어는 1500-3000 픽셀/초, 전문 플레이어는 3000 픽셀/초를 초과할 수 있습니다.',
    isThereTimeLimit: '시간 제한이 있나요?',
    isThereTimeLimitDesc:
      '마우스 스크롤 테스트에는 시간 제한이 없으며, 무기한으로 테스트를 진행할 수 있습니다. 시스템은 페이지를 새로 고치거나 브라우저를 닫을 때까지 최고 스크롤 속도를 계속 기록합니다.',
    // 首页FAQ相关
    homeFaqQ1: 'CPS Test란 무엇인가요?',
    homeFaqA1:
      'CPS Test(클릭 속도 테스트)는 특정 시간 내에 마우스를 얼마나 많이 클릭할 수 있는지를 측정하는 테스트로, 초당 클릭 수(Clicks Per Second)를 계산하여 클릭 속도를 평가합니다. 이는 자신의 손속 수준을 파악하고 장기 훈련을 통해 진행 상황을 추적하는 데 도움이 될 뿐만 아니라, 게임 플레이어, e스포츠 선수 및 빠른 조작이 필요한 직업 종사자에게 중요한 참고 가치가 있습니다.',
    homeFaqQ2: '과학적으로 클릭 속도를 향상시키는 방법은 무엇인가요?',
    homeFaqA2:
      '클릭 속도를 향상시키려면 체계적인 연습과 올바른 방법이 필요합니다. \n1. 기술 선택: 개인 습관에 따라 적합한 클릭 방식(버터플라이 클릭, 지터 클릭, 드래그 클릭 등)을 선택하세요. \n2. 정기 훈련: 매일 15-30분의 타겟 훈련을 통해 근육 기억을 유지하세요. \n3. 손 워밍업: 테스트 전에 간단한 손 스트레칭과 이완 운동을 하세요. \n4. 장비 최적화: 고반응률 마우스(1000Hz)와 적합한 마우스 패드를 사용하세요. \n5. 리듬 제어: 안정적인 클릭 리듬을 만들어 과도한 긴장으로 인한 속도 저하를 피하세요. \n6. 교차 훈련: 다양한 시간 길이의 테스트(1초, 5초, 30초)를 결합하여 폭발력과 내구력을 전반적으로 향상시키세요.',
    homeFaqQ3: 'CPS 테스트 결과의 정확성은 어떻게 보장되나요?',
    homeFaqA3:
      '우리의 CPS 테스트는 신뢰할 수 있는 타이밍과 계산 방법을 사용하여 결과의 정확성과 신뢰성을 보장합니다. \n1. 고정밀 타이밍: 전문적인 시간 측정 기술을 사용하여 정확도가 0.1밀리초에 도달하며, 모든 클릭이 정확하게 기록됩니다. \n2. 스마트 부정행위 방지: 이상 클릭 패턴을 감지하는 알고리즘을 내장하여 테스트 결과의 진실성과 신뢰성을 보장합니다. \n3. 장치 적응: 다양한 장치와 브라우저의 지연 차이를 자동으로 조정하여 공정성을 보장합니다. \n4. 다중 테스트 권장: 3-5회 테스트를 진행하고 평균값을 참고로 삼는 것을 권장합니다. 이렇게 하면 결과가 실제 실력을 더 잘 반영합니다. \n5. 결과 영향 요인: 장치 성능, 네트워크 상태, 테스트 환경 및 개인 상태가 결과에 미세한 영향을 미칩니다. 안정적인 환경에서 테스트를 진행하는 것을 권장합니다.',
    homeFaqQ4: '모바일 기기에서의 CPS 테스트는 데스크톱 기기와 어떻게 다른가요?',
    homeFaqA4:
      '모바일 기기에서의 CPS 테스트는 다음과 같은 특징이 있습니다. \n1. 조작 방식: 마우스 물리적 버튼이 아닌 터치 스크린 클릭을 사용합니다. \n2. 속도 차이: 터치 지연과 조작 방식의 차이로 인해 모바일 CPS는 일반적으로 데스크톱보다 20-30% 낮습니다. \n3. 장치 영향: 다른 휴대폰의 화면 새로고침율과 터치 응답 속도가 테스트 결과에 영향을 미칩니다. \n4. 테스트 경험: 다양한 크기의 기기에서 좋은 테스트 경험을 얻을 수 있도록 모바일 인터페이스를 최적화했습니다. \n5. 결과 참고: 모바일 테스트 결과는 데스크톱과 직접 비교하기보다는 가로 비교에 적합합니다.',
    homeFaqQ5: '테스트 데이터는 어떻게 저장되고 보호되나요?',
    homeFaqA5:
      '우리는 로컬 저장 메커니즘을 사용하여 테스트 데이터를 보호합니다. \n1. 저장 위치: 모든 테스트 결과는 브라우저의 로컬 스토리지에 저장되며 서버에 업로드되지 않습니다. \n2. 데이터 보안: 데이터는 사용자의 기기에서만 저장되며 타인이 접근할 수 없습니다. \n3. 데이터 관리: 브라우저 캐시를 언제든지 지워 테스트 기록을 삭제할 수 있습니다. \n4. 기기 간 동기화: 현재 기기 간 데이터 동기화를 지원하지 않으므로 고정된 기기에서 테스트를 진행하는 것을 권장합니다. \n5. 프라이버시 보호: 사용자의 개인 테스트 데이터를 수집하거나 분석하지 않으며, 사용자의 프라이버시를 완전히 존중합니다.',
    homeFaqQ6: '버터플라이 클릭(Butterfly Clicking)의 원리와 기술은 무엇인가요?',
    homeFaqA6:
      '버터플라이 클릭은 검지와 중지를 빠르게 번갈아 사용하여 마우스 왼쪽 버튼을 클릭하는 고급 클릭 기술입니다. \n1. 작동 원리: 마우스 마이크로 스위치의 물리적 특성을 활용하여 손가락의 빠른 번갈아 동작으로 연속 클릭을 생성합니다. \n2. 속도 범위: 숙련된 후 20-30 CPS 이상에 도달할 수 있습니다. \n3. 연습 방법: 손목을 안정적으로 유지하고, 손가락을 편안하게 유지하며, 반복적인 연습을 통해 최적의 번갈아 리듬을 찾으세요. \n4. 적용 시나리오: 짧은 시간 동안 높은 CPS가 필요한 게임 시나리오에 적합합니다. \n5. 장치 요구 사항: 클릭 감각이 선명하고 리턴이 빠른 마우스가 필요하며, 버튼이 무거운 사무용 마우스에는 적합하지 않습니다.',
    homeFaqQ7: '지터 클릭(Jitter Clicking)의 핵심 기술과 주의 사항은 무엇인가요?',
    homeFaqA7:
      '지터 클릭은 팔과 손목을 빠르게 떨려 연속 클릭을 생성합니다. \n1. 핵심 원리: 근육의 미세한 떨림을 활용하여 손가락이 마우스 버튼을 빠르게 클릭하도록 합니다. \n2. 속도 범위: 일반적으로 10-15 CPS를 구현할 수 있으며, 최고 20 CPS에 도달할 수 있습니다. \n3. 연습 요점: 팔을 편안하게 유지하고, 손목의 자연스러운 떨림을 활용하며, 과도한 힘을 주어 근육 피로를 유발하지 마세요. \n4. 주의 사항: 장기간 고강도 연습은 손목 불편을 유발할 수 있으므로 연습 시간을 제어하는 것이 좋습니다. \n5. 적용 대상: 마우스 버튼이 단단하거나 버터플라이 클릭에 적합하지 않은 사용자에게 적합합니다.',
    homeFaqQ8: '드래그 클릭(Drag Clicking)의 구현 조건과 기술은 무엇인가요?',
    homeFaqA8:
      '드래그 클릭은 마우스 버튼 위에서 손가락을 드래그하여 연속 클릭을 생성합니다. \n1. 구현 원리: 마우스 마이크로 스위치의 물리적 특성을 활용하여 마찰로 인한 진동으로 여러 번 클릭을 트리거합니다. \n2. 속도 범위: 마우스와 기술에 따라 10-25 CPS를 구현할 수 있습니다. \n3. 장치 요구 사항: 특수한 마우스 설계(예: 모래시계 버튼 표면)와 적합한 마우스 패드가 필요합니다. \n4. 연습 기술: 적합한 손가락 각도와 압력을 찾고, 안정적인 드래그 속도를 유지하세요. \n5. 일반적인 문제: 다른 마우스의 드래그 효과 차이가 크므로 적합한 장치를 찾기 위해 시도해야 합니다. \n6. 주의 사항: 빈번한 드래그는 마우스 버튼의 마모를 가속시킬 수 있습니다.',
    homeFaqQ9: '다양한 기간의 CPS 테스트는 각각 어떤 능력을 평가하나요?',
    homeFaqA9:
      '다양한 기간의 테스트는 다른 차원의 능력을 평가합니다. \n1. 1초 테스트: 순간 폭발력과 손속 잠재력을 평가합니다. \n2. 5초 테스트: 폭발력과 단기 안정성을 균형 잡는 가장 일반적인 종합 평가 지표입니다. \n3. 10초 테스트: 지속적인 클릭의 내구력과 리듬 유지 능력을 평가합니다. \n4. 30초 테스트: 장시간 조작의 안정성을 평가하기에 적합한 표준 내구력 테스트입니다. \n5. 60초 테스트: 손 근육의 피로 저항력을 시험하는 극한 내구력 테스트입니다. 다양한 기간의 테스트를 결합하여 자신의 손속 특징을 전반적으로 파악하는 것을 권장합니다.',
    homeFaqQ10: 'CPS 테스트 결과와 실제 게임 성능은 어떤 관련이 있나요?',
    homeFaqA10:
      'CPS 테스트 결과와 게임 성능은 일정한 관련이 있지만 절대적이지는 않습니다. \n1. 상관성: 높은 CPS는 빠른 클릭이 필요한 게임(예: Minecraft, CS:GO 등)에서 유리합니다. \n2. 제한 사항: 게임 성능은 반응 속도, 손-눈 협응, 전략 의식 등 다양한 요인에 의존합니다. \n3. 참고 가치: CPS 테스트는 손속 훈련의 참고 지표로 사용할 수 있지만, 게임 수준을 완전히 대표할 수 없습니다. \n4. 전문 훈련: 특정 게임의 조작 요구에 맞춘 타겟 훈련이 단순히 높은 CPS를 추구하는 것보다 효과적입니다. \n5. 균형 발전: CPS 훈련을 반응 속도, 정확성 훈련과 결합하는 것을 권장합니다.',
    homeFaqQ11: 'CPS 훈련으로 인한 손 피로 또는 부상을 어떻게 피할 수 있나요?',
    homeFaqA11:
      '손 건강을 보호하는 것은 매우 중요하며, 다음 원칙을 따르는 것이 좋습니다. \n1. 적절한 훈련: 한 번 연습은 30분을 넘기지 마세요. 장시간 고강도 조작을 피하세요. \n2. 올바른 자세: 손목을 자연스럽게 똑바로 유지하고, 과도한 구부림이나 비틀림을 피하세요. \n3. 정기 휴식: 10분 연습마다 1-2분씩 휴식을 취하고, 손목과 손가락을 움직이세요. \n4. 손 이완: 연습 전후에 손 스트레칭과 마사지를 하세요. \n5. 장치 적응: 인체 공학에 맞는 마우스를 선택하고, 적합한 마우스 민감도를 조정하세요. \n6. 신호 유의: 손목 통증이나 마비가 발생하면 즉시 연습을 중지하고 휴식하세요. \n7. 교차 활동: 단일 동작 반복을 피하기 위해 정기적으로 다른 비마우스 조작 활동을 하세요.',
    homeFaqQ12: 'CPS 테스트의 역사와 발전 추세는 무엇인가요?',
    homeFaqA12:
      'CPS 테스트의 발전 과정과 추세는 다음과 같습니다. \n1. 기원: 처음 Minecraft 등 게임 커뮤니티에서 유래하여 플레이어의 PvP 능력을 평가하는 데 사용되었습니다. \n2. 발전: 점차 e스포츠 분야로 확장되어 손속 평가의 표준 도구가 되었습니다. \n3. 기술 발전: 단순한 계수 도구에서 데이터 분석과 훈련 제안을 제공하는 전문 플랫폼으로 발전했습니다. \n4. 다양화: 마우스 클릭 외에도 스페이스바 클릭, 키보드 키 등 다양한 테스트 유형으로 확장되었습니다. \n5. 지능화: 향후 AI 분석을 통합하여 개인화된 훈련 계획과 진행 예측을 제공할 것입니다. \n6. 커뮤니티화: 플레이어 순위표와 훈련 커뮤니티를 구축하여 상호 교류와 발전을 촉진합니다.',
    // 鼠标拖动测试相关
    mouseDragTest: '마우스 드래그 테스트',
    totalDistance: '총 거리',
    averageSpeed: '평균 속도',
    testDuration: '테스트 기간',
    clickAndDragToTest: '클릭하고 드래그하여 테스트를 시작하세요',
    dragToStart: '드래그 시작',
    dragCompleted: '드래그 완료',
    whatIsMouseDragTestQ1: '마우스 드래그 테스트를 하는 방법은 무엇인가요?',
    whatIsMouseDragTestA1:
      '마우스로 드래그 테스트를 하려면: "마우스" 개체에 커서를 놓고, 테스트할 마우스 이미지를 누른 상태에서 테스트 영역 내의 임의 방향으로 커서를 이동합니다. 개체가 버튼을 놓을 때까지 계속 드래그되면 마우스 드래그 기능이 정상적으로 작동합니다. 터치 스크린 드래그 테스트의 경우: "마우스" 이미지를 터치하고 테스트 영역 내의 임의 방향으로 이동합니다. 이동하면 스크린 드래그 기능이 정상적으로 작동합니다.',
    faqMouseDragQ1: '마우스의 어떤 버튼으로 테스트할 수 있나요?',
    faqMouseDragA1:
      '마우스의 왼쪽 버튼, 가운데 버튼 및 오른쪽 버튼을 사용하여 테스트할 수 있습니다. 거의 왼쪽 버튼을 사용하지만, 필요와 선호에 따라 가운데 버튼이나 오른쪽 버튼을 사용할 수도 있습니다.',
    faqMouseDragQ2: '마우스 드래그를 테스트하는 이유는 무엇인가요?',
    faqMouseDragA2:
      '응용 프로그램이나 화면에서 무언가를 드래그할 때 마우스나 손가락을 계속 이동시켰음에도 불구하고 갑자기 이동이 멈춥니다. 이는 응용 프로그램 오류 또는 마우스 버튼이나 화면 문제일 수 있습니다',
    // 图片alt属性翻译
    logoAlt: 'CPS Test 아이콘',
    historyIconAlt: '히스토리 아이콘',
    multipleTestTypesIconAlt: '다중 테스트 유형 아이콘',
    realTimeStatsIconAlt: '실시간 통계 데이터 아이콘',
    gameifiedExperienceIconAlt: '게임화 경험 아이콘',
    // FAQ组件翻译
    searchQuestion: '질문 검색...',
    popularQuestions: '인기 질문',
    relatedQuestions: '관련 질문',
    noQuestionFound: '관련 질문을 찾을 수 없습니다. 다른 키워드를 시도해보세요.',
    // 404页面翻译
    pageNotFound: '페이지를 찾을 수 없습니다',
    pageNotFoundDescription:
      '죄송합니다. 접근하려는 페이지가 존재하지 않습니다. URL이 올바른지 확인하거나 홈페이지로 돌아가 계속 브라우징하세요.',
    goHome: '홈페이지로 돌아가기',
    searchTest: '테스트 검색',
    searchPlaceholder: '테스트 검색...',
    search: '검색',
    // 测试类型描述
    clickTestDesc: '마우스 클릭 속도를 테스트하고 다양한 시간 길이를 지원합니다',
    clickTestDescription:
      'CPSTest 클릭 속도 테스트, 1초, 2초, 5초, 10초, 15초, 30초, 60초 등 다양한 시간 길이를 지원하고, 실시간으로 클릭 속도와 총 클릭 수를 표시하며, 테스트 후 상세 통계 데이터와 기록을 제공합니다',
    clickTestKeywords:
      '클릭 속도 테스트,CPSTest,마우스 클릭 테스트,클릭 속도,온라인 클릭 속도 테스트,클릭 속도 테스트 도구,CPS 테스트',
    spaceClickTestDesc: '스페이스바 클릭 속도를 테스트하고 다양한 시간 길이를 지원합니다',
    spaceClickTestDescription:
      'CPSTest 스페이스 클릭 테스트, 1초, 2초, 5초, 10초, 15초, 30초, 60초 등 다양한 시간 길이를 지원하고, 스페이스바 클릭 속도와 내구성을 전문적으로 테스트합니다',
    spaceClickTestKeywords:
      '스페이스 클릭 테스트,스페이스바 테스트,스페이스 속도 테스트,스페이스 클릭 속도,스페이스바 클릭 테스트 도구,CPSTest',
    kohiClickTestDesc: '전문적인 Minecraft 클릭 테스트, 10초로 고정',
    kohiClickTestDescription:
      'CPSTest Kohi 클릭 테스트, Minecraft 서버 Kohi에서 유래, 10초로 고정, Minecraft 플레이어를 위해 특별히 설계되었으며, 지속적인 클릭의 안정성과 속도를 테스트합니다',
    kohiClickTestKeywords:
      'Kohi 테스트,Kohi 클릭 테스트,Minecraft 클릭 테스트,MC 클릭 테스트,10초 클릭 테스트,CPSTest',
    reactionTestDesc: '시각 반응 속도를 테스트하고 자극부터 반응까지의 시간을 측정합니다',
    reactionTestDescription:
      'CPSTest 반응 시간 테스트, 시각 반응 속도를 측정하고, 초록색 사각형이 나타나서 마우스를 클릭할 때까지의 시간 간격, 평균 반응 시간과 최고 반응 시간 통계를 제공합니다',
    reactionTestKeywords:
      '반응 시간 테스트,반응 속도 테스트,시각 반응 테스트,반응 테스트,반응 속도 테스트 도구,CPSTest',
    colorReactionTestDescription:
      'CPSTest 색 반응 테스트, 색상 인식과 반응 속도를 테스트하고, 텍스트 내용을 무시하고 텍스트와 일치하는 색상 사각형을 클릭하며, 뇌 반응 능력에 도전합니다',
    colorReactionTestKeywords:
      '색 반응 테스트,색상 인식 테스트,시각 반응 테스트,색 반응 속도 테스트,색상 테스트,CPSTest',
    keyReactionTestDescription:
      'CPSTest 키 반응 테스트, WASD 키에 대한 반응 속도를 평가하고, 게임은 랜덤으로 키를 강조 표시하며, 가능한 빨리 해당 키를 누르세요, 게임 플레이어 훈련에 적합합니다',
    keyReactionTestKeywords:
      '키 반응 테스트,WASD 반응 테스트,게임 반응 테스트,키 속도 테스트,게임 플레이어 훈련,CPSTest',
    targetEliminationGameDescription:
      'CPSTest 타겟 제거 반응 훈련 게임, 반응 속도와 수안 협조 능력을 테스트하고, 지정된 시간 내에 화면의 색상 타겟을 클릭하여 가능한 높은 점수를 얻으세요',
    targetEliminationGameKeywords:
      '타겟 제거 게임,반응 속도 훈련,수안 협조 훈련,반응 게임,타겟 제거 테스트,CPSTest',
    mouseScrollTestDesc: '마우스 스크롤 속도를 테스트하고 초당 스크롤 픽셀 수를 측정합니다',
    mouseScrollTestDescription:
      'CPSTest 마우스 스크롤 테스트, 마우스 스크롤 속도를 테스트하고 초당 스크롤 픽셀 수를 측정하며, 빠른 스크롤이 필요한 게임과 작업 시나리오에 적합합니다',
    mouseScrollTestKeywords:
      '마우스 스크롤 테스트,스크롤 속도 테스트,마우스 스크롤 속도,스크롤 테스트,마우스 테스트,CPSTest',
    mouseDragTestDesc: '마우스 드래그 속도와 정확도를 테스트합니다',
    mouseDragTestDescription:
      'CPSTest 마우스 드래그 테스트, 마우스 드래그 속도와 정확도를 테스트하고, 드래그 거리와 평균 속도를 기록하며, 정확한 드래그가 필요한 작업과 게임 시나리오에 적합합니다',
    mouseDragTestKeywords:
      '마우스 드래그 테스트,드래그 속도 테스트,마우스 드래그 속도,드래그 테스트,마우스 테스트,CPSTest',
    keyboardTestDescription:
      'CPSTest 키보드 테스트, 키보드의 키가 정상적으로 작동하는지 감지하고, 키 상태와 눌린 키 목록을 실시간으로 표시하며, 키보드의 민감도와 키 상태를 이해하는 데 도움이 됩니다',
    keyboardTestKeywords:
      '키보드 테스트,키보드 키 테스트,키보드 기능 테스트,키 테스트,키보드 감지,CPSTest',
    typingTestDesc: '타이핑 속도와 정확도를 테스트하고 다양한 시간 길이를 지원합니다',
    typingTestDescription:
      'CPSTest 타이핑 테스트, 타이핑 속도와 정확도를 테스트하고, 1분, 3분, 5분, 10분, 15분 등 다양한 시간 길이를 지원하며, 타이핑 속도와 정확도를 실시간으로 표시합니다',
    typingTestKeywords:
      '타이핑 테스트,타이핑 속도 테스트,타이핑 정확도 테스트,타이핑 연습,타이핑 속도,CPSTest',
    doubleClickTestDesc: '더블 클릭 속도와 정확도를 테스트합니다',
    doubleClickTestDescription:
      'CPSTest 더블 클릭 테스트, 더블 클릭 속도와 정확도를 테스트하고, 더블 클릭 수와 최고 더블 클릭 속도를 기록하며, 빠른 더블 클릭이 필요한 게임과 작업 시나리오에 적합합니다',
    doubleClickTestKeywords:
      '더블 클릭 테스트,연속 클릭 테스트,더블 클릭 연속 테스트,더블 클릭 속도 테스트,더블 클릭 수 테스트,CPSTest',
    tripleClickTestDesc: '트리플 클릭 속도와 정확도를 테스트합니다',
    tripleClickTestDescription:
      'CPSTest 트리플 클릭 테스트, 트리플 클릭 속도와 정확도를 테스트하고, 트리플 클릭 수와 최고 트리플 클릭 속도를 기록하며, 클릭 기술의 한계에 도전합니다',
    tripleClickTestKeywords:
      '트리플 클릭 테스트,트리플 클릭 연속 테스트,트리플 클릭 속도 테스트,트리플 클릭 수 테스트,트리플 클릭 테스트 도구,CPSTest',
    copyright: '© 2025 CPSTestGo - 모든 권리 보유',
    // ResultModal 컴포넌트
    resultModal: {
      // 상세 정보
      details: '{time}초 동안 {clicks}번 클릭했습니다',
      // 버튼 텍스트
      okButton: '확인',
      // 다른 CPS 범위 설명
      slow: {
        desc1: '클릭 속도가 느립니다, 더 많은 연습이 필요합니다!',
        desc2: '실망하지 마세요, 계속 노력하세요, 더 빨라질 것입니다!'
      },
      average: {
        desc1: '클릭 속도가 평균 수준입니다, 아직 개선의 여지가 있습니다!',
        desc2: '좋은 성능입니다, 이 리듬을 유지하세요!'
      },
      fast: {
        desc1: '클릭 속도가 빠릅니다, 대부분의 사람을 앞서갔습니다!',
        desc2: '훌륭합니다, 당신의 손속도 정말 빠릅니다!'
      },
      superFast: {
        desc1: '클릭 속도가 초고속입니다, 번개처럼 빠릅니다!',
        desc2: '놀랍습니다, 당신은 타고난 클릭 마스터입니다!'
      },
      ultraFast: {
        desc1: '클릭 속도가 한계를 넘었습니다, 당신은 클릭의 신입니다!',
        desc2: '불가능합니다! 당신의 손속도는 인간의 인지력을 초과했습니다!'
      },
      // CPS 피드백
      feedback: {
        slow: '결과가 좋지 않습니다, 매우 느립니다.',
        average: '좋은 결과입니다, 계속 노력하세요!',
        fast: '훌륭한 결과입니다, 당신은 클릭 마스터입니다!',
        superFast: '우수한 결과입니다, 당신은 클릭 레전드입니다!',
        ultraFast: '놀라운 결과입니다, 당신은 클릭의 신입니다!'
      }
    },
  },
};

// 当前语言 - 使用reactive使其成为响应式
export const langState = reactive({
  current: 'zh-CN',
});

// 为了保持向后兼容，导出一个只读的currentLang
export const currentLang = computed(() => langState.current);

// 设置当前语言
export const setLanguage = (lang: string) => {
  langState.current = lang;
  // 使用Cookie存储语言偏好，过期时间设置为365天
  CookieManager.setCookie(COOKIE_NAMES.LANGUAGE, lang, 365);

  // 语言切换后使用nextTick确保DOM更新完成后再更新meta标签
  nextTick(() => {
    updateMetaTags(router.currentRoute.value);
  });
};

// 获取当前语言
export const getLanguage = (): string => {
  const savedLang = CookieManager.getCookie(COOKIE_NAMES.LANGUAGE);
  return savedLang || langState.current;
};

// 初始化语言 - 优先从URL路径提取，其次从URL参数获取，最后从localStorage获取，默认中文
export const initLanguage = () => {
  // 支持的语言列表
  const supportedLanguages = ['zh-CN', 'en', 'ja', 'ko'];

  // 从URL路径中提取语言前缀
  const pathSegments = window.location.pathname.split('/').filter((segment) => segment !== '');
  let detectedLang = '';

  // 检查路径是否以支持的语言前缀开头
  if (pathSegments.length > 0 && pathSegments[0] && supportedLanguages.includes(pathSegments[0])) {
    detectedLang = pathSegments[0];
  }

  // 如果路径中没有语言前缀，检查URL查询参数
  if (!detectedLang) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && supportedLanguages.includes(urlLang)) {
      detectedLang = urlLang;
    }
  }

  // 从Cookie获取保存的语言
  const savedLang = CookieManager.getCookie(COOKIE_NAMES.LANGUAGE);

  // 确定最终使用的语言
  if (detectedLang && supportedLanguages.includes(detectedLang)) {
    langState.current = detectedLang;
    // 使用Cookie存储语言偏好，过期时间设置为365天
    CookieManager.setCookie(COOKIE_NAMES.LANGUAGE, detectedLang, 365);
  } else if (savedLang && supportedLanguages.includes(savedLang)) {
    langState.current = savedLang;
  }
};

// 翻译函数 - 支持参数替换和嵌套对象
export const t = (key: string, params: Record<string, any> = {}): string => {
  // 分解键路径
  const keys = key.split('.');
  let translation: any = resources[langState.current];

  // 遍历键路径，查找对应的翻译值
  for (const k of keys) {
    if (translation && typeof translation === 'object' && k in translation) {
      translation = translation[k];
    } else {
      // 如果找不到对应翻译，返回原始键
      return key;
    }
  }

  // 如果找到的翻译是对象而不是字符串，返回原始键
  if (typeof translation !== 'string') {
    return key;
  }

  // 替换参数
  Object.keys(params).forEach((paramKey) => {
    const regex = new RegExp(`\\{${paramKey}\\}`);
    translation = translation.replace(regex, params[paramKey]);
  });

  return translation;
};
