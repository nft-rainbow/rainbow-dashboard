import React, { useEffect, useState } from 'react';
import { 
    Tabs, TabsProps, Card, Form, Input, 
    Button, Space, Table, Layout, Modal,
    Row, Col, Divider, Select, Checkbox,
    Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BotEvent } from "@models/index";
const { Content, Sider } = Layout;

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
            <Card>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Card>
        </>
    );
}

function Dodo() {
    const [form] = Form.useForm();
    const [isModalShow, setIsModalShow] = useState(false);

    const showModal = () => {
        setIsModalShow(true);
      };
    
      const handleOk = () => {
        setIsModalShow(false);
      };
    
      const handleCancel = () => {
        setIsModalShow(false);
      };

    const onFinish = (values: any) => {
        console.log('Finish:', values);
    };

    const columns: ColumnsType<BotEvent> = [
        {
          title: '互动/藏品ID',
          dataIndex: 'event_id',
          key: 'event_id',
          render: (text) => <a>{text}</a>,
        },
        {
          title: '类型',
          dataIndex: 'type',
          key: 'type',
        },
        {
          title: '社群ID',
          dataIndex: 'server_id',
          key: 'server_id',
        },
        {
          title: '社群名称',
          dataIndex: 'server_name',
          key: 'server_name',
        },
        {
          title: '互动/藏品名称',
          dataIndex: 'event_name',
          key: 'event_name',
        },
        {
          title: '区块链',
          dataIndex: 'chain',
          key: 'chain',
        },
        {
          title: '合约地址',
          dataIndex: 'contract',
          key: 'contract',
        },
        {
          title: '开始时间',
          dataIndex: 'start_time',
          key: 'start_time',
        },
        {
          title: '结束时间',
          dataIndex: 'end_time',
          key: 'end_time',
        },
        {
          title: '推送时间',
          dataIndex: 'push_time',
          key: 'push_time',
        },
        /* {
          title: 'Action',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              <a>Invite {record.server_name}</a>
              <a>Delete</a>
            </Space>
          ),
        }, */
    ];
      
    const data: BotEvent[] = [
        {
            id: 1,
            created_at: '2023-03-08 12:00:00',
            updated_at: '2023-03-08 12:00:00',
            event_id: "123456",
            event_name: 'John Brown',
            type: 1,
            server_id: '123456',
            server_name: 'John Brown',
            chain: 1029,
            contract: 'New York No. 1 Lake Park',
            start_time: '2023-03-08 12:00:00',
            end_time: "2023-03-08 12:00:00",
            push_time: "2023-03-08 12:00:00",
        },
    ];

    return (<>
        <Layout>
            <Content style={{backgroundColor: 'white'}}>
                <Form form={form} name="horizontal_login" layout="inline" onFinish={onFinish}>
                    <Form.Item label="活动/藏品名称" name="name">
                        <Input placeholder="NFT Name" />
                    </Form.Item>
                    <Form.Item label="合约地址" name="contract">
                        <Input placeholder="Contract Address" />
                    </Form.Item>
                </Form>
            </Content>
            <Sider theme='light' width={300}>
                <Space>
                    <Button type='primary'>添加机器人</Button>
                    <Button type='primary' onClick={showModal}>推送社群</Button>
                </Space>
            </Sider>
        </Layout>
        <div style={{height: '20px'}}></div>
        <Table rowKey={'event_id'} columns={columns} dataSource={data} />
        <Modal 
            title="推送设置" 
            open={isModalShow} 
            onOk={handleOk} 
            onCancel={handleCancel} 
            width={800}
            okText={"确定"}
            cancelText={"取消"}
        >
            <Alert type='info' message='可以将活动推送到授权的 DoDo 或 Discord 社区频道中，提供给社群成员进行藏品铸造，活动需先在管理后台中创建好'/>
            {/* <div style={{height: '20px'}}></div> */}
            <Form className='mt-20'>
                <Row>
                    <Col span={11}>
                        <Form.Item label="推送服务器" name="server_id">
                            <Select></Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item label="身份组" name="role_group">
                            <Select></Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item label="推送频道" name="channel">
                            <Select></Select>
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Checkbox>单个账户铸造限制</Checkbox>
                        <Input style={{width: "100px"}} />
                    </Col>
                </Row>
                <Divider/>
                <h4>设置推送内容</h4>
                <Row>
                    <Col span={11}>
                        <Form.Item label="消息内容" name="content">
                            <Input placeholder="推送消息内容" />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        {/* <Form.Item label="社群ID" name="server_id">
                            <Input placeholder="Server ID" />
                        </Form.Item> */}
                    </Col>
                </Row>
                <Divider/>
                <h4>选择推送消息</h4>
            </Form>
        </Modal>
    </>
    );
}

function Discord() {
    return (<div>开发中ing</div>);
}