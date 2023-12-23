FROM node:16-slim
WORKDIR /src/app
ENV PORT 5000
ENV HOST 0.0.0.0
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "npm", "start"]
