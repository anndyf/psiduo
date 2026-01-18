import { buscarDadosPsicologo } from "../actions";
import ClientProfile from "./ClientProfile";
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- DYNAMIC METADATA (SEO) ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const res = await buscarDadosPsicologo(id);
  
  if (!res.success || !res.dados) {
    return {
      title: 'Psicólogo não encontrado | PsiDuo',
    };
  }

  const psi = res.dados as any;
  const bioExcerpt = psi.biografia ? psi.biografia.substring(0, 160) + '...' : '';

  return {
    title: `${psi.nome} | Psicólogo no PsiDuo`,
    description: bioExcerpt,
    openGraph: {
      title: `${psi.nome} | PsiDuo`,
      description: bioExcerpt,
      images: [psi.foto || '/og-image.jpg'],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${psi.nome} | PsiDuo`,
      description: bioExcerpt,
      images: [psi.foto || '/og-image.jpg'],
    },
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const res = await buscarDadosPsicologo(resolvedParams.id);
  
  if (!res.success || !res.dados) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">
        Perfil não encontrado
      </div>
    );
  }

  return <ClientProfile initialData={res.dados} id={resolvedParams.id} />;
}