FROM node:23-alpine3.21

WORKDIR /home/app/s3rver

COPY . .

RUN npm i -g pnpm

RUN pnpm install

CMD ["pnpm", "run", "dev"]