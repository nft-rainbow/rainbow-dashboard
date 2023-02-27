import React, {useState, useEffect, useCallback} from 'react';
import { useParams } from 'react-router-dom';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
  getAppDetail,
  getAppNfts,
  getAppMetadatas,
  getAppFiles,
  File,
  Metadata,
  easyMintUrl,
  getAppAccounts,
} from '../../services/app';
import { createPoap } from '../../services/poap';
import { reMintNFT } from '../../services/NFT';
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
  Radio, Row, Col,
} from 'antd';
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
import { ChainAccount, App, NFT } from '../../models';
import axios from 'axios';
import { FileImageOutlined, ClockCircleTwoTone, CheckCircleTwoTone, CloseCircleTwoTone, QuestionCircleTwoTone } from '@ant-design/icons';
import { address } from 'js-conflux-sdk';
import { LinkOutlined, QuestionCircleOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons/lib";
import {CheckboxChangeEvent} from "antd/es/checkbox";
const { TabPane } = Tabs;
const { Paragraph } = Typography;

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

export default function AppDetail(props: {appId?: string}) {
  const { id: paramId } = useParams();
  const id = paramId || props.appId;
  const [app, setApp] = useState<App | {}>({});
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>(["应用详情"]);
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<ChainAccount[]>([] as ChainAccount[]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isMintModalVisible, setIsMintModalVisible] = useState(false);
  const [isPoapModalVisible, setIsPoapModalVisible] = useState(false);
  const [refreshNftList, setRefreshNftList] = useState(0);
  const [useUpload, setUseUpload] = useState(true);
  const [minting, setMinting] = useState(false);

  const mainnetAccount = ()=>accounts.find(item => item.chain_id === 1029) || { address: "" };
  const testAccount = ()=>accounts.find(item => item.chain_id === 1) || { address: "" };
  const [messageApi, contextHolder] = message.useMessage();
  const fillMintTo = useCallback(()=>{
    const chain = form.getFieldValue("chain")
    if (!chain) {
      messageApi.info('请选择网络!');
      return;
    }
    let setTo = chain==='conflux' ? mainnetAccount().address : testAccount().address;
    form.setFieldsValue({"mint_to_address": setTo || '??'})
  }, [accounts])

  const onNftMint = (values: any) => {
    const {file_url, file_link} = values;
    console.log(file_link, file_url)
    if (!file_url && !file_link) {
      messageApi.warning("请上传图片或者填入图片链接");
      return;
    }
    if (!file_url && file_link) {
      values.file_url = file_link;
    }
    setMinting(true);
    easyMintUrl(id as string, values).then((res) => {
      setIsMintModalVisible(false);
      setRefreshNftList(refreshNftList+1);
    }).catch((err) => {
      message.error(err.response.data.message);
    }).finally(()=>{
      setMinting(false)
    });
  }

  const onCreatePoap = (values: any) => {
    values.total_amount = parseInt(values.total_amount);
    createPoap(id as string, values).then((res) => {
        setIsPoapModalVisible(false);
        form.resetFields();
    }).catch((err) => {
       message.error(err.response.data.message); 
    });
  }

  const closeMintModal = () => setIsMintModalVisible(false);
  const closeDetailModal = () => setIsDetailModalVisible(false);
  const closePoapModal = () => setIsPoapModalVisible(false);

  const idStr = id as string;

  const extraOp = (
    <Space>
        <Button type='dashed' onClick={() => setRefreshNftList(refreshNftList+1)}>刷新</Button>
        <Button type='primary' onClick={() => setIsMintModalVisible(true)}>快捷铸造藏品 <Tooltip title={"快捷铸造使用的是平台内置合约，所有人共用。"}><QuestionCircleOutlined /></Tooltip></Button>
        {/*<Button type='primary' onClick={() => setIsPoapModalVisible(true)}>创建POAP</Button>*/}
        <Button type='primary' onClick={() => setIsDetailModalVisible(true)}>查看AppKey</Button>
    </Space>
  );

  useEffect(() => {
    getAppAccounts(id as string).then(data => setAccounts(data));
    form.setFieldValue("group", "1")
  }, [id, form]);

  useEffect(() => {
    getAppDetail(id as string).then(data => {
      setApp(data);
      setBreadcrumbItems(["项目详情", data.name]);
    });
  }, [id]);

  return (
    <div className="App">
      {contextHolder}
      <RainbowBreadcrumb items={breadcrumbItems} />
      <Card>
        <Tabs defaultActiveKey="1" tabBarExtraContent={extraOp}>
          <TabPane tab="藏品铸造" key="1">
            <AppNFTs id={idStr} refreshTrigger={refreshNftList} setRefreshTrigger={setRefreshNftList}/>
          </TabPane>
          <TabPane tab="元数据" key="2">
            <AppMetadatas id={idStr} refreshTrigger={refreshNftList}/>
          </TabPane>
          <TabPane tab="文件" key="3">
            <AppFiles id={idStr} refreshTrigger={refreshNftList}/>
          </TabPane>
          {/* <TabPane tab="POAP" key="4">
            <AppPoaps id={idStr} />
          </TabPane> */}
        </Tabs>
      </Card>
      <Modal 
        title='应用详情' 
        open={isDetailModalVisible} 
        onOk={closeDetailModal} 
        onCancel={closeDetailModal} 
        okText={'确认'} 
        cancelText={'取消'}
        footer={null}
      >
        <p>AppId: <Paragraph copyable code className='d-inline'>{(app as App).app_id}</Paragraph></p>
        <p>AppSecret: <Paragraph copyable code className='d-inline'>{(app as App).app_secret}</Paragraph></p>
        <p>APIHost: <Paragraph copyable code className='d-inline'>{import.meta.env.VITE_ServiceHost.replace('console', 'api')}</Paragraph></p>
        <p>主网账户: <Paragraph copyable code className='d-inline'>{mainnetAccount.address}</Paragraph></p>
        <p>测试网账户: <Paragraph copyable code className='d-inline'>{testAccount.address}</Paragraph></p>
      </Modal>
      <Modal title='快速铸造' open={isMintModalVisible} onOk={() => form.submit()} onCancel={closeMintModal} cancelButtonProps={{hidden: true}} okButtonProps={{hidden: true}}>
        <Form {...formLayout} form={form} name="control-hooks" onFinish={onNftMint}>
          <Form.Item name="name" label="名字" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name={"img_group"} label="图片">
            <Input.Group>
                <Radio.Group value={useUpload ? 'upload' : 'input'} style={{marginRight: '8px'}} onChange={(e: CheckboxChangeEvent) => {
                  setUseUpload(e.target.value === 'upload')
                }}>
                  <Radio.Button value="upload">本地文件</Radio.Button>
                  <Radio.Button value="input">网络链接</Radio.Button>
                </Radio.Group>

                {useUpload && <Form.Item name="file_url" noStyle rules={[{required: false}]}>
                  <FileUpload
                              accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
                              listType="picture" maxCount={1}
                              onChange={(err: Error, file: any) => form.setFieldsValue({file_url: file.url})}/>
                </Form.Item>}

                {!useUpload &&
                <Input.Group style={{display: 'flex', marginTop:'8px'}}>
                  <Form.Item name="file_link" noStyle style={{flexGrow: 1}}>
                    <Input style={{flexGrow: 1}}/>
                  </Form.Item>
                  <Button type={"text"} onClick={() => {
                    form.setFieldValue('file_link', 'https://console.nftrainbow.cn/nftrainbow-logo-light.png')
                  }} style={{color: "gray"}}>
                    <Tooltip title={"使用测试图片"} mouseEnterDelay={0.1}><LinkOutlined/></Tooltip>
                  </Button></Input.Group>
                }
            </Input.Group>
          </Form.Item>
          <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
            <Radio.Group>
                <Radio.Button value="conflux">树图主网</Radio.Button>
                <Radio.Button value="conflux_test">树图测试网</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name={"group"} label="接受地址">
            <Input.Group compact style={{display:'flex'}}>
              <Form.Item name="mint_to_address" style={{flexGrow:1, border: '0px solid black'}} rules={[
                {required: true, message: '请输入接受地址'},
                ({getFieldValue}) => ({
                  validator: function (_, value) {
                    const isValidAddr = address.isValidCfxAddress(value);
                    if (!isValidAddr) return Promise.reject(new Error('地址格式错误'));
                    const prefix = getFieldValue('chain') === 'conflux' ? 'cfx' : 'cfxtest';
                    const isValidPrefix = value.toLowerCase().split(':')[0] === prefix;
                    if (!isValidPrefix) return Promise.reject(new Error('请输入正确网络的地址'));
                    return Promise.resolve();
                  }
                })
              ]}>
                <Input style={{flexGrow: 1}} placeholder='树图链地址'/>
              </Form.Item>
              <Button type={"text"} onClick={fillMintTo} style={{color: "gray"}}>
                <Tooltip title={"使用App账户地址"} mouseEnterDelay={1}><UserOutlined/></Tooltip>
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item wrapperCol={{offset:4, span: 18}}>
            <Row gutter={24}>
              <Col span={6}><Button htmlType={"reset"}>重置</Button></Col>
              <Col span={6}><Button htmlType={"button"} type={"dashed"} onClick={()=>setIsMintModalVisible(false)}>取消</Button></Col>
              <Col span={6}><Button htmlType={"submit"} type={"primary"} disabled={minting} loading={minting}>确认</Button></Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title='创建POAP' open={isPoapModalVisible} onOk={() => form.submit()} onCancel={closePoapModal} okText={'确认'} cancelText={'取消'}>
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
          <Form.Item name="total_amount" label="发行总量" rules={[{ required: false }]}>
            <Input placeholder='无总量限制留空即可' type='number'/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function AppNFTs(props: { id: string, refreshTrigger: number, setRefreshTrigger: (v: number) => void }) {
  const { id, refreshTrigger = 0, setRefreshTrigger } = props;
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
      render: mapChainName,
    },
    {
      title: 'ChainID',
      dataIndex: 'chain_id',
    },
    {
      title: '类型',
      dataIndex: 'contract_type',
      render: mapNFTType,
    },
    {
      title: '合约',
      dataIndex: 'contract',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: '接受地址',
      dataIndex: 'mint_to',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanAddressLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: 'TokenID',
      dataIndex: 'token_id',
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
      title: '铸造数量',
      dataIndex: 'amount',
    },
    {
      title: (<><span>状态</span> <a href="https://docs.nftrainbow.xyz/api-reference/common-errors" target="_blank" rel="noreferrer" ><InfoCircleOutlined /></a></>),
      dataIndex: 'status',
      render: (text: number, record: NFT) => mapSimpleStatus(text, dealError(record.error)),
    },
    {
      title: '哈希',
      dataIndex: 'hash',
      render: (text: string, record: NFT) => <a target="_blank" rel="noreferrer" href={scanTxLink(record.chain_type, record.chain_id, text)}>{short(text)}</a>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: formatDate,
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (id: number, item: NFT) => {
        return (item.status === 2 && item.error.match('NotEnoughCash')) ? <Button size='small' type='primary' onClick={async () => {
            await reMintNFT(id);
            setRefreshTrigger(refreshTrigger+1);
        }}>重新铸造</Button> : null
      },
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
  }, [id, page, refreshTrigger]);

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

function AppMetadatas(props: { id: string, refreshTrigger: number }) {
  const { id, refreshTrigger = 0 } = props;
  const [items, setItems] = useState<Metadata[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
    },
    {
      title: 'Name(Hover Desc)',
      dataIndex: 'name',
      render: (text: string, record: Metadata) => <Tooltip title={record.description}>{text}</Tooltip>
    },
    {
      title: '图片',
      dataIndex: 'image',
      width: 180,
      render: (text: string) => <Image src={text} alt='NFT'/>
    },
    {
      title: 'MetadataId',
      dataIndex: 'metadata_id',
      render: (text: string, record: Metadata) => <a href={record.uri} target='_blank' rel="noreferrer">{short(text)}</a>
    },
    {
        title: 'ExternalLink',
        dataIndex: 'external_link',
        render: (text: string) => text ? <a href={text} target='_blank' rel="noreferrer">查看</a> : null
    },
    {
        title: 'AnimationUrl',
        dataIndex: 'animation_url',
        render: (text: string) => text ? <a href={text} target='_blank' rel="noreferrer">查看</a> : null
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: formatDate
    }
];

  useEffect(() => {
    getAppMetadatas(id as string, page, 10).then(res => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page, refreshTrigger]);

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

function AppFiles(props: { id: string, refreshTrigger: number }) {
  const { id, refreshTrigger = 0 } = props;
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
  }, [id, page, refreshTrigger]);

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

/* function AppPoaps(props: { id: string }) {
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
            // render: (text: string, record: Poap) => <a target="_blank" rel="noreferrer" href={'#'}>{text}</a>,
        },
        {
            title: '发行数量',
            dataIndex: 'total_amount',
            render: (amount: number) => amount > 0 ? amount : '无限制',
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
} */

function dealError(message: string) {
    if (message.match('NotEnoughCash') || message.match('discarded due to out of balance')) {
        return '合约代付余额不足';
    }
    if (message.match('AccessControl')) {
        return '操作权限错误';
    }
    if (message.match('ERC721: token already minted')) {
        return '该 TokenId 已经被使用';
    }
    if (message.match('NFT: URI different with previous')) {
        return '1155合约，同 TokenId 的 URI 不一致';
    }
    return message;
}