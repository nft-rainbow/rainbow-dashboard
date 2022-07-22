
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