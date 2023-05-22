import React, { useState } from "react";
import { 
    Form, Button, Row, Col, Typography, 
    Table, TablePaginationConfig, message,
} from "antd";
import { batchMintByMetadataUri } from '@services/app';
import { Contract } from '@models/index';
import ParseLocalFile from './parseLocalFile';
import { address } from 'js-conflux-sdk';
const { Title, Paragraph } = Typography;

export function MintByMetadataUri(props: {
    appId: string;
    chainId: number;
    contract: Contract;
}) {
    const { appId, chainId, contract } = props;
    const chain = chainId === 1029 ? 'conflux' : 'conflux_test';
    const [items, setItems] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    const onFinish = async (values: any) => {
        try {
            if (!contract.address) message.error("");
            if (items.length === 0) return;
            let errorAddress = items.find(item => !address.isValidCfxAddress(item.Address));
            if (errorAddress) {
                message.error(`地址 ${errorAddress.Address} 不合法`);
                return;
            }
            // 如果第一个元素包含模版字符串'{id}', 则检查所有 metadata uri 是否一致
            if (items[0].MetadataUri.match("{id}") && items.length > 1) {
                let allMatch = true;
                for(let i = 1; i < items.length; i++) {
                    if (items[i].MetadataUri !== items[0].MetadataUri) {
                        allMatch = false;
                        break;
                    }
                }
                if (!allMatch) {
                    message.error("所有 MetadataUri 都必须包含 {id} 且一致");
                    return;
                }
            }

            const metadata = {
                chain,
                contract_address: contract.address,
                mint_items: items.map(item => ({
                    metadata_uri: item.MetadataUri,
                    mint_to_address: item.Address,
                    token_id: item.TokenId ? item.TokenId : null,
                    amount: 1,
                })),
            };

            await batchMintByMetadataUri(appId, metadata);
            message.success("任务提交成功，请至铸造历史查看");
        } catch(e) {
            // @ts-ignore
            message.error(e.response?.data?.message);
        }
    }

    const columns = [
        {
            title: 'Address',
            dataIndex: 'Address',
        },
        {
            title: 'MetadataUri',
            dataIndex: 'MetadataUri',
        },
        {
            title: 'TokenId',
            dataIndex: 'TokenId',
        },
    ];

    let table = null;
    if (items.length > 0) {
        table = <Table 
                    columns={columns} 
                    dataSource={items} 
                    rowKey={"Address"}
                    pagination={{
                        total: items.length,
                        current: page,
                        showTotal: (total) => `共 ${items.length} 条`,
                    }}
                    onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }} 
                />
    }

    return <>
        <Form>
            <Form.Item label="导入数据" name="metadata_uri">
                <Row justify="start" gutter={8}>
                    <Col  xs={8} sm={4} md={3}>
                        <Form.Item>
                            <ParseLocalFile handleData={setItems} />
                        </Form.Item>
                    </Col>
                    <Col xs={8} sm={4} md={3}>
                        <a href={'/mintByMetadataUri.csv'} download={'mintByMetadataUri.csv'} style={{ color: 'gray' }}><Button type='link'>下载模板</Button></a>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item>
                <Typography>
                    <Title level={5} type={'danger'}>说明</Title>
                    <Paragraph type={'danger'}>
                        1.NFT ID自动递增：上传NFT元数据uri与接收地址，nft_id列为空。系统将自动按合约当前的NFT ID的递增铸造到接收地址，默认铸造的NFT数量都是1，初始的NFT ID从1开始。
                    </Paragraph>
                    <Paragraph type={'danger'}>
                        2.指定NFT ID：上传指定NFT ID、NFT ID对应的元数据uri、 NFT ID对应的接收地址，接收地址将获得指定的NFT ID空投，默认铸造的NFT数量都是1。
                    </Paragraph>
                </Typography>
            </Form.Item>
            <Form.Item>
                <Button type='primary' onClick={onFinish}>开始铸造</Button>
            </Form.Item>
        </Form>
        {table}
    </>
}