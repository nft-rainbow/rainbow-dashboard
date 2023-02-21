import {Button, Checkbox, Col, Form, Input, InputNumber, Layout, Popconfirm, Row, Table, Tabs, TabsProps, Typography} from "antd";
import {Content} from "antd/es/layout/layout";
import React, {useCallback, useState} from "react";

export default function MintManual() {
	// prop:{contract:string, name:string, symbol:string}
	const tmpCols = [
		{			title: '行', dataIndex: 'key', key:'key',    editable: true,		},
		{			title: '图片', dataIndex: 'image',			key: 'image',	editable: true,	},
		{			title: '名字',			dataIndex: 'name',			key: 'name',	editable: true,	},
		{			title: '描述',			dataIndex: 'desc',			key: 'desc',	editable: true,	},
		{
			title: 'operation',
			dataIndex: 'operation',
			render: (_: any, record: Item) => {
				const editable = isEditing(record);
				return editable ? (
					<span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
				) : (
					<Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
						Edit
					</Typography.Link>
				);
			},
		},
	]
	const tmpData = [{key: '0', image: '', name: '', desc:''}];
	const [data, setData] = useState(tmpData);
	const changeRow = ()=>{
		const arr = [...data, {key: Date.now().toString(), image: '', name: '', desc:''}]
		setData(arr);
		console.log(`length`, data.length)
	}

	interface Item {
		key: string;
		name: string;
		image: string;
		desc: string;
	}
	interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
		editing: boolean;
		dataIndex: string;
		title: any;
		inputType: 'number' | 'text';
		record: Item;
		index: number;
		children: React.ReactNode;
	}

	const EditableCell: React.FC<EditableCellProps> = ({
		                                                   editing,
		                                                   dataIndex,
		                                                   title,
		                                                   inputType,
		                                                   record,
		                                                   index,
		                                                   children,
		                                                   ...restProps
	                                                   }) => {
		const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

		return (
			<td {...restProps}>
				{editing ? (
					<Form.Item
						name={dataIndex}
						style={{ margin: 0 }}
						rules={[
							{
								required: true,
								message: `Please Input ${title}!`,
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
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState('');

	const isEditing = (record: Item) => record.key === editingKey;

	const edit = (record: Partial<Item> & { key: React.Key }) => {
		form.setFieldsValue({ name: '', age: '', address: '', ...record });
		setEditingKey(record.key);
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

	const mergedColumns = tmpCols.map((col) => {
		if (!col.editable) {
			return col;
		}
		return {
			...col,
			onCell: (record: Item) => ({
				record,
				inputType: col.dataIndex === 'age' ? 'number' : 'text',
				dataIndex: col.dataIndex,
				title: col.title,
				editing: isEditing(record),
			}),
		};
	});
	const [cols, setCols] = useState(mergedColumns);

	return (
		<>
			<Row>
				<Col>元数据选项</Col>
				<Col><Checkbox>图片相同</Checkbox></Col>
				<Col><Checkbox>名字相同</Checkbox></Col>
				<Col><Checkbox>描述相同</Checkbox></Col>
				<Col><Checkbox>接受人相同</Checkbox></Col>
				<Col><Checkbox>没有描述</Checkbox></Col>
			</Row>
			[{data.length}]
			<Button onClick={changeRow}>添加一行</Button>
			<Form form={form} component={false}>
				<Table columns={cols} dataSource={data} >
				</Table>
			</Form>
		</>
	)
}