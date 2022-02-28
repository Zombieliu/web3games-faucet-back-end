#FROM node:fermium-alpine

FROM node:16.13.0

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN yarn

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]
