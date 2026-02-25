FROM node:20-alpine AS build
WORKDIR /app
COPY src/Todo.Client/package.json .
COPY src/Todo.Client/package-lock.json .
RUN npm install
COPY src/Todo.Client .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/dist .
RUN rm /etc/nginx/conf.d/default.conf
COPY src/Todo.Client/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]