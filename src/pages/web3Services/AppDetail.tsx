import React, { useEffect, useState } from 'react';
import {
    Card, Tabs, Typography, Select,
    Space, 
} from "antd";
import type { TabsProps } from 'antd';
import { getAppWeb3ServiceKey } from '@services/app';
import { AppWeb3ServiceMeta } from '@models/App';
import { useParams } from 'react-router-dom';
const { Title, Text } = Typography;

export default function Web3AppDetail() {
    const {id} = useParams<{id: string}>();
    const onChange = (key: string) => {
        console.log(key);
    };
      
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '项目详情',
            children: <AppDetail id={id as string} />,
        },
        {
            key: '2',
            label: '服务用量',
            children: '当前项目各服务用量',
        },
    ];

    return (
        <>
            <Card style={{flexGrow:1}}>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Card>
        </>
    );
}

function AppDetail ({id}: {id: string}) {
    const [appKeyInfo, setAppKeyInfo] = useState<AppWeb3ServiceMeta|null>(null);

    const [net1, setNet1] = useState<string>('main');
    const [net2, setNet2] = useState<string>('main');
    const [net3, setNet3] = useState<string>('main');
    const [net4, setNet4] = useState<string>('main');
    
    useEffect(() => {
        getAppWeb3ServiceKey(id).then((res) => {
            setAppKeyInfo(res);
        });
    }, [id]);

    return (
        <>
        { appKeyInfo && 
            <div>
                <p>项目名称: {appKeyInfo.name}</p>
                <div style={{marginBottom: "20px"}}>API Key: <Text copyable>{appKeyInfo.api_key}</Text></div>
                <Title level={5}>RPC 网络</Title>
                <div>
                    <Space>
                        <Text>Conflux Core</Text>
                        <Select style={{width: '100px'}} onChange={val => setNet1(val)} value={net1}>
                            <Select.Option value='main'>主网</Select.Option>
                            <Select.Option value='test'>测试网</Select.Option>
                        </Select>
                        <Text copyable code>{net1 === 'main' ? appKeyInfo.rpc_urls.cspace.main : appKeyInfo.rpc_urls.cspace.test}</Text>
                    </Space>
                </div>
                <div className='mt-10'>
                    <Space>
                        <Text>Conflux eSpace</Text>
                        <Select style={{width: '100px'}} onChange={val => setNet2(val)} value={net2}>
                            <Select.Option value='main'>主网</Select.Option>
                            <Select.Option value='test'>测试网</Select.Option>
                        </Select>
                        <Text copyable code>{net2 === 'main' ? appKeyInfo.rpc_urls.espace.main : appKeyInfo.rpc_urls.espace.test}</Text>
                    </Space>
                </div>
                <div className='mt-20'></div>
                <Title level={5}>Scan API</Title>
                <div>
                    <Space>
                        <Text>Conflux Core</Text>
                        <Select style={{width: '100px'}} onChange={val => setNet3(val)} value={net3}>
                            <Select.Option value='main'>主网</Select.Option>
                            <Select.Option value='test'>测试网</Select.Option>
                        </Select>
                        <Text copyable code>{net3 === 'main' ? appKeyInfo.scan_urls.cspace.main : appKeyInfo.scan_urls.cspace.test}</Text>
                    </Space>
                </div>
                <div className='mt-10'>
                    <Space>
                        <Text>Conflux eSpace</Text>
                        <Select style={{width: '100px'}} onChange={val => setNet4(val)} value={net4}>
                            <Select.Option value='main'>主网</Select.Option>
                            <Select.Option value='test'>测试网</Select.Option>
                        </Select>
                        <Text copyable code>{net4 === 'main' ? appKeyInfo.scan_urls.espace.main : appKeyInfo.scan_urls.espace.test}</Text>
                    </Space>
                </div>
            </div>
        }
        </>
    );
}