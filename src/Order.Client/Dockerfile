FROM node:20-alpine AS build
WORKDIR /app
COPY src/Order.Client/package.json .
COPY src/Order.Client/package-lock.json .
RUN npm install
COPY src/Order.Client .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .
RUN rm /etc/nginx/conf.d/default.conf
COPY src/Order.Client/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]