import { createApp } from 'vue';
// 注意：全局CSS已在index.html中通过preload预加载
// import './style.css';
import App from './App.vue';
import router from './router';
import { createHead } from '@vueuse/head';
import VueLazyload from 'vue-lazyload';

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
app.mount('#app');
