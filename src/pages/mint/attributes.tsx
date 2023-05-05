import React from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Row, Space } from 'antd';
import ParseLocalFile from "./parseLocalFile";
import { TextDownloader } from '@components/TextDownloader';

const Attributes: React.FC<{ onValuesChange: (_, v) => void }> = ({onValuesChange}) => {
    const [form] = Form.useForm();

    return (
        <Form form={form}
            name="dynamic_form_nest_item" onValuesChange={onValuesChange}
            onFinish={(values: any) => console.log('Received values of form:', values)}
            style={{flexGrow: 1}}
            autoComplete="off"
        >
            <Form.List name="attributes">
                {(fields, {add, remove}) => (
                    <>
                        {fields.map(({key, name, ...restField}) => (
                            <Space key={key} style={{display: 'flex', marginBottom: 0}} align="baseline">
                                {['trait_type', 'value', 'display_type'].map(k => (<span key={k}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, k]} label={k}
                                        rules={[{required: k === 'trait_type' || k === 'value', message: `必填项`}]}
                                    >
                                        <Input placeholder="" bordered={false} style={{borderBottom: '1px dashed gray'}}/>
                                    </Form.Item>
                                </span>))}
                                <MinusCircleOutlined onClick={() => remove(name)}/>
                            </Space>
                        ))}
                        <Form.Item>
                            <Row gutter={16}>
                                <Col span={8}> 
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>} />
                                </Col>
                                <Col span={8}><ParseLocalFile handleData={(data) => {
                                    try {
                                        console.log(`import data`, data)
                                        const json = JSON.parse(data)
                                        form.setFieldsValue(json);
                                        onValuesChange({}, json)
                                    } catch (e) {
                                        message.info(`导入出错: ${e}`)
                                    }
                                }}/>
                                    <Button type={"link"}>
                                        <TextDownloader label={"导出"} content={JSON.stringify(form.getFieldsValue(), null, 4)} filename={"meta_table.json.txt"}/>
                                    </Button>
                                </Col>
                                <Col span={8}>
                                </Col>
                            </Row>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            {/*<Form.Item>*/}
            {/*    <Button type="primary" htmlType="submit">*/}
            {/*        Submit*/}
            {/*    </Button>*/}
            {/*</Form.Item>*/}
        </Form>
    );
}

export default Attributes;