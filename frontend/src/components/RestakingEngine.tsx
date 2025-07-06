import { useState, useEffect } from 'react';
import MiniCard from './MiniCard';
import { InputNumber, Button, Spin } from 'antd';
import { getRestakingData, getMockRestakingData, parseTokenAmount, MODULE_NAMES, createTransactionPayload } from '../utils/aptosClient';
import { useWallet } from '../contexts/WalletContext';
import '../App.css';

const RestakingEngine: React.FC = () => {
  const [restakingData, setRestakingData] = useState<any>(null);
  const [restakingLoading, setRestakingLoading] = useState(true);
  const [restakeAmount, setRestakeAmount] = useState<number>(50);
  const [unrestakeAmount, setUnrestakeAmount] = useState<number>(25);
  const { connected, account, signAndSubmitTransaction } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      setRestakingLoading(true);
      try {
        if (connected && account?.address) {
          const realData = await getRestakingData(account.address);
          setRestakingData(realData);
        } else {
          setRestakingData(getMockRestakingData());
        }
      } catch (error) {
        setRestakingData(getMockRestakingData());
      } finally {
        setRestakingLoading(false);
      }
    };
    fetchData();
  }, [connected, account?.address]);

  const handleRestake = async () => {
    if (!connected || !account?.address) return;
    if (restakeAmount <= 0) {
      alert('Please enter a valid amount to restake (greater than 0)');
      return;
    }
    if (restakeAmount > (restakingData?.userStakedBalance || 0)) {
      alert('You cannot restake more than your stAPT balance');
      return;
    }
    try {
      const payload = createTransactionPayload(
        `${MODULE_NAMES.RESTAKING_ENGINE}::restake_tokens`,
        [],
        [parseTokenAmount(restakeAmount).toString()]
      );
      await signAndSubmitTransaction(payload);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Restaking failed:', error);
      alert('Restaking failed. Please try again.');
    }
  };

  // Debug logging for button states
  useEffect(() => {
    if (restakingData) {
      console.log('Restaking Data:', restakingData);
      console.log('Restake button disabled:', !connected || restakeAmount <= 0 || restakeAmount > (restakingData?.userStakedBalance || 0));
      console.log('Unrestake button disabled:', !connected || unrestakeAmount <= 0 || unrestakeAmount > (restakingData?.userRestakedTokens || 0));
      console.log('Connected:', connected);
      console.log('Restake amount:', restakeAmount);
      console.log('Unrestake amount:', unrestakeAmount);
      console.log('User stAPT balance:', restakingData?.userStakedBalance);
      console.log('User rAPT balance:', restakingData?.userRestakedTokens);
    }
  }, [connected, restakeAmount, unrestakeAmount, restakingData]);

  const handleUnrestake = async () => {
    if (!connected || !account?.address) return;
    if (unrestakeAmount <= 0) {
      alert('Please enter a valid amount to unrestake (greater than 0)');
      return;
    }
    if (unrestakeAmount > (restakingData?.userRestakedTokens || 0)) {
      alert('You cannot unrestake more than your rAPT balance');
      return;
    }
    try {
      const payload = createTransactionPayload(
        `${MODULE_NAMES.RESTAKING_ENGINE}::unstake_tokens`,
        [],
        [parseTokenAmount(unrestakeAmount).toString()]
      );
      await signAndSubmitTransaction(payload);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Unrestaking failed:', error);
      alert('Unrestaking failed. Please try again.');
    }
  };

  return (
    <div className="main-content single-card-layout">
      <div className="retro-panel glowing-card" style={{ width: '100%', maxWidth: 1100 }}>
        <div className="pixel-heading" style={{ textAlign: 'center', marginBottom: 32 }}>Restaking</div>
        <div className="mini-card-container" style={{ justifyContent: 'center' }}>
          <MiniCard title="Restake (stAPT → rAPT)">
            {restakingLoading ? <Spin /> : <>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>Your stAPT Balance:</b> {restakingData?.userStakedBalance || 0} stAPT</p>
                <p><b>Exchange Rate:</b> 1 stAPT = {restakingData?.exchangeRate || 1.0} rAPT</p>
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <label>Amount to Restake (stAPT):</label>
                <InputNumber
                  value={restakeAmount}
                  onChange={(value) => setRestakeAmount(value || 1)}
                  min={1}
                  max={restakingData?.userStakedBalance || 1}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  size="large"
                />
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>You will receive:</b> {(restakeAmount * (restakingData?.exchangeRate || 1.0)).toFixed(2)} rAPT</p>
              </div>
              <Button 
                type="primary" 
                onClick={handleRestake}
                className="pixel-btn"
                size="large"
                style={{ width: '100%' }}
                disabled={!connected || restakeAmount <= 0 || restakeAmount > (restakingData?.userStakedBalance || 0)}
              >
                Restake
              </Button>
              {!connected && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Wallet not connected</p>}
              {restakeAmount <= 0 && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Amount must be greater than 0</p>}
              {restakeAmount > (restakingData?.userStakedBalance || 0) && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Insufficient stAPT balance</p>}
            </>}
          </MiniCard>
          <MiniCard title="Unrestake (rAPT → stAPT)">
            {restakingLoading ? <Spin /> : <>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>Your rAPT Balance:</b> {restakingData?.userRestakedTokens || 0} rAPT</p>
                <p><b>Exchange Rate:</b> 1 rAPT = {(1 / (restakingData?.exchangeRate || 1.0)).toFixed(4)} stAPT</p>
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <label>Amount to Unrestake (rAPT):</label>
                <InputNumber
                  value={unrestakeAmount}
                  onChange={(value) => setUnrestakeAmount(value || 1)}
                  min={1}
                  max={restakingData?.userRestakedTokens || 1}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  size="large"
                />
              </div>
              <div style={{ marginBottom: '1rem', width: '100%' }}>
                <p><b>You will receive:</b> {(unrestakeAmount * (1 / (restakingData?.exchangeRate || 1.0))).toFixed(2)} stAPT</p>
              </div>
              <Button 
                type="primary"
                onClick={handleUnrestake}
                className="pixel-btn"
                size="large"
                style={{ width: '100%' }}
                disabled={!connected || unrestakeAmount <= 0 || unrestakeAmount > (restakingData?.userRestakedTokens || 0)}
              >
                Unrestake
              </Button>
              {!connected && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Wallet not connected</p>}
              {unrestakeAmount <= 0 && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Amount must be greater than 0</p>}
              {unrestakeAmount > (restakingData?.userRestakedTokens || 0) && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>⚠️ Insufficient rAPT balance</p>}
            </>}
          </MiniCard>
        </div>
      </div>
    </div>
  );
};

export default RestakingEngine; 