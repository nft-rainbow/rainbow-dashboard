import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useAuth } from '../Auth';
import './register/register.css';

function Login() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  // @ts-ignore
  let from = location.state?.from?.pathname || "/";

  const onFinish = (values: object) => {
    // @ts-ignore
    auth.signin(values, (err) => {
      if (!err) {
        navigate(from, { replace: true });
        return;
      }
      message.error('Login failed: ' + err.message);
    });
  };

  return (
    <div className="register">
      <div className="register-form">
        <div className="logo">
          <img src="https://avatars.githubusercontent.com/u/108182053?s=200&v=4" alt="logo" />
          <span>NFT Rainbow</span>
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
            <Input type='email' prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              登录
            </Button>
            <p className="mt-5">
              <Link to="/register">注册</Link>
            </p>
          </Form.Item>

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
  );
}

export default Login;