import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../api";
import { formToObject } from "../lib/formToObject";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

interface SignUpProps {
  onLoginSuccess: (token: string) => void;
}

function SignUp({ onLoginSuccess }: SignUpProps) {
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

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { name, email, password } = formToObject(e.currentTarget);
    await run(() =>
      apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),
    );
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
      onSubmit={handleRegister}
      className="flex flex-col gap-4 max-w-2xl mx-auto shadow p-5 rounded"
    >
      <h2 className="text-xl">Criar conta</h2>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input id="name" name="name" type="text" placeholder="Nome" required />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="E-mail" required />
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Senha"
            required
            minLength={8}
          />
        </Field>
      </FieldGroup>
      <div>
        <Button type="submit">Criar conta e entrar</Button>
      </div>
      <div>
        <a
          href="/login"
          className={buttonVariants({ variant: "link", size: "default" })}
        >
          Já tem conta? Faça o Login
        </a>
      </div>
    </form>
  );
}

export default SignUp;
