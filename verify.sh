#!/bin/bash
# Verify that the Website Change Monitor is working correctly

set -e

echo "🔍 Verifying Website Change Monitor Setup..."
echo ""

# Check if files exist
echo "✓ Checking project files..."
[ -f "package.json" ] || { echo "❌ package.json not found"; exit 1; }
[ -f "server.cjs" ] || { echo "❌ server.cjs not found"; exit 1; }
[ -f "docker-compose.yml" ] || { echo "❌ docker-compose.yml not found"; exit 1; }
[ -f "Dockerfile.backend" ] || { echo "❌ Dockerfile.backend not found"; exit 1; }
[ -f "Dockerfile.frontend" ] || { echo "❌ Dockerfile.frontend not found"; exit 1; }
echo "✓ All required files present"
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version $NODE_VERSION is below 18. Please upgrade."
else
    echo "✓ Node.js version: $(node --version)"
fi
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Run: npm install"
else
    echo "✓ Dependencies installed"
fi
echo ""

# Verify server syntax
echo "✓ Checking server.cjs syntax..."
node --check server.cjs || { echo "❌ Syntax error in server.cjs"; exit 1; }
echo "✓ server.cjs syntax valid"
echo ""

# Check if Docker is available
echo "✓ Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Install Docker to use docker-compose"
else
    echo "✓ Docker available: $(docker --version)"
fi
echo ""

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✓ Docker Compose available"
else
    echo "⚠️  Docker Compose not found"
fi
echo ""

# Run tests
echo "✓ Running tests..."
npm test -- --run --reporter=verbose || { echo "❌ Tests failed"; exit 1; }
echo ""

echo "✅ All verifications passed!"
echo ""
echo "To start the application:"
echo "  Docker:  docker-compose up --build"
echo "  Manual:  node server.cjs (terminal 1) && npm run dev (terminal 2)"
echo ""
echo "Then open: http://localhost:3000"
