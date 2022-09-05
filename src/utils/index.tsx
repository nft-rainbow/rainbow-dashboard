export function mapChainName(chainType: number) {
  switch (chainType) {
    case 1:
      return "树图链";
    case 2:
      return "Ethereum";
    default:
      return "其他";
  }
}

export function formatDate(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date.toLocaleString();
}

export function short(toShort: string) {
  if (toShort.length > 10) {
    return toShort.substring(0, 5) + "..." + toShort.substring(toShort.length - 5);
  }
  return toShort;
}

export function scanTxLink(chainType: number, chainId: number, txHash: string) {
  switch (chainId) {
    case 1:
      return `https://testnet.confluxscan.io/transaction/${txHash}`;
    case 1029:
      return `https://confluxscan.io/transaction/${txHash}`;
    default:
      return `#`;
  }
}

export function scanNFTLink(chainType: number, chainId: number, contract: string, tokenId: number) {
  switch (chainId) {
    case 1:
      return `https://testnet.confluxscan.io/nft/${contract}/${tokenId}`;
    case 1029:
      return `https://confluxscan.io/nft/${contract}/${tokenId}`;
    default:
      return `#`;
  }
}

export function scanAddressLink(chainType: number, chainId: number, address: string) {
  switch (chainId) {
    case 1:
      return `https://testnet.confluxscan.io/address/${address}`;
    case 1029:
      return `https://confluxscan.io/address/${address}`;
    default:
      return `#`;
  }
}



export function mapSimpleStatus(status: number) {
  switch (status) {
    case 0:
      return "待处理";
    case 1:
      return "成功";
    case 2:
      return "失败";
    default:
      return "未知";
  }
}

export function mapNFTType(type: number) {
  switch (type) {
    case 1:
      return "ERC721";
    case 2:
      return "ERC1155";
    default:
      return "未知";
  }
}