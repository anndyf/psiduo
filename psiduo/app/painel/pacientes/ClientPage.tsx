"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewPatientModal from "./components/NewPatientModal";
import PatientList from "./components/PatientList";
import { useRouter } from "next/navigation";

export default function ClientPage({ initialPacientes }: { initialPacientes: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
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

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-10 py-5 bg-deep text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-900 transition-all shadow-xl rounded-none md:rounded-none"
                    >
                        + Novo Paciente
                    </button>
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
            </div>

            {isModalOpen && (
                <NewPatientModal onClose={() => setIsModalOpen(false)} />
            )}
            
            <Footer />
        </main>
    );
}
