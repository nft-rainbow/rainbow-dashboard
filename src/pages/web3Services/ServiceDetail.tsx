import React, { useEffect, useState } from 'react';
import {
    Card,
} from "antd";
import { useParams } from 'react-router-dom';
import { userProfile } from '@services/user';
import { getUserQuota, CostTypeToServiceMap, ServiceNameMap } from '@services/web3Service';
import { Web3ServiceQuota } from '@models/Service';

export default function ServiceDetail() {
    const {service_type} = useParams<{service_type:string}>();
    const [serviceQuote, setServiceQuote] = useState<Web3ServiceQuota | undefined>(undefined);
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
            if (target) setServiceQuote(target);
        });
    }, [userId, service_type]);

    console.log('ServiceDetail', serviceQuote);

    return (
        <>
            {
                serviceQuote && <Card title='Service 详情' style={{flexGrow:1}}>
                    <p>服务名称: {ServiceNameMap[service_type as string]}</p>
                    <p>当天可用量: {serviceQuote.count_reset}</p>
                    <p>永久可用量: {serviceQuote.count_rollover}</p>
                </Card>
            }
        </>
    );
}