FROM node:16-alpine

ARG VITE_BASE_API_URL
ENV VITE_BASE_API_URL=${VITE_BASE_API_URL}

ARG VITE_RECAPTCHA_CLIENT_SECRET
ENV VITE_RECAPTCHA_CLIENT_SECRET=${VITE_RECAPTCHA_CLIENT_SECRET}

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install

COPY ./ /app

RUN yarn run build

EXPOSE 8080

CMD ["yarn", "run", "preview"]