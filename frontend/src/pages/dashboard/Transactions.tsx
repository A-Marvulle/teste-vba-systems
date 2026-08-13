import { useState } from 'react';
import { apiFetch } from '../../api';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';

function Transactions() {
  const [log, setLog] = useState<unknown>(null);

  async function run<T>(action: () => Promise<T>) {
    try {
      const data = await action();
      setLog(data);
      return data;
    } catch (error) {
      setLog(error);
      return null;
    }
  }

  function loadTransactions(status?: string) {
    run(() => apiFetch(`/wallet/transactions${status ? `?status=${status}` : ''}`));
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>

      <h2 className="text-xl">Extrato</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => loadTransactions('APPROVED')}>Sucesso</Button>
        <Button variant="secondary" onClick={() => loadTransactions('DENIED')}>Falha</Button>
        <Button variant="secondary" onClick={() => loadTransactions('EXPIRED')}>Expirado</Button>
        <Button variant="secondary" onClick={() => loadTransactions('CANCELLED')}>Cancelado</Button>
        <Button variant="secondary" onClick={() => loadTransactions()}>Todos</Button>
      </div>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default Transactions;
