FROM node:22-alpine AS builder

RUN mkdir -p /usr/src/weather_front

WORKDIR /usr/src/weather_front

COPY package.json package.json

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS production
ENV NODE_ENV production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /usr/src/weather_front/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
