FROM node:20-alpine AS builder
WORKDIR /src
COPY application/frontend/package.json ./
RUN npm install
COPY application/frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY application/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist /usr/share/nginx/html
EXPOSE 80
