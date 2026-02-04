import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import sitemapPlugin from 'vite-plugin-sitemap';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  // 基础路径配置，设置为根路径
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    // 自定义插件，用于移除ClickTest相关的预加载链接
    {
      name: 'remove-click-test-preload',
      enforce: 'post',
      transformIndexHtml(html) {
        // 移除ClickTest相关的预加载链接，同时处理大小写情况
        return html
          .replace(/<link rel="modulepreload"[^>]*href="[^"]*(click-test|ClickTest)[^>]*>/g, '')
          .replace(/<link rel="stylesheet"[^>]*href="[^"]*(click-test|ClickTest)[^>]*>/g, '');
      },
    },
    // 自定义插件，用于优化CSS加载策略
    {
      name: 'optimize-css-loading',
      enforce: 'post',
      transformIndexHtml(html) {
        // 将非关键CSS链接修改为异步加载
        return html.replace(/<link rel="stylesheet"[^>]*?href="([^"]+)"[^>]*?>/g, (_, href) => {
          // 创建异步加载的CSS链接
          const asyncLink = `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">`;
          // 添加noscript回退
          const noscriptFallback = `<noscript><link rel="stylesheet" href="${href}"></noscript>`;
          return asyncLink + noscriptFallback;
        });
      },
    },
    // 资源提示插件
    {
      name: 'optimize-resource-hints',
      enforce: 'post',
      transformIndexHtml(html, ctx) {
        // 只在生产模式下添加预加载链接
        if (ctx.server?.config.mode === 'production') {
          // 只添加关键资源预加载
          const preloadLinks = `
            <link rel="preload" href="/assets/js/vendor-vue-[hash].js" as="script">
            <link rel="preload" href="/assets/js/components-home-[hash].js" as="script">
            <link rel="preload" href="/assets/js/components-result-[hash].js" as="script">
          `;
          // 将资源提示插入到head标签中
          return html.replace('</head>', `${preloadLinks}</head>`);
        }
        return html;
      },
    },
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 1KB以上的文件就会被压缩
      deleteOriginFile: false,
      verbose: true,
      filter: (fileName) => {
        return !fileName.includes('node_modules');
      },
    }),
    // 添加Brotil压缩，提供更高的压缩率
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // 1KB以上的文件就会被压缩
      deleteOriginFile: false,
      verbose: true,
      filter: (fileName) => {
        return !fileName.includes('node_modules');
      },
    }),
    ViteImageOptimizer({
      png: {
        quality: 75,
        compressionLevel: 9,
      },
      jpeg: {
        quality: 75,
        mozjpeg: true,
      },
      webp: {
        quality: 75,
      },
      avif: {
        quality: 75,
      },
      tiff: {
        quality: 75,
      },
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
      gif: {
        // gif不支持quality属性，使用默认配置
      },
      // 确保在构建时处理所有图片
      includePublic: true,
    }),
    sitemapPlugin({
      hostname: 'https://www.cpstestgo.com',
      exclude: ['/404'],
      generateRobotsTxt: true,
      robots: [
        { userAgent: '*', allow: '/' },
        { userAgent: '*', disallow: '/admin/' },
      ],
      changefreq: 'weekly',
      priority: 0.8,
      dynamicRoutes: [
        // 首页
        '/',
        // 各种测试页面 - 中文
        '/click-test/1',
        '/click-test/2',
        '/click-test/5',
        '/click-test/10',
        '/click-test/15',
        '/click-test/30',
        '/click-test/60',
        '/multi-click-test/double',
        '/multi-click-test/triple',
        '/space-click-test/1',
        '/space-click-test/2',
        '/space-click-test/5',
        '/space-click-test/10',
        '/space-click-test/15',
        '/space-click-test/30',
        '/space-click-test/60',
        '/kohi-click-test',
        '/reaction-time-test',
        '/color-reaction-test',
        '/key-reaction-test',
        '/target-elimination-game',
        '/mouse-scroll-test',
        '/mouse-drag-test',
        '/keyboard-test',
        '/typing-test/1',
        '/typing-test/3',
        '/typing-test/5',
        '/typing-test/10',
        '/typing-test/15',
        // 英文版本
        '/en',
        '/en/click-test/1',
        '/en/click-test/2',
        '/en/click-test/5',
        '/en/click-test/10',
        '/en/click-test/15',
        '/en/click-test/30',
        '/en/click-test/60',
        '/en/multi-click-test/double',
        '/en/multi-click-test/triple',
        '/en/space-click-test/1',
        '/en/space-click-test/2',
        '/en/space-click-test/5',
        '/en/space-click-test/10',
        '/en/space-click-test/15',
        '/en/space-click-test/30',
        '/en/space-click-test/60',
        '/en/kohi-click-test',
        '/en/reaction-time-test',
        '/en/color-reaction-test',
        '/en/key-reaction-test',
        '/en/target-elimination-game',
        '/en/mouse-scroll-test',
        '/en/mouse-drag-test',
        '/en/keyboard-test',
        '/en/typing-test/1',
        '/en/typing-test/3',
        '/en/typing-test/5',
        '/en/typing-test/10',
        '/en/typing-test/15',
        // 日文版本
        '/ja',
        '/ja/click-test/1',
        '/ja/click-test/2',
        '/ja/click-test/5',
        '/ja/click-test/10',
        '/ja/click-test/15',
        '/ja/click-test/30',
        '/ja/click-test/60',
        '/ja/multi-click-test/double',
        '/ja/multi-click-test/triple',
        '/ja/space-click-test/1',
        '/ja/space-click-test/2',
        '/ja/space-click-test/5',
        '/ja/space-click-test/10',
        '/ja/space-click-test/15',
        '/ja/space-click-test/30',
        '/ja/space-click-test/60',
        '/ja/kohi-click-test',
        '/ja/reaction-time-test',
        '/ja/color-reaction-test',
        '/ja/key-reaction-test',
        '/ja/target-elimination-game',
        '/ja/mouse-scroll-test',
        '/ja/mouse-drag-test',
        '/ja/keyboard-test',
        '/ja/typing-test/1',
        '/ja/typing-test/3',
        '/ja/typing-test/5',
        '/ja/typing-test/10',
        '/ja/typing-test/15',
        // 韩文版本
        '/ko',
        '/ko/click-test/1',
        '/ko/click-test/2',
        '/ko/click-test/5',
        '/ko/click-test/10',
        '/ko/click-test/15',
        '/ko/click-test/30',
        '/ko/click-test/60',
        '/ko/multi-click-test/double',
        '/ko/multi-click-test/triple',
        '/ko/space-click-test/1',
        '/ko/space-click-test/2',
        '/ko/space-click-test/5',
        '/ko/space-click-test/10',
        '/ko/space-click-test/15',
        '/ko/space-click-test/30',
        '/ko/space-click-test/60',
        '/ko/kohi-click-test',
        '/ko/reaction-time-test',
        '/ko/color-reaction-test',
        '/ko/key-reaction-test',
        '/ko/target-elimination-game',
        '/ko/mouse-scroll-test',
        '/ko/mouse-drag-test',
        '/ko/keyboard-test',
        '/ko/typing-test/1',
        '/ko/typing-test/3',
        '/ko/typing-test/5',
        '/ko/typing-test/10',
        '/ko/typing-test/15',
      ],
    }),
    // HTML插件，用于优化HTML输出
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          // 可以在此注入数据到HTML模板
        },
        tags: [
          // 预连接到关键资源
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://www.google-analytics.com',
              crossorigin: 'anonymous',
            },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://www.googletagmanager.com',
              crossorigin: 'anonymous',
            },
            injectTo: 'head',
          },
          // 预加载关键资源 - 仅在生产模式下注入
          // 开发模式下Vite会自动处理模块加载，不需要预加载
          // 安全相关的meta标签
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content:
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
            },
          },
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'X-Content-Type-Options',
              content: 'nosniff',
            },
          },
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'X-XSS-Protection',
              content: '1; mode=block',
            },
          },
          {
            tag: 'meta',
            attrs: {
              name: 'referrer-policy',
              content: 'strict-origin-when-cross-origin',
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: true, // 使用 true 而不是 'localhost' 或 '0.0.0.0'
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost', // WebSocket 仍然使用 localhost
      port: 5173,
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Cache-Control': 'public, max-age=31536000, immutable',
      Vary: 'User-Agent, Accept-Encoding',
      // 启用压缩支持
      'Accept-Encoding': 'gzip, deflate, br',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      // 为静态资源添加更激进的缓存控制头
      'Cache-Control': 'public, max-age=31536000, immutable',
      // 移动端缓存策略
      Vary: 'User-Agent, Accept-Encoding',
      // 启用压缩支持
      'Accept-Encoding': 'gzip, deflate, br',
      // 资源提示
      Link: '</logo.png>; rel=preload; as=image; crossorigin',
    },
  },
  // 启用持久化缓存，提升构建性能
  cacheDir: '.vite/cache',
  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 50, // 进一步降低chunk大小警告阈值
    cssCodeSplit: true, // 启用CSS代码分割
    cssMinify: 'lightningcss', // 使用更高效的CSS压缩
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'], // 优化目标浏览器
    // 增强Tree Shaking
    rollupOptions: {
      plugins: [
        // 构建分析插件
        visualizer({
          open: true, // 构建完成后自动打开分析报告
          gzipSize: true, // 显示gzip压缩后的大小
          brotliSize: true, // 显示brotli压缩后的大小
          filename: 'dist/stats.html', // 分析报告输出路径
          template: 'treemap', // 报告类型：treemap, sunburst, network, raw-data, list
        }),
      ],
      // 优化初始加载性能
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      // 配置输出选项
      output: {
        // 优化chunk命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // 生成更小的chunk
        minifyInternalExports: true,
        // 手动分包配置
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 更精细的vendor分包
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vendor-vue';
            }
            if (id.includes('@vueuse')) {
              return 'vendor-vueuse';
            }
            if (id.includes('vue-i18n')) {
              return 'vendor-i18n';
            }
            return 'vendor-other';
          }
          if (id.includes('src/i18n')) {
            if (id.includes('locales/en')) {
              return 'i18n-en';
            } else if (id.includes('locales/zh-CN')) {
              return 'i18n-zh-CN';
            } else if (id.includes('locales/ja')) {
              return 'i18n-ja';
            } else if (id.includes('locales/ko')) {
              return 'i18n-ko';
            } else {
              return 'i18n-core';
            }
          }
          if (id.includes('src/utils')) {
            return 'utils';
          }
          if (id.includes('src/services')) {
            return 'services';
          }
          if (id.includes('src/composables')) {
            return 'composables';
          }
          // 按组件分包
          if (id.includes('src/components/')) {
            const componentName = id.split('/').pop()?.replace(/\.vue$/, '');
            if (componentName === 'HomePage') {
              return 'components-home';
            }
            if (componentName === 'ClickTest') {
              return 'components-test';
            }
            if (componentName === 'ResultModal') {
              return 'components-result'; // 为ResultModal创建单独的chunk
            }
            return 'components-other';
          }
        },
      },
      // 增强tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // 禁用生产环境的sourcemap
    sourcemap: false,
  },
  // 优化CSS处理
  css: {
    preprocessorOptions: {
      // 可以在此添加CSS预处理器配置
    },
    // 禁用开发环境sourcemap，减少文件大小
    devSourcemap: false,
    // 优化CSS输出
    postcss: {
      plugins: [
        // 添加CSS优化插件
        {
          postcssPlugin: 'custom-plugin',
          AtRule: {
            // 可以添加自定义的PostCSS规则
          },
        },
      ],
    },
    // 优化CSS代码分割
    modules: {
      localsConvention: 'camelCase',
    },
  },
  // 优化后的预构建配置
  optimizeDeps: {
    // 预构建依赖
    include: ['vue', 'vue-router', '@vueuse/head', 'vue-i18n'],
    // 禁用自动依赖发现，提高构建速度
    force: false,
  },
});
