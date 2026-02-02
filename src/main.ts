import { createApp } from 'vue';
// 注意：全局CSS已在index.html中通过preload预加载
// import './style.css';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import i18n from './i18n';

// 延迟初始化函数，确保DOM已经解析完成
function initApp() {
  const app = createApp(App);
  const head = createHead();

  // 简化应用初始化，确保插件按正确顺序加载
  app.use(router);
  app.use(head);

  // 初始化语言资源并挂载应用
  import('./i18n').then(async (module) => {
    try {
      // 先初始化语言资源
      await module.initLanguage();
    } catch (error) {
      console.error('初始化语言资源失败:', error);
    } finally {
      // 无论语言初始化是否成功，都使用i18n插件
      app.use(i18n);
      // 挂载应用
      app.mount('#app');
    }
  }).catch((error) => {
    console.error('加载i18n模块失败:', error);
    // 即使加载失败也要挂载应用
    app.use(i18n);
    app.mount('#app');
  });
}

// 检查DOM是否已经解析完成
if (document.readyState === 'loading') {
  // 如果DOM还在加载中，等待DOMContentLoaded事件
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // 如果DOM已经加载完成，直接初始化
  initApp();
}
