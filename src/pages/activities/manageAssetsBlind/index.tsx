import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import RainbowBreadcrumb from '@components/Breadcrumb';
import { Link } from 'react-router-dom';
import { Card, Button, Form, Select, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { listContracts } from '@services/contract';
import { Contract } from '@models/index';
import { getActivityById, updatePoap } from '@services/activity';
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
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { data, mutate } = useSWR(`api/apps/poap/activity/${activityId}`, () => getActivityById(activityId));
  const isContractEditable = useMemo(() => !data?.contract_address, [data]);

  const handleFinish = useCallback(
    async (formData: any) => {
      const probabilities = Object.keys(formData).filter((key) => key?.endsWith('-probability'));
      const nftConfigs = [...data?.nft_configs];
      probabilities?.forEach((probability) => {
        const id = Number(probability.split('-')[1]);
        const value = formData[probability];
        const index = nftConfigs.findIndex((nftItem) => +nftItem?.id === id);
        nftConfigs[index].probability = +value / 100;
      });

      const totalProbability = nftConfigs.reduce((acc, nftItem) => acc + (nftItem?.probability ?? 0), 0);
      if (totalProbability !== 1) {
        message.error('请正确设置藏品权重：各项藏品需大于0，且总和为100%');
        return;
      }
      const newData = { ...data, nftConfigs, contract_id: formData?.contract_id };
      try {
        await updatePoap(newData);
        await mutate();
        message.success('保存更新成功');
      } catch (err) {
        console.log(err);
      }
    },
    [data, activityId]
  );

  useEffect(() => {
    listContracts().then((res) => {
      let tempContracts: Contract[] = [];
      res.items.map((e: Contract) => {
        if (e.type === 1) tempContracts.push(e);
      });
      setContracts(tempContracts);
    });
  }, []);

  useEffect(() => {
    if (!data) return;
    form.setFieldsValue({
      contract_id: data.contract_id ?? '',
      ...(data?.nft_configs ? Object.fromEntries(data?.nft_configs?.map((nftItem: any) => [`nftConfig-${nftItem.id}`, nftItem])) : {}),
      ...(data?.nft_configs ? Object.fromEntries(data?.nft_configs?.map((nftItem: any) => [`nftConfig-${nftItem.id}-probability`, nftItem?.probability * 100])) : {}),
    });
  }, [data]);

  const nftConfigs = data?.nft_configs;

  return (
    <>
      <RainbowBreadcrumb items={[<Link to="/panels/poaps/">返回</Link>, '管理藏品']} />
      <Card>
        <Form form={form} id="manageAssetsBlindForm" onFinish={handleFinish}>
          <Form.Item name="contract_id" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
            <Select placeholder="请选择" disabled={!isContractEditable}>
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
          {nftConfigs?.map?.((item: any) => (
            <BlindTableItem key={item.id} {...item} />
          ))}
          <div className="mt-[24px] flex justify-center items-center">
            <Input type="submit" className="w-[188px] bg-[#6953EF] text-[#FFFFFF] rounded-[2px] cursor-pointer" value="保存" />
          </div>
        </Form>
        {open && <AddAssetsModal open={open} onCancel={() => setOpen(false)} type="add" />}
      </Card>
    </>
  );
};

export default ManageAssetsBlind;
