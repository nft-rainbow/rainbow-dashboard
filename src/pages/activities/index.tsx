import React, { useEffect, useState } from 'react';
import { Card, Button, TablePaginationConfig, type MenuProps, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { ActivityItem } from '../../models';
import CreatePOA from './createActivities';
import { columns } from './tableHelper';
import { getActivities, ActivityQuerier, createActivity } from '@services/activity';

const dropItems: MenuProps['items'] = [
  { label: '盲盒活动', key: 1 },
  { label: '单个活动', key: 2 },
];
export default function Poaps() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activityType, setActivityType] = useState(-1);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const hideModal = () => {
    setIsActivityModalVisible(false);
  };

  useEffect(() => {
    getActivities({ page: page, limit: 10 }).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [isActivityModalVisible]);

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
      <Card title="">
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
            total,
            current: page,
            showTotal: (total) => `共 ${total} 条`,
          }}
          request={async (params, sort, filter) => {
            const name = (params.name as string) ?? '';
            const activity_id = (params.activity_id as string) ?? '';
            const contract_address = (params.contract_address as string) ?? '';
            try {
              const res = await getActivities({ name, activity_id, contract_address });
              setTotal(res.count);
              setItems(res.items);
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
