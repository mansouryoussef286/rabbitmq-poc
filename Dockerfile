FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# This typically uses ts-node and a file watcher (like nodemon) for hot-reloading.
CMD ["npm", "run", "start:dev"]

# to build the image run:
# 	docker build .
# for publishing the image to docker hub, first tag it:
# 	docker build -t your-dockerhub-username/your-api-name:latest .
# 	then push it:
# 		docker push your-dockerhub-username/your-api-name:latest