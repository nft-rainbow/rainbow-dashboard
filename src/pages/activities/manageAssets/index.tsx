import { useState, useCallback, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import cx from 'clsx';
import { Card, Button, Form, Input, Dropdown, DatePicker, Select, type MenuProps } from 'antd';
import { DownOutlined, DeleteOutlined } from '@ant-design/icons';
import RainbowBreadcrumb from '@components/Breadcrumb';
import { listContracts } from '@services/contract';
import { updatePoap as _updatePoap, getActivityById } from '@services/activity';
import { assetsFormFormat } from '@utils/assetsFormHelper';
import { Contract } from '@models/index';
import FileUpload from '@components/FileUpload';
import useInTransaction from '@hooks/useInTransaction';
import './index.scss';
const { Option } = Select;
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
  id: number;
  remove: (index: number | number[]) => void;
}
const CharacterItem: React.FC<CharacterItemProps> = ({ type, name, id, remove }) => {
  return (
    <div className="flex flex-row" key={`${name}-${id}`}>
      <>
        {type === 'text' && (
          <>
            <Form.Item noStyle name={[name, 'characterName']}>
              <Input placeholder="请输入特征名称" className="mr-16px" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'value']}>
              <Input placeholder="请输入特征值" className="mr-18px" />
            </Form.Item>
          </>
        )}
        {type === 'date' && (
          <>
            <Form.Item noStyle name={[name, 'characterName']}>
              <Input placeholder="日期" className="mr-16px" />
            </Form.Item>
            <Form.Item noStyle name={[name, 'value']}>
              <DatePicker showTime className="mr-18px" />
            </Form.Item>
          </>
        )}
      </>
      <Button icon={<DeleteOutlined style={{ color: '#6953EF', width: '32px', height: '32px' }} />} onClick={() => remove([name])} />
    </div>
  );
};

const Asset: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form] = Form.useForm();
  const { activityId } = useParams<{ activityId: string }>();
  const { inTransaction, execTranscation: updatePoap } = useInTransaction(_updatePoap);
  const { data, error } = useSWR(`api/apps/poap/activity/${activityId}`, () => getActivityById(activityId));
  const { getFieldValue } = form;
  const navigate = useNavigate();

  const handleFinish = useCallback(
    async (formData: any) => {
      const { contract_id: contractId, contract_type, ...rest } = data;
      const activity_id = activityId ?? '';
      const formatData = assetsFormFormat(formData, activity_id);
      const { nft_configs } = formatData;
      try {
        await updatePoap({ ...formatData, ...rest, nft_configs });
        navigate('/panels/poaps');
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
  return (
    <>
      <RainbowBreadcrumb items={[<Link to="/panels/poaps/">返回</Link>, '管理藏品']} />
      <Card>
        <Form
          id="manageAssetsForm"
          name="basic"
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ characters: [{ type: 'text', characterName: '活动地点' }] }}
        >
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
            <Form.Item name="contract_id" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
              <Select placeholder="请选择">
                {contracts.map((e) => (
                  <Option label={e.address} value={e.id} key={e.address}>
                    {e.address}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.List name="characters">
            {(fields, { add, remove }) => (
              <>
                <div className="mb-8px flex flex-row justify-between">
                  <label>特征设置：</label>
                  <Dropdown trigger={['click']} menu={{ items, onClick: (e) => add({ type: e.key }) }}>
                    <a className="border border-solid border-#6953EF py-1px px-12px rounded-2px">
                      新增
                      <DownOutlined />
                    </a>
                  </Dropdown>
                </div>
                <div className="grid grid-cols-2 gap-x-16px gap-y-16px">
                  {fields.map((field, index) => (
                    <CharacterItem type={getFieldValue(['characters', index, 'type'])} id={index} name={field.name} remove={remove} key={index} />
                  ))}
                </div>
              </>
            )}
          </Form.List>
          <div className="flex justify-center items-center mt-24px">
            <Input
              disabled={inTransaction}
              type="submit"
              value="保存"
              className={cx('w-188px bg-#6953EF color-#FFFFFF rounded-2px', inTransaction ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer')}
            />
          </div>
        </Form>
      </Card>
    </>
  );
};

export default Asset;
