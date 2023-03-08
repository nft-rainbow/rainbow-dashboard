import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import {authHeaderSync} from "../../services";

const UploadDir: React.FC = () => (
	<Upload action="/dashboard/misc/upload" headers={authHeaderSync()} directory>
		<Button icon={<UploadOutlined />}>Upload Directory</Button>
	</Upload>
);

export default UploadDir;