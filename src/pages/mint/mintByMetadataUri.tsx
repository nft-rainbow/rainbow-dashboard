import React, { useState, useEffect } from "react";
import { 
    Form, Button, Typography, 
    Table, TablePaginationConfig, message,
    Radio, Select, Input, Space
} from "antd";
import { batchMintByAddressOrPhone } from '@services/app';
import { getCertificates, getCertificateDetail } from '@services/whitelist';
import type { SelectProps } from 'antd';
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
    const [dataType, setDataType] = useState('upload');
    const chain = chainId === 1029 ? 'conflux' : 'conflux_test';
    const [items, setItems] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    const [searchName, setSearchName] = useState<string>('');
    const [data, setData] = useState<SelectProps['options']>([]);  // whitelist data
    const [whitelist, setWhitelist] = useState<number|null>(null);
    const [metadataUri, setMetadataUri] = useState<string|null>(null);

    const onFinish = async (values: any) => {

        try {
            if (!contract.address) message.error("");

            const metadata = {
                app_id: appId,
                chain,
                contract_address: contract.address,
                /* mint_items: , */
            };

            if (dataType === 'whitelist') {
                if (!whitelist) {
                    message.error("请选择凭证");
                    return;
                }

                let res = await getCertificateDetail(whitelist, 1, 10000);

                // @ts-ignore
                metadata.source_type = res.certificate_type;
                // @ts-ignore
                metadata.mint_items = res.items.map(item => ({
                    metadata_uri: metadataUri,
                    mint_to: item.address || item.phone,
                    amount: 1,
                }));
            } else {
                if (items.length === 0) return;

                const source_type = items[0].Address.toLowerCase().startsWith('cfx') ? 'address' : 'phone';
                if (source_type === 'address') {
                    let errorAddress = items.find(item => !address.isValidCfxAddress(item.Address));
                    if (errorAddress) {
                        message.error(`地址 ${errorAddress.Address} 不合法`);
                        return;
                    }
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
                // @ts-ignore
                metadata.mint_items = items.map(item => ({
                    metadata_uri: item.MetadataUri,
                    mint_to: item.Address,
                    token_id: item.TokenId ? item.TokenId.toString() : null,
                    amount: 1,
                }));
                // @ts-ignore
                metadata.source_type = source_type;            
            }

            await batchMintByAddressOrPhone(metadata);
            message.success("任务提交成功，请至铸造历史查看");
        } catch(e) {
            console.log("mintByMetadataUri error: ", e);
            // @ts-ignore
            message.error(e.response?.data?.message);
        }
    }

    const handleSearch = async (value: string) => {
        setSearchName(value);
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

    useEffect(() => {
        getCertificates(1, 1000, {name_like: searchName}).then((res) => {
            // @ts-ignore
            setData(res.items.map(item => ({value: item.id, text: item.name})));
        });
    }, [
        searchName
    ]);

    return <>
        <Form labelCol={{span: 2}} wrapperCol={{span: 6}}>
            <Form.Item label='数据源'>
                <Radio.Group value={dataType} onChange={(e) => setDataType(e.target.value)}>
                    <Radio.Button value="upload">上传文件</Radio.Button>
                    <Radio.Button value="whitelist">凭证策略</Radio.Button>
                </Radio.Group>
            </Form.Item>
            {dataType === 'upload' && 
            <Form.Item label="导入数据" name="metadata_uri">
                <Space>
                    <ParseLocalFile handleData={(items: object[]) => {
                        setItems(items.map((i: object) => ({
                            // @ts-ignore
                            Address: i.Address.toString(),  // change to string for phone types
                            // @ts-ignore
                            MetadataUri: i.MetadataUri,
                            // @ts-ignore
                            TokenId: i.TokenId,
                        })));
                    }} /> 
                    <a href={'/mintByMetadataUri.csv'} download={'mintByMetadataUri.csv'} style={{ color: 'gray' }}>
                        <Button type='link'>下载模板</Button>
                    </a>
                </Space>
            </Form.Item>
            }
            {dataType === 'whitelist' &&
            <Form.Item label='凭证策略'>
                <Select
                    showSearch={true}
                    value={whitelist}
                    placeholder={'请选择凭证'}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onSearch={handleSearch}
                    onChange={(value) => setWhitelist(value)}
                    notFoundContent={null}
                    options={(data || []).map((d) => ({
                        value: d.value,
                        label: d.text,
                    }))}
                />
            </Form.Item>
            }
            {
                dataType === 'whitelist' &&
                <Form.Item label='元数据 URI'>
                    <Input onChange={(e) => setMetadataUri(e.target.value)}/>
                </Form.Item>
            }
            <Form.Item wrapperCol={{offset: 2}}>
                <Button type='primary' onClick={onFinish}>开始铸造</Button>
            </Form.Item>
        </Form>
        {table}
        <Typography>
            <Title level={5} type={'warning'}>说明</Title>
            <Paragraph type={'warning'}>
                1. NFT ID 自动递增：上传 NFT 元数据 URI 与接收地址，TokenId 列为空。系统将自动按合约当前的 NFT ID 的递增铸造到接收地址，默认铸造的 NFT 数量都是 1，初始的 NFT ID 从 1 开始。
            </Paragraph>
            <Paragraph type={'warning'}>
                2. 指定 NFT ID：上传指定 NFT ID、NFT ID对应的元数据 URI、 NFT ID 对应的接收地址，接收地址将获得指定的 NFT ID 空投，默认铸造的 NFT 数量都是1。
            </Paragraph>
            <Paragraph type={'warning'}>
                3. 元数据 URI 支持模板字符串，如 {"https://a.com/metadata/{id}.json"}，系统将自动替换 {"{id}"} 为真实 NFT ID。
            </Paragraph>
            {/* <Paragraph type={'warning'}>
                4. 可使用手机号作为 NFT 接受账户，系统将自动调用晒啦钱包获取或创建地址，NFT 铸造后，用户可使用手机号登录<a href="https://www.cellar.pub/">晒啦钱包</a>查看。
            </Paragraph> */}
        </Typography>
    </>
}