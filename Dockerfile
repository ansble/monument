FROM node:8

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

ENV PORT=1337
EXPOSE 1337

WORKDIR /src
CMD ["npm", "test"]
