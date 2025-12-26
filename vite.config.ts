import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import sitemapPlugin from 'vite-plugin-sitemap';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB以上的文件才会被压缩
      deleteOriginFile: false, // 不删除原始文件
      verbose: true, // 输出压缩结果
    }),
    ViteImageOptimizer({
      png: {
        quality: 80,
        compressionLevel: 9,
      },
      jpeg: {
        quality: 80,
        mozjpeg: true,
      },
      webp: {
        quality: 80,
      },
      avif: {
        quality: 80,
      },
      tiff: {
        quality: 80,
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
    }),
    sitemapPlugin({
      hostname: 'https://www.cpstestgo.com', // 替换为实际的网站URL
      exclude: ['/404'], // 排除404页面
      generateRobotsTxt: true, // 自动生成robots.txt文件
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
    // HTML插件，用于添加安全相关的meta标签
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          // 可以在此注入数据到HTML模板
        },
        // 注入额外的meta标签
        tags: [
          // Content-Security-Policy标签
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content:
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com",
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0', // 设置本地IP地址为0.0.0.0
    headers: {
      // 安全头配置
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 600, // 调整chunk大小警告阈值
    rollupOptions: {
      output: {
        // 配置chunk命名规则
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: (id) => {
          if (id.includes('vue') || id.includes('vue-router')) {
            return 'vue-vendor';
          }
          if (id.includes('@vueuse/head') || id.includes('vue-meta')) {
            return 'meta-vendor';
          }
          // 根据组件路径自动命名chunk
          if (id.includes('/components/')) {
            if (id.includes('HomePage')) {
              return 'home';
            } else if (id.includes('NotFound')) {
              return 'error';
            } else if (id.includes('PrivacyPolicy')) {
              return 'page';
            } else {
              return 'test';
            }
          }
        },
      },
    },
  },
});
