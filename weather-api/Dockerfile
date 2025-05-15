FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm@9
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]