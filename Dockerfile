FROM node as client

RUN mkdir -p /home/node/app/client && chown -R node:node /home/node/app

USER node
WORKDIR /home/node/app/client

COPY client/package*/json ./

RUN npm intall

COPY client/ ./

RUN npm build


FROM node

RUN mkdir -p /home/node/app/server && chown -R node:node /home/node/app

USER node
WORKDIR /home/node/app

COPY --from=client /home/node/app/client/build ./client/build

WORKDIR /home/node/app/server

COPY server/package*.json ./

RUN npm install -qy

COPY server/ ./

EXPOSE 8080

CMD ["npm", "start"]