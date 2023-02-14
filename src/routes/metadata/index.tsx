import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    TablePaginationConfig,
    Button,
    Tooltip,
    Form,
    Modal,
    Input,
    Space,
    Select,
} from "antd";
import {
    MinusCircleOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import FileUpload from '../../components/FileUpload';
import { getMedtadataList, createMetadata } from '../../services/metadata';
import { getAllApps } from '../../services/app';
import { Metadata, App } from '../../models/';
import { short, formatDate } from '../../utils/';
import { Link } from "react-router-dom";
const { Option } = Select;

const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

export default function Contracts() {
    const [items, setItems] = useState<Metadata[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [apps, setApps] = useState<App[]>([]);

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '项目ID',
            dataIndex: 'app_id',
            render: (app_id: number) => <Link to={`/panels/apps/${app_id}`}>{apps.find(item => item.id === app_id)?.name || app_id}</Link>,
        },
        {
            title: '名称(Hover Desc)',
            dataIndex: 'name',
            render: (text: string, record: Metadata) => <Tooltip title={record.description}>{text}</Tooltip>
        },
        {
            title: '图片',
            dataIndex: 'image',
            render: (text: string) => <img src={text} width={50} alt='NFT'/>
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
        },
        {
            title: '操作',
            dataIndex: 'uri',
            render: (text: string, record: Metadata) => (<>
                <a href={record.uri} target='_blank' rel="noreferrer"><Button type='link'>下载</Button></a>
            </>)
        }
    ];

    const extra = (
        <>
            <Button type='primary' onClick={() => setIsModalVisible(true)}>添加</Button>
        </>
    );

    const createMetadta = async (values: object) => {
        // @ts-ignore
        const appId = values.app_id;
        await createMetadata(appId, values);
        setIsModalVisible(false);
    }

    useEffect(() => {
        getMedtadataList(page, 10).then(res => {
            setTotal(res.count);
            setItems(res.items);
        });
    }, [page]);

    useEffect(() => {
        getAllApps().then(res => {
            setApps(res);
        });
    }, []);

    return (
        <>
            <Card title='元数据管理' extra={extra}>
                <Table
                    rowKey='id'
                    dataSource={items}
                    columns={columns}
                    pagination={{
                      total,
                      current: page,
                      showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }}
                />
            </Card>
            <Modal 
                title='创建元数据' 
                open={isModalVisible} 
                onOk={form.submit} 
                onCancel={() => setIsModalVisible(false)} 
                okText={'确认'} 
                cancelText={'取消'}
            >
                <Form {...formLayout} form={form} name="control-hooks" onFinish={createMetadta}>
                    <Form.Item name="app_id" label="所属项目" rules={[{ required: true }]}>
                        <Select>
                            {apps.map((app) => <Option key={app.id} value={app.id}>{app.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="image" label="图片" rules={[{ required: true }]}>
                        <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ image: file.url })} />
                    </Form.Item>
                    <Form.Item name="animation_url" label="动画文件" rules={[{ required: false }]}>
                        <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ animation_url: file.url })} />
                    </Form.Item>
                    <Form.Item name="name" label="名字" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="external_link" label="外部网站" rules={[{ required: false }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="attributes_" label="属性" rules={[{ required: false }]}>
                        <Form.List name="attributes">
                            {(fields, { add, remove }) => (
                                <>
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>增加</Button>
                                    </Form.Item>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'trait_type']}
                                                rules={[{ required: true, message: 'Missing trait_type' }]}
                                            >
                                                <Input placeholder="trait_type" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                rules={[{ required: true, message: 'Missing value' }]}
                                            >
                                                <Input placeholder="value" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}