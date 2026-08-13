import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../../api';
import { formToObject } from '../../lib/formToObject';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CurrentUser {
  name: string;
  email: string;
}

function GatewayRegister() {
  const [log, setLog] = useState<unknown>(null);
  const [personType, setPersonType] = useState<string>('');
  const [me, setMe] = useState<CurrentUser | null>(null);

  useEffect(() => {
    apiFetch('/users/me').then(setMe).catch(setLog);
  }, []);

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

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = formToObject(e.currentTarget);
    await run(() =>
      apiFetch('/gateway/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, name: me?.name, email: me?.email, personType }),
      }),
    );
  }

  return (
    <div>
      <h2 className="text-xl">Cadastrar no gateway</h2>
      <div className='grid grid-cols-1 md:grid-cols-2'>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 max-w-2xl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="personType">Tipo de pessoa</FieldLabel>
            <Select value={personType} onValueChange={(value) => setPersonType(value ?? '')} required>
              <SelectTrigger id="personType" className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa física</SelectItem>
                <SelectItem value="PJ">Pessoa jurídica</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field aria-disabled>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input id="name" name="name" value={me?.name ?? ''} disabled required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field aria-disabled>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" name="email" type="email" value={me?.email ?? ''} disabled required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="phone">Telefone</FieldLabel>
            <Input id="phone" name="phone" placeholder="DDD + 9 + 8 dígitos (ex: 11999998888)" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="document">CPF/CNPJ</FieldLabel>
            <Input id="document" name="document" placeholder="CPF (11 dígitos) ou CNPJ (14 dígitos)" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="zipCode">CEP</FieldLabel>
            <Input id="zipCode" name="zipCode" placeholder="8 dígitos" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="address">Endereço</FieldLabel>
            <Input id="address" name="address" placeholder="Endereço" required />
          </Field>
        </FieldGroup>

        <div className="flex gap-4">
          <Field className="flex-1">
            <FieldLabel htmlFor="number">Número</FieldLabel>
            <Input id="number" name="number" placeholder="Número" required />
          </Field>
          <Field className="flex-1">
            <FieldLabel htmlFor="neighborhood">Bairro</FieldLabel>
            <Input id="neighborhood" name="neighborhood" placeholder="Bairro" required />
          </Field>
        </div>

        <div className="flex gap-4">
          <Field className="flex-1">
            <FieldLabel htmlFor="city">Cidade</FieldLabel>
            <Input id="city" name="city" placeholder="Cidade" required />
          </Field>
          <Field className="w-24">
            <FieldLabel htmlFor="state">UF</FieldLabel>
            <Input id="state" name="state" placeholder="UF" maxLength={2} required />
          </Field>
        </div>

        <div>
          <Button type="submit">Cadastrar</Button>
        </div>
      </form>

      <JsonResult data={log} />
      </div>
    </div>
  );
}

export default GatewayRegister;
