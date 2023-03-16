import React, { useState, useCallback, useReducer } from 'react';
import { Modal, Form, Input, Switch, DatePicker, Select, Popover, InputNumber, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ActivityItem } from '../../../models';
import LimitedInput from '@modules/limitedInput';
import FileUploadNew from '@components/FileUploadNew';
import { PopoverContent, ExistRelationForbidden, ModalStyle } from './constants';
import { parseCSV, csvWhitelistFormat } from '@utils/csvUtils';
import { handleFormSwitch, updateformDataTranslate, timestampToDate, type Switchers, type FormData } from '@utils/activityHelper';
import { updatePoap } from '@services/activity';
import './index.scss';

interface CreatePOAProps {
  open: boolean;
  onCancel: () => void;
  hideModal: () => void;
  activity: ActivityItem;
}

const ManageActivityModual: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal, activity }) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const [switchers, dispatch] = useReducer(handleFormSwitch, {
    dateDisabled: !activity.end_time,
    numberDisabled: activity.amount === -1,
    publicLimitDisabled: activity.max_mint_count === -1,
    passwordDisabled: !activity.command,
    whitelistDisabled: !!activity.white_list_infos,
    existRelationForbidden: false,
  });

  const checkRelAllowed = useCallback((rule: any, value: number, callback: any) => {
    const amount = form.getFieldValue('amount');
    if (!switchers.numberDisabled && amount && amount < value) callback('公开铸造上限不能大于发行数量');
    callback();
  }, []);

  const handleWhiltelistChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(async (e) => {
    if (!e.target?.files?.length) return;
    const csvResPromise = parseCSV(e.target?.files[0]);
    csvResPromise
      .then((res: any) => {
        const whiteListInfo = csvWhitelistFormat(res);
        form.setFieldsValue({ white_list_infos: whiteListInfo });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleFinish = useCallback(async (values: FormData) => {
    const params = updateformDataTranslate(activity, values);
    try {
      setConfirmLoading(true);
      await updatePoap(params);
      dispatch({ type: 'reset' });
      hideModal();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  }, []);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'reset' });
    setConfirmLoading(false);
    onCancel();
  }, []);

  return (
    <Modal title="管理活动" open={open} onOk={form.submit} onCancel={handleCancel} {...ModalStyle} confirmLoading={confirmLoading}>
      <Form id="manageActivityForm" name="basic" form={form} layout="vertical" onFinish={handleFinish} initialValues={{ chain: 'conflux' }}>
        <Form.Item name="app_id" label="所属项目" initialValue={activity.app_id}>
          <Select placeholder="请选择项目" disabled={true}>
            <Option key={activity.app_id} value={activity.app_id}>
              {activity.app_name}
            </Option>
          </Select>
        </Form.Item>
        <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]} initialValue={activity.name}>
          <Input defaultValue={activity.name} />
        </Form.Item>
        <LimitedInput form={form} id="description" label="活动描述" name="description" maxLength={100} message="请输入活动描述" initialValue={activity.description} />
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="activityDate" className="required text-14px leading-22px" title="活动日期">
            活动日期：
          </label>
          <div>
            <Switch
              checked={switchers.dateDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                form.setFieldsValue({ activityDate: [null, null] });
                dispatch({ type: 'set', name: 'dateDisabled', value: checked });
              }}
            />
            <span className="ml-8px text-14px leading-22px">不限制结束日期</span>
          </div>
        </div>
        <Form.Item
          id="activityDate"
          name="activityDate"
          rules={[{ required: true, message: '请输入活动日期' }]}
          initialValue={[timestampToDate(parseInt(activity.start_time)), activity.end_time ? timestampToDate(activity.end_time) : null]}
        >
          <RangePicker
            defaultValue={[timestampToDate(parseInt(activity.start_time)), activity.end_time ? timestampToDate(activity.end_time) : null]}
            id="activityDate"
            showTime
            placeholder={['开始日期', '结束日期']}
            disabled={[false, switchers.dateDisabled]}
            allowEmpty={[false, true]}
          />
        </Form.Item>
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
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="amount" className="required" title="发行数量：">
            发行数量：
          </label>
          <div>
            <Switch
              checked={switchers.numberDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                const relationAllowed = !checked && switchers.publicLimitDisabled;
                if (relationAllowed) {
                  dispatch({ type: 'set', name: 'publicLimitDisabled', value: false });
                  dispatch({ type: 'set', name: 'existRelationForbidden', value: true });
                  setTimeout(() => dispatch({ type: 'set', name: 'existRelationForbidden', value: false }), 1000);
                }
                dispatch({ type: 'set', name: 'numberDisabled', value: checked });
              }}
            />
            <span className="ml-8px">不限制发行数量</span>
          </div>
        </div>
        {switchers.numberDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="amount" rules={[{ required: true, message: '请输入发行数量' }]} initialValue={activity.amount}>
            <Input placeholder="请输入" id="amount" defaultValue={activity.amount} />
          </Form.Item>
        )}
        <div className="flex flex-row justify-between">
          <label htmlFor="max_mint_count" title="公开铸造上限：">
            公开铸造上限：
          </label>
          <Radio.Group
            onChange={(e) => {
              const res = !switchers.numberDisabled && e.target.value;
              if (res) {
                dispatch({ type: 'set', name: 'existRelationForbidden', value: true });
                setTimeout(() => dispatch({ type: 'set', name: 'existRelationForbidden', value: false }), 1000);
                return;
              }
              dispatch({ type: 'set', name: 'publicLimitDisabled', value: e.target.value });
            }}
            value={switchers.publicLimitDisabled}
          >
            <Radio value={false}>限制</Radio>
            <Radio value={true}>不限制</Radio>
          </Radio.Group>
        </div>
        {switchers.existRelationForbidden ? <ExistRelationForbidden /> : <div className="h-[30px]"></div>}
        {switchers.publicLimitDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="max_mint_count" initialValue={activity.max_mint_count} rules={[{ validator: checkRelAllowed, message: '公开铸造上限不可超过发行上限' }]}>
            <InputNumber defaultValue={activity.max_mint_count} className="w-full" />
          </Form.Item>
        )}
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="command" title="领取口令：">
            领取口令：
          </label>
          <div>
            <Switch
              checked={!switchers.passwordDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                dispatch({ type: 'set', name: 'passwordDisabled', value: !checked });
              }}
            />
          </div>
        </div>
        {switchers.passwordDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="command" initialValue={activity.command}>
            <Input placeholder="请输入" className="w-full" defaultValue={activity.command} />
          </Form.Item>
        )}
        <div className="mb-8px flex flex-row justify-between">
          <div>
            白名单铸造：
            <Popover content={PopoverContent} placement="topLeft" trigger="hover">
              <QuestionCircleOutlined />
            </Popover>
          </div>
          <div>
            {!switchers.whitelistDisabled && (
              <label htmlFor="whitelistUpload" className="mr-8px text-12px font-400 text-#6953EF leading-20px">
                导入CSV
              </label>
            )}
            <Switch
              checked={!switchers.whitelistDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                dispatch({ type: 'set', name: 'whitelistDisabled', value: !checked });
              }}
            />
          </div>
        </div>
        {!switchers.whitelistDisabled && (
          <>
            <Form.Item name="white_list_infos" className="hidden" initialValue={activity.white_list_infos}>
              <Input />
            </Form.Item>
            <input type="file" accept=".csv" id="whitelistUpload" onChange={handleWhiltelistChange} className="!hidden" />
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ManageActivityModual;
