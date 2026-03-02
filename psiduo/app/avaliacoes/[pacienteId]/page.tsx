'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { verificarAcessoPaciente, salvarInstrumentoViaLink } from '@/app/painel/pacientes/actions';
import PHQ9 from '@/app/painel/pacientes/components/instruments/PHQ9';
import GAD7 from '@/app/painel/pacientes/components/instruments/GAD7';
import WHO5 from '@/app/painel/pacientes/components/instruments/WHO5';
import PSS10 from '@/app/painel/pacientes/components/instruments/PSS10';
import ISI from '@/app/painel/pacientes/components/instruments/ISI';
import { Activity, ArrowRight, CheckCircle2, Lock, User } from 'lucide-react';
import LogoPsiDuo from '@/components/LogoPsiDuo';

export default function AvaliacaoPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const initialInstrument = searchParams?.get('instrumento');
    const autoLoginCpf = searchParams?.get('cpf');
    const pacienteId = params?.pacienteId as string;

    const [cpf, setCpf] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [psicologoNome, setPsicologoNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [solicitacoes, setSolicitacoes] = useState<string[]>([]);
    
    // State for instrument flow
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(initialInstrument || null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const performAutoLogin = async () => {
            if (autoLoginCpf && !isAuthenticated) {
                setLoading(true); // Don't block UI but show loading state if needed
                try {
                    const res = await verificarAcessoPaciente(pacienteId, autoLoginCpf);
                    
                    if (res.success && res.nome) {
                        setCpf(autoLoginCpf);
                        setPatientName(res.nome);
                        if (res.psicologoNome) setPsicologoNome(res.psicologoNome);
                        if (res.solicitacoes) setSolicitacoes(res.solicitacoes);
                        setIsAuthenticated(true);
                        toast.success(`Bem-vindo(a), ${res.nome}`);
                    }
                } catch (error) {
                    console.error("Auto-login failed", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        performAutoLogin();
    }, [autoLoginCpf, isAuthenticated, pacienteId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await verificarAcessoPaciente(pacienteId, cpf);
        
        if (res.success && res.nome) {
            setIsAuthenticated(true);
            setPatientName(res.nome);
            if (res.psicologoNome) setPsicologoNome(res.psicologoNome);
            if (res.solicitacoes) setSolicitacoes(res.solicitacoes);
            toast.success(`Bem-vindo(a), ${res.nome}`);
        } else {
            toast.error(res.error || "CPF inválido ou acesso não autorizado.");
        }
        setLoading(false);
    };

    const handleInstrumentSave = async (answers: any, result: any) => {
        if (!selectedInstrument) return { success: false, error: "Nenhum instrumento selecionado." };
        
        return await salvarInstrumentoViaLink(
            pacienteId, 
            cpf, 
            selectedInstrument, 
            answers, 
            result
        );
    };

    const handleFinishInstrument = async () => {
        setLoading(true);
        try {
            const res = await verificarAcessoPaciente(pacienteId, cpf);
            if (res.success && res.nome && res.solicitacoes) {
                setSolicitacoes(res.solicitacoes);
                if (res.solicitacoes.length > 0) {
                    toast.success("Enviado! Você tem mais avaliações pendentes.");
                    setSelectedInstrument(null);
                } else {
                    setCompleted(true);
                }
            } else {
                setCompleted(true);
            }
        } catch (error) {
            setCompleted(true);
        } finally {
            setLoading(false);
        }
    };

    if (completed) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <LogoPsiDuo variant="dark" width={140} />
                    </div>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Avaliação Concluída!</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Obrigado por responder. Seus resultados foram enviados com segurança para o prontuário do seu psicólogo.
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
                
                
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 pb-4 flex flex-col items-center">
                        <div className="mb-0">
                            <LogoPsiDuo variant="dark" width={190} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                             Acesso Seguro
                        </h1>
                        <p className="text-slate-500 text-sm text-center">
                            Responda às suas avaliações com tranquilidade.
                        </p>
                    </div>

                    <div className="px-8 pb-8 space-y-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CPF do Paciente</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={cpf}
                                        onChange={(e) => {
                                            // Mask input
                                            let v = e.target.value.replace(/\D/g, "");
                                            if (v.length > 11) v = v.substring(0, 11);
                                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                            setCpf(v);
                                        }}
                                        placeholder="000.000.000-00"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 pl-11 transition-all text-slate-700 placeholder:text-slate-300"
                                        required
                                    />
                                    <User className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={20} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-lg transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Verificando...</span>
                                ) : (
                                    <>
                                        Acessar Avaliação <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex gap-3 items-start">
                            <Lock className="text-slate-400 shrink-0 mt-0.5" size={14} />
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                <strong>Privacidade Garantida:</strong> Apenas seu psicólogo terá acesso às suas respostas. Este é um ambiente seguro e criptografado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            
            
            {/* Professional Top Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm/50">
                <div className="flex items-center gap-2">
                    <LogoPsiDuo variant="dark" width={110} />
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paciente de</span>
                        <span className="text-xs font-bold text-slate-700">{psicologoNome || 'PsiDuo'}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
                    <div className="flex items-center gap-2 pl-1">
                        <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200 ring-2 ring-white">
                            {patientName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                            {patientName.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </nav>
            
            {/* Main Content Area */}
            <div className="max-w-3xl mx-auto p-4 sm:p-6 py-8 sm:py-12">
                
                {/* Page Header - Left Aligned */}
                <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                            {!selectedInstrument ? "Avaliação Pendente" : selectedInstrument}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {!selectedInstrument 
                                ? "Selecione uma das avaliações abaixo para começar." 
                                : selectedInstrument === 'PHQ-9' 
                                    ? "Questionário sobre Saúde do Paciente" 
                                    : selectedInstrument === 'GAD-7'
                                        ? "Escala de Ansiedade Generalizada"
                                        : selectedInstrument === 'WHO-5'
                                            ? "Escala de Bem-Estar Psicológico"
                                            : selectedInstrument === 'PSS-10'
                                                ? "Escala de Estresse Percebido"
                                                : "Índice de Gravidade de Insônia"
                            }
                        </p>
                    </div>

                    {selectedInstrument && !initialInstrument && (
                         <button 
                            onClick={() => setSelectedInstrument(null)}
                            className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
                        >
                            Trocar Avaliação
                        </button>
                    )}
                </header>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">

                {/* Instrument Selection or Display */}
                {!selectedInstrument ? (
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative">
                        <div className="p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="text-indigo-500" /> 
                                {solicitacoes.length > 0 ? "Avaliações solicitadas pelo seu psicólogo" : "Nenhuma avaliação pendente"}
                            </h3>
                            
                            {solicitacoes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {solicitacoes.includes('PHQ9') && (
                                        <button
                                            onClick={() => setSelectedInstrument('PHQ-9')}
                                            className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-lg text-slate-800 group-hover:text-indigo-700">PHQ-9</span>
                                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">Questionário sobre Saúde do Paciente</p>
                                            </div>
                                        </button>
                                    )}

                                    {solicitacoes.includes('GAD7') && (
                                        <button
                                            onClick={() => setSelectedInstrument('GAD-7')}
                                            className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-lg text-slate-800 group-hover:text-indigo-700">GAD-7</span>
                                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">Escala de Ansiedade Generalizada</p>
                                            </div>
                                        </button>
                                    )}

                                    {solicitacoes.includes('WHO5') && (
                                        <button
                                            onClick={() => setSelectedInstrument('WHO-5')}
                                            className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-lg text-slate-800 group-hover:text-indigo-700">WHO-5</span>
                                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">Índice de Bem-Estar da OMS</p>
                                            </div>
                                        </button>
                                    )}

                                    {solicitacoes.includes('PSS10') && (
                                        <button
                                            onClick={() => setSelectedInstrument('PSS-10')}
                                            className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-lg text-slate-800 group-hover:text-indigo-700">PSS-10</span>
                                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">Escala de Estresse Percebido</p>
                                            </div>
                                        </button>
                                    )}

                                    {solicitacoes.includes('ISI') && (
                                        <button
                                            onClick={() => setSelectedInstrument('ISI')}
                                            className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group relative overflow-hidden md:col-span-2"
                                        >
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-black text-lg text-slate-800 group-hover:text-indigo-700">ISI</span>
                                                    <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium group-hover:text-slate-600">Índice de Gravidade de Insônia</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <p className="text-slate-500 font-medium max-w-xs">
                                        Você já respondeu a todas as solicitações pendentes no momento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 shadow-xl shadow-slate-200/50 rounded-2xl">
                        {loading && selectedInstrument && (
                             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                             </div>
                        )}
                        {selectedInstrument === 'PHQ-9' && (
                            <PHQ9 
                                pacienteId={pacienteId} 
                                onFinish={handleFinishInstrument}
                                customSaveAction={handleInstrumentSave}
                            />
                        )}
                        {selectedInstrument === 'GAD-7' && (
                            <GAD7 
                                pacienteId={pacienteId} 
                                onFinish={handleFinishInstrument}
                                customSaveAction={handleInstrumentSave}
                            />
                        )}
                        {selectedInstrument === 'WHO-5' && (
                            <WHO5 
                                pacienteId={pacienteId} 
                                onFinish={handleFinishInstrument}
                                customSaveAction={handleInstrumentSave}
                            />
                        )}
                        {selectedInstrument === 'PSS-10' && (
                            <PSS10 
                                pacienteId={pacienteId} 
                                onFinish={handleFinishInstrument}
                                customSaveAction={handleInstrumentSave}
                            />
                        )}
                        {selectedInstrument === 'ISI' && (
                            <ISI 
                                pacienteId={pacienteId} 
                                onFinish={handleFinishInstrument}
                                customSaveAction={handleInstrumentSave}
                            />
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
