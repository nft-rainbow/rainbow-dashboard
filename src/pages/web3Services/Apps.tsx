import React, { useEffect, useState } from 'react';
import {
    Card, Tabs, Form, Input, Modal, message, 
    Button, Table,
} from "antd";
import type { TabsProps, TablePaginationConfig } from 'antd';
import { Link } from "react-router-dom";
import { getApps, createApp } from '@services/app';
import { getUserServicePlan, updateServiceRenewal, ServiceNameMap } from '@services/web3Service';
import { formatDate } from '@utils/index';
import { App } from '@models/index';
import {  UserServicePlan } from '@models/Service';
import { userProfile } from '@services/user';

export default function Web3Apps() {
    const onChange = (key: string) => {
        console.log(key);
    };
      
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '项目列表',
            children: <Apps />,
        },
        {
            key: '2',
            label: '我的服务',
            children: <MyServices />,
        },
        /* {
            key: '3',
            label: '数据',
            children: 'Content of Tab Pane 2',
        }, */
    ];
      
    return (
        <>
            <Card style={{flexGrow:1}}>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Card>
        </>
    );
}

function Apps() {
    const [apps, setApps] = useState<App[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            ellipsis: true,
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: formatDate,
        },
        {
            title: '操作',
            key: 'action',
            render: (text: number, record: App) => <Link to={`/panels/web3Service/${record.id}`}><Button type='link' size='small'>查看Key</Button></Link>
        }
    ];

    const refreshItems = (currentPage: number) => {
        setLoading(true);
        getApps(currentPage).then(data => {
            setApps(data.items);
            setTotal(data.count);
            if (data.count === 0) {
                createForm.setFieldsValue({name: "默认项目", intro: "默认项目", chain: 'conflux'});
                setIsModalVisible(true)
            }
        }).then(() => {
            setLoading(false);
        });
    }

    const handleOk = async (values: object) => {
        try {
            await createApp(Object.assign({chain: 'conflux'}, values));
            setIsModalVisible(false);
            message.success('创建成功');
            refreshItems(page);
        } catch (err) {
            message.error('创建失败');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        refreshItems(page);
    }, [page]);

    return (
        <>
            <Card extra={<Button onClick={() => setIsModalVisible(true)} type="primary">创建项目</Button>}>
                <Table
                    rowKey='id'
                    dataSource={apps}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number) }
                />
            </Card>
            <Modal title="创建项目" open={isModalVisible} onOk={createForm.submit} onCancel={handleCancel} okText={'确认'} cancelText={'取消'}>
                <Form
                    name="basic"
                    form={createForm}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onFinish={handleOk}
                    initialValues={{ chain: 'conflux' }}
                    onFinishFailed={handleCancel}
                    autoComplete="off"
                >
                    <Form.Item
                        label="项目名称"
                        name="name"
                        rules={[{ required: true, message: '请输入项目名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="项目介绍"
                        name="intro"
                        rules={[{ required: true, message: '请输入项目介绍' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

/**
 * Note:
 * 基础服务不可取消续订状态
 */
function MyServices() {

    const [services, setServices] = useState<UserServicePlan[]>([]);
    const [tick, setTick] = useState<number>(0);

    const columns = [
        {
            title: 'Web3 服务',
            dataIndex: 'server_type',
            render: (type: string) => ServiceNameMap[type]
        },
        {
            title: '套餐名称',
            dataIndex: 'plan.name',
            render: (text: string, record: UserServicePlan) => record.plan.name
        },
        /* {
            title: '使用状态',
            dataIndex: 'status',
        }, */
        {
            title: '续订状态',
            dataIndex: 'is_auto_renewal',
            render: (autoRenew: boolean, record: UserServicePlan) => autoRenew ? '开启' : '关闭'
        },
        {
            title: '开始/结束时间',
            dataIndex: 'created_at',
            render: (text: string, record: UserServicePlan) => `${formatDate(record.bought_time)} / ${formatDate(record.expire_time)}`
        },
        {
            title: '查看',
            render: (text: number, record: UserServicePlan) => {
                return <Link to={`/panels/web3Service/service/${record.server_type}`}><Button type='link' size='small'>服务用量</Button></Link>
            }
        },
        {
            title: '续订',
            key: 'action',
            render: (text: number, record: UserServicePlan) => {
                if (record.plan.price === '0') {
                    return null;
                }
                if (record.is_auto_renewal) {
                    return <Button type='link' size='small' onClick={async () => {
                        try {
                            await updateServiceRenewal(record.user_id, record.server_type, false);
                            setTick(tick+1);
                            message.success('取消续订成功');
                        } catch(e) {
                            message.error('操作失败');
                        }
                    }}>取消续订</Button>
                } else {
                    return <Button type='link' size='small' onClick={async () => {
                        try {
                            await updateServiceRenewal(record.user_id, record.server_type, true);
                            setTick(tick+1);
                            message.success('续订成功');
                        } catch(e) {
                            message.error('操作失败');
                        }
                    }}>开启续订</Button>
                }
            }
        }
    ];

    useEffect(() => {
        userProfile().then(user => {
            getUserServicePlan(user.id as number).then(data => setServices(data));
        });
    }, [tick]);
    return (
        <>
            <Card extra={<Link to='/panels/web3Service/buy'><Button type='primary'>购买服务</Button></Link>}>
                <Table columns={columns} dataSource={services} rowKey='plan_id'/>
            </Card>
        </>
    );
}
