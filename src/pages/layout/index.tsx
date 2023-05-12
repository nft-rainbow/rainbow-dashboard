import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    DashboardOutlined, AppstoreOutlined, MenuFoldOutlined, DownOutlined, 
    UserOutlined, LogoutOutlined, UsergroupAddOutlined,
    CodeOutlined, MoneyCollectOutlined, AuditOutlined,
    LineChartOutlined, NodeIndexOutlined, RobotOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { 
    Layout, Menu, Dropdown, Space, Button,
    Form, Modal, Input, ConfigProvider, Tooltip,
    Row, Col, Radio, message, Select, Typography
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { SelectInfo } from 'rc-menu/lib/interface';
import { useAuth } from '@router/Auth';
import { UserInfo } from '@services/index';
import { easyMintUrl } from '@services/app';
import FileUpload from '@components/FileUpload';
import { address } from 'js-conflux-sdk';
import { App as AppModel } from '@models/index';
import { getAllApps } from '@services/app';
import "./layout.css";
const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

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
    getItem(<Link to="/panels/poaps">活动</Link>, '4', <AuditOutlined />),
    getItem(<Link to="/panels/socialBot">社群Bot</Link>, '5', <RobotOutlined />),
    getItem(<Link to="/panels/metadata">元数据</Link>, '6', <NodeIndexOutlined />),
    getItem(<a href="https://docs.nftrainbow.xyz" target="_blank" rel="noreferrer">开发文档</a>, '7', <CodeOutlined />),
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
    if (pathname.startsWith('/panels/socialBot')) return '5';
    if (pathname.startsWith('/panels/metadata')) return '6';
    return '1';
}

const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

