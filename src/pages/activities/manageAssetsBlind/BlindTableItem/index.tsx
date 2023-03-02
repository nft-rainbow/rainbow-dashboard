import { useState } from 'react';
import { AssetItem } from '@models/index';
import { Input, Form, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import Edit from '@assets/icons/edit.svg';
interface BlindTableItemProp {
  id: string;
  handleDelete: (id: string) => void;
}
const BlindTableItem: React.FC<Omit<AssetItem, 'key'> & BlindTableItemProp> = ({ image_url, name, id, handleDelete }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid grid-cols-4 h-[55px] overflow-hidden">
      <div className="px-[16px] flex items-center">
        {/* TODO: */}
        <div className="w-full text-[#6953EF] hover:cursor-pointer" onClick={(e) => setVisible(true)}>
          图片1.png
        </div>
        <Image
          style={{ display: 'none' }}
          width={440}
          preview={{
            visible,
            src: image_url,
            onVisibleChange: (value) => {
              setVisible(value);
            },
          }}
        />
      </div>
      <div className="px-[16px] flex items-center">{name}</div>
      <div className="px-[16px] flex flex-row gap-x-[8px] items-center">
        <Form.Item name={`weights-${id}`} className="mb-[0px]">
          <Input />
        </Form.Item>
        <span>%</span>
      </div>
      <div className="px-[16px] flex flex-row items-center">
        <img src={Edit} className="w-[16px] h-[16px] hover:cursor-pointer" />
        <div className="mx-[8px] w-[1px] h-[12px] bg-[#0000000f]"></div>
        <div
          className="hover:cursor-pointer"
          onClick={(e) => {
            handleDelete(id);
          }}
        >
          <DeleteOutlined style={{ color: '#6953EF', width: '16px', height: '16px' }} />
        </div>
      </div>
    </div>
  );
};

export default BlindTableItem;
