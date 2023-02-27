import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    TablePaginationConfig,
} from "antd";

import { userMintCountByMonth } from '../../services/user';

export default function Contracts() {
    const [mintCounts, setMintCounts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const columns = [
        {
            title: '月份',
            dataIndex: 'month',
        },
        {
          title: '铸造量',
          dataIndex: 'count',
        },
    ];

    useEffect(() => {
        userMintCountByMonth().then(res => {
            setTotal(res.count);
            setMintCounts(res.items);
        });
    }, []);

    return (
        <>
            <Card title='每月铸造量'>
                <Table
                    rowKey='id'
                    dataSource={mintCounts}
                    columns={columns}
                    pagination={{
                      total,
                      current: page,
                      showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }}
                />
            </Card>
        </>
    );
}