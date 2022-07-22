import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { methodUrl, authHeaderSync } from '../services';

export default function FileUpload(props: any) {
  const uploadProps = {
    name: 'file',
    action: methodUrl("/dashboard/misc/upload"),
    headers: authHeaderSync(),
    onChange(info: any) {
      if (info.file.status === 'done') {
        const { data } = info.file.response;
        props.onChange(null, data);
      } else if (info.file.status === 'error') {
        props.onChange(new Error('Upload failed.'));
      }
    },
  };
  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />}>上传</Button>
    </Upload>
  )
}