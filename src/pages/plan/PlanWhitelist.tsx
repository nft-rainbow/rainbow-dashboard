import React, {useState} from "react";
import {Typography, Card, Form, FormInstance, Input, Radio, Space, Upload, Button, Image, Table} from "antd";
import ParseLocalFile from "@pages/mint/parseLocalFile";
import {utils, writeFileXLSX} from "xlsx";

const {Text, Link} = Typography;

export function PlanWhitelist() {
	const maxRows = 10;
	const [data, setData] = useState([] as any[])
	const [fullData, setFullData] = useState([] as any[])
	const [exporting, setExporting] = useState(false);
	const doImport = (arr: any[]) => {
		setFullData(arr);
		arr.forEach((row, idx)=>row.key = idx)
		setData(arr.slice(0, maxRows));
	}
	const exportFullData = ()=>{
		if (exporting) {
			return
		}
		console.log(`exporting`, new Date())
		setExporting(true);
		(async function() {
			const rows = [["地址", "允许铸造个数"]];
			fullData.forEach(row=>{
				rows.push(rows[0].map(k=>row[k]));
			})
			const ws = utils.aoa_to_sheet(rows)
			// const ws = utils.json_to_sheet(exportArr);
			const wb = utils.book_new();
			const dt = new Date();
			utils.book_append_sheet(wb, ws, "白名单");
			writeFileXLSX(wb, `whitelist_${dt.getMonth()+1}_${dt.getDate()}.xlsx`);
			setExporting(false)
			console.log(`exported`, new Date())
		})()
	}
	const downloadTemplate = () => {
		const ws = utils.aoa_to_sheet([["地址", "允许铸造个数"], ["0x0011", 5]])
		// const ws = utils.json_to_sheet(exportArr);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "白名单");
		writeFileXLSX(wb, `whitelist_template.xlsx`);
	}
	const cols = [
		{title: '地址', dataIndex: '地址'},
		{title: '允许铸造个数', dataIndex: '允许铸造个数'},
	]
	return (
		<Space direction={'vertical'}>
			<Space>
				<Text>白名单</Text>
				<ParseLocalFile handleData={doImport}/>
				<Link onClick={downloadTemplate}>下载模板</Link>
			</Space>
			<Space>
				<span>共{fullData.length}条，仅展示{Math.min(data.length, maxRows)}条，</span>
				<Link onClick={exportFullData}>{exporting ? "正在生成数据" : "下载全部数据"}</Link>
			</Space>
			<Table columns={cols} dataSource={data} pagination={false}/>
		</Space>
	)
}