import React, { useEffect, useState } from 'react';
import { address, Drip } from 'js-conflux-sdk';
import RainbowBreadcrumb from '@components/Breadcrumb';
import {
    Card, Form, Input, Button, Row,
    Col, Divider, message, Result, Modal,
    Switch, Space, Tooltip, Typography,
} from "antd";
import { getContractSponsor, setContractSponsor } from '@services/contract';
import { userBalance } from '@services/user';
import { cfxPrice } from '@services/misc';
import { SponsorInfo } from '@models/index';
import { mapChainNetwork } from '@utils/index';
import JSBI from 'jsbi';
const CFX_IN_GDRIP = JSBI.BigInt(1000000000);

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 18 },
}

// TODO: 消费金额给出提示

export default function ContractSponsor() {
    const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo|null>(null);
    const [contractAddr, setContractAddr] = useState<string>('');
    const [price, setPrice] = useState<number>(80);
    const [form] = Form.useForm();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [autoSponsor, setAutoSponsor] = useState(false);

    const onSetSponsor = async (values: any) => {
        const addr = values.address;
        if (!address.isValidCfxAddress(addr)) {
            message.warning('地址格式错误');
            return;
        }
        if (address.decodeCfxAddress(addr).type !== 'contract') {
            message.warning('非合约地址');
            return;
        }

        // normalize value
        values.gas = parseInt(values.gas);
        values.storage = parseInt(values.storage);
        values.gas_upper_bound = parseInt(values.gas_upper_bound);

        values.auto_sponsor = autoSponsor;
        if (autoSponsor) {
            values.storage_recharge_amount = parseInt(values.storage_recharge_amount);
            values.storage_recharge_threshold = parseInt(values.storage_recharge_threshold);
        }

        const upperBound = JSBI.BigInt(values.gas_upper_bound);
        const gas = JSBI.multiply(JSBI.BigInt(values.gas), CFX_IN_GDRIP);  // in GDrip
        // @ts-ignore
        if (JSBI.lessThan(gas, JSBI.multiply(upperBound, JSBI.BigInt(1000)))) {
            message.warning('Gas必须大于Gas上限的1000倍');
            return;
        }

        if (address.decodeCfxAddress(addr).netId === 1029) {
            const toCharge = (values.gas + values.storage) * 80;
            const balance = (await userBalance()).balance;
            if (balance < toCharge) {
                message.warning('账户余额不足');
                return;
            }
        }

        try {
            await setContractSponsor(addr, values);
            setIsModalVisible(true);
        } catch(e) {
            // TODO: 优化错误提示
            // @ts-ignore
            message.error(e.response.data.message);
            return;
        }
    }

    useEffect(() => {
        if (contractAddr && address.isValidCfxAddress(contractAddr)) {
            const chain = mapChainNetwork(address.decodeCfxAddress(contractAddr).netId);
            getContractSponsor(contractAddr as string, chain).then(setSponsorInfo);
        }
    }, [contractAddr]);

    useEffect(() => {
        cfxPrice().then(setPrice);
    }, []);

    return (
        <div style={{flexGrow: 1}}>
            <RainbowBreadcrumb items={['合约', '树图合约代付']} />
            <Card>
                <Divider orientation="left">设置代付</Divider>
                <Row>
                    <Col xs={24} sm={24} md={22} lg={18} xl={14} xxl={10}>
                        <Form {...layout} form={form} name="control-hooks" onFinish={onSetSponsor} initialValues={{gas_upper_bound: 1000_000}}>
                            <Form.Item 
                                name="address" 
                                label="合约地址" 
                                rules={[{ required: true }]}
                                extra={sponsorInfo ? `白名单状态: ${sponsorInfo.is_all_white_listed ? '开' : '关'}` : null}
                            >
                                <Input onChange={e => setContractAddr(e.target.value)}/>
                            </Form.Item>
                            <Form.Item 
                                name="gas"
                                label="燃气(KB)"
                                extra={sponsorInfo ? `余额: ${new Drip(sponsorInfo.gas_sponsor_balance).toCFX()} KB` : null}
                                rules={[{ required: true }]}
                            >
                                <Input type="number" placeholder='建议设置为 1-5 KB'/>
                            </Form.Item>
                            <Form.Item 
                                name="gas_upper_bound" 
                                label="燃气上限(GDrip)" 
                                rules={[{ required: true }]}
                                extra={sponsorInfo ? `当前值: ${new Drip(sponsorInfo.gas_upper_bound).toGDrip()} GDrip` : null}
                            >
                                <Input type="number"/>
                            </Form.Item>
                            <Form.Item 
                                name="storage" 
                                label="存储(KB)" 
                                rules={[{ required: true }]}
                                extra={sponsorInfo ? `余额: ${new Drip(sponsorInfo.collateral_sponsor_balance).toCFX()} KB` : null}
                            >
                                <Input type="number" placeholder='预估公式: NFT 铸造数量 * 0.7'/>
                            </Form.Item>
                            <Form.Item 
                                name="auto_sponsor" 
                                label="自动续费" 
                                rules={[{ required: false }]}
                            >
                                <Space>
                                    <Switch onChange={checked => setAutoSponsor(checked)} />
                                    <Tooltip title="燃气费不满足 1000 * gasUpperBound 自动补充 1KB，存储费不满足一定阈值时，自动补充固定金额；请保证账户有足够余额">
                                        <Typography.Link href="#API">说明</Typography.Link>
                                    </Tooltip>
                                </Space>
                            </Form.Item>
                            {autoSponsor ? <Form.Item 
                                name="storage_recharge_threshold" 
                                label="存储补充阈值(KB)" 
                                rules={[{ required: false }]}
                            >
                                <Input type="number" placeholder='存储余额低于该值则会自动补充，默认值 10'/>
                            </Form.Item> : null}
                            {autoSponsor ? <Form.Item 
                                name="storage_recharge_amount" 
                                label="存储补充数量(KB)" 
                                rules={[{ required: false }]}
                            >
                                <Input type="number" placeholder='每次补充数额，默认值 50'/>
                            </Form.Item> : null}
                            
                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit">
                                    提交
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
                
                <Divider orientation="left">名词解释</Divider>
                <Row>
                    <Col xs={24} sm={24} md={22} lg={18} xl={14} xxl={10}>
                        <ul>
                            <li>燃气(Gas)：交易上链需要消耗燃气，燃气单位为 KB 和 GDrip，1KB=10^9 GDrip.</li>
                            <li>燃气上限(gasUpperBound)：被代付合约单笔交易所能消耗的燃气量上限 </li>
                            <li>存储(Storage)：交易上链同时需要消耗存储空间，单位为 KB</li>
                        </ul>
                    </Col>
                </Row>
                <Divider orientation="left">代付说明</Divider>
                <Row>
                    <Col xs={24} sm={24} md={22} lg={18} xl={14} xxl={10}>
                        <ul>
                            <li>平均一笔交易燃气消耗为 10-20w GDrip; 1 KB 燃气通常能发送 5,000-10,000 笔数字藏品交易</li>
                            <li>燃气上限建议值为 100w GDrip, 燃气赞助金额需大于 1000 * 燃气上限</li>
                            <li>1 个数字藏品铸造操作，通常需要 0.6-0.8 KB 的存储空间</li>
                            <li>铸造 1 个数字藏品，需要花费 0.6-0.8 KB 的存储 + 1 笔交易的燃气消耗（0.0001 KB 起）</li>
                            <li>主网每单位(KB)代付费用单价为 {price} CNY, 测试网免费</li>      
                            <li>仅支持为树图链合约设置上链费用赞助；代付赞助一旦设置, 无法返还</li>
                            <li>需要正确的设置合约赞助白名单, 代付才能生效</li>
                        </ul>
                    </Col>
                </Row>
                <Divider orientation="left">举例说明</Divider>
                <Row>
                    <Col xs={24} sm={24} md={22} lg={18} xl={14} xxl={10}>
                        <ul>
                            <li>假设需要铸造 1000 个 NFT</li>
                            <li>燃气上限使用默认值 100w GDrip 即可</li>
                            <li>燃气代付量需满足 1000 笔交易上链，且大于等于 gasUpperBound * 1000，因此燃气代付设置为 1KB 即可</li>
                            <li>单 1 个数字藏品铸造，需要花费 0.6-0.8 KB 的存储，则 0.8 * 1000 = 800 KB </li>
                        </ul>
                    </Col>
                </Row>
                <Divider orientation="left">更多文档</Divider>
                <Row>
                    <Col xs={24} sm={24} md={22} lg={18} xl={14} xxl={10}>
                        <ul>
                            <li><a target="_blank" href="https://confluxscan.net/address/cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaaegg2r16ar?tab=contract-viewer" rel="noreferrer">ConfluxScan 赞助商内置合约</a> </li>
                            <li><a target="_blank" href="https://developer.confluxnetwork.org/conflux-rust/internal_contract/internal_contract#sponsorwhitelistcontrol-contract" rel="noreferrer">Conflux 赞助机制官方文档</a> </li>
                            <li><a target="_blank" href="https://docs.nftrainbow.xyz/" rel="noreferrer">Rainbow 赞助机制介绍文档</a> </li>
                        </ul>
                    </Col>
                </Row>
                <Modal open={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)} okText={'确认'} cancelText={'取消'}>
                    <Result
                        status="success"
                        title="设置成功"
                        subTitle="合约代付生效需要一到两分钟, 请耐心等待."
                    />
                </Modal>
            </Card>
        </div>
    );
}