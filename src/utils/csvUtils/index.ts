import Papa from 'papaparse';
export const parseCSV = <T extends () => Promise<any>>(csv: File) => {
    //TODO: add type for the Promise
  return new Promise(async (resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let res = JSON.stringify(results.data);
        console.log(res);
        resolve(res);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
