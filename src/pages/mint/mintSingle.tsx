import MintFormFields, {checkMintInput} from "./mintFormFields";
import React, {FormEventHandler, useEffect, useState} from "react";
import {Button, Checkbox, Col, Form, Input, InputNumber, message, Row, Space, Tooltip, Typography} from "antd";
import {batchMint, easyMintUrl, getMintTask} from "../../services/app";
import {Contract, NFT} from "../../models";
import {mapChainAndNetworkName} from "../../utils";
import set = Reflect.set;
import {QuestionCircleOutlined, QuestionOutlined} from "@ant-design/icons/lib";
import JsonEditor, {jsonToAttributesArray} from "@pages/mint/JsonEditor";
import Attributes from "@pages/mint/attributes";

export function MintSingle(props: { appId: any, contract: Contract }) {
	const {contract, appId} = props;
	const [form] = Form.useForm();
	const [formCopies] = Form.useForm();
	const [info, setInfo] = useState({} as any)
	const [mintLoading, setMintLoading] = useState(false);
	const [tick, setTick] = useState(0);
	const [taskId, setTaskId] = useState(0);
	const [task, setTask] = useState({} as NFT);
	const [hasTrait, setHasTrait] = useState(false);
	const [step, setStep] = useState('edit' as 'edit'|'submitted'|'done');
	const [attributes, setAttributes] = useState([] as any[])
	useEffect(()=>{
		if (!taskId) {
			return;
		}
		getMintTask(taskId).then(res=>{
			setTask(res);
			if (res.status == 0) {
				setTimeout(()=>setTick(tick+1), 1_000)
			} else if (res.status == 1){
				setMintLoading(false)
				message.info(`铸造完毕~`)
				setStep('done')
			} else {
				setMintLoading(false)
				message.info(`铸造出错[${res.status}][${res.error}]`)
			}
		})
	}, [taskId, tick])
	const mint = () => {
		console.log(`copies`, formCopies.getFieldsValue())
		const values = checkMintInput(form, {withImage: true, withName: true, withDesc: true, withAddress: true})
		if (!values) {
			return;
		}
		const attributesFormatted = attributes//hasTrait ? jsonToAttributesArray(attributes) : []
		const badRow = attributesFormatted.filter(v=>!v?.trait_type || !v?.value).length
		if (badRow) {
			message.info(`请完善扩展属性`)
			return;
		} else {
			// message.info(`ok`)
			// return;
		}
		const options = {
			...values,
			chain: mapChainAndNetworkName(contract.chain_type, contract.chain_id),
			contract_address: contract.address,
			attributes: attributesFormatted,
		};
		setInfo(options);
		setMintLoading(true)
		let copies = formCopies.getFieldValue("copies")
		if (copies > 1) {
			const arr = []
			for(let i=0; i<copies; i++) arr.push(options);
			batchMint(props.appId.toString(), arr).then(([res])=>{
				setStep("submitted")
				setTask(res?.mint_task || {})
				console.log(`res`, res)
			}).finally(()=>{
				setMintLoading(false)
			})
			return;
		}

		easyMintUrl(props.appId.toString(), options)
			.then((res) => {
				message.info(`铸造任务提交成功！`)
				setTaskId(res.id)
				// still in loading in order to check status
			})
			.catch(e => {
				const msg = e.response?.data?.message || e.toString()
				message.error(`铸造失败:${msg}`)
				console.log(`error is`, e)
				setMintLoading(false)
			}).finally(() => {
			})
	}
	if (!contract.address) {
		return "合约地址不正确"
	}
	return (
		<>
			<MintFormFields withImage={true} form={form} appId={appId} chainId={contract.chain_id}
			                withDesc={true}
			                withAddress={true}
			                withName={true}/>
			{/*<Form form={form} labelCol={{span:2}}>*/}
			{/*	<Form.Item label={"扩展属性"} style={{marginBottom: 0}}>*/}
			{/*		<Space direction={"vertical"}>*/}
			{/*			<Checkbox value={"yes"} onClick={(e)=>setHasTrait(e.target.checked)}/>*/}
			{/*		</Space>*/}
			{/*	</Form.Item>*/}
			{/*</Form>*/}
			<div style={{marginLeft: '0px', display: (hasTrait || 1) ? "" : "none"}}>
				<Row>
					<Col span={2} style={{textAlign: 'right', textBaseline: 'center', marginTop:5}}>
						<Tooltip title={"这些属性会出现在meta信息的attributes上，可不填写。"}><QuestionCircleOutlined/></Tooltip> 扩展属性：
					</Col>
					<Col span={22}>
						<Attributes onValuesChange={(_,{attributes:all})=>{
							// console.log(`form list changes`, JSON.stringify(all))
							setAttributes(all)
						}}/>
						{/*<JsonEditor setFetcher={(json)=>{*/}
						{/*	// console.log(`json is`, json)*/}
						{/*	setAttributes(json)*/}
						{/*}}/>*/}
					</Col>
				</Row>
				{/*={JSON.stringify(attributes)}-*/}
			</div>
			<Form form={formCopies} labelCol={{span:2}}>
				<Form.Item label={"数量"} style={{marginBottom: 0}} name={"copies"}>
					<Space>
						<InputNumber type={"number"} step={1} precision={0} min={1} max={100} defaultValue={1} style={{width:"200px"}}
							onChange={(v)=>formCopies.setFieldValue("copies", v)}/>
						<Tooltip title={"铸造多少个NFT给同一个接受地址。这些NFT只有id不同，其他属性完全相同。"}><QuestionCircleOutlined/></Tooltip>
					</Space>
				</Form.Item>
			</Form>
			{ step === 'edit' &&
				<Button loading={mintLoading} style={{marginTop: '8px'}} htmlType={"submit"} type={"primary"}
			         onClick={() => {
				         // message.info(`尚未接入后端接口`)
				         mint();
			         }}>{mintLoading ? "铸造中" : "开始铸造"}</Button>
			}
			<Space>
				<Space style={{marginTop:'8px'}} >
				{mintLoading &&
					<Tooltip title={"铸造任务会在后台执行，请耐心等待"}><QuestionCircleOutlined  style={{marginLeft: '8px'}} /></Tooltip>
				}

				{ step === 'submitted'  &&
				(<>
					<Typography.Text type={"success"}>任务提交成功！</Typography.Text>请在铸造历史中查看执行结果。
					<Button type={"primary"} onClick={()=>setStep('edit')}>我知道了</Button>
				</>)
				}

				{ step === 'done'  &&
				(<>
					<Typography.Text type={"success"}>铸造成功！</Typography.Text>
					<Button type={"primary"} onClick={()=>setStep('edit')}>我知道了</Button>
				</>)
				}

				{task.token_uri &&
				<Button type={"link"}><a href={task.token_uri} target={"_blank"}>查看URI</a></Button>
				}
				</Space>
			</Space>
		</>
	);
}