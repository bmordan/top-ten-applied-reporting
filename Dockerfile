FROM arm32v6/node:10-alpine
WORKDIR /app
RUN apk update
RUN apk add chromium
COPY email.pug index.js package.json ./
RUN mkdir reports
RUN npm install
CMD ["npm", "start"]
