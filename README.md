# RDR Serviços e Manutenção Ltda — Site Comercial e Painel de Visitas Técnicas

Aplicação web full-stack desenvolvida para a **RDR Serviços e Manutenção Ltda**, combinando um site comercial institucional focado em eletromecânica industrial com um sistema real de agendamento de visitas técnicas, consulta pública por protocolo e painel administrativo para triagem operacional.

---

## Visão Geral do Projeto

O sistema resolve duas frentes do atendimento técnico da empresa:

1. **Canal Comercial e Agendamento Técnico (Público)**
   - Apresentação institucional alinhada à identidade visual da marca (azul-marinho, amarelo elétrico e verde técnico) com logotipo vetorial próprio.
   - Catálogo de especialidades baseado nos serviços reais da RDR: manutenção preditiva (vibração, alinhamento e balanceamento), preventiva, corretiva/rebobinagem (motores CA/CC até 200+ CV), bombas elétricas e combate a incêndio, chillers/fancoils/torres de resfriamento, quadros de comando/transformadores a seco e torno/usinagem.
   - Portfólio de clientes reais atendidos na Bahia (hospitais, hotéis, resorts, shoppings e indústrias) e estudos de caso técnicos.
   - Formulário de agendamento em 3 etapas com geração automática de protocolo (`RDR-AAAA-XXXX`).
   - Consulta pública de andamento por código de protocolo **sem exposição de dados sensíveis** (oculta telefone, e-mail, endereço e CNPJ).

2. **Painel Administrativo de Operações (Autenticado)**
   - Acesso protegido para coordenação técnica via `/admin` ou link discreto no rodapé.
   - Métricas operacionais em tempo real (total registrado, aguardando triagem, emergências ativas, confirmadas/concluídas).
   - Busca por protocolo, empresa, solicitante ou cidade e filtro por status (`Agendada`, `Em Triagem Técnica`, `Confirmada`, `Concluída`, `Cancelada`).
   - Gaveta lateral de triagem para atribuir equipe/técnico, ajustar data/janela de atendimento e registrar anotações internas.

---

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend / API:** Node.js, Express
- **Persistência:** Armazenamento estruturado em arquivo JSON (`data/visits.json`, ignorado no Git)
- **Segurança & Sessão:** Token assinado com **HMAC-SHA256** e expiração de 12 horas, utilizando transporte híbrido (`HttpOnly Cookie` + fallback via `Authorization: Bearer`)

---

## Decisões de Arquitetura

### 1. API Express integrada ao Vite em desenvolvimento
Em vez de manter dois servidores separados durante o desenvolvimento, o `server.ts` executa a API Express na porta `3000` e acopla os middlewares do Vite em modo desenvolvimento. Em produção (`npm run build` + `npm start`), o mesmo servidor serve os arquivos estáticos compilados em `dist/`.

### 2. Autenticação Híbrida (`HttpOnly Cookie` + `Bearer Token`)
Navegadores modernos e ambientes incorporados por `iframe` podem bloquear cookies `SameSite=None`. Para garantir funcionamento confiável tanto em domínio próprio quanto em previews:
- O login emite um cookie `HttpOnly` e também retorna o token assinado por HMAC-SHA256.
- O cliente mantém o token temporariamente na aba (`sessionStorage` com fallback em memória) e envia via `Authorization: Bearer`.
- O middleware do servidor valida a assinatura criptográfica e a expiração em ambas as origens, invalidando o token local automaticamente em caso de logout ou resposta `401`.

### 3. Separação de Dados Públicos e Privados
A rota pública de consulta por protocolo (`GET /api/visits/:protocol`) retorna apenas um resumo seguro (`PublicVisitSummary`) com empresa, modalidade, data/janela, técnico designado e status — protegendo telefone, e-mail, endereço da planta e notas internas de orçamento.

---

## Endpoints da API

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Verificação de saúde do serviço |
| `POST` | `/api/visits` | Público | Cria um novo agendamento e gera protocolo |
| `GET` | `/api/visits/:protocol` | Público | Consulta resumo público do protocolo |
| `POST` | `/api/admin/login` | Público | Autentica usuário administrativo e inicia sessão |
| `POST` | `/api/admin/logout` | Público | Encerra sessão e limpa cookie administrativo |
| `GET` | `/api/admin/session` | Público | Verifica se existe sessão administrativa ativa |
| `GET` | `/api/admin/visits` | Admin | Lista todos os agendamentos e métricas |
| `PATCH` | `/api/admin/visits/:id` | Admin | Atualiza status, técnico, data ou notas internas |

---

## Como Executar Localmente (VS Code)

### Pré-requisitos
- **Node.js** (v20 ou superior recomendado)
- **npm**

### Passo a passo

1. **Clone o repositório e abra no VS Code:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DA_PASTA>
   code .
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` na raiz do projeto e ajuste os valores desejados:
   ```env
   ADMIN_USER="admin@rdr"
   ADMIN_PASSWORD="sua-senha-segura"
   SESSION_SECRET="uma-chave-secreta-longa-e-aleatoria"
   ```
   > **Nota:** Caso não crie o `.env`, o servidor usa credenciais padrão de demonstração (`admin@rdr` / `rdr2026`). Em produção, defina sempre valores próprios no `.env`.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

### Outros scripts disponíveis

- **Checagem de tipos TypeScript:**
  ```bash
  npm run lint
  ```
- **Build de produção do frontend:**
  ```bash
  npm run build
  ```
- **Executar em modo produção (após o build):**
  ```bash
  NODE_ENV=production npm start
  ```

---

## Autoria e Processo de Desenvolvimento

Desenvolvido por **André Siqueira** — Desenvolvedor e Analista de Sistemas Júnior.

- **Responsabilidades no projeto:** Levantamento de requisitos reais de negócio junto à presença digital da empresa, definição dos fluxos comerciais e administrativos, validação visual e revisão funcional ponta a ponta.
- **Uso transparente de IA no fluxo de trabalho:** Este projeto foi estruturado e implementado com o apoio do **Google AI Studio** como ferramenta de engenharia assistida, utilizado para acelerar a prototipação, discutir decisões arquiteturais (React, TypeScript, Express e segurança de sessão) e documentar boas práticas de código.
