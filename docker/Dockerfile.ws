FROM node:22-alpine

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install both npm (latest) and pnpm globally
RUN npm install -g npm@11.6.2 pnpm@9.12.0

# Copy full repo
COPY . .

# Install dependencies from root to resolve all workspaces
RUN pnpm install --frozen-lockfile

# Move to socket app
WORKDIR /app/apps/socket

# Build the TypeScript app
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 8080

# Start the app
CMD ["pnpm", "start"]
