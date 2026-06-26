// ============================================================
// ZUM LOJA ONLINE — Backend Apps Script
// Cole este código no editor do Apps Script (script.google.com)
// no projeto já existente da ZUM.
//
// PASSOS:
// 1. Abra o Apps Script do projeto ZUM
// 2. Clique em "+" para adicionar um novo arquivo .gs
// 3. Nomeie como "LojaOnline"
// 4. Cole TODO este conteúdo
// 5. Rode a função criarAbas() UMA VEZ (menu Executar → criarAbas)
// 6. Publique o webapp (Implantar → Nova implantação → Web App)
//    - Executar como: Você mesmo
//    - Quem tem acesso: Qualquer pessoa
// 7. Copie a URL gerada e cole em loja.html na variável AS_URL
// ============================================================

var SS_ID = '1mPFvF1ryJg4-tUVwYccjFcWPzr8Bllv3UYXBBjvj8Rs';

function getSheet(nome) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(nome);
}

// ============================================================
// RODE ESTA FUNÇÃO UMA VEZ para criar todas as abas necessárias
// ============================================================
function criarAbas() {
  var ss = SpreadsheetApp.openById(SS_ID);
  var abas = [
    { nome: 'Pedidos Online', cols: ['ID','Data','CPF','Nome','Email','WhatsApp','CEP','Rua','Número','Complemento','Bairro','Cidade','UF','Itens (JSON)','Subtotal','Frete','Total','Pagamento','Parcelas','Status'] },
    { nome: 'Leads',          cols: ['Data','CPF','Nome','Email','WhatsApp','CEP','Cidade','UF','Origem'] },
    { nome: 'Sacola Abandonada', cols: ['Data','SessionID','Itens (JSON)','Total','Email','WhatsApp'] },
    { nome: 'Funil Online',   cols: ['Data','SessionID','Etapa','SKU','Referrer'] },
    { nome: 'E-mails Enviados', cols: ['Data','Email','Tipo','Assunto','Status'] }
  ];
  abas.forEach(function(a) {
    var sheet = ss.getSheetByName(a.nome);
    if (!sheet) {
      sheet = ss.insertSheet(a.nome);
    }
    var header = sheet.getRange(1, 1, 1, a.cols.length);
    header.setValues([a.cols]);
    header.setFontWeight('bold').setBackground('#111111').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  });
  SpreadsheetApp.getUi().alert('Abas criadas com sucesso!');
}

// ============================================================
// doPost — recebe chamadas da loja.html via fetch()
// ============================================================
function doPost(e) {
  var out = ContentService.createTextOutput();
  out.setMimeType(ContentService.MimeType.JSON);
  var result = { ok: false, erro: 'Ação não reconhecida' };
  try {
    var d = JSON.parse(e.postData.contents);
    var action = d.action;
    if      (action === 'buscarCPF')       result = buscarCPF(d.cpf);
    else if (action === 'registrarPedido') result = registrarPedido(d);
    else if (action === 'registrarLead')   result = registrarLead(d);
    else if (action === 'registrarSacola') result = registrarSacola(d);
    else if (action === 'registrarFunil')  result = registrarFunil(d);
  } catch(err) {
    result = { ok: false, erro: err.message };
  }
  out.setContent(JSON.stringify(result));
  return out;
}

// ============================================================
// BUSCAR CPF — retorna dados do cliente se já comprou antes
// ============================================================
function buscarCPF(cpf) {
  var sheet = getSheet('Pedidos Online');
  if (!sheet) return { ok: false };
  var cpfLimpo = String(cpf).replace(/\D/g, '');
  var data = sheet.getDataRange().getValues();
  // Percorre do mais recente para o mais antigo
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][2]).replace(/\D/g,'') === cpfLimpo) {
      return {
        ok: true,
        nome: data[i][3],  email:  data[i][4],  wpp:    data[i][5],
        cep:  data[i][6],  rua:    data[i][7],  num:    data[i][8],
        comp: data[i][9],  bairro: data[i][10], cidade: data[i][11], uf: data[i][12]
      };
    }
  }
  return { ok: false };
}

