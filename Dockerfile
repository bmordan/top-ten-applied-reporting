FROM arm32v6/node:alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
WORKDIR /app
RUN apk update
RUN apk add --no-cache chromium@3.10=~73.0.3683.103
COPY email.pug index.js package.json ./
RUN mkdir reports
RUN npm install
CMD ["npm", "start"]
