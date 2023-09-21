import React, { useEffect, useState } from 'react';
import {
    Card, Row, Col, Typography, Table, Button,
    Form, Input, Select
} from "antd";
import { useParams } from 'react-router-dom';
import { userProfile } from '@services/user';
import { getUserQuota, CostTypeToServiceMap, ServiceNameMap, getLogs, logCountByDate } from '@services/web3Service';
import { Web3ServiceQuota } from '@models/Service';
const { Text, Link } = Typography;

export default function ServiceDetail() {
    const {service_type} = useParams<{service_type:string}>();
    const [serviceQuota, setServiceQuota] = useState<Web3ServiceQuota | undefined>(undefined);
    const [userId, setUserId] = useState<number>(0);

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
        getLogs({collection: service_type as string, user_key: userId.toString()}).then((res) => {
            console.log('getLogs', res);
        });
    }, [service_type, userId]);

    useEffect(() => {
        if (userId === 0) return;
        logCountByDate(service_type as string, userId.toString()).then((res) => {
            console.log('logCount', res);
        });
    }, [service_type, userId]);

    console.log('ServiceDetail', serviceQuota);

    return (
        <>
            <Card style={{flexGrow: 1}}>
                <Row gutter={10}>
                    <Col span={12}>
                        {
                            serviceQuota && <Card title='服务可用量'>
                                <p><Text>服务名称:</Text> <Text strong>{ServiceNameMap[service_type as string]}</Text></p>
                                <p><Text>套餐可用量:</Text> <Text strong>{serviceQuota.count_reset.toLocaleString()}次</Text></p>
                                <p><Text>加油包可用量:</Text> <Text strong>{serviceQuota.count_rollover.toLocaleString()}次</Text></p>
                            </Card>
                        }
                    </Col>
                    <Col span={12}>
                        <Card title='近期用量'>
                            
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col></Col>
                </Row>
            </Card>
        </>
    );
}