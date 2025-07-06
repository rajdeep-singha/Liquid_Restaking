import { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin, Alert } from 'antd';
import { WalletOutlined, BankOutlined, SwapOutlined, DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { getUserData, getMockData, getStakingProtocolData, getRestakingEngineData } from '../utils/aptosClient';
import { useWallet } from '../contexts/WalletContext';
import '../App.css';

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [protocolStats, setProtocolStats] = useState<any>(null);
  const [restakingStats, setRestakingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connected, account } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let user, staking, restaking;
        if (connected && account?.address) {
          user = await getUserData(account.address);
          staking = await getStakingProtocolData();
          restaking = await getRestakingEngineData();
          setUserData(user);
          setProtocolStats(staking);
          setRestakingStats(restaking);
        } else {
          user = getMockData();
          staking = { totalStaked: 1250000, exchangeRate: 1.0 };
          restaking = { totalRestaked: 750000, exchangeRate: 1.0 };
          setUserData(user);
          setProtocolStats(staking);
          setRestakingStats(restaking);
        }
      } catch (e) {
        if (connected && account?.address) {
          setError('Failed to fetch data from the blockchain. Please try again or check your connection.');
        } else {
          setUserData(getMockData());
          setProtocolStats({ totalStaked: 1250000, exchangeRate: 1.0 });
          setRestakingStats({ totalRestaked: 750000, exchangeRate: 1.0 });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [connected, account?.address]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  const totalValue = ((userData?.aptBalance || 0) + (userData?.stakedBalance || 0) + (userData?.restakedBalance || 0)) * 8.5;

  return (
    <div className="main-content single-card-layout">
      <div className="retro-panel glowing-card" style={{ width: '100%', maxWidth: 1100 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="pixel-heading" style={{ fontSize: 32, color: '#222', marginBottom: 12 }}>Welcome to Staking Pro!</h1>
          <p style={{ fontSize: 18, color: '#444', marginBottom: 0 }}>
            The playful, retro liquid restaking protocol on Aptos.<br/>
            Stake, restake, and manage your assets with a vintage twist!
          </p>
        </div>
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Total Value Locked"
                value={protocolStats?.totalStaked || 0}
                prefix={<DollarOutlined />}
                suffix="APT"
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Total Restaked"
                value={restakingStats?.totalRestaked || 0}
                prefix={<SwapOutlined />}
                suffix="stAPT"
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Exchange Rate"
                value={protocolStats?.exchangeRate || 1.0}
                prefix={<PercentageOutlined />}
                suffix="x"
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Your APT Balance"
                value={userData?.aptBalance || 0}
                prefix={<WalletOutlined />}
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Your stAPT Balance"
                value={userData?.stakedBalance || 0}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <Statistic
                title="Your rAPT Balance"
                value={userData?.restakedBalance || 0}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Card className="stat-card" style={{ display: 'inline-block', minWidth: 320 }}>
            <Statistic
              title="Your Total Portfolio Value"
              value={totalValue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#222' }}
              suffix="USD (est.)"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
