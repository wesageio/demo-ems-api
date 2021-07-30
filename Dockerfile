FROM node:12.18.1-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
ENV GENERATE_SOURCEMAP false
RUN npm run build

FROM node:12.18.1-alpine
WORKDIR /app
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/dist ./dist
RUN npm i --production
CMD ["node", "./dist/main.js"]
