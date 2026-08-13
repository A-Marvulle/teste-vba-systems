import { useState } from 'react';
import { apiFetch } from '../../api';
import { Button } from '@/components/ui/button';
import JsonResult from '../../components/JsonResult';

function Wallet() {
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

  function loadWallet() {
    run(() => apiFetch('/wallet'));
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
      <div>
        <Button variant='secondary' onClick={loadWallet}>Atualizar saldo</Button>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default Wallet;
