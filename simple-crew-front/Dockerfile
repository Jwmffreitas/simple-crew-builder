# Build frontend image with Node.js 20 (Debian for better native module support)
FROM node:20

# Set working directory
WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json* ./

# Increase npm timeout for reliability
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5173

# Run the frontend in dev mode for easy testing
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
