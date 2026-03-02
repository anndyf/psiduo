# 🎯 Ferramentas de Grupo Terapêutico - PsiDuo

## ✅ Schema do Banco de Dados Atualizado

### **Novos Modelos Criados:**

---

## 1️⃣ TERMÔMETRO COLETIVO (Clima Emocional)

### **Objetivo:**
Capturar o estado emocional do grupo antes das sessões para o terapeuta ajustar a abordagem.

### **Modelos:**

#### `CheckInGrupo`
```prisma
- id: String (ID único)
- grupoId: String (FK para GrupoTerapeutico)
- titulo: String (Ex: "Check-in antes da sessão de hoje")
- descricao: String? (Opcional)
- dataEnvio: DateTime (Quando foi enviado)
- dataExpira: DateTime (Prazo para responder - 1h antes da sessão)
- ativo: Boolean (Se ainda está aceitando respostas)
```

#### `RespostaCheckIn`
```prisma
- id: String
- checkInId: String (FK para CheckInGrupo)
- pacienteId: String (FK para Paciente)
- emocao: String (Valores: "BATERIA_BAIXA", "AGITADO", "DEFENSIVO", "ABERTO")
- criadoEm: DateTime
- UNIQUE: [checkInId, pacienteId] (Um paciente responde apenas 1x)
```

### **Fluxo de Uso:**
1. Terapeuta cria check-in 1 hora antes da sessão
2. Sistema envia notificação aos participantes
3. Participantes respondem anonimamente
4. Terapeuta visualiza gráfico/nuvem de emoções
5. Ajusta a sessão baseado no clima emocional

### **Valor Clínico:**
- **Universalidade**: Paciente vê que não está sozinho
- **Validação**: Sentimentos são normalizados
- **Adaptação**: Terapeuta ajusta abordagem em tempo real

---

## 2️⃣ MURAL DAS VITÓRIAS (Gamificação Positiva)

### **Objetivo:**
Criar senso de comunidade e reforço positivo entre sessões.

### **Modelos:**

#### `VitoriaGrupo`
```prisma
- id: String
- grupoId: String (FK para GrupoTerapeutico)
- pacienteId: String (FK para Paciente)
- texto: String (Ex: "Consegui dizer 'não' para meu chefe!")
- aprovado: Boolean (Moderação do terapeuta)
- criadoEm: DateTime
```

#### `ReacaoVitoria`
```prisma
- id: String
- vitoriaId: String (FK para VitoriaGrupo)
- pacienteId: String (FK para Paciente)
- emoji: String (Valores: "PALMAS", "CORACAO", "FOGO")
- criadoEm: DateTime
- UNIQUE: [vitoriaId, pacienteId] (Uma reação por paciente)
```

### **Fluxo de Uso:**
1. Participante posta vitória durante a semana
2. Vitória fica pendente de aprovação
3. Terapeuta aprova/rejeita
4. Outros participantes reagem com emojis (sem texto)
5. Cria engajamento e apoio mútuo

### **Valor Clínico:**
- **Apoio Mútuo**: Comunidade ativa fora das sessões
- **Reforço Positivo**: Celebração de pequenas conquistas
- **Segurança**: Moderação evita conteúdos inadequados

---

## 3️⃣ MISSÃO DA SEMANA (Psicoeducação)

### **Objetivo:**
Aumentar engajamento e accountability com tarefas terapêuticas.

### **Modelos:**

#### `MissaoGrupo`
```prisma
- id: String
- grupoId: String (FK para GrupoTerapeutico)
- titulo: String (Ex: "Observar momentos de ansiedade")
- descricao: String (Instruções detalhadas)
- dataInicio: DateTime
- dataFim: DateTime (Prazo)
- ativo: Boolean
```

#### `ConclusaoMissao`
```prisma
- id: String
- missaoId: String (FK para MissaoGrupo)
- pacienteId: String (FK para Paciente)
- concluido: Boolean
- dataConclusao: DateTime?
- criadoEm: DateTime
- UNIQUE: [missaoId, pacienteId] (Uma conclusão por paciente)
```

### **Fluxo de Uso:**
1. Terapeuta cria missão com prazo
2. Participantes veem card no painel
3. Barra de progresso mostra status
4. Participante marca "Missão Cumprida ✅"
5. Terapeuta vê lista de quem completou

### **Valor Clínico:**
- **Accountability**: Paciente sabe que será monitorado
- **Engajamento**: Gamificação aumenta adesão
- **Rastreamento**: Terapeuta identifica quem precisa de suporte

---

## 📊 Relações Adicionadas

### **GrupoTerapeutico:**
```prisma
checkIns: CheckInGrupo[]
vitorias: VitoriaGrupo[]
missoes: MissaoGrupo[]
```

### **Paciente:**
```prisma
respostasCheckIn: RespostaCheckIn[]
vitorias: VitoriaGrupo[]
reacoesVitoria: ReacaoVitoria[]
conclusoesMissao: ConclusaoMissao[]
```

---

## 🚀 Próximos Passos

### **1. Backend (API Routes):**
- [ ] `/api/grupo/[id]/checkin` - CRUD de check-ins
- [ ] `/api/grupo/[id]/vitorias` - CRUD de vitórias
- [ ] `/api/grupo/[id]/missoes` - CRUD de missões
- [ ] `/api/grupo/[id]/dashboard` - Dados agregados

### **2. Frontend (Componentes):**
- [ ] `CheckInModal` - Criar e responder check-ins
- [ ] `ClimaEmocionalChart` - Visualização para terapeuta
- [ ] `MuralVitorias` - Feed de vitórias + reações
- [ ] `MissaoCard` - Card de missão com progresso
- [ ] `GrupoDashboard` - Painel do terapeuta

### **3. Notificações:**
- [ ] Email/SMS quando check-in é enviado
- [ ] Notificação quando vitória é aprovada
- [ ] Lembrete de missão próxima do prazo

---

## 🎨 Design Considerations

### **Cores por Ferramenta:**
- **Check-in**: Azul (`bg-blue-50`, `text-blue-600`)
- **Vitórias**: Verde (`bg-green-50`, `text-green-600`)
- **Missões**: Roxo (`bg-purple-50`, `text-purple-600`)

### **Ícones Sugeridos:**
- Check-in: `<ThermometerSun />` ou `<Activity />`
- Vitórias: `<Trophy />` ou `<Star />`
- Missões: `<Target />` ou `<CheckSquare />`

---

## 📝 Notas Técnicas

### **Segurança:**
- Vitórias requerem aprovação do terapeuta
- Check-ins são anônimos na visualização agregada
- Apenas membros do grupo podem interagir

### **Performance:**
- Índices em `grupoId`, `ativo`, `aprovado`
- Queries otimizadas com `include` seletivo
- Cache de dashboards agregados

### **Validações:**
- Check-in expira após prazo
- Missão tem data de início e fim
- Reações limitadas a emojis pré-definidos
