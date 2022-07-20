import React, { useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import "./layout.css";
import {
  PieChartOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Dropdown, Space, Button } from 'antd';
import { useAuth } from '../../Auth';
import { UserInfo } from '../../services/user';
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
  getItem(<Link to="/dashboard">Dashboard</Link>, '1', <PieChartOutlined />),
  getItem(<Link to="/dashboard/apps">Apps</Link>, '2', <AppstoreOutlined />),
  // getItem(<Link to="/dashboard/user">User</Link>, '3', <UserOutlined />),
  /* getItem(<Link to="/dashboard/user">User</Link>, 'sub1', <UserOutlined />, [
    getItem('Tom', '3'),
    getItem('Bill', '4'),
    getItem('Alex', '5'),
  ]), */
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const auth = useAuth();
  const user = auth.user as UserInfo;

  const userMenuItems: MenuItem[] = [
    getItem(<Link to="/dashboard/user">设置</Link>, '2', <SettingOutlined />),
    getItem('退出', '3', <LogoutOutlined />),
  ];

  const userMenu = <Menu items={userMenuItems}/>;

  return (
    <Layout id="rainbow-layout">
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout className="site-layout">
        <Header className="bg-white" style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
          <div><MenuFoldOutlined style={{fontSize: '20px'}} onClick={() => setCollapsed(!collapsed)}/></div>
          <div>
            <Dropdown overlay={userMenu}>
              <Button type='link' onClick={e => e.preventDefault()} href="#">
                <Space>
                  {user.email}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Outlet />
        </Content>
        <Footer className="site-layout-footer">©2022 NFTRainbow</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
