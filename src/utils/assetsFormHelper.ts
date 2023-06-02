import { AssetItem } from '@models/index';
import _ from 'lodash';
interface Character {
    id?: string;
    display_type: 'text' | 'date';
    character: string;
    value?: string | Date;
}
export interface MetadataAttribute {
    id?: string;
    display_type: 'text' | 'date';
    trait_type: string;
    value?: string | Date;
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
            let { characters, image_url, name } = nftConfig;
            characters = _.uniqBy(characters, 'trait_type');

            let metadata_attributes: MetadataAttribute[] = targetNftItem?.metadata_attributes ?? [];
            
            // update characters
            metadata_attributes.forEach((attribute) => {
                const targetCharacter = characters.find((character) => character?.trait_type === attribute?.trait_type);
                if (targetCharacter) {
                    attribute.value = targetCharacter.value?.toString() ?? '';
                }
            });

            // add new characters
            characters.forEach((character) => {
                const isCharacterNew = !metadata_attributes.find((attribute) => attribute?.trait_type === character?.trait_type);
                if (isCharacterNew) {
                    // @ts-ignore
                    metadata_attributes.push({
                        trait_type: character.trait_type,
                        value: character.value?.toString() ?? '',
                        ...(character.display_type ? { display_type: character.display_type } : {}),
                    });
                }
            });

            metadata_attributes = metadata_attributes.filter((attribute) => !!attribute?.value && !!attribute?.trait_type);

            // filter removed characters
            metadata_attributes = metadata_attributes.filter((attribute) => characters.find((character) => character?.trait_type === attribute?.trait_type));

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
