import React, { useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    DashboardOutlined, AppstoreOutlined, MenuFoldOutlined, DownOutlined, 
    UserOutlined, LogoutOutlined, UsergroupAddOutlined,
    CodeOutlined, MoneyCollectOutlined, AuditOutlined,
    LineChartOutlined, NodeIndexOutlined, RobotOutlined,
    RocketOutlined, OrderedListOutlined, ReconciliationOutlined, 
    GlobalOutlined, 
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { 
    Layout, Menu, Dropdown, Space, Button,
    ConfigProvider,
} from 'antd';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/zh_CN';
import { SelectInfo } from 'rc-menu/lib/interface';
import { useAuth } from '@router/Auth';
import { UserInfo } from '@services/index';
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
    getItem(<Link to="/panels/poaps">NFT活动</Link>, '4', <RocketOutlined />),
    getItem(<Link to="/panels/whitelist">凭证策略</Link>, '5', <OrderedListOutlined />),
    getItem(<Link to="/panels/socialBot">社群Bot</Link>, '6', <RobotOutlined />),
    getItem(<Link to="/panels/metadata">元数据</Link>, '7', <NodeIndexOutlined />),
    getItem(<Link to="/panels/web3Service">Web3服务</Link>, '8', <GlobalOutlined />),
    getItem(<a href="https://docs.nftrainbow.xyz" target="_blank" rel="noreferrer">开发文档</a>, '100', <CodeOutlined />),
];

function menuKeyFromLocation(location: object): string {
    // @ts-ignore
    const pathname = location.pathname;
    if (pathname === '/panels') return '1';
    if (pathname.startsWith('/panels/apps')) return '2';
    if (pathname.startsWith('/panels/contracts')) return '3';
    if (pathname.startsWith('/panels/mint')) return '3';
    if (pathname.startsWith('/panels/poaps')) return '4';
    if (pathname.startsWith('/panels/whitelist')) return '5';
    if (pathname.startsWith('/panels/socialBot')) return '6';
    if (pathname.startsWith('/panels/metadata')) return '7';
    if (pathname.startsWith('/panels/web3Service')) return '8';
    return '1';
}

const App: React.FC = () => {
    const location = useLocation();

    const auth = useAuth();
    const user = auth.user as UserInfo;

    const [selectedKeys, setSelectedKeys] = useState<string[]>([menuKeyFromLocation(location)]);
    const [collapsed, setCollapsed] = useState(false);

    const userMenuItems: MenuProps['items'] = [
        getItem(<Link to="/panels/userBalance">用户余额</Link>, '1', <MoneyCollectOutlined />),
        getItem(<Link to="/panels/mintCountByMonth">铸造量统计</Link>, '2', <LineChartOutlined />),
        getItem(<Link to="/panels/user">用户设置</Link>, '3', <UserOutlined />),
        getItem(<Link to="/panels/company">企业认证</Link>, '4', <UsergroupAddOutlined />),
        getItem(<Link to="/panels/invoice">发票管理</Link>, '5', <ReconciliationOutlined />),
        getItem(<span onClick={() => auth.signout(console.log)}>退出登录</span>, '100', <LogoutOutlined />),
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#6953EF',
                    colorLink: '#6953EF',
                },
            }}
            locale={locale}
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
                        zIndex: 10,
                    }}
                >
                    <div className="logo">
                        <img src={collapsed ? "/nftrainbow-logo-icon.png" : "/nftrainbow-logo-light.png"} alt='logo' />
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
                            {/* <Link to="/panels/poaps/createGaslessInDefaultProject">创建POAP</Link> */}
                            <Space>
                                <Link to="/panels/mint/easyMint">快捷铸造</Link>
                                <Link to="/panels/contracts/sponsor">设置代付</Link>
                            </Space>
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
