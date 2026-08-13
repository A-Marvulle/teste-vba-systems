FROM node:22-alpine AS dev
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 80
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "80"]

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