// ============================================================
// REGISTRAR PEDIDO
// ============================================================
function registrarPedido(d) {
  var sheet = getSheet('Pedidos Online');
  if (!sheet) return { ok: false, erro: 'Aba Pedidos Online não encontrada' };
  var id = 'ZUM-' + Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyMMdd') + '-' +
           String(sheet.getLastRow()).padStart(3, '0');
  sheet.appendRow([
    id,
    new Date(),
    d.cpf, d.nome, d.email, d.wpp,
    d.cep, d.rua, d.num, d.comp || '', d.bairro, d.cidade, d.uf,
    JSON.stringify(d.itens),
    d.subtotal, d.frete || 0, d.total,
    d.pagamento, d.parcelas || 1,
    'Aguardando pagamento'
  ]);
  return { ok: true, pedido: id };
}

// ============================================================
// REGISTRAR LEAD (cliente que chegou até a tela de confirmar)
// ============================================================
function registrarLead(d) {
  var sheet = getSheet('Leads');
  if (!sheet) return { ok: false };
  // Evita duplicar o mesmo CPF no mesmo dia
  var hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var dataRow = Utilities.formatDate(new Date(data[i][0]), 'America/Sao_Paulo', 'yyyy-MM-dd');
    if (String(data[i][1]).replace(/\D/g,'') === String(d.cpf).replace(/\D/g,'') && dataRow === hoje) {
      return { ok: true, novo: false }; // já existe
    }
  }
  sheet.appendRow([new Date(), d.cpf, d.nome, d.email, d.wpp, d.cep, d.cidade, d.uf, 'loja-online']);
  return { ok: true, novo: true };
}

// ============================================================
// REGISTRAR SACOLA ABANDONADA
// ============================================================
function registrarSacola(d) {
  var sheet = getSheet('Sacola Abandonada');
  if (!sheet) return { ok: false };
  sheet.appendRow([new Date(), d.sessionId, JSON.stringify(d.itens), d.total, d.email || '', d.wpp || '']);
  return { ok: true };
}

// ============================================================
// REGISTRAR FUNIL (rastreamento de etapas)
// ============================================================
function registrarFunil(d) {
  var sheet = getSheet('Funil Online');
  if (!sheet) return { ok: false };
  sheet.appendRow([new Date(), d.sessionId, d.etapa, d.sku || '', d.ref || '']);
  return { ok: true };
}

// ============================================================
// DASHBOARD VENDAS ONLINE — HTML para incluir no doGet do webapp
//
// No seu doGet existente, adicione uma condição como:
//   if (page === 'loja') return HtmlService.createHtmlOutput(dashboardLojaHtml());
// ============================================================
function dashboardLojaHtml() {
  var ss   = SpreadsheetApp.openById(SS_ID);
  var ped  = ss.getSheetByName('Pedidos Online');
  var lead = ss.getSheetByName('Leads');
  var fun  = ss.getSheetByName('Funil Online');
  var sac  = ss.getSheetByName('Sacola Abandonada');

  var totalPedidos = ped  ? Math.max(0, ped.getLastRow()  - 1) : 0;
  var totalLeads   = lead ? Math.max(0, lead.getLastRow() - 1) : 0;
  var totalFunil   = fun  ? Math.max(0, fun.getLastRow()  - 1) : 0;
  var totalSacolas = sac  ? Math.max(0, sac.getLastRow()  - 1) : 0;

  // Faturamento total
  var faturamento = 0;
  if (ped && ped.getLastRow() > 1) {
    var vals = ped.getRange(2, 17, ped.getLastRow()-1, 1).getValues();
    vals.forEach(function(r){ faturamento += Number(r[0])||0; });
  }

  // Ticket médio
  var ticket = totalPedidos > 0 ? faturamento / totalPedidos : 0;

  // Taxa de conversão: sucesso / home
  var etapas = {};
  if (fun && fun.getLastRow() > 1) {
    var fRows = fun.getRange(2, 3, fun.getLastRow()-1, 1).getValues();
    fRows.forEach(function(r){ var e = r[0]; etapas[e] = (etapas[e]||0)+1; });
  }
  var conversao = etapas['home'] > 0 ? ((etapas['sucesso']||0)/etapas['home']*100).toFixed(1) : '0.0';

  var brl = function(v){ return 'R$ ' + v.toFixed(2).replace('.',','); };

  return '<style>body{font-family:sans-serif;margin:0;padding:20px;background:#f8f8f8}.card{background:#fff;border-radius:8px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.1)}.num{font-size:32px;font-weight:700;color:#111}.lbl{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}h2{font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#111;margin:24px 0 12px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#111;color:#fff;padding:8px;text-align:left}td{padding:8px;border-bottom:1px solid #eee}</style>'+
    '<h2>Vendas Online</h2>'+
    '<div class="grid">'+
      '<div class="card"><div class="num">'+brl(faturamento)+'</div><div class="lbl">Faturamento</div></div>'+
      '<div class="card"><div class="num">'+totalPedidos+'</div><div class="lbl">Pedidos</div></div>'+
      '<div class="card"><div class="num">'+brl(ticket)+'</div><div class="lbl">Ticket médio</div></div>'+
      '<div class="card"><div class="num">'+conversao+'%</div><div class="lbl">Conversão</div></div>'+
      '<div class="card"><div class="num">'+totalLeads+'</div><div class="lbl">Leads</div></div>'+
      '<div class="card"><div class="num">'+totalSacolas+'</div><div class="lbl">Sacolas abandonadas</div></div>'+
    '</div>'+
    '<h2>Funil</h2>'+
    '<div class="card"><table>'+
      '<tr><th>Etapa</th><th>Visitas</th></tr>'+
      ['home','produto','sacola','checkout','confirmar','pix','cartao','sucesso'].map(function(e){
        return '<tr><td>'+e+'</td><td>'+(etapas[e]||0)+'</td></tr>';
      }).join('')+
    '</table></div>';
}

