import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  DashboardOutlined, 
  LockOutlined, 
  SwapOutlined, 
  WalletOutlined 
} from '@ant-design/icons'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/staking',
      icon: <LockOutlined />,
      label: 'Staking Protocol',
    },
    {
      key: '/restaking',
      icon: <SwapOutlined />,
      label: 'Restaking Engine',
    },
    {
      key: '/balances',
      icon: <WalletOutlined />,
      label: 'Token Balances',
    },
  ]

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
      }}
    />
  )
}

export default Navigation 