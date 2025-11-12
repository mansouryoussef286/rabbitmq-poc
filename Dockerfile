FROM node:20-alpine as dev

WORKDIR /app

# Copy only package files first for caching deps
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy the rest of the code
COPY . .

# # Expose NestJS port
# EXPOSE 3000

# # Run in watch mode
# CMD ["npm", "run", "start"]
