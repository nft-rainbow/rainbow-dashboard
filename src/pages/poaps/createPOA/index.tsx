import React, { useState, useCallback } from 'react';
import { Modal, Form, Input, Switch, DatePicker, Select, Popover, InputNumber, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import FileUpload from '@components/FileUpload';
import { PopoverContent, ExistRelationForbidden } from './constants';
import { isCoexisted } from '@utils/index';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import './index.css';

interface CreatePOAProps {
  open: boolean;
  onCancel: () => void;
  hideModal: () => void;
}

const CreatePOA: React.FC<CreatePOAProps> = ({ open, onCancel, hideModal }) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  useResetFormOnCloseModal({ form, open });
  const [dateDisabled, setDateDisabled] = useState(false);
  const [numberDisabled, setNumberDisabled] = useState(false);
  const [publicLimitDisabled, setPublicLimitDisabled] = useState(false);
  const [passwordDisabled, setpasswordDisabled] = useState(false);
  const [whitelistDisabled, setWhitelistDisabled] = useState(true);
  const [existRelationForbidden, setExistedRelationForbidden] = useState(false);

  const handleWhiltelistChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(async (e) => {
    if (!e.target?.files?.length) return;
    Papa.parse(e.target?.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        console.log(results.data);
        let res = JSON.stringify(results.data);
        form.setFieldsValue({ whitelist: res });
      },
    });
  }, []);

  const handleFinish = useCallback((values: any) => {
    console.log(values);
    hideModal();
  }, []);

  const handleCancel = useCallback(() => {
    setDateDisabled(false);
    setNumberDisabled(false);
    setPublicLimitDisabled(false);
    setpasswordDisabled(false);
    setWhitelistDisabled(true);
    onCancel();
  }, []);

  return (
    <Modal
      title="创建活动"
      open={open}
      onOk={form.submit}
      onCancel={handleCancel}
      width={'30.5%'}
      style={{ top: '0px', paddingBottom: '0px' }}
      wrapClassName="flex items-center"
      bodyStyle={{ paddingTop: '16px' }}
    >
      <Form name="basic" form={form} layout="vertical" onFinish={handleFinish} initialValues={{ chain: 'conflux' }} autoComplete="off">
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
          <label htmlFor="activityDate" className="required" title="活动日期">
            活动日期：
          </label>
          <div>
            <Switch
              checked={dateDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                setDateDisabled(checked);
              }}
            />
            <span className="ml-8px">不限制结束日期</span>
          </div>
        </div>
        <Form.Item id="activityDate" name="activityDate" rules={[{ required: true, message: '请输入活动日期' }]}>
          <RangePicker id="activityDate" showTime placeholder={['开始日期', '结束日期']} disabled={[false, dateDisabled]} allowEmpty={[false, true]} />
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
              checked={numberDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                setNumberDisabled(checked);
              }}
            />
            <span className="ml-8px">不限制发行数量</span>
          </div>
        </div>
        {numberDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="issueNumber" rules={[{ required: true, message: '请输入发行数量' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        )}
        <div className="flex flex-row justify-between">
          <label htmlFor="publicLimit" title="公开铸造上限：">
            公开铸造上限：
          </label>
          <Radio.Group
            onChange={(e) => {
              const res = isCoexisted(e.target.value, numberDisabled);
              if (res) {
                setExistedRelationForbidden(true);
                return;
              }
              setPublicLimitDisabled(e.target.value);
            }}
            value={publicLimitDisabled}
          >
            <Radio value={false}>限制</Radio>
            <Radio value={true}>不限制</Radio>
          </Radio.Group>
        </div>
        {existRelationForbidden && <ExistRelationForbidden />}
        {publicLimitDisabled ? (
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
              checked={passwordDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                setpasswordDisabled(checked);
              }}
            />
          </div>
        </div>
        {!passwordDisabled ? (
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
            {!whitelistDisabled && (
              <label htmlFor="whitelistUpload" className="mr-8px text-12px font-400 text-#6953EF leading-20px">
                导入CSV
              </label>
            )}
            <Switch
              checked={!whitelistDisabled}
              onClick={(checked, e) => {
                e.preventDefault();
                setWhitelistDisabled(!checked);
              }}
            />
          </div>
        </div>
        {!whitelistDisabled && (
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
