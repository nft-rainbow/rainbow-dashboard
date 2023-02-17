import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Form, Select, TablePaginationConfig} from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ActivityItem } from '../../models';
import CreatePOA from './createActivities';
import { columns } from './tableHelper';
import { getActivities, ActivityQuerier, createActivity } from '@services/activity';

export default function Poaps() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const hideModal = () => {
    setIsActivityModalVisible(false);
  };

  useEffect(() => {
    getActivities({ page: page, limit: 10 }).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, []);

  const extra = (
    <Button type="primary" onClick={() => setIsActivityModalVisible(true)} key="create-activity">
      创建活动
    </Button>
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
          // pagination={{
          //   total,
          //   current: page,
          //   showTotal: (total) => `共 ${total} 条`,
          // }}
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
      <CreatePOA open={isActivityModalVisible} onCancel={() => setIsActivityModalVisible(false)} hideModal={hideModal} />
    </>
  );
}
