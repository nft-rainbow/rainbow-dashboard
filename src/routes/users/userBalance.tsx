import React, { useState, useEffect } from 'react';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
    Button,
    Form,
    Modal,
    Input,
    Radio,
    Space,
    Card,
    Table,
    TablePaginationConfig,
    Typography,
    Tooltip,
    // Checkbox,
} from 'antd';
import { userBalance, userFiatLogs, userBalanceRuntime } from '../../services/user';
import { createWxPayOrder } from '../../services/pay';
import { QRCodeSVG } from 'qrcode.react';
import './userBalance.css';
import { FiatLog } from '../../models';
import { formatDate, mapFiatLogType } from '../../utils';
const { Text } = Typography;

const billText = `
    1、目前支持通过联系 NFTRainbow 客服人员申请开具纸质增值税专用发票或电子普通发票。请您提供正确的交易编号及开票信息（名称、纳税人识别号、地址电话、开户行及账号）。平台将根据您提供的信息开具发票，如您填写有误，平台将不会受理重新开具发票的要求，请务必认真校对所填开票信息。
    2、发票金额为实际支出并消费的订单金额，不含折扣、积分以及优惠券等方式支付的金额。
    3、电子普通发票在申请后45个工作日内开具，如需纸质发票可自行下载打印。增值税专用发票在申请后60个工作日内开具并快递到付寄出。发票收件人电话请尽量填写可以联系到您的手机号码，以免影响您收票的时效性。
    `;

export default function UserBalance() {
    const [balance, setBalance] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPayModalVisible, setIsPayModalVisible] = useState(false);
    const [payUrl, setPayUrl] = useState('');
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [items, setItems] = useState<FiatLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const refreshItems = (currentPage: number) => {
        setLoading(true);
        userFiatLogs(currentPage).then(data => {
            setItems(data.items);
            setTotal(data.count);
        }).then(() => {
            setLoading(false);
        });
    }

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

    const columns = [
        {
          title: 'ID',
          dataIndex: 'id',
        },
        {
          title: '金额(元)',
          dataIndex: 'amount',
          render: (text: number) => text / 100,
        },
        {
          title: '类型',
          dataIndex: 'type',
          render: mapFiatLogType
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          render: formatDate,
        }
      ];

    useEffect(() => {
        userBalanceRuntime().then((res) => setBalance(res.balance));
    }, []);

    useEffect(() => {
        refreshItems(page);
    }, [page]);

    return (
        <div>
            <RainbowBreadcrumb items={['设置', '用户中心']} />
            <Card>
                <h3>当前余额</h3>
                <div style={{paddingBottom: '40px'}}>
                    <Space>
                        <span className='user-balance'>¥ {balance / 100}</span>
                        <Button type='primary' onClick={() => setIsModalVisible(true)}>充值</Button>
                        <Tooltip title={billText}>
                            <Text type='secondary'>开票说明</Text>
                        </Tooltip>
                    </Space>
                </div>
                <p style={{color: 'gray'}}>部分费用(NFT铸造费用，接口调用费用)每日定时结算，消费明细展示会有延迟</p>
                <Table
                    rowKey='id'
                    dataSource={items}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }}
                />
            </Card>
            <Modal title='余额充值' open={isModalVisible} onOk={() => form.submit()} onCancel={() => setIsModalVisible(false)} okText={'确认'} cancelText={'取消'}>
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
            <Modal 
                title='扫码支付' 
                open={isPayModalVisible} 
                onOk={() => setIsPayModalVisible(false)} 
                onCancel={() => setIsPayModalVisible(false)}
                footer={null}
            >
                <QRCodeSVG value={payUrl} style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}/>
                <div style={{textAlign: "center", marginTop: '10px'}}>
                    <span>支付完成后，请刷新页面</span>
                </div>
            </Modal>
        </div>
    );
}