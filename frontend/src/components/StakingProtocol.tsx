import { useState, useEffect } from 'react';
import MiniCard from './MiniCard';
import { InputNumber, Button, Spin } from 'antd';
import { getStakingData, getMockStakingData, parseAptAmount, parseTokenAmount, MODULE_NAMES, createTransactionPayload, isStakingProtocolInitialized } from '../utils/aptosClient';
import { useWallet } from '../contexts/WalletContext';
import '../App.css';

const StakingProtocol: React.FC = () => {
  const [stakingData, setStakingData] = useState<any>(null);
  const [stakingLoading, setStakingLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(50);
  const { connected, account, signAndSubmitTransaction } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      setStakingLoading(true);
      try {
        if (connected && account?.address) {
          const realData = await getStakingData(account.address);
          setStakingData(realData);
        } else {
          setStakingData(getMockStakingData());
        }
      } catch (error) {
        setStakingData(getMockStakingData());
      } finally {
        setStakingLoading(false);
      }
    };
    fetchData();
  }, [connected, account?.address]);

  // Debug logging for button states
  useEffect(() => {
    if (stakingData) {
      console.log('Staking Data:', stakingData);
      console.log('Unstake button disabled:', !connected || unstakeAmount <= 0 || unstakeAmount > (stakingData?.userStakedTokens || 0));
      console.log('Connected:', connected);
      console.log('Unstake amount:', unstakeAmount);
      console.log('User stAPT balance:', stakingData?.userStakedTokens);
    }
  }, [connected, unstakeAmount, stakingData]);

  const handleStake = async () => {
    if (!connected || !account?.address) return;
    try {
      const payload = createTransactionPayload(
        `${MODULE_NAMES.MOCK_STAKING}::stake_apt`,
        [],
        [parseAptAmount(stakeAmount).toString()]
      );
      await signAndSubmitTransaction(payload);
      setTimeout(() => window.location.reload(), 2000);
    } catch {}
  };
  const handleUnstake = async () => {
    if (!connected || !account?.address) return;
    if (unstakeAmount <= 0) {
      alert('Please enter a valid amount to unstake (greater than 0)');
      return;
    }
    if (unstakeAmount > (stakingData?.userStakedTokens || 0)) {
      alert('You cannot unstake more than your stAPT balance');
      return;
    }
    try {
      const payload = createTransactionPayload(
        `${MODULE_NAMES.MOCK_STAKING}::unstake_apt`,
        [],
        [parseTokenAmount(unstakeAmount).toString()]
      );
      await signAndSubmitTransaction(payload);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Unstaking failed:', error);
      alert('Unstaking failed. Please try again.');
    }
  };

  return (
    <div className="main-content single-card-layout">
      <div className="retro-panel glowing-card" style={{ width: '100%', maxWidth: 1100 }}>
        <div className="pixel-heading" style={{ textAlign: 'center', marginBottom: 32 }}>Token Balances</div>
        <div className="mini-card-container" style={{ justifyContent: 'center' }}>
          <MiniCard title="Stake (APT → stAPT)">
            {stakingLoading ? <Spin /> : <>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>Your APT Balance:</b> {stakingData?.userBalance || 0} APT</p>
                <p><b>Exchange Rate:</b> 1 APT = {stakingData?.exchangeRate || 1.0} stAPT</p>
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <label>Amount to Stake (APT):</label>
                <InputNumber
                  value={stakeAmount}
                  onChange={(value) => setStakeAmount(value || 1)}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  size="large"
                />
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>You will receive:</b> {(stakeAmount * (stakingData?.exchangeRate || 1.0)).toFixed(2)} stAPT</p>
              </div>
              <Button 
                type="primary" 
                onClick={handleStake}
                className="pixel-btn"
                size="large"
                style={{ width: '100%' }}
                disabled={!connected}
              >
                Stake
              </Button>
            </>}
          </MiniCard>
          <MiniCard title="Unstake (stAPT → APT)">
            {stakingLoading ? <Spin /> : <>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>Your stAPT Balance:</b> {stakingData?.userStakedTokens || 0} stAPT</p>
                <p><b>Exchange Rate:</b> 1 stAPT = {(1 / (stakingData?.exchangeRate || 1.0)).toFixed(4)} APT</p>
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <label>Amount to Unstake (stAPT):</label>
                <InputNumber
     value={unstakeAmount}
     onChange={(value) => setUnstakeAmount(value || 1)}
     min={1}
     max={stakingData?.userStakedTokens || 1}
     style={{ width: '100%', marginTop: '0.5rem' }}
     size="large"
   />
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>You will receive:</b> {(unstakeAmount * (1 / (stakingData?.exchangeRate || 1.0))).toFixed(2)} APT</p>
              </div>
              <Button 
                type="primary"
                onClick={handleUnstake}
                className="pixel-btn"
                size="large"
                style={{ width: '100%' }}
                disabled={!connected || unstakeAmount <= 0 || unstakeAmount > (stakingData?.userStakedTokens || 0)}
              >
                Unstake
              </Button>
              {!connected && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Wallet not connected</p>}
              {unstakeAmount <= 0 && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Amount must be greater than 0</p>}
              {unstakeAmount > (stakingData?.userStakedTokens || 0) && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Insufficient stAPT balance</p>}
            </>}
          </MiniCard>
        </div>
      </div>
    </div>
  );
};

export default StakingProtocol; 