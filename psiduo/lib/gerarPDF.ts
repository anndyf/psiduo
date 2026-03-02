import jsPDF from 'jspdf';
import { 
    PHQ9_QUESTIONS, 
    GAD7_QUESTIONS, 
    WHO5_QUESTIONS,
    PSS10_QUESTIONS,
    ISI_QUESTIONS,
    INSTRUMENT_OPTIONS, 
    PHQ9_FUNCTIONAL_QUESTION, 
    FUNCTIONAL_OPTIONS 
} from '@/app/painel/pacientes/components/instruments/constants';

// ─── Configurações ─────────────────────────────────────────────────────────
const MARGIN = 20;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 7;

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatDateTime(d: any) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR') + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatCPF(v?: string) {
  const d = v?.replace(/\D/g, '');
  return d?.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}` : v || '—';
}

// ─── Classe de Escrita PDF (Medical Style) ──────────────────────────────────
class ClinicalPDF {
  doc: jsPDF;
  y: number;

  constructor() {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.y = MARGIN;
  }

  checkPage(needed = 10) {
    // Margem inferior padrão de 12mm para consistência em todas as páginas
    if (this.y + needed > PAGE_H - 12) { 
      this.doc.addPage();
      this.y = MARGIN + 10;
    }
  }

  // Cabeçalho Profissional/Clínico
  async drawHeader(paciente: any, dados: any, tituloDoc: string, psicologo?: any) {
    // Logo (imagem do /public) - Aumentado
    try {
        this.doc.addImage('/logo-azul.png', 'PNG', MARGIN, 15, 50, 25);
    } catch (e) {
        console.error("Erro ao carregar logo no PDF", e);
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('PsiDuo.', MARGIN, 25);
    }

    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(15, 23, 42); // Navy blue
    // Substituído para PRONTUÁRIO PSICOLÓGICO
    this.doc.text('PRONTUÁRIO PSICOLÓGICO', PAGE_W - MARGIN, 25, { align: 'right' });
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100);
    // Substituído se for o texto antigo
    const tituloFinal = tituloDoc === 'Prontuário de Atendimento (Evoluções)' ? 'REGISTROS DE ATENDIMENTO' : tituloDoc;
    this.doc.text(tituloFinal.toUpperCase(), PAGE_W - MARGIN, 32, { align: 'right' });

    this.y = 50;

    // ─── 1. Informações do Paciente ───
    this.doc.setFillColor(15, 23, 42); // Navy Blue
    this.doc.rect(MARGIN, this.y, CONTENT_W, 8, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255); // White
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('INFORMAÇÕES DO PACIENTE', MARGIN + 3, this.y + 5.5);
    
    this.y += 18;

    this.doc.setFontSize(10);
    this.doc.setTextColor(0);

    const INDENT = 5;

    // Linha 1: Nome | CPF
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Nome:', MARGIN + INDENT, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(paciente?.nome || dados?.nome || '—', MARGIN + INDENT + 15, this.y);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('CPF:', MARGIN + INDENT + 100, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(formatCPF(paciente?.cpf || dados?.cpf), MARGIN + INDENT + 115, this.y);

    this.y += 6;

    // Linha 2: Data Nasc | Telefone
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Nascimento:', MARGIN + INDENT, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(dados?.dataNascimento ? new Date(dados.dataNascimento).toLocaleDateString('pt-BR') : '—', MARGIN + INDENT + 25, this.y);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Telefone:', MARGIN + INDENT + 100, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(dados?.telefone || paciente?.whatsapp || '—', MARGIN + INDENT + 120, this.y);

    this.y += 6;

    // Linha 3: Estado Civil | Profissão
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Est. Civil:', MARGIN + INDENT, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(dados?.estadoCivil || '—', MARGIN + INDENT + 20, this.y);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Profissão:', MARGIN + INDENT + 100, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(dados?.profissao || '—', MARGIN + INDENT + 120, this.y);

    this.y += 6;

    // Linha 4: Cidade/UF
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Cidade/UF:', MARGIN + INDENT, this.y);
    this.doc.setFont('helvetica', 'normal');
    const cidadeUF = (dados?.cidade || '') + (dados?.cidade && dados?.estado ? ' / ' : '') + (dados?.estado || '');
    this.doc.text(cidadeUF || '—', MARGIN + INDENT + 25, this.y);

    this.y += 6;

    // Linha 5: Contato Emergência (Nova Linha)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Emergência:', MARGIN + INDENT, this.y);
    this.doc.setFont('helvetica', 'normal');
    let contatoEmerg = '—';
    if (dados?.outrosContatos) {
        const parts = dados.outrosContatos.split('|');
        if (parts.length > 1) contatoEmerg = `${parts[0]} - ${parts[1]}`;
        else contatoEmerg = parts[0];
    }
    this.doc.text(contatoEmerg, MARGIN + INDENT + 25, this.y);

    this.y += 12;

    // ─── 2. Psicólogo Responsável (se houver) ───
    if (psicologo) {
        this.doc.setFillColor(15, 23, 42); // Navy Blue
        this.doc.rect(MARGIN, this.y, CONTENT_W, 8, 'F');
        
        this.doc.setFontSize(10);
        this.doc.setTextColor(255, 255, 255); // White
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('PSICÓLOGO RESPONSÁVEL', MARGIN + 3, this.y + 5.5);
        
        this.y += 18;

        this.doc.setFontSize(10);
        this.doc.setTextColor(0);

        // Linha 1: Nome | CRP
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Nome:', MARGIN + INDENT, this.y);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(psicologo.nome || '—', MARGIN + INDENT + 15, this.y);

        this.doc.setFont('helvetica', 'bold');
        this.doc.text('CRP:', MARGIN + INDENT + 100, this.y);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(psicologo.crp || '—', MARGIN + INDENT + 115, this.y);

        this.y += 6;
        
        if (psicologo.telefone) {
             this.doc.setFont('helvetica', 'bold');
             this.doc.text('Contato:', MARGIN + INDENT, this.y);
             this.doc.setFont('helvetica', 'normal');
             this.doc.text(psicologo.telefone, MARGIN + INDENT + 18, this.y);
             this.y += 6;
        }

        this.y += 6;
    } else {
        this.y += 5;
    }

    // Linha divisória discreta antes do conteúdo principal
    this.doc.setDrawColor(200);
    this.doc.setLineWidth(0.1);
    this.doc.line(MARGIN, this.y, PAGE_W - MARGIN, this.y);
    this.y += 8;
  }

  // Título de Seção
  section(title: string) {
    this.checkPage(15);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(100);
    this.doc.text(title.toUpperCase(), MARGIN, this.y);
    this.doc.setDrawColor(150);
    this.doc.setLineWidth(0.2);
    this.doc.line(MARGIN, this.y + 2, PAGE_W - MARGIN, this.y + 2);
    this.y += 10;
  }

  // Blocos de texto (Label + Valor)
  field(label: string, value: string) {
    if (!value?.trim()) return;
    this.checkPage(15);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(120);
    this.doc.text(label, MARGIN, this.y);
    this.y += 5;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0);
    const lines = this.doc.splitTextToSize(value, CONTENT_W);
    const h = lines.length * 5;
    this.checkPage(h + 5);
    this.doc.text(lines, MARGIN, this.y);
    this.y += h + 8;
  }

  // Rodapé com Assinatura (para quando houver finalização de página ou documento)
  drawSignature(psicologo: any) {
    // Reduzido para 20mm o espaço necessário para evitar quebra prematura de página
    this.checkPage(20);
    this.y += 5; // Padding superior reduzido
    this.doc.setDrawColor(0);
    this.doc.setLineWidth(0.2);
    this.doc.line(PAGE_W / 2 - 40, this.y, PAGE_W / 2 + 40, this.y);
    this.y += 5;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(psicologo?.nome || 'Profissional Responsável', PAGE_W / 2, this.y, { align: 'center' });
    this.y += 5;
    if (psicologo?.crp) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Psicólogo(a) — CRP ${psicologo.crp}`, PAGE_W / 2, this.y, { align: 'center' });
    }
  }

  // Paginação básica
  pageNumbers() {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150);
      this.doc.text(`Página ${i} de ${total}`, PAGE_W - MARGIN, PAGE_H - 10, { align: 'right' });
      this.doc.text('PsiDuo — Documento de Caráter Confidencial', MARGIN, PAGE_H - 10);
    }
  }

  // Novo método para imprimir blocos de texto com quebra de página automática e padding
  printBlock(text: string) {
    const PADDING_X = 5; // Padding lateral de 5mm
    const BLOCK_WIDTH = CONTENT_W - (PADDING_X * 2);
    
    // Normaliza o texto e divide em parágrafos
    const paragraphs = text.split('\n');
    
    this.y += 3; // Padding superior extra do bloco

    this.doc.setFontSize(12); // Fonte do texto aumentada para 12
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0);

    const lineHeight = 7; // Altura da linha aumentada para acompanhar a fonte

    paragraphs.forEach((paragraph) => {
        if (!paragraph.trim()) {
            this.y += lineHeight / 2;
            return;
        }

        const lines = this.doc.splitTextToSize(paragraph, BLOCK_WIDTH);

        lines.forEach((line: string, index: number) => {
            // Margem inferior reduzida para 1.2cm (estava 2cm)
            if (this.y + lineHeight > PAGE_H - 12) {
                this.doc.addPage();
                this.y = MARGIN + 10;
            }

            const isLastLine = index === lines.length - 1;
            line = line.trim();
            
            // Lógica de justificação manual
            const words = line.split(/\s+/); // Divide por espaços
            
            // Só justifica se não for a última linha e tiver mais de uma palavra
            if (!isLastLine && words.length > 1) {
                // Diminui um pouco a largura alvo (0.2mm) para evitar encostar no limite direito
                const targetWidth = BLOCK_WIDTH - 0.2; 
                const totalWordWidth = words.reduce((acc, w) => acc + this.doc.getTextWidth(w), 0);
                const spaceAvail = targetWidth - totalWordWidth;
                const spacePerGap = spaceAvail / (words.length - 1);
                
                let currentX = MARGIN + PADDING_X;
                words.forEach((word, wIdx) => {
                    this.doc.text(word, currentX, this.y);
                    currentX += this.doc.getTextWidth(word);
                    if (wIdx < words.length - 1) {
                        currentX += spacePerGap;
                    }
                });
            } else {
                // Alinhamento à esquerda normal para última linha ou linha única
                this.doc.text(line, MARGIN + PADDING_X, this.y);
            }

            this.y += lineHeight;
        });
        
        this.y += 2; 
    });

    this.y += 6; // Espaço após o bloco todo
  }
}

