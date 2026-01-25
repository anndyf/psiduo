
import { buscarMetasPeloToken } from "../app/metas/actions";

async function main() {
    // Token valid from previous logs? I need to find the token.
    // Or I can look up the token for the patient id via prisma.
    // Patient ID: cmkmpoeis00018h2cm8nfpbkz
    
    // Actually, I can just use prisma inside here to get token.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const paciente = await prisma.paciente.findUnique({
        where: { id: "cmkmpoeis00018h2cm8nfpbkz" }
    });
    
    if(!paciente) {
        console.log("Paciente nao encontrado");
        return;
    }
    
    console.log("Token:", paciente.tokenAcesso);
    
    // Test for 'Yesterday' (2026-01-21)
    console.log("--- Testing for 2026-01-21 ---");
    const res = await buscarMetasPeloToken(paciente.tokenAcesso, "2026-01-21");
    console.log("Success:", res.success);
    if(res.metas) {
        console.log("Metas found:", res.metas.length);
        res.metas.forEach((m: any) => {
            console.log(`- ${m.titulo} (${m.frequencia}) Start: ${m.dataInicio.toISOString()}`);
        });
    } else {
        console.log("Error:", res.error);
    }
    
    // Test for 'Today' (2026-01-22)
    console.log("\n--- Testing for 2026-01-22 ---");
    const res2 = await buscarMetasPeloToken(paciente.tokenAcesso, "2026-01-22");
    console.log("Success:", res2.success);
    if(res2.metas) {
        console.log("Metas found:", res2.metas.length);
        res2.metas.forEach((m: any) => {
            console.log(`- ${m.titulo} (${m.frequencia}) Start: ${m.dataInicio.toISOString()}`);
        });
    }
}

main();
