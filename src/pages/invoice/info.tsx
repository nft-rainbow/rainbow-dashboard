import React, { useEffect, useState } from 'react';
import {
    Card, Button, Modal, Form,
    Input, message, Radio, 
    Switch, List, Tag, Row, Col,
} from "antd";
import type { RadioChangeEvent } from 'antd';
import { InvoiceInfo } from '@models/Invoice';
import { User } from '@models/User';
import { getInvoiceInfoList, createInvoiceInfo, updateInvoiceInfo } from '@services/invoice';
import { userProfile } from '@services/user';

export default function Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceInfoList, setInvoiceInfoList] = useState<InvoiceInfo[]>([]);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [type, setType] = useState<number>(2);
    const [email, setEmail] = useState<string>("");
    const [form] = Form.useForm();
    const [tick, setTick] = useState<number>(0);
    const [toUpdate, setToUpdate] = useState<InvoiceInfo | null>(null);

    const showModal = () => {
        setIsModalOpen(true);
        form.resetFields();
        form.setFieldValue('email', email);
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onFinish = async (values: any) => {
        try {
            if (toUpdate) {
                values.id = toUpdate.id;
                await updateInvoiceInfo(toUpdate.id, values);
                setIsModalOpen(false);
                setTick(tick + 1);
            } else {
                await createInvoiceInfo(values);
                setIsModalOpen(false);
            }
        } catch (err) {
            // @ts-ignore
            message.error('创建失败: ' + err.message);   
        }
    };
      
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    useEffect(() => {
        getInvoiceInfoList(page, 10).then(res => {
            setInvoiceInfoList(res.items);
            setTotal(res.count);
        });
    }, [page, tick]);

    async function handleSetDefault(item: InvoiceInfo) {
        try {
            item.is_default = !item.is_default;
            await updateInvoiceInfo(item.id, item);
            setTick(tick + 1);
        } catch (err) {
            // @ts-ignore
            message.error('操作失败: ' + err.message);   
        }
    }

    useEffect(() => {
        userProfile().then((res: User) => {
            setEmail(res.email);
        });
    }, []);

    return (
        <>
            <Card title='发票信息' style={{flexGrow:1}} extra={<><Button type='primary' onClick={showModal}>新建</Button></>}>
                <List
                    itemLayout="horizontal"
                    dataSource={invoiceInfoList}
                    pagination={{
                        pageSize: 10, 
                        total, 
                        current: page, 
                        onChange: (page: number) => setPage(page)
                    }}
                    renderItem={(item: InvoiceInfo, index) => (
                        <List.Item 
                            actions={[
                                <Button type='link' onClick={() => handleSetDefault(item)}>{item.is_default ? '取消默认' : '设为默认'}</Button>, 
                                <Button type='link' onClick={() => {
                                    setToUpdate(item);
                                    setType(item.type);
                                    form.setFieldsValue(item);
                                    setIsModalOpen(true);
                                }}>编辑</Button>
                            ]}
                        >
                            <List.Item.Meta
                                title={<>{item.type === 2 ? <Tag color='blue'>企业</Tag> : <Tag color='red'>非企业</Tag>}{item.is_default ? '默认发票信息' : null}</>}
                                description={
                                    <Row>
                                        <Col span={8}> 
                                            <div>抬头: {item.name}</div>
                                            <div>邮箱: {item.email}</div>
                                            {item.type === 2 &&
                                                <div>税号: {item.tax_no}</div>
                                            }
                                        </Col>
                                        {item.type === 2 &&
                                            <Col span={8}>
                                                
                                                <div>银行: {item.bank}</div>
                                                <div>银行账号: {item.bank_no}</div>
                                                <div>地址: {item.address}</div>
                                                <div>手机号: {item.phone}</div>
                                            </Col>
                                        }
                                        {item.type === 2 &&
                                            <Col span={8}>
                                                <div>邮寄地址: {item.mail_address}</div>
                                                <div>联系人: {item.mail_receiver}</div>
                                                <div>联系人电话: {item.mail_phone}</div>
                                            </Col>
                                        }
                                    </Row>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>
            <Modal 
                title="新建发票信息" 
                open={isModalOpen} 
                onOk={() => form.submit()} 
                onCancel={handleCancel}
            >
                <Form
                    name="basic"
                    labelCol={{ span: 6 }}
                    form={form}
                    wrapperCol={{ span: 18 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ type: 2 }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="类型"
                        name="type"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Radio.Group value={type} onChange={(e: RadioChangeEvent) => setType(e.target.value)}>
                            <Radio value={2}> 企业单位 </Radio>
                            <Radio value={1}> 个人/非企业单位 </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        label="抬头"
                        name="name"
                        rules={[{ required: true, message: '请选择类型' }]}
                    >
                        <Input />
                    </Form.Item>
                    { type === 2 && 
                        <Form.Item
                            label="税号"
                            name="tax_no"
                            rules={[{ required: true, message: '请输入税号' }]}
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="开户行"
                            name="bank"
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="账号"
                            name="bank_no"
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="地址"
                            name="address"
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="电话"
                            name="phone"
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="邮寄地址"
                            name="mail_address"
                            rules={[{ required: true, message: '请输入邮寄地址' }]}
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="联系人"
                            name="mail_receiver"
                            rules={[{ required: true, message: '请输入' }]}
                        >
                            <Input />
                        </Form.Item>
                    }
                    { type === 2 && 
                        <Form.Item
                            label="手机号码"
                            name="mail_phone"
                            rules={[{ required: true, message: '请输入' }]}
                        >
                            <Input />
                        </Form.Item>
                    }
                    <Form.Item
                        label="电子邮件"
                        name="email"
                        rules={[{ required: true, message: '请输入' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="设为默认"
                        name="is_default"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}