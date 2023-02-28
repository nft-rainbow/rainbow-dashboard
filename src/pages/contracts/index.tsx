import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, TablePaginationConfig, message, Tooltip, Space, Typography, Switch } from 'antd';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { Drip } from 'js-conflux-sdk';
import { Contract, App, SponsorInfo } from '../../models';
import { mapChainName, formatDate, short, scanTxLink, scanAddressLink, mapNFTType, mapChainNetwork, mapChainNetworId } from '../../utils';
import { listContracts, deployContract, ContractFilter, getContractSponsor, getContractAutoSponsor } from '../../services/contract';
import { getAllApps, getAppAccounts } from '../../services/app';
const { Option } = Select;
const { Paragraph } = Typography;

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

export default function Contracts() {
  const [items, setItems] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [apps, setApps] = useState<App[]>([]);

  const [form] = Form.useForm();
  const [isDeployModalVisible, setIsDeployModalVisible] = useState(false);

  const [appIdFilter, setAppIdFilter] = useState('0');

  const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo | null>(null);
  const [autoSponsorInfo, setAutoSponsorInfo] = useState<boolean>(false);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [isSponsorModalVisible, setIsSponsorModalVisible] = useState(false);

  const [tokensTransferableByUser, setTokensTransferableByUser] = useState(true);

  const columns: ColumnsType<Contract> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
      fixed: 'left',
    },
    {
      title: '项目',
      dataIndex: 'app_id',
      render: (app_id: number) => <Link to={`/panels/apps/${app_id}`}>{apps.find((item) => item.id === app_id)?.name || app_id}</Link>,
      ellipsis: true,
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      render: (text: number, record: Contract) => `${mapChainName(text)}${record.chain_id === 1029 ? '主网' : '测试网'}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: mapNFTType,
    },
    {
      title: '名字',
      dataIndex: 'name',
      ellipsis: true,
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
    {
      title: '操作',
      dataIndex: 'id',
      width: 100,
      fixed: 'right',
      render: (id: number, record: Contract) => {
        if (!record.address) return null;
        return (
          <>
            <Button
              type="primary"
              size="small"
              onClick={async () => {
                setCurrentContract(record);
                const _info = await getContractSponsor(record.address, mapChainNetwork(record.chain_id));
                setSponsorInfo(_info);
                const autoSponsor = await getContractAutoSponsor(record.address);
                // @ts-ignore
                setAutoSponsorInfo(autoSponsor.auto_sponsor);
                setIsSponsorModalVisible(true);
              }}
            >
              查看代付
            </Button>
            <Link to={`/panels/mint/${record.id}`}>铸造</Link>
          </>
        );
      },
    },
  ];

  const onContractCreate = async (values: any) => {
    const accounts = await getAppAccounts(values.app_id);
    const chainId = mapChainNetworId(values.chain);
    const owner = accounts.find((item) => item.chain_id === chainId)?.address;
    if (!owner) {
      message.info('获取账户失败');
      return;
    }
    // default values
    const meta = Object.assign(
      {
        is_sponsor_for_all_user: true,
        owner_address: owner,
        tokens_transferable_by_admin: true,
        tokens_transferable_by_user: tokensTransferableByUser,
      },
      values
    );
    deployContract(values.app_id as string, meta)
      .then((res) => {
        setIsDeployModalVisible(false);
        form.resetFields();
      })
      .catch((err) => {
        message.error(err.message);
      });
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
      <Button type="primary" onClick={() => setIsDeployModalVisible(true)}>
        部署合约
      </Button>
      <Link to="/panels/contracts/sponsor">
        <Button type="primary">设置树图代付</Button>
      </Link>
    </Space>
  );

  return (
    <>
      <Card title="智能合约" extra={extra}>
        <Table
          rowKey="id"
          dataSource={items}
          columns={columns}
          scroll={{ x: 1300 }}
          pagination={{
            total,
            current: page,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        />
      </Card>
      <Modal title="部署合约" open={isDeployModalVisible} onOk={form.submit} onCancel={() => setIsDeployModalVisible(false)} okText={'确认'} cancelText={'取消'}>
        <Form {...formLayout} form={form} name="control-hooks" onFinish={onContractCreate}>
          <Form.Item name="app_id" label="所属项目" rules={[{ required: true }]}>
            <Select>
              {apps.map((app) => (
                <Option key={app.id} value={app.id}>
                  {app.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="chain" label="部署网络" rules={[{ required: true }]}>
            <Select>
              <Option value="conflux">树图主网</Option>
              <Option value="conflux_test">树图测试网</Option>
            </Select>
          </Form.Item>
          <Form.Item name="type" label="合约类型" rules={[{ required: true }]}>
            <Select>
              <Option value="erc721">ERC721</Option>
              <Option value="erc1155">ERC1155</Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="合约名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="symbol" label="通证标识" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tokens_transferable_by_user" label="允许用户转移" rules={[{ required: false }]}>
            <Switch defaultChecked onChange={(checked) => setTokensTransferableByUser(checked)} />
          </Form.Item>
          {/* <Form.Item name="tokens_transferable" label="管理员可转移" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="tokens_burnable" label="管理员可销毁" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item> */}
        </Form>
      </Modal>
      <Modal
        title="合约赞助信息"
        open={isSponsorModalVisible}
        onOk={() => setIsSponsorModalVisible(false)}
        onCancel={() => setIsSponsorModalVisible(false)}
        okText={'确认'}
        cancelText={'取消'}
        footer={null}
      >
        {sponsorInfo ? (
          <div>
            <p>合约地址: {(currentContract as Contract).address}</p>
            <p>燃气赞助商: {(sponsorInfo as SponsorInfo).gas_upper_bound === '0' ? null : (sponsorInfo as SponsorInfo).gas_sponsor}</p>
            <p>燃气赞助余额: {new Drip((sponsorInfo as SponsorInfo).gas_sponsor_balance).toCFX()} BL</p>
            <p>燃气赞助上限: {new Drip((sponsorInfo as SponsorInfo).gas_upper_bound).toGDrip()} GDrip</p>
            <p>存储赞助商: {(sponsorInfo as SponsorInfo).gas_upper_bound === '0' ? null : (sponsorInfo as SponsorInfo).collateral_sponsor}</p>
            <p>存储赞助余额: {new Drip((sponsorInfo as SponsorInfo).collateral_sponsor_balance).toCFX()} KB</p>
            <p>全部白名单: {(sponsorInfo as SponsorInfo).is_all_white_listed ? '开' : '关'}</p>
            <p>自动续费: {autoSponsorInfo ? '开' : '关'}</p>
          </div>
        ) : null}
      </Modal>
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
