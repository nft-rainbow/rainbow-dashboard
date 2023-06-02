import React, { useState, useCallback } from 'react';
import { 
    Modal, Form, Input, Switch, DatePicker, Select, 
    InputNumber, message, Checkbox, Space
} from 'antd';
import { ActivityItem } from '@models/index';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import LimitedInput from '@modules/limitedInput';
import FileUploadNew from '@components/FileUploadNew';
import { ModalStyle } from './constants';
import { updateFormDataTranslate, timestampToDate, type FormData } from '@utils/activityHelper';
import { updateActivity } from '@services/activity';
import { DEFAULT_WALLETS } from '../createActivities/constants';
import './index.scss';
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CreatePOAProps {
    open: boolean;
    onCancel: () => void;
    hideModal: () => void;
    activity: ActivityItem;
}

const ManageActivityModal: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal, activity }) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [noLimitAmount, setNoLimitAmount] = useState(activity.amount === -1);
    const [useCommand, setUseCommand] = useState(!!activity.command);
    const [supportWallets, setSupportWallets] = useState<string[]>(DEFAULT_WALLETS);

    const handleFinish = useCallback(async (values: FormData) => {
        try {
            const params = updateFormDataTranslate(activity, values);
            setConfirmLoading(true);
            // @ts-ignore
            params.support_wallets = supportWallets;
            await updateActivity(params as any);
            hideModal();
            message.success('保存更新成功')
        } catch (err) {
            console.log(err);
        } finally {
            setConfirmLoading(false);
        }
    }, [supportWallets, activity, hideModal]);

    const handleCancel = useCallback(() => {
        setConfirmLoading(false);
        onCancel();
    }, []);

    return (
        <Modal title="管理活动" open={open} onOk={form.submit} onCancel={handleCancel} {...ModalStyle} confirmLoading={confirmLoading}>
            <Form id="manageActivityForm" name="basic" form={form} onFinish={handleFinish} initialValues={{ chain: 'conflux' }} labelCol={{span: 6}}>
                <Form.Item name="app_id" label="所属项目" initialValue={activity.app_id}>
                    <Select placeholder="请选择项目" disabled={true}>
                        <Option key={activity.app_id} value={activity.app_id}>
                            {activity.app_name}
                        </Option>
                    </Select>
                </Form.Item>
                <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]} initialValue={activity.name}>
                    <Input />
                </Form.Item>
                <LimitedInput form={form} id="description" label="活动描述" name="description" maxLength={100} message="请输入活动描述" initialValue={activity.description} />
                <Form.Item
                    label="活动封面："
                    rules={[{ required: true, message: '请上传活动封面' }]}
                    name="file"
                    valuePropName="fileList"
                    className="mb-0"
                    getValueFromEvent={(evt) => (Array.isArray(evt) ? evt : evt?.fileList)}
                    initialValue={[
                        {
                            uid: '1',
                            name: '已上传图片',
                            status: 'done',
                            url: activity?.activity_picture_url ?? '',
                        }
                    ]}
                >
                    <FileUploadNew maxCount={1} listType="picture" type="plus" wrapperClass="block w-full !mb-24px" className="block" />
                </Form.Item>
                <Form.Item 
                    label='活动日期' 
                    id="activityDate" 
                    name="activityDate"
                    initialValue={[timestampToDate(parseInt(activity.start_time as unknown as string)), activity.end_time ? timestampToDate(activity.end_time) : null]}
                >
                    <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期(可选)']} disabled={[false, false]} allowEmpty={[false, true]} />
                </Form.Item>
                <Form.Item label='发行数量'>
                    <Space>
                        <Form.Item name='amount' noStyle initialValue={activity.amount}>
                            <InputNumber disabled={noLimitAmount} />
                        </Form.Item>
                        <Checkbox checked={noLimitAmount} onChange={e => {
                            if (e.target.checked) {
                                form.setFieldValue('amount', null);
                            }
                            setNoLimitAmount(e.target.checked);
                        }}>
                            不限制数量
                        </Checkbox>
                    </Space>
                </Form.Item>
                <Form.Item label='公开铸造上限' name='max_mint_count' tooltip='单地址铸造上限' initialValue={activity.max_mint_count === -1 ? null : activity.max_mint_count}>
                    <InputNumber />
                </Form.Item>
                <Form.Item label='活动钱包' name='support_wallets' initialValue={activity.support_wallets}>
                    <Checkbox.Group 
                        options={[{ label: 'Anyweb', value: 'anyweb' }, { label: 'Cellar', value: 'cellar' }]} 
                        onChange={(checkedValues: CheckboxValueType[]) => {
                            setSupportWallets(checkedValues as string[]);
                        }} 
                    />
                </Form.Item>
                <Form.Item label='领取口令'>
                    <Space>
                        <Form.Item>
                            <Switch
                                checked={useCommand}
                                onClick={(checked, e) => {
                                    e.preventDefault();
                                    if (!checked) {
                                        form.setFieldValue('command', null);
                                    }
                                    setUseCommand(checked);
                                }}
                            />
                        </Form.Item>
                        {useCommand && <Form.Item name="command" initialValue={activity.command}>
                            <Input placeholder="请输入口令" className="w-full" />
                        </Form.Item>}
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManageActivityModal;