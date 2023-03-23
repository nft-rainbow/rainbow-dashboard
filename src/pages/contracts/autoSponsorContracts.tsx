import React, { useEffect, useState } from 'react';
import {
    Card, Table, TablePaginationConfig, Input,
} from "antd";
import { getAutoSponsoredContracts } from '@services/contract';
import { formatDate, scanAddressLinkByPrefix, short } from '@utils/index';

// TODO 支持在本页面配置自动补充参数

export default function Page() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [contractFilter, setContractFilter] = useState<string>('');

    useEffect(() => {
        getAutoSponsoredContracts(page, 10, contractFilter).then(res => {
            // @ts-ignore
            setContracts(res.items);
            // @ts-ignore
            setTotalCount(res.count);
        });
    }, [page, contractFilter]);

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

    const extra = (
        <>
            <Input onChange={e => setContractFilter(e.target.value)} placeholder="使用合约地址查询" style={{width: "400px"}}/>
        </>
    );

    return (
        <>
            <Card title='代付自动设置合约列表' style={{flexGrow: 1}} extra={extra}>
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