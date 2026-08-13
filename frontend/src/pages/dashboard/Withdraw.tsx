import { useState, type FormEvent } from 'react';
import { apiFetch } from '../../api';
import { formToObject } from '../../lib/formToObject';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

function Withdraw() {
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

  async function handleWithdraw(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { amount, pixKey, document } = formToObject(e.currentTarget);
    await run(() =>
      apiFetch('/withdrawals', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), pixKey, document }),
      }),
    );
  }

  async function handleWithdrawLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { id } = formToObject(e.currentTarget);
    await run(() => apiFetch(`/withdrawals/${id}`));
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>

      <h2 className="text-xl">Saque</h2>
      <form onSubmit={handleWithdraw} className="flex flex-col gap-4 max-w-2xl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="amount">Valor em centavos</FieldLabel>
            <Input id="amount" name="amount" type="number" placeholder="Valor em centavos" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="pixKey">Chave Pix</FieldLabel>
            <Input id="pixKey" name="pixKey" placeholder="Chave Pix" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="document">CPF do titular</FieldLabel>
            <Input id="document" name="document" placeholder="CPF do titular" required />
          </Field>
        </FieldGroup>

        <div>
          <Button type="submit">Solicitar saque</Button>
        </div>
      </form>

      <form onSubmit={handleWithdrawLookup} className="flex items-end gap-4 max-w-2xl mt-6">
        <Field className="flex-1">
          <FieldLabel htmlFor="id">ID do saque</FieldLabel>
          <Input id="id" name="id" placeholder="ID do saque" required />
        </Field>
        <Button type="submit" variant="secondary">Consultar saque</Button>
      </form>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default Withdraw;
