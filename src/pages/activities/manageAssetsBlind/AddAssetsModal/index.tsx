import { useCallback } from 'react';
import { uniqueId } from 'lodash-es';
import { Button, Form, Modal, Select, Input, DatePicker, MenuProps, Dropdown } from 'antd';
import { ModalStyle } from '../../createActivities/constants';
import { AssetItem, Character } from '@models/index';
import FileUpload from '@components/FileUpload';
import useResetFormOnCloseModal from '@hooks/useResetFormOnCloseModal';
import { useAddItem, useEditItem } from '@stores/ActivityItemsBlind';
import './index.scss';
import { DeleteOutlined, DownOutlined } from '@ant-design/icons';

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
  id?: string;
  type: 'edit' | 'add';
  onCancel: () => void;
}

const AddAssetsModal: React.FC<AddAssetsModalProps> = ({ open, type, id, onCancel }) => {
  const [form] = Form.useForm();
  const { getFieldValue } = form;
  const addItem = useAddItem();
  const editItem = useEditItem();
  useResetFormOnCloseModal({ form, open });

  const handleFinish = useCallback(
    async (data: any) => {
      const { characters, name, image_url } = data;
      if (type === 'add') {
        if (!characters) {
          addItem({ ...data, key: uniqueId() });
          onCancel();
          return;
        }
        let tempChars: Character[] = [];
        characters.forEach((char: Character) => {
          if (char.value) tempChars.push(char);
        });
        addItem({ characters: tempChars, key: uniqueId(), name: name, image_url: image_url });
        onCancel();
      } else {
        editItem({ ...data, key: id }, id as string);
        onCancel();
      }
    },
    [id]
  );

  return (
    <Modal
      title="添加藏品"
      open={open}
      onCancel={onCancel}
      {...ModalStyle}
      footer={[
        <div className="w-full flex flex-row justify-between" key="footer">
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
export default AddAssetsModal;
