import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import VueLazyload from 'vue-lazyload';

const app = createApp(App);
const head = createHead();

// 只在开发环境添加全局错误处理
if (import.meta.env.DEV) {
  // 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('全局错误捕获:', err);
    console.error('错误实例:', instance);
    console.error('错误信息:', info);
  };

  // 全局警告处理
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('全局警告捕获:', msg);
    console.warn('警告实例:', instance);
    console.warn('警告追踪:', trace);
  };
}

// 全局未捕获的Promise拒绝处理 - 只在开发环境打印详细日志
window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.error('未处理的Promise拒绝:', event.reason);
    console.error('Promise:', event.promise);
  }
  event.preventDefault();
});

// 全局未捕获的错误处理 - 只在开发环境打印详细日志
window.addEventListener('error', (event) => {
  if (import.meta.env.DEV) {
    console.error('全局未捕获错误:', event.error);
    console.error('错误文件名:', event.filename);
    console.error('错误行号:', event.lineno);
    console.error('错误列号:', event.colno);
    console.error('错误事件:', event);
  }
});

// 优化VueLazyload配置
app.use(VueLazyload, {
  preLoad: 1.2, // 降低预加载比例
  error: '/logo.png',
  loading: '/logo.png',
  attempt: 1,
  lazyComponent: true,
  silent: true, // 静默模式，减少控制台输出
});

app.use(router);
app.use(head);
app.mount('#app');
