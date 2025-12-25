import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import VueLazyload from 'vue-lazyload';

const app = createApp(App);
const head = createHead();

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误捕获:', err);
  console.error('错误实例:', instance);
  console.error('错误信息:', info);

  // 可以在这里添加错误上报逻辑
  // 例如：发送错误信息到监控服务器
};

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('全局警告捕获:', msg);
  console.warn('警告实例:', instance);
  console.warn('警告追踪:', trace);
};

// 全局未捕获的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  console.error('Promise:', event.promise);
  event.preventDefault();
});

// 全局未捕获的错误处理
window.addEventListener('error', (event) => {
  console.error('全局未捕获错误:', event.error);
  console.error('错误文件名:', event.filename);
  console.error('错误行号:', event.lineno);
  console.error('错误列号:', event.colno);
  console.error('错误事件:', event);
});

app.use(router);
app.use(head);
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/assets/error.png',
  loading: '/assets/loading.png',
  attempt: 1,
  lazyComponent: true,
});
app.mount('#app');
