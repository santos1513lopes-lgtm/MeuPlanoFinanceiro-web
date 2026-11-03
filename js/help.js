export const helpTopics=[
{"id":"controls","title":"Pessoal e Empresa no mesmo login","keywords":"controle empresa pessoal pj pf separar caixa saldo inicial","view":"dashboard","steps":["Use Controle financeiro no cabeçalho para alternar entre Pessoal e Empresa. O e-mail, a senha e a autorização são os mesmos.","Contas, cartões, categorias, lançamentos, orçamento, metas e potes pertencem ao controle selecionado. O nome do controle aparece no título e nos formulários.","Cadastre uma conta e o saldo anterior aos primeiros movimentos em cada controle. Saldo inicial não é uma receita.","A nova estrutura começa vazia. Os testes da versão anterior não são importados. Para corrigir um lançamento feito no controle errado, cancele no controle de origem e registre no correto."]},
{"id":"payables","title":"Contas a pagar e despesas fixas mensais","keywords":"conta fixa internet recorrente boleto vencimento mensal repetir","view":"payables","steps":["Abra Contas a pagar e escolha o mês. A tela reúne despesas pendentes e faturas abertas somente do controle selecionado.","Use Conta a pagar para um vencimento avulso. Informe descrição, conta, categoria, valor e vencimento. Mantenha Previsto até pagar.","Conta fixa mensal abre 12 ocorrências por padrão; ajuste de 1 a 120 antes de salvar. O valor se repete, não é dividido. Não há geração infinita nem inferência automática pelo histórico.","Cada ocorrência é independente: pode ser editada, baixada ou cancelada sem alterar as demais. Para prolongar uma conta fixa, crie novas ocorrências a partir do primeiro mês ainda não cadastrado.","Na Visão geral, confira vencimentos, atrasos, total do mês e compromissos futuros. Os avisos aparecem ao abrir o aplicativo; não há notificação com o aplicativo fechado."]},
{"id":"pots","title":"Potes: despesas, folha e impostos","keywords":"pote reserva folha imposto envelope destinação reservado","view":"pots","steps":["Cadastre primeiro a conta onde o dinheiro realmente está. Depois crie um pote, selecione essa conta e informe o valor reservado agora e o objetivo.","Potes são destinações de parte do saldo; não criam dinheiro, receita ou despesa. O mesmo saldo não pode ser reservado acima do disponível naquela conta. Contas de investimento não recebem potes.","Ao lançar uma despesa ou pagar uma fatura, selecione opcionalmente o pote da mesma conta. Quando efetivar a baixa, a conta diminui e a reserva é consumida uma única vez. A previsão sozinha não consome a reserva.","Reforce ou libere uma reserva em Ajustar. Para transferir dinheiro já reservado a outra conta ou controle, libere primeiro a parte necessária.","O objetivo informa quanto falta reservar; o vencimento real deve ser cadastrado em Contas a pagar. Reservar e agendar o pagamento não duplica o compromisso. Saldo não reservado não equivale a lucro disponível."]},
{"id":"between","title":"Pró-labore, lucros e aportes entre os controles","keywords":"prolabore pró-labore lucro distribuição aporte reembolso transferência empresa pessoal","view":"between","steps":["Cadastre uma conta em cada controle. Abra Entre controles e informe direção, finalidade, contas, valor líquido, data prevista e situação.","Pró-labore líquido e distribuição de lucros saem de Empresa para Pessoal; aporte do proprietário segue de Pessoal para Empresa. Reembolso pode seguir ambas as direções.","Previsto entra nas projeções dos dois controles, sem mudar saldos reais. Ao transferir no banco, use Baixar e informe a data efetiva. O aplicativo não executa transferências bancárias.","Cada movimentação possui um registro único: editar, baixar ou cancelar altera seus efeitos nos dois controles juntos. Não crie outra receita ou despesa para o mesmo repasse.","Pró-labore remunera o trabalho; distribuição de lucros depende da apuração contábil. O aplicativo não calcula folha, impostos ou lucro contábil. Registre encargos separadamente conforme orientação do contador.","Não existe painel consolidado nesta versão. Aportes não são vendas; distribuição de lucros não é despesa operacional. Os relatórios mostram essas finalidades separadas nos registros vinculados."]},

 {id:'start',title:'1. Comece por aqui',keywords:'primeiro acesso começar saldo inicial conta categorias',view:'accounts',steps:[
 'Em Contas, cadastre banco, carteira, poupança ou investimento. O saldo de abertura é o valor ANTES dos movimentos da data escolhida; ele não é uma receita.',
 'Cadastre suas Categorias. Se usa crédito, cadastre também os Cartões com fechamento e vencimento.',
 'Registre receitas e despesas, diferenciando Previsto de Pago/Recebido. Confira saldos, próximas faturas e o planejamento na Visão geral.',
 'Na demonstração, os dados são fictícios e ficam somente neste navegador. Na conta real, eles são associados ao seu usuário no Firebase.',
 'O e-mail identifica sua conta. No computador, recolha ou expanda o menu pelo botão do cabeçalho; no celular, abra pelo botão de menu e feche por X, Esc ou tocando fora. Sair encerra a sessão sem apagar seus registros.'
 ]},
 {id:'dashboard',title:'2. Entenda a Visão geral e as despesas futuras',keywords:'painel geral futuro previsão projetado 180 novembro vencimento mês compromisso',view:'dashboard',steps:[
 'Disponível nas contas é o saldo atual de contas correntes, carteiras e poupanças. Patrimônio investido aparece separado. Recebido e Saídas pagas usam a data efetiva da baixa no mês selecionado.',
 'A receber no mês soma receitas e rendimentos previstos ainda pendentes. Contas a pagar soma despesas comuns previstas. Faturas em aberto soma o que ainda falta pagar no cartão. Total a pagar é contas pendentes mais faturas abertas, sem duplicar compras e pagamentos.',
 'Os indicadores mensais usam o vencimento no mês escolhido e o saldo que permanece em aberto hoje. Eles não reconstituem o que estava pendente em uma data passada.',
 'Exemplo: uma compra de R$ 180 em uma parcela, na fatura com vencimento em 14/11, aparece em Faturas em aberto e no Total a pagar de novembro. Ela não diminui o saldo bancário antes do pagamento.',
 'A data da compra e o vencimento da fatura são diferentes. Se a compra não aparecer no mês esperado, confira o cartão, o mês da primeira fatura e seu vencimento em Cartões e faturas.',
 'O total de compromissos futuros mostra todos os valores já registrados com vencimento de hoje em diante, mesmo depois dos próximos 12 meses. Vencidos são apresentados à parte. Transferências não são despesas e não entram nesses totais.',
 'Saldo projetado e a tabela de 12 meses partem do dinheiro disponível hoje, somam previsões e descontam pagamentos futuros e faturas abertas. Vencidos entram no primeiro mês. Aportes e resgates previstos também afetam essa liquidez.',
 'O planejamento não presume salários, compras ou contas ainda não cadastrados e não inclui juros de atraso automaticamente.'
 ]},
 {id:'accounts',title:'3. Contas, saldos e categorias',keywords:'banco carteira poupança abertura categoria saldo negativo editar',view:'accounts',steps:[
 'Use Conta corrente para bancos, Carteira para dinheiro, Poupança/reserva para valores que entram no disponível e Investimento para patrimônio separado.',
 'Saldo de abertura pode ser negativo. A data não pode estar no futuro. Movimentos com baixa anterior à abertura não são somados ao saldo dessa conta.',
 'Editar o saldo ou a data de abertura recalcula o saldo atual. Não registre o mesmo saldo inicial como receita.',
 'Categorias organizam receitas e despesas. Elas são vinculadas por identificador, permitindo editar o nome sem perder os vínculos.'
 ]},
 {id:'transactions',title:'4. Lançar receitas e despesas',keywords:'receita despesa recebido pago previsto valor data baixa registro editar cancelar',view:'transactions',steps:[
 'Clique em Novo lançamento. Escolha Receita ou Despesa e preencha descrição, valor positivo, categoria e conta.',
 'Previsto registra um compromisso sem alterar o saldo atual. Pago/Recebido exige a data real da baixa e movimenta o saldo.',
 'O vencimento define quando você espera pagar/receber; a competência serve à classificação mensal; a baixa registra quando o dinheiro efetivamente se movimentou.',
 'Em Lançamentos, use Editar para corrigir uma ocorrência e Cancelar para preservar seu histórico sem seu efeito nos cálculos.',
 'Para receber ou pagar parcialmente uma despesa comum, divida o lançamento em uma parte liquidada e outra prevista. A baixa parcial automática é própria das faturas.'
 ]},
 {id:'recurrence',title:'5. Repetições mensais e compras parceladas',keywords:'recorrência recorrencia salário aluguel repetir ocorrência parcelas centavos mensal',view:'transactions',steps:[
 'Ocorrências mensais repete o valor integral. Exemplo: aluguel de R$ 900 por 12 ocorrências cria 12 compromissos de R$ 900, incluindo o primeiro. Crie a série como Previsto e baixe cada ocorrência depois.',
 'Parcelas no cartão divide o valor total. Exemplo: compra de R$ 180 em 3 parcelas cria três parcelas de R$ 60, nas faturas correspondentes.',
 'O ajuste de centavos fica na última parcela: R$ 100 em 3 vezes resulta em R$ 33,33, R$ 33,33 e R$ 33,34.',
 'Dias inexistentes no mês são ajustados para o último dia disponível. Uma operação aceita até 120 parcelas ou ocorrências. Editar/cancelar uma linha não modifica toda a série.',
 'As ocorrências são criadas ao salvar a operação; o site não gera novas séries automaticamente enquanto está fechado.'
 ]},
 {id:'cards',title:'6. Comprar no cartão e conferir a fatura',keywords:'cartão cartao crédito credito fatura fechamento vencimento compra confirmado',view:'cards',steps:[
 'Cadastre o cartão antes da compra. O limite informado é apenas cadastral: esta versão não controla automaticamente o limite disponível.',
 'Em Novo lançamento, escolha Compra no cartão, o cartão, categoria, data da compra, valor total e número de parcelas.',
 'O mês da primeira fatura pode ser informado manualmente. Ao deixá-lo vazio, o aplicativo calcula pelo fechamento e vencimento do cartão.',
 'Compras no dia do fechamento entram no ciclo seguinte. Dias 29, 30 ou 31 são ajustados em meses mais curtos. Confira o ciclo com a administradora.',
 'Confirmado significa que a compra já foi registrada, não que a fatura foi paga. A dívida é mostrada em Cartões e faturas e no planejamento.',
 'Alterar os dias do cartão afeta novas compras; parcelas já cadastradas mantêm suas datas. Você pode editar as ocorrências para corrigir uma primeira fatura diferente.'
 ]},
 {id:'invoice-payment',title:'7. Pagar a fatura e dar baixa',keywords:'pagamento parcial fatura pagar dívida divida duplicada baixar conta cartão',view:'cards',steps:[
 'Em Cartões e faturas, escolha o mês e clique em Pagar na fatura. Informe de qual conta o dinheiro saiu e a data efetiva.',
 'Para pagamento parcial, informe um valor menor que o saldo aberto. O restante continua pendente e entra na projeção.',
 'Não crie outra Despesa para representar a fatura: a compra já classificou seu gasto. Pagamento de fatura reduz a conta bancária e a dívida sem duplicar o orçamento.',
 'Não marque a compra no cartão como uma despesa bancária paga. Para despesas/receitas previstas comuns, use Baixar em Compromissos ou Lançamentos.',
 'Créditos por edições/cancelamentos de compras já pagas não são compensados automaticamente em outra fatura. Juros de rotativo e encargos exigem registro e conferência próprios.'
 ]},
 {id:'future',title:'8. Acompanhar compromissos e vencimentos',keywords:'contas pagar receber vencido vencidos futuro agenda compromisso',view:'future',steps:[
 'Escolha o mês em Compromissos para conferir os lançamentos previstos. Faturas em aberto ficam em um quadro separado.',
 'Na Visão geral, Próximos vencimentos reúne as previsões e as faturas do mês selecionado. Use Ver todos para abrir a lista completa.',
 'Receitas pendentes entram como valores a receber; despesas e faturas entram a pagar. As transferências entre suas próprias contas não viram despesa.',
 'Somente registrar uma data de vencimento não paga nada automaticamente. O aplicativo não faz pagamentos bancários nem envia notificações com a página fechada.'
 ]},
 {id:'budget',title:'9. Definir orçamento por categoria',keywords:'orçamento orcamento limite categoria comprometido disponível disponivel excedido',view:'budgets',steps:[
 'Selecione o mês, escolha uma categoria e cadastre um limite positivo. Use um limite por categoria em cada mês.',
 'Comprometido soma despesas comuns previstas/pagas e compras no cartão na competência escolhida. Cancelados ficam de fora.',
 'Pagamentos de fatura e transferências não entram de novo. Disponível é limite menos comprometido; valores excedidos são destacados.'
 ]},
 {id:'goals',title:'10. Acompanhar metas',keywords:'metas objetivo reserva prazo acumulado progresso',view:'goals',steps:[
 'Cadastre nome, valor objetivo, prazo e valor já acumulado. O progresso mostra o quanto falta atingir.',
 'O acumulado é manual e não movimenta saldos. Se guardar dinheiro em outra conta, registre também a transferência real.',
 'Use o simulador de investimentos, com uma meta opcional, para experimentar aportes e prazos antes de decidir.'
 ]},
 {id:'investments',title:'11. Poupança, investimentos, aportes e resgates',keywords:'investimento poupança poupanca aporte resgate transferência transferencia rendimento patrimonio',view:'investments',steps:[
 'Cadastre uma conta do tipo Investimento para separar seu patrimônio investido do dinheiro disponível. Poupança/reserva permanece no disponível.',
 'Aporte é uma transferência da conta bancária para a conta de investimento. Resgate faz o caminho inverso. Nenhum dos dois é despesa ou receita de consumo.',
 'Registre Rendimento somente para um valor efetivamente reconhecido. O aplicativo não busca preços de mercado nem atualiza rentabilidade sozinho.',
 'Previsões de aportes reduzem o saldo disponível projetado; resgates previstos o aumentam. Simulações não entram nos saldos reais.'
 ]},
 {id:'calculators',title:'12. Usar as calculadoras',keywords:'calculadora simular simulador juros compostos taxa anual mensal price financiamento porcentagem',view:'calculators',steps:[
 'Investimentos: informe valor inicial, aporte mensal, taxa, período da taxa e prazo. Escolha aporte no início ou fim do mês e, se quiser, uma meta.',
 'A taxa anual é efetiva e convertida para mensal. O resultado separa capital aplicado de rendimento estimado.',
 'À vista ou financiado: informe preço, entrada, quantidade de parcelas e juros mensais. O cálculo usa parcelas estimadas pela tabela Price, com eventual ajuste final de centavos.',
 'As simulações usam taxas hipotéticas constantes, sem impostos, inflação, tarifas, IOF ou CET. Não são garantia de rentabilidade nem criam lançamentos automaticamente.',
 'Na calculadora comum, use +, -, *, /, parênteses e %. Exemplo: 200 * 10% = 20. A porcentagem representa dividir por 100.'
 ]},
 {id:'reports',title:'13. Relatórios, backup e atualização',keywords:'relatório relatorio pdf csv backup json restaurar exportar atualizar salvar',view:'reports',steps:[
 'Em Relatórios, filtre mês, tipo, situação e texto. CSV exporta o filtro atual; Imprimir/PDF usa a impressão do navegador, onde você pode escolher Salvar como PDF.',
 'O botão Backup baixa um JSON identificado com o controle selecionado, seus registros carregados e o histórico vinculado entre controles. Guarde-o com cuidado. Não há restauração automática por esse arquivo nesta versão.',
 'Use Atualizar para buscar os dados do servidor. O aplicativo não mantém sincronização em tempo real nem fila de gravação offline.',
 'Se a conexão cair, confira o resultado após atualizar antes de repetir um cadastro. Para usar dados reais, entre com sua conta fora do modo demonstração.'
 ]},
 {id:'settings',title:'14. Reiniciar os registros com segurança',keywords:'configurações configuracoes limpar apagar reset reiniciar zerar começar do zero login autorização sair',view:'settings',steps:[
 'Limpar movimentações apaga lançamentos e zera saldos de abertura, acumulado das metas e reservas dos potes. Mantém contas, cartões, categorias, limites, objetivos e potes cadastrados no controle selecionado.',
 'Começar do zero apaga as sete coleções financeiras do controle selecionado. Depois, cadastre suas contas e saldos iniciais novamente.',
 'As duas opções preservam e-mail, senha, login e autorização; não apagam o outro controle nem afetam outros usuários. Se houver movimentações vinculadas ativas, cancele-as primeiro em Entre controles; o cancelamento ajusta os dois lados. O histórico desses vínculos cancelados é mantido.',
 'Antes de confirmar, baixe e confira o backup, feche outras abas e leia as quantidades de registros. Digite a palavra pedida e marque a confirmação.',
 'Não há desfazer. Limpezas grandes usam vários lotes; uma interrupção pode deixar parte concluída. Atualize e confira antes de tentar concluir o restante.',
 'O botão Sair encerra a sessão; não apaga registros. A criação e a liberação de usuários são feitas pelo administrador no console Firebase.'
 ]}
];
export const normalizeHelp=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
export function searchHelp(query){const q=normalizeHelp(query);return helpTopics.filter(topic=>normalizeHelp(topic.title+' '+topic.keywords+' '+topic.steps.join(' ')).includes(q));}
