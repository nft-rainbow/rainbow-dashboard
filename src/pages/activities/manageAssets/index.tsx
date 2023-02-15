import { useCallback } from 'react';
import { Card, Button, Form, Input, Dropdown, DatePicker, type MenuProps } from 'antd';
import { DownOutlined, DeleteOutlined } from '@ant-design/icons';
import FileUpload from '@components/FileUpload';
import './index.scss';
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
    <div className="flex flex-row">
      <>
        {type === 'text' && (
          <>
            <Form.Item noStyle name={[name, 'characterName']}>
              <Input placeholder="请输入特征名称" className="mr-16px" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'characterValue']}>
              <Input placeholder="请输入特征值" className="mr-18px" />
            </Form.Item>
          </>
        )}
        {type === 'date' && (
          <>
            <Form.Item noStyle name={[name, 'characterDate']} className="mr-16px">
              <Input placeholder="日期" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'characterDateTime']} className="mr-18px">
              <DatePicker showTime />
            </Form.Item>
          </>
        )}
      </>
      <Button icon={<DeleteOutlined style={{ color: '#6953EF', width: '32px', height: '32px' }} />} onClick={() => remove([name])} />
    </div>
  );
};

const Asset: React.FC = () => {
  const [form] = Form.useForm();
  const { getFieldValue } = form;
  const handleFinish = useCallback((data: any) => {
    console.log('data', data);
  }, []);
  return (
    <Card>
      <Form id="manageAssetsForm" name="basic" form={form} layout="vertical" onFinish={handleFinish} initialValues={{ characters: [{ type: 'text', characterName: '活动地点' }] }}>
        <div className="grid grid-cols-2 gap-x-16px">
          <div>
            <Form.Item label="上传图片：" name="image_url" rules={[{ required: true, message: '请上传图片' }]} className="mb-0">
              <FileUpload
                onChange={(err: Error, file: any) => {
                  form.setFieldsValue({ image_url: file.url });
                }}
                type="plus"
                wrapperClass="block w-full !mb-24px"
                className="block"
              />
            </Form.Item>
          </div>
          <div></div>
          <Form.Item name="name" label="藏品名称：" rules={[{ required: true, message: '请输入藏品名称' }]}>
            <Input placeholder="2023烤仔守护神兔全家福" />
          </Form.Item>
          <Form.Item name="contract_address" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
            <Input placeholder="请选择" />
          </Form.Item>
        </div>
        <Form.List name="characters">
          {(fields, { add, remove }) => (
            <>
              <div className="flex flex-row justify-between">
                <label>特征设置：</label>
                <Dropdown trigger={['click']} menu={{ items, onClick: (e) => add({ type: e.key }) }}>
                  <a className="border border-solid border-#6953EF py-1px px-12px rounded-2px">
                    新增
                    <DownOutlined />
                  </a>
                </Dropdown>
              </div>
              <div className="grid grid-cols-2 gap-x-16px">
                {fields.map((field, index) => (
                  <CharacterItem type={getFieldValue(['characters', index, 'type'])} key={field.key} name={field.name} remove={remove} />
                ))}
              </div>
            </>
          )}
        </Form.List>
        <div className="flex justify-center items-center mt-24px">
          <Input type="submit" value="保存" className="w-188px bg-#6953EF color-#FFFFFF rounded-2px" />
        </div>
      </Form>
    </Card>
  );
};

export default Asset;
