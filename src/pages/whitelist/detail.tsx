import React, { useEffect, useState } from 'react';
import {
    Card, Button, Table, Space, TablePaginationConfig,
    Popconfirm, Modal, message,
} from "antd";
import { CertificateItem } from '@models/Whitelist';
import { getCertificateDetail, deleteCertificateItems, addCertificateItems} from '@services/whitelist';
import { useParams } from 'react-router-dom';
import { SettingOutlined } from '@ant-design/icons';
import EditableTable, { DataType } from './editableTable';
import ParseLocalFile from '../mint/parseLocalFile';
import { isCfxAddress } from '@utils/addressUtils/index';
import { isPhone } from '@utils/format';

interface Item {
    id: number;
    item: string;
}

export default function Page() {
    const id = useParams<{id: string}>().id as unknown as number;
    
    const [items, setItems] = useState<Item[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [type, setType] = useState<string>('phone');
    const [trigger, setTrigger] = useState(1);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: '凭证',
            dataIndex: 'item',
        },
        {
            title: '操作',
            render: (text: string, record: Item) => {
                return <Space>
                    <Popconfirm
                        title="删除条目"
                        description="确定删除该条目?"
                        onConfirm={async ()=>{
                            await deleteCertificateItems(id, [record.id]);
                            setTrigger(trigger + 1);
                        }}
                        onCancel={()=>{}}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type='link'>删除</Button>
                    </Popconfirm>
                </Space>
            }
        },
    ];

    useEffect(() => {
        getCertificateDetail(id, page, 10).then((res) => {
            setCount(res.count);
            setType(res.certificate_type);
            const items = res.items || [];
            setItems(items.map((item: CertificateItem) => ({
                id: item.id,
                item: item.address || item.phone,
            })));
        });
    }, [page, id, trigger]);

    return (
        <>
            <Card 
                title='凭证内容列表'
                style={{flexGrow:1}} 
                extra={<>
                    <ItemAddModal id={id} type={type} updateTrigger={setTrigger} />
                </>}
            >
                <Table 
                    rowKey={'id'}
                    dataSource={items}
                    columns={columns}
                    pagination={{
                        total: count,
                        current: page,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
                />
            </Card>
        </>
    );
}

function ItemAddModal(props: {id: number, type?: string, updateTrigger: (trigger: number) => void}) {
    const { id, type, updateTrigger } = props;
    const [visible, setVisible] = useState(false);
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [count, setCount] = useState(0);

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
        setCount(count - 1);
    };

    const handleAdd = () => {
        const newData: DataType = {
          key: count,
          name: `Input Here`,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
    };
    
    const handleSave = (row: DataType) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };

    const handleUpload = (data: any[]) => {
        setDataSource(data.map((item, index) => ({key: index, name: item.Item})));
        setCount(data.length);
    }

    const onAddItem = async () => {
        try {
            const items: object[] = dataSource.map(item => ({[type as unknown as string]: item.name.toString()}));
            if (items.length === 0) return;
            // 检查地址或手机号格式
            if (type === 'phone') {
                const invalid = items.filter(item => !isPhone((item as {phone: string}).phone));
                if (invalid.length > 0) {
                    // @ts-ignore
                    message.error(`手机号格式错误: ${invalid.map(item => item.phone).join(', ')}`);
                    return;
                }
            }
            if (type === 'address') {
                const invalid = items.filter(item => !isCfxAddress((item as {address: string}).address));
                if (invalid.length > 0) {
                    // @ts-ignore
                    message.error(`地址格式错误: ${invalid.map(item => item.address).join(', ')}`);
                    return;
                }
            }
            await addCertificateItems(id, items);
            setVisible(false);
            updateTrigger(parseInt((Math.random() * 10000).toString()));
            setDataSource([]);
            setCount(0);
        } catch (error) {
            // @ts-ignore
            message.error(error.message);
        }
    }

    return (
        <>
            <Button type='primary' onClick={() => setVisible(true)}>添加凭证</Button>
            <Modal 
                open={visible} 
                title='添加条目'
                okText='添加'
                cancelText='取消'
                onCancel={() => setVisible(false)}
                onOk={onAddItem}
                width={800}
            >
                <div>
                    <Space>
                        <Button icon={<SettingOutlined />} onClick={handleAdd}>添加一行</Button>
                        <ParseLocalFile handleData={handleUpload}/>
                        <a href='/whitelist.csv' download={'whitelist.csv'}><Button type='link'>下载模板</Button></a>
                    </Space>
                </div>
                <div className='mt-20' style={{maxWidth: '700px'}}>
                    <EditableTable dataSource={dataSource} handleDelete={handleDelete} handleSave={handleSave} />
                </div>
            </Modal>
        </>
    );
}