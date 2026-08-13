import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../api";
import { formToObject } from "../lib/formToObject";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [, setLog] = useState<unknown>(null);
  const navigate = useNavigate();

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

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = formToObject(e.currentTarget);
    const result = await run<{ accessToken: string }>(() =>
      apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    );
    if (result) {
      setToken(result.accessToken);
      onLoginSuccess(result.accessToken);
      navigate("/");
    }
  }

  return (

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 max-w-2xl mx-auto shadow p-5 rounded"
      >
      <h2 className="text-xl">Entrar</h2>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="E-mail" required />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Input id="password" name="password" type="password" placeholder="Senha" required />
          </Field>
        </FieldGroup>
        <div>
          <Button type="submit">Entrar</Button>
        </div>
        <div>
          <a
            href="/cadastro"
            className={buttonVariants({ variant: "link", size: "default" })}
          >
            Não tem conta? Crie uma
          </a>
        </div>
      </form>

  );
}

export default Login;
