import MintFormFields, {checkMintInput} from "./mintFormFields";
import React, {FormEventHandler, useEffect, useState} from "react";
import {Button, Form, message, Tooltip} from "antd";
import {easyMintUrl, getMintTask} from "../../services/app";
import {Contract, NFT} from "../../models";
import {mapChainAndNetworkName} from "../../utils";
import set = Reflect.set;
import {QuestionCircleOutlined, QuestionOutlined} from "@ant-design/icons/lib";

export function MintSingle(props: { appId: any, contract: Contract }) {
	const {contract, appId} = props;
	const [form] = Form.useForm();
	const [info, setInfo] = useState({} as any)
	const [mintLoading, setMintLoading] = useState(false);
	const [tick, setTick] = useState(0);
	const [taskId, setTaskId] = useState(0);
	const [task, setTask] = useState({} as NFT);
	const updateTask = useEffect(()=>{
		if (!taskId) {
			return;
		}
		getMintTask(appId, taskId).then(res=>{
			setTask(res);
			if (res.status == 0) {
				setTimeout(()=>setTick(tick+1), 1_000)
			} else if (res.status == 1){
				setMintLoading(false)
				message.info(`铸造完毕~`)
			} else {
				setMintLoading(false)
				message.info(`铸造出错[${res.status}][${res.error}]`)
			}
		})
	}, [taskId, tick])
	const mint = () => {
		const values = checkMintInput(form, {withImage: true, withName: true, withDesc: true, withAddress: true})
		if (!values) {
			return;
		}
		const options = {
			...values,
			chain: mapChainAndNetworkName(contract.chain_type, contract.chain_id),
			contract_address: contract.address,
		};
		setInfo(options);
		setMintLoading(true)
		easyMintUrl(props.appId.toString(), options)
			.then((res) => {
				message.info(`铸造任务提交成功！`)
				setTaskId(res.id)
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
			<Button loading={mintLoading} style={{marginTop: '8px'}} htmlType={"submit"} type={"primary"}
			        onClick={() => {
				        // message.info(`尚未接入后端接口`)
				        mint();
			        }}>{mintLoading ? "铸造中" : "开始铸造"}</Button>
			<>
				{mintLoading &&
					<Tooltip title={"铸造任务会在后台执行，请耐心等待"}><QuestionCircleOutlined  style={{marginLeft: '8px'}} /></Tooltip>
				}
				{/*任务ID {taskId} 状态 [{task.status}]*/}
			</>
		</>
	);
}