"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  Smartphone, 
  Users, 
  Zap,
  ArrowRight,
  TrendingUp,
  Lock,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Send,
  X as CloseIcon
} from "lucide-react";
import { useState } from "react";

export default function Recursos() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const MobileFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[3rem] h-[600px] w-[300px] shadow-xl overflow-hidden">
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      <div className="rounded-[2.5rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800">
        {children}
      </div>
    </div>
  );

  const CategoryCarousel = ({ images, title }: { images?: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];
    const isMobileImage = currentImage.includes('diario_paciente') || currentImage.includes('avaliacao_paciente');

    const renderContent = (img: string) => {
      const isMobile = img.includes('diario_paciente') || img.includes('avaliacao_paciente');
      
      if (isMobile) {
        return (
          <div className="flex items-center justify-center p-4 py-8 bg-slate-50/50">
            <MobileFrame>
              <img 
                src={img} 
                alt={title} 
                className="w-full h-full object-cover object-top" 
              />
            </MobileFrame>
          </div>
        );
      }

      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg border border-white/50">
          <img 
            src={img} 
            alt={title} 
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
          />
        </div>
      );
    };

    if (images.length <= 1) {
      return (
        <div 
          className="bg-slate-200/50 p-2 rounded-2xl border border-slate-300/50 shadow-2xl backdrop-blur-xl group overflow-hidden cursor-zoom-in relative"
          onClick={() => setSelectedImage(images[0])}
        >
           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white scale-90 group-hover:scale-100 transition-all duration-300">
                <Search className="w-6 h-6" />
              </div>
           </div>
           {renderContent(images[0])}
        </div>
      );
    }

    return (
      <div className="relative group/carousel">
        <div 
          className="bg-slate-200/50 p-2 rounded-2xl border border-slate-300/50 shadow-2xl backdrop-blur-xl group overflow-hidden cursor-zoom-in relative"
          onClick={() => setSelectedImage(images[currentIndex])}
        >
           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white scale-90 group-hover:scale-100 transition-all duration-300">
                <Search className="w-6 h-6" />
              </div>
           </div>
           {renderContent(images[currentIndex])}
        </div>

        {/* Controls */}
        <button 
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 rounded-full text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 rounded-full text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {images.map((_, i) => (
            <button 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-blue-600 w-4' : 'bg-slate-300'}`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
            />
          ))}
        </div>
      </div>
    );
  };

  const categories = [
    {
      id: "workspace",
      title: "Workspace Clínico & Prontuário",
      subtitle: "Gestão Centralizada para Autônomos",
      description: "Sua clínica em um único lugar. Um prontuário digital estruturado que organiza evoluções, documentos e anexos com segurança absoluta, eliminando a dependência de pastas físicas.",
      features: [
        "Evoluções Narrativas e Estruturadas.",
        "Anamnese Digital Estruturada.",
        "Anexo de Documentos e Exames.",
        "Histórico Completo por Paciente."
      ],
      icon: <LayoutDashboard className="w-6 h-6" />,
      images: ["/images/painel.png", "/images/prontuario.png", "/images/anamnese.png", "/images/paciente_geral.png"]
    },
    {
      id: "diary",
      title: "Diário do Paciente",
      subtitle: "Elo Terapêutico & Predições",
      description: "Acompanhe a jornada do paciente fora do consultório com suporte de Inteligência Artificial. O sistema analisa padrões de humor e sono para prever picos de crise e tendências emocionais.",
      features: [
        "Gráficos de Humor e Sono.",
        "Insights Preditivos via IA.",
        "Alertas de Mudança de Estado.",
        "Detecção de Padrões Críticos."
      ],
      icon: <ClipboardList className="w-6 h-6" />,
      images: ["/images/diario.png", "/images/diario_paciente.png", "/images/diario_paciente_humor.png"]
    },
    {
      id: "instruments",
      title: "Instrumentos Validados",
      subtitle: "Diagnostico Inteligente",
      description: "Aplique escalas validadas e receba uma análise complementar via IA. O sistema cruza dados de differentes instrumentos para sugerir focos terapêuticos e hipóteses diagnósticas.",
      features: [
        "Escalas Digitais Validadas.",
        "Cálculo e Análise IA de Scores.",
        "Predição de Evolução Clínica.",
        "Relatórios de Insights Avançados."
      ],
      icon: <ClipboardList className="w-6 h-6" />,
      images: ["/images/instrumentos.png", "/images/instrumentos2.png", "/images/avaliacao_paciente.png"]
    },
    {
      id: "interaction",
      title: "Fluxo de Engajamento",
      subtitle: "Conexão em Tempo Real",
      description: "Elimine a burocracia no acompanhamento clínico. O profissional envia escalas, diários e tarefas diretamente do painel, e o paciente responde de forma nativa e intuitiva no celular. Os dados retornam instantaneamente para o seu Workspace, prontos para análise.",
      features: [
        "Envio Instantâneo de Instrumentos.",
        "Resposta Mobile para o Paciente.",
        "Sincronização em Tempo Real.",
        "Notificações de Tarefas Concluídas."
      ],
      icon: <Send className="w-6 h-6" />,
      images: ["/images/avaliacao_paciente.png", "/images/diario_paciente_humor.png"]
    },
    {
      id: "agenda",
      title: "Agenda Inteligente",
      subtitle: "Gestão de Fluxo Clínico",
      description: "Organize sua rotina com uma agenda desenvolvida para a dinâmica do psicólogo. Controle atendimentos individuais e em grupo, com ferramentas de recorrência automática e métricas de produtividade mensal.",
      features: [
        "Sessões Recorrentes Automáticas.",
        "Status de Atendimento (Realizado/Remarcado).",
        "Métricas Financeiras Mensais Integradas.",
        "Filtro de Atendimento Individual e Grupo."
      ],
      icon: <Calendar className="w-6 h-6" />,
      images: ["/images/agenda.png"]
    },
    {
       id: "groups",
       title: "Grupos Terapêuticos",
       subtitle: "Comunidade & Engajamento",
       description: "Transforme sua prática com ferramentas exclusivas para grupos. O PsiDuo oferece um ecossistema completo de interação, desde o termômetro emocional coletivo até missões de engajamento terapêutico.",
       features: [
         "Termômetro Coletivo (Check-ins).",
         "Feed de Comunidade Privado.",
         "Missões e Desafios Terapêuticos.",
         "Dashboard de Adesão e Engajamento."
       ],
       icon: <Users className="w-6 h-6" />,
       images: ["/images/grupos.png", "/images/termometro.png", "/images/comunidade.png", "/images/missoes.png"]
    },
    {
       id: "finance",
       title: "Módulo Financeiro",
       subtitle: "Saúde do seu Negócio",
       description: "Controle total sobre faturamento e sessões. Ideal para o psicólogo autônomo que busca profissionalismo sem a complexidade de planilhas manuais.",
       features: [
         "Relatórios de Fluxo de Caixa.",
         "Controle de Sessões Pagas/Pendentes.",
         "Gestão de Convênios e Particular.",
         "Taxa 0% sobre suas Consultas."
       ],
       icon: <BarChart3 className="w-6 h-6" />,
       images: ["/images/financeiro.png"]
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="bg-slate-900 relative py-24 lg:py-40 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,30,59,0.8),rgba(2,6,23,1))]"></div>
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-3xl space-y-8">

            
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              Ferramentas de <br/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-black">Alta Performance.</span>
            </h1>
            
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
              O PsiDuo é o ecossistema definitivo para o psicólogo moderno. Uma plataforma completa de ferramentas desenvolvidas para eficiência clínica e crescimento profissional.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
               <Link href="/planos" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 transition-all">
                 Conhecer Planos
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- DETALHAMENTO DE RECURSOS --- */}
      <section id="features" className="py-24 px-6 space-y-32">
        {categories.map((cat, index) => (
          <div key={cat.id} className="container mx-auto max-w-6xl">
            <div className={`flex flex-col lg:flex-row items-center gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Content Side */}
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">{cat.subtitle}</div>
                    <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-none">{cat.title}</h2>
                  </div>
                </div>

                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                  {cat.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cat.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 leading-tight uppercase tracking-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Side */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-[120px] opacity-40 -z-10"></div>
                <CategoryCarousel images={cat.images} title={cat.title} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- GRID DE EXCELÊNCIA (MICRO-FEATURES) --- */}
      <section className="py-24 bg-slate-900 px-6">
        <div className="container mx-auto max-w-6xl">
           <div className="text-center mb-20 space-y-4">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Infraestrutura e Segurança</div>
             <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">Sua prática clínica com o <span className="text-blue-500">máximo de segurança.</span></h2>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { title: 'Criptografia Ponta a Ponta', desc: 'Dados clínicos protegidos por protocolos avançados.', icon: <Lock className="w-5 h-5" /> },
                { title: 'Conformidade LGPD', desc: 'Total alinhamento com a proteção de dados sensíveis.', icon: <ShieldCheck className="w-5 h-5" /> },
                { title: 'Sincronização Cloud', desc: 'Acesse seus dados de qualquer dispositivo, a qualquer hora.', icon: <Smartphone className="w-5 h-5" /> },
                { title: 'Insights de Crescimento', desc: 'Gráficos de tendências e projeção de receita.', icon: <TrendingUp className="w-5 h-5" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group">
                   <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                   </div>
                   <h3 className="text-xs font-bold text-white uppercase tracking-tight mb-2 leading-tight">{item.title}</h3>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-4xl text-center space-y-12">
           <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
             A jornada digital do seu <br/> <span className="text-blue-600">consultório começa aqui.</span>
           </h2>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
              Escolha o plano ideal para a sua necessidade e impulsione sua eficiência clínica com o PsiDuo.
            </p>
            <div className="flex justify-center">
              <Link href="/planos" className="h-14 px-12 bg-slate-900 hover:bg-black text-white rounded-xl flex items-center justify-center font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition shadow-slate-900/10">
                 Conhecer Planos
              </Link>
            </div>
        </div>
      </section>

      <Footer />

      {/* --- IMAGE LIGHTBOX --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300 pointer-events-auto"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-7xl max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
            <img 
              src={selectedImage} 
              alt="Zoomed Resource" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </main>
  );
}
