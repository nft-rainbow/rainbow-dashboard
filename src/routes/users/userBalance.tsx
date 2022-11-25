import React, { useState, useEffect } from 'react';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
    Button,
    Form,
    Modal,
    Input,
    Radio,
    Space,
    // Checkbox,
} from 'antd';
import { userBalance } from '../../services/user';
import { createWxPayOrder } from '../../services/pay';
import {QRCodeSVG} from 'qrcode.react';
import './userBalance.css';

export default function UserBalance() {
    const [balance, setBalance] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPayModalVisible, setIsPayModalVisible] = useState(false);
    const [payUrl, setPayUrl] = useState('');
    const [form] = Form.useForm();

    const onPay = async (values: any) => {
        let { amount } = values;
        if (isNaN(Number(amount))) throw new Error ('请输入正确的金额');
        amount = parseInt((Number(amount) * 100).toString());
        const res = await createWxPayOrder({
            amount: amount,
            desc: 'Charge',
        });
        setIsModalVisible(false);

        setPayUrl(res.code_url);
        setIsPayModalVisible(true);
    }

    useEffect(() => {
        userBalance().then((res) => setBalance(res.balance));
    }, []);

    return (
        <div>
            <RainbowBreadcrumb items={['设置', '用户中心']} />
            <div className='content-body'>
                <h3>可用额度</h3>
                <div>
                    <span className='user-balance'>¥ {balance / 100}</span>
                    <Button className='charge-btn' type='primary' onClick={() => setIsModalVisible(true)}>充值</Button>
                </div>
            </div>
            <Modal title='余额充值' visible={isModalVisible} onOk={() => form.submit()} onCancel={() => setIsModalVisible(false)}>
                <Form form={form} onFinish={onPay} initialValues={{type: 1}}>
                    <Form.Item name="amount" label="充值金额" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="充值方式" rules={[{ required: true }]}>
                        <Radio.Group onChange={() => {}} value={1}>
                            <Space direction="vertical">
                                <Radio value={1}>微信支付</Radio>
                                {/* <Radio value={2}>支付宝</Radio> */}
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    {/* <Checkbox onChange={() => {}}>我已了解：充值的款项只可用于NFTRainbow消费</Checkbox> */}
                </Form>
            </Modal>
            <Modal  title='扫码支付' visible={isPayModalVisible} onOk={() => setIsPayModalVisible(false)} onCancel={() => setIsPayModalVisible(false)}>
                <QRCodeSVG value={payUrl} />
            </Modal>
        </div>
    );
}