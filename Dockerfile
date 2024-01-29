FROM --platform=linux/amd64 node:14.13.1-alpine3.10 AS ui-build

WORKDIR /usr/src/client
COPY client/ ./
RUN npm -q install && npm run build

FROM --platform=linux/amd64 node:14.13.1-alpine3.10

# General environment config
ENV HOME /home/superbowl-boxes-v2
ENV NODE_ENV production
WORKDIR $HOME

COPY --from=ui-build /usr/src/client/build ./client/build
# We flatten the directory so that server.js is at /home/superbowl-boxes-v2/server.js
COPY api/ ./

RUN npm -q install

CMD ["node", "./index.js"]
