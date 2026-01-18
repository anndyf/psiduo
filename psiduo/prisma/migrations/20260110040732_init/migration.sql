-- CreateEnum
CREATE TYPE "Plano" AS ENUM ('DUO_I', 'DUO_II');

-- CreateTable
CREATE TABLE "Psicologo" (
    "id" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "nome" TEXT NOT NULL,
    "crp" TEXT NOT NULL,
    "foto" TEXT,
    "whatsapp" TEXT NOT NULL,
    "abordagem" TEXT NOT NULL,
    "especialidades" TEXT[],
    "temas" TEXT[],
    "preco" DECIMAL(10,2) NOT NULL,
    "idade" INTEGER,
    "genero" TEXT,
    "etnia" TEXT,
    "sexualidade" TEXT,
    "publicoAlvo" TEXT[],
    "biografia" TEXT,
    "videoApresentacao" TEXT,
    "redesSociais" JSONB,
    "acessos" INTEGER NOT NULL DEFAULT 0,
    "agendaConfig" JSONB,
    "plano" "Plano" NOT NULL DEFAULT 'DUO_I',
    "verificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Psicologo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "psicologoId" TEXT NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Psicologo_email_key" ON "Psicologo"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Psicologo_crp_key" ON "Psicologo"("crp");

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Psicologo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
