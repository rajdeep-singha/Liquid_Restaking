# Frontend Deployment Guide

This guide will help you deploy the Aptos Liquid Restaking Frontend to production.

## Prerequisites

1. **Deploy your contracts first**
   - Follow the contract deployment instructions in the main README
   - Note down your contract address

2. **Set up environment variables**
   - Create a `.env` file in the frontend directory
   - Add your contract address and network configuration

## Environment Setup

Create a `.env` file in the frontend directory:

```env
# Production (Mainnet)
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xyour_deployed_contract_address_here

# Testnet (for testing)
# VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
# VITE_CONTRACT_ADDRESS=0xyour_testnet_contract_address_here
```

## Build and Deploy

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build for Production

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

### 3. Deploy Options

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Follow the prompts to connect your repository

#### Option B: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages

1. Add to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Deploy:
```bash
npm run deploy
```

#### Option D: Traditional Web Server

1. Upload the contents of the `dist` folder to your web server
2. Configure your server to serve `index.html` for all routes
3. Ensure CORS is properly configured

## Configuration for Different Networks

### Mainnet
```env
VITE_APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xyour_mainnet_contract
```

### Testnet
```env
VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xyour_testnet_contract
```

### Devnet
```env
VITE_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
VITE_CONTRACT_ADDRESS=0xyour_devnet_contract
```

## Post-Deployment Checklist

- [ ] Verify wallet connection works
- [ ] Test staking functionality
- [ ] Test restaking functionality
- [ ] Verify token balances display correctly
- [ ] Test on mobile devices
- [ ] Check console for any errors
- [ ] Verify all transactions complete successfully

## Troubleshooting

### Common Issues

1. **Contract Address Not Found**
   - Verify the contract address is correct
   - Ensure contracts are deployed and initialized
   - Check network configuration

2. **Wallet Connection Issues**
   - Ensure users have compatible wallets installed
   - Check if the site is served over HTTPS (required for wallet connections)

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors: `npm run build`

4. **Runtime Errors**
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use environment variables for sensitive configuration

2. **HTTPS**
   - Always serve the frontend over HTTPS in production
   - Wallet connections require secure context

3. **CORS**
   - Configure CORS properly if needed
   - Ensure API endpoints are accessible

## Monitoring

1. **Error Tracking**
   - Consider adding error tracking (Sentry, LogRocket, etc.)
   - Monitor console errors in production

2. **Analytics**
   - Add analytics to track user interactions
   - Monitor transaction success rates

3. **Performance**
   - Monitor page load times
   - Track API response times

## Updates and Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities

2. **Contract Updates**
   - Update contract address when deploying new versions
   - Test thoroughly before updating production

3. **User Communication**
   - Notify users of maintenance windows
   - Provide clear error messages for common issues 