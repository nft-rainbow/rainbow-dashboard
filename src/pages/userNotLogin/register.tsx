import React from 'react';
import './register.css';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, ConfigProvider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { userRegister, LoginMeta } from '../../services/user';

function Register() {
    const navigate = useNavigate();

    const onFinish = async (values: object) => {
        try {
            await userRegister(values as LoginMeta);
            message.success('Register success!');
            navigate('/login');
        } catch (e: any) {
            // @ts-ignore
            console.log('failed', e)
            message.error(`注册失败: ${e?.response?.data?.message}`);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#6953EF',
                    colorLink: '#6953EF',
                },
            }}
        >
            <div className="register">
                <div className="register-form">
                    <div className="logo">
                        <img src="/nftrainbow-logo-blank.png" alt="logo" />
                    </div>
                    <Form
                        name="normal_login"
                        className="login-form"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Please input your Email!' }]}
                        >
                            <Input type="email" prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!', min: 6 }]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                注册
                            </Button>
                        </Form.Item>
                        <div>
                            <Link to="/login">登录</Link>
                        </div>
                    </Form>
                </div>
                <div className="register-footer">
                    <div className='footer'>
                        <div className="copyright">
                            @2022 NFTRainbow
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Register;
