import { Card, Button, Form, Input, Dropdown, type MenuProps } from 'antd';
import { DownOutlined, DeleteOutlined } from '@ant-design/icons';
import FileUpload from '@components/FileUpload';
import PictureReminder from '@components/PictureReminder';
const items: MenuProps['items'] = [
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
  remove: (index: number | number[]) => void;
}
const CharacterItem: React.FC<CharacterItemProps> = ({ type, name, remove }) => {
  return (
    <>
      <Form.Item dependencies={[['type']]} noStyle name={[name, 'item']}>
        <>
          {type === 'text' && <Input placeholder="请输入" />}
          {type === 'date' && <Input placeholder="请选择" />}
        </>
      </Form.Item>
      <Button type="primary" icon={<DeleteOutlined />} onClick={() => remove([name])} />
    </>
  );
};

const Asset: React.FC = () => {
  const [form] = Form.useForm();
  const { getFieldValue } = form;
  return (
    <Card>
      <Form id="manageAssetsForm" name="basic" form={form} layout="vertical">
        <Form.Item label="上传图片：" name="image_url" rules={[{ required: true, message: '请上传图片' }]} className="mb-0">
          <FileUpload
            onChange={(err: Error, file: any) => {
              form.setFieldsValue({ image_url: file.url });
            }}
            type="plus"
            wrapperClass="block w-full"
            className="block"
          />
        </Form.Item>
        <PictureReminder />
        <div className="grid grid-cols-2 gap-x-16px">
          <Form.Item name="name" label="藏品名称：" rules={[{ required: true, message: '请输入藏品名称' }]}>
            <Input placeholder="2023烤仔守护神兔全家福" />
          </Form.Item>
          <Form.Item name="contract_address" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
            <Input placeholder="请选择" />
          </Form.Item>
        </div>
        <Form.Item label="特征设置：">
          <Form.List name="characters">
            {(fields, { add, remove }) => (
              <>
                <Dropdown trigger={['click']} menu={{ items, onClick: (e) => add({ type: e.key }) }} className="!w-64px">
                  <div>
                    新增
                    <DownOutlined />
                  </div>
                </Dropdown>
                <div className="grid grid-cols-2 gap-x-16px">
                  {fields.map((field, index) => (
                    <CharacterItem type={getFieldValue(['characters', index, 'type'])} key={field.key} name={field.name} remove={remove} />
                  ))}
                </div>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Asset;
