import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Form } from 'antd';
import { listContracts } from '@services/contract';
import { updatePoap as _updatePoap, getActivityById } from '@services/activity';
import { assetsFormFormat } from '@utils/assetsFormHelper';
import { Contract } from '@models/index';
import useInTransaction from '@hooks/useInTransaction';
import dayjs from 'dayjs';

const useManageAssets = (type: 'single' | 'blind', nftItemId?: string) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form] = Form.useForm();
  const { activityId } = useParams<{ activityId: string }>();
  const { inTransaction, execTranscation: updatePoap } = useInTransaction(_updatePoap);
  const { data, mutate } = useSWR(`api/apps/poap/activity/${activityId}`, () => getActivityById(activityId));
  const isContractEditable = useMemo(() => !data?.contract_address || !contracts?.find((contract) => contract?.address === data?.contract_address), [data, contracts]);

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

      const newDate = assetsFormFormat({
        contract_id,
        nftConfig,
        data,
        nftItemId,
        type,
      });
      try {
        await updatePoap(newDate);
        await mutate();
        // navigate('/panels/poaps');
      } catch (err) {
        console.log(err);
      }
    },
    [data, activityId, type, nftItemId]
  );

  useEffect(() => {
    listContracts().then((res) => {
      let tempContracts: Contract[] = [];
      res.items.map((e: Contract) => {
        if (e.type === 1) tempContracts.push(e);
      });
      setContracts(tempContracts);
    });
  }, []);

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
      characters:
        nftConfig?.metadata_attributes?.map((attribute) => ({
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
