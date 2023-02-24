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
	Typography, Image, message,
} from 'antd';
import MintFormFields from "./mintFormFields";
import FileUpload from "../../components/FileUpload";
import {PictureOutlined, QuestionCircleOutlined, QuestionOutlined} from "@ant-design/icons/lib";
import ImportImages from "./ImportImages";
import UploadDir from "./uploadDirectory";
import DragUpload from "./dragUpload";
import ParseLocalFile from "./parseLocalFile";

interface Item {
	key: string;
	file_url: string;
	name: string;
	desc: string;
	address: string;
}

const originData: Item[] = [];

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
	const url = ()=> form?.getFieldValue(dataIndex);
	const [trigger, setTrigger] = useState(0)
	const cbUrl = useCallback(url, [trigger])
	const inputNode = inputType === 'file' ?
		<>
			{(cbUrl()) && <Image src={cbUrl()}/>}
			<FileUpload accept={".png,.jpg,.svg,.mp3,.mp4,.gif,stp,.max,.fbx,.obj,.x3d,.vrml,.3ds,3mf,.stl,.dae"}
			            maxCounat={1}
				onChange={(err: Error, file: any) => {
					if (err) {
						message.error(`上传图片出错: ${err}`);
						return;
					}
				console.log(`set file : `, dataIndex, file.url);
				form.setFieldsValue({ [dataIndex]: file.url })
				setTrigger(trigger+1)
			}} />
		</>
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

const MintTable: React.FC = () => {
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
			const newInput = (await form.validateFields()) as Item;

			const newData = [...data];
			const index = newData.findIndex((item) => key === item.key);
			if (index > -1) {
				const oldRow = newData[index];
				newData.splice(index, 1, {
					...oldRow,
					...newInput,
				});
				setData(newData);
				setEditingKey('');
			} else {
				newData.push(newInput);
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
				dataIndex: 'file_url',
				width: '15%',
				editable: true,
				render: (url:string)=>{
					return url ? <Image alt={url} src={url}/> : ''
				}
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
				editable: true,
			},
			{
				title: '操作',
				width: '15%',
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
				case 'file_url': return !useCols.sameImage;
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
					inputType: col.dataIndex === 'file_url' ? 'file' : 'text',
					dataIndex: col.dataIndex,
					title: col.title, form,
					editing: isEditing(record),
				}),
			};
		});
	useEffect(()=>{
		console.log(`data length`, data.length)
	}, [data])
	const addRow = (url='', name='')=>{
		let newElement = {key: Date.now().toString(), file_url: url, name, address:'', desc:''};
		setData(preArr=>[...preArr, newElement]);
	}
	const handleImportData = (arr:any[]) => {
		const map = {"图片链接":"file_url","名字":"name","描述":"desc","接受地址":"address"};
		const newArr = arr.map((row, idx)=>{
			const item = {key: `${idx}`};
			Object.keys(map).forEach(k=>{
				//@ts-ignore
				item[map[k]] = row[k];
			})
			return item;
		})
		console.log(`converted`, newArr)
		setData(newArr as Item[]);
	}
	const batchMint = ()=>{
		console.log(`batch mint`)
	}
	return (
		<>
			<Form labelCol={{ span: 1 }}
			      wrapperCol={{ span: 16 }}>
				<Form.Item label={"选项"}>
				<Space>
					{/*ugly code here :( */}
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
				<Space>
					<Button onClick={()=>addRow()} style={{margin: '8px'}}>+ 添加一行</Button>
					当前[{data.length}]行
					<ParseLocalFile handleData={handleImportData}/>
					<Button type={"link"}><a href={"/mint_template.xlsx"} style={{color: "gray"}}>下载模板</a></Button>
					<DragUpload onSuccess={({url}: { url: string }, name: string) => addRow(url, name)}/>
				</Space>

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
			{/*<Row gutter={3}>*/}
			{/*	<Col span={1}></Col>*/}
			{/*	<Col span={1}>*/}
					<Button style={{marginTop:'8px'}} htmlType={"submit"} type={"primary"} onClick={()=>{
						message.info(`尚未接入后端接口`)
					}}>开始铸造</Button>
			{/*	</Col>*/}
			{/*	<Col span={1}></Col>*/}
			{/*</Row>*/}
			{/*{JSON.stringify(data)}*/}
		</>
	);
};

export default MintTable;