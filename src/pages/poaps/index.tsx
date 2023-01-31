import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Form, Select, TablePaginationConfig, message, Tooltip, Space, Typography } from 'antd';
import { Contract, App } from '../../models';
import CreatePOA from '../../modules/createPOA';
import { mapChainName, formatDate, short, scanTxLink, scanAddressLink, mapNFTType, mapChainNetworId } from '../../utils';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { listContracts, deployContract, ContractFilter } from '../../services/contract';
import { getAllApps, getAppAccounts } from '../../services/app';
import { Link } from 'react-router-dom';
const { Option } = Select;
const { Paragraph } = Typography;

export default function Poaps() {
  const [items, setItems] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [apps, setApps] = useState<App[]>([]);

  const [form] = Form.useForm();
  const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);

  const [appIdFilter, setAppIdFilter] = useState('0');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '项目',
      dataIndex: 'app_id',
      render: (app_id: number) => <Link to={`/panels/apps/${app_id}`}>{apps.find((item) => item.id === app_id)?.name || app_id}</Link>,
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      render: mapChainName,
    },
    {
      title: 'ChainID',
      dataIndex: 'chain_id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: mapNFTType,
    },
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (text: number) => mapSimpleStatus(text, ''),
    },
    {
      title: '合约',
      dataIndex: 'address',
      render: (text: string, record: Contract) => {
        return text ? (
          <Paragraph copyable={{ text }}>
            <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>
              {short(text)}
            </a>
          </Paragraph>
        ) : null;
      },
    },
    {
      title: '管理员',
      dataIndex: 'owner_address',
      render: (text: string, record: Contract) => (
        <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>
          {short(text)}
        </a>
      ),
    },
    {
      title: '哈希',
      dataIndex: 'hash',
      render: (text: string, record: Contract) => (
        <a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>
          {short(text)}
        </a>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: formatDate,
    },
  ];

  const onContractCreate = async (values: any) => {
    console.log('Create POA', values);
    // const accounts = await getAppAccounts(values.app_id);
    // const chainId = mapChainNetworId(values.chain);
    // const owner = accounts.find(item => item.chain_id === chainId)?.address;
    // if (!owner) { message.info('获取账户失败'); return; }
    // const meta = Object.assign({
    //     is_sponsor_for_all_user: true,
    //     owner_address: owner,
    // }, values);
    // deployContract(values.app_id as string, meta).then((res) => {
    //     setIsActivityModalVisible(false);
    //     form.resetFields();
    // }).catch((err) => {
    //     message.error(err.message);
    // });
  };

  useEffect(() => {
    const filter: ContractFilter = {};
    if (appIdFilter !== '0') filter.app_id = parseInt(appIdFilter);
    listContracts(page, 10, filter).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [page, appIdFilter]);

  useEffect(() => {
    getAllApps().then((res) => {
      setApps(res);
    });
  }, []);

  const extra = (
    <Space>
      <Select
        value={appIdFilter}
        onChange={(val) => {
          setAppIdFilter(val);
        }}
      >
        <Option value="0">全部项目</Option>
        {apps.map((app) => (
          <Option key={app.id} value={app.id}>
            {app.name}
          </Option>
        ))}
      </Select>
      <Button type="primary" onClick={() => setIsActivityModalVisible(true)}>
        创建活动
      </Button>
      {/* <Link to="/panels/contracts/sponsor"><Button type="primary">创建活动</Button></Link> */}
      {/* <Link to="/panels/contracts/deploy"><Button type="primary">创建活动</Button></Link> */}
    </Space>
  );

  return (
    <>
      <Card title="智能合约" extra={extra}>
        {/* <Table
          rowKey="id"
          dataSource={items}
          columns={columns}
          pagination={{
            total,
            current: page,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        /> */}
      </Card>
      <CreatePOA open={isActivityModalVisible} onOk={onContractCreate} onCancel={() => setIsActivityModalVisible(false)} onFinish={onContractCreate} />
    </>
  );
}

const mapSimpleStatus = (status: number, error: string) => {
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
