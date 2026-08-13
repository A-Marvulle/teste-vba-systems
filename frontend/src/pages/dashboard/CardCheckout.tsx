import { useState, type FormEvent } from "react";
import { apiFetch } from "../../api";
import { formToObject } from "../../lib/formToObject";
import Receipt, { type PaymentResult } from "../../components/Receipt";
import JsonResult from "../../components/JsonResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CardCheckout() {
  const [log, setLog] = useState<unknown>(null);
  const [brand, setBrand] = useState<string>("");
  const [feePercent, setFeePercent] = useState<string>("");
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

  async function handleConsultarTaxa(form: HTMLFormElement) {
    const { installments } = formToObject(form);
    const result = await run<{
      fees: { installments: number; feePercent: number }[];
    }>(() => apiFetch(`/fees?brand=${brand}`));
    const found = result?.fees.find(
      (f) => f.installments === Number(installments),
    );
    setFeePercent(found ? String(found.feePercent) : "");
  }

  async function handleCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = formToObject(e.currentTarget);
    const result = await run<PaymentResult>(() =>
      apiFetch("/payments/card", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          brand,
          amount: Number(data.amount),
          installments: Number(data.installments),
          feePercent: Number(feePercent),
        }),
      }),
    );
    if (result?.status === "APPROVED") setReceipt(result);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div>
        {receipt && <Receipt payment={receipt} />}

        <h2 className="text-xl">Checkout Cartão</h2>
        <form onSubmit={handleCard} className="flex flex-col gap-4 max-w-2xl">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Valor em centavos</FieldLabel>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Valor em centavos"
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="brand">Bandeira</FieldLabel>
              <Select
                value={brand}
                onValueChange={(value) => setBrand(value ?? "")}
                required
              >
                <SelectTrigger id="brand" className="w-full">
                  <SelectValue placeholder="Selecione a bandeira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISA">VISA</SelectItem>
                  <SelectItem value="MASTERCARD">MASTERCARD</SelectItem>
                  <SelectItem value="ELO">ELO</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="installments">Parcelas</FieldLabel>
              <Input
                id="installments"
                name="installments"
                type="number"
                placeholder="Parcelas"
                min={1}
                max={21}
                required
              />
            </Field>
          </FieldGroup>

          <div className="flex items-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleConsultarTaxa(e.currentTarget.form!)}
            >
              Consultar taxa
            </Button>
            <Field className="flex-1">
              <FieldLabel htmlFor="feePercent">Taxa (%)</FieldLabel>
              <Input
                id="feePercent"
                value={feePercent}
                readOnly
                placeholder="Taxa (%)"
              />
            </Field>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cardNumber">Número do cartão</FieldLabel>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="Número do cartão"
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cardHolder">Nome no cartão</FieldLabel>
              <Input
                id="cardHolder"
                name="cardHolder"
                placeholder="Nome no cartão"
                required
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-4">
            <Field className="flex-1">
              <FieldLabel htmlFor="expiryMonth">Mês (MM)</FieldLabel>
              <Input
                id="expiryMonth"
                name="expiryMonth"
                placeholder="Mês (MM)"
                required
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="expiryYear">Ano (AAAA)</FieldLabel>
              <Input
                id="expiryYear"
                name="expiryYear"
                placeholder="Ano (AAAA)"
                required
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="cvv">CVV</FieldLabel>
              <Input id="cvv" name="cvv" placeholder="CVV" required />
            </Field>
          </div>

          <div>
            <Button type="submit">Pagar</Button>
          </div>
        </form>
      </div>

      <JsonResult data={log} />
    </div>
  );
}

export default CardCheckout;
