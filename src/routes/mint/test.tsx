import React, {useCallback, useEffect, useState} from 'react';
import {
	Button,
	Checkbox,
	Col,
	Form,
	FormInstance,
	Input,
	InputNumber,
	Popconfirm,
	Row,
	Space,
	Table, Tooltip,
	Typography
} from 'antd';
import MintFormFields from "./mintFormFields";
import FileUpload from "../../components/FileUpload";
import {QuestionCircleOutlined, QuestionOutlined} from "@ant-design/icons/lib";

interface Item {
	key: string;
	image: string;
	name: string;
	desc: string;
	address: string;
}

const originData: Item[] = [];
for (let i = 0; i < 1; i++) {
	originData.push({
		key: i.toString(),
		image: '1',
		name: `Edrward ${i}`,
		desc: `Desc ${i}`,
		address: `London Park no. ${i}`,
	});
}
interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
	editing: boolean;
	dataIndex: string;
	title: any;
	inputType: 'number' | 'text' | 'file';
	record: Item;
	index: number;
	children: React.ReactNode;
	form: FormInstance
}

const EditableCell: React.FC<EditableCellProps> = ({
	                                                   editing,
	                                                   dataIndex,
	                                                   title,
	                                                   inputType,
	                                                   record,
	                                                   index, form,
	                                                   children,
	                                                   ...restProps
                                                   }) => {
	const inputNode = inputType === 'file' ?
		<FileUpload onChange={(err: Error, file: any) => form.setFieldsValue({ [dataIndex]: file.url })} />
		:(inputType === 'number' ? <InputNumber /> : <Input />);

	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{ margin: 0 }}
					rules={[
						{
							required: true,
							message: `请输入 ${title}!`,
						},
					]}
				>
					{inputNode}
				</Form.Item>
			) : (
				children
			)}
		</td>
	);
};

const Test: React.FC = () => {
	const [form] = Form.useForm();
	const [data, setData] = useState(originData);
	const [useCols, setUseCols] = useState({sameName: false, sameImage: false, sameDesc: false, sameAddress: false,})
	const [editingKey, setEditingKey] = useState('');

	const isEditing = (record: Item) => record.key === editingKey;

	const edit = (record: Partial<Item> & { key: React.Key }) => {
		form.setFieldsValue({ name: '', age: '', address: '', ...record });
		setEditingKey(record.key);
	};
	const remove = (record: Partial<Item> & { key: React.Key }) => {
		const arr = data.filter(t=>t.key != record.key);
		setData(arr)
	};

	const cancel = () => {
		setEditingKey('');
	};

	const save = async (key: React.Key) => {
		try {
			const row = (await form.validateFields()) as Item;

			const newData = [...data];
			const index = newData.findIndex((item) => key === item.key);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row,
				});
				setData(newData);
				setEditingKey('');
			} else {
				newData.push(row);
				setData(newData);
				setEditingKey('');
			}
		} catch (errInfo) {
			console.log('Validate Failed:', errInfo);
		}
	};

		const columns = [
			{
				title: '图片',
				dataIndex: 'image',
				width: '15%',
				editable: true,
			},
			{
				title: '名称',
				dataIndex: 'name',
				width: '15%',
				editable: true,
			},
			{
				title: '描述',
				dataIndex: 'desc',
				width: '25%',
				editable: true,
			},
			{
				title: '接受地址',
				dataIndex: 'address',
				width: '15%',
				editable: true,
			},
			{
				title: '操作',
				dataIndex: 'operation',
				render: (_: any, record: Item) => {
					const editable = isEditing(record);
					return editable ? (
						<span>
            <Typography.Link onClick={() => save(record.key)} style={{marginRight: 8}}>
              保存
            </Typography.Link>
            <Typography.Link onClick={cancel}>
              取消
            </Typography.Link>
          </span>
					) : (
						<Space>
							<Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
								编辑
							</Typography.Link>
							<Typography.Link disabled={editingKey !== ''} onClick={() => remove(record)}>
								删除
							</Typography.Link>
						</Space>
					);
				},
			},
		].filter(c=>{
			switch (c.dataIndex) {
				case 'name': return !useCols.sameName;
				case 'image': return !useCols.sameImage;
				case 'desc': return !useCols.sameDesc;
				case 'address': return !useCols.sameAddress;
				default: return true;
			}
		});

		const mergedColumns = columns.map((col) => {
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: (record: Item) => ({
					record,
					inputType: col.dataIndex === 'image' ? 'file' : 'text',
					dataIndex: col.dataIndex,
					title: col.title, form,
					editing: isEditing(record),
				}),
			};
		});

	const changeRow = ()=>{
		const arr = [...data, {key: Date.now().toString(), image: '', name: '', address:'', desc:''}]
		setData(arr);
		console.log(`length`, data.length)
	}
	const batchMint = ()=>{
		console.log(`batch mint`)
	}
	return (
		<>
			<Form labelCol={{ span: 1 }}
			      wrapperCol={{ span: 16 }}>
				<Form.Item label={"选项"}
				>
				<Space>
					<Checkbox checked={useCols.sameImage} onClick={()=>setUseCols({...useCols, sameImage: !useCols.sameImage})}>图片相同</Checkbox>
					<Checkbox checked={useCols.sameName} onClick={()=>setUseCols({...useCols, sameName: !useCols.sameName})}>名字相同</Checkbox>
					<Checkbox checked={useCols.sameDesc} onClick={()=>setUseCols({...useCols, sameDesc: !useCols.sameDesc})}>描述相同</Checkbox>
					<Checkbox checked={useCols.sameAddress} onClick={()=>setUseCols({...useCols, sameAddress: !useCols.sameAddress})}>接受地址相同</Checkbox>
					<Tooltip title={"相同的字段不会出现在表格里"}><QuestionCircleOutlined /></Tooltip>
				</Space>
				</Form.Item>
			</Form>
			<MintFormFields withImage={useCols.sameImage}
			                withDesc={useCols.sameDesc}
			                withAddress={useCols.sameAddress}
			                withName={useCols.sameName}/>

			{mergedColumns.length > 1 && <>
				<Button onClick={changeRow} style={{margin: '8px'}}>+ 添加一行</Button>
				当前[{data.length}]行

				<Form form={form} component={false}>
					<Table
						components={{
							body: {
								cell: EditableCell,
							},
						}}
						bordered
						dataSource={data}
						columns={mergedColumns}
						rowClassName="editable-row"
						pagination={false}
					/>
				</Form>
			</>}
			<Row gutter={3}>
				<Col span={1}></Col>
				<Col span={1}>
					<Button htmlType={"submit"} type={"primary"} onClick={batchMint}>开始铸造</Button>
				</Col>
				<Col span={1}></Col>
			</Row>
			{JSON.stringify(data)}
		</>
	);
};

export default Test;