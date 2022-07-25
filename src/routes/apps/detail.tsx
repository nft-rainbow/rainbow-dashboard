import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
  App,
  getAppDetail,
  getAppContracts,
  getAppNfts,
  // getAppFiles,
  // getAppNftsOfContract 
} from '../../services/app';
import { NFT, Contract } from '../../services';
import { Card, Tabs, Table, TablePaginationConfig, Tooltip, Empty } from 'antd';
import { mapChainName, formatDate, short, scanTxLink, mapSimpleStatus, scanNFTLink, mapNFTType } from '../../utils';
const { TabPane } = Tabs;

export default function AppDetail() {
  const { id } = useParams();
  const [, setApp] = useState<App | {}>({});
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>(["应用详情"]);

  const onChange = (key: string) => {
    console.log(key);
  };

  useEffect(() => {
    getAppDetail(id as string).then(data => {
      setApp(data);
      setBreadcrumbItems(["应用详情", data.name]);
    });
  }, [id]);

  /* useEffect(() => {
    getAppFiles(id as string).then(res => {
      console.log('getAppFiles', res);
    });
  }, []); */

  /* useEffect(() => {
    getAppNftsOfContract(id as string).then(res => {
      console.log('getAppNftsOfContract', res);
    });
  }, []); */

  return (
    <div className="App">
      <RainbowBreadcrumb items={breadcrumbItems} />
      <Card>
        <Tabs defaultActiveKey="1" onChange={onChange}>
          <TabPane tab="数字藏品" key="1">
            <AppNFTs id={id as string} />
          </TabPane>
          <TabPane tab="合约" key="2">
            <AppContracts id={id as string} />
          </TabPane>
          <TabPane tab="元数据" key="3">
            <Empty/>
          </TabPane>
          <TabPane tab="文件" key="4">
            <Empty/>
          </TabPane>
        </Tabs>
      </Card>
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
