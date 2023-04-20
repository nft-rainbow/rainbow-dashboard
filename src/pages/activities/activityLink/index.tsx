import { Modal, QRCode } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import { ActivityItem } from '@models/index';
import isProduction from '@utils/isProduction';

const rainbowAppLink = isProduction ? 'https://apps.nftrainbow.cn' : 'http://devapps.nftrainbow.cn';

interface ActivityLinkModalProps {
    open: boolean;
    onCancel: () => void;
    activity: ActivityItem;
}

const ActivityLinkModalContent: React.FC<{ activity: ActivityItem }> = ({ activity }) => {
    return (
        <div className="flex flex-col items-center font-medium">
            <div className="mt-[24px] mb-[8px] text-[20px] leading-[28px]">{activity.name}</div>
            <QRCode value={`${rainbowAppLink}/?activity_id=${activity.activity_id}`} className="mb-[8px]" size={248} />
            <div className="text-[14px] leading-[22px] text-[#9B99A5]">
                <a href={`rainbowAppLink}/?activity_id={activity.activity_id`} target='_blank' rel={'noreferrer'}>
                    {rainbowAppLink}/?activity_id={activity.activity_id}
                </a>
            </div>
        </div>
    );
};

const ActivityLinkModal: React.FC<ActivityLinkModalProps> = ({ open, onCancel, activity }) => {
    return (
        <Modal title="活动链接" open={open} onCancel={onCancel} footer={null} width="30.5%" className="!min-w-[440px]" wrapClassName="flex items-center" style={{ top: '0px' }}>
            <ErrorBoundary fallbackRender={() => <ErrorBoundaryFallback />}>
                <ActivityLinkModalContent activity={activity} />
            </ErrorBoundary>
        </Modal>
  );
};

const ErrorBoundaryFallback: React.FC = () => {
    return <div>活动数据读取失败，请刷新页面重试</div>;
};

export default ActivityLinkModal;
