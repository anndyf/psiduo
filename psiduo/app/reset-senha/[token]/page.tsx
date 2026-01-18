"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validarTokenReset, resetarSenha } from "../actions";

export default function ResetSenhaToken({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function validarToken() {
      const result = await validarTokenReset(params.token);
      if (result.valid && result.email) {
        setTokenValido(true);
        setEmail(result.email);
      } else {
        setError(result.error || "Token inválido");
      }
      setIsValidating(false);
    }
    validarToken();
  }, [params.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não conferem.");
      return;
    }

    if (novaSenha.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetarSenha(params.token, novaSenha);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(result.error || "Erro ao resetar senha.");
      }
    } catch (err) {
      setError("Erro ao resetar senha.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <main className="min-h-screen bg-mist flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Validando token...</p>
        </div>
      </main>
    );
  }

  if (!tokenValido) {
    return (
      <main className="min-h-screen bg-mist flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-deep mb-2">Token Inválido</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href="/reset-senha"
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-deep transition"
          >
            Solicitar Novo Link
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-mist flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-deep mb-2">Senha Alterada!</h1>
          <p className="text-slate-600 mb-6">
            Sua senha foi alterada com sucesso. Redirecionando para login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-deep mb-2">Nova Senha</h1>
          <p className="text-slate-600 text-sm">
            Resetando senha para: <span className="font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              required
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
            />
            <p className="text-xs text-slate-500 mt-2">
              Mínimo: 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition"
              placeholder="Repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-deep text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </button>

          <Link
            href="/login"
            className="block text-center text-slate-600 hover:text-slate-800 text-sm"
          >
            Voltar para Login
          </Link>
        </form>
      </div>
    </main>
  );
}
