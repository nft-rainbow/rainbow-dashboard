import { Upload, Button } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { methodUrl, authHeaderSync } from '../services';

export default function FileUpload(props: any) {
  const action = props.private ? methodUrl('/dashboard/misc/upload/kyc') : methodUrl('/dashboard/misc/upload');
  const uploadProps = {
    name: 'file',
    action,
    headers: authHeaderSync(),
    onChange(info: any) {
      if (info.file.status === 'done') {
        const data = info.file.response;
        props.onChange(null, data);
      } else if (info.file.status === 'error') {
        props.onChange(new Error('Upload failed.'));
      }
    },
  };
  return (
    <Upload {...uploadProps} className={props.wrapperClass ?? ''}>
      <Button className={props.className ?? ''} icon={!!props.type && props.type == 'plus' ? <PlusOutlined /> : <UploadOutlined />}>
        {!!props.type && props.type == 'plus' ? '' : '上传'}
      </Button>
    </Upload>
  );
}
