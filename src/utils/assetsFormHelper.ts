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

export interface AssetsFormHelper {
  image_url: string;
  name: string;
  contract_id: string;
  characters: Character[];
}

export const assetsFormFormat = (data: AssetsFormHelper, activity_id: string) => {
  const { characters, image_url, name, contract_id } = data;
  let metadata_attributes: MetadataAttribute[] = [];
  characters.forEach((characters) => {
    if (characters.value) {
      metadata_attributes.push({ attribute_name: characters.characterName, trait_type: characters.type, value: characters.value.toString() });
    }
  });
  return {
    activity_id,
    contract_id,
    nft_configs: [
      {
        name,
        image_url,
        metadata_attributes,
      },
    ],
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
export const assetsBlindFormat = (formData: BlindFormData, assetsData: AssetItem[], activity_id?: string) => {
  const { contract_id, weights } = formData;
  let nft_configs: NftConfigs[] = [];
  assetsData.forEach((e) => {
    let metadata_attributes: MetadataAttribute[] = [];
    e.characters?.forEach((characters) => {
      if (characters.value) {
        metadata_attributes.push({ attribute_name: characters.characterName, trait_type: characters.type, value: characters.value.toString() });
      }
    });
    nft_configs.push({
      metadata_attributes: [...metadata_attributes],
      image_url: e.image_url,
      name: e.name,
      probability: parseInt(formData.weights[e.key]),
    });
  });
  return {
    activity_id,
    contract_id,
    nft_configs: [...nft_configs],
  };
};
