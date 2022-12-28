import React, { useState } from 'react';
import {
  Modal,
  ModalProps,
  ModalFuncProps,
  Form,
  FormProps,
  Input,
  Row,
  Col,
  Switch,
  DatePicker,
  Select,
  Popover
} from "antd";
import { QuestionCircleTwoTone } from '@ant-design/icons';
import FileUpload from '../../components/FileUpload';

const Content = (
  <div>
    开启后，只允许导入的地址进行铸造，并且只允许铸造一定数量的藏品，例如地址为A,B,C，填写数量为1,2,3，则意味着A允许铸造1个藏品，B铸造2个，C铸造3个。注意使用英文逗号分隔。关闭即开放给所有地址进行铸造。
  </div>
)

const CreatePOA: React.FC<ModalProps & ModalFuncProps & FormProps> = ({ open, onOk, onCancel, onFinish }) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const { RangePicker } = DatePicker;
  const [dateDisabled, setDateDisabled] = useState(false);
  const [numberDisabled, setNumberDisabled] = useState(false);
  const [proofDisabled, setProofDisabled] = useState(false);

  return (
    <Modal title="创建活动" open={open} onOk={form.submit} onCancel={onCancel}>
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        onFinish={onFinish}
        initialValues={{ chain: 'conflux' }}
        onFinishFailed={onCancel}
        autoComplete="off"
      >
        <Form.Item name="chain" label="网络" rules={[{ required: true }]}>
          <Select>
            <Option value="conflux">树图主网</Option>
            <Option value="conflux_test">树图测试网</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="合约地址"
          name="contractAddress"
          rules={[{ required: true, message: '请输入合约地址' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="活动名称"
          name="ActivityName"
          rules={[{ required: true, message: '请输入活动名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="活动描述"
          name="ActivityDescription"
          rules={[{ required: true, message: '请输入活动描述' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <RangePicker />
        </Form.Item>
        {/* <Form.Item
          label="开始时间"
          name="startDate"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="结束时间"
          name="endDate"
        >
          <DatePicker disabled={dateDisabled} />
        </Form.Item> */}
        <Switch onChange={(check) => { setDateDisabled(check) }} />

        <Form.Item
          label="图片"
          name="picture"
          rules={[{ required: true, message: '请上传图片' }]}
        >
          <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ file_url: file.url })} />
        </Form.Item>
        <Form.Item
          label="发行数量"
          name='issueNumber'
        >
          <Input disabled={numberDisabled} />
        </Form.Item>
        <Switch onChange={(checked) => { setNumberDisabled(checked) }} />
        <Form.Item
          label="领取口令"
          name="proof"
        >
          {proofDisabled && <Input />}
        </Form.Item>
        <Switch onChange={(checked) => { setProofDisabled(checked) }} />
        <Form.Item
          label="白名单铸造："
          name="whitelist"
        >
          {proofDisabled && <Input />}
        </Form.Item>
        <Popover content={Content} title="whitelist">
          <QuestionCircleTwoTone />
        </Popover>
        <Switch onChange={(checked) => { setProofDisabled(checked) }} />
      </Form>
    </Modal >
  )
}

export default CreatePOA;
