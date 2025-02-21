# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and config files
COPY package*.json ./
COPY postcss.config.cjs ./
COPY tailwind.config.cjs ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
