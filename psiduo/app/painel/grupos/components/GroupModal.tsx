"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { salvarGrupo } from "../actions";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    grupo?: any | null; // Se null, é criação
}

const SUGGESTED_TEMAS = ["Ansiedade", "Depressão", "Autoestima", "Relacionamentos", "Luto", "Carreira", "Maternidade", "Estresse", "Vícios"];
const SUGGESTED_PUBLICO = ["Adultos", "Mulheres", "Adolescentes", "Idosos", "LGBTQIA+", "Homens", "Pais", "Estudantes"];

export default function GroupModal({ isOpen, onClose, grupo }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: "",
        descricao: "",
        precoMensal: "",
        periodicidade: "Semanal",
        diaSemana: "",
        horario: "",
        duracaoSessao: 60,
        vagasTotais: "",
        vagasOcupadas: "0",
        temas: [] as string[],
        publicoAlvo: [] as string[],
        modalidade: "ONLINE",
        cidade: "",
        estado: ""
    });

    // Populate form if editing
    useEffect(() => {
        if (grupo) {
            setFormData({
                titulo: grupo.titulo,
                descricao: grupo.descricao,
                precoMensal: grupo.precoMensal.toString(),
                periodicidade: grupo.periodicidade,
                diaSemana: grupo.diaSemana || "",
                horario: grupo.horario || "",
                duracaoSessao: grupo.duracaoSessao,
                vagasTotais: grupo.vagasTotais ? grupo.vagasTotais.toString() : "",
                vagasOcupadas: grupo.vagasOcupadas ? grupo.vagasOcupadas.toString() : "0",
                temas: grupo.temas,
                publicoAlvo: grupo.publicoAlvo,
                modalidade: grupo.modalidade || "ONLINE",
                cidade: grupo.cidade || "",
                estado: grupo.estado || ""
            });
        } else {
            setFormData({
                titulo: "",
                descricao: "",
                precoMensal: "",
                periodicidade: "Semanal",
                diaSemana: "Segunda-feira",
                horario: "",
                duracaoSessao: 60,
                vagasTotais: "",
                vagasOcupadas: "0",
                temas: [],
                publicoAlvo: [],
                modalidade: "ONLINE",
                cidade: "",
                estado: ""
            });
        }
    }, [grupo, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            id: grupo?.id,
            ...formData,
            precoMensal: Number(formData.precoMensal),
            vagasTotais: formData.vagasTotais ? Number(formData.vagasTotais) : null,
            vagasOcupadas: Number(formData.vagasOcupadas)
        };

        const res = await salvarGrupo(payload);
        setLoading(false);

        if (res.success) {
            onClose();
        } else {
            alert(res.error || "Erro ao salvar grupo.");
        }
    };

    const handleTagInput = (e: React.KeyboardEvent, field: 'temas' | 'publicoAlvo') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value.trim();
            if (val && !formData[field].includes(val)) {
                setFormData(prev => ({ ...prev, [field]: [...prev[field], val] }));
                (e.target as HTMLInputElement).value = "";
            }
        }
    };

    const removeTag = (tag: string, field: 'temas' | 'publicoAlvo') => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(t => t !== tag) }));
    };

    const addTag = (tag: string, field: 'temas' | 'publicoAlvo') => {
        if (!formData[field].includes(tag)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], tag] }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h2 className="text-xl font-black text-deep uppercase tracking-wide">
                        {grupo ? "Editar Grupo" : "Novo Grupo Terapêutico"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500">✕</button>
                </header>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* Básico */}
                    <div className="space-y-4">
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Nome do Grupo</label>
                             <input 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-300 placeholder:font-normal"
                                value={formData.titulo} 
                                onChange={e => setFormData({...formData, titulo: e.target.value})}
                                required
                                placeholder="Ex: Roda de Conversa para Mulheres"
                             />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Descrição</label>
                             <textarea 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-300"
                                rows={3}
                                required
                                value={formData.descricao}
                                onChange={e => setFormData({...formData, descricao: e.target.value})}
                                placeholder="Descreva como funciona o grupo..."
                             />
                        </div>
                    </div>

                    {/* Modalidade e Local */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Modalidade</label>
                             <select 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold"
                                value={formData.modalidade}
                                onChange={e => setFormData({...formData, modalidade: e.target.value})}
                             >
                                <option value="ONLINE">Online</option>
                                <option value="PRESENCIAL">Presencial</option>
                             </select>
                        </div>
                        {formData.modalidade === 'PRESENCIAL' && (
                            <>
                                <div className="md:col-span-1">
                                     <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Cidade</label>
                                     <input 
                                        className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100"
                                        value={formData.cidade} 
                                        onChange={e => setFormData({...formData, cidade: e.target.value})}
                                        required={formData.modalidade === 'PRESENCIAL'}
                                     />
                                </div>
                                <div className="md:col-span-1">
                                     <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">UF</label>
                                     <select 
                                        className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold"
                                        value={formData.estado}
                                        onChange={e => setFormData({...formData, estado: e.target.value})}
                                        required={formData.modalidade === 'PRESENCIAL'}
                                     >
                                        <option value="">UF</option>
                                        {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                                            <option key={uf} value={uf}>{uf}</option>
                                        ))}
                                     </select>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Preço e Vagas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Valor Mensal (R$)</label>
                             <input 
                                type="number"
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-300"
                                value={formData.precoMensal} 
                                onChange={e => setFormData({...formData, precoMensal: e.target.value})}
                                required
                                placeholder="0,00"
                             />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                 <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total de Vagas</label>
                                 <input 
                                    type="number"
                                    className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100 placeholder:text-slate-300"
                                    value={formData.vagasTotais} 
                                    onChange={e => setFormData({...formData, vagasTotais: e.target.value})}
                                    placeholder="Ilimitado"
                                 />
                            </div>
                            {grupo && (
                                <div>
                                     <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Ocupadas</label>
                                     <input 
                                        type="number"
                                        className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100"
                                        value={formData.vagasOcupadas} 
                                        onChange={e => setFormData({...formData, vagasOcupadas: e.target.value})}
                                     />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Agenda */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Periodicidade</label>
                             <select 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold"
                                value={formData.periodicidade}
                                onChange={e => setFormData({...formData, periodicidade: e.target.value})}
                             >
                                <option>Semanal</option>
                                <option>Quinzenal</option>
                                <option>Mensal</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Dia da Semana</label>
                             <select 
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold"
                                value={formData.diaSemana}
                                onChange={e => setFormData({...formData, diaSemana: e.target.value})}
                             >
                                <option value="">Selecione...</option>
                                {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                             </select>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Horário</label>
                             <input 
                                type="time"
                                className="w-full border border-slate-200 rounded-xl p-3 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-slate-100"
                                value={formData.horario}
                                onChange={e => setFormData({...formData, horario: e.target.value})}
                             />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Temas abordados</label>
                        
                        {/* Sugestões de Temas */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {SUGGESTED_TEMAS.map(tag => (
                                <button 
                                    key={tag} 
                                    type="button" 
                                    onClick={() => addTag(tag, 'temas')}
                                    disabled={formData.temas.includes(tag)}
                                    className={`text-[10px] px-2 py-1.5 rounded-lg border font-bold transition-all uppercase tracking-wide ${
                                        formData.temas.includes(tag) 
                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default opacity-50' 
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-deep/30 hover:text-deep hover:shadow-sm'
                                    }`}
                                >
                                    {formData.temas.includes(tag) ? '✓' : '+'} {tag}
                                </button>
                            ))}
                        </div>

                        {formData.temas.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.temas.map(t => (
                                    <span key={t} className="bg-slate-100 text-deep px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 animate-in zoom-in-50 duration-200">
                                        {t} <button type="button" onClick={() => removeTag(t, 'temas')} className="hover:text-black bg-slate-200 w-4 h-4 rounded-full flex items-center justify-center">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input 
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-slate-100 outline-none text-sm font-medium placeholder:text-slate-400"
                            placeholder="Digite outro tema e pressione Enter..."
                            onKeyDown={e => handleTagInput(e, 'temas')}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Público Alvo</label>

                        {/* Sugestões de Público */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {SUGGESTED_PUBLICO.map(tag => (
                                <button 
                                    key={tag} 
                                    type="button" 
                                    onClick={() => addTag(tag, 'publicoAlvo')}
                                    disabled={formData.publicoAlvo.includes(tag)}
                                    className={`text-[10px] px-2 py-1.5 rounded-lg border font-bold transition-all uppercase tracking-wide ${
                                        formData.publicoAlvo.includes(tag) 
                                        ? 'bg-purple-100 border-purple-200 text-purple-400 cursor-default opacity-50' 
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-purple-300 hover:text-purple-600 hover:shadow-sm'
                                    }`}
                                >
                                    {formData.publicoAlvo.includes(tag) ? '✓' : '+'} {tag}
                                </button>
                            ))}
                        </div>

                        {formData.publicoAlvo.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.publicoAlvo.map(t => (
                                    <span key={t} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 animate-in zoom-in-50 duration-200">
                                        {t} <button type="button" onClick={() => removeTag(t, 'publicoAlvo')} className="hover:text-purple-800 bg-purple-100 w-4 h-4 rounded-full flex items-center justify-center">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input 
                            className="w-full border border-slate-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-purple-100 outline-none text-sm font-medium placeholder:text-slate-400"
                            placeholder="Digite outro público e pressione Enter..."
                            onKeyDown={e => handleTagInput(e, 'publicoAlvo')}
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                         <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                         <Button type="submit" variant="deep" disabled={loading}>
                            {loading ? "Salvando..." : (grupo ? "Salvar Alterações" : "Criar Grupo")}
                         </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
