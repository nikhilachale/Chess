# Chess Game

A real-time multiplayer chess game built with Next.js, WebSocket, and Docker.

## 🚀 Live Demo

**Play Now:** [https://chesss.thecabbro.com/](https://chesss.thecabbro.com/)

## 📸 Screenshots

### Landing Page & Room Selection
![Landing Page](screenshots/landing-page.png)
*Create or join game rooms with elegant chess-themed UI*

### Game Interface
![Game Interface](screenshots/game-interface.png)
*Real-time chess gameplay with AI suggestions and move history*

## Features

- ✅ Real-time multiplayer chess gameplay
- ✅ WebSocket communication for instant moves  
- ✅ AI-powered move suggestions with scoring
- ✅ Live move history tracking
- ✅ Elegant chess-themed UI with floating pieces
- ✅ Room-based multiplayer system
- ✅ Docker containerization for easy deployment
- ✅ Modern responsive design
- ✅ Complete chess rule implementation including castling, en passant, and promotion
- ✅ Game state management with move validation

## Quick Start with Docker

The easiest way to run the chess game is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd chess

# Start the application with Docker Compose
docker-compose up --build

# Access the game at http://localhost:3000
# WebSocket server runs on ws://localhost:8080
```

## What's inside?

This monorepo includes the following packages/apps:

### Apps and Packages

- `ui`: Next.js chess game frontend
- `socket`: WebSocket server for real-time communication
- `backend`: Express.js backend server
- `@repo/chess`: Shared chess game logic and types
- `@repo/ui`: Shared React component library
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configurations

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Setup Options

### Option 1: Try the Live Demo (Quickest)

Just visit: **[https://chesss.thecabbro.com/](https://chesss.thecabbro.com/)** - No installation required!

### Option 2: Docker Compose (Recommended for Local Development)

The fastest way to get started:

```bash
# Make sure you have Docker and Docker Compose installed
docker --version
docker-compose --version

# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

**Services:**
- UI: http://localhost:3000 (Next.js frontend)
- WebSocket: ws://localhost:8080 (Real-time communication)

### Option 3: Manual Docker Build

Build and run containers individually:

```bash
# Build UI container
docker build -f docker/Dockerfile.ui -t chess-ui .

# Build WebSocket container  
docker build -f docker/Dockerfile.ws -t chess-ws .

# Run WebSocket server first
docker run -p 8080:8080 chess-ws

# Run UI (in another terminal)
docker run -p 3000:3000 -e NEXT_PUBLIC_WS_URL=ws://localhost:8080 chess-ui
```

### Option 4: Local Development

For development with hot reload:

```bash
# Install dependencies
pnpm install

# Start WebSocket server
pnpm dev --filter=socket

# Start UI (in another terminal)
pnpm dev --filter=ui

# Or start all services
pnpm dev
```

### Build

To build all apps and packages:

```bash
# With Turborepo
turbo build

# With pnpm
pnpm build

# Build specific package
turbo build --filter=ui
pnpm build --filter=socket
```

## Environment Configuration

Create a `.env` file in the root directory:

```bash
# WebSocket URL for the frontend
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## How to Play

1. **Visit the live demo** at [https://chesss.thecabbro.com/](https://chesss.thecabbro.com/) or start locally using any setup option above
2. **Create or join a game room** - the first player creates a room, the second player joins
3. **Play chess!** - Click on pieces to select them, then click on valid squares to move
4. **Use AI suggestions** - Click the "Suggest Move" button for AI-powered move recommendations
5. **Real-time updates** - Both players see moves instantly via WebSocket connection

## Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Next.js UI    │◄──────────────►│  WebSocket      │
│   (Port 3000)   │                 │  Server         │
│                 │                 │  (Port 8080)    │
│  - Game Board   │                 │  - Room Mgmt    │
│  - Move Input   │                 │  - Move Sync    │
│  - Player UI    │                 │  - Game Logic   │
└─────────────────┘                 └─────────────────┘
```

## Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker & Docker Compose (for containerized setup)

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Build for production
pnpm build
```

## Docker Configuration

The project includes two Dockerfiles for containerization:

### UI Container (`docker/Dockerfile.ui`)
- Multi-stage build for optimized production image
- Next.js standalone output for minimal container size
- Alpine Linux base for security and size
- Handles CSS processing with LightningCSS fallbacks

### WebSocket Container (`docker/Dockerfile.ws`)
- TypeScript compilation and Node.js runtime
- Optimized for WebSocket server performance
- Minimal Alpine Linux image

### Docker Compose
The `docker-compose.yml` orchestrates both services:
- Automatic service dependencies
- Environment variable injection
- Port mapping and networking
- Health checks and restart policies

## Project Structure

```
chess/
├── apps/
│   ├── ui/                 # Next.js frontend
│   ├── socket/            # WebSocket server  
│   └── backend/           # Express backend
├── packages/
│   ├── Chess/             # Game logic library
│   ├── ui/                # Shared components
│   └── typescript-config/ # Shared configs
├── docker/
│   ├── Dockerfile.ui      # UI container
│   └── Dockerfile.ws      # WebSocket container
├── docker-compose.yml     # Service orchestration
└── .env                   # Environment variables
```

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :8080

# Kill processes if needed
kill -9 <PID>
```

**Docker issues:**
```bash
# Clean up containers and images
docker-compose down --volumes --rmi all

# Rebuild with no cache
docker-compose build --no-cache
```

**CSS not loading in Docker:**
- The build includes fallback CSS for Docker compatibility
- LightningCSS is disabled in containerized builds

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs ui
docker-compose logs ws

# Follow logs in real-time
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `pnpm dev` and `docker-compose up`
5. Submit a pull request

### Contributing Screenshots

Help improve the documentation by adding screenshots:
1. Visit the live demo at [https://chesss.thecabbro.com/](https://chesss.thecabbro.com/)
2. Take high-quality screenshots (see `screenshots/README.md` for guidelines)
3. Add them to the `screenshots/` directory
4. Submit a pull request

## Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Node.js, WebSocket (ws)
- **Game Logic**: TypeScript chess engine
- **Build**: Turborepo, pnpm
- **Deployment**: Docker, Docker Compose
- **Styling**: Tailwind CSS v4 with LightningCSS
# Chess
