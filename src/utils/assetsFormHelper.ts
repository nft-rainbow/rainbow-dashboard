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
    if (!characters.value) return;
    metadata_attributes.push({ attribute_name: characters.characterName, trait_type: characters.type, value: characters.value.toString() });
  });
  return {
    activity_id,
    image_url,
    name,
    contract_id,
    metadata_attributes,
  };
};
