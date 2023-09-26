import React, { useEffect, useState } from 'react';
import {
    Card, Row, Col, Typography, Table, Button,
    TablePaginationConfig, Modal, Select, Space
} from "antd";
import { useParams } from 'react-router-dom';
import { userProfile } from '@services/user';
import { getUserQuota, CostTypeToServiceMap, ServiceNameMap, getLogs, logCountByDate } from '@services/web3Service';
import { getAllApps } from '@services/app';
import { Web3ServiceQuota } from '@models/Service';
import { Column } from '@ant-design/plots';
import { formatDate } from '@utils/index';
const { Text } = Typography;

export default function ServiceDetail() {
    const {service_type} = useParams<{service_type:string}>();
    const [serviceQuota, setServiceQuota] = useState<Web3ServiceQuota | undefined>(undefined);
    const [userId, setUserId] = useState<number>(0);
    const [_logCountByDate, setLogCountByDate] = useState<{count: number}[]>([]);

    const [page, setPage] = useState<number>(1);
    const [total, setTotalLogCount] = useState<number>(0);
    const [logs, setLogs] = useState<{}[]>([]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalData, setModalData] = useState<{}>({});

    const [apps, setApps] = useState<{}[]>([]);
    const [currentAppId, setCurrentAppId] = useState<number>(0);

    useEffect(() => {
        userProfile().then((user) => {
            setUserId(user?.id);
        });
    }, []);

    useEffect(() => {
        if (userId === 0) return;
        getUserQuota(userId).then((res) => {
            const target = res.items.find((item: Web3ServiceQuota) => {
                return item.cost_type.match('test') === null && CostTypeToServiceMap[item.cost_type] === service_type;
            });
            if (target) setServiceQuota(target);
        });
    }, [userId, service_type]);

    useEffect(() => {
        if (userId === 0) return;
        getLogs({
            collection: service_type as string, 
            user_key: userId.toString(),
            app_id: currentAppId.toString(),
        }, page).then((res) => {
            setTotalLogCount(res.count);
            setLogs(res.items);
        });
    }, [service_type, userId, page, currentAppId]);

    useEffect(() => {
        if (userId === 0) return;
        logCountByDate(service_type as string, userId.toString()).then((res) => {
            setLogCountByDate(res.items.reverse());
        });
    }, [service_type, userId]);

    useEffect(() => {
        getAllApps().then((res) => {
            setApps(res);
        });
    }, []);

    console.log('ServiceDetail', serviceQuota);

    // chart config
    const columnConfig = {
        data: _logCountByDate,
        xField: 'id',
        yField: 'count',
        label: {
          // 可手动配置 label 数据标签位置
          position: 'middle',
          // 'top', 'bottom', 'middle',
          // 配置样式
          style: {
            fill: '#FFFFFF',
            opacity: 0.6,
          },
        },
        xAxis: {
          label: {
            autoHide: true,
            autoRotate: false,
          },
        },
        meta: {
          id: {
            alias: '日期',
          },
          count: {
            alias: '请求次数',
          },
        },
    };

    // 
    const tableColumns = [
        {
            title: '请求方法',
            dataIndex: 'method'
        },
        {
            title: service_type?.match('confura') ? '请求方法' : '请求路径',
            dataIndex: 'path',
            render: (text: string, record: object) => {
                if (service_type?.match('confura')) {
                    const body = JSON.parse((record as any).body);
                    let method = '';
                    if (Array.isArray(body)) {
                        method = 'batch';
                    } else {
                        method = body.method;
                    }
                    return <Text ellipsis>{method}</Text>
                } else {
                    return <Text ellipsis>{text}</Text>
                }
            }
        },
        {
            title: '请求IP',
            dataIndex: 'ip',
        },
        {
            title: 'StatusCode',
            dataIndex: 'status_code',
        },
        {
            title: '请求日期',
            dataIndex: 'req_date',
            render: (text: string) => formatDate(text),
        },
        /* {
            title: '请求体',
            dataIndex: 'body',
            render: (text: string) => <Text ellipsis>{text}</Text>
        }, */
        {
            title: '操作',
            dataIndex: 'id',
            render: (a: any, log: any) => {
                return <Button type='link' onClick={() => {
                    setModalData(log);
                    setIsModalOpen(true);
                }}>详情</Button>
            }
        }
    ]

    return (
        <>
            <div style={{flexGrow: 1}}>
                <Row gutter={10}>
                    <Col span={12}>
                        <Card title='近期用量'>
                            <Column {...columnConfig} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        {
                            serviceQuota && <Card title='服务可用量'>
                                <p><Text>服务名称:</Text> <Text strong>{ServiceNameMap[service_type as string]}</Text></p>
                                <p><Text>套餐当日可用量:</Text> <Text strong>{serviceQuota.count_reset.toLocaleString()}次</Text></p>
                                <p><Text>加油包可用量:</Text> <Text strong>{serviceQuota.count_rollover.toLocaleString()}次</Text></p>
                            </Card>
                        }
                    </Col>
                </Row>
                <Row className='mt-10'>
                    <Col span={24}>
                        <Card title='请求日志' extra={<Space>
                                <Select defaultValue={0} style={{width: 120}} onChange={val => setCurrentAppId(val)}>
                                    <Select.Option value={0}>全部</Select.Option>
                                    {
                                        apps.map((app: any) => <Select.Option key={app.id} value={app.id}>{app.name}</Select.Option>)
                                    }
                                </Select>
                                <Button disabled type='primary'>导出日志</Button>
                            </Space>}>
                            <Table 
                                dataSource={logs} 
                                pagination={{
                                    total,
                                    current: page,
                                    showTotal: (total) => `共 ${total} 条`,
                                }} 
                                onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                                key={"id"} 
                                columns={tableColumns} 
                            />
                        </Card>
                        <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={() => setIsModalOpen(false)}>
                            <Text code><pre>{JSON.stringify(modalData, null, 2)}</pre></Text>
                        </Modal>
                    </Col>
                </Row>
            </div>
        </>
    );
}