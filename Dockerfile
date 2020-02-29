FROM arm32v6/node:10-alpine
WORKDIR /app
RUN apt-get install chromium-browser
COPY email.pug index.js package.json ./
RUN mkdir reports
RUN npm install
CMD ["npm", "start"]
