#!/bin/bash

# Aptos Liquid Restaking Frontend Setup Script

echo "🚀 Setting up Aptos Liquid Restaking Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Aptos Network Configuration
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xliq_restaking

# For testnet, use:
# VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
# VITE_CONTRACT_ADDRESS=0xyour_testnet_contract_address
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please update the CONTRACT_ADDRESS in .env with your deployed contract address"
else
    echo "✅ .env file already exists"
fi

# Check if contract address is set
if grep -q "0xliq_restaking" .env; then
    echo "⚠️  Warning: Contract address is still set to default value"
    echo "   Please update VITE_CONTRACT_ADDRESS in .env with your deployed contract address"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the CONTRACT_ADDRESS in .env with your deployed contract address"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md" 