import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Form, message } from 'antd';
import { listContracts } from '@services/contract';
import { updateActivity as _updateActivity, getActivityById, setActivityNftConfigs } from '@services/activity';
import { assetsFormFormat } from '@utils/assetsFormHelper';
import { Contract } from '@models/index';
import useInTransaction from '@hooks/useInTransaction';
import dayjs from 'dayjs';

const useManageAssets = (type: 'single' | 'blind', nftItemId?: string) => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [form] = Form.useForm();
    const { activityId } = useParams<{ activityId: string }>();
    const { inTransaction, execTransaction: updateActivity } = useInTransaction(_updateActivity);
    const { data, mutate } = useSWR(`api/apps/poap/activity/${activityId}`, () => getActivityById(activityId));

    const isContractEditable = useMemo(
        () => !data?.contract?.contract_address || !contracts?.find((contract) => contract?.address === data?.contract?.contract_address), 
        [data, contracts]
    );

    const handleFinish = useCallback(
        async (formData: any) => {
            if (typeof formData !== 'object') return;
            if (!!formData?.file) {
                formData.image_url = formData?.file?.[0]?.response?.url ?? formData?.file?.[0]?.url ?? '';
                delete formData.file;
            }
            const contract_id = formData.contract_id;
            delete formData.contract_id;
            const nftConfig = { ...formData };

            const newData = assetsFormFormat({
                contract_id,
                nftConfig,
                data,
                nftItemId,
                type,
            });
            
            try {
                await updateActivity(newData);
                await setActivityNftConfigs(newData.activity_id, newData.nft_configs);
                await mutate();
                message.success('保存更新成功');
                // navigate('/panels/poaps');
            } catch (err) {
                console.log(err);
            }
        },
        [data, activityId, type, nftItemId]
    );

    useEffect(() => {
        if (!data) return;
        listContracts(1, 1000, {status: 1, app_id: data?.app_id}).then((res) => {
            let tempContracts: Contract[] = [];
            res.items.map((e: Contract) => {
                if (e.type === 1) tempContracts.push(e); // only support erc721 contracts?
            });
            setContracts(tempContracts);
        });
    }, [data]);

    useEffect(() => {
        const nftConfig = type === 'blind' ? data?.nft_configs?.find((item: any) => item.id === nftItemId) : data?.nft_configs?.[0];
        if (!nftConfig) {
            if (data) {
                form.setFieldsValue({
                    contract_id: data.contract_id ?? '',
                });
            }
            return;
        }

        form.setFieldsValue({
            name: nftConfig?.name ?? '',
            contract_id: data.contract_id ?? '',
            characters: nftConfig?.metadata_attributes?.map((attribute) => ({
                display_type: attribute?.display_type,
                trait_type: attribute?.trait_type,
                value: attribute?.display_type === 'date' ? dayjs(attribute?.value) : attribute?.value,
                id: attribute?.id,
            })) ?? [],
            file: [
                {
                    uid: '1',
                    name: '已上传图片',
                    status: 'done',
                    url: nftConfig?.image_url ?? '',
                },
            ],
        });
    }, [data, type, nftItemId, contracts]);

    return {
        form,
        contracts,
        inTransaction,
        handleFinish,
        isContractEditable,
    };
};

export default useManageAssets;
