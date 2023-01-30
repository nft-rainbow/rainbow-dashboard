import React, { useState, useCallback } from 'react';
import { Modal, ModalProps, ModalFuncProps, Form, FormProps, Input, Switch, DatePicker, Select, Popover, InputNumber, type RadioChangeEvent, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import FileUpload from '../../components/FileUpload';

const Content = (
  <div>
    开启后，只允许导入的地址进行铸造，并且只允许铸造一定数量的藏品，例如地址为A,B,C，填写数量为1,2,3，则意味着A允许铸造1个藏品，B铸造2个，C铸造3个。注意使用英文逗号分隔。关闭即开放给所有地址进行铸造。
  </div>
);

const CreatePOA: React.FC<ModalProps & ModalFuncProps & FormProps> = ({ open, onOk, onCancel, onFinish }) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const [dateDisabled, setDateDisabled] = useState(false);
  const [numberDisabled, setNumberDisabled] = useState(false);
  const [publicLimit, setPublicLimit] = useState(false);
  const [passwordDisabled, setpasswordDisabled] = useState(false);
  const [whitelistDisabled, setWhitelistDisabled] = useState(true);

  //TODO: this is a test codes to show the csv data, tobe deleted
  const handleWhiltelistChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    if (!e.target?.files?.length) return;
    let res = Papa.parse(e.target?.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log(results.data);
      },
    });
    console.log('csv', res);
  }, []);

  return (
    <Modal title="创建活动" open={open} onOk={form.submit} onCancel={onCancel} width={'30.5%'} style={{ top: '14px' }} bodyStyle={{ paddingTop: '16px' }}>
      <Form name="basic" form={form} layout="vertical" onFinish={onFinish} initialValues={{ chain: 'conflux' }} onFinishFailed={onCancel} autoComplete="off">
        <Form.Item name="chain" label="区块链" rules={[{ required: true }]}>
          <Select>
            <Option value="conflux">树图链</Option>
            <Option value="conflux_test">树测试链</Option>
          </Select>
        </Form.Item>
        <Form.Item label="合约地址" name="contractAddress" rules={[{ required: true, message: '请输入合约地址' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="活动名称" name="ActivityName" rules={[{ required: true, message: '请输入活动名称' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="活动描述" name="ActivityDescription" rules={[{ required: true, message: '请输入活动描述' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="activityDate" className="ant-form-item-required" title="活动日期">
            活动日期：
          </label>
          <div>
            <Switch
              onClick={(checked, e) => {
                e.preventDefault();
                setDateDisabled(checked);
              }}
            />
            <span className="ml-8px">不限制结束日期</span>
          </div>
        </div>
        <Form.Item id="activityDate" name="activityDate" rules={[{ required: true, message: '请输入活动日期' }]}>
          <RangePicker id="activityDate" showTime disabled={[false, dateDisabled]} />
        </Form.Item>
        <Form.Item label="上传图片：" name="pictures" rules={[{ required: false, message: '请上传图片' }]} className="mb-0">
          <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ file_url: file.url })} type="plus" wrapperClass="block w-full" className="block" />
        </Form.Item>
        <div className="mt-8px mb-24px text-12px font-400 text-#9B99A5 leading-17px">
          支持上传PNG、GIF、SVG、JPG、视频等格式，大小限制 5MB，推荐 1:1比例，如果图片是圆形，建议圆形图案正好在中间
        </div>
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="issueNumber" className="ant-form-item-required" title="发行数量：">
            发行数量：
          </label>
          <div>
            <Switch
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
        <div className="mb-8px flex flex-row justify-between">
          <label htmlFor="publicLimit" title="公开铸造上限：">
            公开铸造上限：
          </label>
          <div>
            <Radio.Group onChange={(e) => setPublicLimit(e.target.value)} value={publicLimit}>
              <Radio value={false}>限制</Radio>
              <Radio value={true}>不限制</Radio>
            </Radio.Group>
          </div>
        </div>
        {publicLimit ? (
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
            <Popover content={Content} title="whitelist">
              <QuestionCircleOutlined />
            </Popover>
          </div>
          <div>
            {!whitelistDisabled && (
              <label htmlFor="whitelist" className="mr-8px text-12px font-400 text-#6953EF leading-20px">
                导入CSV
              </label>
            )}
            <Switch
              onClick={(checked, e) => {
                e.preventDefault();
                setWhitelistDisabled(!checked);
              }}
            />
          </div>
        </div>
        {whitelistDisabled ? (
          <div className="mb-24px w-full h-32px"></div>
        ) : (
          <Form.Item name="whitelist" className="hidden">
            <Input type="file" accept=".csv" id="whitelist" onChange={handleWhiltelistChange} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreatePOA;
