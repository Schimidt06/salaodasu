# Suellen Bailon — Atendimento & Pré-Checkout Capilar

Sistema inteligente de triagem e seleção de serviços capilares para WhatsApp da cabeleireira **Suellen Bailon** (Solari).

## 🚀 Como fazer o Deploy na Vercel

O projeto foi 100% preparado para deploy estático na Vercel com carregamento instantâneo, sem necessidade de banco de dados ou backend.

### Opção 1: Pelo Terminal (Vercel CLI)
Basta rodar no diretório do projeto:
```bash
npx vercel
```
Para deploy em produção direto:
```bash
npx vercel --prod
```

### Opção 2: Pelo GitHub / Dashboard da Vercel
1. Suba este repositório para o seu GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Selecione o repositório `suellencabelos`.
4. Mantenha as configurações padrão (Framework: **Other**) e clique em **Deploy**.

---

## 💻 Teste Local
Para rodar localmente no seu computador:
```bash
npm run dev
```
Acesse em: `http://localhost:8080`

---

## 📁 Estrutura de Arquivos
- `index.html`: Interface limpa e responsiva do cardápio de serviços.
- `css/style.css`: Estilização mobile-first e design system elegante.
- `js/catalog-data.js`: Catálogo de serviços capilares organizados por categorias.
- `js/app.js`: Lógica de seleção e gerador da mensagem formatada para WhatsApp.
- `vercel.json`: Otimizações de cache, clean URLs e headers de segurança.
- `assets/`: Imagens e marca oficial da Solari.
