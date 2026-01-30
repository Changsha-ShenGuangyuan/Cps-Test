import { createApp } from 'vue';
// 注意：全局CSS已在index.html中通过preload预加载
// import './style.css';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import VueLazyload from 'vue-lazyload';
import i18n from './i18n';

const app = createApp(App);
const head = createHead();

// 全局错误处理（简化版）
if (import.meta.env.DEV) {
  app.config.errorHandler = (err) => {
    console.error('全局错误捕获:', err);
  };
}

// 优化VueLazyload配置
app.use(VueLazyload, {
  preLoad: 1.2,
  error: '/logo.png',
  loading: '/logo.png',
  attempt: 1,
  silent: true,
});

app.use(router);
app.use(head);

// 初始化应用
async function initApp() {
  try {
    // 等待语言资源加载完成
    await import('./i18n').then(async (module) => {
      // 先初始化语言资源
      await module.initLanguage();
    });

    // 然后使用i18n插件
    app.use(i18n);

    // 最后挂载应用
    app.mount('#app');
  } catch (error) {
    console.error('初始化应用失败:', error);
    // 即使失败也要挂载应用，确保网站能正常访问
    app.use(i18n);
    app.mount('#app');
  }
}

// 启动应用初始化
initApp();
