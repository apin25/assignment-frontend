FROM node:20 AS build-stage

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

ARG VITE_BE_POST_URL
ARG VITE_BE_AUTH_URL

ENV VITE_BE_POST_URL=$VITE_BE_POST_URL
ENV VITE_BE_AUTH_URL=$VITE_BE_AUTH_URL

RUN pnpm install --frozen-lockfile

COPY . .

RUN echo "VITE_BE_POST_URL=$VITE_BE_POST_URL" > .env.production && \
    echo "VITE_BE_AUTH_URL=$VITE_BE_AUTH_URL" >> .env.production

RUN pnpm run build-only

FROM nginx:alpine AS production-stage

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY k8s/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]