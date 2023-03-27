import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, message, Space, Tooltip, Typography, Upload, Image } from 'antd';
import { LinkOutlined, QuestionCircleOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons/lib";
import { getAppAccounts } from "@services/app";
import { authHeaderSync, methodUrl } from "@services/index";
import FileUploadOrInput from '@components/FileUploadOrInput';

const onFinish = (values: any) => {
	console.log('Received values of form: ', values);
};

export default function MintFormFields(props: {
	withImage: boolean, withName: boolean, withDesc: boolean,
	withAddress: boolean, form: FormInstance, appId: string, chainId: number,
    withAnimation: boolean,
}) {
	const { Text } = Typography;
	const {form, appId, chainId} = props;
	const [myAccount, setMyAccount] = useState('fetching')
	const [uploadPercent, setUploadPercent] = useState(0);
	const [previewUrl, setPreviewUrl] = useState('');
	
    useEffect(() => {
		if (!appId) return;
		getAppAccounts(appId).then(accounts => {
			const acc = accounts.find(item => item.chain_id === chainId)?.address || "";
			setMyAccount(acc);
		});
	}, [appId, chainId])

	const fillMintTo = () => {
		form.setFieldsValue({"mint_to_address": myAccount})
		console.log(`MintFormFields form values`, form.getFieldsValue())
	}

	const normFile = (e: any) => {
		// Upload component requires this function
		if (Array.isArray(e)) {
			return e;
		}
		return e?.fileList;
	};

	return (
		<Form
			name="complex-form" form={form}
			onFinish={onFinish}
			labelCol={{span: 2}}
			wrapperCol={{span: 16}}
		>
			{props.withImage &&
			<Form.Item name={"file_group"} label="图片链接" style={{marginBottom: previewUrl ? '0px' : '24px', border: '0px solid red'}}>
				<Space direction={"vertical"}>
				<Space>
					<Form.Item name="file_url" noStyle style={{width: 'calc(90% - 8px)',border: '0px solid red'}}>
						<Input placeholder=""/>
					</Form.Item>

					<Button type={"text"} onClick={() => {
						let url = 'https://console.nftrainbow.cn/nftrainbow-logo-light.png';
						form.setFieldValue('file_url', url)
						setPreviewUrl(url);
					}} style={{color: "gray"}}>
						<Tooltip title={"使用测试图片"} mouseEnterDelay={0.1}><LinkOutlined/></Tooltip>
					</Button>

					<Form.Item
						name="file_url_upload" valuePropName="fileList" getValueFromEvent={normFile}
						style={{border: '0px solid red', display: 'inline-block', marginBottom: '0px'}}
					>
						<Upload name={"file"} action={methodUrl("/dashboard/misc/upload")} showUploadList={false}
						        maxCount={1} listType="picture"
						        accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
						        headers={authHeaderSync()}
						        onChange={(info) => {
							        if (info.file.status === 'done') {
								        form.setFieldValue("file_url", info.file.response.url)
								        setPreviewUrl(info.file.response.url);
							        } else if (info.file.status === 'uploading') {
								        if (previewUrl) {
									        setPreviewUrl("")
								        }
								        setUploadPercent(info.file.percent || 100)
							        }
						        }}
						>
							<Button icon={<UploadOutlined/>}>上传</Button>
						</Upload>
					</Form.Item>
					{uploadPercent > 0 && <Text type={"secondary"}>{uploadPercent.toFixed(2)}%</Text>}
					<Tooltip title={"通过上传文件可以自动生成图片链接，也可以手动填入已有的图片链接。"}><QuestionCircleOutlined/></Tooltip>
				</Space>
					{previewUrl &&
					<div style={{display: 'block', marginBottom: '8px', marginTop: '0px'}}>
						<Image width={"200px"} src={previewUrl}/>
					</div>
					}
				</Space>
			</Form.Item>
			}

            {props.withAnimation && <Form.Item label="动画文件">
				<Form.Item
					name="animation_url"
					noStyle
					rules={[{required: false, message: ''}]}
				>
					{/* <Input style={{width: '50%'}} placeholder="NFT的动画文件url，非必填"/> */}
                    <FileUploadOrInput style={{width: '50%'}} onChange={(err: Error, file: any) => form.setFieldValue('animation_url', file.url)}/>
				</Form.Item>
			</Form.Item>}

			{props.withName && <Form.Item label="名字">
				<Form.Item
					name="name"
					noStyle
					rules={[{required: true, message: ''}]}
				>
					<Input style={{width: '50%'}} placeholder=""/>
				</Form.Item>
			</Form.Item>}

			{props.withDesc && <Form.Item name="description" label="描述" rules={[{required: false}]}>
				<Input.TextArea style={{width: '50%'}} rows={2}/>
			</Form.Item>
			}

			{props.withAddress && <Form.Item name='group_mint_to' label="接受地址">
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
			</Form.Item>
			}
		</Form>
	);
}

export function checkMintInput(form: FormInstance, {
	withImage, withName, withDesc,
	withAddress,
}: {
	withImage: boolean, withName: boolean, withDesc: boolean,
	withAddress: boolean, withAnimation?: boolean,
}) {
	const { file_url, name, description, mint_to_address, animation_url } = form.getFieldsValue();
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
	return {file_url, name, description: description || '', mint_to_address, animation_url}
}