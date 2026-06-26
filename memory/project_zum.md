---
name: project-zum
description: Contexto completo da ZUM — marca de moda feminina com sistema de gestão em Google Sheets + Apps Script
metadata: 
  node_type: memory
  type: project
  originSessionId: a105f378-64a2-4522-b5ae-ea9b15a7b84e
---

# ZUM — Marca de Moda Feminina

**Negócio:** Loja de moda feminina (vestidos e t-shirts oversized)  
**Modelo:** Venda direta (WhatsApp, Instagram, presencial)  
**Dono:** gugacriacao@gmail.com

## Produtos
- Vestidos: R$179,90 (preço único principal)
- T-shirts oversized: R$99,00
- Categorias: Vestidos, T-shirt
- Fornecedor principal: Flor de Mel
- Margem bruta real: ~65-67%

## SKU Format
`ZUM-[TIPO][SUBTIPO]-[NUM]-[COR]-[TAMANHO]`
- Tipos: VD (vestido), TS (t-shirt)
- Subtipos vestido: BA (básico), BT (busto torcido), RC (recorte costas), DN (decote nadador), MG (manga), ALC (alça)
- Cores: PT (preto), MR (marrom), BD/BOR (bordô), AZ (azul), RS (rosa), VD (verde), OW (off-white), VH (vinho)
- Tamanhos: UN (único), P, M, G
- Exemplo: `ZUM-VDRC-105-PT-UN`

## Performance (Abril/Maio 2026)
- Faturamento: R$7.910,50
- Meta mensal: R$4.000 (meta batida em 197%)
- Peças vendidas: 50 unidades
- Em estoque: 33 unidades
- Margem média: 62,4%
- Pagamento dominante: PIX

## Sistema atual (Google Sheets + Apps Script)
**Planilha principal:** "ZUM - CONTROLE DE VENDAS" (ID: 1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs)
**Planilha de precificação:** "ZUM_Precificacao" (ID: 1Hc5fdfdR5rS7C2TvZURIY7C7sp20QXrQqnMTZ6vzzR0)

### Abas do sistema:
- Dashboard (painel de controle com indicadores financeiros)
- Vendas (registro de vendas com lucratividade automática)
- Produtos (cadastro + estoque atual)
- Consignação (rastreamento de peças enviadas em consignação)
- Saídas (despesas/saídas)
- Precificação (3 camadas de margem: painel, bruta real, líquida)
- Relatórios (gerados como Google Docs automaticamente via Apps Script)

### Funcionalidades do Apps Script:
- Dashboard automático com indicadores financeiros
- Ranking de produtos por faturamento
- Evolução mensal (últimos 6 meses)
- Geração de relatórios PDF/Doc automáticos
- Meta mensal com barra de progresso
- Status de estoque automático (OK, Baixo, Sem Estoque)
- Status de produto (Alto Giro, Baixo Giro, Sem Venda)

## Próxima fase: Loja Virtual
Deseja construir loja para Instagram e WhatsApp Business com:
- Catálogo de produtos com estoque em tempo real (lendo do Sheets)
- Carrinho + Checkout (PIX + Cartão via Mercado Pago)
- Quando venda feita online → atualiza estoque na Sheets automaticamente
- Dashboard admin integrado ao sistema atual
- Links compartilháveis para WhatsApp/Instagram

**Why:** Expandir canal de vendas do WhatsApp manual para loja automatizada  
**How to apply:** Respeitar o sistema SKU atual, integrar com a Sheets como fonte de verdade para estoque e produtos

## Identidade visual
- Fontes: Butler (display), Questa Grande
- Pasta de fontes no Drive: pasta "butler - FONT ZUM" e "FONT ZUM - Questa Grande"
- Estética: moda feminina premium acessível
