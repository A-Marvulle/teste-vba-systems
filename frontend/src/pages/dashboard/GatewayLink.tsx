import { useState, type FormEvent } from 'react';
import { apiFetch } from '../../api';
import { formToObject } from '../../lib/formToObject';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

function GatewayLink() {
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

  async function handleGatewayLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { document, password } = formToObject(form);
    await run(() => apiFetch('/gateway/accounts', { method: 'POST', body: JSON.stringify({ document, password }) }));
    form.reset();
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>

      <h2 className="text-xl">Vincular conta do gateway</h2>
      <form onSubmit={handleGatewayLink} className="flex flex-col gap-4 max-w-2xl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="document">CPF/CNPJ</FieldLabel>
            <Input id="document" name="document" placeholder="CPF/CNPJ" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Senha do gateway</FieldLabel>
            <Input id="password" name="password" type="password" placeholder="Senha do gateway" required />
          </Field>
        </FieldGroup>

        <div>
          <Button type="submit">Vincular</Button>
        </div>
      </form>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default GatewayLink;
