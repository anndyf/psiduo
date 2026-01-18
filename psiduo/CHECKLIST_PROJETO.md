# Lista de Tarefas e Melhorias - PsiDuo 🚀

Este documento serve como guia para os próximos passos de desenvolvimento, testes e otimização do projeto, com base na revisão atual.

## 🧹 1. Manutenção e Cleanup (Imediato)
- [x] **Resolver Conflito de Dependências**: Existe um arquivo `package-lock.json` solto na raiz do workspace (fora da pasta `psiduo`) que está gerando avisos. 
  - *Ação:* Remover o arquivo da raiz e manter apenas o de dentro da pasta do projeto.
- [x] **Verificar Variáveis de Ambiente**: Confirmar se o `.env` local contém todas as chaves necessárias para as novas features (ex: se houver integração futura de pagamento).

## 🧪 2. Testes Funcionais (Quality Assurance)
Essenciais para garantir que o que foi construído funciona na prática.

- [ ] **Fluxo de Agenda (Duo II)**
  - Configurar horários de atendimento no Painel.
  - Abrir o Perfil Público em aba anônima.
  - Tentar agendar um horário e confirmar se o link do WhatsApp é gerado com a mensagem correta.
- [ ] **Upgrade de Plano**
  - Simular a mudança de plano de `DUO_I` para `DUO_II`.
  - Verificar se os campos bloqueados (Vídeo, Redes Sociais) são liberados imediatamente no formulário.
- [ ] **Validação de Cadastro**
  - Tentar cadastrar um CRP já existente (deve bloquear).
  - Tentar cadastrar senhas diferentes (deve bloquear).

## 🛠️ 3. Melhorias Técnicas (Refactoring)
Pontos identificados no código que podem ser melhorados para maior robustez.

- [ ] **Melhorar Tipagem no Editor de Perfil (`app/perfil/editar/page.tsx`)**
  - Atualmente o objeto `agendaConfig` e partes da `session` estão tipados como `any`.
  - *Ação:* Criar interfaces TypeScript (`AgendaConfig`, `PsicologoSession`) para garantir segurança de tipos.
- [ ] **Componentizacão do Formulário**
  - O arquivo de edição está muito grande (~800 linhas).
  - *Ação:* Separar as seções (Dados Pessoais, Agenda, Duo II) em componentes menores (ex: `AgendaForm.tsx`, `SocialLinksForm.tsx`).

## 🚀 4. Preparação para Produção (Deploy)
- [ ] **Validar Build**: Rodar `npm run build` localmente para pegar erros que não aparecem em modo dev.
- [ ] **SEO Dinâmico**: Verificar se a página pública do perfil (`app/perfil/[id]/page.tsx`) está gerando os metadados (Title, Description, OpenGraph) com o nome e foto do psicólogo para compartilhamento bonito no WhatsApp/LinkedIn.
