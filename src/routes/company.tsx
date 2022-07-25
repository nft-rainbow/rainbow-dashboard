import React, { useState, useEffect } from 'react';
import RainbowBreadcrumb from '../components/Breadcrumb';
import FileUpload from '../components/FileUpload';
import { Divider, Button, Form, Input, Row, Col, message } from 'antd';
import { userCompany, Company, updateUserCompany } from '../services/user';
const { TextArea } = Input;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const tailLayout = {
  wrapperCol: { offset: 6, span: 18 },
};

export default function CompanyManagement() {
  const [, setCompany] = useState<Company | {}>({});
  const [kycForm] = Form.useForm();

  const onKycInfoUpdate = async (values: any) => {
    try {
      await updateUserCompany(values);
      message.success('KYC info updated successfully');
    } catch (error: any) {
      message.error(error.message);
    }
  }

  useEffect(() => {
    userCompany().then((_company) => {
      setCompany(_company);
      kycForm.setFieldsValue(_company);
    });
  }, [kycForm]);

  return (
    <div>
      <RainbowBreadcrumb items={['设置', '机构认证']} />
      <div className="content-body">
        <Divider orientation="left">认证信息</Divider>
        <Row>
          <Col span={8}>
            <Form {...layout} form={kycForm} name="control-hooks" onFinish={onKycInfoUpdate}>
              <Form.Item name="name" label="公司名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="company_no" label="营业执照号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="company_id_img" label="营业执照" rules={[{ required: true }]}>
                <FileUpload onChange={(err: Error, file: any) => kycForm.setFieldsValue({company_id_img: file.url})}/>
              </Form.Item>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="legal_person_name" label="公司法人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="legal_person_id_no" label="法人身份证号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="company_range" label="经营范围" rules={[{ required: true }]}>
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  更新
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
}
