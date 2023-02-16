import { useState, useCallback } from 'react';

const useInTransaction = <T extends (params: any) => void | Promise<any> | null | undefined>(transcationFunc: T) => {
  const [inTransaction, setInTransaction] = useState(false);
  const execTranscation = useCallback(
    async (params: any) => {
      try {
        setInTransaction(true);
        const res = await transcationFunc(params);
        setInTransaction(false);
        return res;
      } catch (_) {
        setInTransaction(false);
      }
    },
    [transcationFunc]
  ) as T;

  return { inTransaction, execTranscation };
};

export default useInTransaction;
