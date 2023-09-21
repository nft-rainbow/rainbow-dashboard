import React, { useEffect, useState } from 'react';
import {
    Card, Typography, Checkbox, Radio,
    Select, Form, Modal, Button, message,
} from "antd";
import type { RadioChangeEvent } from 'antd';
import { ServicePackage, ServicePlan, UserServicePlan } from '@models/Service';
import { UserBalance } from '@models/index';
import { getServicePlan2Package, getUserServicePlan, buyServicePlan, buyServicePackage } from '@services/web3Service';
import { userProfile, userBalanceRuntime } from '@services/user';
import { groupBy, sumBy } from 'lodash-es';
import Counter from '@components/Counter';
import './buy.css';
const { Title, Paragraph, Text } = Typography;

export default function BuyWeb3Service() {
    const [visible, setVisible] = useState(false);
    const [tick, setTick] = useState(0);

    const [serviceKey, setServiceKey] = useState('confura_cspace');
    const [serviceInfo, setServiceInfo] = useState<{[key: string]: {plans: ServicePlan[], packages: ServicePackage[]}}>({});
    const [currentPlans, setPlans] = useState<ServicePlan[]>([]);
    const [currentPackages, setPackages] = useState<ServicePackage[]>([]);

    const [currentPlanId, setCurrentPlanId] = useState(0);
    const [currentPackageId, setCurrentPackageId] = useState(0);
    const [selectedPlanMeta, setSelectedPlanMeta] = useState<ServicePlan|null>(null);
    const [selectedPackageMeta, setSelectedPackageMeta] = useState<ServicePackage|null>(null);

    // 用户当前的服务套餐
    const [userCurrentServicePlans, setUserCurrentServicePlans] = useState<{[key: string]: UserServicePlan[]}>({});

    const [userBalance, setUserBalance] = useState<UserBalance|null>(null);

    const [pCount, setPCount] = useState(1);
    const [totalAmount, setTotalAmount] = useState(0);

    const openConfirmModal = () => {
        // Not select any package and service plan is not changed
        if (currentPackageId === 0 && userCurrentServicePlans[serviceKey] && userCurrentServicePlans[serviceKey][0].plan_id === currentPlanId) {
            message.warning('套餐未发生变化');
            return;
        }

        // 2. if need, pop up the window
        setVisible(true);
    }

    const changePlanOrPackage = async () => {
        if (Number(userBalance?.balance) < totalAmount) {
            message.error('余额不足');
            return;
        }
        const userMeta = await userProfile();

        if (selectedPlanMeta) {
            try {
                await buyServicePlan(userMeta.id, selectedPlanMeta.id);
            } catch (e) {
                message.error('套餐更换失败');
                return;
            }
        }

        if (selectedPackageMeta) {
            try {
                await buyServicePackage(userMeta.id, selectedPackageMeta.id, pCount);
            } catch(e) {
                message.error('加油包购买失败');
                return;
            }
        }
        
        setVisible(false);
        setSelectedPackageMeta(null);
        setSelectedPlanMeta(null);
        setCurrentPackageId(0);
        setTick(tick + 1); // trigger the useEffect

        message.success('购买成功');
    }

    const onPackageChange = (e: RadioChangeEvent) => {
        setCurrentPackageId(e.target.value);
        const target = currentPackages.find(el => el.id === e.target.value);
        if (target) setSelectedPackageMeta(target);
    }

    const onPlanChange = (e: RadioChangeEvent) => {
        setCurrentPlanId(e.target.value);
        const target = currentPlans.find(el => el.id === e.target.value);
        if (target) {
            if (userCurrentServicePlans[serviceKey].length > 0 && userCurrentServicePlans[serviceKey][0].plan_id === e.target.value) {
                setSelectedPlanMeta(null);
            } else {
                setSelectedPlanMeta(target);
            }
        }
    }

    const onServiceChange = (val: string) => {
        setServiceKey(val);
        setCurrentPackageId(0);
        setSelectedPackageMeta(null);
        setSelectedPlanMeta(null);
    }

    // get service plan and package
    useEffect(() => {
        getServicePlan2Package().then(data => {
            setServiceInfo(data);
            setPlans(data[serviceKey].plans);
            setPackages(data[serviceKey].packages);
        })
    }, []);

    // when service changed, update the available plan and package
    useEffect(() => {
        if (!serviceInfo[serviceKey]) return;
        setPlans(serviceInfo[serviceKey].plans);
        setPackages(serviceInfo[serviceKey].packages);
    }, [serviceKey]);

    // get user current service plans
    useEffect(() => {
        userProfile().then(user => {
            getUserServicePlan(user.id).then(plans => {
                const groupedByServer = groupBy(plans, 'server_type');
                setUserCurrentServicePlans(groupedByServer);
            });
        });
    }, [tick]);

    // when service changed, update the plan and package
    useEffect(() => {
        if (!userCurrentServicePlans[serviceKey] || userCurrentServicePlans[serviceKey].length === 0) return;
        setCurrentPlanId(userCurrentServicePlans[serviceKey][0].plan_id);
    }, [userCurrentServicePlans, serviceKey]);

    useEffect(() => {
        userBalanceRuntime().then(balance => setUserBalance(balance));
    }, []);

    useEffect(() => {
        let amount = 0;
        if (selectedPackageMeta) {
            amount += Number(selectedPackageMeta.price) * pCount;
        }
        if (selectedPlanMeta) {
            amount += Number(selectedPlanMeta.price);
        }
        setTotalAmount(amount);
    }, [selectedPackageMeta, selectedPlanMeta, pCount]);

    return (
        <div style={{display: 'block', width: '500px'}}>
            <Card>
                <Form.Item label='Web3 服务'>
                    <Select value={serviceKey} onChange={onServiceChange}>
                        <Select.Option value="confura_cspace">Conflux Core RPC</Select.Option>
                        <Select.Option value="confura_espace">Conflux eSpace RPC</Select.Option>
                        <Select.Option value="scan_cspace">Conflux Core Scan API</Select.Option>
                        <Select.Option value="scan_espace">Conflux eSpace Scan API</Select.Option>
                    </Select>
                </Form.Item>

                <div>
                    <Title level={5}>包月套餐</Title>
                    <div className='mt-20'></div>
                    <Radio.Group onChange={onPlanChange} value={currentPlanId}>
                        {
                            currentPlans.map((e: ServicePlan) => 
                                <Radio value={e.id} key={e.id}>
                                    <div className='service-level'>
                                        <div className='info'>
                                            <Title level={5}>{e.name}</Title>
                                            <Paragraph>请求量: {sumBy(e.bill_plan_details, 'count').toLocaleString()}次/{e.reset_period}</Paragraph>
                                            <Paragraph>QPS: {e.qps}</Paragraph>
                                        </div>
                                        <div className='price'>
                                            <Text strong>{e.price}元/{e.plan_period}</Text>
                                        </div>
                                        <div className='clear'></div>
                                    </div>
                                </Radio>
                            )
                        }
                    </Radio.Group>
                </div>

                <div className='mt-10'>
                    <Title level={5}>加量包</Title>
                    <div className='mt-20'></div>
                    <Radio.Group onChange={onPackageChange} value={currentPackageId}>
                        {
                            currentPackages.map((e: ServicePackage) => 
                                <Radio value={e.id} key={e.id}>
                                    <div className='service-level'>
                                        <div className='info'>
                                            <Title level={5}>{e.name}</Title>
                                            <Paragraph>请求量: {sumBy(e.data_bundle_details, 'count').toLocaleString()}次</Paragraph>
                                        </div>
                                        <div className='price'>
                                            <Text strong>{e.price}元</Text>
                                        </div>
                                        <div className='clear'></div>
                                    </div>
                                </Radio>
                            )
                        }
                    </Radio.Group>
                </div>

                <Button 
                    type='primary' 
                    style={{width: '80%', marginTop: "20px", marginLeft: '10%'}} 
                    onClick={openConfirmModal}
                >确认</Button>
            </Card>

            <Modal 
                title='订单信息' 
                open={visible} 
                onCancel={() => setVisible(false)}
                onOk={changePlanOrPackage}
                className='buy-modal'
            >
                {
                    selectedPlanMeta && <div className='service-level'>
                        <div className='info'>
                            <Title level={5}>{selectedPlanMeta.name}</Title>
                            <Paragraph>请求量: {sumBy(selectedPlanMeta.bill_plan_details, 'count').toLocaleString()}次/{selectedPlanMeta.reset_period}</Paragraph>
                            <Paragraph>QPS: {selectedPlanMeta.qps}</Paragraph>
                            <Checkbox defaultChecked disabled>自动续订</Checkbox>
                        </div>
                        <div className='price'>
                            <Text strong>{selectedPlanMeta.price}元/{selectedPlanMeta.plan_period}</Text>
                        </div>
                        <div className='clear'></div>
                    </div>
                }
                {
                    selectedPackageMeta && <div className='service-level' key={selectedPackageMeta.id}>
                        <div className='info'>
                            <Title level={5}>{selectedPackageMeta.name}</Title>
                            <Paragraph>请求量: {sumBy(selectedPackageMeta.data_bundle_details, 'count').toLocaleString()}次</Paragraph>
                        </div>
                        <div className='price'>
                            <Text strong>{selectedPackageMeta.price}元</Text>
                            <br/>
                            <Counter initialNum={pCount} onChange={(val: number) => {setPCount(val)}} />
                        </div>
                        <div className='clear'></div>
                    </div>
                }
                <div style={{padding: "20px"}}>
                    <Title level={5}>总计: {totalAmount}</Title>
                    <Checkbox disabled defaultChecked>使用账户余额支付, 账户余额: {userBalance?.balance}</Checkbox>
                    <br/>
                    <Checkbox disabled defaultChecked>套餐切换操作实时生效, 降级操作不产生差额退款</Checkbox>
                </div>
            </Modal>
        </div>
    );
}