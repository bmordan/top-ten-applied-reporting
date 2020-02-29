FROM arm32v6/node:alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
WORKDIR /app
RUN apk update
RUN apk add chromium
COPY email.pug index.js package.json ./
RUN mkdir reports
RUN npm install
CMD ["npm", "start"]
