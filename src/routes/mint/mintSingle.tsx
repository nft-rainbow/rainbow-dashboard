import MintFormFields, {checkMintInput} from "./mintFormFields";
import React, {FormEventHandler, useState} from "react";
import {Button, Form, message} from "antd";
import {easyMintUrl} from "../../services/app";
import {Contract} from "../../models";
import {mapChainAndNetworkName} from "../../utils";
import set = Reflect.set;

export function MintSingle(props:{appId:any, contract:Contract}) {
	const {contract, appId} = props;
	const [form] = Form.useForm();
	const [info,setInfo] = useState({} as any)
	const mint = () => {
		const values = checkMintInput(form)
		if (!values) {
			return;
		}
		const options = {...values,
			chain: mapChainAndNetworkName(contract.chain_type, contract.chain_id),
			contract_address: contract.address,
		};
		setInfo(options);
		easyMintUrl(props.appId.toString(), options)
			.then(()=>{
				message.info(`铸造成功！`)
			})
			.catch(e => {
				const msg = e.response?.data?.message || e.toString()
				message.error(`铸造失败:${msg}`)
				console.log(`error is`,e)
			})
	}
	return (
		<>
			app id [{props.appId}]
			<MintFormFields withImage={true} form={form} appId={appId} chainId={contract.chain_id}
			                withDesc={true}
			                withAddress={true}
			                withName={true}/>
			<Button style={{marginTop: '8px'}} htmlType={"submit"} type={"primary"} onClick={() => {
				// message.info(`尚未接入后端接口`)
				mint();
			}}>开始铸造</Button>
			{JSON.stringify(info)}
		</>
	)
}