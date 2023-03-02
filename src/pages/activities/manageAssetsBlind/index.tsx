import { useState, useEffect, useCallback } from 'react';
import RainbowBreadcrumb from '@components/Breadcrumb';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Select, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { listContracts } from '@services/contract';
import { Contract } from '@models/index';
import { Character, AssetItem } from '@models/index';
import { useAssetItemsBlind } from '@stores/ActivityItemsBlind';
import AddAssetsModal from './AddAssetsModal';
import BlindTableItem from './BlindTableItem';
const { Option } = Select;

const TableHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-4 w-full h-[55px] bg-[#FAFAFF]">
      <div className="p-[16px] flex flex-row justify-between">
        图片<div className="w-[1px] bg-black opacity-6"></div>
      </div>
      <div className="p-[16px] flex flex-row justify-between">
        藏品名称<div className="w-[1px] bg-black opacity-6"></div>
      </div>
      <div className="p-[16px] flex flex-row justify-between">
        权重<div className="w-[1px] bg-black opacity-6"></div>
      </div>
      <div className="p-[16px]">操作</div>
    </div>
  );
};

const ManageAssetsBlind: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [open, setOpen] = useState(false);
  const assetItems = useAssetItemsBlind();

  const handleFinish = useCallback((data: any) => {
    debugger;
    console.log(data);
  }, []);

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
        <Form id="manageAssetsBlindForm" onFinish={handleFinish}>
          <Form.Item name="contract_id" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
            <Select placeholder="请选择">
              {contracts.map((e) => (
                <Option label={e.address} value={e.id} key={e.address}>
                  {e.address}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="mb-[16px] flex flex-row items-center justify-between">
            <span>藏品设置</span>
            <Button onClick={(e) => setOpen(true)} className="text-[#6953EF] border border-solid border-[#6953EF]">
              <PlusOutlined />
              添加藏品
            </Button>
          </div>
          <TableHeader />
          {assetItems.map((item) => {
            return <BlindTableItem image_url={item.image_url} name={item.name} key={item.key} id={item.key} />;
          })}
          <div className="mt-[24px] flex justify-center items-center">
            <Input type="submit" className="w-[188px] bg-[#6953EF] text-[#FFFFFF] rounded-[2px]" value="保存" />
          </div>
        </Form>
        <AddAssetsModal open={open} onCancel={() => setOpen(false)} type="add" />
      </Card>
    </>
  );
};

export default ManageAssetsBlind;
