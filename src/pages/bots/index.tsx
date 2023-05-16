import React, { useEffect, useState } from 'react';
import { 
    Tabs, TabsProps, Card, Form, Input, 
    Button, Space, Table, Layout, Modal,
    Row, Col, Divider, Select, 
    Alert, Typography, TablePaginationConfig,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BotServer, BotEvent, BotChannel, BotRoles, ActivityItem } from "@models/index";
import { 
    getBotInviteUrl, getBotAuthCode, bindBotServers,
    getBotServers, getServerChannels, getServerRoles,
    getBotActivities, pushBotActivity, createPushInfo,

} from '@services/bot';
import { getActivities } from '@services/activity';
import { short, formatDate } from '@utils/index';
const { Content, Sider } = Layout;
const { Text } = Typography;
const { Option } = Select;

export default function Page() {
    const onChange = (key: string) => {
        console.log(key);
    };
      
    const items: TabsProps['items'] = [
        {
          key: '1',
          label: `DoDo`,
          children: <Dodo />,
        },
        {
          key: '2',
          label: `Discord`,
          children: <Discord />,
        },
    ];

    return (
        <>
            <Card style={{flexGrow:1}}>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Card>
        </>
    );
}

function Dodo() {
    const social_tool = 'dodo';

    const [isModalShow, setIsModalShow] = useState(false);
    const [isAddBotShow, setIsAddBotShow] = useState(false);
    const [inviteUrl, setInviteUrl] = useState("");
    const [bindForm] = Form.useForm();
    const [serverId, setServerId] = useState(""); // server id in bind form
    const [filterAddress, setFilterAddress] = useState(""); // filter address in bind form
    const [filterName, setFilterName] = useState(""); // filter name in bind form
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);

    const [form] = Form.useForm();

    const columns: ColumnsType<BotEvent> = [
        {
          title: '活动/藏品ID',
          dataIndex: 'activity_id',
          render: (text) => <a>{text}</a>,
        },
        {
          title: '类型',
          dataIndex: 'activity_type',
          render: (text) => text === 'single' ? '单个活动' : '盲盒活动',
        },
        {
          title: '社群ID',
          dataIndex: 'raw_server_id',
        },
        {
          title: '社群名称',
          dataIndex: 'server_name',
        },
        {
          title: '活动/藏品名称',
          dataIndex: 'name',
        },
        {
          title: '区块链',
          dataIndex: 'chain_id',
        },
        {
          title: '合约地址',
          dataIndex: 'contract_address',
          render: (text) => short(text),
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          render: (text) => formatDate(new Date(text * 1000)),
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
          render: (text) => text ? formatDate(new Date(text * 1000)) : '',
        },
        {
          title: '推送时间',
          dataIndex: 'last_push_time',
          render: (text) => text ? formatDate(new Date(text * 1000)) : '',
        },
        {
          title: 'Action',
          key: 'action',
          render: (_, record: BotEvent) => (
            <Space size="middle">
              <Button type='primary' onClick={() => {
                try {
                    pushBotActivity(record.push_info_id.toString())
                } catch(e) {
                    // @ts-ignore
                    message.error(e.response.data.message);
                }
            }}>推送</Button>
            </Space>
          ),
        },
    ];

    const sendAuthCode = async (server_id: string) => {
        try {
            await getBotAuthCode(server_id, social_tool);
        } catch(e) {
            // @ts-ignore
            message.error(e.response.data.message);
        }
    }

    const bindServer = async (values: any) => {
        try {
            await bindBotServers(values.code, values.server_no, social_tool);
            setIsAddBotShow(false);
        } catch(e) {
            // @ts-ignore
            message.error(e.response.data.message);
        }
    }

    useEffect(() => {
        const filter = {
            social_tool,
            page,
            limit: 10,
        }
        // @ts-ignore
        if (filterName) filter.activity_name = filterName;
        // @ts-ignore
        if (filterAddress) filter.contract_address = filterAddress;
        getBotActivities(filter).then(res => {
            setTotal(res.count);
            setItems(res.items);
        });
    }, [filterName, filterAddress, page]);

    useEffect(() => {
        if (!isAddBotShow) return;
        getBotInviteUrl(social_tool).then(res => {
            setInviteUrl(res.message);
        })
    }, [isAddBotShow]);

    return (<>
        <Layout>
            <Content style={{backgroundColor: 'white'}}>
                <Form form={form} name="horizontal_login" layout="inline">
                    <Form.Item label="活动/藏品名称" name="name">
                        <Input placeholder="活动名称" onChange={e => setFilterName(e.target.value)}/>
                    </Form.Item>
                    <Form.Item label="合约地址" name="contract">
                        <Input placeholder="合约地址" onChange={e => setFilterAddress(e.target.value)} />
                    </Form.Item>
                </Form>
            </Content>
            <Sider theme='light' width={300}>
                <Space>
                    <Button type='primary' onClick={() => setIsAddBotShow(true)}>添加机器人</Button>
                    <Button type='primary' onClick={() => setIsModalShow(true)}>推送社群</Button>
                </Space>
            </Sider>
        </Layout>
        <div style={{height: '20px'}}></div>
        <Table 
            rowKey={'event_id'} 
            columns={columns} 
            dataSource={items}
            pagination={{
                total,
                current: page,
                showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        />
        <DoDoActivityCreateModal isModalShow={isModalShow} setIsModalShow={setIsModalShow} />
        <Modal
            title="添加机器人"
            open={isAddBotShow}
            onOk={() => bindForm.submit()}
            onCancel={() => setIsAddBotShow(false)}
            okText={"确定"}
            cancelText={"取消"}
        >
            <Form form={bindForm} layout='vertical' className='mt-20' onFinish={bindServer}>
                <Form.Item>
                    <Text>1. 点击机器人<a href={inviteUrl} target={"_blank"} rel="noreferrer">邀请链接</a>，授权机器人加入自己创建的 DoDo 社区</Text>
                </Form.Item>
                <Form.Item label="2. 填写自己的超级群号" name="server_no">
                    <Input placeholder="输入超级群号" onChange={e => setServerId(e.target.value)} />
                </Form.Item>
                <Form.Item label="3. 填写机器人私信的验证码，完成验证" name="code">
                    <Row gutter={8}>
                        <Col span={12}>
                            <Input placeholder="输入验证码" />
                        </Col>
                        <Col span={12}>
                            <Button type='primary' onClick={() => sendAuthCode(serverId)}>发送验证码</Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Modal>
    </>
    );
}

function DoDoActivityCreateModal(props: {
    isModalShow: boolean,
    setIsModalShow: (isShow: boolean) => void,
}) {
    const { isModalShow, setIsModalShow } = props;
    const social_tool = 'dodo';

    const [pushServerId, setPushServerId] = useState("");
    const [currServerChannels, setCurrServerChannels] = useState<BotChannel[]>([]);
    const [currServerRoles, setCurrServerRoles] = useState<BotRoles[]>([]);
    const [botServers, setBotServers] = useState<BotServer[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [activityCount, setActivityCount] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();

    const handleCancel = () => {
        setIsModalShow(false);
    };

    const activityColumns: ColumnsType<ActivityItem> = [
        {
            title: '活动/藏品ID',
            dataIndex: 'activity_id',
            render: (text) => <a>{text}</a>,
        },
        {
            title: '类型',
            dataIndex: 'activity_type',
        },
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '合约地址',
            dataIndex: 'contract.contract_address',
            render:(text: string, record: ActivityItem) => record.contract?.contract_address ? short(record.contract?.contract_address as string) : '',
        },
        {
            title: '开始时间',
            dataIndex: 'start_time',
            render: (num: number) => num ? formatDate(new Date(num * 1000)) : '',
        },
        {
            title: '结束时间',
            dataIndex: 'end_time',
            render: (num: number) => (num && num > 100) ? formatDate(new Date(num * 1000)) : '',
        },
    ]

    const createServerActivity = async (values: any) => {
        if (selectedRowKeys.length === 0) {
            message.error('请选择活动');
            return;
        }
        const serverMeta = botServers.find(server => server.raw_server_id === pushServerId);
        if (!serverMeta) {
            message.error('请选择服务器');
            return;
        }

        const activity_id = selectedRowKeys[0];

        const { 
            content,
            color_theme = 'blue',
            channel_id,
            role_id,
        } = values;

        const meta = {
            activity_id,
            channel_id,
            color_theme,
            content,
            roles: role_id ? [
                role_id,
            ] : [],
        }

        try {
            const res = await createPushInfo(serverMeta.id.toString(), meta);
            // await pushBotActivity(res.id);
            setIsModalShow(false);
        } catch(e) {
            // @ts-ignore
            message.error(e.response.data.message);
        }
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        type: 'radio',
    };

    useEffect(() => {
        if (!isModalShow) return;
        getBotServers(social_tool, 1, 1000).then(res => {
            setBotServers(res.items);
        });
        getActivities({page, limit: 10}).then(res => {
            setActivities(res.items);
            setActivityCount(res.count);
        });
    }, [isModalShow, page]);

    useEffect(() => {
        if (!pushServerId) return;
        getServerChannels(pushServerId, social_tool).then(res => {
            setCurrServerChannels(res);
        });
        getServerRoles(pushServerId, social_tool).then(res => {
            setCurrServerRoles(res.filter((role: {roleName: string, roleId: string}) => role.roleName !== "NFTRainbowBot"));
        });
    }, [pushServerId]);

    return (<>
        <Modal 
            title="推送设置" 
            open={isModalShow}
            onOk={() => form.submit()} 
            onCancel={handleCancel} 
            width={800}
            okText={"确定"}
            cancelText={"取消"}
        >
            <Alert type='info' message='可以将活动推送到授权的 DoDo 或 Discord 社区频道中，提供给社群成员进行藏品铸造，活动需先在管理后台中创建好'/>
            <Form className='mt-20' form={form} onFinish={createServerActivity}>
                <Row>
                    <Col span={11}>
                        <Form.Item label="推送超级群" name="server_id">
                            <Select onChange={val => setPushServerId(val)}>
                                {botServers.map(server => <Option key={server.id} value={server.raw_server_id}>{server.server_name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item label="推送频道" name="channel_id">
                            <Select>
                                {currServerChannels.map(channel => <Option key={channel.channelId} value={channel.channelId}>{channel.channelName}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item label="身份组" name="role_id">
                            <Select>
                                {currServerRoles.map(channel => <Option key={channel.roleId} value={channel.roleId}>{channel.roleName}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider orientation="left">设置推送内容</Divider>
                <Row>
                    <Col span={11}>
                        <Form.Item label="消息内容" name="content">
                            <Input placeholder="推送消息内容" />
                        </Form.Item>
                    </Col>
                    <Col span={11}>
                        {/* 颜色主题 */}
                    </Col>
                </Row>
                <Divider orientation='left'>选择推送消息</Divider>
                <Row>
                    <Table 
                        columns={activityColumns} 
                        dataSource={activities} 
                        rowSelection={rowSelection} 
                        rowKey="id"
                        pagination={{
                            total: activityCount,
                            current: page,
                            showTotal: (total) => `共 ${total} 条`,
                        }}
                        onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                    />
                </Row>
            </Form>
        </Modal>
    </>);
}

function Discord() {
    return (<div>开发中ing</div>);
}