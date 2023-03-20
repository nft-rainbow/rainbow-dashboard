const isNegative = (x: number) => typeof x === 'number' && x < 0;
const isString = (x: string) => typeof x === 'string';
const getEllipsStr = (str: string, frontNum: number, endNum: number) => {
  if (!isString(str) || isNegative(frontNum) || isNegative(endNum)) {
    throw new Error('Invalid args');
  }
  const length = str.length;
  if (frontNum + endNum >= length) {
    return str.substring(0, length);
  }
  return str.substring(0, frontNum) + '...' + str.substring(length - endNum, length);
};

export const shortenCfxAddress = (address: string) => {
  const arr = address.split(':');
  if (arr.length !== 2) {
    throw new Error('Only shorten the conflux address not containing type');
  }
  const secondStr = getEllipsStr(arr[1], 3, 8);
  return `${arr[0]}:${secondStr}`;
};
