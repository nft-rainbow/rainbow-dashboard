import Papa from 'papaparse';
export const parseCSV = <T extends () => Promise<any>>(csv: File) => {
  //TODO: add type for the Promise
  return new Promise(async (resolve, reject) => {
    Papa.parse(csv, {
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const csvWhitelistFormat = (res: [string[], string[]]) => {
  if (res[0].length !== res[1].length) throw new Error('csv格式错误');
  const whiteListInfo = res[0].map((item: string, i: number) => {
    return { user: item, address: parseInt(res[1][i]) };
  });
  return whiteListInfo;
};
