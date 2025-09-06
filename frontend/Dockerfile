FROM node:22

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install

COPY ./app.js ./

COPY ./public ./public

EXPOSE 8000

CMD ["node", "app.js"]