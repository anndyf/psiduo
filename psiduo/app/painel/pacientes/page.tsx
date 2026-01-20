import { listarPacientes } from "./actions";
import ClientPage from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const pacientes = await listarPacientes();
    return <ClientPage initialPacientes={pacientes} />;
}
