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
RUN /bin/sh -c "cat > /etc/nginx/conf.d/default.conf <<'EOF'\n\
server {\n\
  listen 80;\n\
  server_name _;\n\
\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  # 静态资源缓存（可按需调整）\n\
  location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {\n\
    expires 30d;\n\
    add_header Cache-Control \"public, max-age=2592000, immutable\";\n\
    try_files $uri =404;\n\
  }\n\
\n\
  # SPA 路由回退\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n\
EOF"

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


