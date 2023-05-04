import React, { useEffect, useState } from 'react';
import { Button, Form, FormInstance, Input, message, Space, Tooltip, Typography, Upload, Image } from 'antd';
import { LinkOutlined, QuestionCircleOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons/lib";
import { getAppAccounts } from "@services/app";
import { authHeaderSync, methodUrl } from "@services/index";
// import FileUploadOrInput from '@components/FileUploadOrInput';

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
    const [videoUploadPercent, setVideoUploadPercent] = useState(0);
	
    useEffect(() => {
		if (!appId) return;
		getAppAccounts(appId).then(accounts => {
			const acc = accounts.find(item => item.chain_id === chainId)?.address || "";
			setMyAccount(acc);
		});
	}, [appId, chainId])

	const fillMintTo = () => {
		form.setFieldsValue({"mint_to_address": myAccount})
		// console.log(`MintFormFields form values`, form.getFieldsValue())
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
			name="complex-form"
            form={form}
			onFinish={(values: any) => console.log('mintFormFields received values of form: ', values)}
			labelCol={{span: 2}}
			wrapperCol={{span: 16}}
		>
            {props.withName && 
                <Form.Item label="名字" name='name' rules={[{required: true, message: '请输入名字'}]}>
                    <Input style={{width: '50%'}} placeholder="NFT 名称"/>
                </Form.Item>
            }

			{props.withDesc && 
                <Form.Item name="description" label="描述" rules={[{required: true}]}>
                    <Input.TextArea style={{width: '50%'}} rows={2} placeholder='NFT 简单描述，建议长度在 50 字以内'/>
                </Form.Item>
			}
            
			{props.withImage &&
                <Form.Item 
                    name={"file_group"} 
                    label={<>图片&nbsp;<Tooltip title={"可通过上传文件设置图片链接，也可手动填入图片链接"}><QuestionCircleOutlined/></Tooltip></>}
                    style={{marginBottom: previewUrl ? '0px' : '24px', border: '0px solid red'}}  
                    rules={[{required: true, message: 'Address is required'}]}
                >
                    <Space direction={"vertical"}>
                        <Space>
                            <Form.Item name="file_url" noStyle style={{width: 'calc(90% - 8px)', border: '0px solid red'}}>
                                <Input placeholder="上传文件或输入文件URL" />
                            </Form.Item>

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
                            {/* <Button type={"text"} onClick={() => {
                                let url = 'https://console.nftrainbow.cn/nftrainbow-logo-light.png';
                                form.setFieldValue('file_url', url)
                                setPreviewUrl(url);
                            }} style={{color: "gray"}}>
                                <Tooltip title={"使用测试图片URI"} mouseEnterDelay={0.1}><LinkOutlined/></Tooltip>
                            </Button> */}
                        </Space>
                        {previewUrl &&
                            <div style={{display: 'block', marginBottom: '8px', marginTop: '0px'}}>
                                <Image width={"200px"} src={previewUrl}/>
                            </div>
                        }
                    </Space>
                </Form.Item>
			}

            {props.withAddress && 
                <Form.Item name='group_mint_to' label="接受地址" rules={[{required: true, message: 'Address is required'}]}>
                    <Input.Group compact>
                        <Form.Item
                            name='mint_to_address'
                            noStyle
                            rules={[{required: true, message: 'Address is required'}]}
                        >
                            <Input style={{width: '50%'}} placeholder="请输入正确的 Web3 账户地址，注意树图钱包地址区分网络" />
                        </Form.Item>
                        {/* <Button type={"text"} onClick={fillMintTo} style={{color: "gray"}}>
                            <Tooltip title={"使用App账户地址"} mouseEnterDelay={1}><UserOutlined/></Tooltip>
                        </Button> */}
                    </Input.Group>
                </Form.Item>
			}
            
            {props.withAnimation &&
                <Form.Item 
                    name={"file_group"} 
                    label={<><span>动画文件</span>&nbsp;<Tooltip title={"动画文件可增强 NFT 在 Scan 的展示效果，支持文件类型：mp4,gif"}><QuestionCircleOutlined/></Tooltip></>} 
                    style={{marginBottom: '24px', border: '0px solid red'}}
                >
                    <Space>
                        <Form.Item name="animation_url" noStyle style={{width: 'calc(90% - 8px)', border: '0px solid red'}}>
                            <Input placeholder="上传文件或输入文件URL" />
                        </Form.Item>

                        <Form.Item
                            name="file_url_upload" valuePropName="fileList" getValueFromEvent={normFile}
                            style={{border: '0px solid red', display: 'inline-block', marginBottom: '0px'}}
                        >
                            <Upload name={"file"} action={methodUrl("/dashboard/misc/upload")} showUploadList={false}
                                    maxCount={1} listType="picture"
                                    accept={".mp4,.gif"}
                                    headers={authHeaderSync()}
                                    onChange={(info) => {
                                        if (info.file.status === 'done') {
                                            form.setFieldValue("animation_url", info.file.response.url)
                                            setPreviewUrl(info.file.response.url);
                                        } else if (info.file.status === 'uploading') {
                                            setVideoUploadPercent(info.file.percent || 100)
                                        }
                                    }}
                            >
                                <Button icon={<UploadOutlined/>}>上传</Button>
                            </Upload>
                        </Form.Item>
                        {videoUploadPercent > 0 && <Text type={"secondary"}>{videoUploadPercent.toFixed(2)}%</Text>}
                    </Space>
                </Form.Item>
			}

            {/* {props.withAnimation && 
                <Form.Item label="动画文件">
                    <Form.Item
                        name="animation_url"
                        noStyle
                        rules={[{required: false, message: ''}]}
                    >
                        <FileUploadOrInput style={{width: '50%'}} onChange={(err: Error, file: any) => form.setFieldValue('animation_url', file.url)}/>
                    </Form.Item>
                </Form.Item>
            } */}
		</Form>
	);
}

interface checkInputOptions {
    withImage: boolean, 
    withName: boolean, 
    withDesc: boolean,
    withAddress: boolean, 
    withAnimation?: boolean,
}

export function checkMintInput(form: FormInstance, opts: checkInputOptions) {
    const { withImage, withName, withDesc, withAddress } = opts;
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