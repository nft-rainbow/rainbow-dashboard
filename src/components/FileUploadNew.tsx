import { useCallback, type ComponentProps } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { methodUrl, authHeaderSync } from '../services';
import PictureReminder from '@components/PictureReminder';

interface FileUploadProps extends Omit<ComponentProps<typeof Upload>, 'type'> {
  isPrivate?: boolean;
  wrapperClass?: string;
  type?: 'plus' | string;
}

const FileUpload = ({ isPrivate, type, wrapperClass, className, name = 'file', headers = authHeaderSync(), ...uploadProps }: FileUploadProps) => {
  return (
    <Upload {...uploadProps} action={isPrivate ? methodUrl('/dashboard/misc/upload/kyc') : methodUrl('/dashboard/misc/upload')} headers={authHeaderSync()} className={wrapperClass} onPreview={file=>null}>
      <Button className={className} icon={!!type && type === 'plus' ? <PlusOutlined /> : <UploadOutlined />}>
        {!!type && type === 'plus' ? '' : '上传'}
      </Button>
      {!!type && type === 'plus' && <PictureReminder />}
    </Upload>
  );
};

export default FileUpload;