// ─── Exportar PDF Anamnese ──────────────────────────────────────────────────
// ─── Exportar PDF Anamnese ──────────────────────────────────────────────────
// ─── Exportar PDF Anamnese ──────────────────────────────────────────────────
export const gerarPDFAnamnese = async (paciente: any, dados: any, anamnese: any, psicologo?: any) => {
  const p = new ClinicalPDF();
  
  // Cabeçalho
  await p.drawHeader(paciente, dados, 'Ficha de Anamnese', psicologo);

  p.y += 8; // Espaço reduzido após o cabeçalho dinâmico

  // Seção de Anamnese
  p.doc.setFillColor(241, 245, 249); // slate-100
  p.doc.rect(MARGIN, p.y, CONTENT_W, 7, 'F');

  p.doc.setFontSize(14);
  p.doc.setTextColor(30, 41, 59); // Slate 800
  p.doc.setFont('helvetica', 'bold');
  p.doc.text('ANAMNESE DETALHADA', MARGIN + 2, p.y + 5);
  p.y += 18; // Espaço aumentado após cabeçalho (era 12)
  
  const campos = [
    { titulo: '1. Queixa Principal e Sintomas', conteudo: anamnese?.sintomas },
    { titulo: '2. Histórico da Demanda Atual', conteudo: anamnese?.inicioSintomas },
    { titulo: '3. Histórico Familiar', conteudo: anamnese?.historicoFamiliar },
    { titulo: '4. Tratamentos Prévios', conteudo: anamnese?.tratamentoPrevio },
    { titulo: '5. Rotina e Hábitos', conteudo: anamnese?.rotinaHobbies },
    { titulo: '6. Expectativas', conteudo: anamnese?.expectativas },
  ];

  campos.forEach(campo => {
    if (campo.conteudo && campo.conteudo.trim()) {
      // Verifica espaço
      if (p.y + 20 > PAGE_H - 12) {
         p.doc.addPage();
         p.y = MARGIN + 10;
      }

      // Título do campo
      p.doc.setFontSize(14); // Títulos aumentados para 14
      p.doc.setFont('helvetica', 'bold');
      p.doc.setTextColor(30, 41, 59); // Slate 800
      p.doc.text(campo.titulo, MARGIN, p.y);
      p.y += 7; // Espaço um pouco maior após título grande

      // Conteúdo justificado
      p.printBlock(campo.conteudo);
      p.y += 4; // Espaço extra entre seções
    }
  });

  if (!anamnese) {
    p.doc.setFont('helvetica', 'italic');
    p.doc.setTextColor(100);
    p.doc.text('Nenhuma informação de anamnese registrada.', MARGIN, p.y);
  }

  // Assinatura ao final
  if (psicologo) {
      p.drawSignature(psicologo);
  }

  p.pageNumbers();
  const nomeArquivo = (paciente?.nome || dados?.nome || 'Paciente').replace(/\s+/g, '_');
  p.doc.save(`Anamnese_${nomeArquivo}.pdf`);
};

