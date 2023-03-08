import React, {useEffect, useState} from "react";
import {Typography, Card, Form, FormInstance, Input, Radio, Space, Upload, Button, Image, Table, Modal} from "antd";
import {authHeaderSync, get, methodUrl} from "@services/index";
import {UploadOutlined} from "@ant-design/icons/lib";
import {CreatePlan} from "@pages/plan/CreatePlan";
import {ContractSelector} from "@pages/contracts/ContractSelector";
import {Contract} from "@models/index";
import {formatDate} from "@utils/index";
import {Link} from "react-router-dom";

const {Text} = Typography;

export function PlanList() {
	const [data, setData] = useState([] as any[])
	const [refresh, setRefresh] = useState(0)
	const [showCreate, setShowCreate] = useState(false)
	const [form] = Form.useForm()
	const [contract, setContract] = useState({id:'xxx'} as Contract);
	useEffect(() => {
		get('/dashboard/plan/list').then(res=>{
			setData(res.items);
		})
	}, [refresh])
	const cols = [
		{title: 'ID', dataIndex: 'id'},
		{title: '名称', dataIndex: 'name'},
		{title: '创建时间', dataIndex: 'created_at', render:formatDate},
		{title: '...', dataIndex: 'created_at', render:(_,row)=>{
			return (
				<Space>
					<Link to={`/panels/plan/${row.id}`}>详情</Link>
				</Space>
			)
			}},
	]
	return (
		<Space direction={"vertical"}>
			<Space>
				<Button type={"dashed"} onClick={()=>setRefresh(refresh+1)}>刷新</Button>
				<ContractSelector receiveContract={setContract}/>
				<Button type={"primary"} onClick={()=>setShowCreate(true)}>[{contract.id}]新建</Button>
			</Space>
			<Table columns={cols} dataSource={data} rowKey={"id"}/>
			<CreatePlan showCreate={showCreate} contract={contract} setShow={setShowCreate} form={form} refresh={()=>setRefresh(refresh+1)}/>
		</Space>
	)
}