export const PopoverContent = (
    <div className="w-296px">
        开启后，只允许导入的地址进行铸造，并且只允许铸造一定数量的藏品，例如地址为A,B,C，填写数量为1,2,3，则意味着A允许铸造1个藏品，B铸造2个，C铸造3个。注意使用英文逗号分隔。关闭即开放给所有地址进行铸造。
    </div>
);

export const ModalStyle = {
    width: '500px',
    style: { top: '0px', paddingBottom: '0px' },
    wrapClassName: 'flex items-center',
    bodyStyle: { paddingTop: '16px' },
};

export const ExistRelationForbidden = () => <div className="text-#ff4d4f mb-8px ">公开铸造上线不可小于发行数量</div>;

export const DEFAULT_WALLETS = ['anyweb', 'cellar'];