'use client';

import { useState } from 'react';
import { updateDadosCadastrais, saveAnamnese, createProntuario, addEvolucao, updateEvolucao, deleteEvolucao } from '../actions_prontuario';
import { toast } from 'sonner';
import {
  FileText, User, Activity, Plus, Save, Clock,
  Phone, MapPin, Briefcase, Heart, Users, Calendar, Shield,
  Edit2, X, Check, Download, Trash2
} from 'lucide-react';
import { gerarPDFAnamnese, gerarPDFEvolucao, gerarPDFProntuarioCompleto } from '@/lib/gerarPDF';

interface ProntuarioManagerProps {
  pacienteId: string;
  paciente?: any;
  dadosCadastrais: any;
  anamneseInicial: any;
  prontuarioInicial: any;
  psicologoLogado?: any;
}

// ─── Máscaras ──────────────────────────────────────────────────────────────
const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
};
const maskCEP = (v: string) =>
  v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
const formatCPF = (v?: string) => {
  if (!v) return '—';
  const d = v.replace(/\D/g, '');
  if (d.length !== 11) return v;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
};
const formatPhone = (v?: string) => {
  if (!v) return '—';
  const d = v.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return v;
};

// ─── Sub-componentes ───────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-400 uppercase tracking-widest block mb-1.5">
      {children}
    </label>
  );
}

