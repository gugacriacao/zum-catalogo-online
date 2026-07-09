// Cria um link de pagamento real na InfinitePay (PIX ou cartão) pro pedido
// já registrado como "Pendente" no ZumAgent (criarPedidoPendente, chamado
// antes disso pelo próprio catalogo.html). O cliente é redirecionado pra
// esse link; a confirmação de pagamento chega depois via webhook-infinitepay.
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

    var linkBody = {
      handle: handle,
      items: items,
      order_nsu: pedido,
      redirect_url: 'https://www.usezum.com.br/catalogozumonline',
      webhook_url: 'https://www.usezum.com.br/api/webhook-infinitepay'
    };
    if (cliente.nome || cliente.email || cliente.celular) {
      linkBody.customer = {
        name: cliente.nome || '',
        email: cliente.email || '',
        phone_number: cliente.celular || ''
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
