import {Button, Form, FormInstance, Input, Modal} from "antd";
import React, {useEffect, useState} from "react";
import {post} from "@services/index";
import {Contract} from "@models/index";
import {formatDate} from "@utils/index";

export function CreatePlan({showCreate, setShow, form, refresh, contract}:
	                           {
		                           showCreate: boolean, setShow: (boolean) => void,
		                           refresh: () => void,
		                           form: FormInstance,
		                           contract: Contract,
	                           }) {
	const [loading, setLoading] = useState(false)
	const create = () => {
		const {name} = form.getFieldsValue()
		if (!name) {
			return
		}
		setLoading(true);
		let data = {name, contract_id: contract.id, app_id: contract.app_id, blind_status: 'close'};
		post(`/dashboard/plan/create`, data).then(res => {
			setShow(false)
			refresh();
		}).finally(() => {
				setLoading(false)
			}
		)
	}
	useEffect(()=>{
		const dt = new Date();
		let name = `新计划_${formatDate(dt)}`
		form.setFieldValue("name",name)
	},[showCreate])
	return (
		<Modal title={"新建计划"} open={showCreate} onCancel={() => setShow(false)} footer={[
			<Button key={"btn1"} loading={loading}
			        onClick={create} type={"primary"} htmlType={"submit"}>创建</Button>
		]}>
			<Form form={form}>
				<Form.Item label={"合约ID"}>
					{contract.id}
				</Form.Item>
				<Form.Item label={"合约名称"}>
					{contract.name}
				</Form.Item>
				<Form.Item label={"计划名称"} name={"name"}>
					<Input/>
				</Form.Item>
			</Form>
		</Modal>
	)
}