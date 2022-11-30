import React, { useEffect, useState } from 'react';
import RainbowBreadcrumb from '../../components/Breadcrumb';
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
} from "antd";
import { Contract, App } from '../../models';
import {
    mapChainName,
    formatDate,
    short,
    scanTxLink,
    scanAddressLink,
    mapNFTType,
} from '../../utils';
import { ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { listContracts, deployContract, ContractFilter } from '../../services/contract';
import { getAllApps } from '../../services/app';
import { Link } from "react-router-dom";
const { Option } = Select;

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

const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

/**
    TODO
    1. 测试合约创建
    2. 查看代付，设置代付(only conflux)
 */

export default function Contracts() {
    const [items, setItems] = useState<Contract[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [apps, setApps] = useState<App[]>([]);

    const [form] = Form.useForm();
    const [isDeployModalVisible, setIsDeployModalVisible] = useState(false);

    const [appIdFilter, setAppIdFilter] = useState('0');

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: 'APP',
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
          render: (text: string, record: Contract) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
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
    ];

    const onContractCreate = (values: any) => {
        const meta = Object.assign({
            is_sponsor_for_all_user: true,
            // owner_address: values.chain === 'conflux' ? mainnetAccount.address : testAccount.address,  // TODO: check
        }, values);
        deployContract(values.app_id as string, meta).then((res) => {
            setIsDeployModalVisible(false);
            form.resetFields();
        }).catch((err) => {
            message.error(err.message);
        });
    }

    const closeDeployModal = () => setIsDeployModalVisible(false);  

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
            <Select value={appIdFilter} onChange={val => {console.log(val);setAppIdFilter(val)}}>
                <Option value="0">全部应用</Option>
                {apps.map((app) => <Option key={app.id} value={app.id}>{app.name}</Option>)}
            </Select>
            <Button type="primary" onClick={() => setIsDeployModalVisible(true)}>创建</Button>
        </Space>
    );

    return (
        <>
            <RainbowBreadcrumb items={['合约列表']} />
            <Card extra={extra}>
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
            <Modal title='部署合约' visible={isDeployModalVisible} onOk={form.submit} onCancel={closeDeployModal}>
                <Form {...formLayout} form={form} name="control-hooks" onFinish={onContractCreate}>
                    <Form.Item name="app_id" label="所属应用" rules={[{ required: true }]}>
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
                </Form>
            </Modal>
        </>
    );
}