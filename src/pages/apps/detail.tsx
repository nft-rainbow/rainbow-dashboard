import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import RainbowBreadcrumb from '@components/Breadcrumb';
import { getAppDetail, getAppMetadatas, getAppFiles, File, Metadata, easyMintUrl, getAppAccounts } from '@services/app';
import {
    Card, Tabs, Table, TablePaginationConfig, Tooltip, Space, Button, Modal,
    Typography, Form, Input, message, Image, Radio, Row, Col, TabsProps
} from 'antd';
import { formatDate, short } from '@utils/index';
import FileUpload from '@components/FileUpload';
import { ChainAccount, App } from '@models/index';
import { address } from 'js-conflux-sdk';
import { LinkOutlined, QuestionCircleOutlined, UserOutlined } from '@ant-design/icons/lib';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { AppNFTs } from "@pages/apps/MintTasks";
const { Paragraph, Text } = Typography;

const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

// SJR: show status in icons

export default function AppDetail(props: { appId?: string, pageLimit?: number }) {
  const { id: paramId } = useParams();
  const id = paramId || props.appId;
  const [app, setApp] = useState<App | {}>({});
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>(['应用详情']);
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<ChainAccount[]>([] as ChainAccount[]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isMintModalVisible, setIsMintModalVisible] = useState(false);
  const [refreshNftList, setRefreshNftList] = useState(0);
  const [useUpload, setUseUpload] = useState(true);
  const [minting, setMinting] = useState(false);

  const mainnetAccount = () => accounts.find((item) => item.chain_id === 1029) || { address: '' };
  const testAccount = () => accounts.find((item) => item.chain_id === 1) || { address: '' };
  const [messageApi, contextHolder] = message.useMessage();
  
  const fillMintTo = useCallback(() => {
    const chain = form.getFieldValue('chain');
    if (!chain) {
      messageApi.info('请选择网络!');
      return;
    }
    let setTo = chain === 'conflux' ? mainnetAccount().address : testAccount().address;
    form.setFieldsValue({ mint_to_address: setTo || '??' });
  }, [accounts]);

  const onNftMint = (values: any) => {
    const { file_url, file_link } = values;
    if (!file_url && !file_link) {
      messageApi.warning('请上传图片或者填入图片链接');
      return;
    }
    if (!file_url && file_link) {
      values.file_url = file_link;
    }
    setMinting(true);
    easyMintUrl(id as string, values)
      .then((res) => {
        setIsMintModalVisible(false);
        setRefreshNftList(refreshNftList + 1);
        form.resetFields();
      })
      .catch((err) => {
        message.error(err.response.data.message);
      })
      .finally(() => {
        setMinting(false);
      });
  };

  const closeMintModal = () => setIsMintModalVisible(false);
  const closeDetailModal = () => setIsDetailModalVisible(false);

  const idStr = id as string;

  const extraOp = (
    <Space>
        <Text type="secondary">如果铸造交易长期处于待处理状态，请检查余额是否足够</Text>
        <Button type="dashed" onClick={() => setRefreshNftList(refreshNftList + 1)}>
            刷新
        </Button>
        <Button type="primary" onClick={() => setIsMintModalVisible(true)}>
            快捷铸造藏品{' '}
            <Tooltip title={'快捷铸造使用的是平台内置合约，所有人共用。'}>
                <QuestionCircleOutlined />
            </Tooltip>
        </Button>
        <Button type="primary" onClick={() => setIsDetailModalVisible(true)}>
            查看AppKey
        </Button>
    </Space>
  );

    useEffect(() => {
        getAppAccounts(id as string).then((data) => setAccounts(data));
        form.setFieldValue('group', '1');
    }, [id, form]);

    useEffect(() => {
        getAppDetail(id as string).then((data) => {
            setApp(data);
            setBreadcrumbItems(['项目详情', data.name]);
        });
    }, [id]);
  
    const tabs : TabsProps['items'] = [
        {
            key: '1', 
            label: '藏品铸造', 
            children: <AppNFTs id={idStr} refreshTrigger={refreshNftList} setRefreshTrigger={setRefreshNftList} pageLimit={props.pageLimit} />
        },
        {
            key: '2', 
            label: '元数据', 
            children: <AppMetadatas id={idStr} refreshTrigger={refreshNftList} pageLimit={props.pageLimit} />
        },
        {
            key: '3', 
            label: '文件', 
            children: <AppFiles id={idStr} refreshTrigger={refreshNftList} />
        },
    ]
  return (
    <div className="App" style={{flexGrow:1}}>
        {contextHolder}
        <RainbowBreadcrumb items={breadcrumbItems} />
        <Card>
            <Tabs defaultActiveKey="1" items={tabs} tabBarExtraContent={extraOp} />
        </Card>
        <Modal title="应用详情" open={isDetailModalVisible} onOk={closeDetailModal} onCancel={closeDetailModal} okText={'确认'} cancelText={'取消'} footer={null}>
            <p>
            AppId:{' '}
            <Paragraph copyable code className="d-inline">
                {(app as App).app_id}
            </Paragraph>
            </p>
            <p>
            AppSecret:{' '}
            <Paragraph copyable code className="d-inline">
                {(app as App).app_secret}
            </Paragraph>
            </p>
            <p>
            APIHost:{' '}
            <Paragraph copyable code className="d-inline">
                {import.meta.env.VITE_ServiceHost.replace('console', 'api')}
            </Paragraph>
            </p>
            <p>
            主网账户:{' '}
            <Paragraph copyable code className="d-inline">
                {mainnetAccount().address}
            </Paragraph>
            </p>
            <p>
            测试网账户:{' '}
            <Paragraph copyable code className="d-inline">
                {testAccount().address}
            </Paragraph>
            </p>
        </Modal>
        <Modal title="快捷铸造" open={isMintModalVisible} onOk={() => form.submit()} onCancel={closeMintModal} cancelButtonProps={{ hidden: true }} okButtonProps={{ hidden: true }}>
            <Form {...formLayout} form={form} name="control-hooks" onFinish={onNftMint}>
            <Form.Item name="name" label="名字" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name={'img_group'} label="图片">
                <Input.Group>
                <Radio.Group
                    value={useUpload ? 'upload' : 'input'}
                    style={{ marginRight: '8px' }}
                    onChange={(e: CheckboxChangeEvent) => {
                        setUseUpload(e.target.value === 'upload');
                    }}
                >
                    <Radio.Button value="upload">本地文件</Radio.Button>
                    <Radio.Button value="input">网络链接</Radio.Button>
                </Radio.Group>

                {useUpload && (
                    <Form.Item name="file_url" noStyle rules={[{ required: false }]}>
                    <FileUpload
                        accept={'.png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae'}
                        listType="picture"
                        maxCount={1}
                        onChange={(err: Error, file: any) => {form.setFieldsValue({ file_url: file.url })}}
                    />
                    </Form.Item>
                )}

                {!useUpload && (
                    <Input.Group style={{ display: 'flex', marginTop: '8px' }}>
                    <Form.Item name="file_link" noStyle style={{ flexGrow: 1 }}>
                        <Input style={{ flexGrow: 1 }} />
                    </Form.Item>
                    <Button
                        type={'text'}
                        onClick={() => {
                            form.setFieldValue('file_link', 'https://console.nftrainbow.cn/nftrainbow-logo-light.png');
                        }}
                        style={{ color: 'gray' }}
                    >
                        <Tooltip title={'使用测试图片'} mouseEnterDelay={0.1}>
                        <LinkOutlined />
                        </Tooltip>
                    </Button>
                    </Input.Group>
                )}
                </Input.Group>
            </Form.Item>
            <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
                <Radio.Group>
                <Radio.Button value="conflux">树图主网</Radio.Button>
                <Radio.Button value="conflux_test">树图测试网</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <Form.Item name={'group'} label="接受地址">
                <Input.Group compact style={{ display: 'flex' }}>
                <Form.Item
                    name="mint_to_address"
                    style={{ flexGrow: 1, border: '0px solid black' }}
                    rules={[
                        { required: true, message: '请输入接受地址' },
                        ({ getFieldValue }) => ({
                            validator: function (_, value) {
                                const isValidAddr = address.isValidCfxAddress(value);
                                if (!isValidAddr) return Promise.reject(new Error('地址格式错误'));
                                const prefix = getFieldValue('chain') === 'conflux' ? 'cfx' : 'cfxtest';
                                const isValidPrefix = value.toLowerCase().split(':')[0] === prefix;
                                if (!isValidPrefix) return Promise.reject(new Error('请输入正确网络的地址'));
                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <Input style={{ flexGrow: 1 }} placeholder="树图链地址" />
                </Form.Item>
                <Button type={'text'} onClick={fillMintTo} style={{ color: 'gray' }}>
                    <Tooltip title={'使用App账户地址'} mouseEnterDelay={1}>
                    <UserOutlined />
                    </Tooltip>
                </Button>
                </Input.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
                <Row gutter={24}>
                <Col span={6}>
                    <Button htmlType={'reset'}>重置</Button>
                </Col>
                <Col span={6}>
                    <Button htmlType={'button'} type={'dashed'} onClick={() => setIsMintModalVisible(false)}>
                    取消
                    </Button>
                </Col>
                <Col span={6}>
                    <Button htmlType={'submit'} type={'primary'} disabled={minting} loading={minting} onClick={()=>onNftMint(form.getFieldsValue())}>
                    确认
                    </Button>
                </Col>
                </Row>
            </Form.Item>
            </Form>
        </Modal>
        <Form form={form} name="nothing_but_suppress_antd_warning"/>
    </div>
  );
}

function AppMetadatas(props: { id: string; refreshTrigger: number, pageLimit?: number }) {
  const { id, refreshTrigger = 0, pageLimit } = props;
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
      render: (text: string, record: Metadata) => <Tooltip title={record.description}>{text}</Tooltip>,
    },
    {
      title: '图片',
      dataIndex: 'image',
      width: 180,
      render: (text: string) => <Image src={text} alt="NFT" />,
    },
    {
      title: 'MetadataId',
      dataIndex: 'metadata_id',
      render: (text: string, record: Metadata) => (
        <a href={record.uri} target="_blank" rel="noreferrer">
          {short(text)}
        </a>
      ),
    },
    {
      title: 'ExternalLink',
      dataIndex: 'external_link',
      render: (text: string) =>
        text ? (
          <a href={text} target="_blank" rel="noreferrer">
            查看
          </a>
        ) : null,
    },
    {
      title: 'AnimationUrl',
      dataIndex: 'animation_url',
      render: (text: string) =>
        text ? (
          <a href={text} target="_blank" rel="noreferrer">
            查看
          </a>
        ) : null,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      render: formatDate,
    },
  ];

  useEffect(() => {
    getAppMetadatas(id as string, page, pageLimit || 10).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page, refreshTrigger, pageLimit]);

  return (
    <>
      <Table
        rowKey="uri"
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

function AppFiles(props: { id: string; refreshTrigger: number }) {
  const { id, refreshTrigger = 0 } = props;
  const [items, setItems] = useState<File[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text: string, record: File) => (
        <a target="_blank" rel="noreferrer" href={record.file_url}>
          {text}
        </a>
      ),
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
    getAppFiles(id as string, page, 10).then((res) => {
      setTotal(res.count);
      setItems(res.items);
    });
  }, [id, page, refreshTrigger]);

  return (
    <>
      <Table
        rowKey="file_name"
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
