export interface contract {
  address: string;
  app_id: number;
  base_uri: string;
  chain_id: number;
  chain_type: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  hash: string;
  id: number;
  name: string;
  type: number;
  owner_address: string;
  royalties_address: string;
  status: number;
  symbol: string;
  tokens_burnable: true;
  tokens_transferable_by_admin: true;
  tokens_transferable_by_user: true;
  transfer_cooldown_time: number;
  tx_id: number;
}

export const PopoverContent = (
    <div>
      开启后，只允许导入的地址进行铸造，并且只允许铸造一定数量的藏品，例如地址为A,B,C，填写数量为1,2,3，则意味着A允许铸造1个藏品，B铸造2个，C铸造3个。注意使用英文逗号分隔。关闭即开放给所有地址进行铸造。
    </div>
  );