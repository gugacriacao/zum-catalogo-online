---
name: project-catalogo-online
description: "Arquitetura e estado atual do catálogo online ZUM — arquivos, decisões técnicas, o que foi feito e o que falta"
metadata:
  node_type: memory
  type: project
  updated: 2026-06-26
---

# ZUM — Catálogo Online

Ver também [[project-zum]] e [[feedback-mac-format]].

## Pasta do projeto (iCloud — sincroniza entre Macs)
`/Users/[usuario]/Library/Mobile Documents/com~apple~CloudDocs/ZUM/CATALOGO ZUM ONLINE/`

## Repositório GitHub
`https://github.com/gugacriacao/zum-catalogo-online` (privado)
- `PUBLICAR.command` — duplo clique → git add + commit + push automático

## Arquivos do projeto
| Arquivo | O que é |
|---|---|
| `catalogo.html` | O catálogo mobile completo (8 telas) — **ARQUIVO PRINCIPAL** |
| `gerenciar-catalogo.html` | Gerenciador de produtos (drag&drop, fotos, sync, toggle publicar) |
| `gerenciar-banners.html` | Gerenciador de banners topo+meio |
| `PUBLICAR.command` | Shell script de publicação no GitHub |
| `loja.html` | Arquivo antigo — substituído por `catalogo.html` (pode apagar) |

**Nota:** O projeto foi renomeado de "loja" para "catálogo" em 26/06/2026. O arquivo principal agora é `catalogo.html`.

## Backend: ZumAgent (Google Apps Script)

**Arquivo local:** `/Users/tavinhocarvalho/Documents/Claude/Projects/ZUM/ZumAgent.gs` (6093 linhas)  
**Web App URL:** salva no localStorage do browser como `zum-as-url`  
**API_TOKEN:** salva no localStorage como `zum-api-token`

### Endpoints já funcionando no ZumAgent
- `GET ?api=produtos&token=TOKEN` → retorna `{ok:true, produtos:[{codigo, descricao, categoria, cor, preco, estoque}]}`
- `POST {action:'criarPedidoPendente', token, cliente, itens}` → cria pedido em PedidosOnline
- `POST {action:'confirmarPagamento', token, pedido, metodoPagamento}` → chama registrarVenda → registra em Vendas + Movimentação + Estoque + Clientes

### Funções existentes no ZumAgent (não precisam ser criadas)
- `registrarVenda()` — Vendas + Movimentação + decrementa estoque
- `appendMovimentacao()` — appenda na aba Movimentação
- `cadastrarCliente()` — cadastra/atualiza em Clientes
- `getProdutos()` — lê aba Produtos com todos os campos
- `getClientesDetalhes()` — lê todos os clientes
- `criarPedidoPendente()` — cria pedido pendente em PedidosOnline
- `confirmarPagamento()` — confirma e chama registrarVenda

## Arquitetura do catalogo.html

### Telas (CSS `.active`)
`s-home` → `s-product` → `s-cart` → `s-data` → `s-confirm` → `s-pix` OU `s-card` → `s-success`

### Carregamento de produtos (4 fontes em prioridade)
1. ZumAgent live: `GET ?api=produtos&token=TOKEN`
2. `produtos.json` (deploy no Vercel/GitHub)
3. `localStorage['zum-catalogo']` (compartilhado com gerenciador)
4. Hardcoded `PRODUCTS` (fallback)

### Formato PRODUCTS no catalogo.html
```js
{
  sku: 'ZUM-VDRC-105',
  cat: 'Vestidos',
  name: 'Vestido recorte costas',
  price: 179.90,
  badge: 'Novo',
  bg: '#f0ece8',
  colors: [{n:'Preto', c:'#1a1a1a'}, ...],
  sizes: [{s:'UN'}],
  stock: 'Em estoque',
  media: ['FOTOS/ZUM-VDRC-105/foto-01.jpg']
}
```

### Checkout → Planilha (já implementado)
```js
// goSuccess() em catalogo.html:
// 1. Monta itensApi com SKU completo (ex: ZUM-VDRC-105-PT-UN)
// 2. Chama criarPedidoPendente com cliente + itens
// 3. Chama confirmarPagamento → dispara registrarVenda no ZumAgent
// Resultado: venda em Vendas, saída em Movimentação, estoque atualizado
```

