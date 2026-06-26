---
name: project-loja-online
description: "Arquitetura e estado atual da loja virtual ZUM — arquivos, decisões técnicas, o que foi feito e o que falta"
metadata: 
  node_type: memory
  type: project
  originSessionId: a105f378-64a2-4522-b5ae-ea9b15a7b84e
---

# ZUM — Loja Virtual Online

Ver também [[project-zum]] e [[feedback-mac-format]].

## Pasta do projeto
`/Users/tavinho/Library/Mobile Documents/com~apple~CloudDocs/ZUM/CATALOGO ZUM ONLINE/`

## Repositório GitHub
`https://github.com/gugacriacao/zum-catalogo-online` (privado)
- `PUBLICAR.command` — duplo clique → git add + commit + push automático
- `.gitignore` exclui `.DS_Store`, `.claude/`, `RESUMOS/`

## Arquivos existentes
| Arquivo | O que é |
|---|---|
| `loja.html` | Catálogo mobile completo (8 telas) |
| `gerenciar-catalogo.html` | Gerenciador de produtos (drag&drop, fotos, sync, toggle publicar) |
| `gerenciar-banners.html` | Gerenciador de banners topo+meio |
| `ordenar-produtos.html` | Versão simples de reordenação (anterior ao gerenciador) |
| `PUBLICAR.command` | Shell script de publicação no GitHub |

## Arquitetura técnica

### loja.html — telas (CSS `.active`)
`s-home` → `s-product` → `s-cart` → `s-data` → `s-confirm` → `s-pix` OU `s-card` → `s-success`

### Variáveis JS principais em loja.html
```js
var PRODUCTS = [...]       // array de produtos (hardcoded por enquanto)
var MID_BANNERS = [...]    // banners do meio (vazio = nenhum)
var GRID_SEQUENCIA = [1,2] // padrão de colunas do grid
var FRETE_VALOR = 16.90    // frete fixo moto/uber
var JUROS = {1:0, 2:0.046} // juros cartão (máx 2x)
var AS_URL = '...'         // URL do Apps Script (a configurar)
var PIX_ICON = 'data:...'  // base64 do símbolo PIX
```

### Formato PRODUCTS
```js
{
  sku: 'ZUM-VDRC-105',
  cat: 'Vestidos',
  name: 'Vestido recorte costas',
  price: 179.90,
  badge: 'Novo',
  bg: '#f0ece8',
  colors: [{n:'Preto', c:'#1a1a1a'}, ...],
  sizes: [{s:'P', out:true}, {s:'M'}, ...],
  stock: 'Poucas unidades em M',
  media: ['foto1.jpg', 'foto2.jpg']  // ou emojis placeholder
}
```

### Funções importantes em loja.html
- `moneyFmt(v)` — preço formatado diferente (vitrine/produto): `R$ 179,90` com spans estilizados
- `money(v)` — preço simples: `R$ 179,90` (sacola, confirmar, sucesso)
- `renderGrid()` — lê `localStorage['zum-ordem']` para ordenar produtos
- `setFrete(op)` — 'entrega' (R$16,90) ou 'retirar' (grátis)
- `renderInstallments()` — máx 2x, mostra juros no cartão
- `openProduct(sku)` — exibe tela produto + "Você também pode gostar" (3 aleatórios)
- `setGridMode(n)` — alterna grid 1 ou 2 colunas

## gerenciar-catalogo.html — estado atual (Jun 2026)

### O que faz
- Exibe cards de todos os produtos com foto, SKU, preço, cores (bolinhas), tamanhos, estoque
- **Toggle "Publicado/Oculto"** em cada card — controla o que aparece na loja
- **Drag & drop** para reordenar com badge de número de ordem
- **Upload de fotos** por produto (clica na área ou no card)
- **Autocomplete** na busca por nome ou SKU
- **Filtros** por tabs: Todos / Publicados / Ocultos
- **Modal de edição** com todos os campos + fotos
- **Botão Sincronizar** — busca dados da planilha via Apps Script Web App e:
  - Atualiza preço e estoque dos produtos existentes
  - Importa novos produtos como OCULTOS (usuário decide o que publica)
  - Agrega variantes (cores) pelo SKU base
