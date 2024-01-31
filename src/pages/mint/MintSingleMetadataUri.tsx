import React, { useState } from "react";
import {
    Form, Input, Button, Row, Col, message
} from "antd";
import { batchMintByMetadataUri } from '@services/app';
import { Contract } from '@models/index';
import { address } from 'js-conflux-sdk';

export function MintSingleByMetadataUri(props: {
    appId: string;
    chainId: number;
    contract: Contract;
}){
    const {
        appId,
        chainId,
        contract,
    } = props;
    const chain = chainId === 1029 ? 'conflux' : 'conflux_test';

    const [addr, setAddress] = useState('');
    const [metadataUri, setMetadataUri] = useState('');
    const [tokenId, setTokenId] = useState('');

    const onFinish = async (values: any) => {
        if (!contract.address) message.error("");
        if (!addr || !metadataUri) {
            message.error("地址和MetadataUri不能为空");
            return;
        };
        if (!address.isValidCfxAddress(addr)) {
            message.error("地址不合法");
            return;
        }
        if (address.decodeCfxAddress(addr).netId !== chainId) {
            message.error("地址网络不匹配");
            return;
        }

        try {
            const item = {
                metadata_uri: metadataUri,
                mint_to_address: addr,
                token_id: tokenId,
                // amount: 1,
            };
            if (tokenId) {
                // @ts-ignore
                item.token_id = tokenId;
            }
            await batchMintByMetadataUri(appId, {
                tokenid_auto_order: false,
                chain,
                contract_address: contract.address,
                mint_items: [item],
            });
            message.success("任务提交成功，请至铸造历史查看");
        } catch(e) {
            // @ts-ignore
            message.error("任务提交失败" + e.response?.data?.message || '');
        }
    };

    return (<>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}  style={{ maxWidth: 600, marginTop: "30px" }}>
            <Form.Item label="地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
                <Input onChange={e => setAddress(e.target.value)}/>
            </Form.Item>
            <Form.Item label="MetadataUri" name="metadata_uri" rules={[{ required: true, message: '请输入地址' }]}>
                <Input onChange={e => setMetadataUri(e.target.value)}/>
            </Form.Item>
            <Form.Item label="TokenID">
                <Input name="token_id" onChange={e => setTokenId(e.target.value)} />
            </Form.Item>
            <Row>
                <Col span={6}></Col>
                <Col span={18}>
                    <Button type="primary" htmlType="submit" onClick={onFinish}>提交铸造</Button>
                </Col>
            </Row>
        </Form>
    </>);
}