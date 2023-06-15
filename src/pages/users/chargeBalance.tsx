import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card, Space, Button, Tooltip, Tabs, 
    Form, Input, Radio, Checkbox,
    Modal, QRCode, message, Typography,
} from "antd";
import { InfoCircleOutlined, EditTwoTone } from '@ant-design/icons';
import RainbowBreadcrumb from '@components/Breadcrumb';
import type { TabsProps } from 'antd';
import { userBalanceRuntime, userProfile } from '@services/user';
import { createWxPayOrder, getCmbCardNo, createCmbCardNo, updateCmbCardRelation } from '@services/pay';
import { User } from '@models/index';
import { CmbDepositNo } from '@models/index';
import { formatFiat } from '@utils/index'
import './userCharge.css';

const { Title, Text } = Typography;

const CMB_PREFIX = '755915712610305';

export default function Page() {
    const [balance, setBalance] = useState(0);
    const [balanceRefreshTick, setBalanceRefreshTick] = useState(0);

    const [userInfo, setUserProfile] = useState<User | undefined>(undefined);

    const onChange = (key: string) => {
        console.log(key);
    };
      
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `在线充值`,
            children: <OnlineCharge user={userInfo}/>,
        },
        {
            key: '2',
            label: `对公汇款`,
            children: <PublicCharge user={userInfo} />,
        },
    ];

    useEffect(() => {
        userBalanceRuntime().then((res) => setBalance(res.balance));
    }, [balanceRefreshTick]);

    useEffect(() => {
        userProfile().then(setUserProfile)
    }, []);

    return (
        <div style={{flexGrow:1}}>
            <RainbowBreadcrumb items={['设置', '账户充值']} />
            <Card>
                <div>
                    <Space>
                        <span style={{color: 'gray', fontSize: '14px'}}>
                            账户余额
                        </span>
                        <Tooltip title={"由于系统同步原因，查询结果可能与实际存在差异，请以实际为准"}>
                            <InfoCircleOutlined/>
                        </Tooltip>
                    </Space>
                </div>
                <div style={{marginTop: '10px'}}>
                    <Space>
                        <span className='user-balance'>¥ {formatFiat(balance)}</span>
                        <Button style={{marginLeft: '20px'}} onClick={() => setBalanceRefreshTick(balanceRefreshTick+1)}>刷新</Button>
                        <span>可前往收支明细查看<Link to='/panels/userBalance'>充值记录</Link></span>
                    </Space>
                </div>
            </Card>
            <Card style={{marginTop: '20px'}}>
                <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            </Card>
        </div>
    );
}

function OnlineCharge({user: userInfo}: {user?: User}) {
    const [form] = Form.useForm();
    const [isPayModalVisible, setIsPayModalVisible] = useState(false);
    const [payUrl, setPayUrl] = useState('');

    const onPay = async (values: any) => {
        let { amount } = values;
        if (isNaN(Number(amount))) {
            message.warning('请输入正确的金额');
            return;
        }
        amount = parseInt((Number(amount) * 100).toString());
        const res = await createWxPayOrder({
            amount: amount,
            desc: 'Charge',
        });
        setPayUrl(res.code_url);
        setIsPayModalVisible(true);
    }

    return (<>
        <div className='mt-10'>
            <span>充值账号: </span> <span>{userInfo?.email}</span>
        </div>
        <div className='mt-20'>
            <Form form={form} layout='vertical' initialValues={{type: 1}} onFinish={onPay}>
                <Form.Item name='amount' label="充值金额">
                    <Input style={{width: '200px'}} placeholder='¥'/>
                </Form.Item>
                <Form.Item name='type' label="支付方式">
                    <Radio.Group>
                        <Radio value={1}>微信支付</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name='agreement'>
                    <Checkbox onChange={() => {}} checked={true}>
                        我已阅读并同意<a href="https://nftrainbow.cn/financial-agreement.html" target='_blank' rel="noreferrer">《NFTRainbow 平台技术服务协议》</a>
                    </Checkbox>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">确认充值</Button>
                </Form.Item>
            </Form>
        </div>
        <Modal 
            title='扫码支付' 
            open={isPayModalVisible} 
            onOk={() => setIsPayModalVisible(false)} 
            onCancel={() => setIsPayModalVisible(false)}
            footer={null}
        >
            <QRCode 
                value={payUrl} 
                style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
            />
            <div style={{textAlign: "center", marginTop: '10px'}}>
                <span>支付完成后，请刷新页面</span>
            </div>
        </Modal>
    </>);
}

