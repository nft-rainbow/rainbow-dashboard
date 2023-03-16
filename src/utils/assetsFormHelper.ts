import { AssetItem } from '@models/index';
interface Character {
  type: 'text' | 'date';
  characterName: string;
  value?: string | Date;
}
export interface MetadataAttribute {
  attribute_name: string;
  trait_type: string;
  value: string;
}

export interface PoapActivityConfig {
  activity_id: string;
  metadata_attributes: MetadataAttribute[];
}

interface NftConfig {
  id?: string;
  image_url: string;
  name: string;
  characters: Character[];
}

export const assetsFormFormat = ({
  data,
  contract_id,
  nftItemId,
  type,
  nftConfig,
}: {
  nftConfig: NftConfig;
  data: any;
  contract_id: number;
  nftItemId?: string;
  type: 'single' | 'blind';
}) => {
  const nft_configs = data?.nft_configs ?? [];

  if (nftConfig) {
    const targetNftItem = (type === 'single' ? nft_configs?.[0] : nft_configs.find((item: any) => item.id === nftItemId)) ?? { probability: 0 };
    if (targetNftItem) {
      const { characters, image_url, name } = nftConfig;
      let metadata_attributes: MetadataAttribute[] = targetNftItem?.metadata_attributes ?? [];
      metadata_attributes.forEach((attribute) => {
        const targetCharacter = characters.find((character) => character?.id === attribute?.id);
        if (targetCharacter) {
          attribute.value = targetCharacter.value?.toString() ?? '';
        }
      });
      characters.forEach((character) => {
        const isCharacterNew = !metadata_attributes.find((attribute) => attribute?.id === character?.id);
        if (isCharacterNew) {
          metadata_attributes.push({ attribute_name: character.characterName, trait_type: character.type, value: character.value?.toString() ?? '' });
        }
      });

      metadata_attributes = metadata_attributes.filter((attribute) => !!attribute?.value);
      Object.assign(targetNftItem, {
        name,
        image_url,
        metadata_attributes,
      });
      
      if ((type === 'blind' && !nftItemId) || (type === 'single' && !nft_configs?.[0])) {
        nft_configs.push(targetNftItem);
      }
    }
  }

  return {
    ...data,
    contract_id: contract_id ?? data?.contract_id,
    nft_configs,
  };
};

export interface BlindFormData {
  contract_id: number;
  weights: {
    [key: string]: string;
  };
}
export interface NftConfigs {
  image_url?: string;
  metadata_attributes: MetadataAttribute[];
  name: string;
  probability: number;
}
