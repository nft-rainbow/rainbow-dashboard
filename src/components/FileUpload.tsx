import { Upload, Button } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { methodUrl, authHeaderSync } from '../services';
import PictureReminder from '@components/PictureReminder';

export default function FileUpload(props: any) {
  const action = props.private ? methodUrl('/dashboard/misc/upload/kyc') : methodUrl('/dashboard/misc/upload');
  const {accept, maxCount, showUploadList, listType} = props;
  const uploadProps = {
    name: 'file',
    accept, 
    maxCount, 
    showUploadList, 
    listType,
    action,
    headers: authHeaderSync(),
    onChange(info: any) {
      if (info.file.status === 'done') {
        const data = info.file.response;
        props.onChange(null, data);
      } else if (info.file.status === 'error') {
        props.onChange(new Error(`Upload failed. ${info.file.error}`));
      }
    },
  };
  return (
    <Upload {...uploadProps} className={props.wrapperClass ?? ''}>
      <Button className={props.className ?? ''} icon={!!props.type && props.type === 'plus' ? <PlusOutlined /> : <UploadOutlined />}>
        {!!props.type && props.type === 'plus' ? '' : '上传'}
      </Button>
      {!!props.type && props.type === 'plus' && <PictureReminder />}
    </Upload>
  );
}
