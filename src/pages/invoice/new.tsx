import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Modal, Form, Select,
    message, TablePaginationConfig, Space, Tag, Radio,
    Typography,
} from "antd";
import type { RadioChangeEvent } from 'antd';
import { getInvoiceAvailableFiatLogs, createInvoice, getInvoiceInfoDefault, getInvoiceInfoList } from '@services/invoice';
import { InvoiceInfo } from '@models/Invoice';
import { FiatLog } from '@models/index';
import { formatDate } from '@utils/index';
import { set } from 'lodash-es';
const { Text } = Typography;

// TODO: 开票时, 支持编辑开票信息的邮寄地址等信息
export default function Page() {
    const [invoiceInfoList, setInvoiceInfoList] = useState([]);
    const [invoiceAvailableFiatLogs, setInvoiceAvailableFiatLogs] = useState<FiatLog[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
    const [invoiceType, setInvoiceType] = useState<number>(1);
    const [currentInvoiceInfo, setCurrentInvoiceInfo] = useState<InvoiceInfo|undefined>(undefined);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModal2Open, setIsModal2Open] = useState(false);

    const columns = [
        /* {
            title: 'ID',
            dataIndex: 'id',
        }, */
        {
            title: '交易时间',
            dataIndex: 'created_at',
            render: formatDate,
        },
        {
            title: '订单编号',
            dataIndex: 'order_no',
        },
        {
            title: '消费项目',
            dataIndex: 'type',
        },
        {
            title: '金额(元)',
            dataIndex: 'amount',
            render: (amount: string) => Math.abs(Number(amount))
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onSelect: (record: FiatLog, selected: boolean, selectedRows: FiatLog[], e: any)  => {
            // console.log(record, selected, selectedRows, e);
            if (selected) {
                setSelectedRowKeys([...selectedRowKeys, record.id]);
                setInvoiceAmount(invoiceAmount + Math.abs(Number(record.amount)) * 100);
            } else {
                setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                setInvoiceAmount(invoiceAmount - Math.abs(Number(record.amount)) * 100);
            }
        },
        onSelectAll: (selected: boolean, selectedRows: FiatLog[], changedRow: FiatLog[]) => {
            // console.log(selected, selectedRows, changedRow);
            const amount = changedRow.reduce((prev, curr) => {
                return prev + Math.abs(Number(curr.amount));
            }, 0);
            if (selected) {
                const keys = changedRow.map((row) => row.id);
                setSelectedRowKeys([...selectedRowKeys, ...keys]);
                setInvoiceAmount(invoiceAmount + amount * 100);
            } else {
                const keys = changedRow.map((row) => row.id);
                // @ts-ignore
                setSelectedRowKeys(selectedRowKeys.filter((key) => keys.indexOf(key) === -1));
                setInvoiceAmount(invoiceAmount - amount * 100);
            }
        },
    };

    const createVoice = async () => {
        if (invoiceType === 2 && currentInvoiceInfo?.type === 1) {
            message.warning("若想开具专用发票, 请选择企业信息");
            return;
        }
        if (invoiceType === 2 && currentInvoiceInfo) {
            if (!currentInvoiceInfo.bank || !currentInvoiceInfo.bank_no || !currentInvoiceInfo.address || !currentInvoiceInfo.phone) {
                message.warning("请完善发票信息");
                return;
            }
            if (!currentInvoiceInfo.mail_address || !currentInvoiceInfo.mail_receiver || !currentInvoiceInfo.mail_phone) {
                message.warning("请完善邮寄信息");
                return;
            }
        }

        try {
            await createInvoice({
                fiat_log_ids: selectedRowKeys,
                type: invoiceType,
                invoice_info_id: currentInvoiceInfo?.id,
                // comment: '',
            });
            setIsModalOpen(false);
            message.success("开票成功");
        } catch(e) {
            message.error("开票失败");
        }
    }

    useEffect(() => {
        getInvoiceInfoDefault().then((res) => {
            setCurrentInvoiceInfo(res);
        }).catch(err => {
            message.warning("获取默认发票信息失败, 请先创建发票信息");
        });
    }, []);

    useEffect(() => {
        getInvoiceAvailableFiatLogs(page, 10).then((res) => {
            setInvoiceAvailableFiatLogs(res.items);
            setTotal(res.count);
        });
    }, [page]);

    useEffect(() => {
        getInvoiceInfoList(1, 1000).then(res => {
            setInvoiceInfoList(res.items);
        });
    }, []);

    return (
        <>
            <Card title='选择消费明细' style={{flexGrow:1}}>
                <Table
                    rowKey='id'
                    dataSource={invoiceAvailableFiatLogs}
                    rowSelection={{
                        ...rowSelection,
                    }}
                    columns={columns}
                    pagination={{
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number) }
                />
                <Space>
                    <Button type='primary' onClick={() => {
                        if (selectedRowKeys.length === 0) {
                            message.warning('请选择消费明细');
                            return;
                        }
                        setIsModalOpen(true);
                    }}>开票</Button>
                    <span>开票总金额: {(invoiceAmount / 100).toFixed(2)}</span>
                </Space>
            </Card>
            <Modal 
                title='确认开票信息'
                open={isModalOpen}
                onOk={createVoice}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form>
                    <Form.Item label='发票类型'>
                        <Radio.Group onChange={(e: RadioChangeEvent)=> setInvoiceType(e.target.value)} value={invoiceType}>
                            <Radio value={1}>电子普票</Radio>
                            <Radio value={2}>增值税专用发票</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label='发票总额'>
                        <span>{(invoiceAmount / 100).toFixed(2)}</span>
                    </Form.Item>
                    <Button type='link' style={{float: 'right'}} onClick={() => setIsModal2Open(true)}>更换</Button>
                    <h3>发票信息</h3>
                    <div>
                        {currentInvoiceInfo?.type === 2 ? <Tag color='blue'>企业</Tag> : <Tag color='red'>非企业</Tag>}
                        {currentInvoiceInfo?.is_default ? <Text strong>默认发票信息</Text> : null}
                    </div>
                    <p style={{marginTop: "10px"}}>抬头: {currentInvoiceInfo?.name}</p>
                    <p>税号: {currentInvoiceInfo?.tax_no}a</p>
                    <p>开户行: {currentInvoiceInfo?.bank}a</p>
                    <p>账号: {currentInvoiceInfo?.bank_no}a</p>
                    <p>地址: {currentInvoiceInfo?.address}</p>
                    <p>电话: {currentInvoiceInfo?.phone}a</p>
                    <p>邮寄地址: {currentInvoiceInfo?.mail_address}</p>
                    <p>联系人: {currentInvoiceInfo?.mail_receiver}</p>
                    <p>手机号码: {currentInvoiceInfo?.mail_phone}</p>
                    <p>电子邮箱: {currentInvoiceInfo?.email}</p>
                </Form>
            </Modal>
            <Modal
                title='选择发票信息'
                open={isModal2Open}
                onOk={() => setIsModal2Open(false)}
                onCancel={() => setIsModal2Open(false)}
            >
                <Form>
                    <Form.Item label='发票信息'>
                        <Select onChange={val => {
                            const info = invoiceInfoList.find((info: InvoiceInfo) => info.id === val);
                            setCurrentInvoiceInfo(info);
                        }}>
                            {invoiceInfoList.map((info: InvoiceInfo) => (
                                <Select.Option key={info.id} value={info.id}>{info.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div>
                        {currentInvoiceInfo?.type === 2 ? <Tag color='blue'>企业</Tag> : <Tag color='red'>非企业</Tag>}
                    </div>
                    <p style={{marginTop: "10px"}}>抬头: {currentInvoiceInfo?.name}</p>
                    <p>税号: {currentInvoiceInfo?.tax_no}a</p>
                    <p>开户行: {currentInvoiceInfo?.bank}a</p>
                    <p>账号: {currentInvoiceInfo?.bank_no}a</p>
                    <p>地址: {currentInvoiceInfo?.address}</p>
                    <p>电话: {currentInvoiceInfo?.phone}a</p>
                    <p>邮寄地址: {currentInvoiceInfo?.mail_address}</p>
                    <p>联系人: {currentInvoiceInfo?.mail_receiver}</p>
                    <p>手机号码: {currentInvoiceInfo?.mail_phone}</p>
                    <p>电子邮箱: {currentInvoiceInfo?.email}</p>
                </Form>               
            </Modal>
        </>
    );
}