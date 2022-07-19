import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import './register/register.css';

function Login() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  // @ts-ignore
  let from = location.state?.from?.pathname || "/";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get("username") as string;

    auth.signin(username, () => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from, { replace: true });
    });
  }

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
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
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
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
          </Form.Item>
        </Form>
      </div>
      <div className="register-footer">
        <div className='footer'>
          <div className="copyright">
            @2020 NFT Rainbow
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;