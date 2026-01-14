# Spacebar Clicker - CPSTestGo

Spacebar Clicker - CPSTestGo 是一个专业的点击速度与反应能力训练平台，提供多种测试项目，支持多语言，记录历史成绩，帮助用户训练和提高点击速度与反应能力。

## 主要功能

### 点击测试
- 单点击测试（1秒、2秒、5秒、10秒、15秒、30秒、60秒）
- 双击测试
- 三击测试
- Kohi点击测试
- 空格点击测试

### 反应测试
- 简单反应时间测试
- 颜色反应测试
- 按键反应测试

### 鼠标相关测试
- 鼠标拖动测试
- 鼠标滚动测试

### 键盘测试
- 键盘按键测试
- 打字测试（1分钟、3分钟、5分钟、10分钟、15分钟）

### 游戏类测试
- 目标消除游戏

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **国际化**: 自定义i18n方案
- **UI组件**: 自定义组件
- **样式**: CSS3
- **打包优化**: Vite Plugin Compression

## 安装和运行

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录中

### 预览生产构建

```bash
npm run preview
```

## 部署

### 静态部署

1. 构建生产版本：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录中的文件部署到任何静态网站托管服务，如：
   - GitHub Pages
   - Vercel
   - Netlify
   - 阿里云OSS
   - 腾讯云COS

### Nginx部署

1. 安装Nginx
2. 配置Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. 重启Nginx：
   ```bash
sudo systemctl restart nginx
```

## 项目结构

```
src/
├── assets/           # 静态资源
│   ├── flags/        # 国旗图标
│   └── icons/        # 功能图标
├── components/       # Vue组件
│   ├── Breadcrumb.vue               # 面包屑组件
│   ├── ClickTest.vue                # 单点击测试组件
│   ├── ColorReactionTest.vue        # 颜色反应测试组件
│   ├── CompareHistoryStyles.vue     # 历史记录比较样式组件
│   ├── DoubleClickTest.vue          # 双击测试组件
│   ├── FAQComponent.vue             # 通用FAQ组件
│   ├── HomePage.vue                 # 首页组件
│   ├── KeyboardTest.vue             # 键盘按键测试组件
│   ├── KeyReactionTest.vue          # 按键反应测试组件
│   ├── KohiClickTest.vue            # Kohi点击测试组件
│   ├── MouseDragTest.vue            # 鼠标拖动测试组件
│   ├── MouseScrollTest.vue          # 鼠标滚动测试组件
│   ├── NotFound.vue                 # 404页面组件
│   ├── PrivacyPolicy.vue            # 隐私政策组件
│   ├── ReactionTimeTest.vue         # 简单反应时间测试组件
│   ├── RelatedTests.vue             # 相关测试推荐组件
│   ├── ResultModal.vue              # 结果弹窗组件
│   ├── SpaceClickTest.vue           # 空格点击测试组件
│   ├── SpacebarClicker.vue          # 空格键点击器游戏组件
│   ├── TargetEliminationGame.vue    # 目标消除游戏组件
│   ├── TripleClickTest.vue          # 三击测试组件
│   └── TypingTest.vue               # 打字测试组件
├── data/             # 数据文件
├── i18n/             # 国际化配置
│   └── index.ts      # 多语言支持
├── router/           # 路由配置
│   └── index.ts      # 路由定义
├── utils/            # 工具函数
├── App.vue           # 根组件
├── main.ts           # 入口文件
└── style.css         # 全局样式

public/               # 公共静态资源
├── favicon.ico       # 网站图标
├── logo.png          # 网站Logo
├── robots.txt        # 搜索引擎爬虫配置
└── sitemap.xml       # 网站站点地图
```

## 多语言支持

当前支持以下语言：
- 简体中文 (zh-CN)
- 英语 (en)
- 日语 (ja)
- 韩语 (ko)

## SEO优化

- 已添加完整的meta标签
- Open Graph标签支持
- Schema.org结构化数据
- 生成了sitemap.xml
- 配置了robots.txt

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
