FROM node
WORKDIR /app
COPY . .
RUN npm i --production
CMD ["npm", "start"]