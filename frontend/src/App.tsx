import { useRef, useState, type FormEvent } from 'react';
import { apiFetch, getToken, setToken } from './api';

function formToObject(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

function App() {
  const [token, setTok] = useState<string | null>(getToken());
  const [log, setLog] = useState<unknown>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [feePercent, setFeePercent] = useState<string>('');
  const cardFormRef = useRef<HTMLFormElement>(null);

  function login(newToken: string) {
    setToken(newToken);
    setTok(newToken);
  }

  function logout() {
    setToken(null);
    setTok(null);
    setLog(null);
    setQrCodeBase64(null);
  }

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
    const { name, email, password } = formToObject(e.currentTarget);
    await run(() => apiFetch('/users', { method: 'POST', body: JSON.stringify({ name, email, password }) }));
    const result = await run<{ accessToken: string }>(() =>
      apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    );
    if (result) login(result.accessToken);
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = formToObject(e.currentTarget);
    const result = await run<{ accessToken: string }>(() =>
      apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    );
    if (result) login(result.accessToken);
  }

  async function handleGatewayLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const { document, password } = formToObject(form);
    await run(() => apiFetch('/gateway/accounts', { method: 'POST', body: JSON.stringify({ document, password }) }));
    form.reset();
  }

  function loadWallet() {
    run(() => apiFetch('/wallet'));
  }

  function loadTransactions(status?: string) {
    run(() => apiFetch(`/wallet/transactions${status ? `?status=${status}` : ''}`));
  }

  async function handlePix(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { amount, payerDocument } = formToObject(e.currentTarget);
    setQrCodeBase64(null);
    const result = await run<{ qrCodeBase64?: string }>(() =>
      apiFetch('/payments/pix', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), payerDocument }),
      }),
    );
    if (result?.qrCodeBase64) setQrCodeBase64(result.qrCodeBase64);
  }

  async function handleConsultarTaxa() {
    const form = cardFormRef.current;
    if (!form) return;
    const { brand, installments } = formToObject(form);
    const result = await run<{ fees: { installments: number; feePercent: number }[] }>(() =>
      apiFetch(`/fees?brand=${brand}`),
    );
    const found = result?.fees.find((f) => f.installments === Number(installments));
    setFeePercent(found ? String(found.feePercent) : '');
  }

  async function handleCard(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = formToObject(e.currentTarget);
    await run(() =>
      apiFetch('/payments/card', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          installments: Number(data.installments),
          feePercent: Number(feePercent),
        }),
      }),
    );
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

  function registerWebhooks() {
    run(() => apiFetch('/webhooks/register', { method: 'POST' }));
  }

  function listWebhooks() {
    run(() => apiFetch('/webhooks'));
  }

  if (!token) {
    return (
      <div>
        <h1>BaaS VBA Systems</h1>

        <h2>Criar conta</h2>
        <form onSubmit={handleRegister}>
          <input name="name" placeholder="Nome" required />
          <input name="email" type="email" placeholder="E-mail" required />
          <input name="password" type="password" placeholder="Senha" minLength={8} required />
          <button type="submit">Criar conta e entrar</button>
        </form>

        <h2>Entrar</h2>
        <form onSubmit={handleLogin}>
          <input name="email" type="email" placeholder="E-mail" required />
          <input name="password" type="password" placeholder="Senha" required />
          <button type="submit">Entrar</button>
        </form>

        {log !== null && <pre>{JSON.stringify(log, null, 2)}</pre>}
      </div>
    );
  }

  return (
    <div>
      <h1>BaaS VBA Systems</h1>
      <button onClick={logout}>Sair</button>

      <h2>Vincular conta do gateway</h2>
      <form onSubmit={handleGatewayLink}>
        <input name="document" placeholder="CPF/CNPJ" required />
        <input name="password" type="password" placeholder="Senha do gateway" required />
        <button type="submit">Vincular</button>
      </form>

      <h2>Carteira</h2>
      <button onClick={loadWallet}>Atualizar saldo</button>

      <h2>Extrato</h2>
      <button onClick={() => loadTransactions('APPROVED')}>Sucesso</button>
      <button onClick={() => loadTransactions('DENIED')}>Falha</button>
      <button onClick={() => loadTransactions('EXPIRED')}>Expirado</button>
      <button onClick={() => loadTransactions('CANCELLED')}>Cancelado</button>
      <button onClick={() => loadTransactions()}>Todos</button>

      <h2>Checkout Pix</h2>
      <form onSubmit={handlePix}>
        <input name="amount" type="number" placeholder="Valor em centavos" required />
        <input name="payerDocument" placeholder="CPF/CNPJ do pagador" required />
        <button type="submit">Gerar Pix</button>
      </form>
      {qrCodeBase64 && <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code Pix" width={200} />}

      <h2>Checkout Cartão</h2>
      <form ref={cardFormRef} onSubmit={handleCard}>
        <input name="amount" type="number" placeholder="Valor em centavos" required />
        <select name="brand" required>
          <option value="VISA">VISA</option>
          <option value="MASTERCARD">MASTERCARD</option>
          <option value="ELO">ELO</option>
        </select>
        <input name="installments" type="number" placeholder="Parcelas" min={1} max={21} required />
        <button type="button" onClick={handleConsultarTaxa}>Consultar taxa</button>
        <input value={feePercent} readOnly placeholder="Taxa (%)" />
        <input name="cardNumber" placeholder="Número do cartão" required />
        <input name="cardHolder" placeholder="Nome no cartão" required />
        <input name="expiryMonth" placeholder="Mês (MM)" required />
        <input name="expiryYear" placeholder="Ano (AAAA)" required />
        <input name="cvv" placeholder="CVV" required />
        <button type="submit">Pagar</button>
      </form>

      <h2>Saque</h2>
      <form onSubmit={handleWithdraw}>
        <input name="amount" type="number" placeholder="Valor em centavos" required />
        <input name="pixKey" placeholder="Chave Pix" required />
        <input name="document" placeholder="CPF do titular" required />
        <button type="submit">Solicitar saque</button>
      </form>
      <form onSubmit={handleWithdrawLookup}>
        <input name="id" placeholder="ID do saque" required />
        <button type="submit">Consultar saque</button>
      </form>

      <h2>Webhooks</h2>
      <button onClick={registerWebhooks}>Registrar webhooks</button>
      <button onClick={listWebhooks}>Listar webhooks</button>

      <h2>Resultado</h2>
      {log !== null && <pre>{JSON.stringify(log, null, 2)}</pre>}
    </div>
  );
}

export default App;
