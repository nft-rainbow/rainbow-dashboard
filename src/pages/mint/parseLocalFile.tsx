import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { read, utils, writeFileXLSX, } from 'xlsx';

function ParseLocalFile(props:{handleData:any}) {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploading, setUploading] = useState(false);

	const handleUpload = () => {
		const formData = new FormData();
		fileList.forEach((file) => {
			formData.append('files[]', file as RcFile);
			console.log(`file`, file)
			importFile(file)
			// let wb = read(file);
			// console.log(`read `, wb)

		});
		// setUploading(true);
	};

	function importFile(f:any) {
		// var f = evt.target.files[0];

		if (f) {
			var r = new FileReader();
			r.onload = e => {
				var contents = processExcel(e.target?.result);
				console.log('file content', contents);
				console.log(JSON.stringify(contents))
				props.handleData(contents);
			}
			r.readAsArrayBuffer(f);
		} else {
			console.log("Failed to load file");
		}
	}

	function processExcel(data:any) {
		console.log(`data in file\n`, data)
		var workbook = read(data);

		var firstSheet = workbook.SheetNames[0];
		// console.log(`that is `, firstSheet, workbook)
		var json = utils.sheet_to_json(workbook.Sheets[firstSheet]);
		return json
	}

	const propsUp: UploadProps = {
		showUploadList: false,
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			setFileList([...fileList, file]);
			// console.log(`file is`, file)
			importFile(file);
			return false;
		},
		fileList,
	};

	return (
		<>
			<Upload {...propsUp} maxCount={1}>
				<Button icon={<UploadOutlined />}>导入数据</Button>
			</Upload>
		</>
	);
}

export default ParseLocalFile;