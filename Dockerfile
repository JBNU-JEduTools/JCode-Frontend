# 1단계: 빌드 단계
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 프로덕션 단계
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 파일 복사 (default.conf)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]