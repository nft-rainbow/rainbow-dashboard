import React, {FormEventHandler, useCallback, useEffect, useState} from 'react';
import {Button, Form, FormInstance, Input, message, Radio, Select, Space, Tooltip, Typography, Upload} from 'antd';
import {CheckboxChangeEvent} from "antd/es/checkbox";
import FileUpload from "../../components/FileUpload";
import {LinkOutlined, UploadOutlined, UserOutlined} from "@ant-design/icons/lib";
import {Image} from "antd"
import {getAppAccounts} from "@services/app";

import {authHeaderSync, methodUrl} from "../../services";
import FormUpload from "./MintUpload";

const { Option } = Select;

const onFinish = (values: any) => {
	console.log('Received values of form: ', values);
};

export default function MintFormFields(props:{withImage: boolean, withName: boolean, withDesc: boolean,
	withAddress: boolean, form:FormInstance, appId:string, chainId:number}) {
	const { Text, Link } = Typography;
	const {form, appId, chainId} = props;
	const [myAccount, setMyAccount] = useState('fetching')
	const [uploadPercent, setUploadPercent] = useState(0);
	const [previewUrl, setPreviewUrl] = useState('');
	useEffect(()=>{
		if (!appId) {
			return;
		}
		getAppAccounts(appId).then(accounts=>{
			const acc = accounts.find(item => item.chain_id === chainId)?.address || "";
			setMyAccount(acc);
		});
	}, [appId])
	const fillMintTo = ()=>{
		form.setFieldsValue({"mint_to_address": myAccount})
		console.log(`form values`, form.getFieldsValue())
	}
	return (
		<Form
			name="complex-form" form={form}
			onFinish={onFinish}
			labelCol={{ span: 2 }}
			wrapperCol={{ span: 16 }}
		>
			{props.withImage &&
			<Form.Item name={"file_group"} label="图片URL" style={{marginBottom: previewUrl ? '0px' : '24px', border: '0px solid red'}}>
				<Space>
				<Form.Item
					name="file_url" noStyle
					style={{
						// display: 'inline-block',
						width: 'calc(90% - 8px)',
						border: '0px solid red'
					}}
				>
					<Input placeholder=""/>
				</Form.Item>

				<Button type={"text"} onClick={() => {
					let url = 'https://console.nftrainbow.cn/nftrainbow-logo-light.png';
					form.setFieldValue('file_url',url)
					setPreviewUrl(url);
				}} style={{color: "gray"}}>
					<Tooltip title={"使用测试图片"} mouseEnterDelay={0.1}><LinkOutlined/></Tooltip>
				</Button>

					<Form.Item
					name="file_url_upload"
					style={{border: '0px solid red', display: 'inline-block', marginBottom:'0px'}}
				>
					<Upload name={"file"} action={methodUrl("/dashboard/misc/upload")} showUploadList={false}
					        maxCount={1} listType="picture"
					        accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
					        headers={authHeaderSync()}
					        onChange={(info)=>{
					        	if (info.file.status === 'done') {
					        		form.setFieldValue("file_url", info.file.response.url)
							        setPreviewUrl(info.file.response.url);
						        } else if (info.file.status === 'uploading') {
							        if (previewUrl) {
							        	setPreviewUrl("")
							        }
							        console.log(`uploading`, info.file.percent);
							        setUploadPercent(info.file.percent || 100)
						        }
					        }}
					>
						<Button icon={<UploadOutlined />}>上传</Button>
					</Upload>
				</Form.Item>
					{uploadPercent > 0 && <Text type={"secondary"}>{uploadPercent.toFixed(2)}%</Text>}
				</Space>
				{previewUrl && <div style={{display: 'block', marginBottom:'8px', marginTop:'8px'}}>
					<Image width={"200px"} src={previewUrl}/>
				</div>}
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

export function checkMintInput(form:FormInstance, {withImage, withName, withDesc,
	withAddress}: {withImage: boolean, withName: boolean, withDesc: boolean,
	withAddress: boolean}) {
	const {file_url,name,description, mint_to_address, useUpload} = form.getFieldsValue();
	if (withImage && !file_url) {
		message.info(`请设置图片`)
		return;
	}
	if (withName && !name) {
		message.info(`请填写名称`)
		return;
	}
	if (withAddress && !mint_to_address) {
		message.info(`请填写接受地址`)
		return;
	}
	return {file_url, name, description: description||'', mint_to_address}
}