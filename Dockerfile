FROM node:10.16.0-jessie

ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /dotnet-chaty
COPY ./src/ /dotnet-chaty/src/
RUN mkdir /dotnet-chaty/data
RUN mkdir /dotnet-chaty/data/messages
RUN mkdir /dotnet-chaty/data/files

COPY ./config/config.json /dotnet-chaty/config/
COPY ./copy-static-assets.js /dotnet-chaty/
COPY ./package.json /dotnet-chaty/
COPY ./tsconfig.json /dotnet-chaty/

RUN npm install
RUN npm install --only=dev
RUN npm run build

CMD ["node", "/dotnet-chaty/dist/index.js"]
