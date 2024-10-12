FROM node:16

EXPOSE 4000

WORKDIR /app

COPY package.json /app

COPY . .

CMD [ "node", "server.js" ]