### SKU completo para a API
`ZUM-[TIPO]-[NUM]-[COR]-[TAM]` ex: `ZUM-VDRC-105-PT-UN`
- `COR_NOME_TO_COD` em catalogo.html converte nome da cor para código

## gerenciar-catalogo.html — estado atual

### O que faz
- Cards de produtos com foto, SKU, preço, cores (bolinhas), tamanhos, estoque
- Toggle Publicado/Oculto por card
- Drag & drop para reordenar
- Upload de fotos por produto
- Filtros: Todos / Publicados / Ocultos
- Modal de edição completo
- **Botão ↻ Sincronizar** → busca produtos do ZumAgent (GET ?api=produtos)
- **Botão 💾 Baixar JSON** → baixa `produtos.json` + `catalogo-produtos.js`
- **Botão 🚀 Publicar Catálogo** → envia `produtos.json` diretamente para o GitHub via API (sem precisar rodar PUBLICAR.command)

### Config (painel ⚙)
- URL do ZumAgent Web App
- API_TOKEN
- GitHub Personal Access Token (para publicação direta)

### localStorage keys
- `zum-catalogo` — array de produtos (compartilhado com catalogo.html)
- `zum-ordem` — array de SKUs na ordem definida
- `zum-banners` — banners do meio
- `zum-banners-topo` — banners do topo
- `zum-as-url` — URL do ZumAgent Web App
- `zum-api-token` — API_TOKEN do ZumAgent
- `zum-gh-token` — GitHub Personal Access Token
- `zum-catalogo-v` — versão (força reset do localStorage quando iniciais mudam)

## O que foi feito (histórico completo)

### Sessões anteriores
1. catalogo.html: 8 telas completas (vitrine, produto, sacola, checkout, PIX, cartão, sucesso)
2. PIX, tipografia de preço, sacola reformulada, frete toggle, parcelamento cartão, toggle colunas, "Você tb pode gostar"
3. gerenciar-catalogo.html: drag&drop, upload fotos, toggle publicar, sync, filtros, modal edição
4. gerenciar-banners.html, ordenar-produtos.html, PUBLICAR.command
5. GitHub repo criado: zum-catalogo-online
6. PRODUTOS_INICIAIS com todos os 11 produtos reais da planilha (com CATALOGO_VERSION para forçar reset)
7. catalogo.html lê de 4 fontes com fallback
8. Publicação direta no GitHub via API (sem precisar mover arquivos)
9. Checkout conectado ao ZumAgent: criarPedidoPendente + confirmarPagamento

### Sessão 26/06/2026
10. Renomeado projeto de "loja" → "catálogo" em todos os arquivos:
    - `loja.html` → `catalogo.html` (arquivo novo criado)
    - Todos os textos, botões e comentários atualizados
    - RESUMO-PROJETO.md atualizado
    - Memória atualizada
11. Servidor de preview configurado (`launch.json` no diretório ZUM/ZumAgent)

## Próximos passos (por prioridade)

1. **[PRÓXIMO]** Autocomplete de produtos no gerenciador:
   - Ao digitar nome no modal de edição/adição, buscar ao vivo no ZumAgent `?api=produtos`
   - Sugerir: nome, categoria, cores, tamanhos, estoque por variante
   - Usuário seleciona e o card é pré-preenchido

2. **Mercado Pago real** (PIX + cartão com webhook de confirmação automática)
   - Hoje o checkout confirma pagamento automaticamente (sem verificação real)
   - Precisar integrar SDK do Mercado Pago + webhook que chama confirmarPagamento

3. **Upload de fotos** dos produtos reais → publicar

4. **Configurar Vercel** (aguardando fotos)

5. **WhatsApp/e-mail automático** pós-compra

6. **Apagar loja.html** (arquivo antigo substituído por catalogo.html)

## Planilha ZUM
**ID:** `1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs`  
**Abas:** Dashboard · Vendas · Produtos · Movimentação · Clientes · Consignação · Saídas · PedidosOnline · Cadastros  
**Aba Produtos colunas:** Código (SKU), Descrição, Categoria, Fornecedor, Custo, Preço Venda, Margem %, Estoque Atual, Estoque Mínimo, Cor, Tamanho, Ativo, Status
