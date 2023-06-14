import React, { useEffect, useState, useRef } from 'react';
import {
    Card, Tabs, Form, Button, Input, Checkbox, DatePicker,
    Switch, Space, Dropdown, message, Row, Col,
    Upload, InputNumber, Typography,
} from "antd";
import { MinusCircleOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import type { TabsProps, MenuProps, UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useParams, useNavigate } from 'react-router-dom';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import { uploadFile } from '@services/misc';
import { getApps } from '@services/app';
import { createActivity, setActivityNftConfigs, getActivityById, updateActivity } from '@services/activity';
import { CreateActivityData, dateTranslate, timestampToDate } from '@utils/activityHelper';
import isProduction from '@utils/isProduction';
import { ActivityItem } from '@models/Activity';
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function Page() {
    const onChange = (key: string) => {
        console.log('Create POAP tab', key);
    };
      
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `POAP信息`,
            children: <ActivityConfig />,
        },
        /* {
            key: '2',
            label: `领取配置`,
            children: ``,
        }, */
    ];
      
    return (
        <Card style={{flexGrow: 1}}>
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
        </Card>
    );
}

function ActivityConfig() {
    const { appId, activityId } = useParams();
    const navigate = useNavigate();
    const [userId, setUserId] = useState<number>(0);
    const [defaultProjectId, setDefaultProjectId] = useState<number>(0);

    // crop and preview states
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const templateImgRef = useRef<HTMLImageElement>(null);

    // form states
    const [traitTypes, setTraitTypes] = useState<string[]>([]);
    const [useCommand, setUseCommand] = useState(false);
    const [file_url, setFileUrl] = useState('');
    const [activity, setActivity] = useState<ActivityItem | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const [form] = Form.useForm();


    const createOrUpdatePoap = async (values: any) => {
        values.file_url = file_url;
        if (!values.file_url) {
            message.warning('请上传文件, 并进行合成操作');
            return;
        }
        try {
            // date convert
            const activityMeta = {
                name: values.name,
                description: values.description,
                activity_type: 'gasless', // poap
                chain_of_gasless: isProduction ? 'conflux' : 'conflux_test',
                app_id: appId ? parseInt(appId) : (activity ? activity.app_id : defaultProjectId),
                activity_picture_url: file_url,
                amount: values.amount,
                start_time: values.activityDate[0] ? dateTranslate(new Date(values.activityDate[0])) : -1,
                end_time: values.activityDate[1] ? dateTranslate(new Date(values.activityDate[1])) : -1,
                max_mint_count: 1,
                rainbow_user_id: userId,
                support_wallets: values.support_wallets,
                command: values.command,
                is_token_id_ordered: false,
            };

            // create activity nft configs
            let attributes = [];
            for (let i = 0; i < traitTypes.length; i++) {
                let config = {
                    trait_type: values.attributes[i].trait_type,
                    value: values.attributes[i].value,
                };
                if (traitTypes[i] === 'date') {
                    // @ts-ignore
                    config.display_type = 'date';
                }
                attributes.push(config);
            }
            let _nft_config = {
                name: values.name,
                image_url: file_url,
                // @ts-ignore
                metadata_attributes: attributes,
            };

            if (!activityId) {
                let res = await createActivity(activityMeta as CreateActivityData);
            
                // @ts-ignore
                await setActivityNftConfigs((res as any).activity_id, [_nft_config]);
            } else {
                // @ts-ignore
                activityMeta.activity_id = activityId;
                // @ts-ignore
                await updateActivity(activityMeta);
                // @ts-ignore
                _nft_config.id = activity.nft_configs[0].id;
                // @ts-ignore
                await setActivityNftConfigs(activity.activity_id, [_nft_config]);
            }
            
            message.success('操作成功');
            navigate("/panels/poaps");
        } catch(e) {
            // @ts-ignore
            message.error('创建失败' + e.response.data.message);   
        }
    }

    // get defaultProjectId and user_id from project list api
    useEffect(() => {
        getApps(1, 1).then(res => {
            if (res.count >= 1) {
                const app = res.items[0];
                setDefaultProjectId(app.id);
                setUserId(app.user_id);
            }
        });
    }, []);

    useEffect(() => {
        if (!activityId) return;
        getActivityById(activityId).then((res) => {
            setActivity(res);
            // restore form status from activity
            setFileUrl(res.activity_picture_url);
            if (res.command) setUseCommand(true);
            const activityDate = [];
            if (res.start_time && res.start_time !== -1) {
                activityDate.push(timestampToDate(res.start_time));
            }
            if (res.end_time && res.end_time !== -1) {
                activityDate.push(timestampToDate(res.end_time));
            }
            setFileList([{
                uid: '0',
                name: 'POAP.png',
                status: 'done',
                url: res.activity_picture_url,
            }]);
            let attributes = [];
            if (res.nft_configs.length === 1) {
                setTraitTypes(res.nft_configs[0].metadata_attributes.map((item: any) => item.display_type === 'date' ? 'date' : 'text'));
                attributes = res.nft_configs[0].metadata_attributes.map((item: any, i: string) => ({
                    trait_type: item.trait_type,
                    value: item.value,
                    id: i,
                }));
            }
            form.setFieldsValue({
                name: res.name,
                description: res.description,
                support_wallets: res.support_wallets,
                activityDate,
                amount: res.amount,
                command: res.command,
                attributes,
                file_url: res.activity_picture_url,
            });
        });
    }, [activityId, form]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        if (e.currentTarget.naturalWidth < 600 || e.currentTarget.naturalHeight < 600) {
            message.warning('图片尺寸过小，最小尺寸为600*600');
            return;
        }
        setCrop(centerAspectCrop(width, height, 1))
    }

    useDebounceEffect(
        async () => {
          if (
            completedCrop?.width &&
            completedCrop?.height &&
            imgRef.current &&
            previewCanvasRef.current && 
            templateImgRef.current
          ) {
            canvasPreview(
              imgRef.current,
              previewCanvasRef.current,
              completedCrop,
              1,
              0,
              templateImgRef.current,
            )
          }
        },
        100,
        [completedCrop],
    )

    const uploadProps: UploadProps = {
        name: 'file',
        listType: "picture",
        fileList: fileList,
        beforeUpload: (file) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImgSrc(reader.result?.toString() || '');
            };
            return false;
        }
    };

    // attribute select menu items
    const items: MenuProps['items'] = [
        {
            label: '文本',
            key: '1',
        },
        {
            label: '日期',
            key: '2',
        },
    ];

    return (
        <div>
            <div style={{height: '20px'}}></div>
            <Row>
                <Col xs={24} sm={24} md={24} lg={14}>
                    <Form
                        id='createPoapForm'
                        form={form}
                        name="basic"
                        labelCol={{ md: 4, sm: 6 }}
                        wrapperCol={{ md: 16, sm: 18 }}
                        style={{ maxWidth: 600 }}
                        onFinish={createOrUpdatePoap}
                        onFinishFailed={() => message.warning('请检查表单')}
                        autoComplete="off"
                        initialValues={{
                            public: 'private',
                            support_wallets: ['anyweb', 'cellar'],
                        }}
                    >
                        <Form.Item
                            label="POAP名称"
                            name="name"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="POAP描述"
                            name="description"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        <Form.Item label='领取日期' id="activityDate" name="activityDate">
                            <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期(可选)']} disabled={[false, false]} allowEmpty={[false, true]} />
                        </Form.Item>

                        {/* <Form.Item
                            label="公开活动"
                            name="public"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Radio.Group>
                                <Radio value="public"> 公开 </Radio>
                                <Radio value="private"> 不公开 </Radio>
                            </Radio.Group>
                        </Form.Item> */}
                        <Form.Item
                            label="钱包选项"
                            name="support_wallets"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Checkbox.Group>
                                <Checkbox value="cellar">Cellar</Checkbox>
                                <Checkbox value="anyweb">Anyweb</Checkbox>
                            </Checkbox.Group>
                        </Form.Item>

                        <Form.Item
                            label="发行总量"
                            name="amount"
                            rules={[{ required: true, message: '请设置领取数量' }]}
                            extra="最大发行数量为100"
                        >
                            <InputNumber min={1} max={100} style={{width: '150px'}}/>
                        </Form.Item>
                        <Form.Item
                            label="领取口令"
                            name="command"
                            style={{marginBottom: '0px'}}
                        >
                            <Space>
                                <Form.Item>
                                    <Switch
                                        checked={useCommand}
                                        onClick={(checked, e) => {
                                            e.preventDefault();
                                            setUseCommand(checked);
                                        }}
                                    />
                                </Form.Item>
                                {useCommand && <Form.Item name="command">
                                    <Input placeholder="请输入口令" className="w-full" />
                                </Form.Item>}
                            </Space>
                        </Form.Item>
                        
                        <Form.Item
                            label="NFT文件"
                            name="file_url"
                            className="mb-0"
                            rules={[{ required: true, message: '请选择文件，并进行合成' }]}
                        >
                            <Upload {...uploadProps}> 
                                <Button icon={<UploadOutlined />}>上传图片</Button>
                            </Upload>
                        </Form.Item>
                        <div style={{height: '10px'}}></div>

                        <Form.Item label='NFT特征'>
                            <Form.List name="attributes">
                                {(fields, { add, remove }) => (
                                    <>
                                        <Form.Item style={{float: 'right'}}>
                                            <Dropdown menu={{
                                                items,
                                                onClick: (e) => {
                                                    setTraitTypes([...traitTypes, e.key === '1' ? 'text' : 'date'])
                                                    add();
                                                },
                                            }}>
                                                <Button>
                                                    <Space>
                                                        新增
                                                        <DownOutlined />
                                                    </Space>
                                                </Button>
                                            </Dropdown>
                                        </Form.Item>
                                        <div style={{clear: 'both'}}></div>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'trait_type']}
                                                    rules={[{ required: true, message: 'Missing first name' }]}
                                                >
                                                    <Input placeholder="属性名" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'value']}
                                                    rules={[{ required: true, message: 'Missing last name' }]}
                                                >
                                                    {traitTypes[name] === 'text' ? <Input placeholder="属性值" /> : <DatePicker placeholder='请选择日期' style={{width: '180px'}}/>}
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => {
                                                    traitTypes.splice(name, 1);
                                                    setTraitTypes([...traitTypes]);
                                                    remove(name);
                                                }}/>
                                            </Space>
                                        ))}
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                {activityId ? '更新' : '创建'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col xs={24} sm={24} md={24} lg={10}>
                    { !!imgSrc && (
                        <ReactCrop 
                            crop={crop} 
                            aspect={1} 
                            circularCrop={true}
                            // onChange={c => setCrop(c)} 
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            maxHeight={466}
                            maxWidth={466}
                            minHeight={100}
                            minWidth={100}
                        >
                            <img 
                                ref={imgRef} 
                                alt={'POAP NFT'}
                                crossOrigin='anonymous'
                                src={imgSrc} 
                                onLoad={onImageLoad} 
                                style={{maxWidth: '480px', maxHeight: '480px'}} 
                            />
                        </ReactCrop>
                    )}
                    <img 
                        ref={templateImgRef} 
                        src='https://nftrainbow.oss-cn-hangzhou.aliyuncs.com/poap-templates/RainbowPoap%404x.png' 
                        crossOrigin='anonymous'
                        style={{
                            visibility: 'hidden',
                            position: 'absolute',
                            top: '-200vh',
                        }} 
                        alt='template'
                    />
                    {!!completedCrop && (
                        <>
                            <div style={{marginTop: '10px'}}>
                                <canvas
                                    ref={previewCanvasRef}
                                    style={{
                                        // border: '1px solid #ccc',
                                        objectFit: 'contain',
                                        width: '320px',
                                        height: '320px',
                                    }}
                                />
                            </div>
                            <Button onClick={() => {
                                previewCanvasRef.current?.toBlob(async (blob) => {
                                    let res = await uploadFile(blob);
                                    setFileUrl((res as any).url);
                                    setFileList([{
                                        uid: '0',
                                        name: 'POAP.png',
                                        status: 'done',
                                        url: (res as any).url,
                                    }]);
                                })
                            }}>生成勋章</Button>
                        </>
                    )}
                </Col>
            </Row>
            <div style={{paddingLeft: '20px', marginTop: '50px'}}>
                <Title level={4}>FAQs</Title>
                <Title level={5}>POAP 功能如何收费?</Title>
                <Text>目前POAP勋章功能免费使用，单活动限制领取数量最大100</Text>
                <Title level={5}>图片尺寸有要求么?</Title>
                <Text>图片最低宽度为 600 px，宽度过小，裁剪效果不佳</Text>
                <Title level={5}>图片已经上传，为什么创建时还提示请上传文件?</Title>
                <Text>图片上传后需在右侧进行拖拽并点击“生成勋章”按钮进行上传方可(合成时间较长，需耐心等待几秒)</Text>
                <Title level={5}>勋章NFT发行在哪条区块链上?</Title>
                <Text>目前发行在树图链</Text>
                <Title level={5}>POAP创建后，如何获取领取链接？</Title>
                <Text>勋章创建后会自动跳转到 NFT 活动列表也，根据名字找到对应的活动，点击右侧链接 Icon 即可查看到领取链接</Text>
                <Title level={5}>领取 POAP 后，如何查看？</Title>
                <Text>POAP 领取并等待(十来秒)交易上链后，可至领取时所用的钱包（晒啦或Anyweb）中查看POAP</Text>
                <Title level={5}>为什么 POAP 带有 Rainbow Logo？</Title>
                <Text>POAP 勋章功能为 Rainbow 免费提供使用，若想创建自定义 NFT 勋章可使用 ”NFT活动” 功能</Text>
            </div>
        </div>
    );
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 50,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}