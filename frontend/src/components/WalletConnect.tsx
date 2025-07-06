import * as React from 'react';
import { Button, message } from 'antd';
import { WalletOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';

const WalletConnect: React.FC = () => {
  const { connected, account, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      message.success('Petra wallet connected successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      message.error('Failed to connect Petra wallet. Please make sure Petra wallet is installed.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      message.success('Petra wallet disconnected successfully!');
    } catch (error) {
      console.error('Disconnection error:', error);
      message.error('Failed to disconnect Petra wallet.');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (connected && account) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          fontSize: '0.875rem', 
          color: '#10b981',
          fontWeight: 500 
        }}>
          {formatAddress(account.address)}
        </span>
        <Button
          type="text"
          icon={<DisconnectOutlined />}
          onClick={handleDisconnect}
          size="small"
          className="wallet-connect-btn-disconnect"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="primary"
      icon={<WalletOutlined />}
      onClick={handleConnect}
      size="middle"
      className="wallet-connect-btn"
    >
      Connect Petra Wallet
    </Button>
  );
};

export default WalletConnect; 