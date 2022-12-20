import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  TablePaginationConfig,
  message,
} from "antd";
import { Link } from "react-router-dom";
import { getApps, createApp } from '../../services/app';
import { mapChainName, formatDate } from '../../utils';
import { App } from '../../models';

function Apps() {
  const [apps, setApps] = useState<App[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  const refreshItems = (currentPage: number) => {
    setLoading(true);
    getApps(currentPage).then(data => {
      setApps(data.items);
      setTotal(data.count);
    }).then(() => {
      setLoading(false);
    });
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      render: (text: string, record: App) => <Link to={`/panels/apps/${record.id}`}>{text}</Link>
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      render: mapChainName,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDate,
    },
    {
      title: '操作',
      key: 'action',
      render: (text: number, record: App) => <Link to={`/panels/apps/${record.id}`}><Button type='primary' size='small'>查看</Button></Link>
    }
  ];

  const handleOk = async (values: object) => {
    try {
      await createApp(values);
      setIsModalVisible(false);
      message.success('创建成功');
      refreshItems(page);
    } catch (err) {
      message.error('创建失败');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    refreshItems(page);
  }, [page]);

  return (
    <>
      <Card title='我的项目' extra={<Button onClick={() => setIsModalVisible(true)} type="primary">创建项目</Button>}>
        <Table
          rowKey='id'
          dataSource={apps}
          columns={columns}
          loading={loading}
          pagination={{
            total,
            current: page,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(info: TablePaginationConfig) => { setPage(info.current as number); }}
        />
      </Card>
      <Modal title="创建项目" open={isModalVisible} onOk={createForm.submit} onCancel={handleCancel}>
        <Form
          name="basic"
          form={createForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleOk}
          initialValues={{ chain: 'conflux' }}
          onFinishFailed={handleCancel}
          autoComplete="off"
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="项目介绍"
            name="intro"
            rules={[{ required: true, message: '请输入项目介绍' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="区块链"
            name="chain"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Select>
              <Select.Option value="conflux">树图链</Select.Option>
            </Select>
          </Form.Item>
          
        </Form>
      </Modal>
    </>
  );
}

export default Apps;
