import { useState, useCallback } from 'react';

const useInTransaction = <T extends (params: any) => void | Promise<any> | null | undefined>(transactionFunc: T) => {
  const [inTransaction, setInTransaction] = useState(false);
  const execTransaction = useCallback(
    async (params: any) => {
      try {
        setInTransaction(true);
        const res = await transactionFunc(params);
        setInTransaction(false);
        return res;
      } catch (_) {
        setInTransaction(false);
      }
    },
    [transactionFunc]
  ) as T;

  return { inTransaction, execTransaction };
};

export default useInTransaction;
