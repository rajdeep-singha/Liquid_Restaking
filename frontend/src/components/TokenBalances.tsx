import { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin} from 'antd';
import { WalletOutlined, BankOutlined, SwapOutlined, DollarOutlined } from '@ant-design/icons';
import { getUserData, getMockData } from '../utils/aptosClient';
import { useWallet } from '../contexts/WalletContext';
import '../App.css';

const TokenBalances: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { connected, account } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (connected && account?.address) {
          const realData = await getUserData(account.address);
          setData(realData);
        } else {
          setData(getMockData());
        }
      } catch {
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [connected, account?.address]);

  const tokenData = [
    {
      token: 'APT',
      symbol: 'APT',
      balance: data?.aptBalance || 0,
      usdValue: (data?.aptBalance || 0) * 8.5, // Mock APT price
      color: '#6366f1',
      icon: <WalletOutlined />
    },
    {
      token: 'Staked APT',
      symbol: 'stAPT',
      balance: data?.stakedBalance || 0,
      usdValue: (data?.stakedBalance || 0) * 8.5,
      color: '#10b981',
      icon: <BankOutlined />
    },
    {
      token: 'Restaked APT',
      symbol: 'rAPT',
      balance: data?.restakedBalance || 0,
      usdValue: (data?.restakedBalance || 0) * 8.5,
      color: '#f59e0b',
      icon: <SwapOutlined />
    }
  ];

  const totalValue = tokenData.reduce((sum, token) => sum + token.usdValue, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="main-content single-card-layout">
      <div className="retro-panel glowing-card" style={{ width: '100%', maxWidth: 900 }}>
        <div className="pixel-heading" style={{ textAlign: 'center', marginBottom: 32 }}>Token Balances</div>
        <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 32 }}>
          {tokenData.map((token) => (
            <Col xs={24} sm={12} md={8} key={token.symbol}>
              <Card className="stat-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, color: token.color, marginBottom: 8 }}>{token.icon}</div>
                <Statistic
                  title={token.token}
                  value={token.balance}
                  precision={2}
                  valueStyle={{ color: token.color }}
                  suffix={token.symbol}
                />
                <div style={{ marginTop: 8, color: '#888', fontSize: 16 }}>
                  ≈ ${(token.usdValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Card className="stat-card" style={{ display: 'inline-block', minWidth: 320 }}>
            <Statistic
              title="Total Portfolio Value"
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

export default TokenBalances; 