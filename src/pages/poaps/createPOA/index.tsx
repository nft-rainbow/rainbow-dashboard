import React, { useState, useCallback, useReducer } from 'react';
import { Modal, Form, Input, Switch, DatePicker, Select, Popover, InputNumber, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import FileUpload from '@components/FileUpload';
import { PopoverContent, ExistRelationForbidden } from './constants';
import { isCoexisted } from '@utils/index';
import { parseCSV } from '@utils/csvUtils';
import { handleFormSwitch, defaultSwitchers } from '@utils/createActivityHelper';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import './index.scss';

interface CreatePOAProps {
  open: boolean;
  onCancel: () => void;
  hideModal: () => void;
}

const CreatePOA: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal }) => {
  const [form] = Form.useForm();
  useResetFormOnCloseModal({ form, open });
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const [switchers, dispatch] = useReducer(handleFormSwitch, defaultSwitchers);

  const handleWhiltelistChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(async (e) => {
    if (!e.target?.files?.length) return;
    const csvResPromise = parseCSV(e.target?.files[0]);
    csvResPromise
      .then((res) => {
        form.setFieldsValue({ whitelist: res });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleFinish = useCallback((values: any) => {
    console.log(values);
    hideModal();
  }, []);

  const handleCancel = useCallback(() => {
    dispatch({ type: 'reset' });
    onCancel();
  }, []);

  return (
    <Modal
      title="创建活动"
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={'440px'}
      style={{ top: '0px', paddingBottom: '0px' }}
      wrapClassName="flex items-center"
      bodyStyle={{ paddingTop: '16px' }}
    >
      <Form id="createActivityForm" name="basic" form={form} layout="vertical" onFinish={handleFinish} initialValues={{ chain: 'conflux' }} autoComplete="off">
        <Form.Item name="chain" label="区块链" rules={[{ required: true }]}>
          <Select>
            <Option value="conflux">树图链</Option>
            <Option value="conflux_test">树图测试链</Option>
          </Select>
        </Form.Item>
        <Form.Item name="ActivityName" label="活动名称" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="活动描述" name="ActivityDescription" rules={[{ required: true, message: '请输入活动描述' }]}>
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
                dispatch({ type: 'set', name: 'dateDisabled', value: checked });
              }}
            />
            <span className="ml-8px text-14px leading-22px">不限制结束日期</span>
          </div>
        </div>
        <Form.Item id="activityDate" name="activityDate" rules={[{ required: true, message: '请输入活动日期' }]}>
          <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期']} disabled={[false, switchers.dateDisabled]} allowEmpty={[false, true]} />
        </Form.Item>
        <Form.Item label="上传图片：" name="pictures" rules={[{ required: true, message: '请上传图片' }]} className="mb-0">
          <FileUpload
            onChange={(err: Error, file: any) => {
              form.setFieldsValue({ pictures: file.url });
            }}
            type="plus"
            wrapperClass="block w-full"
            className="block"
          />
        </Form.Item>
        <div className="mt-8px mb-24px text-12px font-400 text-#9B99A5 leading-17px">
          支持上传PNG、GIF、SVG、JPG、视频等格式，大小限制 5MB，推荐 1:1比例，如果图片是圆形，建议圆形图案正好在中间
        </div>
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="issueNumber" className="required" title="发行数量：">
            发行数量：
          </label>
          <div>
            <Switch
              checked={switchers.numberDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                dispatch({ type: 'set', name: 'numberDisabled', value: checked });
              }}
            />
            <span className="ml-8px">不限制发行数量</span>
          </div>
        </div>
        {switchers.numberDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="issueNumber" rules={[{ required: true, message: '请输入发行数量' }]}>
            <Input placeholder="请输入" id="issueNumber" />
          </Form.Item>
        )}
        <div className="flex flex-row justify-between">
          <label htmlFor="publicLimit" title="公开铸造上限：">
            公开铸造上限：
          </label>
          <Radio.Group
            onChange={(e) => {
              const res = isCoexisted(e.target.value, switchers.numberDisabled);
              if (res) {
                dispatch({ type: 'set', name: 'existRelationForbidden', value: true });
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
        {switchers.existRelationForbidden && <ExistRelationForbidden />}
        {switchers.publicLimitDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="publicLimit">
            <InputNumber defaultValue={1} className="w-full" />
          </Form.Item>
        )}
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="password" title="领取口令：">
            领取口令：
          </label>
          <div>
            <Switch
              checked={switchers.passwordDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                dispatch({ type: 'set', name: 'passwordDisabled', value: checked });
              }}
            />
          </div>
        </div>
        {!switchers.passwordDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="publicLimit">
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
            <Form.Item name="whitelist" className="hidden">
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
