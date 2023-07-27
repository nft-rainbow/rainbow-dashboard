import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card, Table, Button, Space, TablePaginationConfig,
    Form, Input, Select
} from "antd";
import { Certificate } from '@models/Whitelist'; 
import { getCertificates } from '@services/whitelist';

export default function WhiteList() {
    const [certis, setCertis] = useState<Certificate[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [searchName, setSearchName] = useState('');
    const [searchType, setSearchType] = useState('');
      
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '类型',
            dataIndex: 'certificate_type',
        },
        {
            title: '操作',
            render: (text: string, record: Certificate) => {
                return <Space>
                    <Link to={`/panels/whitelist/detail/${record.id}`}><Button type='link'>查看</Button></Link>
                </Space>
            }
        },
    ];

    useEffect(() => {
        getCertificates(page, 10, {name_like: searchName, certificate_type: searchType}).then((res) => {
            setCertis(res.items);
            setCount(res.count);
        });
    }, [page, searchName, searchType]);
      
    return (
        <>
            <Card title='凭证策略' style={{flexGrow:1}} extra={<>
                <Form layout={'inline'}>
                    <Form.Item label='名称'>
                        <Input value={searchName} onChange={e => setSearchName(e.target.value)}/>
                    </Form.Item>
                    <Form.Item label='类型'>
                        <Select value={searchType} onChange={setSearchType} style={{width: '100px'}}>
                            <Select.Option value=''>全部</Select.Option>
                            <Select.Option value='address'>地址</Select.Option>
                            <Select.Option value='phone'>手机号</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={() => {
                            setSearchName('');
                            setSearchType('');
                        }}>重置</Button>
                    </Form.Item>
                    <Form.Item>
                        <Link to='/panels/whitelist/create'><Button type='primary'>创建凭证</Button></Link>
                    </Form.Item>
                </Form>
            </>}>
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