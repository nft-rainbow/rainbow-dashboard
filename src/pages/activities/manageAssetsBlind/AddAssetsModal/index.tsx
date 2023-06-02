import { Button, Form, Modal, Input, DatePicker, MenuProps, Dropdown } from 'antd';
import { ModalStyle } from '../../createActivities/constants';
import FileUploadNew from '@components/FileUploadNew';
import useManageAssets from '../../manageAssets/useManageAssets';
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
    trait_type?: string;
    display_type?: string;
    name: number;
    id: number;
    remove: (index: number | number[]) => void;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ display_type, name, id, remove }) => {
    return (
        <div className="grid grid-cols-[41.8%_41.8%_8%] gap-x-[16px]" key={`${name}-${id}`}>
            <Form.Item noStyle name={[name, 'trait_type']}>
                <Input placeholder="请输入特征名称" />
            </Form.Item>
            {(!display_type || display_type === 'text' || display_type === 'string') && (
                <Form.Item noStyle name={[name, 'value']}>
                    <Input placeholder="请输入特征值" />
                </Form.Item>
            )}
            {display_type === 'date' && (
                <Form.Item noStyle name={[name, 'value']}>
                    <DatePicker showTime placeholder="请选择日期" />
                </Form.Item>
            )}
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
    const { form, inTransaction, handleFinish } = useManageAssets('blind', id);

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
                    <Button type="primary" key="addAsset" onClick={form.submit} className="grow" loading={inTransaction}>
                        {type === 'edit' ? '保存' : '添加'}
                    </Button>
                </div>,
            ]}
        >
            <Form
                id="addAssetsBoard"
                name="addAssetsBoard"
                form={form}
                layout="vertical"
                onFinish={(evt: any) => {
                    handleFinish(evt);
                    onCancel();
                }}
                initialValues={{ characters: [{ type: 'text', characterName: '活动地点' }] }}
            >
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
                <Form.Item name="name" label="藏品名称：" rules={[{ required: true, message: '请输入藏品名称' }]}>
                    <Input />
                </Form.Item>
                <Form.List name="characters">
                    {(fields, { add, remove }) => (
                        <div className="mb-[24px]">
                        <div className="mb-8px flex flex-row justify-between">
                            <label>特征设置：</label>
                            <Dropdown trigger={['click']} menu={{ items: characterItms, onClick: (e) => add({ display_type: e.key }) }}>
                            <a className="border border-solid border-#6953EF py-1px px-12px rounded-2px">
                                新增 
                                <DownOutlined />
                            </a>
                            </Dropdown>
                        </div>
                        <div className="flex flex-col gap-y-[16px]">
                            {fields.map((field, index) => (
                            <CharacterItem display_type={form.getFieldValue(['characters', index, 'display_type'])} id={index} name={field.name} remove={remove} key={index} />
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
