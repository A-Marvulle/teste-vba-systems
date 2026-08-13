import { useState, type FormEvent } from 'react';
import { apiFetch } from '../../api';
import { formToObject } from '../../lib/formToObject';
import Receipt, { type PaymentResult } from '../../components/Receipt';
import JsonResult from '../../components/JsonResult';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

function PixCheckout() {
  const [log, setLog] = useState<unknown>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentResult | null>(null);

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

  async function handlePix(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { amount, payerDocument } = formToObject(e.currentTarget);
    setQrCodeBase64(null);
    const result = await run<PaymentResult>(() =>
      apiFetch('/payments/pix', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), payerDocument }),
      }),
    );
    if (result?.qrCodeBase64) setQrCodeBase64(result.qrCodeBase64);
    if (result?.status === 'APPROVED') setReceipt(result);
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>

      {receipt && <Receipt payment={receipt} />}

      {qrCodeBase64 && (
        <img
          src={qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code Pix"
          width={200}
        />
      )}
      <h2 className="text-xl">Checkout Pix</h2>
      <form onSubmit={handlePix} className="flex flex-col gap-4 max-w-2xl">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="amount">Valor em centavos</FieldLabel>
            <Input id="amount" name="amount" type="number" placeholder="Valor em centavos" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="payerDocument">CPF/CNPJ do pagador</FieldLabel>
            <Input id="payerDocument" name="payerDocument" placeholder="CPF/CNPJ do pagador" required />
          </Field>
        </FieldGroup>

        <div>
          <Button type="submit">Gerar Pix</Button>
        </div>
      </form>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default PixCheckout;
