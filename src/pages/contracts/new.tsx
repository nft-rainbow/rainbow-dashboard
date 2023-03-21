import React from 'react';
import {
    Card, Form, Input, Button, Row, Col,
    Radio, Switch
} from "antd";
import RainbowBreadcrumb from '../../components/Breadcrumb';
import FileUpload from '../../components/FileUpload';

export default function ContractDeployment() {
    const [form] = Form.useForm();

    return (<>
        <RainbowBreadcrumb items={['智能合约', '部署']} />
        <Form layout="vertical" requiredMark={true}>
            <Card>
                <Form.Item
                    label="发行类型"
                    name="category"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Radio.Group>
                        <Radio value={1}>POA</Radio>
                        <Radio value={2}>数字藏品</Radio>
                    </Radio.Group>
                </Form.Item>
            </Card>

            <Card className='mt-20'>
                <Form.Item
                    label="合约类型"
                    name="type"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Radio.Group>
                        <Radio value={1}>721</Radio>
                    </Radio.Group>
                </Form.Item>
                <Row>
                    <Col span={11}>
                        <Form.Item
                            label="合约名称"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item
                            label="通证标识"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item
                            label="允许用户转移NFT"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Switch defaultChecked />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item
                            label="Gas代付"
                            name="username"

                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Switch defaultChecked />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card className='mt-20'>
                <Row>
                    <Col span={11}>
                        <Form.Item
                            label="活动名称"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item
                            label="活动描述"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <Form.Item
                            label="开始时间"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item
                            label="结束时间"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    label="图片"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ file_url: file.url })} />
                </Form.Item>

                <Row>
                    <Col span={11}>
                        <Form.Item
                            label="发行数量"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={11} offset={1}>
                        <Form.Item
                            label="开启口令领取"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Row>
                <Col span={11}>
                    <Button>部署测试网</Button>
                </Col>
                <Col span={11}>
                    <Button>部署正式网</Button>
                </Col>
            </Row>
            <div style={{ height: '300px' }}>

            </div>
        </Form>
    </>);
}