import React, {FormEventHandler, useCallback, useEffect, useState} from 'react';
import {Button, Form, FormInstance, Input, message, Radio, Select, Space, Tooltip, Typography} from 'antd';
import {CheckboxChangeEvent} from "antd/es/checkbox";
import FileUpload from "../../components/FileUpload";
import {LinkOutlined, UserOutlined} from "@ant-design/icons/lib";
import {getAppAccounts} from "../../services/app";

const { Option } = Select;

const onFinish = (values: any) => {
	console.log('Received values of form: ', values);
};

export default function MintFormFields(props:{withImage: boolean, withName: boolean, withDesc: boolean,
	withAddress: boolean, form:FormInstance, appId:string, chainId:number}) {
	const {form, appId, chainId} = props;
	const [useUpload, setUseUpload] = useState(true);
	const [myAccount, setMyAccount] = useState('fetching')
	useEffect(()=>{
		getAppAccounts(appId).then(accounts=>{
			const acc = accounts.find(item => item.chain_id === chainId)?.address || "";
			setMyAccount(acc);
		})
	}, [appId])
	const fillMintTo = ()=>{
		form.setFieldsValue({"mint_to_address": myAccount})
		console.log(`form values`, form.getFieldsValue())
	}
	return (
		<Form
			name="complex-form" form={form}
			onFinish={onFinish}
			labelCol={{ span: 1 }}
			wrapperCol={{ span: 16 }}
		>
			{props.withImage &&
			<Form.Item label="图片" style={{marginBottom: 0}}>
				<Form.Item
					style={{display: 'inline-block'}}
					name={'useUpload'}
				>
					<Radio.Group value={useUpload ? 'upload' : 'input'} style={{marginRight: '8px'}}
					             onChange={(e: CheckboxChangeEvent) => {
						             setUseUpload(e.target.value === 'upload')
					             }}>
						<Radio.Button value="upload">本地文件</Radio.Button>
						<Radio.Button value="input">网络链接</Radio.Button>
					</Radio.Group>
				</Form.Item>
				{useUpload && <Form.Item
					name="file_url"
					style={{display: 'inline-block'}}
				>
					<FileUpload
						accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
						listType="picture" maxCount={1}
						onChange={(err: Error, file: any) => form.setFieldsValue({file_url: file.url, file_link:''})}/>
				</Form.Item>}
				{!useUpload && <Form.Item
					name="file_link"
					style={{
						display: 'inline-block',
						width: 'calc(60% - 8px)',
						border: '0px solid red'
					}}
				>
					<Input placeholder=""/>
				</Form.Item>}
				{!useUpload && <Form.Item
					style={{display: 'inline-block'}}
				>
					<Button type={"text"} onClick={() => {
						form.setFieldsValue({'file_url':'',
							'file_link': 'https://console.nftrainbow.cn/nftrainbow-logo-light.png'})
					}} style={{color: "gray"}}>
						<Tooltip title={"使用测试图片"} mouseEnterDelay={0.1}><LinkOutlined/></Tooltip>
					</Button>
				</Form.Item>}
			</Form.Item>
			}
			{props.withName && <Form.Item label="名字">
					<Form.Item
						name="name"
						noStyle
						rules={[{required: true, message: ''}]}
					>
						<Input style={{width: '50%'}} placeholder=""/>
					</Form.Item>
			</Form.Item>}
			{props.withDesc && <Form.Item name="description" label="描述" rules={[{ required: false }]}>
				<Input.TextArea style={{width: '50%'}} rows={2} />
			</Form.Item>}
			{props.withAddress && <Form.Item name='group_mint_to' label="接受人">
				<Input.Group compact>
					<Form.Item
						name='mint_to_address'
						noStyle
						rules={[{required: true, message: 'Address is required'}]}
					>
						<Input style={{width: '50%'}} placeholder=""/>
					</Form.Item>
					<Button type={"text"} onClick={fillMintTo} style={{color: "gray"}}>
						<Tooltip title={"使用App账户地址"} mouseEnterDelay={1}><UserOutlined/></Tooltip>
					</Button>
				</Input.Group>
			</Form.Item>}
		</Form>
	);
}

export function checkMintInput(form:FormInstance) {
	const {file_link, file_url,name,description, mint_to_address, useUpload} = form.getFieldsValue();
	const url = useUpload === 'upload' ? file_url : file_link;
	if (!url) {
		message.info(`请设置图片`)
		return;
	}
	if (!name) {
		message.info(`请填写名称`)
		return;
	}
	if (!mint_to_address) {
		message.info(`请填写接受地址`)
		return;
	}
	return {file_url: url, name, description: description||'', mint_to_address}
}