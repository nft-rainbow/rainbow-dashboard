import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { 
    Modal, Form, Input, Switch, DatePicker, Select, 
    message, Checkbox, Space, InputNumber,
} from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { App } from '@models/index';
import LimitedInput from '@modules/limitedInput';
import FileUploadNew from '@components/FileUploadNew';
import { ModalStyle } from './constants';
import { createActivity } from '@services/activity';
import { getAllApps } from '@services/app';
import { handleFormSwitch, defaultSwitchers, formDataTranslate, type FormData } from '@utils/activityHelper';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
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
    const [switchers, dispatch] = useReducer(handleFormSwitch, defaultSwitchers);
    const [form] = Form.useForm();
    useResetFormOnCloseModal({ form, open });
    const [supportWallets, setSupportWallets] = useState<string[]>(['anyweb', 'cellar']);
    const [activityType, setActivityType] = useState(-1);

    const handleFinish = useCallback(
        async (values: FormData) => {
            const params = formDataTranslate(values, apps, activityType);
            try {
                setConfirmLoading(true);
                // @ts-ignore
                params.support_wallets = supportWallets;
                await createActivity(params);
                dispatch({ type: 'reset' });
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
        dispatch({ type: 'reset' });
        setConfirmLoading(false);
        onCancel();
    }, [onCancel]);

    useEffect(() => {
        getAllApps().then(setApps);
    }, []);

    return (
        <Modal title="创建活动" open={open} onOk={form.submit} onCancel={handleCancel} {...ModalStyle} confirmLoading={confirmLoading}>
            <Form 
                id="createActivityForm" 
                name="createActivityForm" 
                form={form} 
                onFinish={handleFinish} 
                initialValues={{ chain: 'conflux', support_wallets: ['anyweb', 'cellar'], max_mint_count: 1 }} 
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
                    <Select onChange={val => setActivityType(val)}>
                        <Option value={2}>单NFT活动</Option>
                        <Option value={1}>盲盒活动</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
                    <Input placeholder="请输入" />
                </Form.Item>
                <LimitedInput form={form} id="description" label="活动描述" name="description" maxLength={100} message="请输入活动描述" />
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
                    <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期']} disabled={[false, false]} allowEmpty={[false, true]} />
                </Form.Item>
                <Form.Item label='发行数量' name='amount'>
                    <InputNumber />
                </Form.Item>
                <Form.Item label='公开铸造上限' name='max_mint_count'>
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
                <Form.Item label='领取口令'>
                    <Space>
                        <Form.Item>
                            <Switch
                                checked={!switchers.passwordDisabled}
                                onClick={(checked, e) => {
                                    e.preventDefault();
                                    dispatch({ type: 'set', name: 'passwordDisabled', value: !checked });
                                }}
                            />
                        </Form.Item>
                        {!switchers.passwordDisabled && <Form.Item name="command">
                            <Input placeholder="请输入口令" className="w-full" />
                        </Form.Item>}
                        
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};