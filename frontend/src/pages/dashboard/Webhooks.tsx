import { useState } from 'react';
import { apiFetch } from '../../api';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';

function Webhooks() {
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

  function registerWebhooks() {
    run(() => apiFetch('/webhooks/register', { method: 'POST' }));
  }

  function listWebhooks() {
    run(() => apiFetch('/webhooks'));
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>

      <h2 className="text-xl">Webhooks</h2>
      <div className="flex gap-2">
        <Button onClick={registerWebhooks}>Registrar webhooks</Button>
        <Button variant="secondary" onClick={listWebhooks}>Listar webhooks</Button>
      </div>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default Webhooks;