function FieldValue({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon size={14} className="text-slate-300 shrink-0" />}
      <span className="text-base font-medium text-slate-800">{children || '—'}</span>
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder, mask, icon: Icon }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mask?: (v: string) => string; icon?: any;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"><Icon size={14} /></div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(mask ? mask(e.target.value) : e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 py-2.5 pr-3 focus:outline-none focus:ring-2 focus:ring-deep/5 focus:border-deep/20 transition-all placeholder:text-slate-300 ${Icon ? 'pl-9' : 'pl-3'}`}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, children, action }: {
  title: string; subtitle?: string; icon?: any; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-deep">
              <Icon size={15} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-slate-800">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function TextAreaGroup({ label, sublabel, value, onChange, rows = 4, placeholder }: {
  label: string; sublabel?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        {sublabel && <p className="text-sm text-slate-600 mt-1">{sublabel}</p>}
      </div>
      <textarea
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-deep/5 focus:border-deep/20 transition-all resize-y placeholder:text-slate-300"
        rows={rows}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Clique para preencher...'}
      />
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────
export default function ProntuarioManager({
  pacienteId, paciente, dadosCadastrais, anamneseInicial, prontuarioInicial, psicologoLogado
}: ProntuarioManagerProps) {
  const [activeSection, setActiveSection] = useState<'dados' | 'anamnese' | 'prontuario'>('prontuario');
  const [anamnese, setAnamnese] = useState(anamneseInicial);
  const [prontuario, setProntuario] = useState(prontuarioInicial);
  const [loading, setLoading] = useState(false);
  const [editandoDados, setEditandoDados] = useState(false);

  // Form dados cadastrais
  const [dadosForm, setDadosForm] = useState({
    nome: paciente.nome || '',
    cpf: paciente.cpf || '',
    dataNascimento: dadosCadastrais?.dataNascimento || '',
    profissao: dadosCadastrais?.profissao || '',
    estadoCivil: dadosCadastrais?.estadoCivil || '',
    cidade: dadosCadastrais?.cidade || '',
    estado: dadosCadastrais?.estado || '',
    telefone: dadosCadastrais?.telefone || '',
    outrosContatos: dadosCadastrais?.outrosContatos || '',
    cep: dadosCadastrais?.cep || '',
    endereco: dadosCadastrais?.endereco || '',
  });

  // Form anamnese
  const [anamneseForm, setAnamneseForm] = useState(anamneseInicial || {});

  // Form nova evolução
  const [novaEvolucaoAberta, setNovaEvolucaoAberta] = useState(false);
  const [evolucaoForm, setEvolucaoForm] = useState({
    demanda: '',
    planoTrabalho: '',
    conteudo: '',
    procedimentos: '',
  });
  const [editandoAnamnese, setEditandoAnamnese] = useState(!anamneseInicial);
  
  // Edição de evolução
  const [editingEvolutionId, setEditingEvolutionId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Helper para formatar texto e evitar erros de impressão
  const formatarTexto = (texto: string) => {
    if (!texto) return '';
    return texto
        .replace(/\r\n/g, '\n')           // Normaliza quebras de linha
        .replace(/[ \t]+/g, ' ')          // Remove espaços múltiplos e tabs convertendo para 1 espaço
        .replace(/\n\s/g, '\n')           // Remove espaço logo após quebra de linha
        .replace(/\s\n/g, '\n')           // Remove espaço logo antes de quebra de linha
        .replace(/\n{3,}/g, '\n\n')       // Limita a, no máximo, 2 quebras de linha consecutivas (parágrafos)
        .trim();                          // Remove espaços do início e fim
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveDados = async () => {
    setLoading(true);
    const res = await updateDadosCadastrais(pacienteId, dadosForm);
    setLoading(false);
    if (res.success) { toast.success('Dados atualizados!'); setEditandoDados(false); }
    else toast.error('Erro ao atualizar dados.');
  };

  const handleSaveAnamnese = async () => {
    setLoading(true);
    const res = await saveAnamnese(pacienteId, anamneseForm);
    setLoading(false);
    if (res.success) {
      setAnamnese(res.anamnese);
      setEditandoAnamnese(false);
      toast.success('Anamnese salva!');
    } else toast.error('Erro ao salvar anamnese.');
  };

  const handleCreateProntuario = async () => {
    setLoading(true);
    const res = await createProntuario(pacienteId, { demanda: '', planoTrabalho: '' });
    setLoading(false);
    if (res.success) { setProntuario(res.prontuario); toast.success('Prontuário aberto!'); }
    else toast.error('Erro ao abrir prontuário.');
  };

  const handleAddEvolucao = async () => {
    if (!evolucaoForm.conteudo.trim()) return toast.error('Preencha o Registro do Atendimento.');
    if (!prontuario?.id) return toast.error('Prontuário não encontrado.');
    setLoading(true);
    
    // Formata o texto antes de enviar
    const conteudoFormatado = formatarTexto(evolucaoForm.conteudo);
    
    const res = await addEvolucao(prontuario.id, {
      data: new Date().toISOString(),
      demanda: evolucaoForm.demanda,
      planoTrabalho: evolucaoForm.planoTrabalho,
      conteudo: conteudoFormatado,
      procedimentos: evolucaoForm.procedimentos,
      psicologoId: psicologoLogado?.id ?? null,
    });
    setLoading(false);
    if (res.success) {
      toast.success('Evolução registrada!');
      setEvolucaoForm({ demanda: '', planoTrabalho: '', conteudo: '', procedimentos: '' });
      setNovaEvolucaoAberta(false);
      const novaEv = { ...res.evolucao, psicologo: psicologoLogado ?? null };
      setProntuario((prev: any) => ({ ...prev, evolucoes: [novaEv, ...(prev?.evolucoes ?? [])] }));
    } else toast.error('Erro ao registrar evolução.');
  };

  const handleUpdateEvolucao = async (id: string) => {
    if (!editingContent.trim()) return toast.error('O conteúdo não pode estar vazio.');
    
    // Formata o texto antes de atualizar
    const conteudoFormatado = formatarTexto(editingContent);
    
    setLoadingEdit(true);
    const res = await updateEvolucao(id, { conteudo: conteudoFormatado });
    setLoadingEdit(false);
    
    if (res.success) {
      toast.success('Evolução atualizada!');
      setEditingEvolutionId(null);
      setEditingContent('');
      
      // Atualiza o estado local
      setProntuario((prev: any) => ({
        ...prev,
        evolucoes: prev.evolucoes.map((ev: any) => 
          ev.id === id ? { ...ev, conteudo: conteudoFormatado } : ev
        )
      }));
    } else {
      toast.error('Erro ao atualizar evolução.');
    }
  };

  const handleDeleteEvolucao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta evolução? Esta ação não pode ser desfeita.')) return;
    
    const res = await deleteEvolucao(id);
    
    if (res.success) {
      toast.success('Evolução excluída com sucesso!');
      setProntuario((prev: any) => ({
        ...prev,
        evolucoes: prev.evolucoes.filter((ev: any) => ev.id !== id)
      }));
    } else {
      toast.error('Erro ao excluir evolução.');
    }
  };

  // Contato de emergência
  const contatoEmergNome = dadosForm.outrosContatos?.split('|')[0] || '';
  const contatoEmergTel  = dadosForm.outrosContatos?.split('|')[1] || '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── 2. MENU E NAVEGAÇÃO ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        {/* Toggle centralizado/esquerda */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit self-start">
          {[
            { key: 'prontuario', icon: Activity, label: 'Evoluções' }, // Prontuário como padrão e nome mais curto
            { key: 'anamnese',   icon: FileText, label: 'Anamnese' },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveSection(key as any)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === key 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Botão de Dados Cadastrais (como utilitário à direita) */}
        <button 
          onClick={() => setActiveSection('dados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            activeSection === 'dados'
              ? 'bg-slate-50 border-slate-200 text-deep'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <User size={14} /> Dados Cadastrais
        </button>
      </div>

      {/* ── 1. DADOS PESSOAIS ─────────────────────────────────────── */}
      {activeSection === 'dados' && (
      <SectionCard
        title="Identificação do Paciente"
        subtitle="Dados cadastrais e informações de contato"
        icon={User}
        action={
          editandoDados ? (
            <div className="flex gap-2">
              <button onClick={() => setEditandoDados(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                <X size={12} /> Cancelar
              </button>
              <button onClick={handleSaveDados} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-white bg-deep hover:bg-slate-900 transition-colors shadow-sm">
                <Check size={12} /> {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditandoDados(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-500 bg-white border border-slate-200 hover:border-deep/20 hover:text-deep transition-colors">
              <Edit2 size={12} /> Editar
            </button>
          )
        }
      >
        {editandoDados ? (
          <div className="space-y-6">
            {/* Dados pessoais */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Dados Pessoais</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldInput label="Nome Completo" value={dadosForm.nome}
                  onChange={v => setDadosForm({ ...dadosForm, nome: v })} placeholder="Nome completo" icon={User} />
                <FieldInput label="Data de Nascimento" value={dadosForm.dataNascimento ? new Date(dadosForm.dataNascimento).toISOString().split('T')[0] : ''}
                  onChange={v => setDadosForm({ ...dadosForm, dataNascimento: v })} type="date" icon={Calendar} />
                <FieldInput label="CPF" value={dadosForm.cpf}
                  onChange={v => setDadosForm({ ...dadosForm, cpf: v })} 
                  mask={(v) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1')}
                  placeholder="000.000.000-00" icon={Shield} />
              </div>
            </div>
            {/* Perfil */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Perfil</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput label="Profissão" value={dadosForm.profissao}
                  onChange={v => setDadosForm({ ...dadosForm, profissao: v })} placeholder="Ex: Engenheiro(a)..." icon={Briefcase} />
                <div className="space-y-1.5">
                  <FieldLabel>Estado Civil</FieldLabel>
                  <div className="relative">
                    <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select value={dadosForm.estadoCivil} onChange={e => setDadosForm({ ...dadosForm, estadoCivil: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-deep/5 focus:border-deep/20 transition-all appearance-none">
                      <option value="">Selecione...</option>
                      {['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'].map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Contato & Endereço */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Contato & Endereço</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldInput label="Telefone" value={dadosForm.telefone}
                  onChange={v => setDadosForm({ ...dadosForm, telefone: maskPhone(v) })} placeholder="(00) 00000-0000" icon={Phone} />
                <FieldInput label="CEP" value={dadosForm.cep}
                  onChange={v => setDadosForm({ ...dadosForm, cep: maskCEP(v) })} placeholder="00000-000" icon={MapPin} />
                <div className="grid grid-cols-2 gap-2">
                  <FieldInput label="Cidade" value={dadosForm.cidade}
                    onChange={v => setDadosForm({ ...dadosForm, cidade: v })} placeholder="Cidade" />
                  <FieldInput label="UF" value={dadosForm.estado}
                    onChange={v => setDadosForm({ ...dadosForm, estado: v.toUpperCase().slice(0, 2) })} placeholder="SP" />
                </div>
              </div>
              <div className="mt-4">
                <FieldInput label="Endereço" value={dadosForm.endereco}
                  onChange={v => setDadosForm({ ...dadosForm, endereco: v })} placeholder="Rua, número, complemento..." icon={MapPin} />
              </div>
            </div>
            {/* Contato de emergência */}
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Contato de Emergência</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput label="Nome do Contato" value={contatoEmergNome}
                  onChange={v => setDadosForm({ ...dadosForm, outrosContatos: `${v}|${contatoEmergTel}` })}
                  placeholder="Nome completo" icon={Users} />
                <FieldInput label="Telefone do Contato" value={contatoEmergTel}
                  onChange={v => setDadosForm({ ...dadosForm, outrosContatos: `${contatoEmergNome}|${maskPhone(v)}` })}
                  placeholder="(00) 00000-0000" icon={Phone} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-5">
              <div><FieldLabel>Nome Completo</FieldLabel><FieldValue icon={User}>{paciente.nome}</FieldValue></div>
              <div>
                <FieldLabel>Data de Nascimento</FieldLabel>
                <FieldValue icon={Calendar}>
                  {dadosCadastrais.dataNascimento ? new Date(dadosCadastrais.dataNascimento).toLocaleDateString('pt-BR') : '—'}
                </FieldValue>
              </div>
              <div><FieldLabel>CPF</FieldLabel><FieldValue icon={Shield}>{formatCPF(paciente.cpf)}</FieldValue></div>
              <div><FieldLabel>Profissão</FieldLabel><FieldValue icon={Briefcase}>{dadosCadastrais.profissao}</FieldValue></div>
              <div><FieldLabel>Estado Civil</FieldLabel><FieldValue icon={Heart}>{dadosCadastrais.estadoCivil}</FieldValue></div>
              <div><FieldLabel>Telefone</FieldLabel><FieldValue icon={Phone}>{formatPhone(dadosCadastrais.telefone)}</FieldValue></div>
              <div>
                <FieldLabel>Cidade / UF</FieldLabel>
                <FieldValue icon={MapPin}>
                  {dadosCadastrais.cidade ? `${dadosCadastrais.cidade}${dadosCadastrais.estado ? ' / ' + dadosCadastrais.estado : ''}` : '—'}
                </FieldValue>
              </div>
              {dadosCadastrais.cep && <div><FieldLabel>CEP</FieldLabel><FieldValue icon={MapPin}>{maskCEP(dadosCadastrais.cep)}</FieldValue></div>}
            </div>
            {dadosCadastrais.endereco && (
              <div className="pt-3 border-t border-slate-100">
                <FieldLabel>Endereço</FieldLabel><FieldValue icon={MapPin}>{dadosCadastrais.endereco}</FieldValue>
              </div>
            )}
            {dadosCadastrais.outrosContatos && (
              <div className="pt-3 border-t border-slate-100">
                <FieldLabel>Contato de Emergência</FieldLabel>
                <div className="flex items-center gap-4 mt-1">
                  <FieldValue icon={Users}>{dadosCadastrais.outrosContatos.split('|')[0] || '—'}</FieldValue>
                  {dadosCadastrais.outrosContatos.includes('|') && (
                    <FieldValue icon={Phone}>{formatPhone(dadosCadastrais.outrosContatos.split('|')[1])}</FieldValue>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
      )}

      {/* ── 3. ANAMNESE ──────────────────────────────────────────── */}
      {activeSection === 'anamnese' && (
        <SectionCard title="Ficha de Anamnese" subtitle="Histórico clínico e queixa principal" icon={FileText}
          action={
            editandoAnamnese ? (
              <div className="flex gap-2">
                {anamnese && (
                  <button onClick={() => { setAnamneseForm(anamnese); setEditandoAnamnese(false); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    <X size={15} /> Cancelar
                  </button>
                )}
                <button onClick={handleSaveAnamnese} disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-deep hover:bg-slate-900 transition-colors shadow-sm">
                  <Save size={15} /> {loading ? 'Salvando...' : 'Salvar Anamnese'}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {anamnese && (
                  <button
                    onClick={async () => await gerarPDFAnamnese(paciente, dadosCadastrais, anamnese, psicologoLogado)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="Exportar Anamnese em PDF">
                    <Download size={15} /> PDF
                  </button>
                )}
                <button onClick={() => setEditandoAnamnese(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  <Edit2 size={15} /> Editar
                </button>
              </div>
            )
          }
        >
          {editandoAnamnese ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextAreaGroup label="1. Queixa Principal e Sintomas"
                sublabel="Quais os principais sintomas e a intensidade deles? Quando começaram?"
                value={anamneseForm.sintomas} onChange={v => setAnamneseForm({ ...anamneseForm, sintomas: v })} />
              <TextAreaGroup label="2. Histórico da Demanda Atual"
                sublabel="Quando os sintomas começaram e como evoluíram?"
                value={anamneseForm.inicioSintomas} onChange={v => setAnamneseForm({ ...anamneseForm, inicioSintomas: v })} />
              <TextAreaGroup label="3. Histórico Familiar"
                sublabel="Casos de transtornos psicológicos na família?"
                value={anamneseForm.historicoFamiliar} onChange={v => setAnamneseForm({ ...anamneseForm, historicoFamiliar: v })} />
              <TextAreaGroup label="4. Tratamentos Prévios"
                sublabel="Já fez terapia antes? Medicamentos?"
                value={anamneseForm.tratamentoPrevio} onChange={v => setAnamneseForm({ ...anamneseForm, tratamentoPrevio: v })} />
              <TextAreaGroup label="5. Rotina e Hábitos"
                sublabel="Breve descrição de rotina, sono, alimentação e hobbies."
                value={anamneseForm.rotinaHobbies} onChange={v => setAnamneseForm({ ...anamneseForm, rotinaHobbies: v })} />
              <TextAreaGroup label="6. Expectativas"
                sublabel="O que espera do processo terapêutico?"
                value={anamneseForm.expectativas} onChange={v => setAnamneseForm({ ...anamneseForm, expectativas: v })} />
            </div>
          ) : (
            /* Modo visualização — estilo card como as evoluções */
            (() => {
              const campos = [
                { label: '1. Queixa Principal e Sintomas',  value: anamnese?.sintomas },
                { label: '2. Histórico da Demanda Atual',   value: anamnese?.inicioSintomas },
                { label: '3. Histórico Familiar',           value: anamnese?.historicoFamiliar },
                { label: '4. Tratamentos Prévios',          value: anamnese?.tratamentoPrevio },
                { label: '5. Rotina e Hábitos',             value: anamnese?.rotinaHobbies },
                { label: '6. Expectativas',                  value: anamnese?.expectativas },
              ];
              const preenchidos = campos.filter(c => c.value?.trim());
              if (preenchidos.length === 0) {
                return (
                  <div className="py-10 text-center">
                    <p className="text-sm text-slate-400">Anamnese ainda não preenchida.</p>
                    <button onClick={() => setEditandoAnamnese(true)}
                      className="mt-3 text-xs text-deep hover:underline font-medium">
                      Preencher agora
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preenchidos.map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </SectionCard>
      )}

      {/* ── 4. PRONTUÁRIO ────────────────────────────────────────── */}
      {activeSection === 'prontuario' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">

          {!prontuario ? (
            /* Estado vazio — prontuário não iniciado */
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5 border border-slate-100">
                <FileText size={24} className="text-slate-300" />
              </div>
              <h3 className="text-base font-medium text-slate-700 mb-2">Prontuário não iniciado</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
                O prontuário oficializa o início do tratamento. Cada sessão será registrada como uma evolução com data, hora e responsável.
              </p>
              <button onClick={handleCreateProntuario} disabled={loading}
                className="inline-flex items-center gap-2 bg-deep text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-900 transition-all shadow-lg shadow-deep/20">
                <Plus size={16} /> {loading ? 'Abrindo...' : 'Abrir Prontuário'}
              </button>
            </div>
          ) : (
            <>
              {/* ── Cabeçalho com botão Nova Evolução ── */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-800">Evoluções do Prontuário</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aberto em {new Date(prontuario.criadoEm).toLocaleDateString('pt-BR')} ·{' '}
                    <span className="font-medium">{prontuario.evolucoes?.length ?? 0}</span> registro{prontuario.evolucoes?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(prontuario.evolucoes?.length > 0) && !novaEvolucaoAberta && (
                    <button
                      onClick={async () => await gerarPDFProntuarioCompleto(paciente, dadosCadastrais, anamnese, prontuario)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      title="Exportar prontuário completo em PDF">
                      <Download size={15} /> PDF Completo
                    </button>
                  )}
                  <button
                    onClick={() => setNovaEvolucaoAberta(v => !v)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                      novaEvolucaoAberta
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-deep text-white hover:bg-slate-900 shadow-deep/20'
                    }`}
                  >
                    {novaEvolucaoAberta ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nova Evolução</>}
                  </button>
                </div>
              </div>

              {/* ── Formulário de nova evolução (expansível) ── */}
              {novaEvolucaoAberta && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-top-2 duration-200">
                  {/* Header do form */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-deep flex items-center justify-center">
                        <Plus size={15} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Nova Evolução</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                          {psicologoLogado && ` · ${psicologoLogado.nome}`}
                        </p>
                      </div>
                    </div>
                    <button onClick={handleAddEvolucao} disabled={loading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                      <Save size={14} /> {loading ? 'Salvando...' : 'Registrar Evolução'}
                    </button>
                  </div>

                  {/* Campos do form */}
                  <div className="p-6">
                    <TextAreaGroup
                      label="Registro do Atendimento"
                      sublabel="Avaliação de demanda, definição dos objetivos do trabalho, procedimentos técnicos científicos adotados. Registre também em caso de encerramento ou encaminhamento."
                      value={evolucaoForm.conteudo}
                      onChange={v => setEvolucaoForm({ ...evolucaoForm, conteudo: v })}
                      rows={8}
                      placeholder="Registro detalhado da sessão..."
                    />
                  </div>
                </div>
              )}

              {/* ── Histórico de evoluções ── */}
              {prontuario.evolucoes?.length > 0 ? (
                <div className="space-y-4">
                  {prontuario.evolucoes.map((ev: any) => {
                    const dataEv = new Date(ev.data);
                    const dataFormatada = dataEv.toLocaleDateString('pt-BR', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                    });
                    const horaFormatada = dataEv.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const isEditing = editingEvolutionId === ev.id;

                    return (
                      <div key={ev.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${isEditing ? 'border-deep/20 ring-2 ring-deep/5' : 'border-slate-200 hover:shadow-md'}`}>
                        {/* Cabeçalho */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm shrink-0">
                              <span className="text-[9px] font-medium text-deep uppercase leading-none">
                                {dataEv.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                              </span>
                              <span className="text-base font-semibold text-slate-800 leading-tight">
                                {dataEv.getDate()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 capitalize">{dataFormatada}</p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                <Clock size={11} /><span>{horaFormatada}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {ev.psicologo && (
                              <div className="flex items-center gap-2 text-right">
                                <div>
                                  <p className="text-xs font-medium text-slate-700">{ev.psicologo.nome}</p>
                                  {ev.psicologo.crp && <p className="text-[10px] text-slate-400">CRP {ev.psicologo.crp}</p>}
                                </div>
                                {ev.psicologo.foto ? (
                                  <img src={ev.psicologo.foto} alt={ev.psicologo.nome}
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-deep text-xs font-semibold border border-slate-200">
                                    {ev.psicologo.nome?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {!isEditing && (
                                <>
                                    <button
                                        onClick={() => handleDeleteEvolucao(ev.id)}
                                        title="Excluir evolução"
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shrink-0">
                                        <Trash2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingEvolutionId(ev.id);
                                            setEditingContent(ev.conteudo);
                                        }}
                                        title="Editar evolução"
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-deep hover:border-deep/20 transition-colors shrink-0">
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={async () => await gerarPDFEvolucao(paciente, dadosCadastrais, ev)}
                                        title="Exportar esta evolução em PDF"
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-deep hover:border-deep/20 transition-colors shrink-0">
                                        <Download size={14} />
                                    </button>
                                </>
                            )}
                          </div>
                        </div>

                        {/* Corpo */}
                        <div className="p-5 space-y-4">
                          {/* Registro */}
                          <div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Registro do Atendimento</p>
                            
                            {isEditing ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-deep/5 focus:border-deep/20 transition-all resize-y placeholder:text-slate-300 min-h-[150px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingEvolutionId(null);
                                                setEditingContent('');
                                            }}
                                            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateEvolucao(ev.id)}
                                            disabled={loadingEdit}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-deep hover:bg-slate-900 rounded-lg transition-colors shadow-sm"
                                        >
                                            <Save size={14} />
                                            {loadingEdit ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{ev.conteudo}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Clock size={28} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Nenhuma evolução registrada</p>
                  <p className="text-xs text-slate-300 mt-1">Clique em "Nova Evolução" para registrar o primeiro atendimento.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
