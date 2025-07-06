import * as React from 'react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

interface WalletContextType {
  connected: boolean;
  account: any;
  wallet: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (payload: any) => Promise<any>;
}

const WalletContext = React.createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = React.useState(false);
  const [account, setAccount] = React.useState<any>(null);
  const [wallet, setWallet] = React.useState<any>(null);

  const connect = async () => {
    try {
      if (wallet) {
        await wallet.connect();
        const account = await wallet.account();
        console.log('Petra wallet account:', account);
        console.log('Account address:', account?.address);
        console.log('Account public key:', account?.publicKey);
        setAccount(account);
        setConnected(true);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      if (wallet) {
        await wallet.disconnect();
        setAccount(null);
        setConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  };

  const signAndSubmitTransaction = async (payload: any) => {
    try {
      if (!wallet || !connected) {
        throw new Error('Wallet not connected');
      }
      
      console.log('Signing transaction with payload:', payload);
      
      // Add transaction options for Petra wallet
      const transactionOptions = {
        max_gas_amount: "100000",
        gas_unit_price: "100",
        expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
      };
      
      const response = await wallet.signAndSubmitTransaction(payload, transactionOptions);
      console.log('Transaction response:', response);
      return response;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  React.useEffect(() => {
    const initWallet = async () => {
      try {
        const petraWallet = new PetraWallet();
        setWallet(petraWallet);
        
        // Check if already connected - Petra wallet doesn't have isConnected method
        // We'll check connection status when user tries to interact
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };

    initWallet();
  }, []);

  const value = {
    connected,
    account,
    wallet,
    connect,
    disconnect,
    signAndSubmitTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 