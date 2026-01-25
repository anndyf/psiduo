
import { prisma } from "@/lib/prisma";

async function main() {
  const metas = await prisma.meta.findMany({
    where: { pacienteId: "cmkmpoeis00018h2cm8nfpbkz" },
    select: {
        id: true,
        titulo: true,
        frequencia: true,
        diasSemana: true,
        dataInicio: true,
        dataFim: true
    }
  });
  console.log(JSON.stringify(metas, null, 2));
}

main();
