import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { Card, Button, TablePaginationConfig, type MenuProps, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { ActivityItem } from '../../models';
import CreatePOA from './createActivities';
import { columns } from './tableHelper';
import { getActivities } from '@services/activity';

const dropItems: MenuProps['items'] = [
  { label: '盲盒活动', key: 1 },
  { label: '单个活动', key: 2 },
];

export const useActivitiesStore = create<{ total: number; page: number; limit: number; items: Array<ActivityItem>; setPage: (page: number) => void; getItems: VoidFunction }>(
  (set, get) => ({
    total: 0,
    items: [],
    page: 1,
    limit: 10,
    setPage: (newPage: number) => set({ page: newPage }),
    getItems: async () =>
      getActivities({ page: get().page ?? 10, limit: 10 }).then((res) => {
        set({ total: res.count, items: res.items });
      }),
  })
);

export default function Poaps() {
  const items = useActivitiesStore((state) => state.items);
  const total = useActivitiesStore((state) => state.total);
  const page = useActivitiesStore((state) => state.page);
  const setPage = useActivitiesStore((state) => state.setPage);
  const getItems = useActivitiesStore((state) => state.getItems);

  const [activityType, setActivityType] = useState(-1);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const hideModal = () => {
    setIsActivityModalVisible(false);
  };

  useEffect(() => {
    getItems();
  }, [page, isActivityModalVisible]);

  const extra = (
    <Dropdown
      key="create-activity"
      trigger={['click']}
      menu={{
        items: dropItems,
        onClick: (e) => {
          setActivityType(parseInt(e.key));
          setIsActivityModalVisible(true);
        },
      }}
    >
      <div className="h-[32px] flex items-center justify-center px-[4px] border border-solid border-[#6953EF] text-[#6953EF] rounded-[6px]">
        创建活动
        <DownOutlined />
      </div>
    </Dropdown>
  );
  
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
              <Button onClick={() => form?.resetFields()} key={resetText}>
                {resetText}
              </Button>,
              extra,
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
              await getItems();
              return { success: true };
            } catch {
              return { success: false };
            }
          }}
          onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        />
      </Card>
      <CreatePOA activityType={activityType} open={isActivityModalVisible} onCancel={() => setIsActivityModalVisible(false)} hideModal={hideModal} />
    </>
  );
}
