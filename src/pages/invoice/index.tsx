import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {
    QuestionCircleOutlined,
} from '@ant-design/icons';
import {
    Card, Alert, Button, Tooltip, Table,
    TablePaginationConfig, Row, Col,
} from "antd";
import { Invoice, InvoiceInfo } from '@models/Invoice';
import { getInvoiceAvailableAmount, getInvoiceInfoDefault, getInvoiceList} from '@services/invoice';
import { formatDate } from '@utils/index';

const INVOICE_NOTE = `
    开票须知：
    1、支持通过平台申请开具纸质增值税专用发票或电子普通发票。请您提供正确的交易编号及开票信息（名称、纳税人识别号、地址电话、开户行及账号）。平台将根据您提供的信息开具发票，如您填写有误，平台将不会受理重新开具发票的要求，请务必认真校对所填开票信息。 

    2、发票金额为实际支出并消费的订单金额，不含折扣、积分以及优惠券等方式支付的金额。 

    3、电子普通发票在申请后45个工作日内开具，如需纸质发票可自行下载打印。 
    增值税专用发票在申请后60个工作日内开具并快递到付寄出。发票收件人电话请尽量填写可以联系到您的手机号码，以免影响您收票的时效性。

    4、每自然月仅支持申请一次开票。

    5、可开票金额=总消费金额-已开票金额-不可开金额
    *总消费金额：截止当前总计消费金额
    *已开票金额：历史已经申请过的开票金额
    *不可开金额：系统未结算费用+已超过6个月消费金额
`;

// TODO: 一个账户一个月只有一次开票机会
// TODO: 列表支持过滤
export default function Page() {
    const [availableAmount, setAvailableAmount] = useState<number>(0);
    const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo|undefined>(undefined);
    const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    const columns = [
        {
            title: '申请时间',
            dataIndex: 'created_at',
            render: formatDate,
        },
        {
            title: '发票抬头',
            dataIndex: 'name',
        },
        {
            title: '发票总额',
            dataIndex: 'amount',
            render: (amount: number) => Math.abs(amount).toFixed(2),
        },
        {
            title: '发票类型',
            dataIndex: 'type',
            render: (type: number) => type === 1 ? '普票' : '专票',
        },
        {
            title: '开票状态',
            dataIndex: 'status',
            render: (status: number) => mapInvoiceStatus(status),
        },
        {
            title: '开票时间',
            dataIndex: 'completed_time',
            render: (text: string|undefined) => text ? formatDate(text) : null,
        },
        {
            title: '备注',
            dataIndex: 'comment',
        },
        {
            title: '操作',
            key: 'action',
            render: (text: number, record: Invoice) => record.download_url ? <a href={record.download_url} target='_blank' rel='noreferrer'>下载</a> : null
        }
    ];

    useEffect(() => {
        getInvoiceAvailableAmount().then((res) => {
            setAvailableAmount(Number(res));
        });
    }, []);

    useEffect(() => {
        getInvoiceInfoDefault().then((res) => {
            setInvoiceInfo(res);
        }).catch((err) => {
            console.log('default invoice info error: ', err);
        });
    }, []);

    useEffect(() => {
        getInvoiceList(page, 10).then((res) => {
            setInvoiceList(res.items);
            setTotal(res.total);
        }).catch((err) => {
            console.log('invoice list error: ', err);
        });
    }, [page]);

    return (
        <div style={{display: 'block', flexGrow: 1}}>
            <Alert message={<><span>个人认证账号只能开具个人发票, 如需开具企业发票, 请先完成</span><Link to='/panels/company'>企业认证</Link></>} type="warning" />
            <Card className='mt-15'>
                <Link to='/panels/invoice/new'><Button type='primary' style={{float: 'right'}}>开票</Button></Link>
                <p>可开票金额 <Tooltip title={INVOICE_NOTE}><QuestionCircleOutlined/></Tooltip></p>
                <p style={{fontSize: '22px', fontWeight: 500, marginBottom: '0px'}}>￥{Math.abs(availableAmount).toFixed(2)}</p>
            </Card>
            <Card title='发票信息及地址管理(默认)' className='mt-15' extra={<Link to='/panels/invoice/info'>管理</Link>}>
                {invoiceInfo ? <Row>
                    <Col span={8}> 
                        <div>抬头: {invoiceInfo.name}</div>
                        <div>邮箱: {invoiceInfo.email}</div>
                        {invoiceInfo.type === 2 &&
                            <div>税号: {invoiceInfo.tax_no}</div>
                        }
                    </Col>
                    {invoiceInfo.type === 2 &&
                        <Col span={8}>
                            
                            <div>银行: {invoiceInfo.bank}</div>
                            <div>银行账号: {invoiceInfo.bank_no}</div>
                            <div>地址: {invoiceInfo.address}</div>
                            <div>手机号: {invoiceInfo.phone}</div>
                        </Col>
                    }
                    {invoiceInfo.type === 2 &&
                        <Col span={8}>
                            <div>邮寄地址: {invoiceInfo.mail_address}</div>
                            <div>联系人: {invoiceInfo.mail_receiver}</div>
                            <div>联系人电话: {invoiceInfo.mail_phone}</div>
                        </Col>
                    }
                </Row> : null}
            </Card>
            <Card title='开票记录'  className='mt-15'>
                <Table
                    rowKey='id'
                    dataSource={invoiceList}
                    columns={columns}
                    pagination={{
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number) }
                />
            </Card>
        </div>
    );
}

function mapInvoiceStatus(status: number): string {
    switch(status) {
        case 0:
            return '初始';
        case 1:
            return '开票中';
        case 2:
            return '已开票';
        default:
            return '未知';
    }
}