function PublicCharge({user: userInfo}: {user?: User}) {
    const [cardNoInfo, setCardNoInfo] = useState<CmbDepositNo|undefined>(undefined); // 3412341234
    const [tick, setTick] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isEdit, setIsEdit] = useState(false);
    
    // TODO: more test here
    const getCardNo = async (values: any) => {
        try {
            if (!isEdit) { // 获取专属充值卡号
                if (!userInfo || !(userInfo.type === 2 && userInfo.status === 1)) {
                    message.warning('请先进行企业认证');
                    return;
                }
                await createCmbCardNo(values.name, values.card_no, values.bank);
            } else { // 更新关联的充值卡号
                await updateCmbCardRelation(values.name, values.card_no, values.bank);
            }
            setTick(tick+1);
            setIsModalVisible(false);
        } catch(e) {
            // @ts-ignore
            message.error('获取失败: ' + e.response.data.message);
        }
    }

    const openEditModal = () => {
        form.setFieldsValue({
            name: cardNoInfo?.user_name,
            bank: cardNoInfo?.user_bank_name,
            card_no: cardNoInfo?.user_bank_no,
        });
        setIsEdit(true);
        setIsModalVisible(true);
    }

    useEffect(() => {
        getCmbCardNo().then((res) => {
            setCardNoInfo(res);
        });
    }, [tick])

    return (<>
        <div style={{background: '#e2e2e2', padding: '20px'}}>
            <p>1. 对公汇款到账取决于线下汇款操作完成后，以银行到账时间为准。</p>
            <p>2. 为防范可能发生的诈骗、洗钱等风险，平台用户账号认证中的认证信息必须与企业认证中的法人信息一致。如提供虚假信息，云萃流图有权拒绝存在异常情形的相关汇款。</p>
            <p>3. 如果您未成功获得专属的对公账号，请完成认证信息与企业认证法人信息的提交。如果您直接向云萃流图银行账号汇款，请在汇款到账后联系平台管理员。</p>
        </div>
        <div className='mt-20'>
            <div>
                <span>充值账号: </span> <span>{userInfo?.email}</span>
            </div>
            {cardNoInfo && (<>
                <div>
                    <span>开户名称: </span> <span>{cardNoInfo?.user_name}</span> <EditTwoTone onClick={openEditModal} />
                </div>
                <div>
                    <span>开户银行: </span> <span>{cardNoInfo?.user_bank_name}</span> <EditTwoTone onClick={openEditModal} />
                </div>
                <div>
                    <span>银行账号: </span> <span>{cardNoInfo?.user_bank_no}</span> <EditTwoTone onClick={openEditModal} />
                </div>
            </>)}
        </div>
        <div className='mt-20'>
            <div className='gray-border'>
                <Title level={5}>对公汇款账号信息</Title>
                <p>1.您申请的对公汇款专属账号，推荐使用与平台实名信息认证一致的银行账户进行汇款，若不一致可能面临汇款被拒绝。</p>
                <p>2.每个平台账号完成信息认证，都可以申请对公汇款专属账号，获取后请妥善保管，勿告知他人。</p>
            </div>
            <div className='gray-border'>
                {cardNoInfo && (
                    <div className='mt-20'>
                        <p>开户名称：<Text copyable>杭州云萃流图网络科技有限公司</Text></p>
                        <p>开户银行：<Text copyable>招商银行杭州萧山支行</Text></p>
                        <p>专属对公账号：<Text copyable>{CMB_PREFIX}{cardNoInfo.cmb_no}</Text></p>
                        <div>
                            <Text strong>请妥善保存账号信息，勿告知他人</Text>
                        </div>
                        <div className='mt-20'>
                            <Button type='primary' onClick={async () => {
                                await navigator.clipboard.writeText(CMB_PREFIX+cardNoInfo.cmb_no);
                                message.success('复制成功');
                            }}>复制充值卡号</Button>
                        </div>
                    </div>
                )}
            </div>
            {!cardNoInfo && (
                <Form>
                    <Form.Item>
                        <Checkbox checked={true}>
                            我已阅读并同意<a href="https://nftrainbow.cn/financial-agreement.html" target='_blank' rel="noreferrer">《NFTRainbow 平台技术服务协议》</a>
                        </Checkbox>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={() => setIsModalVisible(true)}>获取专属对公账号</Button>
                    </Form.Item>
                </Form>
            )}
        </div>
        <Modal 
            title='充值账号信息' 
            open={isModalVisible}
            onOk={() => form.submit()}
            onCancel={() => setIsModalVisible(false)}
            okText='确定'
            cancelText='取消'
        >
            <Form 
                form={form}
                onFinish={getCardNo}
                labelCol={{span: 6}}
            >
                <Form.Item>
                    <span>请提供企业银行充值账号信息以进行关联，对公充值仅支持该账号转账</span>
                </Form.Item>
                <Form.Item name='name' label="充值账户名">
                    <Input />
                </Form.Item>
                <Form.Item name='bank' label="充值账户开户行">
                    <Input />
                </Form.Item>
                <Form.Item name='card_no' label="充值账户卡号">
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    </>);
}