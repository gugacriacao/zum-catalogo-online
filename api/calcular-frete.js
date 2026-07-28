// Calcula frete real via API da SuperFrete (só Correios: PAC + SEDEX, por
// decisão do usuário — Jadlog/Loggi fora) pro CEP de destino informado no
// checkout. Chamado automaticamente pelo
// index.html assim que o cliente termina de digitar o CEP — só pra fora da
// zona de entrega local (Fortaleza/Eusébio, R$15 fixo) e fora da faixa
// "combinar por WhatsApp" da Região Metropolitana (ver CIDADES_LOCAL /
// CIDADES_COMBINAR no index.html). Cotação na SuperFrete é sempre gratuita —
// não gera etiqueta nem gasta saldo da carteira, só consulta preço/prazo.
//
// Peso e dimensões são ESTIMADOS por categoria (ainda não temos peso real de
// balança — ver memory/session_2026_07_28_frete_superfrete.md). Sempre
// arredondado pra cima, tanto peso quanto caixa, de propósito: é melhor o
// frete calculado ficar um pouco caro demais do que barato demais (perda de
// dinheiro) ou a transportadora reter o pacote por peso maior que o
// declarado. Ajustar PESO_POR_CATEGORIA aqui assim que houver peso real.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, erro: 'Método não permitido' });
    return;
  }

  try {
    var body = req.body || {};
    var cepDestino = String(body.cep || '').replace(/\D/g, '');
    var itens = Array.isArray(body.itens) ? body.itens : [];

    if (cepDestino.length !== 8) {
      res.status(400).json({ ok: false, erro: 'CEP de destino inválido' });
      return;
    }
    if (!itens.length) {
      res.status(400).json({ ok: false, erro: 'Carrinho vazio' });
      return;
    }

    var token = process.env.SUPERFRETE_TOKEN;
    if (!token) {
      res.status(500).json({ ok: false, erro: 'SUPERFRETE_TOKEN não configurado na Vercel' });
      return;
    }

    // CEP de origem: casa do Tavinho em Fortaleza, ponto de postagem
    // cadastrado na SuperFrete (Correios + Jadlog).
    var CEP_ORIGEM = '60830465';

    // Peso estimado por categoria (kg), já considerando a embalagem
    // individual da peça (saquinho plástico + etiqueta pequena).
    var PESO_POR_CATEGORIA = {
      'T-shirts': 0.20, 'Blusas': 0.20, 'Regatas': 0.20, 'Camisaria': 0.20,
      'Vestidos': 0.30, 'Bodies': 0.30,
      'Calças': 0.35, 'Saias': 0.35, 'Macacão': 0.35, 'Macacões': 0.35,
      'Conjuntos': 0.45
    };
    var PESO_PADRAO = 0.30; // categoria não mapeada — fica no meio-termo
    var PESO_EMBALAGEM_PEDIDO = 0.08; // saquinho/caixa + etiqueta do pedido inteiro (uma vez só, não por peça)

    // Caixa estimada por faixa de peso TOTAL do pedido (cm), arredondado pra
    // cima de propósito. Cada linha: [pesoMaxKg, altura, largura, comprimento]
    var FAIXAS_CAIXA = [
      [0.3, 5, 15, 20],
      [0.6, 8, 20, 25],
      [1.0, 10, 25, 30],
      [1.8, 12, 28, 35],
      [3.0, 15, 30, 40],
      [Infinity, 20, 35, 45]
    ];

    function caixaPorPeso(pesoKg) {
      for (var i = 0; i < FAIXAS_CAIXA.length; i++) {
        if (pesoKg <= FAIXAS_CAIXA[i][0]) {
          return { altura: FAIXAS_CAIXA[i][1], largura: FAIXAS_CAIXA[i][2], comprimento: FAIXAS_CAIXA[i][3] };
        }
      }
      return { altura: 20, largura: 35, comprimento: 45 };
    }

    function arredondarPraCima(v, passo) {
      return Math.ceil(v / passo) * passo;
    }

    var pesoTotal = itens.reduce(function (soma, it) {
      var peso = PESO_POR_CATEGORIA[it.categoria] || PESO_PADRAO;
      return soma + peso * (Number(it.qty) || 1);
    }, 0) + PESO_EMBALAGEM_PEDIDO;
    pesoTotal = arredondarPraCima(pesoTotal, 0.05);

    var caixa = caixaPorPeso(pesoTotal);

    var payload = {
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cepDestino },
      services: '1,2', // só Correios: 1=PAC, 2=SEDEX (Jadlog/Loggi fora por decisão do usuário)
      options: {
        // Seguro (declaração de valor) desligado de propósito: a SuperFrete
        // rejeita a cotação inteira ("faixa pra peso/quantidade/valor não
        // encontrada") quando o pacote é leve (~300g) e o valor declarado é
        // alto — combinação comum aqui, já que uma peça de roupa pesa pouco
        // mas vale bastante. Confirmado em teste real (28/Jul/2026, CEP
        // 58084-015): com seguro ligado, PAC e SEDEX voltavam com erro; sem
        // seguro, ambos cotam normalmente. Ver
        // memory/session_2026_07_28_frete_superfrete.md.
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false
      },
      package: {
        weight: pesoTotal,
        height: caixa.altura,
        width: caixa.largura,
        length: caixa.comprimento
      }
    };

    var r = await fetch('https://api.superfrete.com/api/v0/calculator', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'ZUM Catalogo Online (gugacriacao@gmail.com)',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    var data = await r.json();

    if (!r.ok || !Array.isArray(data)) {
      res.status(502).json({ ok: false, erro: (data && data.message) || 'Erro ao consultar frete na SuperFrete' });
      return;
    }

    var opcoes = data
      .filter(function (d) { return !d.has_error && d.price; })
      .map(function (d) {
        return {
          servico: d.name,
          transportadora: (d.company && d.company.name) || '',
          preco: Number(d.price),
          prazoDias: d.delivery_time
        };
      })
      .sort(function (a, b) { return a.preco - b.preco; });

    if (!opcoes.length) {
      // DEBUG TEMPORÁRIO (28/Jul/2026, segunda rodada): a correção do seguro
      // não resolveu sozinha — incluindo o payload enviado + resposta crua
      // pra achar o que mais está causando "faixa não encontrada". Remover
      // assim que resolvido.
      res.status(200).json({ ok: false, erro: 'Nenhuma opção de frete disponível pra esse CEP', debugPayload: payload, debugRaw: data });
      return;
    }

    res.status(200).json({ ok: true, opcoes: opcoes, pesoEstimadoKg: pesoTotal });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
};
