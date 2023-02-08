export function mapChainName(chainType: number) {
  switch (chainType) {
    case 1:
      return '树图链';
    case 2:
      return 'Ethereum';
    default:
      return '其他';
  }
}

export function mapAppType(appType: number) {
  switch (appType) {
    case 1:
      return '数藏';
    case 2:
      return 'POAP';
    default:
      return '数藏';
  }
}

export function mapFiatLogType(type: number) {
  switch (type) {
    case 1:
      return '充值';
    case 2:
      return '提现';
    case 3:
      return '燃气费用';
    case 4:
      return '存储费用';
    case 5:
      return 'API费用';
    default:
      return '其他';
  }
}

export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return `${date.getFullYear()}-${padLeftZero(date.getMonth() + 1)}-${padLeftZero(date.getDate())} ${padLeftZero(date.getHours())}:${padLeftZero(date.getMinutes())}:${padLeftZero(
    date.getSeconds()
  )}`;
}

function padLeftZero(num: number) {
  return num < 10 ? '0' + num : num;
}

export function short(toShort: string) {
  if (toShort.length > 10) {
    return toShort.substring(0, 5) + '...' + toShort.substring(toShort.length - 5);
  }
  return toShort;
}

export function scanTxLink(chainType: number, chainId: number, txHash: string) {
  return `${scanHostFromChainId(chainId)}/transaction/${txHash}`;
}

export function scanNFTLink(chainType: number, chainId: number, contract: string, tokenId: number) {
  return `${scanHostFromChainId(chainId)}/nft/${contract}/${tokenId}`;
}

export function scanAddressLink(chainType: number, chainId: number, address: string) {
  return `${scanHostFromChainId(chainId)}/address/${address}`;
}

// Only support Conflux mainnet and testnet
function scanHostFromChainId(chainId: number) {
  switch (chainId) {
    case 1:
      return 'https://testnet.confluxscan.net';
    case 1029:
      return 'https://confluxscan.net';
    default:
      return '#';
  }
}

export function mapSimpleStatus(status: number) {
  switch (status) {
    case 0:
      return '待处理';
    case 1:
      return '成功';
    case 2:
      return '失败';
    default:
      return '未知';
  }
}

export function mapNFTType(type: number) {
  switch (type) {
    case 1:
      return 'ERC721';
    case 2:
      return 'ERC1155';
    default:
      return '未知';
  }
}

export function mapChainNetwork(chainId: number) {
  switch (chainId) {
    case 1029:
      return 'conflux';
    case 1:
      return 'conflux_test';
    default:
      return '';
  }
}

export function mapChainNetworId(chainName: string) {
  switch (chainName) {
    case 'conflux':
      return 1029;
    case 'conflux_test':
      return 1;
    default:
      return 0;
  }
}

export const chainTypeToName = (chainType: number) => {
  switch (chainType) {
    case 1:
      return '树图测试链';
    case 1029:
      return '树图链';
    default:
      return '其他';
  }
};

export const timestampToDay = (timestamp: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${padLeftZero(date.getMonth() + 1)}-${padLeftZero(date.getDate())}`;
};

export const timestampToSecond = (timestamp: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${padLeftZero(date.getMonth() + 1)}-${padLeftZero(date.getDate())} ${padLeftZero(date.getHours())}:${padLeftZero(date.getMinutes())}:${padLeftZero(
    date.getSeconds()
  )}`;
};
