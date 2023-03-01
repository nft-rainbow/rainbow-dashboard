import { useState, useEffect, useCallback } from 'react';
import RainbowBreadcrumb from '@components/Breadcrumb';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Modal, Select, Input, DatePicker, MenuProps, Dropdown } from 'antd';
import { ModalStyle } from '../createActivities/constants';
import { listContracts } from '@services/contract';
import { Contract } from '@models/index';
import FileUpload from '@components/FileUpload';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import './index.scss';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';
const { Option } = Select;
const characterItms: MenuProps['items'] = [
  {
    label: '文本',
    key: 'text',
  },
  {
    label: '日期',
    key: 'date',
  },
];
interface CharacterItemProps {
  type: string;
  name: number;
  id: number;
  remove: (index: number | number[]) => void;
}
const CharacterItem: React.FC<CharacterItemProps> = ({ type, name, id, remove }) => {
  return (
    <div className="grid grid-cols-[41.8%_41.8%_8%] gap-x-[16px]" key={`${name}-${id}`}>
      <>
        {type === 'text' && (
          <>
            <Form.Item noStyle name={[name, 'characterName']}>
              <Input placeholder="请输入特征名称" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'value']}>
              <Input placeholder="请输入特征值" />
            </Form.Item>
          </>
        )}
        {type === 'date' && (
          <>
            <Form.Item noStyle name={[name, 'characterName']}>
              <Input placeholder="日期" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'value']}>
              <DatePicker showTime placeholder="请选择日期" />
            </Form.Item>
          </>
        )}
      </>
      <Button icon={<DeleteOutlined style={{ color: '#6953EF', width: '32px', height: '32px' }} />} onClick={() => remove([name])} />
    </div>
  );
};

interface AddAssetsModalProps {
  open: boolean;
  onCancel: () => void;
}

const AddAssetsModal: React.FC<AddAssetsModalProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const { getFieldValue } = form;
  useResetFormOnCloseModal({ form, open });

  const handleFinish = useCallback(async (data: any) => {
    console.log(data);
  }, []);

  return (
    <Modal
      title="添加藏品"
      open={open}
      {...ModalStyle}
      footer={[
        <div className="w-full flex flex-row justify-between">
          <Button key="cancel" onClick={onCancel} className="grow">
            取消
          </Button>
          <Button type="primary" key="addAsset" onClick={form.submit} className="grow">
            添加
          </Button>
        </div>,
      ]}
    >
      <Form
        id="addAssetsBoard"
        name="addAssetsBoard"
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ characters: [{ type: 'text', characterName: '活动地点' }] }}
      >
        <Form.Item label="上传图片：" name="image_url" className="mb-0">
          <FileUpload
            onChange={(err: Error, file: any) => {
              form.setFieldsValue({ image_url: file.url });
            }}
            type="plus"
            wrapperClass="block w-full !mb-24px"
            className="block"
          />
        </Form.Item>
        <Form.Item name="name" label="藏品名称：" rules={[{ required: true, message: '请输入藏品名称' }]}>
          <Input placeholder="2023烤仔守护神兔全家福" />
        </Form.Item>
        <Form.List name="characters">
          {(fields, { add, remove }) => (
            <div className="mb-[24px]">
              <div className="mb-8px flex flex-row justify-between">
                <label>特征设置：</label>
                <Dropdown trigger={['click']} menu={{ items: characterItms, onClick: (e) => add({ type: e.key }) }}>
                  <a className="border border-solid border-#6953EF py-1px px-12px rounded-2px">
                    新增
                    <DownOutlined />
                  </a>
                </Dropdown>
              </div>
              <div className="flex flex-col gap-y-[16px]">
                {fields.map((field, index) => (
                  <CharacterItem type={getFieldValue(['characters', index, 'type'])} id={index} name={field.name} remove={remove} key={index} />
                ))}
              </div>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

const ManageAssetsBlind: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    listContracts().then((res) => {
      let tempContracts: Contract[] = [];
      res.items.map((e: Contract) => {
        if (e.type === 1) tempContracts.push(e);
      });
      setContracts(tempContracts);
    });
  }, []);

  return (
    <>
      <RainbowBreadcrumb items={[<Link to="/panels/poaps/">返回</Link>, '管理藏品']} />
      <Card>
        <Form id="manageAssetsBlindForm" name="basicBlind" form={form}>
          <Form.Item name="contract_id" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
            <Select placeholder="请选择">
              {contracts.map((e) => (
                <Option label={e.address} value={e.id} key={e.address}>
                  {e.address}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <Button onClick={(e) => setOpen(true)}>添加藏品</Button>
        <AddAssetsModal open={open} onCancel={() => setOpen(false)} />
      </Card>
    </>
  );
};

export default ManageAssetsBlind;
