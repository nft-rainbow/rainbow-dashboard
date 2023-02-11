import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { Modal, Form, Input, Switch, DatePicker, Select, Popover, InputNumber, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { App } from '../../../models';
import FileUpload from '@components/FileUpload';
import { PopoverContent, ExistRelationForbidden, ModalStyle, PictureReminder } from './constants';
import { createActivity } from '@services/activity';
import { getAllApps } from '@services/app';
import { parseCSV, csvWhitelistFormat } from '@utils/csvUtils';
import { handleFormSwitch, defaultSwitchers, formDataTranslate, type FormData } from '@utils/activityHelper';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import './index.scss';

interface CreatePOAProps {
  open: boolean;
  onCancel: () => void;
  hideModal: () => void;
}

const CreatePOA: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal }) => {
  const [apps, setApps] = useState<App[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  useResetFormOnCloseModal({ form, open });
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const [switchers, dispatch] = useReducer(handleFormSwitch, defaultSwitchers);

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
    const params = formDataTranslate(values);
    try {
      setConfirmLoading(true);
      await createActivity(params);
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

  useEffect(() => {
    getAllApps().then((res) => {
      setApps(res);
    });
  }, []);

  return (
    <Modal title="创建活动" open={open} onOk={form.submit} onCancel={handleCancel} {...ModalStyle} confirmLoading={confirmLoading}>
      <Form id="createActivityForm" name="basic" form={form} layout="vertical" onFinish={handleFinish} initialValues={{ chain: 'conflux' }}>
        <Form.Item name="app_id" label="所属项目" rules={[{ required: true, message: '请选择项目' }]}>
          <Select placeholder="请选择项目">
            {apps.map((app) => (
              <Option key={app.id} value={app.id}>
                {app.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item
          label="活动描述"
          name="description"
          rules={[
            { required: true, message: '请输入活动描述' },
            { pattern: /^[\d\D]{0,50}$/g, message: '超出活动描述最大字数' },
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
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
        <Form.Item id="activityDate" name="activityDate" rules={[{ required: true, message: '请输入活动日期' }]}>
          <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期']} disabled={[false, switchers.dateDisabled]} allowEmpty={[false, true]} />
        </Form.Item>
        <Form.Item label="活动封面：" name="activity_picture_url" rules={[{ required: true, message: '请上传活动封面' }]} className="mb-0">
          <FileUpload
            onChange={(err: Error, file: any) => {
              form.setFieldsValue({ activity_picture_url: file.url });
            }}
            type="plus"
            wrapperClass="block w-full"
            className="block"
          />
        </Form.Item>
        <PictureReminder />
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
          <Form.Item name="amount" rules={[{ required: true, message: '请输入发行数量' }]}>
            <Input placeholder="请输入" id="amount" />
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
          <Form.Item name="max_mint_count" initialValue={1} rules={[{ validator: checkRelAllowed, message: '公开铸造上限不可超过发行上限' }]}>
            <InputNumber defaultValue={1} className="w-full" />
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
          <Form.Item name="command">
            <Input placeholder="请输入" className="w-full" />
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
            <Form.Item name="white_list_infos" className="hidden">
              <Input />
            </Form.Item>
            <input type="file" accept=".csv" id="whitelistUpload" onChange={handleWhiltelistChange} className="!hidden" />
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreatePOA;