// ─── Exportar PDF Evolução Individual ───────────────────────────────────────
export const gerarPDFEvolucao = async (paciente: any, dados: any, evolucao: any) => {
  const p = new ClinicalPDF();

  // Cabeçalho com dados do psicólogo da evolução, se houver
  await p.drawHeader(paciente, dados, 'Registro de Evolução', evolucao.psicologo);
  
  p.y += 8;

  const sessionDate = new Date(evolucao.data).toLocaleDateString('pt-BR');
  
  // Faixa de cabeçalho da sessão
  p.doc.setFillColor(241, 245, 249); // slate-100
  p.doc.rect(MARGIN, p.y, CONTENT_W, 6, 'F');

  p.doc.setFontSize(14); // Cabeçalho da sessão aumentado
  p.doc.setFont('helvetica', 'bold');
  p.doc.setTextColor(30, 41, 59);
  p.doc.text(`ATENDIMENTO DE ${sessionDate}`, MARGIN + 2, p.y + 4.5);
  p.y += 12; // Espaço maior após cabeçalho
  
  // Conteúdo da evolução justificado
  p.printBlock(evolucao.conteudo);

  if (evolucao.psicologo) {
      p.drawSignature(evolucao.psicologo);
  }

  p.pageNumbers();
  const nomeArquivo = (paciente?.nome || dados?.nome || 'Paciente').replace(/\s+/g, '_');
  p.doc.save(`Evolucao_${sessionDate.replace(/\//g, '-')}_${nomeArquivo}.pdf`);
};

