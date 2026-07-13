// Cria um link de pagamento real na InfinitePay (PIX ou cartão) pro pedido
// já registrado como "Pendente" no ZumAgent (criarPedidoPendente, chamado
// antes disso pelo front-end — catalogo.html OU index.html, ambos usam este
// mesmo endpoint). O cliente é redirecionado pra esse link; a confirmação de
// pagamento chega depois via webhook-infinitepay. redirect_url aponta pra
// raiz do domínio (index.html), que detecta o retorno via ?order_nsu=.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, erro: 'Método não permitido' });
    return;
  }

  try {
    var body = req.body || {};
    var pedido = body.pedido;
    var itens = body.itens;
    var cliente = body.cliente || {};

    if (!pedido || !Array.isArray(itens) || !itens.length) {
      res.status(400).json({ ok: false, erro: 'Dados do pedido incompletos' });
      return;
    }

    var handle = process.env.INFINITEPAY_HANDLE;
    if (!handle) {
      res.status(500).json({ ok: false, erro: 'INFINITEPAY_HANDLE não configurado na Vercel' });
      return;
    }

    var items = itens.map(function (i) {
      return {
        quantity: i.qty,
        price: Math.round(i.price * 100), // InfinitePay espera valor em centavos
        description: i.name
      };
    });

    // BUG REAL corrigido (13/07/2026): redirect_url era sempre fixo pra raiz
    // do domínio. Isso quebrava sempre que a raiz apontava pra outro lugar
    // (ex: enquanto o index.html só existe em /teste e "/" redireciona pro
    // catalogo.html) — o cliente pagava no site novo e voltava pro catálogo.
    // Agora o próprio site manda de volta a URL certa (redirectUrl); só aceita
    // se for do nosso domínio, pra não virar um redirect aberto pra qualquer
    // site (open redirect).
    var redirectUrl = 'https://www.usezum.com.br/';
    if (typeof body.redirectUrl === 'string' && body.redirectUrl.indexOf('https://www.usezum.com.br') === 0) {
      redirectUrl = body.redirectUrl;
    }

    var linkBody = {
      handle: handle,
      items: items,
      order_nsu: pedido,
      redirect_url: redirectUrl,
      webhook_url: 'https://www.usezum.com.br/api/webhook-infinitepay'
    };
    if (cliente.nome || cliente.email || cliente.celular) {
      linkBody.customer = {
        name: cliente.nome || '',
        email: cliente.email || '',
        phone_number: cliente.celular || ''
      };
    }
    // Manda o endereço que o cliente já preencheu no catalogo.html pra
    // InfinitePay pré-preencher a etapa "Entrega" do checkout deles — sem
    // isso o cliente tinha que digitar CEP/número duas vezes (uma no nosso
    // site, outra na tela da InfinitePay), o que é chato e derruba conversão.
    var cepLimpo = (cliente.cep || '').toString().replace(/\D/g, '');
    if (cepLimpo || cliente.numero) {
      linkBody.address = {
        cep: cepLimpo,
        number: cliente.numero || '',
        complement: cliente.complemento || ''
      };
    }

    var r = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkBody)
    });
    var data = await r.json();

    if (!r.ok || !data.url) {
      res.status(502).json({ ok: false, erro: (data && data.message) || 'Erro ao criar link de pagamento na InfinitePay' });
      return;
    }

    res.status(200).json({ ok: true, url: data.url });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
};
