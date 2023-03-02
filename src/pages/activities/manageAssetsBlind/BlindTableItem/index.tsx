import { useState } from 'react';
import { AssetItem } from '@models/index';
import { Input, Form, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDeleteItem } from '@stores/ActivityItemsBlind';
import AddAssetsModal from '../AddAssetsModal';
import Edit from '@assets/icons/edit.svg';
import './index.scss';
interface BlindTableItemProp {
  id: string;
}
const BlindTableItem: React.FC<Omit<AssetItem, 'key'> & BlindTableItemProp> = ({ image_url, name, id }) => {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const deleteItem = useDeleteItem();
  return (
    <div className="grid grid-cols-4 h-[55px] overflow-hidden" key={id}>
      <div className="px-[16px] flex items-center">
        {/* TODO: */}
        {/* <div className="w-full text-[#6953EF] hover:cursor-pointer" onClick={(e) => setVisible(true)}>
          图片1.png
        </div> */}
        <Image
          width={22}
          src={image_url}
          // preview={{
          //   visible,
          //   src: image_url,
          //   onVisibleChange: (value) => {
          //     setVisible(value);
          //   },
          // }}
        />
      </div>
      <div className="px-[16px] flex items-center">{name}</div>
      <div className="px-[16px] flex flex-row gap-x-[8px] items-center overflow-hidden" id="blindTableItem">
        <Form.Item name={[id]} className="mb-[0px]" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <span>%</span>
      </div>
      <div className="px-[16px] flex flex-row items-center">
        <img src={Edit} className="w-[16px] h-[16px] hover:cursor-pointer" onClick={(e) => setOpen(true)} />
        <div className="mx-[8px] w-[1px] h-[12px] bg-[#0000000f]"></div>
        <div
          className="hover:cursor-pointer"
          onClick={(e) => {
            deleteItem(id);
          }}
        >
          <DeleteOutlined style={{ color: '#6953EF', width: '16px', height: '16px' }} />
        </div>
      </div>
      <AddAssetsModal open={open} onCancel={() => setOpen(false)} type="edit" id={id} />
    </div>
  );
};

export default BlindTableItem;
