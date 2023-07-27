import React, { useState, useEffect, useCallback } from 'react';
import { 
    Modal, Form, Input, Switch, DatePicker, Select, 
    message, Checkbox, Space, InputNumber,
} from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { App } from '@models/index';
import LimitedInput from '@modules/limitedInput';
import FileUploadNew from '@components/FileUploadNew';
import { ModalStyle, DEFAULT_WALLETS } from './constants';
import { createActivity } from '@services/activity';
import { getAllApps } from '@services/app';
import { formDataTranslate, type FormData } from '@utils/activityHelper';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import { getCertificates } from '@services/whitelist';
import './index.scss';
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CreatePOAProps {
    open: boolean;
    onCancel: () => void;
    hideModal: () => void;
}

export const CreatePOAP: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal }) => {
    const [apps, setApps] = useState<App[]>([]);
    const [confirmLoading, setConfirmLoading] = useState(false);
    // const [switchers, dispatch] = useReducer(handleFormSwitch, defaultSwitchers);
    const [useCommand, setUseCommand] = useState(false);
    const [form] = Form.useForm();
    const [supportWallets, setSupportWallets] = useState<string[]>(DEFAULT_WALLETS);
    const [activityType, setActivityType] = useState(-1);
    const [nolimitAmount, setNolimitAmount] = useState(false);
    const [whitelist, setWhitelist] = useState<{name: string; id: number}[]>([]);
    useResetFormOnCloseModal({ form, open });

    const handleFinish = useCallback(
        async (values: FormData) => {
            try {
                if (supportWallets.length === 0) {
                    message.error('请选择支持的钱包');
                    return;
                }
                const params = formDataTranslate(values, apps, activityType);
                setConfirmLoading(true);
                // @ts-ignore
                params.support_wallets = supportWallets;
                await createActivity(params);
                hideModal();
                message.success('创建活动成功')
            } catch (err: any) {
                message.error(err);
            } finally {
                setConfirmLoading(false);
            }
        },
        [apps, activityType, hideModal, supportWallets]
    );

    const handleCancel = useCallback(() => {
        setConfirmLoading(false);
        onCancel();
    }, [onCancel]);

    useEffect(() => {
        getAllApps().then(setApps);
    }, []);

    useEffect(() => {
        getCertificates(1, 10000).then(res => {
            setWhitelist(res.items);
        });
    }, []);

    return (
        <Modal title="创建活动" open={open} onOk={form.submit} onCancel={handleCancel} {...ModalStyle} confirmLoading={confirmLoading}>
            <Form 
                id="createActivityForm" 
                name="createActivityForm" 
                form={form} 
                onFinish={handleFinish} 
                initialValues={{ chain: 'conflux', support_wallets: DEFAULT_WALLETS, max_mint_count: 1 }} 
                labelCol={{span: 6}}
            >
                <Form.Item name="app_id" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
                    <Select placeholder="请选择项目">
                        {apps.map((app) => (
                            <Option key={app.id} value={app.id}>
                                {app.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name='activity_type' label='活动类型' rules={[{ required: true, message: '请选择类型' }]}>
                    <Select onChange={val => setActivityType(val)} placeholder='请选择活动类型'>
                        <Option value={2}>单NFT活动</Option>
                        <Option value={1}>盲盒活动</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <LimitedInput form={form} id="description" label="活动描述" name="description" maxLength={100} message="请输入活动描述" placeholder='建议长度40字以内'/>
                <Form.Item
                    label="活动封面："
                    rules={[{ required: true, message: '请上传活动封面' }]}
                    name="file"
                    valuePropName="fileList"
                    className="mb-0"
                    getValueFromEvent={(evt) => (Array.isArray(evt) ? evt : evt?.fileList)}
                >
                    <FileUploadNew maxCount={1} listType="picture" type="plus" wrapperClass="block w-full !mb-24px" className="block" />
                </Form.Item>
                <Form.Item label='活动日期' id="activityDate" name="activityDate">
                    <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期(可选)']} disabled={[false, false]} allowEmpty={[false, true]} />
                </Form.Item>
                <Form.Item label='发行数量'>
                    <Space>
                        <Form.Item name='amount' noStyle>
                            <InputNumber disabled={nolimitAmount} />
                        </Form.Item>
                        <Checkbox onChange={e => {
                            if (e.target.checked) {
                                form.setFieldValue('amount', null);
                            }
                            setNolimitAmount(e.target.checked);
                        }}>
                            不限制数量
                        </Checkbox>
                    </Space>
                </Form.Item>
                <Form.Item label='公开铸造上限' name='max_mint_count' tooltip='单地址铸造上限'>
                    <InputNumber />
                </Form.Item>
                <Form.Item label='活动钱包' name='support_wallets'>
                    <Checkbox.Group 
                        options={[{ label: 'Anyweb', value: 'anyweb' }, { label: 'Cellar', value: 'cellar' }]} 
                        onChange={(checkedValues: CheckboxValueType[]) => {
                            // @ts-ignore
                            setSupportWallets(checkedValues as string[]);
                        }
                    } />
                </Form.Item>
                <Form.Item label='领取凭证' tooltip='领取凭证白名单' name='certificate_strategy_id'>
                    <Select>
                        {whitelist.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item label='领取口令'>
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
            </Form>
        </Modal>
    );
};