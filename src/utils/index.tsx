import dayjs from 'dayjs';
export function mapChainName(chainType: number) {
  switch (chainType) {
    case 1:
      return 'Conflux';
    case 2:
      return 'Ethereum';
    default:
      return 'Other';
  }
}

export function mapChainAndNetworkName(chainType: number, chainId: number) {
  switch (chainType) {
    case 1:
      return chainId === 1029 ? 'conflux' : 'conflux_test';
    case 2:
      return 'Ethereum';
    default:
      return 'Other';
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
      return '购买燃气';
    case 4:
      return '购买存储';
    case 5:
      return 'API费用';
    case 6:
      return '对公充值';
    case 7:
      return "API使用返还"; // api fee refund
    case 8:
      return "代付返还";
    case 15:
      return '购买Web3服务套餐';
    case 16:
      return '购买Web3服务加油包';
    default:
      return '其他';
  }
}

// 

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

export function scanAddressLinkByPrefix(address: string) {
  const chainId = address.toLowerCase().startsWith('cfxtest') ? 1 : 1029;
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
      return 'erc721';
    case 2:
      return 'erc1155';
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

export function mapChainNetworkId(chainName: string) {
  switch (chainName) {
    case 'conflux':
      return 1029;
    case 'conflux_test':
      return 1;
    default:
      return 0;
  }
}

export const chainTypeToName = (chainType: number, chainId: number) => {
  if (chainType === 1) {
    if (chainId === 1029) {
      return '树图链';
    } else if (chainId === 1) {
      return '树图测试链';
    } else {
      return '树图其他链'
    }
  } else if (chainType === 2) {
    return '以太坊链';
  }
  return '其他';
};

export const timestampToSecond2 = (timestamp?: number | string) => {
  if (!timestamp || timestamp === -1 || timestamp === '-1') return '--';
  const date = new Date(+`${timestamp}000`);
  return `${date.getFullYear()}-${padLeftZero(date.getMonth() + 1)}-${padLeftZero(date.getDate())} ${padLeftZero(date.getHours())}:${padLeftZero(date.getMinutes())}:${padLeftZero(
    date.getSeconds()
  )}`;
};

export const timestampToSecond = (preDate: string) => {
  if (!preDate) return '--';
  const date = new Date(dayjs().format(preDate));
  return `${date.getFullYear()}-${padLeftZero(date.getMonth() + 1)}-${padLeftZero(date.getDate())} ${padLeftZero(date.getHours())}:${padLeftZero(date.getMinutes())}:${padLeftZero(
    date.getSeconds()
  )}`;
};

export const turnTimestamp = (time: string) => {
  if (!time) return -1;
  const date = new Date(dayjs().format(time)).getTime();
  return date;
};

export function formatFiat(amount: number|string) {
    return typeof amount === 'string' ? amount : amount.toFixed(2);
}