import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { Card, Button, TablePaginationConfig } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ActivityItem, SearchParams } from '@models/index';
import { getActivities } from '@services/activity';
import { throttle } from 'lodash-es';
import { CreatePOAP } from './createActivities';
import { columns } from './tableHelper';

export const useActivitiesStore = create<{ 
    total: number; 
    page: number; 
    limit: number; 
    items: Array<ActivityItem>; 
    setPage: (page: number) => void; 
    getItems: (params?: SearchParams) => void;
}>(
    (set, get) => ({
        total: 0,
        items: [],
        page: 1,
        limit: 10,
        setPage: (newPage: number) => set({ page: newPage }),
        getItems: throttle(
            async (searchParams?: SearchParams) => {
                const res = await getActivities(Object.assign({}, { page: get().page ?? 10, limit: 10 }, searchParams));
                set({ total: res.count, items: res.items });
            },
            333
        ),
    })
);

export default function Poaps() {
    const items = useActivitiesStore((state) => state.items);
    const total = useActivitiesStore((state) => state.total);
    const page = useActivitiesStore((state) => state.page);
    const setPage = useActivitiesStore((state) => state.setPage);
    const getItems = useActivitiesStore((state) => state.getItems);
    const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

    const hideModal = () => {
        setIsActivityModalVisible(false);
    };

    useEffect(() => {
        getItems();
    }, [page, isActivityModalVisible, getItems]);

    return (
        <>
            <Card title="" style={{ flexGrow: 1 }}>
                <ProTable
                    rowKey="activity_id"
                    scroll={{ x: 1144 }}
                    dataSource={items}
                    columns={columns}
                    search={{
                        span: 6,
                        optionRender: ({ searchText, resetText }, { form }) => [
                            <Button type="primary" onClick={() => form?.submit()} key={searchText}>
                                {searchText}
                            </Button>,
                            <Button onClick={() => {form?.resetFields();setPage(1);form?.submit();}} key={resetText}>
                                {resetText}
                            </Button>,
                            <Button key='create-activity' type='primary' onClick={() => setIsActivityModalVisible(true)}>创建活动</Button>,
                        ],
                    }}
                    options={false}
                    pagination={{
                        pageSize: 10,
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    request={async (params, sort, filter) => {
                        try {
                            let searchParams = {
                                activity_id: params.activity_id,
                                contract_address: params.contract_address,
                                name: params.name
                            }
                            await getItems(searchParams);
                            return { success: true };
                        } catch {
                            return { success: false };
                        }
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                />
            </Card>
            <CreatePOAP open={isActivityModalVisible} onCancel={hideModal} hideModal={hideModal} />
        </>
    );
}
