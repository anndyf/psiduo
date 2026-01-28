# Guia: Configurando Upload de Imagens (Supabase Storage)

Para parar de salvar imagens pesadas no banco e deixá-las rápidas e baratas:

## 1. Pegar as Chaves do Supabase
1. Acesse https://supabase.com/dashboard/project/_/settings/api
2. Copie a **Project URL**.
3. Copie a **anon public** key.
4. Adicione no seu arquivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="sua-url-aqui"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon-aqui"
```

## 2. Criar o Bucket de Imagens
1. No menu lateral esquerdo, clique em **Storage**.
2. Clique em **New Bucket**.
3. Nome: `public-images` (ou outro, mas lembre-se do nome).
4. **IMPORTANTE:** Marque a opção "Public Bucket" (Senão as imagens não abrem no site).
5. Salvar.

## 3. Configurar Política de Acesso (Policies)
Para conseguir fazer upload:
1. Dentro do bucket criado, vá em **Configuration** -> **Policies**.
2. Clique em "New Policy" -> "For full customization".
3. Nome: "Upload Publico".
4. Allowed operations: Marque **INSERT** e **SELECT**.
5. Salvar.

(Isso permite que qualquer usuário logado ou não faça upload. Para restringir, podemos melhorar a policy depois, mas para teste isso basta).

---
## Como usar no código
O sistema já vai buscar automaticamente o bucket. Se você seguiu o passo 2, funcionará imediatamente após adicionar as chaves no .env.
