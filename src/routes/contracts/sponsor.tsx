import React, { useEffect, useState } from 'react';
import RainbowBreadcrumb from '../../components/Breadcrumb';
import {
    Card,
    Form,
    Input,
    Button,
    Row,
    Col,
    Divider,
    message,
    Result,
    Modal,
} from "antd";
import { getContractSponsor, setContractSponsor } from '../../services/contract';
import { userBalance } from '../../services/user';
import { cfxPrice } from '../../services/misc';
import { SponsorInfo } from '../../models/index';
import { address, Drip } from 'js-conflux-sdk';
import { mapChainNetwork } from '../../utils/index';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

const tailLayout = {
    wrapperCol: { offset: 6, span: 18 },
}

export default function ContractSponsor() {
    const [form] = Form.useForm();
    const [sponsorInfo, setSponsorInfo] = useState<SponsorInfo|null>(null);
    const [contractAddr, setContractAddr] = useState<string>('');
    const [price, setPrice] = useState<number>(80);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const onSetSponsor = async (values: any) => {
        const addr = values.address;
        if (!address.isValidCfxAddress(addr)) {
            message.warning('合约地址格式错误');
            return;
        }

        // normalize value
        values.gas = parseInt(values.gas);
        values.storage = parseInt(values.storage);
        values.gas_upper_bound = parseInt(values.gas_upper_bound);

        const upperBound = BigInt(values.gas_upper_bound);
        // @ts-ignore
        const gas = BigInt(values.gas) * 10n ** 9n;  // in GDrip
        if (gas < upperBound * BigInt(1000)) {
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
        <>
            <RainbowBreadcrumb items={['合约', '树图合约代付']} />
            <Card>
                <Divider orientation="left">设置代付</Divider>
                <Row>
                    <Col span={9}>
                        <Form {...layout} form={form} name="control-hooks" onFinish={onSetSponsor}>
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
                                label="燃气量(CFX)"
                                extra={sponsorInfo ? `余额: ${new Drip(sponsorInfo.gas_sponsor_balance).toCFX()} CFX` : null}
                                rules={[{ required: true }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item 
                                name="gas_upper_bound" 
                                label="燃气上限(GDrip)" 
                                rules={[{ required: true }]}
                                extra={sponsorInfo ? `当前值: ${new Drip(sponsorInfo.gas_upper_bound).toGDrip()} GDrip` : null}
                            >
                                <Input type="number" placeholder='建议值为 1000000'/>
                            </Form.Item>
                            <Form.Item 
                                name="storage" 
                                label="存储量(CFX)" 
                                rules={[{ required: true }]}
                                extra={sponsorInfo ? `余额: ${new Drip(sponsorInfo.collateral_sponsor_balance).toCFX()} CFX` : null}
                            >
                                <Input type="number" />
                            </Form.Item>
                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit">
                                    提交
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
                <Divider orientation="left">代付说明</Divider>
                <Row>
                    <Col span={9}>
                        <ul>
                            <li>仅支持为树图链合约设置上链费用赞助</li>
                            <li>主网每单位(CFX)上链费用价格为 {price/100} CNY, 测试网免费</li>      
                            <li>代付赞助一旦设置, 无法返还</li>
                            <li>需要正确的设置合约赞助白名单, 代付才能生效</li>
                            <li>树图 CFX 与 GDrip 的转换关系为 1CFX=1000000000 GDrip (9个0)</li>
                            <li>燃气上限建议值为 100w GDrip, 燃气赞助金额需大于 1000 * gasUpperBound</li>
                            <li>若合约之前自行设置了赞助(没有使用本服务), 无法再使用本服务设置</li>
                            <li><a target="_blank" href="https://confluxscan.net/address/cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaaegg2r16ar?tab=contract-viewer" rel="noreferrer">ConfluxScan 赞助商内置合约</a> </li>
                            <li><a target="_blank" href="https://developer.confluxnetwork.org/conflux-rust/internal_contract/internal_contract#sponsorwhitelistcontrol-contract" rel="noreferrer">Conflux 赞助机制官方文档</a> </li>
                            <li><a target="_blank" href="https://docs.nftrainbow.xyz/" rel="noreferrer">Rainbow 赞助机制介绍文档</a> </li>
                        </ul>
                    </Col>
                </Row>
                <Modal open={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}>
                    <Result
                        status="success"
                        title="设置成功"
                        subTitle="合约代付生效需要一到两分钟, 请耐心等待."
                    />
                </Modal>
            </Card>
        </>
    );
}