# Implementação do Supabase Storage

Para parar de salvar imagens pesadas no banco de dados e usar o armazenamento correto (Storage), siga estes passos.

## 1. Criar o Bucket no Supabase
1. Acesse o painel do seu projeto no Supabase.
2. Clique em **Storage** no menu lateral esquerdo.
3. Clique no botão **New Bucket**.
4. Preencha os dados:
   - **Name**: `fotos-perfil`
   - **Public bucket**: Marque esta opção como **ATIVADA (ON)**.
   - Clique em **Save**.

## 2. Configurar Permissões (Policies)
Para que o site consiga enviar as fotos, precisamos liberar o acesso.

1. Na tela do Storage, ao lado do bucket `fotos-perfil`, clique nos três pontos ou na aba **Configuration** > **Policies**.
2. Clique em **New Policy** na seção de Policies do bucket `fotos-perfil`.
3. Selecione **For full customization**.
4. Preencha:
   - **Policy Name**: `Permitir Upload Publico`
   - **Allowed operations**: Marque **INSERT** e **SELECT**.
   - **Target roles**: Marque **anon** e **authenticated**.
   - Clique em **Review** e depois **Save**.

## 3. Pegar as Chaves
1. Vá em **Settings** (ícone de engrenagem) > **API**.
2. Copie a **Project URL**.
3. Copie a **anon public key**.

## 4. Atualizar o arquivo .env
Abra o arquivo `.env` no seu projeto e adicione estas duas linhas novas:

```
NEXT_PUBLIC_SUPABASE_URL="cole-sua-url-aqui"
NEXT_PUBLIC_SUPABASE_ANON_KEY="cole-sua-key-aqui"
```

---
**ATENÇÃO**: Assim que você concluir esses 4 passos, me avise (ex: "Configurei o bucket").
Eu então farei as alterações no código para instalar a biblioteca e conectar o formulário ao novo bucket.