const App: React.FC = () => {
    const location = useLocation();

    const [selectedKeys, setSelectedKeys] = useState<string[]>([menuKeyFromLocation(location)]);
    const [collapsed, setCollapsed] = useState(false);
    const [logo, setLogo] = useState("/nftrainbow-logo-light.png");
    const auth = useAuth();
    const user = auth.user as UserInfo;

    const [useUpload, setUseUpload] = useState(true);
    const [minting, setMinting] = useState(false);
    const [isMintModalVisible, setIsMintModalVisible] = useState(false);
    const [form] = Form.useForm();
    const closeMintModal = () => setIsMintModalVisible(false);

    const [apps, setApps] = useState<AppModel[]>([]);
    const [appId, setAppId] = useState<number>(0);

    const userMenuItems: MenuProps['items'] = [
        getItem(<Link to="/panels/userBalance">用户余额</Link>, '1', <MoneyCollectOutlined />),
        getItem(<Link to="/panels/mintCountByMonth">铸造量统计</Link>, '2', <LineChartOutlined />),
        getItem(<Link to="/panels/user">用户设置</Link>, '3', <UserOutlined />),
        getItem(<Link to="/panels/company">企业认证</Link>, '4', <UsergroupAddOutlined />),
        getItem(<span onClick={() => auth.signout(console.log)}>退出登录</span>, '5', <LogoutOutlined />),
    ];

    const [messageApi, contextHolder] = message.useMessage();

    const onNftMint = (values: any) => {
        const { file_url, file_link } = values;
        if (!file_url && !file_link) {
          messageApi.warning('请上传图片或者填入图片链接');
          return;
        }
        if (!file_url && file_link) {
          values.file_url = file_link;
        }
        if (!appId) {
            messageApi.warning('请选择项目');
            return;
        }

        setMinting(true);

        easyMintUrl(appId.toString(), values)
          .then((res) => {
            setIsMintModalVisible(false);
            form.resetFields();
          })
          .catch((err) => {
            message.error(err.response.data.message);
          })
          .finally(() => {
            setMinting(false);
          });
      };

    useEffect(() => {
        setLogo(collapsed ? "/nftrainbow-logo-icon.png" : "/nftrainbow-logo-light.png");
    }, [collapsed]);

    useEffect(() => {
        getAllApps().then((res) => {
          setApps(res);
        });
    }, []);

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
                            <Button 
                                type='link' 
                                onClick={() => setIsMintModalVisible(true)}
                            >
                                快捷铸造
                                <Tooltip title="快捷铸造是在事先部署的智能合约中铸造 NFT，方便新用户快速上手"><QuestionCircleOutlined/></Tooltip>
                            </Button>
                            <Link to="/panels/contracts/sponsor">设置代付</Link>
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
                    <Modal title="快捷铸造" open={isMintModalVisible} onOk={() => form.submit()} onCancel={closeMintModal} cancelButtonProps={{ hidden: true }} okButtonProps={{ hidden: true }}>
                        <Form {...formLayout} form={form} name="control-hooks" onFinish={onNftMint}>
                            <Form.Item name="app_id" label="所属项目" rules={[{ required: true }]}>
                                <Select onChange={val => setAppId(val)} placeholder='请选择项目，新用户需先创建项目'>
                                    {apps.map((app) => (
                                        <Select.Option key={app.id} value={app.id}>
                                        {app.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="name" label="名字" rules={[{ required: true }]}>
                                <Input placeholder='NFT 名字'/>
                            </Form.Item>
                            <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                                <Input.TextArea rows={3} placeholder='NFT 描述'/>
                            </Form.Item>
                            <Form.Item name={'img_group'} label="图片">
                                <Input.Group>
                                    <Radio.Group
                                        value={useUpload ? 'upload' : 'input'}
                                        onChange={(e: CheckboxChangeEvent) => setUseUpload(e.target.value === 'upload')}
                                    >
                                        <Radio.Button value="upload">本地文件</Radio.Button>
                                        <Radio.Button value="input">网络链接</Radio.Button>
                                    </Radio.Group>

                                    {useUpload && (
                                        <Input.Group style={{ display: 'flex', marginTop: '10px' }}>
                                            <Form.Item name="file_url" noStyle rules={[{ required: false }]}>
                                                <FileUpload
                                                    accept={'.png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae'}
                                                    listType="picture"
                                                    maxCount={1}
                                                    onChange={(err: Error, file: any) => {form.setFieldsValue({ file_url: file.url })}}
                                                />
                                            </Form.Item>
                                        </Input.Group>
                                    )}

                                    {!useUpload && (
                                        <Input.Group style={{ marginTop: '10px' }}>
                                            <Form.Item name="file_link" style={{marginBottom: '0px'}}>
                                                <Input />
                                            </Form.Item>
                                        </Input.Group>
                                    )}
                                </Input.Group>
                            </Form.Item>
                            <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
                                <Radio.Group>
                                    <Radio.Button value="conflux">树图主网</Radio.Button>
                                    <Radio.Button value="conflux_test">树图测试网</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item
                                label='接受地址'
                                name="mint_to_address"
                                style={{ flexGrow: 1, border: '0px solid black' }}
                                rules={[
                                    { required: true, message: '请输入接受地址' },
                                    ({ getFieldValue }) => ({
                                        validator: function (_, value) {
                                            const isValidAddr = address.isValidCfxAddress(value);
                                            if (!isValidAddr) return Promise.reject(new Error('地址格式错误'));
                                            const prefix = getFieldValue('chain') === 'conflux' ? 'cfx' : 'cfxtest';
                                            const isValidPrefix = value.toLowerCase().split(':')[0] === prefix;
                                            if (!isValidPrefix) return Promise.reject(new Error('请输入正确网络的地址'));
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <Input style={{ flexGrow: 1 }} placeholder="树图链地址" />
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
                                <Row gutter={24}>
                                    <Col span={6}>
                                        <Button htmlType={'reset'}>重置</Button>
                                    </Col>
                                    <Col span={6}>
                                        <Button htmlType={'button'} type={'dashed'} onClick={() => setIsMintModalVisible(false)}>
                                            取消
                                        </Button>
                                    </Col>
                                    <Col span={6}>
                                        <Button htmlType={'submit'} type={'primary'} disabled={minting} loading={minting} onClick={()=>onNftMint(form.getFieldsValue())}>
                                            确认
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
                                <Text type="secondary">NFT铸造后，可在项目详情页查看</Text>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
