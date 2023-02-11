import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Form, Select, TablePaginationConfig, message, Tooltip, Space, Typography } from 'antd';
// import ProTable, { ActionType } from '@ant-design/pro-table';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { ActivityItem } from '../../models';
import CreatePOA from './createActivities';
import { columns } from './tableHelper';
import { mapChainName, formatDate, short, scanTxLink, scanAddressLink, mapNFTType, mapChainNetworId } from '../../utils';
import { getActivities, ActivityFilter } from '@services/activity';

export default function Poaps() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const hideModal = () => {
    setIsActivityModalVisible(false);
  };

  useEffect(() => {
    const filter: ActivityFilter = {};
    // if (appIdFilter !== '0') filter.app_id = parseInt(appIdFilter);
    getActivities(page, 10, filter).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
    // }, [page,appIdFilter]);
  }, []);

  const extra = (
    <Space>
      <Button type="primary" onClick={() => setIsActivityModalVisible(true)}>
        创建活动
      </Button>
    </Space>
  );

  return (
    <>
      <Card title="活动" extra={extra}>
        <ProTable
          rowKey="id"
          scroll={{ x: 1144 }}
          dataSource={items}
          columns={columns}
          search={{ span: 6 }}
          // pagination={{
          //   total,
          //   current: page,
          //   showTotal: (total) => `共 ${total} 条`,
          // }}
          onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        />
      </Card>
      <CreatePOA open={isActivityModalVisible} onCancel={() => setIsActivityModalVisible(false)} hideModal={hideModal} />
    </>
  );
}
