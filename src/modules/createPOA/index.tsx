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
} from "antd";
import FileUpload from '../../components/FileUpload';

const CreatePOA: React.FC<ModalProps & ModalFuncProps & FormProps> = ({ open, onOk, onCancel, onFinish }) => {
  const [form] = Form.useForm();
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
        <Col span={16}>
          <Form.Item
            label="合约地址"
            name="contractAddress"
            rules={[{ required: true, message: '请输入合约地址' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            label="活动名称"
            name="ActivityName"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item
            label="活动描述"
            name="ActivityDescription"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Row>
          <Col span={10}>
            <Form.Item
              label="开始时间"
              name="startDate"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <DatePicker />
            </Form.Item>
          </Col>
          <Col span={10} offset={1}>
            <Form.Item
              label="结束时间"
              name="endDate"
            >
              <DatePicker disabled={dateDisabled} />
            </Form.Item>
          </Col>
          <Col span={1} offset={1}>
            <Switch onChange={(check) => { setDateDisabled(check) }} />
          </Col>
        </Row>
        <Col span={16} >
          <Form.Item
            label="图片"
            name="picture"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ file_url: file.url })} />
          </Form.Item>
        </Col>
        <Row>
          <Col span={11}>
            <Form.Item
              label="发行数量"
              name='issueNumber'
            >
              <Input disabled={numberDisabled} />
            </Form.Item>
          </Col>
          <Col span={11} offset={1}>
            <Switch onChange={(checked) => { setNumberDisabled(checked) }} />
          </Col>
        </Row>
        <Row>
          <Col span={11} >
            <Form.Item
              label="领取口令"
              name="proof"
            >
              {proofDisabled && <Input />}
            </Form.Item>

          </Col>
          <Col span={11} offset={1}>
            <Switch onChange={(checked) => { setProofDisabled(checked) }} />
          </Col>
        </Row>
      </Form>
    </Modal >
  )
}

export default CreatePOA;
