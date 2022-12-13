import React, { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Table,
    Modal,
    Form,
    Input,
    Select,
    TablePaginationConfig,
    message,
    Tooltip,
    Space,
    Radio,
    Typography,
} from "antd";
import { Contract, App, SponsorInfo } from '../../models';
import {
    mapChainName,
    formatDate,
    short,
    scanTxLink,
    scanAddressLink,
    mapNFTType,
    mapChainNetwork,
    mapChainNetworId,
} from '../../utils';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { listContracts, deployContract, ContractFilter, getContractSponsor } from '../../services/contract';
import { getAllApps, getAppAccounts } from '../../services/app';
import { Link } from "react-router-dom";
import { Drip } from 'js-conflux-sdk';
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

    const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo|null>(null);
    const [currentContract, setCurrentContract] = useState<Contract|null>(null);
    const [isSponsorModalVisible, setIsSponsorModalVisible] = useState(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '项目',
            dataIndex: 'app_id',
            render: (app_id: number) => <Link to={`/panels/apps/${app_id}`}>{apps.find(item => item.id === app_id)?.name || app_id}</Link>
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
          render: mapNFTType
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
          render: (text: number) => mapSimpleStatus(text, ""),
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
          render: (text: string, record: Contract) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
        },
        {
          title: '哈希',
          dataIndex: 'hash',
          render: (text: string, record: Contract) => <a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          render: formatDate,
        },
        {
          title: '操作',
          dataIndex: 'id',
          render: (id: number, record: Contract) => {
                if (!record.address) return null;
                return (<Button type='primary' size='small' onClick={async () => {
                    setCurrentContract(record);
                    const _info = await getContractSponsor(record.address, mapChainNetwork(record.chain_id));
                    setSponsorInfo(_info);
                    setIsSponsorModalVisible(true);
                }}>查看代付</Button>);
            },
        },
    ];

    const onContractCreate = async (values: any) => {
        const accounts = await getAppAccounts(values.app_id);
        const chainId = mapChainNetworId(values.chain);
        const owner = accounts.find(item => item.chain_id === chainId)?.address;
        if (!owner) {message.info('获取账户失败');return;}
        const meta = Object.assign({
            is_sponsor_for_all_user: true,
            owner_address: owner,
        }, values);
        deployContract(values.app_id as string, meta).then((res) => {
            setIsDeployModalVisible(false);
            form.resetFields();
        }).catch((err) => {
            message.error(err.message);
        });
    }

    useEffect(() => {
        const filter: ContractFilter = {};
        if (appIdFilter !== '0') filter.app_id = parseInt(appIdFilter);
        listContracts(page, 10, filter).then(res => {
          setTotal(res.count);
          setItems(res.items);
        });
    }, [page, appIdFilter]);

    useEffect(() => {
        getAllApps().then(res => {
            setApps(res);
        });
    }, []);

    const extra = (
        <Space>
            <Select value={appIdFilter} onChange={val => {setAppIdFilter(val)}}>
                <Option value="0">全部项目</Option>
                {apps.map((app) => <Option key={app.id} value={app.id}>{app.name}</Option>)}
            </Select>
            <Button type="primary" onClick={() => setIsDeployModalVisible(true)}>部署合约</Button>
            <Link to="/panels/contracts/sponsor"><Button type="primary">树图设置代付</Button></Link>
            {/* <Link to="/panels/contracts/deploy"><Button type="primary">新建合约</Button></Link> */}
        </Space>
    );

    return (
        <>
            <Card title='智能合约' extra={extra}>
                <Table
                    rowKey='id'
                    dataSource={items}
                    columns={columns}
                    pagination={{
                        total,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                />
            </Card>
            <Modal title='部署合约' open={isDeployModalVisible} onOk={form.submit} onCancel={() => setIsDeployModalVisible(false)}>
                <Form {...formLayout} form={form} name="control-hooks" onFinish={onContractCreate}>
                    <Form.Item name="app_id" label="所属项目" rules={[{ required: true }]}>
                        <Select>
                            {apps.map((app) => <Option key={app.id} value={app.id}>{app.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="名字" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="类型" rules={[{ required: true }]}>
                        <Select>
                            <Option value="erc721">ERC721</Option>
                            <Option value="erc1155">ERC1155</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
                        <Select>
                            <Option value="conflux">树图主网</Option>
                            <Option value="conflux_test">树图测试网</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="tokens_transferable" label="管理员可转移" rules={[{ required: true }]}>
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
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title='合约赞助信息' open={isSponsorModalVisible} onOk={() => setIsSponsorModalVisible(false)} onCancel={() => setIsSponsorModalVisible(false)}>
                {
                    sponsorInfo ? (<div>
                        <p>合约地址: {(currentContract as Contract).address}</p>
                        <p>燃气赞助商: {(sponsorInfo as SponsorInfo).gas_upper_bound === '0' ? null : (sponsorInfo as SponsorInfo).gas_sponsor}</p>
                        <p>燃气赞助余额: {new Drip((sponsorInfo as SponsorInfo).gas_sponsor_balance).toCFX()} CFX</p>
                        <p>燃气赞助上限: {new Drip((sponsorInfo as SponsorInfo).gas_upper_bound).toGDrip()} GDrip</p>
                        <p>存储赞助商: {(sponsorInfo as SponsorInfo).gas_upper_bound === '0' ? null : (sponsorInfo as SponsorInfo).collateral_sponsor}</p>
                        <p>存储赞助余额: {new Drip((sponsorInfo as SponsorInfo).collateral_sponsor_balance).toCFX()} CFX</p>
                        <p>全部白名单: {(sponsorInfo as SponsorInfo).is_all_white_listed ? '开' : '关'}</p>
                    </div>) : null
                }
                {/* TODO: {赞助机制详细介绍} */}
            </Modal>
        </>
    );
}

const mapSimpleStatus = (status: number, error: string) => {
    switch (status) {
      case 0:
        return <Tooltip title="待处理"><ClockCircleTwoTone /></Tooltip>;
      case 1:
        return <Tooltip title="成功"><CheckCircleTwoTone /></Tooltip>;
      case 2:
        return <Tooltip title={error}><CloseCircleTwoTone twoToneColor={'#e3422f'} /></Tooltip>;
      default:
        return <Tooltip title="未知"><QuestionCircleTwoTone /></Tooltip>;
    }
}