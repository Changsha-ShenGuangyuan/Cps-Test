import { glob } from 'glob';

export default {
  content: ['./src/**/*.html', './src/**/*.vue', './src/**/*.ts', './src/**/*.js'],
  css: ['./src/style.css'],
  safelist: [
    // 在这里添加需要保留的类名，即使它们没有在模板中直接找到
  ],
  output: './purgecss-result/',
};
