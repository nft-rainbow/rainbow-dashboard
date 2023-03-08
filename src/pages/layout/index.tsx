import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  UsergroupAddOutlined,
  CodeOutlined,
  MoneyCollectOutlined,
  AuditOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Dropdown, Space, Button, ConfigProvider } from 'antd';
import { SelectInfo } from 'rc-menu/lib/interface';
import { useAuth } from '../../router/Auth';
import { UserInfo } from '../../services/';
import "./layout.css";
const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    label,
    key,
    icon,
    children,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<Link to="/panels">仪表盘</Link>, '1', <DashboardOutlined />),
  getItem(<Link to="/panels/apps">我的项目</Link>, '2', <AppstoreOutlined />),
  getItem(<Link to="/panels/contracts">智能合约</Link>, '3', <AuditOutlined />),
  // getItem(<Link to="/panels/plan/list">发行计划</Link>, '300', <AuditOutlined />),
  getItem(<Link to="/panels/poaps">活动</Link>, '4', <AuditOutlined />),
  getItem(<Link to="/panels/metadata">元数据</Link>, '5', <NodeIndexOutlined />),
  getItem(<a href="https://docs.nftrainbow.xyz" target="_blank" rel="noreferrer">开发文档</a>, '6', <CodeOutlined />),
];

function menuKeyFromLocation(location: object): string {
  // @ts-ignore
  const pathname = location.pathname;
  if (pathname === '/panels') return '1';
  if (pathname.startsWith('/panels/apps')) return '2';
  if (pathname.startsWith('/panels/contracts')) return '3';
  if (pathname.startsWith('/panels/mint')) return '3';
  if (pathname.startsWith('/panels/plan')) return '300';
  if (pathname.startsWith('/panels/poaps')) return '4';
  if (pathname.startsWith('/panels/metadata')) return '5';
  return '1';
}

const App: React.FC = () => {
  const location = useLocation();

  const [selectedKeys, setSelectedKeys] = useState<string[]>([menuKeyFromLocation(location)]);
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState("/nftrainbow-logo-light.png");
  const auth = useAuth();
  const user = auth.user as UserInfo;

  const userMenuItems: MenuProps['items'] = [
    getItem(<Link to="/panels/userBalance">用户余额</Link>, '1', <MoneyCollectOutlined />),
    getItem(<Link to="/panels/mintCountByMonth">铸造量统计</Link>, '2', <LineChartOutlined />),
    getItem(<Link to="/panels/user">用户设置</Link>, '3', <UserOutlined />),
    getItem(<Link to="/panels/company">企业认证</Link>, '4', <UsergroupAddOutlined />),
    getItem(<span onClick={() => auth.signout(console.log)}>退出登录</span>, '5', <LogoutOutlined />),
  ];

  useEffect(() => {
    setLogo(collapsed ? "/nftrainbow-logo-icon.png" : "/nftrainbow-logo-light.png");
  }, [collapsed]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6953EF',
          colorLink: '#6953EF',
        },
      }}
    >
      <Layout id="rainbow-layout">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="logo">
            <img src={logo} alt='logo' />
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={['1']}
            mode="inline"
            items={items}
            selectedKeys={selectedKeys}
            onSelect={(opts: SelectInfo) => setSelectedKeys([opts.key])}
          />
        </Sider>
        <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200 }}>
          <Header className="bg-white" style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
            <div><MenuFoldOutlined style={{ fontSize: '20px' }} onClick={() => setCollapsed(!collapsed)} /></div>
            <div>
              <Dropdown menu={{ items: userMenuItems }}>
                <Button type='link' onClick={e => e.preventDefault()} href="#">
                  <Space>
                    {user.email}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: '16px 16px', display: 'flex' }}>
            <Outlet />
          </Content>
          <Footer className="site-layout-footer">©2022 NFTRainbow</Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