// ─── Exportar PDF Prontuário Completo ───────────────────────────────────────
export const gerarPDFProntuarioCompleto = async (paciente: any, dados: any, anamnese: any, prontuario: any) => {
  const p = new ClinicalPDF();
  const evolucoes = prontuario?.evolucoes || [];
  
  // Usa o psicólogo logado na primeira evolução recente como referência ou nenhum
  const psicologoRef = evolucoes.length > 0 ? evolucoes[0].psicologo : undefined;

  // Cabeçalho
  await p.drawHeader(paciente, dados, 'Prontuário Psicológico', psicologoRef);
  
  p.y += 8;

  if (evolucoes.length === 0) {
    p.doc.setFont('helvetica', 'italic');
    p.doc.setTextColor(100);
    p.doc.text('Nenhuma evolução registrada neste prontuário.', MARGIN, p.y);
  } else {
    // Ordenar cronológico reverso (mais recente primeiro) ou cronológico?
    // O código anterior usava reverse() em uma cópia. Vamos manter.
    const cronologico = [...evolucoes].reverse(); 
    // OBS: Se `evolucoes` do backend já vem desc, o reverse() faria virar asc.
    // Vamos assumir que vem DESC (mais recente primeiro) e queremos imprimir DESC.
    // Se o usuário reclamar da ordem, invertemos. O código original fazia `[...evolucoes].reverse()`.

    // Na verdade, prontuários impressos geralmente são da mais antiga pra mais nova (histórico) ou vice-versa.
    // Vamos iterar simplesmente.
    
    cronologico.forEach((ev: any, i: number) => {
      // Verifica espaço
      if (p.y + 15 > PAGE_H - 12) {
         p.doc.addPage();
         p.y = MARGIN + 10;
      }

      const sessionDate = new Date(ev.data).toLocaleDateString('pt-BR');
      
      // Faixa de cabeçalho
      p.doc.setFillColor(241, 245, 249); // slate-100
      p.doc.rect(MARGIN, p.y, CONTENT_W, 6, 'F');

      p.doc.setFontSize(14); // Cabeçalho da sessão aumentado
      p.doc.setFont('helvetica', 'bold');
      p.doc.setTextColor(30, 41, 59);
      p.doc.text(`SESSÃO ${i + 1} — ${sessionDate}`, MARGIN + 2, p.y + 4.5);
      p.y += 12; // Espaço maior após cabeçalho
      
      // Texto justificado
      p.printBlock(ev.conteudo);
    });
  }

  // Assinatura ao final de todas as evoluções (usa o último psicólogo logado ou o da última sessão)
  if (psicologoRef) {
    p.drawSignature(psicologoRef);
  }

  p.pageNumbers();
  const nomeArquivo = (paciente?.nome || dados?.nome || 'Paciente').replace(/\s+/g, '_');
  p.doc.save(`Prontuario_${nomeArquivo}.pdf`);
};

