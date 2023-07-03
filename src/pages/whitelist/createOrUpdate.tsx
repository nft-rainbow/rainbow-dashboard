import React, { useEffect, useState } from 'react';
import {
    Card, Form, Input, Button, Select, Space,
} from "antd";
import { SettingOutlined } from '@ant-design/icons';
import { getCertificateDetail, createCertificate, deleteCertificateItems, addCertificateItems } from '@services/whitelist';
import EditableTable from './editableTable';
import ParseLocalFile from '../mint/parseLocalFile';
const { TextArea } = Input;

interface DataType {
    key: React.Key;
    name: string;
}

export default function WhitelistEditor() {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [count, setCount] = useState(0);
    
    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    const handleAdd = () => {
        const newData: DataType = {
          key: count,
          name: `Your address`,
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

    return (
        <>
            <Card title='凭证管理' style={{flexGrow:1}}>
                <Form 
                    form={form}
                    style={{maxWidth: '600px'}}
                    onFinish={() => {}}
                    onFinishFailed={() => {}}
                >
                    <Form.Item label='标题' name='name' rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label='描述' name='description' rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item label='类型' name='type' rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value='1'>地址</Select.Option>
                            <Select.Option value='2'>手机号</Select.Option>
                            <Select.Option value='3'>快照</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
                <div>
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
                    <div className='mt-20'>
                        <Form.Item wrapperCol={{offset: 4}}>
                            <Button type='primary'>提交</Button>
                        </Form.Item>
                    </div>
                </div>
            </Card>
        </>
    );
}