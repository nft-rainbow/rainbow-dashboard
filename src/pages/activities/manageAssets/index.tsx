import { Link } from 'react-router-dom';
import cx from 'clsx';
import { 
    Card, Button, Form, Input, Dropdown, 
    DatePicker, Select, type MenuProps
} from 'antd';
import { DownOutlined, DeleteOutlined } from '@ant-design/icons';
import RainbowBreadcrumb from '@components/Breadcrumb';
import FileUploadNew from '@components/FileUploadNew';
import { short } from '@utils/index';
import useManageAssets from './useManageAssets';
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
    trait_type?: string;
    display_type?: string;
    name: number;
    id: number;
    value: any;
    remove: (index: number | number[]) => void;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ display_type, name, id, remove, value }) => {
    return (
        <div className="flex flex-row" key={`${name}-${id}`}>
            <>
                {(!display_type || display_type === 'text' || display_type === 'string') && (
                    <>
                        <Form.Item noStyle name={[name, 'trait_type']}>
                            <Input placeholder="请输入特征名称" className="mr-16px" />
                        </Form.Item>
                        <Form.Item noStyle name={[name, 'value']}>
                            <Input placeholder="请输入特征值" className="mr-18px" />
                        </Form.Item>
                    </>
                )}
                {display_type === 'date' && (
                    <>
                        <Form.Item noStyle name={[name, 'trait_type']}>
                            <Input placeholder="日期" className="mr-16px" />
                        </Form.Item>
                        <Form.Item
                            noStyle
                            name={[name, 'value']}
                        >
                            <DatePicker showTime className="mr-18px"/>
                        </Form.Item>
                    </>
                )}
            </>
            <Button icon={<DeleteOutlined style={{ color: '#6953EF', width: '32px', height: '32px' }} />} onClick={() => remove([name])} />
        </div>
    );
};

const Asset: React.FC = () => {
    const { form, inTransaction, contracts, handleFinish, isContractEditable } = useManageAssets('single');

    return (
        <div>
            <RainbowBreadcrumb items={[<Link to="/panels/poaps/">返回</Link>, '管理藏品']} />
            <Card style={{flexGrow: 1}}>
                <Form
                    id="manageAssetsForm"
                    name="basic"
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{ characters: [{ type: 'text', characterName: '活动地点' }] }}
                >
                    <Form.Item name="contract_id" label="合约地址" rules={[{ required: true, message: '请选择合约地址' }]}>
                        <Select placeholder="请选择" disabled={!isContractEditable}>
                            {contracts.map((e) => (
                                <Option label={e.address} value={e.id} key={e.address}>
                                    {`${short(e.address)} (${e.name}-${e.symbol})`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="藏品名称：" rules={[{ required: true, message: '请输入藏品名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="上传图片："
                        name="file"
                        valuePropName="fileList"
                        className="mb-0"
                        getValueFromEvent={(evt) => (Array.isArray(evt) ? evt : evt?.fileList)}
                        rules={[{ required: true, message: '请上传图片' }]}
                    >
                        <FileUploadNew maxCount={1} listType="picture" type="plus" wrapperClass="block w-full !mb-24px" className="block" />
                    </Form.Item>
                        
                    <Form.List name="characters">
                        {(fields, { add, remove }) => (
                            <>
                                <div className="mb-8px flex flex-row justify-between">
                                    <label>特征设置：</label>
                                    <Dropdown trigger={['click']} menu={{ items, onClick: (e) => add({ display_type: e.key }) }}>
                                        <a className="border border-solid border-#6953EF py-1px px-12px rounded-2px">
                                            新增
                                            <DownOutlined />
                                        </a>
                                    </Dropdown>
                                </div>
                                <div className="grid grid-cols-2 gap-x-16px gap-y-16px">
                                    {fields.map((field, index) => (
                                        <CharacterItem
                                            value={form.getFieldValue(['characters', index, 'value'])}
                                            display_type={form.getFieldValue(['characters', index, 'display_type'])}
                                            remove={remove}
                                            key={index}
                                            id={index}
                                            name={field.name}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </Form.List>
                    <div className="flex justify-center items-center mt-[24px]">
                        <Input
                            disabled={inTransaction}
                            type="submit"
                            value="保存"
                            className={cx('w-[188px] bg-[#6953EF] text-[#FFFFFF] rounded-[2px]', inTransaction ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer')}
                        />
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Asset;
