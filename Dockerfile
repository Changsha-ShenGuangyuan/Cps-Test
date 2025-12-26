#
# 生产镜像：Vite 构建产物(dist) + Nginx 静态托管（支持 vue-router history 模式）
#

FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖清单，利用 Docker 分层缓存
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 复制源码并构建
COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runner

# 覆盖默认站点配置：history 模式回退到 /index.html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


