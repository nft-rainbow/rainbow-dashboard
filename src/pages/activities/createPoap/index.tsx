import React, { useEffect, useState, useRef } from 'react';
import {
    Card, Tabs, Form, Button, Input, Checkbox, DatePicker,
    Switch, Space, Dropdown, message, Row, Col,
    Upload, InputNumber,
} from "antd";
import { MinusCircleOutlined, DownOutlined, UploadOutlined } from '@ant-design/icons';
import type { TabsProps, MenuProps, UploadProps } from 'antd';
import { useParams } from 'react-router-dom';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import { uploadFile } from '@services/misc';
import { userProfile } from "@services/user"
import { createActivity, setActivityNftConfigs, getActivityById, updateActivity } from '@services/activity';
import { CreateActivityData, dateTranslate, timestampToDate } from '@utils/activityHelper';
import isProduction from '@utils/isProduction';
import { ActivityItem } from '@models/Activity'

const { RangePicker } = DatePicker;

export default function Page() {
    const onChange = (key: string) => {
        console.log('Create POAP tab', key);
    };
      
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: `活动信息`,
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
    const [userId, setUserId] = useState<number>(0);

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const templateImgRef = useRef<HTMLImageElement>(null);

    const [traitTypes, setTraitTypes] = useState<string[]>([]);
    const [useCommand, setUseCommand] = useState(false);
    const [file_url, setFileUrl] = useState(''); // http://dev.nftrainbow.cn/assets/uploads/3622c399a34448c9198e6e284f4d16e0.png

    const [activity, setActivity] = useState<ActivityItem | null>(null);

    const [form] = Form.useForm();

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }

    const createPoap = async (values: any) => {
        values.file_url = file_url || activity?.activity_picture_url;
        if (!values.file_url && !activity) {
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
                app_id: appId ? parseInt(appId) : (activity ? activity.app_id : 0),
                activity_picture_url: file_url,
                amount: values.amount,
                start_time: values.activityDate[0] ? dateTranslate(new Date(values.activityDate[0])) : -1,
                end_time: values.activityDate[1] ? dateTranslate(new Date(values.activityDate[1])) : -1,
                max_mint_count: 1,
                rainbow_user_id: userId,
                support_wallets: values.support_wallets,
                command: values.command,
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
            

            message.success('创建成功, 请到活动列表查看');
        } catch(e) {
            // @ts-ignore
            message.error('创建失败' + e.response.data.message);   
        }
    }

    useEffect(() => {
        userProfile().then((res) => {
            setUserId((res as any).id);
        });
    }, []);

    useEffect(() => {
        if (!activityId) return;
        getActivityById(activityId).then((res) => {
            setActivity(res);
            if (res.command) setUseCommand(true);
            const activityDate = [];
            if (res.start_time && res.start_time !== -1) {
                activityDate.push(timestampToDate(res.start_time));
            }
            if (res.end_time && res.end_time !== -1) {
                activityDate.push(timestampToDate(res.end_time));
            }
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
    }, [activityId]);

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
        fileList: null,
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
                <Col span={8}>
                    <Form
                        id='createPoapForm'
                        form={form}
                        name="basic"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 16 }}
                        style={{ maxWidth: 600 }}
                        onFinish={createPoap}
                        onFinishFailed={() => message.warning('请检查表单')}
                        autoComplete="off"
                        initialValues={{
                            public: 'private',
                            support_wallets: ['anyweb', 'cellar'],
                        }}
                    >
                        <Form.Item
                            label="活动名称"
                            name="name"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="活动描述"
                            name="description"
                            rules={[{ required: true, message: '' }]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        <Form.Item label='活动日期' id="activityDate" name="activityDate">
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
                <Col span={12}>
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
                                })
                            }}>生成勋章</Button>
                        </>
                    )}
                    {
                        !imgSrc && activity && (
                            <div>
                                <img src={activity.activity_picture_url} style={{maxWidth: '480px'}}></img>
                            </div>
                        )
                    }
                </Col>
            </Row>
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