# ZUM — Catálogo Online · Resumo do Projeto

> Leia este arquivo para dar contexto ao Claude Code em qualquer máquina.
> Última atualização: 26/06/2026

---

## O que é este projeto

Catálogo online mobile-first da ZUM (marca de moda feminina).
Um único arquivo HTML (`catalogo.html`) com 8 telas, sem backend, hospedado no GitHub → Vercel.

**Responsáveis:** Gustavo (gugacriacao@gmail.com) e Suzana  
**Repo GitHub:** https://github.com/gugacriacao/zum-catalogo-online (privado)

---

## Arquivos desta pasta

| Arquivo | O que é |
|---|---|
| `catalogo.html` | O catálogo em si — vitrine, produto, sacola, checkout, sucesso |
| `gerenciar-catalogo.html` | Gerenciador de produtos: upload de fotos, toggle publicar/ocultar, drag & drop, sync com planilha |
| `gerenciar-banners.html` | Gerencia banners do topo e do meio do catálogo |
| `ordenar-produtos.html` | Versão simples de reordenação (substituída pelo gerenciador) |
| `PUBLICAR.command` | Duplo clique → publica tudo no GitHub automaticamente |
| `RESUMO-PROJETO.md` | Este arquivo |

**Pastas de mídia (a criar conforme for subindo fotos):**
- `FOTOS/[SKU]/foto-01.jpg` — fotos dos produtos
- `BANNERS/TOPO/bannerzumtopo-01.jpg` — banners do topo (rotativos)
- `BANNERS/MEIO/banner-meio-1/` — banners do meio da grade

---

## Planilha Google Sheets

**Nome:** ZUM - CONTROLE DE VENDAS  
**ID:** `1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs`  
**Link:** https://docs.google.com/spreadsheets/d/1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs

**Abas:** Dashboard · Vendas · Produtos · Consignação · Saídas

A aba **Produtos** tem: Código (SKU), Descrição, Categoria, Fornecedor, Custo, Preço Venda, Estoque Atual, Status

---

## Produtos da ZUM (SKU base)

| SKU base | Nome | Preço |
|---|---|---|
| ZUM-VDRC-105 | Vestido recorte costas | R$ 179,90 |
| ZUM-VDBT-102 | Vestido busto torcido | R$ 179,90 |
| ZUM-VDDN-103 | Vestido decote nadador | R$ 179,90 |
| ZUM-VDBA-101 | Vestido básico | R$ 179,90 |
| ZUM-VDMG-104 | Vestido manga | R$ 179,90 |
| ZUM-VDALC-100 | Vestido alça | R$ 179,90 |
| ZUM-TSOV-200 | T-shirt oversized | R$ 99,00 |
| ZUM-BDBA-300 | Body assimétrico | R$ 179,90 |

**Formato SKU completo:** `ZUM-VDRC-105-PT-UN`  
(base) `-` (cor: PT/MR/BD/OW/VH/AZ/RS/VD/BR/AN) `-` (tamanho: UN/P/M/G)

---

## Como o gerenciar-catalogo.html funciona

1. Abre no Chrome
2. Produtos já vêm pré-carregados com dados da planilha
3. **Toggle no card** → Publicado (aparece no catálogo) ou Oculto (não aparece)
4. **Clica na foto** → faz upload da foto do produto
5. **Arrasta o card** → reordena a grade do catálogo
6. **Botão ↻ Sincronizar** → conecta à planilha e atualiza preço/estoque
7. **Botão 💾 Baixar JSON** → baixa `produtos.json` e `catalogo-produtos.js`
8. Move os arquivos para esta pasta e executa `PUBLICAR.command`

### Para conectar à planilha (sync):
1. Clique em ⚙ Config no topo
2. Cole a URL do ZumAgent Web App e o API_TOKEN
3. Clique ↻ Sincronizar agora

---

## Como o catalogo.html funciona (técnico)

- Telas controladas por classe CSS `.active`: `s-home → s-product → s-cart → s-data → s-confirm → s-pix/s-card → s-success`
- Produtos carregados em 4 prioridades: ZumAgent live → produtos.json → localStorage → hardcoded
- Grid alterna 1 ou 2 colunas (botões no topo)
- Frete: R$16,90 entrega ou Grátis retirada (toggle na sacola)
- Cartão: máx 2x com juros (4,6% na 2ª parcela)
- PIX: sem juros

---

## Fluxo de publicação

```
gerenciar-catalogo.html
  → clica 🚀 Publicar Catálogo
  → envia produtos.json direto para o GitHub via API
  → Vercel atualiza o catálogo em ~30 segundos
```

---

## O que já foi feito

- [x] catalogo.html com 8 telas completas (vitrine, produto, sacola, checkout PIX/cartão, sucesso)
- [x] Símbolo PIX nos cards da vitrine
- [x] Preços com tipografia diferenciada (vitrine/produto) vs simples (sacola/confirmação)
- [x] Sacola: imagem estica até a base, preço à direita, Remover embaixo
- [x] Frete: toggle Entrega (R$16,90) / Retirar no local (Grátis)
- [x] Parcelamento: máx 2x com juros visíveis no cartão
- [x] Toggle de colunas (1 ou 2) na vitrine
- [x] "Você também pode gostar" na tela do produto (3 aleatórios)
- [x] gerenciar-catalogo.html com drag & drop, upload de fotos, toggle publicar/ocultar, sync planilha
- [x] gerenciar-banners.html para banners topo e meio
- [x] PUBLICAR.command — publicação no GitHub com duplo clique
- [x] Repo GitHub criado: zum-catalogo-online
- [x] Publicação direta no GitHub via API (sem precisar mover arquivos)
- [x] catalogo.html lê produtos do ZumAgent live (4 fontes de fallback)
- [x] Checkout registra venda na planilha via criarPedidoPendente + confirmarPagamento
- [x] Renomeado loja → catálogo em todos os arquivos

## O que falta (próximos passos)

- [ ] **PRÓXIMO:** Autocomplete de produtos no gerenciador (busca ao vivo na planilha ao digitar nome)
- [ ] Integração Mercado Pago real (PIX + cartão com webhook de confirmação)
- [ ] Upload de fotos dos produtos reais
- [ ] Configurar Vercel (aguardando fotos)
- [ ] Upload de banners no gerenciador
- [ ] WhatsApp e e-mail automático pós-compra

---

## Como continuar com o Claude Code

1. Abra o terminal nesta pasta
2. Digite `claude`
3. Diga: *"Leia o RESUMO-PROJETO.md e continue de onde paramos"*
