FROM arm32v7/node
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
WORKDIR /app
RUN apt-get update
RUN apt-get install chromium-browser
COPY email.pug index.js package.json ./
RUN mkdir reports
RUN npm install
CMD ["npm", "start"]
