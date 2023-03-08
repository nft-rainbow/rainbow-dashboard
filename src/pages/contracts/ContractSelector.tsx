import React, {useCallback, useEffect, useState} from "react";
import {Typography, Card, Form, FormInstance, Input, Radio, Space, Upload, Button, Image, Select} from "antd";
import {authHeaderSync, get, methodUrl} from "@services/index";
import {UploadOutlined} from "@ant-design/icons/lib";
import {ContractFilter, listContracts} from "@services/contract";
import {Contract} from "@models/index";
const {Text} = Typography;
export function ContractSelector({receiveContract}:{receiveContract:(contract:Contract)=>void}) {
	const [data, setData] = useState([] as any[])
	const [v, setV] = useState('')
	useEffect(() => {
		const filter: ContractFilter = {};
		listContracts(1, 10000, filter).then((res) => {
			setData(res.items);
			let newId = res.items.length ? res.items[0].id.toString() : '';
			setV(newId)
		});
	}, [])
	useEffect(()=>{
		const c = data.filter(row=>row.id.toString()==v)[0] || {id:0,name:'NoContract'};
		console.log(`select contract`, c)
		receiveContract(c as Contract);
	}, [data, v]);
	return (
		<>
			<Select
			        style={{minWidth:'200px'}}
				value={v}
			        onChange={(v)=>{
				        setV(v)
			        }}
			        options={data.map(c=>{
			        	return {value: `${c.id}`, label: `ID ${c.id} ${c.name}`}
			        })}
			>
			</Select>
		</>
	)
}