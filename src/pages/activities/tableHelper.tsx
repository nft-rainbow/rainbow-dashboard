import React, { useEffect, useState } from 'react';
import { ActivityItem } from '../../models';
import type { ProColumns } from '@ant-design/pro-components';
import { Tooltip } from 'antd';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ActivityLink from '@assets/icons/activityLink.svg';
import AirDrop from '@assets/icons/airDrop.svg';
import ManageActivity from '@assets/icons/manageActivity.svg';
import ManageCollection from '@assets/icons/manageCollection.svg';
import WebLink from '@assets/icons/webLink.svg';
import { chainTypeToName, timestampToSecond2, timestampToSecond, turnTimestamp } from '../../utils';
import { shortenCfxAddress } from '@utils/addressUtils';
import { activityTypeTransform, activityTypeTransformEn } from '@utils/activityHelper';
import { useActivitiesStore } from './index';
import ManageActivityModual from './manageActivities';
import ClaimLinkModual from './activityLink';

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

export const ActivityManageIcon: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const [isManageActModalVisible, setIsManageActModalVisible] = useState(false);
  const getItems = useActivitiesStore((state) => state.getItems);
  useEffect(() => { getItems(); }, [isManageActModalVisible]);

  const hideModal = () => {
    setIsManageActModalVisible(false);
  };

  return (
    <>
      <div
        onClick={(e) => {
          setIsManageActModalVisible(true);
        }}
        key={activity.activity_id}
      >
        <Tooltip title="管理活动" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
          <img src={ManageActivity} />
        </Tooltip>
      </div>
      {isManageActModalVisible && <ManageActivityModual open={isManageActModalVisible} hideModal={hideModal} onCancel={hideModal} activity={activity} />}
    </>
  );
};

export const ClaimLinkIcon: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        onClick={(e) => {
          setOpen(true);
        }}
        key={activity.activity_id}
      >
        <Tooltip title="活动链接" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
          <img src={ActivityLink} />
        </Tooltip>
      </div>
      <ClaimLinkModual open={open} onCancle={() => setOpen(false)} activity={activity} />
    </>
  );
};

export const activityOperations: React.FC<ActivityItem> = (activity: ActivityItem) => {
  return (
    <div className="flex flex-row">
      <ActivityManageIcon activity={activity} />
      <Link to={`/panels/poaps/asset/${activityTypeTransformEn(activity.activity_type)}/${activity.activity_id}`}>
        <Tooltip title="管理藏品" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer">
          <img src={ManageCollection} />
        </Tooltip>
      </Link>
      <Tooltip title="空投" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer opacity-30 pointer-events-none">
        <img src={AirDrop} />
      </Tooltip>
      <ClaimLinkIcon activity={activity} />
      {/* <Link to={`/panels/poaps/building/${activity.activity_id}`}> */}
        <Tooltip title="网页搭建" className="px-9px border-r-1px border-r-solid border-#0000000F hover:cursor-pointer opacity-30 pointer-events-none">
          <img src={WebLink} />
        </Tooltip>
      {/* </Link> */}
    </div>
  );
};

export const columns: ProColumns<ActivityItem>[] = [
  {
    title: '活动 ID',
    dataIndex: 'activity_id',
    defaultSortOrder: 'descend',
    sorter: (a: ActivityItem, b: ActivityItem) => a.id - b.id,
  },
  {
    title: '合约地址',
    dataIndex: 'contract_address',
    render: (_, record) => (record.contract_address ? <Tooltip title={record.contract_address}>{shortenCfxAddress(record.contract_address)} </Tooltip> : '--'),
  },
  {
    title: '区块链',
    dataIndex: 'chain_type',
    render: (_, record) => chainTypeToName(record.chain_type, record.chain_id),
    defaultSortOrder: 'ascend',
    sorter: (a: ActivityItem, b: ActivityItem) => a.chain_id - b.chain_id,
    search: false,
  },
  {
    title: '活动名称',
    dataIndex: 'name',
  },
  {
    title: '活动类型',
    dataIndex: 'activity_type',
    render: (_, record) => activityTypeTransform(record.activity_type),
    search: false,
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
    render: (_, record) => timestampToSecond2(record.start_time),
    defaultSortOrder: 'ascend',
    sorter: (a: ActivityItem, b: ActivityItem) => parseInt(b.start_time) - parseInt(a.start_time),
    search: false,
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
    render: (_, record) => timestampToSecond2(record.end_time),
    search: false,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    render: (_, record) => timestampToSecond(record.created_at),
    sorter: (a: ActivityItem, b: ActivityItem) => turnTimestamp(b.created_at) - turnTimestamp(a.created_at),
    search: false,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '177px',
    fixed: 'right',
    render: (_, record) => activityOperations(record),
    search: false,
  },
];
