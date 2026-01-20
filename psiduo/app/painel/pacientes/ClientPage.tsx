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

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
            <Navbar />
            
            <div className="container mx-auto max-w-[1400px] py-12 px-8 flex-1">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
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

                <PatientList initialPacientes={initialPacientes} />
            </div>

            {isModalOpen && (
                <NewPatientModal onClose={() => setIsModalOpen(false)} />
            )}
            
            <Footer />
        </main>
    );
}
