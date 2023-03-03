import React, {useEffect, useState} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {message, Space, Tooltip, Upload} from 'antd';
import {authHeaderSync, methodUrl} from "../../services";
import CompoundedSpace from "antd/es/space";
import {PictureOutlined} from "@ant-design/icons/lib";
import SliderTooltip from "antd/es/slider/SliderTooltip";

const { Dragger } = Upload;



function DragUpload(props:{onSuccess:any}) {
	const [count, setCount] = useState(0);
	const [countAll, setCountAll] = useState(0);
	const [showList, setShowList] = useState(false);
	useEffect(()=>{
		setShowList(countAll>count)
	},[countAll, count])
	const propsInner: UploadProps = {
		name: 'file',
		multiple: true,
		headers: authHeaderSync(),
		action: methodUrl('/dashboard/misc/upload'),
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	};
	const onChange = (info:any)=>{
		const { status } = info.file;
		console.log('info is ', info)
		setCountAll(info.fileList.length);
		if (status !== 'uploading') {
			console.log('status ', status, info.file.name);
		}
		if (status === 'done') {
			console.log(`${info.file.name} file uploaded successfully. `, info.file.response);
			props.onSuccess(info.file.response, info.file.name)
			setCount(pre=>pre+1)
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
		}
	}
	return <Dragger {...propsInner} onChange={onChange} showUploadList={showList} style={{margin: 0}}>
		<div style={{marginLeft: '8px', marginRight: '8px'}}>
			<Tooltip title={"点击或拖拽文件至此区域即可导入"}><PictureOutlined/>导入图片 {count}/{countAll}</Tooltip>
		</div>
	</Dragger>
}

export default DragUpload;