import React, { useState, useEffect } from 'react';
import RainbowBreadcrumb from '../components/Breadcrumb';
import FileUpload from '../components/FileUpload';
import { Divider, Button, Form, Input, Row, Col, message } from 'antd';
import { userProfile, updateUserProfile, User, updateUserKyc } from '../services/user';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const tailLayout = {
  wrapperCol: { offset: 6, span: 18 },
};

function UserManagement() {
  const [, setUser] = useState<User | {}>({});
  const [basicForm] = Form.useForm();
  const [kycForm] = Form.useForm();

  const onBasicInfoUpdate = async (values: any) => {
    try {
      await updateUserProfile(values);
      message.success('Basic info updated successfully');
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const onKycInfoUpdate = async (values: any) => {
    try {
      await updateUserKyc(values);
      message.success('KYC info updated successfully');
    } catch (error: any) {
      message.error(error.message);
    }
  }

  useEffect(() => {
    userProfile().then((_user) => {
      setUser(_user);

      basicForm.setFieldsValue({
        email: _user.email,
        name: _user.name,
        phone: _user.phone,
      });

      kycForm.setFieldsValue({
        id_no: _user.id_no,
        id_name: _user.id_name,
        id_image: _user.id_image,
      });
    });
  }, [basicForm, kycForm]);

  return (
    <div>
      <RainbowBreadcrumb items={['设置', '用户信息']} />
      <div className="content-body">
        <Divider orientation="left">基本信息</Divider>
        <Row>
          <Col span={8}>
            <Form {...layout} form={basicForm} name="control-hooks" onFinish={onBasicInfoUpdate}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  更新
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
        
        <Divider orientation="left">认证信息</Divider>
        <Row>
          <Col span={8}>
            <Form {...layout} form={kycForm} name="control-hooks" onFinish={onKycInfoUpdate}>
              <Form.Item name="id_name" label="身份证姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="id_no" label="身份证号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="id_image" label="身份证照片" rules={[{ required: true }]}>
                <FileUpload onChange={(err: Error, file: any) => kycForm.setFieldsValue({id_image: file.url})}/>
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

export default UserManagement;
