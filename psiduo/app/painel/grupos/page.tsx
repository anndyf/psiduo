import { listarMeusGrupos, obterPlanoAtual } from "./actions";
import ClientPage from "./ClientPage";

export default async function GruposPage() {
    const [grupos, plano] = await Promise.all([
        listarMeusGrupos(),
        obterPlanoAtual()
    ]);
    return <ClientPage initialGrupos={grupos} userPlan={plano} />;
}
