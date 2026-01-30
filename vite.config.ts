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
          {
            tag: 'link',
            attrs: {
              rel: 'preconnect',
              href: 'https://cdn.jsdelivr.net',
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
                "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
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
    host: '0.0.0.0',
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  // 启用持久化缓存，提升构建性能
  cacheDir: '.vite/cache',
  build: {
    minify: 'terser',
    chunkSizeWarningLimit: 200, // 进一步降低chunk大小警告阈值
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
      output: {
        // 配置chunk命名规则
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
        // 优化代码分割策略
        manualChunks: (id) => {
          // 优先处理Vue相关核心库，确保它们始终单独打包
          if (
            id.includes('node_modules') &&
            (id.includes('vue/dist/') ||
              id.includes('@vue/runtime') ||
              id.includes('@vue/runtime-dom'))
          ) {
            return 'vue-runtime';
          }

          // 优先处理其他第三方库
          if (id.includes('node_modules')) {
            // 确保 Vue 相关库始终单独打包
            if (id.includes('vue') || id.includes('vue-router') || id.includes('@vueuse/head')) {
              return 'vue-vendor';
            }
            // 其他第三方库打包到通用vendor
            return 'vendor';
          }

          // 优先处理路由文件
          if (id.includes('src/router/')) {
            return 'router';
          }

          // 优先处理i18n模块
          if (id.includes('src/i18n/')) {
            return 'i18n';
          }

          // 将工具函数单独打包
          if (id.includes('src/utils/')) {
            return 'utils';
          }

          // 将composable函数单独打包
          if (id.includes('src/composables/')) {
            // ClickTest相关的composable
            if (id.includes('useClickTestGame') || id.includes('useClickTestHistory')) {
              return 'click-test-composables';
            }
            // 其他composable打包到通用composables
            return 'composables';
          }

          // 基础UI组件单独打包
          if (id.includes('src/components/')) {
            // 通用UI组件
            if (id.includes('ResultModal')) {
              return 'result-modal';
            } else if (id.includes('RelatedTests')) {
              return 'related-tests';
            } else if (id.includes('FAQComponent')) {
              return 'faq-component';
            } else if (id.includes('Breadcrumb')) {
              return 'breadcrumb';
            } else if (id.includes('LanguageSelector')) {
              return 'language-selector';
            } else if (id.includes('MenuManager')) {
              return 'menu-manager';
            }

            // 测试组件按类型分组
            // 先检查更具体的组件名称，避免字符串包含导致的错误匹配
            if (id.includes('SpaceClickTest')) {
              return 'space-click-test';
            } else if (id.includes('DoubleClickTest')) {
              return 'double-click-test';
            } else if (id.includes('TripleClickTest')) {
              return 'triple-click-test';
            } else if (id.includes('KohiClickTest')) {
              return 'kohi-click-test';
            } else if (id.includes('ClickTest')) {
              return 'click-test';
            } else if (id.includes('SpacebarClicker')) {
              return 'spacebar-clicker';
            } else if (id.includes('KeyboardTest')) {
              return 'keyboard-test';
            } else if (
              id.includes('ReactionTimeTest') ||
              id.includes('ColorReactionTest') ||
              id.includes('KeyReactionTest')
            ) {
              return 'reaction-tests';
            } else if (id.includes('TypingTest')) {
              return 'typing-tests';
            } else if (id.includes('MouseDragTest')) {
              return 'mouse-drag-test';
            } else if (id.includes('MouseScrollTest')) {
              return 'mouse-scroll-test';
            } else if (id.includes('TargetEliminationGame')) {
              return 'target-elimination-game';
            }
          }
        },
      },
      // 优化初始加载性能
      input: {
        main: path.resolve(__dirname, 'index.html'),
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
        // 可以添加PostCSS插件来进一步优化CSS
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
  // 优化资源加载
  optimizeDeps: {
    // 预构建依赖
    include: ['vue', 'vue-router', '@vueuse/head'],
    // 禁用自动依赖发现，提高构建速度
    force: false,
  },
});
