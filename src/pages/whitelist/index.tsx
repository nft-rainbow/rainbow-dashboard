import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card, Table, Button, Space, TablePaginationConfig
} from "antd";
import { Certificate } from '@models/Whitelist'; 
import { getCertificates } from '@services/whitelist';

export default function WhiteList() {
    const [certis, setCertis] = useState<Certificate[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
      
    const columns = [
        {
            title: '凭证 ID',
            dataIndex: 'id',
        },
        {
            title: '凭证标题',
            dataIndex: 'name',
        },
        {
            title: '类型',
            dataIndex: 'certificate_type',
        },
        {
            title: '操作',
            render: (text: string) => {
                return <Space>
                    <Button type='link'>查看</Button>
                    <Button type='link'>编辑</Button>
                </Space>
            }
        },
    ];

    useEffect(() => {
        getCertificates(page, 10).then((res) => {
            setCertis(res.items);
            setCount(res.count);
        });
    }, [page]);
      
    return (
        <>
            <Card title='凭证策略' style={{flexGrow:1}} extra={<><Link to='/panels/whitelist/createOrUpdate'><Button type='primary'>创建凭证</Button></Link></>}>
                <Table 
                    rowKey={'id'} 
                    dataSource={certis} 
                    columns={columns} 
                    pagination={{
                        total: count,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                />
            </Card>
        </>
    );
}