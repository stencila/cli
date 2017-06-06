# Container for running Sibyl

FROM mhart/alpine-node

RUN apk update \
 && apk upgrade \
 && apk add bash curl docker jq \
 && rm -rf /var/cache/apk/*

RUN mkdir /usr/app 
WORKDIR /usr/app

COPY . .
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
