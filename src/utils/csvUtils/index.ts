import Papa from 'papaparse';
import { utils } from "xlsx";

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
    try {
        const keys = Object.values(res[0]);
        return Object.values(res.slice(1)).map(item => Object.fromEntries(keys.map((key, index) => [key?.trim(), item[index]])));
    } catch (err) {
        throw new Error('csv 格式错误');
    }
}

export function arrayToCSVText(rows: any[]) :string {
    const worksheet = utils.json_to_sheet(rows);
    return '\uFEFF' + utils.sheet_to_csv(worksheet);
}