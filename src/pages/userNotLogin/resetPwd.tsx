import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Form, Input, message, ConfigProvider } from 'antd';
import { userResetPassword } from '@services/user';
import './register.css';

export default function ResetPwd() {
    const [searchParams,] = useSearchParams();

    const resetPwd = async (values: {password: string; new_password: string}) => {
        try {
            if (values.password !== values.new_password) {
                message.error('两次密码不一致');
                return;
            }
            let code = searchParams.get('code');
            if (!code) {
                message.error('重置密码链接错误');
                return;
            }
            await userResetPassword(code, values);
            message.success('重置密码成功');
        } catch (error) {
            // @ts-ignore
            message.error('重置密码邮件发送失败' + err.response.data.message);
        }
    }

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
                    <Form name="normal_login" className="login-form" initialValues={{ remember: true }} onFinish={resetPwd}>
                        {/* <Form.Item name="code" rules={[{ required: true, message: 'Please input your code!' }]}>
                            <Input placeholder="重置验证码" />
                        </Form.Item> */}
                        <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                            <Input type="password" placeholder="新密码" />
                        </Form.Item>
                        
                        <Form.Item name="new_password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                            <Input type="password" placeholder="确认密码" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                重置密码
                            </Button>
                        </Form.Item>
                        
                        <div>
                            <Link to="/login">登录</Link>
                        </div>
                    </Form>
                </div>
                <div className="register-footer">
                    <div className="footer">
                        <div className="copyright">@2022 NFTRainbow</div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}
