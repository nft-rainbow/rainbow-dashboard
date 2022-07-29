import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
  App,
  getAppDetail,
  getAppContracts,
  getAppNfts,
  getAppMetadatas,
  getAppFiles,
  File,
  Metadata,
  // getAppNftsOfContract 
} from '../../services/app';
import { NFT, Contract } from '../../services';
import { 
  Card, 
  Tabs, 
  Table, 
  TablePaginationConfig, 
  Tooltip, 
  Space, 
  Button, 
  Modal,
  Typography,
} from 'antd';
import { SERVICE_HOST } from '../../config';
import { mapChainName, formatDate, short, scanTxLink, mapSimpleStatus, scanNFTLink, mapNFTType } from '../../utils';
const { TabPane } = Tabs;
const { Text } = Typography;

export default function AppDetail() {
  const { id } = useParams();
  const [app, setApp] = useState<App | {}>({});
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>(["应用详情"]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const onChange = (key: string) => {
    console.log("Switch to tab: ", key);
  };

  useEffect(() => {
    getAppDetail(id as string).then(data => {
      setApp(data);
      setBreadcrumbItems(["应用详情", data.name]);
    });
  }, [id]);

  const idStr = id as string;

  const extraOp = (
    <Space>
      <Button type='primary' onClick={() => setIsDetailModalVisible(true)}>查看AppKey</Button>
      <Button type='primary'>铸造藏品</Button>
    </Space>
  );

  return (
    <div className="App">
      <RainbowBreadcrumb items={breadcrumbItems} />
      <Card>
        <Tabs defaultActiveKey="1" onChange={onChange} tabBarExtraContent={extraOp}>
          <TabPane tab="数字藏品" key="1">
            <AppNFTs id={idStr} />
          </TabPane>
          <TabPane tab="合约" key="2">
            <AppContracts id={idStr} />
          </TabPane>
          <TabPane tab="元数据" key="3">
            <AppMetadatas id={idStr} />
          </TabPane>
          <TabPane tab="文件" key="4">
            <AppFiles id={idStr} />
          </TabPane>
        </Tabs>
      </Card>
      <Modal title='应用详情' visible={isDetailModalVisible} onOk={() => setIsDetailModalVisible(false)} onCancel={() => setIsDetailModalVisible(false)}>
        <p>App Id: <Text code>{(app as App).app_id}</Text></p>
        <p>App Secret: <Text code>{(app as App).app_secret}</Text></p>
        <p>Service Host: <Text code>{SERVICE_HOST}</Text></p>
      </Modal>
    </div>
  );
}

function AppNFTs(props: {id: string}) {
  const { id } = props;
  const [items, setItems] = useState<NFT[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // TODO: display metadata and picture
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      key: 'chain_type',
      render: mapChainName,
    },
    {
      title: 'ChainID',
      dataIndex: 'chain_id',
      key: 'chain_id',
    },
    {
      title: '合约',
      dataIndex: 'contract',
      key: 'contract',
      render: (text: string) => <Tooltip title={text}><span>{short(text)}</span></Tooltip>,
    },
    {
      title: '接受地址',
      dataIndex: 'mint_to',
      key: 'mint_to',
      render: (text: string) => <Tooltip title={text}><span>{short(text)}</span></Tooltip>,
    },
    {
      title: 'TokenID',
      dataIndex: 'token_id',
      key: 'token_id',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanNFTLink(record.chain_type, record.chain_id, record.contract, record.token_id)}>{text}</a>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: mapSimpleStatus,
    },
    {
      title: '哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDate,
    },
  ];

  useEffect(() => {
    getAppNfts(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page]);

  return (
    <>
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
    </>
  );
}

function AppContracts(props: {id: string}) {
  const { id } = props;
  const [items, setItems] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      key: 'chain_type',
      render: mapChainName,
    },
    {
      title: 'ChainID',
      dataIndex: 'chain_id',
      key: 'chain_id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: mapNFTType
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: mapSimpleStatus,
    },
    {
      title: '合约',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => <Tooltip title={text}><span>{short(text)}</span></Tooltip>,
    },
    {
      title: '管理员',
      dataIndex: 'owner_address',
      key: 'owner_address',
      render: (text: string) => <Tooltip title={text}><span>{short(text)}</span></Tooltip>,
    },
    {
      title: '哈希',
      dataIndex: 'hash',
      key: 'hash',
      render: (text: string, record: Contract) => <a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDate,
    },
  ];

  useEffect(() => {
    getAppContracts(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page]);

  return (
    <>
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
    </>
  );
}

function AppMetadatas(props: {id: string}) {
  const { id } = props;
  const [items, setItems] = useState<Metadata[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: '名字',
      dataIndex: ['metadata', 'name'],
    },
    {
      title: '操作',
      dataIndex: ['metadata', 'file'],
      render: (text: string, item: Metadata) => (<Space>
        <a target="_blank" rel="noreferrer" href={item.metadata.file}>文件</a>
        <a target="_blank" rel="noreferrer" href={item.uri}>Metadata</a>
      </Space>),
    }
  ];

  useEffect(() => {
    getAppMetadatas(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page]);

  return (
    <>
      <Table 
        rowKey='uri'
        dataSource={items} 
        columns={columns}
        pagination={{
          total,
          current: page,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
      />
    </>
  );
}

function AppFiles(props: {id: string}) {
  const { id } = props;
  const [items, setItems] = useState<File[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text: string, record: File) => <a target="_blank" rel="noreferrer" href={record.file_url}>{text}</a>,
    },
    {
      title: '文件类型',
      dataIndex: 'file_type',
      key: 'file_type',
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
    },
  ];

  useEffect(() => {
    getAppFiles(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page]);

  return (
    <>
      <Table 
        rowKey='file_name'
        dataSource={items} 
        columns={columns}
        pagination={{
          total,
          current: page,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
      />
    </>
  );
}
