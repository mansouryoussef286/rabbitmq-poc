FROM node:20-alpine AS development

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



# ----------------------------------------
# 2. BUILD STAGE (Compiles the code for the final production image)
# ----------------------------------------
FROM development AS builder

RUN npm run build


# ----------------------------------------
# 3. PRODUCTION STAGE (Used by docker-compose.prod.yml)
# ----------------------------------------
FROM node:20-alpine AS production

# Security Step 1: Create a non-root user and group
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
WORKDIR /usr/src/app

# Copy package.json/lock.json and install ONLY production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy ONLY the compiled code from the builder stage and env file
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY .env.prod /usr/src/app

# Security Step 2: Switch the running container process to the non-root user
USER nestjs

# The production startup command
CMD ["node", "dist/main"]