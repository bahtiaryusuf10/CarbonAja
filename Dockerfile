FROM node:16-slim
WORKDIR /src/app
ENV PORT 8080
ENV HOST 0.0.0.0
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start"]