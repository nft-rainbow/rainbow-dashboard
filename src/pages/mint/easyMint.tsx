import React, { useEffect, useState } from 'react';
import {
    Card, Form, Select, Button, Row, Col,
    message, Input, Radio, Typography,
} from "antd";
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { address } from 'js-conflux-sdk';
import FileUpload from '@components/FileUpload';
import { easyMintUrl, getAllApps } from '@services/app';
import { App as AppModel } from '@models/index';
const { Text } = Typography;

const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
};

export default function EasyMint() {
    const [apps, setApps] = useState<AppModel[]>([]);
    const [appId, setAppId] = useState<number>(0);
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [minting, setMinting] = useState(false);
    const [useUpload, setUseUpload] = useState(true);

    const onNftMint = (values: any) => {
        const { file_url, file_link } = values;
        if (!file_url && !file_link) {
            messageApi.warning('请上传图片或者填入图片链接');
            return;
        }
        if (!file_url && file_link) {
            values.file_url = file_link;
        }
        if (!appId) {
            messageApi.warning('请选择项目');
            return;
        }

        setMinting(true);

        easyMintUrl(appId.toString(), values).then((res) => {
            message.success('铸造任务提交成功,可在项目详情页查看铸造进度');
        }).catch((err) => {
            message.error(err.response.data.message);
        }).finally(() => {
            setMinting(false);
        });
    };

    useEffect(() => {
        getAllApps().then(setApps);
    }, []);

    return (
        <Card title='快捷铸造' style={{flexGrow:1}}>
            <Form {...formLayout} form={form} name="control-hooks" onFinish={onNftMint} style={{ maxWidth: 600 }}>
                <Form.Item name="app_id" label="所属项目" rules={[{ required: true }]}>
                    <Select onChange={val => setAppId(val)} placeholder='请选择项目，新用户需先创建项目'>
                        {apps.map((app) => (
                            <Select.Option key={app.id} value={app.id}>
                            {app.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="name" label="名字" rules={[{ required: true }]}>
                    <Input placeholder='NFT 名字'/>
                </Form.Item>
                <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} placeholder='NFT 描述'/>
                </Form.Item>
                <Form.Item name={'img_group'} label="图片">
                    <Input.Group>
                        <Radio.Group
                            value={useUpload ? 'upload' : 'input'}
                            onChange={(e: CheckboxChangeEvent) => setUseUpload(e.target.value === 'upload')}
                        >
                            <Radio.Button value="upload">本地文件</Radio.Button>
                            <Radio.Button value="input">网络链接</Radio.Button>
                        </Radio.Group>

                        {useUpload && (
                            <Input.Group style={{ display: 'flex', marginTop: '10px' }}>
                                <Form.Item name="file_url" noStyle rules={[{ required: false }]}>
                                    <FileUpload
                                        accept={'.png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae'}
                                        listType="picture"
                                        maxCount={1}
                                        onChange={(err: Error, file: any) => {form.setFieldsValue({ file_url: file.url })}}
                                    />
                                </Form.Item>
                            </Input.Group>
                        )}

                        {!useUpload && (
                            <Input.Group style={{ marginTop: '10px' }}>
                                <Form.Item name="file_link" style={{marginBottom: '0px'}}>
                                    <Input />
                                </Form.Item>
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
                <Form.Item
                    label='接受地址'
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
                <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
                    <Row gutter={24}>
                        <Col span={6}>
                            <Button htmlType={'submit'} type={'primary'} disabled={minting} loading={minting}>
                                确认
                            </Button>
                        </Col>
                        <Col span={6}>
                            <Button htmlType={'reset'} onClick={() => form.resetFields()}>重置</Button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
                    <Text type="secondary">NFT铸造后，可在项目详情页查看</Text>
                </Form.Item>
            </Form>
        </Card>
    );
}