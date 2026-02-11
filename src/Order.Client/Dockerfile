FROM node:20-alpine
WORKDIR /app
COPY src/Order.Client/package.json ./
COPY src/Order.Client/package-lock.json ./
RUN npm install
COPY src/Order.Client/ ./
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
