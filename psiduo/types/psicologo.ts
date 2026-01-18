export interface AgendaConfig {
  [dia: string]: string[];
  Seg: string[];
  Ter: string[];
  Qua: string[];
  Qui: string[];
  Sex: string[];
  Sab: string[];
  Dom: string[];
}

export interface RedesSociais {
  instagram: string;
  linkedin: string;
  site: string;
}

export interface PsicologoFormData {
  id?: string;
  nome: string;
  slug?: string;
  crp?: string;
  foto: string;
  biografia: string;
  abordagem: string;
  whatsapp: string;
  preco: number;
  duracaoSessao: number;
  especialidades: string[];
  temas: string[];
  idade: string;
  genero: string;
  etnia: string;
  sexualidade: string;
  religiao: string;
  estilo: string;
  diretividade: string;
  publicoAlvo: string[];
  cidade: string;
  estado: string;
  videoApresentacao: string;
  redesSociais: RedesSociais;
  agendaConfig: AgendaConfig;
  plano: string;
  acessos: number;
  status?: string;
}
