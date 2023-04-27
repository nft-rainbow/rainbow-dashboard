import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { read, utils } from 'xlsx';

function ParseLocalFile(props: {handleData: any}) {
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	// const [uploading, setUploading] = useState(false);

	/* const handleUpload = () => {
		const formData = new FormData();
		fileList.forEach((file) => {
			formData.append('files[]', file as RcFile);
			importFile(file)
			// let wb = read(file);

		});
		// setUploading(true);
	}; */

	function importFile(f: any) {
		if (f) {
			const isText = f.name.endsWith(".txt") || f.name.endsWith(".json")
			let r = new FileReader();
			if (isText) {
				r.onload = e => {
					props.handleData(e.target?.result);
				}
				r.readAsText(f)
				return
			}
			r.onload = e => {
				let contents = processExcel(e.target?.result);
				props.handleData(contents);
			};
			r.readAsArrayBuffer(f);
		} else {
			console.log("Failed to load file");
		}
	}

	function processExcel(data: any) {
		let workbook = read(data);
		let firstSheetName = workbook.SheetNames[0];
		let sheet = workbook.Sheets[firstSheetName];
		let json = utils.sheet_to_json(sheet);
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
			importFile(file);
			return false;
		},
		fileList,
	};

	return (
		<>
			<Upload {...propsUp} maxCount={1}>
				<Button icon={<UploadOutlined />}>上传数据</Button>
			</Upload>
		</>
	);
}

export default ParseLocalFile;