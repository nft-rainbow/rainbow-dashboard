import React, {useState} from "react";
import {Typography, Card, Form, FormInstance, Input, Radio, Space, Upload, Button, Image} from "antd";
import {authHeaderSync, methodUrl} from "@services/index";
import {UploadOutlined} from "@ant-design/icons/lib";
const {Text} = Typography;

export function PlanFields (props:{form:FormInstance}) {
	const {form} = props;
	const [previewUrl, setPreviewUrl] = useState('');
	const [uploadPercent, setUploadPercent] = useState(0);
	return (
		<>
			<Card title={"发行设置"}>
				<Form form={form}>
					<Form.Item label={"发行总量"}>
						<Input type={"number"} style={{width: '20%'}}/>
					</Form.Item>
					<Form.Item label={"铸造模式"}>
						<Radio.Group>
							<Radio.Button value={"public"}>公开铸造</Radio.Button>
							<Radio.Button value={"whitelist"}>白名单铸造</Radio.Button>
						</Radio.Group>
					</Form.Item>
					<Text>公开铸造配置</Text>
					<Form.Item label={""} style={{margin:'0px'}}>
						<Space>
							<Form.Item label={"公开铸造数量"}>
								<Input type={"number"}/>
							</Form.Item>
							<Form.Item label={"单个用户铸造数量上限"}>
								<Input type={"number"}/>
							</Form.Item>
						</Space>
					</Form.Item>
					<Text>白名单铸造配置</Text>
					<Form.Item label={""} style={{margin:'0px'}}>
						<Space>
							<Form.Item label={"白名单铸造数量"}>
								<Input type={"number"}/>
							</Form.Item>
							<Form.Item label={"白名单用户铸造数量上限"}>
								<Input type={"number"}/>
							</Form.Item>
						</Space>
					</Form.Item>
					<Form.Item label={""} style={{margin:'0px'}}>
						<Space>
							<Form.Item label={"盲盒"}>
								<Radio.Group>
									<Radio.Button value={"yes"}>是</Radio.Button>
									<Radio.Button value={"no"}>否</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item label={"盲盒状态"}>
								<Radio.Group>
									<Radio.Button value={"yes"}>已开启</Radio.Button>
									<Radio.Button value={"no"}>未开启</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item label={"操作"}>
								<Button type={"primary"}>开盲盒</Button>
							</Form.Item>
						</Space>
					</Form.Item>
					<Form.Item label={"盲盒封面"}>
						<Space direction={"vertical"}>
							<Upload name={"file"} action={methodUrl("/dashboard/misc/upload")}
							        showUploadList={uploadPercent > 0 && uploadPercent < 100}
							        maxCount={1} listType="picture"
							        accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
							        headers={authHeaderSync()}
							        onChange={(info) => {
								        if (info.file.status === 'done') {
									        form.setFieldValue("cover_image", info.file.response.url)
									        setPreviewUrl(info.file.response.url);
								        } else if (info.file.status === 'uploading') {
									        setUploadPercent(info.file.percent || 100)
								        }
							        }}
							>
								<Space>
									<Button icon={<UploadOutlined/>}>上传</Button>
									{uploadPercent > 0 && <Text type={"secondary"}>{uploadPercent.toFixed(2)}%</Text>}
								</Space>
							</Upload>
							{previewUrl ? <Image style={{width: '150px'}} src={previewUrl} alt={"盲盒封面图片"}/> : "未设置封面"}
							<Text type={"link"}>{previewUrl}</Text>
						</Space>
					</Form.Item>
					<Form.Item>
						<Space>
							<Button type={"primary"}>保存</Button>
						</Space>
					</Form.Item>
				</Form>
			</Card>
		</>
	)
}