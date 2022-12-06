import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
  getAppDetail,
  getAppContracts,
  getAppNfts,
  getAppMetadatas,
  getAppFiles,
  File,
  Metadata,
  easyMintUrl,
  getAppAccounts,
} from '../../services/app';
import { createPoap, listPoaps, Poap } from '../../services/poap';
import { NFT } from '../../services';
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
  Form,
  Input,
  message,
  Image,
  Popover,
  Select,
} from 'antd';
import { SERVICE_HOST } from '../../config';
import {
  mapChainName,
  formatDate,
  short,
  scanTxLink,
  scanNFTLink,
  scanAddressLink,
  mapNFTType,
} from '../../utils';
import FileUpload from '../../components/FileUpload';
import { ChainAccount, App, Contract } from '../../models';
import axios from 'axios';
import { FileImageOutlined, ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

// SJR: show status in icons
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

export default function AppDetail() {
  const { id } = useParams();
  const [app, setApp] = useState<App | {}>({});
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>(["应用详情"]);
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<ChainAccount[]>([] as ChainAccount[]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isMintModalVisible, setIsMintModalVisible] = useState(false);
  const [isPoapModalVisible, setIsPoapModalVisible] = useState(false);

  const mainnetAccount = accounts.find(item => item.chain_id === 1029) || { address: "" };
  const testAccount = accounts.find(item => item.chain_id === 1) || { address: "" };

  const onNftMint = (values: any) => {
    easyMintUrl(id as string, values).then((res) => {
      setIsMintModalVisible(false);
      form.resetFields();
    }).catch((err) => {
      message.error(err.message);
    });
  }

  const onCreatePoap = (values: any) => {
    createPoap(id as string, values).then((res) => {
        setIsPoapModalVisible(false);
        form.resetFields();
    }).catch((err) => {
       message.error(err.message); 
    });
  }

  const closeMintModal = () => setIsMintModalVisible(false);
  const closeDetailModal = () => setIsDetailModalVisible(false);
  const closePoapModal = () => setIsPoapModalVisible(false);

  const idStr = id as string;

  const extraOp = (
    <Space>
        <Button type='primary' onClick={() => setIsMintModalVisible(true)}>快捷铸造藏品</Button>
        <Button type='primary' onClick={() => setIsPoapModalVisible(true)}>创建POAP</Button>
        <Button type='primary' onClick={() => setIsDetailModalVisible(true)}>查看AppKey</Button>
    </Space>
  );

  useEffect(() => {
    getAppAccounts(id as string).then(data => setAccounts(data));
  }, [id]);

  useEffect(() => {
    getAppDetail(id as string).then(data => {
      setApp(data);
      setBreadcrumbItems(["应用详情", data.name]);
    });
  }, [id]);

  return (
    <div className="App">
      <RainbowBreadcrumb items={breadcrumbItems} />
      <Card>
        <Tabs defaultActiveKey="1" tabBarExtraContent={extraOp}>
          <TabPane tab="数字藏品" key="1">
            <AppNFTs id={idStr} />
          </TabPane>
          <TabPane tab="元数据" key="2">
            <AppMetadatas id={idStr} />
          </TabPane>
          <TabPane tab="文件" key="3">
            <AppFiles id={idStr} />
          </TabPane>
          <TabPane tab="POAP" key="4">
            <AppPoaps id={idStr} />
          </TabPane>
        </Tabs>
      </Card>
      <Modal title='应用详情' visible={isDetailModalVisible} onOk={closeDetailModal} onCancel={closeDetailModal}>
        <p>AppId: <Text code>{(app as App).app_id}</Text></p>
        <p>AppSecret: <Text code>{(app as App).app_secret}</Text></p>
        <p>APIHost: <Text code>{SERVICE_HOST}</Text></p>
        <p>主网账户: <Text code>{mainnetAccount.address}</Text></p>
        <p>测试网账户: <Text code>{testAccount.address}</Text></p>
      </Modal>
      <Modal title='快速铸造' visible={isMintModalVisible} onOk={() => form.submit()} onCancel={closeMintModal}>
        <Form {...formLayout} form={form} name="control-hooks" onFinish={onNftMint}>
          <Form.Item name="name" label="名字" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="file_url" label="图片" rules={[{ required: true }]}>
            <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ file_url: file.url })} />
          </Form.Item>
          <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
            <Select>
                <Option value="conflux">树图主网</Option>
                <Option value="conflux_test">树图测试网</Option>
            </Select>
          </Form.Item>
          <Form.Item name="mint_to_address" label="接受地址" rules={[{ required: true }]}>
            <Input placeholder='树图链地址' />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title='创建POAP' visible={isPoapModalVisible} onOk={() => form.submit()} onCancel={closePoapModal}>
        <Form {...formLayout} form={form} name="control-hooks" onFinish={onCreatePoap}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="intro" label="简介" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="image_uri" label="图片" rules={[{ required: true }]}>
            <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ image_uri: file.url })} />
          </Form.Item>
          <Form.Item name="contract" label="合约地址" rules={[{ required: true }]}>
            <Input placeholder='树图链地址' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function AppNFTs(props: { id: string }) {
  const { id } = props;
  const [items, setItems] = useState<NFT[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // TODO: display metadata and picture
  const columns = [
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
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: '类型',
      dataIndex: 'contract_type',
      key: 'contract_type',
      render: mapNFTType,
    },
    {
      title: '接受地址',
      dataIndex: 'mint_to',
      key: 'mint_to',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: 'TokenID',
      dataIndex: 'token_id',
      key: 'token_id',
      render: (text: string, record: NFT, index: number) =>
        <>
          <a
            target="_blank"
            rel="noreferrer"
            href={scanNFTLink(record.chain_type, record.chain_id, record.contract, record.token_id)}>
            {text}
          </a>
          {/* SJR: render the preview button */}
          <Tooltip title='预览'>
            <Popover
              placement="right"
              content={<Image width={200} src={images[index]} />}
              trigger='click'>
              <Button
                style={{ border: 'none' }}
                icon={<FileImageOutlined />}
                onClick={() => showNFTImage(record.token_uri, index)}></Button>
            </Popover>
          </Tooltip>
        </>,
    },
    {
      title: 'Mint数量',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: number, record: NFT) => mapSimpleStatus(text, record.error),
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
    setLoading(true);
    getAppNfts(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    }).then(() => {
      setLoading(false);
    });
  }, [id, page]);

  // SJR: click button to load one image
  const showNFTImage = (metadataUri: string, index: number) => {
    let temp: string[] = [];
    if (images[index] != null)
      return;
    else {
      temp = images;
      axios.get(metadataUri)
        .then(res => {
          temp[index] = res.data.image;
        })
      setImages(temp);
    }
  }

  useEffect(() => { }, [images]);

  return (
    <>
      <Table
        rowKey='id'
        dataSource={items}
        columns={columns}
        loading={loading}
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

function AppMetadatas(props: { id: string }) {
  const { id } = props;
  const [items, setItems] = useState<Metadata[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: '名字',
      dataIndex: ['name'],
    },
    {
      title: '操作',
      dataIndex: ['image'],
      render: (text: string, item: Metadata) => (<Space>
        <a target="_blank" rel="noreferrer" href={item.image}>文件</a>
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

function AppFiles(props: { id: string }) {
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

function AppPoaps(props: { id: string }) {
    const { id } = props;
    const [items, setItems] = useState<Poap[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
  
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '标题',
            dataIndex: 'title',
        },
        {
            title: '合约',
            dataIndex: 'contract',
            render: (text: string, record: Poap) => <a target="_blank" rel="noreferrer" href={"#"}>{text}</a>,
        },
        {
            title: 'NextID',
            dataIndex: 'next_id',
        },
        {
            title: 'POAP Link',
            dataIndex: 'id',
            render:   (text: string, record: Poap) => <a target="_blank" rel="noreferrer" href={"https://nftrainbow.cn/poap.html?id="+text}>POAP链接</a>,
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            render: formatDate,
        },
    ];
  
    useEffect(() => {
      listPoaps(id as string, page, 10).then(res => {
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