// ============================================================
// SIDEBAR LOJA ONLINE — HTML para incluir na sidebar do webapp
//
// No seu createMenu ou sidebar existente, adicione:
//   SpreadsheetApp.getUi().showSidebar(
//     HtmlService.createHtmlOutput(sidebarLojaHtml()).setTitle('Loja Online')
//   );
// ============================================================
function abrirSidebarLoja() {
  var html = HtmlService.createHtmlOutput(sidebarLojaHtml()).setTitle('Loja Online');
  SpreadsheetApp.getUi().showSidebar(html);
}

function sidebarLojaHtml() {
  var ss  = SpreadsheetApp.openById(SS_ID);
  var ped = ss.getSheetByName('Pedidos Online');
  var sac = ss.getSheetByName('Sacola Abandonada');

  // Últimos 5 pedidos
  var pedRows = '';
  if (ped && ped.getLastRow() > 1) {
    var rows = ped.getRange(2, 1, ped.getLastRow()-1, 20).getValues();
    rows.reverse().slice(0,5).forEach(function(r){
      pedRows += '<tr><td>'+r[0]+'</td><td>'+r[3]+'</td><td>R$ '+Number(r[16]).toFixed(2).replace('.',',')+'</td><td>'+r[19]+'</td></tr>';
    });
  }
  if(!pedRows) pedRows = '<tr><td colspan="4" style="color:#aaa;text-align:center">Nenhum pedido ainda</td></tr>';

  // Últimas 5 sacolas abandonadas
  var sacRows = '';
  if (sac && sac.getLastRow() > 1) {
    var sRows = sac.getRange(2, 1, sac.getLastRow()-1, 6).getValues();
    sRows.reverse().slice(0,5).forEach(function(r){
      sacRows += '<tr><td>'+r[4]+'</td><td>R$ '+Number(r[3]).toFixed(2).replace('.',',')+'</td></tr>';
    });
  }
  if(!sacRows) sacRows = '<tr><td colspan="2" style="color:#aaa;text-align:center">Nenhuma sacola</td></tr>';

  return '<style>*{font-family:sans-serif;font-size:13px}h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#555;margin:16px 0 8px}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;padding:6px;text-align:left;font-size:11px}td{padding:6px;border-bottom:1px solid #eee}</style>'+
    '<h3>Últimos Pedidos</h3>'+
    '<table><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Status</th></tr>'+pedRows+'</table>'+
    '<h3>Sacolas Abandonadas</h3>'+
    '<table><tr><th>Email</th><th>Total</th></tr>'+sacRows+'</table>';
}