- **Salvar Catálogo** — gera `produtos.json` (só os publicados) + `loja-produtos.js` para atualizar PRODUCTS no loja.html

### Dados pré-carregados (sem precisar do sync)
Os produtos base da ZUM já estão pré-carregados com dados da planilha:
ZUM-VDRC-105, ZUM-VDBT-102, ZUM-VDDN-103, ZUM-VDBA-101, ZUM-VDMG-104, ZUM-VDALC-100, ZUM-TSOV-200, ZUM-BDAS-300

### PROBLEMA ABERTO: dados incompletos
Os produtos pré-carregados não têm todas as variantes/SKUs completos da planilha.
O usuário pediu que o sync puxe TODOS os SKUs completos da aba "Produtos" da planilha (ZUM-VDRC-105-PT-UN, ZUM-VDRC-105-BD-UN, etc.) e os agrupe automaticamente por produto base.
**Próxima ação:** ler a aba Produtos completa e ajustar o sync + os dados iniciais.

### Como configurar o sync (Apps Script)
1. Abrir planilha ZUM no Google Sheets
2. Extensões → Apps Script → Adicionar arquivo → nomear "Agente"
3. Colar o código que está dentro de `gerenciar-catalogo.html` (função `doGet`)
4. Implantar → Nova implantação → App da Web → Qualquer pessoa
5. Copiar URL e colar em `gerenciar-catalogo.html` → botão ⚙ Planilha

### Fluxo de publicação
```
gerenciar-catalogo.html
  ↓ Salvar Catálogo
produtos.json + loja-produtos.js (baixados)
  ↓ Mover para pasta CATALOGO ZUM ONLINE
PUBLICAR.command (duplo clique)
  ↓ git add . && git commit && git push
GitHub (zum-catalogo-online)
  ↓ (Vercel — ainda não configurado)
Loja online pública
```

## localStorage keys
- `zum-catalogo` — array completo de produtos do gerenciador
- `zum-ordem` — array de SKUs na ordem definida (lido pelo loja.html)
- `zum-banners` — banners do meio
- `zum-banners-topo` — banners do topo
- `zum-as-url` — URL do Apps Script

## Planilha ZUM
**ID:** `1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs`
**Aba Produtos:** colunas — Código, Descrição do Produto, Categoria/Centro de Custo, Fornecedor, Custo Compra (R$), Preço Venda (R$), Margem %, Estoque Atual, Estoque Mínimo, Status, Provisão de faturamento

## O que foi feito (histórico desta sessão)
1. loja.html: símbolo PIX nos cards, tipografia de preço ajustada
2. loja.html: sacola reformulada (imagem estica, preço à direita, botão remover abaixo)
3. loja.html: frete com toggle Entrega/Retirar, valor fixo R$16,90
4. loja.html: parcelamento cartão máx 2x com juros visível
5. loja.html: toggle de colunas (1 ou 2) no topo da grade
6. loja.html: "Você também pode gostar" na tela do produto (3 aleatórios)
7. Criado `ordenar-produtos.html` — drag & drop simples de reordenação
8. Criado `gerenciar-banners.html` — gerencia banners topo+meio
9. Instalado GitHub CLI + criado repo `zum-catalogo-online` + `PUBLICAR.command`
10. Criado `gerenciar-catalogo.html` — gerenciador completo (v2 com toggle, sync, filtros)

## Pendências (próximos passos)
- [ ] Ler aba Produtos completa e popular gerenciar-catalogo com TODOS os SKUs/variantes
- [ ] Testar sync com Apps Script real da planilha
- [ ] Atualizar loja.html para ler de produtos.json em vez de PRODUCTS hardcoded
- [ ] Configurar Vercel (aguardando ter fotos dos produtos)
- [ ] Integração Mercado Pago (PIX + cartão)
- [ ] Decrementar estoque na Sheets após pagamento confirmado
- [ ] Banners: upload de foto no gerenciador → salvar em BANNERS/
- [ ] WhatsApp e e-mail automático pós-compra
