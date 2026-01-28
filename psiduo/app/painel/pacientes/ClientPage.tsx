"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewPatientModal from "./components/NewPatientModal";
import BuyPatientsModal from "./components/BuyPatientsModal";
import PatientList from "./components/PatientList";
import { useRouter } from "next/navigation";

export default function ClientPage({ initialPacientes }: { initialPacientes: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrar pacientes pelo nome (case insensitive)
    const pacientesFiltrados = initialPacientes.filter(p => 
        p.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
            <Navbar />
            
            <div className="container mx-auto max-w-[1400px] py-12 px-8 flex-1">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <button 
                            onClick={() => router.push("/painel")}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-deep mb-4 flex items-center gap-2 transition-colors"
                        >
                            <span className="text-lg">←</span> Voltar ao Painel
                        </button>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            Meus Pacientes
                        </h1>
                        <div className="w-16 h-1.5 bg-deep mt-6"></div>
                    </div>

                <div className="flex gap-4">
                        <button 
                            onClick={() => setShowBuyModal(true)}
                            className="px-6 py-5 bg-amber-100 text-amber-700 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-amber-200 transition-all shadow-md flex items-center gap-2 rounded-full"
                        >
                            + Mais Pacientes
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="px-10 py-5 bg-deep text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-xl rounded-full"
                        >
                            + Novo Paciente
                        </button>
                    </div>
                </header>

                {/* BARRA DE BUSCA */}
                <div className="mb-10 relative group max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-focus-within:text-deep transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="BUSCAR PACIENTES..."
                        className="w-full bg-white border-2 border-slate-100 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-deep focus:ring-0 transition-all uppercase tracking-wider"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <PatientList initialPacientes={pacientesFiltrados} />

                {/* INSTRUÇÕES DE ACESSO */}
                <div className="mt-16 p-8 md:p-10 bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col md:flex-row items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0"></div>
                    
                    <div className="relative z-10 bg-blue-50 p-4 rounded-2xl text-primary">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-4">Como seu paciente acessa?</h3>
                        <div className="space-y-4 text-sm text-slate-500 font-medium leading-relaxed">
                            <p>
                                Para iniciar o uso do <strong className="text-slate-800">Diário de Humor</strong>, envie o link da plataforma para seu paciente.
                            </p>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex-shrink-0 bg-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-black text-slate-400 border border-slate-200 shadow-sm">1</span>
                                <span className="text-slate-700">Acessar via o link <strong className="text-deep">www.psiduo.com.br/diario</strong> ou pelo link exclusivo gerado por paciente.</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="flex-shrink-0 bg-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-black text-slate-400 border border-slate-200 shadow-sm">2</span>
                                <span className="text-slate-700">Entrar utilizando o <strong className="text-deep">CPF</strong> cadastrado.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <NewPatientModal onClose={() => setIsModalOpen(false)} />
            )}
            
            {showBuyModal && (
                <BuyPatientsModal onClose={() => setShowBuyModal(false)} />
            )}
            
            <Footer />
        </main>
    );
}
