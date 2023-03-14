import React, { useEffect, useState } from 'react';
import {
    Card, Table, TablePaginationConfig
} from "antd";
import { getAutoSponsoredContracts } from '@services/contract';
import { formatDate, scanAddressLinkByPrefix, short } from '@utils/index';

// TODO 支持在本页面配置自动补充参数

export default function Page() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState(1);

    useEffect(() => {
        getAutoSponsoredContracts(page, 10).then(res => {
            // @ts-ignore
            setContracts(res.items);
            // @ts-ignore
            setTotalCount(res.count);
        });
    }, [page]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '地址',
            dataIndex: 'address',
            render: (addr: string) => <a target="_blank" rel="noreferrer" href={scanAddressLinkByPrefix(addr)}>{short(addr)}</a>,
        },
        {
          title: '是否自动赞助',
          dataIndex: 'auto_sponsor',
          render: (val: boolean) => val ? '是' : '否',
        },
        {
          title: '代付补充阈值(KB)',
          dataIndex: 'storage_recharge_threshold',
        },
        {
          title: '单次代付补充数量(KB)',
          dataIndex: 'storage_recharge_amount',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            render: formatDate,
        }, {
            title: '操作',
        },
    ];

    return (
        <>
            <Card title='代付自动设置合约列表' style={{flexGrow: 1}}>
                <Table
                    rowKey='id'
                    dataSource={contracts}
                    columns={columns}
                    pagination={{
                      total:  totalCount,
                      current: page,
                      showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }}
                />
            </Card>
        </>
    );
}