FROM denoland/deno:alpine-1.23.3

WORKDIR /app

COPY ./src /app/src
COPY ./import_map.json /app/import_map.json

RUN deno cache --import-map=import_map.json /app/src/server.ts

COPY deno.json deno.json

CMD [ "task", "start" ]