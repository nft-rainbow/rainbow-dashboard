import React, { useState, useEffect } from 'react';
import RainbowBreadcrumb from '@components/Breadcrumb';
import {
    Button, Form, Modal, Input, Radio, Space, Card,
    Table, TablePaginationConfig, Typography, Tooltip, Select, DatePicker
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { InfoCircleOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react';
import { userFiatLogs, userBalanceRuntime } from '@services/user';
import { createWxPayOrder } from '@services/pay';
import { FiatLog } from '@models/index';
import { formatDate, mapFiatLogType, short, scanAddressLink } from '@utils/index';
import { TextDownloader } from '@components/TextDownloader';
import { arrayToCSVText } from '@utils/csvUtils';
import './userBalance.css';
const { Text } = Typography;
const { RangePicker } = DatePicker;

const billText = `
    1、目前支持通过联系 NFTRainbow 客服人员申请开具纸质增值税专用发票或电子普通发票。请您提供正确的交易编号及开票信息（名称、纳税人识别号、地址电话、开户行及账号）。平台将根据您提供的信息开具发票，如您填写有误，平台将不会受理重新开具发票的要求，请务必认真校对所填开票信息。
    2、发票金额为实际支出并消费的订单金额，不含折扣、积分以及优惠券等方式支付的金额。
    3、电子普通发票在申请后45个工作日内开具，如需纸质发票可自行下载打印。增值税专用发票在申请后60个工作日内开具并快递到付寄出。发票收件人电话请尽量填写可以联系到您的手机号码，以免影响您收票的时效性。
    4、目前支持开票频次为每季度一次，请合理安排开票需求。
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

    const [type, setType] = useState(0);
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [address, setAddress] = useState("");

    const [downloadContent, setDownloadContent] = useState('');

    const refreshItems = async (currentPage = 1, limit = 10, filter = {}) => {
        setLoading(true);
        const data = await userFiatLogs(currentPage, limit, filter);
        setLoading(false);

        setItems(data.items);
        setTotal(data.count);
    }

    const getExportData = async (filter = {}) => {
        const {items} = await userFiatLogs(1, 10000, filter);
        const rows = items.map((item: FiatLog) => ({
            'ID': item.id,
            '创建时间': formatDate(item.created_at),
            '订单号': item.order_no,
            '交易方向': item.amount > 0 ? '充值' : '消费',
            '交易类型': mapFiatLogType(item.type),
            '金额(元)': (item.amount / 100).toFixed(2),
            '余额(元)': (item.balance / 100).toFixed(2),
            // @ts-ignore
            '地址': item.meta ? item.meta.address : '',
        }));
        setDownloadContent(arrayToCSVText(rows));
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
          title: '创建时间',
          dataIndex: 'created_at',
          render: formatDate,
        },
        {
            title: '订单号',
            dataIndex: 'order_no',
        },
        {
            title: '交易方向',
            dataIndex: 'amount',
            render: (amount: number) => amount > 0 ? '充值' : '消费'
        },
        {
          title: '交易类型',
          dataIndex: 'type',
          render: mapFiatLogType
        },
        {
          title: '金额(元)',
          dataIndex: 'amount', // check
          render: (text: number) => text > 0 ? <Text type='success'>{(text / 100).toFixed(2)}</Text> : <Text type='danger'>{(text / 100).toFixed(2)}</Text>,
        },
        {
          title: '余额(元)',
          dataIndex: 'balance',
          render: (text: number) => (text / 100).toFixed(2),
        },
        {
          title: '地址',
          dataIndex: 'meta',
          render: (meta: {address: string}) => meta ? <a href={scanAddressLink(1, 1029, meta?.address)}>{short(meta?.address || '')}</a> : ''
        },
        /* {
          title: '交易渠道流水号',
          dataIndex: 'meta',
          render: (meta: object) => '',
        } */
    ];

    const setDate = (values: RangePickerProps['value'], dateString: string[]) => {
        setStartAt(dateString[0]);
        setEndAt(dateString[1]);
    }

    useEffect(() => {
        userBalanceRuntime().then((res) => setBalance(res.balance));
    }, []);

    useEffect(() => {
        refreshItems(page);
    }, [page]);

    const extra = (
        <>
        <Form layout={'inline'} form={form}>
            <Form.Item name="created_at" label="起止时间">
                <RangePicker
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={setDate}
                    // onOk={setDate}
                    placeholder={['开始时间', '截止时间']}
                />
            </Form.Item>
            <Form.Item name="status" label="交易类型">
                <Select style={{width: '100px'}} onChange={val => setType(val)}>
                    <Select.Option value="0">所有</Select.Option>
                    <Select.Option value="1">充值</Select.Option>
                    {/* <Select.Option value="2">提现</Select.Option> */}
                    <Select.Option value="3">购买燃气</Select.Option>
                    <Select.Option value="4">购买存储</Select.Option>
                    <Select.Option value="5">API费用</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item name="address" label="合约地址">
                <Input onChange={(val) => setAddress(val.target.value)} style={{width: '300px'}} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" onClick={async () => {
                    const filter = {
                        started_at: startAt,
                        ended_at: endAt,
                        type,
                        address,
                    };
                    await refreshItems(page, 10, filter);
                    await getExportData(filter);
                }}>搜索</Button>
            </Form.Item>
            <Form.Item>
                {downloadContent && <TextDownloader content={downloadContent} filename='交易明细.csv' label='导出CSV' type='text/csv'/>}
            </Form.Item>
        </Form>
        </>
    );

    return (
        <div style={{flexGrow:1}}>
            <RainbowBreadcrumb items={['设置', '用户中心']} />
            <Card>
                <div style={{width: '200px', float: 'left'}}>
                    <span style={{display: 'block',color: 'gray', fontSize: '14px'}}>账户余额</span>
                    <span className='user-balance'>¥ {(balance / 100).toFixed(2)}</span>
                    <a href="https://nftrainbow.cn/financial-agreement.html" target='_blank' rel="noreferrer">
                        <span style={{display: 'block',color: 'gray', fontSize: '14px'}}>
                            用户协议
                        </span>
                    </a>
                </div>
                <div style={{width: '100px', float: 'right'}}>
                    <Tooltip title={billText}>
                        <Text type='secondary'>开票说明</Text>
                    </Tooltip>
                    <div style={{marginTop: '5px'}}><Button type='primary' onClick={() => setIsModalVisible(true)}>充值</Button></div>
                </div>
            </Card>
            <Card style={{marginTop: '20px'}} extra={extra} title={<>
                <span>收支明细</span>
                <span style={{display: 'inline-block', marginLeft: '10px', color: '#F0955F', fontSize: '12px'}}><InfoCircleOutlined /> 部分费用(NFT铸造费用，接口调用费用)每日定时结算，消费明细展示会有延迟</span>
            </>}>
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