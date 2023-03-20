import React, {useEffect, useState} from "react";
import {Typography, Card, Form, FormInstance, Input, Radio, Space, Upload, Button, Image, message} from "antd";
import {authHeaderSync, methodUrl, post} from "@services/index";
import {UploadOutlined} from "@ant-design/icons/lib";

const {Text} = Typography;

export function PlanFields({form, plan}: { form: FormInstance, plan: any }) {
	const [previewUrl, setPreviewUrl] = useState('');
	const [loading, setLoading] = useState(false)
	const [uploadPercent, setUploadPercent] = useState(0);
	const modeValue = Form.useWatch('mode', form);
	const blindModeValue = Form.useWatch('blind_mode', form);
	useEffect(() => {
		form.setFieldsValue(plan)
		setPreviewUrl(plan.blind_cover)
	}, [plan])
	const save = () => {
		const data = {...form.getFieldsValue(), id: plan.id, blind_cover: previewUrl}
		"supply,limit_public,supply_public,supply_whitelist".split(",")
			.forEach(k => data[k] = parseInt(data[k]))
		setLoading(true);
		post(`/dashboard/plan/update`, data).then(res => {
			message.info(`保存成功～`)
		}).finally(() => {
			setLoading(false);
		})
	}
	return (
		<>
			{/*[{JSON.stringify(plan)}]*/}
			<Card>
				<Form form={form} labelCol={{span: 2}} wrapperCol={{span:16}}>
					<Form.Item label={"名称"} name={"name"}>
						<Input type={"text"} style={{width: '20%'}}/>
					</Form.Item>
					<Form.Item label={"发行总量"} name={"supply"}>
						<Input type={"number"} style={{width: '20%'}}/>
					</Form.Item>
					<Form.Item label={"铸造模式"} name={"mode"}>
						<Radio.Group>
							<Radio.Button value={"public"}>公开铸造</Radio.Button>
							<Radio.Button value={"whitelist"}>白名单铸造</Radio.Button>
						</Radio.Group>
					</Form.Item>
					{/*{modeValue?.toString() === 'public' && <Text>公开铸造配置</Text>}*/}
					{modeValue?.toString() === 'public' &&
					<Form.Item label={"选项"} style={{margin: '0px'}}>
						<Space>
							<Form.Item label={"公开铸造数量"} name={"supply_public"}>
								<Input type={"number"}/>
							</Form.Item>
							<Form.Item label={"单个用户铸造数量上限"} name={"limit_public"}>
								<Input type={"number"}/>
							</Form.Item>
						</Space>
					</Form.Item>
					}
					{/*{modeValue?.toString() === 'whitelist' && <Text>白名单铸造配置</Text>}*/}
					{modeValue?.toString() === 'whitelist' &&
					<Form.Item label={"选项"} style={{margin: '0px'}}>
						<Space>
							<Form.Item label={"白名单铸造数量"} name={"supply_whitelist"}>
								<Input type={"number"}/>
							</Form.Item>
							{/*<Form.Item label={"白名单用户铸造数量上限"}>*/}
							{/*	<Input type={"number"}/>*/}
							{/*</Form.Item>*/}
						</Space>
					</Form.Item>
					}
					<Form.Item label={"盲盒"} style={{margin: '0px'}}>
						<Space>
							<Form.Item label={""} name={"blind_mode"}>
								<Radio.Group>
									<Radio.Button value={"yes"}>是</Radio.Button>
									<Radio.Button value={"no"}>否</Radio.Button>
								</Radio.Group>
							</Form.Item>
							{blindModeValue?.toString() === 'yes' &&
							<Form.Item label={"盲盒状态"}>
								{plan.blind_status === 'open' ? "已开启" : (plan.blind_status === 'close' ? "未开启" : "未设置")}
							</Form.Item>
							}
							{blindModeValue?.toString() === 'yes' &&
							<Form.Item label={"操作"}>
								<Button type={"primary"} disabled={plan.blind_status === 'open'}>开盲盒</Button>
							</Form.Item>
							}
						</Space>
					</Form.Item>
					{blindModeValue?.toString() === 'yes' && <>
						<Form.Item label={"盲盒封面"}>
							<Space direction={"vertical"}>
								<Upload name={"file"} action={methodUrl("/dashboard/misc/upload")}
								        showUploadList={uploadPercent > 0 && uploadPercent < 100}
								        maxCount={1} listType="picture"
								        accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
								        headers={authHeaderSync()}
								        onChange={(info) => {
									        if (info.file.status === 'done') {
										        form.setFieldValue("blind_cover", info.file.response.url)
										        setPreviewUrl(info.file.response.url);
									        } else if (info.file.status === 'uploading') {
										        setUploadPercent(info.file.percent || 100)
									        }
								        }}
								>
									<Space>
										<Button icon={<UploadOutlined/>}>上传</Button>
										{uploadPercent > 0 &&
										<Text type={"secondary"}>{uploadPercent.toFixed(2)}%</Text>}
									</Space>
								</Upload>
								{previewUrl ?
									<Image style={{width: '150px'}} src={previewUrl} alt={"盲盒封面图片"}/> : "未设置封面"}
								<Text type={"link"}>{previewUrl}</Text>
							</Space>
						</Form.Item>
						<Form.Item label={"盲盒名称"} name={"blind_name"}>
							<Input type={"text"} style={{width: '20%'}}/>
						</Form.Item>
						<Form.Item label={"盲盒描述"} name={"blind_desc"}>
							<Input type={"textarea"} style={{width: '20%'}}/>
						</Form.Item>
					</>}
					<Form.Item>
						<Space>
							<Button onClick={save} loading={loading} type={"primary"}>保存</Button>
						</Space>
					</Form.Item>
				</Form>
			</Card>
		</>
	)
}