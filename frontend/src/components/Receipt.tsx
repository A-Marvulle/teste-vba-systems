import { Button } from "./ui/button";

interface PaymentResult {
  externalReference: string;
  method: string;
  amount: number;
  status: string;
  qrCodeBase64?: string | null;
}

interface ReceiptProps {
  payment: PaymentResult;
}

function Receipt({ payment }: ReceiptProps) {
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <section id="receipt">
        <h2>Comprovante de pagamento</h2>
        <p>Método: {payment.method}</p>
        <p>Valor: {payment.amount} centavos</p>
        <p>Referência: {payment.externalReference}</p>
        <p>Status: {payment.status}</p>
        <Button variant="outline" onClick={() => window.print()}>Imprimir</Button>
      </section>
    </>
  );
}

export type { PaymentResult };
export default Receipt;