// ─── Exportar PDF Instrumento ───────────────────────────────────────────────
export const gerarPDFInstrumento = async (
  paciente: any, 
  dados: any, 
  psicologo: any, 
  instrumento: any, 
  instrumentosHistorico: any[]
) => {
  const p = new ClinicalPDF();

  await p.drawHeader(paciente, dados, `Relatório - ${instrumento.tipo}`, psicologo);
  
  p.y += 8;

  const dataApp = new Date(instrumento.data).toLocaleDateString('pt-BR');
  const res = instrumento.resultado;

  p.doc.setFillColor(241, 245, 249);
  p.doc.rect(MARGIN, p.y, CONTENT_W, 6, 'F');
  p.doc.setFontSize(12);
  p.doc.setFont('helvetica', 'bold');
  p.doc.setTextColor(30, 41, 59);
  p.doc.text(`RESULTADO DA AVALIAÇÃO - ${dataApp}`, MARGIN + 2, p.y + 4.5);
  p.y += 12;

  // Resultado
  p.doc.setFontSize(10);
  p.doc.setFont('helvetica', 'bold');
  p.doc.setTextColor(0);
  p.doc.text('Score Total:', MARGIN, p.y);
  p.doc.setFont('helvetica', 'normal');
  p.doc.text(`${res.score} pts`, MARGIN + 25, p.y);
  p.y += 6;

  p.doc.setFont('helvetica', 'bold');
  p.doc.text('Interpretação Clínica:', MARGIN, p.y);
  p.doc.setFont('helvetica', 'normal');
  p.doc.text(res.level, MARGIN + 38, p.y);
  p.y += 16;

  // Respostas
  const questions = instrumento.tipo === 'PHQ-9' 
      ? PHQ9_QUESTIONS 
      : instrumento.tipo === 'GAD-7' 
          ? GAD7_QUESTIONS 
          : instrumento.tipo === 'WHO-5'
              ? WHO5_QUESTIONS
              : instrumento.tipo === 'PSS-10'
                  ? PSS10_QUESTIONS
                  : ISI_QUESTIONS;

  const optionsMap: Record<number, string> = Object.fromEntries(INSTRUMENT_OPTIONS.map((opt: any) => [opt.value, opt.label]));
  if (instrumento.tipo === 'WHO-5') {
        [0,1,2,3,4,5].forEach(v => {
            const labels = ["Nunca", "Algumas vezes", "Menos da metade", "Mais da metade", "Maioria do tempo", "Todo o tempo"];
            optionsMap[v] = labels[v];
        });
  }
  if (instrumento.tipo === 'PSS-10') {
      [0,1,2,3,4].forEach(v => {
          const labels = ["Nunca", "Quase nunca", "Às vezes", "Com certa frequência", "Muito frequentemente"];
          optionsMap[v] = labels[v];
      });
  }
  if (instrumento.tipo === 'ISI') {
      [0,1,2,3,4].forEach(v => {
          const labels = ["Nenhuma / Muito Satisfeito / Nada", "Leve / Satisfeito / Um pouco", "Moderada / Neutro / Moderadamente", "Grave / Insatisfeito / Muito", "Muito Grave / Muito Insatisfeito / Extremamente"];
          optionsMap[v] = labels[v];
      });
  }
  const functionalOptionsMap: Record<number, string> = Object.fromEntries(FUNCTIONAL_OPTIONS.map((opt: any) => [opt.value, opt.label]));
  const functionalAnswer = instrumento.respostas['9'];

  p.doc.setFontSize(11);
  p.doc.setFont('helvetica', 'bold');
  p.doc.text('RESPOSTAS', MARGIN, p.y);
  p.doc.setDrawColor(200);
  p.doc.line(MARGIN, p.y + 2, PAGE_W - MARGIN, p.y + 2);
  p.y += 8;

  Object.entries(instrumento.respostas).forEach(([key, val]: any) => {
      if (key === 'id') return;
      if (key === '9' && instrumento.tipo === 'PHQ-9') {
          // Extra logic below
          return;
      }

      const qIndex = parseInt(key);
      const questionText = questions[qIndex] || `Questão ${qIndex + 1}`;
      const answerText = optionsMap[val] || `${val}`;

      if (p.y + 15 > PAGE_H - MARGIN) {
          p.doc.addPage();
          p.y = MARGIN;
      }

      p.doc.setFontSize(9);
      p.doc.setFont('helvetica', 'bold');
      const lines = p.doc.splitTextToSize(`${qIndex + 1}. ${questionText}`, CONTENT_W);
      p.doc.text(lines, MARGIN, p.y);
      p.y += (lines.length * 4) + 2;

      p.doc.setFontSize(9);
      p.doc.setFont('helvetica', 'normal');
      p.doc.setTextColor(100);
      p.doc.text(`Resposta: ${answerText} (Score: ${val})`, MARGIN + 4, p.y);
      p.doc.setTextColor(0);
      p.y += 8;
  });

  if (instrumento.tipo === 'PHQ-9' && functionalAnswer !== undefined) {
      if (p.y + 15 > PAGE_H - MARGIN) {
          p.doc.addPage();
          p.y = MARGIN;
      }
      p.doc.setFontSize(9);
      p.doc.setFont('helvetica', 'bold');
      const lines = p.doc.splitTextToSize(`Apoio: ${PHQ9_FUNCTIONAL_QUESTION}`, CONTENT_W);
      p.doc.text(lines, MARGIN, p.y);
      p.y += (lines.length * 4) + 2;

      p.doc.setFontSize(9);
      p.doc.setFont('helvetica', 'normal');
      p.doc.setTextColor(100);
      p.doc.text(`Resposta: ${functionalOptionsMap[functionalAnswer]}`, MARGIN + 4, p.y);
      p.doc.setTextColor(0);
      p.y += 10;
  }

  p.y += 4;

  // Evolução
  const sorted = instrumentosHistorico
    .filter(i => i.tipo === instrumento.tipo)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  if (p.y + 40 > PAGE_H - MARGIN) {
      p.doc.addPage();
      p.y = MARGIN;
  }

  if (sorted.length >= 2) {
      const current = sorted[0];
      const previous = sorted[1];
      const diff = current.resultado.score - previous.resultado.score;
      
      let status = "Estável";
      const isWho5 = current.tipo === 'WHO-5';
      let isBetter = false;
      if (diff !== 0) isBetter = isWho5 ? diff > 0 : diff < 0;
      
      if (Math.abs(diff) >= 2) {
          status = isBetter ? "Melhora Clínica" : "Atenção Necessária";
      }

      p.doc.setFontSize(11);
      p.doc.setFont('helvetica', 'bold');
      p.doc.text('ANÁLISE EVOLUTIVA', MARGIN, p.y);
      p.doc.setDrawColor(200);
      p.doc.line(MARGIN, p.y + 2, PAGE_W - MARGIN, p.y + 2);
      p.y += 8;

      p.doc.setFontSize(10);
      p.doc.setFont('helvetica', 'bold');
      p.doc.text('Tendência Recente:', MARGIN, p.y);
      p.doc.setFont('helvetica', 'normal');
      p.doc.text(`${status} (vs. avaliação anterior)`, MARGIN + 36, p.y);
      p.y += 8;
      
      p.doc.setFontSize(10);
      p.doc.setFont('helvetica', 'bold');
      p.doc.text('Histórico de Pontuações:', MARGIN, p.y);
      p.y += 6;

      sorted.forEach((item, idx) => {
          const itemDate = new Date(item.data).toLocaleDateString('pt-BR');
          p.doc.setFont('helvetica', 'normal');
          const isCurrent = idx === 0 ? " (Atual)" : "";
          p.doc.text(`- ${itemDate}${isCurrent}: ${item.resultado.score} pts`, MARGIN + 5, p.y);
          p.y += 6;
      });
  } else {
      p.doc.setFontSize(11);
      p.doc.setFont('helvetica', 'bold');
      p.doc.text('ANÁLISE EVOLUTIVA', MARGIN, p.y);
      p.doc.setDrawColor(200);
      p.doc.line(MARGIN, p.y + 2, PAGE_W - MARGIN, p.y + 2);
      p.y += 8;

      p.doc.setFontSize(9);
      p.doc.setFont('helvetica', 'normal');
      p.doc.setTextColor(100);
      p.doc.text('São necessárias pelo menos 2 avaliações deste instrumento para gerar a análise evolutiva.', MARGIN, p.y);
      p.doc.setTextColor(0);
  }

  p.y += 15;
  if (psicologo) p.drawSignature(psicologo);
  p.pageNumbers();

  const nomeArquivo = (paciente?.nome || dados?.nome || 'Paciente').replace(/\s+/g, '_');
  p.doc.save(`Resultado_${instrumento.tipo}_${dataApp.replace(/\//g, '-')}_${nomeArquivo}.pdf`);
};

