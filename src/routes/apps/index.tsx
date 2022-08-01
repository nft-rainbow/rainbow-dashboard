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
import RainbowBreadcrumb from '../../components/Breadcrumb';
import { getApps, App, createApp } from '../../services/app';
import { mapChainName, formatDate } from '../../utils';

function Apps() {
  const [apps, setApps] = useState<App[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  const refreshItems = (currentPage: number) => {
    getApps(currentPage).then(data => {
      setApps(data.items);
      setTotal(data.count);
    });
  }

  const columns = [
    {
      title: '应用名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: App) => <Link to={`/panels/apps/${record.id}`}>{text}</Link>
    },
    {
      title: '区块链',
      dataIndex: 'chain_type',
      key: 'chain_type',
      render: mapChainName,
    },
    {
      title: '操作',
      key: 'action',
      /* render: (text: number, record: App) => {
        return <Button type='link' onClick={() => {setToViewAppId(record.id);setIsDetailModalVisible(true)}}>查看Key</Button>;
      }, */
      render: (text: number, record: App) => {
        return <Link to={`/panels/apps/${record.id}`}>查看</Link>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDate,
    }
  ];

  const handleOk = async (values: object) => {
    try {
      await createApp(values);
      setIsModalVisible(false);
      message.success('创建成功');
      refreshItems(page);
    } catch(err) {
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
      <RainbowBreadcrumb items={['应用列表']} />
      <Card extra={<Button onClick={() => setIsModalVisible(true)} type="primary">创建</Button>}>
        <Table 
          rowKey='id'
          dataSource={apps} 
          columns={columns}
          pagination={{
            total,
            current: page,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(info: TablePaginationConfig) => setPage(info.current as number)}
        />
      </Card>
      <Modal title="创建应用" visible={isModalVisible} onOk={createForm.submit} onCancel={handleCancel}>
        <Form
          name="basic"
          form={createForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          onFinish={handleOk}
          initialValues={{chain: 'conflux'}}
          onFinishFailed={handleCancel}
          autoComplete="off"
        >
          <Form.Item
            label="应用名"
            name="name"
            rules={[{ required: true, message: 'Please input app name!' }]}
          >
            <Input />
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
          <Form.Item
            label="简介"
            name="intro"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Apps;
