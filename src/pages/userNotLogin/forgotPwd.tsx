import React, { Component } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Button, Form, Input, message, ConfigProvider } from 'antd';
import './register.css';
import { userForgotPassword } from '@services/user';

export default class ForgotPwd extends Component {
    captchaConfig: any;
    
    state = {
        resetBtnDisabled: true,
        email: '',
    };

    constructor(props: any) {
        super(props);
        this.captchaConfig = {
            config: {
                captchaId: "7febcd48048617b383109cbdfc1d5459",
                nativeButton: {
                    width: '248px',
                }
                // language: "eng",
                // product: "bind",
                // protocol: "https://"
            },
            handler: this.captchaHandler.bind(this)
        }
        this.validate = this.validate.bind(this)
    }

    captchaHandler(captchaObj: any) {
        (window as any).captchaLoading = false;
        (window as any).captchaObj = captchaObj;
        captchaObj
            .appendTo("#captcha-dom")
            // .onReady(function () {
            //     // console.log("Geetest ready");
            // })
            // .onNextReady(function () {
            // })
            // .onBoxShow(function () {
            //     // console.log("boxShow");
            // })
            .onError(function (e: any) {
                console.log('Geetest', e);
            })
            .onSuccess(() => {
                this.setState({resetBtnDisabled: false});
            });
    }
    async validate() {
        const result = (window as any).captchaObj.getValidate();
        if (!result) {
          alert("请先完成验证！");
          return;
        }
        result.email = this.state.email;

        try {
            // captcha_id: '7febcd48048617b383109cbdfc1d5459'
            await userForgotPassword(result);
            message.success('重置密码邮件发送成功');
        } catch (err) {
            // @ts-ignore
            message.error('重置密码邮件发送失败' + err.response.data.message);
        }
    }

    componentDidMount() {
        if ((window as any).captchaLoading) return;
        (window as any).captchaLoading = true;
        (window as any).initGeetest4(
            this.captchaConfig.config,
            this.captchaConfig.handler
        );
    }

    // componentWillUnmount(): void {
        // console.log('componentWillUnmount');
        // (window as any).captchaObj && (window as any).captchaObj.destroy();
    // }

    sendResetEmail() {
        const result = (window as any).captchaObj.getValidate();
        if (!result) {
          alert("请先完成验证！");
          return;
        }
        console.log('result', result);
        console.log('email', this.state.email);
    }

    render() {
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
                        <Form name="normal_login" className="login-form" initialValues={{ remember: true }}>
                            <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱账号' }]}>
                                <Input type="email" prefix={<UserOutlined className="site-form-item-icon" />} placeholder="邮箱账号" onChange={e => this.setState({email: e.target.value})} />
                            </Form.Item>

                            <Form.Item>
                                <div id='captcha-dom' style={{width: '100px'}}></div>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" disabled={this.state.resetBtnDisabled} className="login-form-button" onClick={this.sendResetEmail.bind(this)}>
                                    发送密码重置邮件
                                </Button>
                            </Form.Item>
                            
                            <div>
                                <Link to="/register">注册</Link>
                                <Link to="/login" className="float-right">登录</Link>
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
}
