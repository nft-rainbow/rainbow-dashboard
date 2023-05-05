import React, { useEffect, useState } from "react";
import { 
    Button, Col, Form, InputNumber, message,
    Row, Space, Tooltip, Typography, Radio, Input
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons/lib";
import { batchMint, easyMintUrl, getMintTask, batchMintByMetadataUri } from "@services/app";
import { Contract, NFT } from "@models/index";
import { mapChainAndNetworkName } from "@utils/index";
import Attributes from "./attributes";
import MintFormFields, { checkMintInput } from "./mintFormFields";

export function MintSingle(props: { appId: any, contract: Contract }) {
	const {contract, appId} = props;
    const [mintMode, setMintMode] = useState('metadata' as 'metadata'|'uri');
    const [mintLoading, setMintLoading] = useState(false);
    const [taskId, setTaskId] = useState(0);
	const [task, setTask] = useState({} as NFT);
    const [step, setStep] = useState('edit' as 'edit'|'submitted'|'done');

	const [form] = Form.useForm();
	const [formCopies] = Form.useForm();
	const [tick, setTick] = useState(0);
	const [hasTrait, setHasTrait] = useState(false);
	const [attributes, setAttributes] = useState([] as any[])

    // metadataUri mint mode state
    const [metadataUri, setMetadataUri] = useState('');
    const [address, setAddress] = useState('');
    const [tokenId, setTokenId] = useState('');

	const mint = async () => {
        if (mintMode === 'metadata') {  // 元数据铸造模式
            const checkOpts = {withImage: true, withName: true, withDesc: true, withAddress: true, withAnimation: true};
            const values = checkMintInput(form, checkOpts);
            if (!values) return;

            const attributesFormatted = attributes//hasTrait ? jsonToAttributesArray(attributes) : []
            const badRow = attributesFormatted.filter(v=>!v?.trait_type || !v?.value).length
            if (badRow) {
                message.info(`请完善扩展属性`)
                return;
            }

            // TODO: check accept address is valid
            try {
                const options = {
                    ...values,
                    chain: mapChainAndNetworkName(contract.chain_type, contract.chain_id),
                    contract_address: contract.address,
                    attributes: attributesFormatted,
                };
                // setInfo(options);
                setMintLoading(true);
                let copies = parseInt(formCopies.getFieldValue("copies"));
                if (copies > 1) { // mint multiple copies
                    const arr = []
                    arr.push(Object.assign(options, {number: copies}));
                    let [res] = await batchMint(props.appId.toString(), arr);
                    setTask(res?.mint_task || {})
                    return;
                } else { // mint single copy
                    let res = await easyMintUrl(props.appId.toString(), options);
                    setTaskId(res[0].id);
                }
                setStep("submitted");
                setMintLoading(false);
            } catch (e) {
                // @ts-ignore
                const msg = e.response?.data?.message || e.toString()
                message.error(`铸造失败:${msg}`)
                setMintLoading(false);
            }
        } else if (mintMode === 'uri') {  // metadataUri 铸造模式
            try {
                const item = {
                    metadata_uri: metadataUri,
                    mint_to_address: address,
                    token_id: tokenId,
                };
                if (tokenId) {
                    // @ts-ignore
                    item.token_id = tokenId;
                }
                setMintLoading(true);
                let res = await batchMintByMetadataUri(appId, {
                    chain: mapChainAndNetworkName(contract.chain_type, contract.chain_id),
                    contract_address: contract.address,
                    mint_items: [item],
                });
                setTaskId(res[0]);
                setMintLoading(false);
                message.success("任务提交成功，请至铸造历史查看");
            } catch(e) {
                // @ts-ignore
                message.error("任务提交失败" + e.response?.data?.message || '');
                setMintLoading(false)
            }
        }
	}

    useEffect(()=>{
		if (!taskId) return;
		getMintTask(taskId).then(res=>{
			setTask(res);
			if (res.status === 0) {
				setTimeout(()=>setTick(tick+1), 1_000)
			} else if (res.status === 1){
				setMintLoading(false)
				message.info(`铸造完毕~`)
				setStep('done')
			} else {
				setMintLoading(false)
				message.info(`铸造出错[${res.status}][${res.error}]`)
			}
		})
	}, [taskId, tick])

	if (!contract.address) {
		return <span>合约信息加载不完整</span>;
	}

	return (
		<>
            <Form.Item label={<><span>铸造模式</span>&nbsp;<Tooltip title={"若事先已创建了 NFT 元数据，并获得 URI，可选用'元数据URI'模式; 否则请选择'自定义信息'模式"}><QuestionCircleOutlined/></Tooltip></>} labelCol={{span:2}}>
                <Space>
                    <Radio.Group value={mintMode} onChange={e => setMintMode(e.target.value)}>
                        <Radio.Button value="metadata">自定义信息</Radio.Button>
                        <Radio.Button value="uri">元数据URI</Radio.Button>
                    </Radio.Group>
                </Space>
            </Form.Item>
            {   
                mintMode === 'metadata' && <>
                    <MintFormFields 
                        withImage={true} 
                        form={form} 
                        appId={appId} 
                        chainId={contract.chain_id}
                        withDesc={true}
                        withAddress={true}
                        withAnimation={true}
                        withName={true}
                    />
                    <div style={{marginLeft: '0px', display: (hasTrait || 1) ? "" : "none"}}>
                        <Row>
                            <Col span={2} style={{textAlign: 'right', marginTop: 5}}>
                                扩展属性 <Tooltip title={"属性用于设置 NFT 信息的 attributes 内容，非必填项"}><QuestionCircleOutlined/></Tooltip> ：
                            </Col>
                            <Col span={22}>
                                <Attributes onValuesChange={(_,{attributes:all})=>{
                                    setAttributes(all)
                                }}/>
                            </Col>
                        </Row>
                    </div>
                    <Form form={formCopies} labelCol={{span:2}} style={{marginBottom: '20px'}}>
                        <Form.Item label={<><span>数量</span>&nbsp;<Tooltip title={"NFT 铸造数量，多个 NFT 信息相同，TokenId 不同"}><QuestionCircleOutlined/></Tooltip></>} style={{marginBottom: 0}} name={"copies"}>
                            <Space>
                                <InputNumber type={"number"} step={1} precision={0} min={1} max={100} defaultValue={1} style={{width:"200px"}}
                                    onChange={(v)=>formCopies.setFieldValue("copies", v)}/>
                            </Space>
                        </Form.Item>
                    </Form>
                </>
            }
            {
                mintMode === 'uri' && <>
                    <Form labelCol={{ span: 2 }} wrapperCol={{span: 16}} style={{ marginTop: "20px" }}>
                        <Form.Item label="元数据URI" name="metadata_uri" rules={[{ required: true, message: '请输入MetadataURI' }]}>
                            <Input onChange={e => setMetadataUri(e.target.value)} style={{width: '50%'}} />
                        </Form.Item>
                        <Form.Item label="接受地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
                            <Input onChange={e => setAddress(e.target.value)} style={{width: '50%'}} />
                        </Form.Item>
                    </Form>
                </>
            }

            <Form.Item label={<><span>TokenID</span>&nbsp;<Tooltip title={"非必填项，不填则随机生成"}><QuestionCircleOutlined/></Tooltip></>} labelCol={{span: 2}}>
                <Input name="token_id" onChange={e => setTokenId(e.target.value)} style={{width: '200px'}} placeholder="非必填项，默认随机生成"/>
            </Form.Item>
			
            <Row>
                <Col span={2}>
                </Col>
                <Col>
                    { step === 'edit' &&
                        <Button 
                            loading={mintLoading} 
                            style={{marginTop: '8px'}} 
                            htmlType={"submit"} 
                            type={"primary"} 
                            onClick={() => mint()}
                        >
                            {mintLoading ? "铸造中" : "开始铸造"}
                        </Button>
                    }
                    <Space style={{marginTop:'8px'}} >
                        {mintLoading &&
                            <Tooltip title={"铸造任务会在后台执行，请耐心等待"}><QuestionCircleOutlined  style={{marginLeft: '8px'}} /></Tooltip>
                        }

                        { step === 'submitted'  &&
                            (<>
                                <Typography.Text type={"success"}>任务提交成功！</Typography.Text>请在铸造历史中查看执行结果。
                                <Button type={"primary"} onClick={()=>setStep('edit')}>确定</Button>
                            </>)
                        }

                        { step === 'done'  &&
                            (<>
                                <Button type={"primary"} onClick={()=>setStep('edit')}>确定</Button>
                                <Typography.Text type={"success"}>铸造成功！</Typography.Text>
                            </>)
                        }

                        {task.token_uri && <Button type={"link"}><a href={task.token_uri} target={"_blank"} rel="noreferrer">查看URI</a></Button>}
                    </Space>
                </Col>
            </Row>
		</>
	);
}