"use client";

import { useState } from "react";
import Link from "next/link";
import { solicitarResetSenha } from "./actions";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setResetLink("");

    try {
      const result = await solicitarResetSenha(email);

      if (result.success) {
        setMessage(result.message);
        if (result.resetLink) {
          setResetLink(result.resetLink);
        }
      } else {
        setError(result.error || "Erro ao processar solicitação.");
      }
    } catch (err) {
      setError("Erro ao processar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-deep mb-2">Esqueci Minha Senha</h1>
          <p className="text-slate-600 text-sm">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        {message ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
              <p className="font-medium">{message}</p>
            </div>

            {resetLink && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 font-bold mb-2 uppercase">
                  Link de Reset (Desenvolvimento):
                </p>
                <Link 
                  href={resetLink}
                  className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                >
                  {resetLink}
                </Link>
              </div>
            )}

            <Link
              href="/login"
              className="block text-center text-primary hover:underline font-medium"
            >
              Voltar para Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-4 text-slate-700 focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-deep text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enviando..." : "Enviar Instruções"}
            </button>

            <div className="text-center space-y-2">
              <Link
                href="/login"
                className="block text-primary hover:underline font-medium text-sm"
              >
                Voltar para Login
              </Link>
              <Link
                href="/cadastro"
                className="block text-slate-600 hover:text-slate-800 text-sm"
              >
                Não tem conta? Cadastre-se
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
