FROM node:22
WORKDIR /usr/src/app
COPY package.json ./

RUN npm install

COPY ./app/server/server.js ./server/
COPY ./app/server/request/*.js ./server
COPY ./app/util/*.js ./util/

COPY . .
EXPOSE 8000
CMD [ "npm", "start" ]
