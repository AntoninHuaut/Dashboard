FROM denoland/deno:alpine-1.23.3

EXPOSE 8000

WORKDIR /app

ADD . .

RUN deno cache --import-map=./import_map.json ./src/server.ts

CMD [ "task", "start" ]