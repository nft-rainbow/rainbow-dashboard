import React, { useEffect, useState, useCallback } from 'react';
import {
    Card, Button, Table, Modal, Form,
    Input, Select, TablePaginationConfig, message, Space,
} from "antd";
import { Link } from "react-router-dom";
import { getApps, createApp } from '@services/app';
import { mapChainName, formatDate } from '@utils/index';
import { App } from '@models/index';
import AppDetail from "./detail";

function Apps() {
    const [apps, setApps] = useState<App[]>([]);
    const [total, setTotal] = useState(0);
    const [defaultAppId, setDefaultAppId] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const refreshItems = useCallback((currentPage: number) => {
        setLoading(true);
        getApps(currentPage).then(data => {
        setApps(data.items);
        setTotal(data.count);
        if (data.count === 1) {
            setDefaultAppId(data.items[0].id)
        } else if (data.count === 0) {
            createForm.setFieldsValue({name:"默认项目", intro:"默认项目", chain:'conflux'})
            setIsModalVisible(true)
        }
        }).then(() => {
            setLoading(false);
        });
    }, [createForm])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            ellipsis: true,
            render: (text: number, record: App) => <Link to={`/panels/apps/${record.id}`}>{text}</Link>
        },
        {
            title: '区块链',
            dataIndex: 'chain_type',
            render: mapChainName,
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
            render: (text: number, record: App) => <Link to={`/panels/apps/${record.id}`}><Button type='primary' size='small'>查看</Button></Link>
        }
    ];

    const handleOk = async (values: object) => {
        try {
            await createApp(values);
            setIsModalVisible(false);
            message.success('创建成功');
            refreshItems(page);
        } catch (err: any) {
            if (err.message.match('kyc')) {
                message.error('请先完成KYC认证');
            } else {
                message.error('创建失败');
            }
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        refreshItems(page);
    }, [page, refreshItems]);

    return (
        <Space direction={"vertical"}>
            {defaultAppId.toString().length > 0 &&
                <Card title={'默认项目'}>
                    {defaultAppId.toString().length > 0 && <AppDetail appId={defaultAppId} pageLimit={5}/>}
                </Card>
            }
            <Card title='我的项目' extra={<Button onClick={() => setIsModalVisible(true)} type="primary">创建项目</Button>}>
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

                    <Form.Item
                        label="区块链"
                        name="chain"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Select>
                            <Select.Option value="conflux">树图链</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="网址"
                        name="website"
                        rules={[{ required: false }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="ICP备案号"
                        name="icp"
                        rules={[{ required: false }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="发行平台"
                        name="platform"
                        rules={[{ required: false }]}
                    >
                        <Select>
                            <Select.Option value="weixin">微信</Select.Option>
                            <Select.Option value="app">App</Select.Option>
                            <Select.Option value="h5">H5</Select.Option>
                            <Select.Option value="other">其他</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
}

export default Apps;
