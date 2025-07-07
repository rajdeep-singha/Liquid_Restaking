# Aptos Liquid Restaking Frontend
![Screenshot 2025-07-06 110200](https://github.com/user-attachments/assets/8ab518ec-a638-4d74-8d52-d19be1e82030)

A modern React/Vite frontend for the Aptos Liquid Restaking Protocol. This application provides a user-friendly interface for staking APT tokens, restaking staked tokens, and managing token balances.

## Features

- 🔐 **Wallet Integration**: Support for multiple Aptos wallets (Petra, Martian, Nightly, Pontem, Fewcha, MSafe, OpenBlock, Tria, Rise)
- 📊 **Dashboard**: Overview of protocol statistics and user positions
- 🏦 **Staking Protocol**: Stake APT tokens to receive staked tokens (sTKN)
- 🔄 **Restaking Engine**: Restake sTKN tokens to receive liquid restaking tokens (rsTKN)
- 💰 **Token Balances**: Comprehensive view of all token balances and portfolio distribution
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Automatic refresh of data every 10 seconds

![Screenshot 2025-07-06 105923](https://github.com/user-attachments/assets/05a9a40a-c5e5-4aed-a4d5-715cf68383a7)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Ant Design** - UI component library
- **Aptos Wallet Adapter** - Wallet integration
- **React Router** - Navigation

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- An Aptos wallet (Petra, Martian, etc.)

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure the contract address:
   - Open `src/utils/aptosClient.ts`
   - Update the `CONTRACT_ADDRESS` constant with your deployed contract address

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### 1. Connect Wallet
- Click the wallet selector in the top-right corner
- Choose your preferred Aptos wallet
- Connect your wallet to the application

### 2. Register for Protocols
- Navigate to the Staking Protocol or Restaking Engine
- Click "Register for [Protocol]" to enable staking/restaking functionality

### 3. Stake APT Tokens
- Go to the Staking Protocol page
- Enter the amount of APT you want to stake
- Click "Stake APT" to receive staked tokens (sTKN)

### 4. Restake sTKN Tokens
- Go to the Restaking Engine page
- Enter the amount of sTKN you want to restake
- Click "Restake sTKN" to receive liquid restaking tokens (rsTKN)

### 5. Monitor Balances
- Visit the Token Balances page to see all your token holdings
- View portfolio distribution and protocol statistics

## Contract Integration

The frontend integrates with the following Move modules:

- `mock_staking_protocol` - Handles APT staking and sTKN minting
- `restaking_engine` - Handles sTKN restaking and rsTKN minting
- `staked_token` - sTKN token implementation
- `restaked_token` - rsTKN token implementation

### Key Functions

#### Staking Protocol
- `register_user()` - Register for staking protocol
- `stake_apt(amount)` - Stake APT for sTKN
- `unstake_apt(amount)` - Unstake sTKN for APT

#### Restaking Engine
- `register_user()` - Register for restaking engine
- `restake_tokens(amount)` - Restake sTKN for rsTKN
- `unstake_tokens(amount)` - Unstake rsTKN for sTKN

#### View Functions
- `get_total_staked()` - Get total APT staked
- `get_user_stake(address)` - Get user's APT stake
- `get_exchange_rate()` - Get current exchange rate
- `get_total_restaked()` - Get total sTKN restaked
- `get_user_restake(address)` - Get user's sTKN restake

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xyour_contract_address_here
```

### Network Configuration

The application is configured for Aptos mainnet by default. To use testnet:

1. Update the node URL in `src/utils/aptosClient.ts`
2. Deploy your contracts to testnet
3. Update the contract address

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── StakingProtocol.tsx    # APT staking interface
│   │   ├── RestakingEngine.tsx    # sTKN restaking interface
│   │   ├── TokenBalances.tsx      # Balance overview
│   │   └── Navigation.tsx         # Navigation menu
│   ├── utils/
│   │   └── aptosClient.ts         # Aptos blockchain integration
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # App entry point
│   └── index.css                  # Global styles
├── package.json
├── vite.config.ts
└── README.md
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure your wallet extension is installed and unlocked
   - Try refreshing the page
   - Check if you're on the correct network (mainnet/testnet)

2. **Transaction Failed**
   - Check your APT balance for gas fees
   - Ensure you have sufficient token balances
   - Verify you're registered for the protocol

3. **Data Not Loading**
   - Check your internet connection
   - Verify the contract address is correct
   - Ensure the contracts are deployed and initialized

### Error Messages

- `E_NOT_ADMIN` - Only admin can perform this action
- `E_INSUFFICIENT_BALANCE` - Insufficient token balance
- `E_ZERO_AMOUNT` - Amount must be greater than zero
- `E_NOT_REGISTERED` - User not registered for protocol

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [Aptos documentation](https://aptos.dev/)
- Review the contract documentation in `PROTOCOL_DOCS.md`
- Open an issue in the repository
