import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import StakingProtocol from './components/StakingProtocol';
import RestakingEngine from './components/RestakingEngine';
import TokenBalances from './components/TokenBalances';
import WalletConnect from './components/WalletConnect';
import { WalletProvider } from './contexts/WalletContext';
import './index.css';
import './App.css';
// import MiniCard from './components/MiniCard';
// import { InputNumber, Button, message, Spin, Alert } from 'antd';
// import { getStakingData, getMockStakingData, parseAptAmount, parseTokenAmount, MODULE_NAMES, createTransactionPayload, isStakingProtocolInitialized, getRestakingData, getMockRestakingData } from './utils/aptosClient';
// import { useWallet } from './contexts/WalletContext';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '⇄' },
  { key: 'staking', label: 'Staking Protocol', icon: '🪙' },
  { key: 'restaking', label: 'Restaking Engine', icon: '⚙️' },
  { key: 'tokens', label: 'Token Balances', icon: '💰' },
];

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'staking':
        return <StakingProtocol />;
      case 'restaking':
        return <RestakingEngine />;
      case 'tokens':
        return <TokenBalances />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      {/* Top Navbar */}
      <div className="app-navbar">
        <span className="app-navbar-logo">Staking</span>
        {menuItems.map(item => (
          <button
          key={item.key}
          className={`app-navbar-btn transition-all duration-200 ease-in-out flex items-center px-4 py-2 rounded-md
            ${currentPage === item.key
              ? 'bg-green-600 text-white font-semibold shadow'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-black'}
          `}
          onClick={() => setCurrentPage(item.key)}
        >
          <span className="mr-2 text-lg">{item.icon}</span>
          {item.label}
        </button>
        
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <WalletConnect />
        </div>
      </div>
      {/* Main Content: Only render the selected page */}
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;
