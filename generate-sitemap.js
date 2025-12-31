import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 支持的语言列表
const supportedLanguages = ['en', 'zh-CN', 'ja', 'ko'];

// 基础URL，根据实际情况修改
const baseUrl = 'https://www.cpstestgo.com';

// 定义各测试类型支持的时间参数
const supportedTimes = {
  '/click-test': [1, 2, 5, 10, 15, 30, 60],
  '/space-click-test': [1, 2, 5, 10, 15, 30, 60],
  '/typing-test': [1, 3, 5, 10, 15],
};

// 固定路由列表
const fixedRoutes = [
  '/',
  '/privacy-policy',
  '/kohi-click-test',
  '/reaction-time-test',
  '/color-reaction-test',
  '/key-reaction-test',
  '/target-elimination-game',
  '/mouse-scroll-test',
  '/mouse-drag-test',
  '/keyboard-test',
];

// 生成所有可能的路由
const generateAllRoutes = () => {
  const allRoutes = [];

  // 添加固定路由
  allRoutes.push(...fixedRoutes);

  // 添加带时间参数的测试路由
  for (const [routePrefix, times] of Object.entries(supportedTimes)) {
    times.forEach((time) => {
      allRoutes.push(`${routePrefix}/${time}`);
    });
  }

  return allRoutes;
};

// 生成sitemap.xml内容
const generateSitemap = () => {
  const allRoutes = generateAllRoutes();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // 为每个路由生成多语言版本
  allRoutes.forEach((route) => {
    // 为每个语言生成URL
    supportedLanguages.forEach((lang) => {
      let urlPath = route;

      // 非默认语言需要添加语言前缀
      if (lang !== 'en') {
        urlPath = `/${lang}${route === '/' ? '' : route}`;
      }

      sitemap += `  <url>
    <loc>${baseUrl}${urlPath}</loc>
`;

      // 为每个URL添加所有语言的alternate链接
      supportedLanguages.forEach((altLang) => {
        let altUrlPath = route;

        if (altLang !== 'en') {
          altUrlPath = `/${altLang}${route === '/' ? '' : route}`;
        }

        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altUrlPath}" />
`;
      });

      // 添加默认语言标记
      sitemap += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route}" />
`;

      // 添加最后修改时间（当前时间）
      const lastMod = new Date().toISOString().split('T')[0];
      sitemap += `    <lastmod>${lastMod}</lastmod>
`;

      // 添加优先级（根据路由深度设置）
      const pathSegments = urlPath.split('/').filter((segment) => segment !== '');
      const priority = Math.max(0.1, 1 - pathSegments.length * 0.1);
      sitemap += `    <priority>${priority.toFixed(1)}</priority>
`;

      sitemap += `  </url>
`;
    });
  });

  sitemap += `</urlset>`;

  return sitemap;
};

// 生成并保存sitemap.xml
const sitemapContent = generateSitemap();
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');

fs.writeFileSync(outputPath, sitemapContent, 'utf8');

console.log(`✅ Sitemap.xml generated successfully at ${outputPath}`);
console.log(`📊 Total URLs: ${generateAllRoutes().length * supportedLanguages.length}`);
