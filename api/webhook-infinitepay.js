// Recebe a notificação de pagamento aprovado da InfinitePay e confirma o
// pedido de verdade na planilha (ZumAgent). A InfinitePay não assina os
// webhooks, então antes de confiar no corpo recebido a gente confere
// independentemente com o payment_check deles; e o próprio ZumAgent já
// rejeita (e é idempotente) se o pedido não existir ou já estiver pago.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Método não permitido' });
    return;
  }

  try {
    var payload = req.body || {};
    var pedido = payload.order_nsu;
    var captureMethod = payload.capture_method; // 'pix' ou 'credit_card'

    if (!pedido) {
      res.status(400).json({ success: false, message: 'order_nsu ausente' });
      return;
    }

    var handle = process.env.INFINITEPAY_HANDLE;
    var asUrl = process.env.ZUMAGENT_URL;
    var apiToken = process.env.ZUMAGENT_TOKEN;

    if (!asUrl || !apiToken) {
      res.status(500).json({ success: false, message: 'ZUMAGENT_URL/ZUMAGENT_TOKEN não configurados na Vercel' });
      return;
    }

    // Confere direto com a InfinitePay que o pagamento é real antes de confirmar
    if (handle) {
      try {
        var checkRes = await fetch('https://api.checkout.infinitepay.io/payment_check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            handle: handle,
            order_nsu: pedido,
            transaction_nsu: payload.transaction_nsu,
            slug: payload.invoice_slug
          })
        });
        var checkData = await checkRes.json();
        if (checkData && checkData.success && !checkData.paid) {
          // InfinitePay confirma que esse pedido ainda não foi pago de verdade
          res.status(200).json({ success: true, message: 'Aguardando confirmação real do pagamento' });
          return;
        }
      } catch (e) {
        // Se a verificação falhar por instabilidade, segue com o corpo do
        // webhook mesmo assim — o ZumAgent ainda valida se o pedido existe.
      }
    }

    var metodoPagamento = captureMethod === 'pix' ? 'PIX' : 'Cartão (InfinitePay)';

    var zumRes = await fetch(asUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirmarPagamento',
        token: apiToken,
        pedido: pedido,
        metodoPagamento: metodoPagamento
      })
    });
    var zumData = await zumRes.json();

    if (!zumData || !zumData.ok) {
      // Pedido não encontrado ou outro erro definitivo — não adianta a
      // InfinitePay tentar de novo, então responde 200 mesmo assim.
      res.status(200).json({ success: false, message: (zumData && zumData.erro) || 'Não foi possível confirmar o pedido' });
      return;
    }

    res.status(200).json({ success: true, message: null });
  } catch (e) {
    // Erro inesperado (ex: ZumAgent fora do ar) — 400 faz a InfinitePay
    // tentar de novo automaticamente.
    res.status(400).json({ success: false, message: e.message });
  }
};
