import { ActivityItem } from '../../models';
import type { ProColumns } from '@ant-design/pro-components';
import { Tooltip } from 'antd';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import ActivityLink from '@assets/icons/activityLink.svg';
import AirDrop from '@assets/icons/airDrop.svg';
import ManageActivity from '@assets/icons/manageActivity.svg';
import ManageCollection from '@assets/icons/manageCollection.svg';
import WebLink from '@assets/icons/webLink.svg';
import { chainTypeToName, timestampToDay, timestampToSecond } from '../../utils';
export const Fackeddata: ActivityItem[] = [
  {
    id: 40665,
    contract_address: 'cfxtest:233334',
    chain_type: 1029,
    activity_name: 'crazy money',
    activity_type: '单个活动',
    start_time: 1675841707,
    create_time: 1675841707,
  },
  {
    id: 40603,
    contract_address: 'cfxtest:233335',
    chain_type: 1,
    activity_name: 'MakeMeRich',
    activity_type: '单个活动',
    start_time: 1675881999,
    create_time: 1675881999,
  },
];

export const mapSimpleStatus = (status: number, error: string) => {
  switch (status) {
    case 0:
      return (
        <Tooltip title="待处理">
          <ClockCircleTwoTone />
        </Tooltip>
      );
    case 1:
      return (
        <Tooltip title="成功">
          <CheckCircleTwoTone />
        </Tooltip>
      );
    case 2:
      return (
        <Tooltip title={error}>
          <CloseCircleTwoTone twoToneColor={'#e3422f'} />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title="未知">
          <QuestionCircleTwoTone />
        </Tooltip>
      );
  }
};

export const activityOperations = () => (
  <div className="flex flex-row">
    <Tooltip title="管理活动" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
      <img src={ManageActivity} />
    </Tooltip>
    <Tooltip title="管理藏品" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
      <img src={ManageCollection} />
    </Tooltip>
    <Tooltip title="空投" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
      <img src={AirDrop} />
    </Tooltip>
    <Tooltip title="活动链接" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
      <img src={ActivityLink} />
    </Tooltip>
    <Tooltip title="网页搭建" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
      <img src={WebLink} />
    </Tooltip>
  </div>
);

export const columns: ProColumns<ActivityItem>[] = [
  {
    title: '活动 ID',
    dataIndex: 'id',
    defaultSortOrder: 'descend',
    sorter: (a: ActivityItem, b: ActivityItem) => a.id - b.id,
  },
  {
    title: '合约地址',
    dataIndex: 'contract_address',
  },
  {
    title: '区块链',
    dataIndex: 'chain_type',
    render: (_, record) => chainTypeToName(record.chain_type),
    defaultSortOrder: 'ascend',
    sorter: (a: ActivityItem, b: ActivityItem) => a.chain_type - b.chain_type,
    search: false,
  },
  {
    title: '活动名称',
    dataIndex: 'activity_name',
  },
  {
    title: '活动类型',
    dataIndex: 'activity_type',
    search: false,
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
    render: (_, record) => timestampToDay(record.start_time),
    defaultSortOrder: 'ascend',
    sorter: (a: ActivityItem, b: ActivityItem) => b.start_time - a.start_time,
    search: false,
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
    render: (_, record) => timestampToDay(record.end_time),
    search: false,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    render: (_, record) => timestampToSecond(record.create_time),
    sorter: (a: ActivityItem, b: ActivityItem) => b.create_time - a.create_time,
    search: false,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '177px',
    fixed: 'right',
    render: activityOperations,
    search: false,
  },
];
