import { ActivityItem } from '../../models';
import { Card, Button, Table, Form, Select, TablePaginationConfig, message, Tooltip } from 'antd';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { mapChainName, formatDate, short, scanTxLink, scanAddressLink, mapNFTType, mapChainNetworId } from '../../utils';
export const Fackeddata: ActivityItem[] = [
  {
    id: 40665,
    contract_address: 'cfxtest:23333',
    chain_type: 1029,
    activity_name: 'crazy money',
    activity_type: '单个活动',
    start_time: '2022-12-15',
    create_time: '2022-11-10 14:30:00',
  },
  {
    id: 40603,
    contract_address: 'cfxtest:23333',
    chain_type: 1029,
    activity_name: 'MakeMeRich',
    activity_type: '单个活动',
    start_time: '2022-12-15',
    create_time: '2022-11-10 14:30:00',
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

export const columns = [
  {
    title: '活动 ID',
    dataIndex: 'id',
  },
  {
    title: '合约地址',
    dataIndex: 'contract_address',
  },
  {
    title: '区块链',
    dataIndex: 'chain_type',
    render: mapChainName,
  },
  {
    title: '活动名称',
    dataIndex: 'activity_name',
  },
  {
    title: '活动类型',
    dataIndex: 'activity_type',
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
  },
];

