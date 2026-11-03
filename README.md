# Meu Financeiro — Pessoal e Empresa

Aplicativo em HTML, CSS e JavaScript. GitHub Pages hospeda a interface; Firebase Authentication autentica e Cloud Firestore armazena os registros. Cada usuário autorizado possui controles Pessoal e Empresa separados.

Aplicativo: https://santos1513lopes-lgtm.github.io/MeuPlanoFinanceiro-web/

## Ativar esta versão no projeto existente

Esta atualização mantém os controles Pessoal e Empresa em `finance_v3` e preserva seus registros. Acrescenta o histórico de baixas/acordos em `settlements`. Não exclua dados, contas ou usuários. Publicar o site no GitHub não publica as regras do Firebase.

1. Abra **firestore.rules** na raiz deste repositório.
2. Use **Raw/Bruto** ou o botão de copiar. Copie o código original, sem tradução automática do navegador.
3. No Console Firebase, selecione **MeuPlanoFinanceiro**, ID `meuplanofinanceiro`.
4. Abra **Firestore → banco (default) → Regras**.
5. Substitua todo o código pelo conteúdo atual de `firestore.rules`.
6. Clique em **Publicar** e aguarde a confirmação e propagação.
7. Abra o aplicativo, pressione **Ctrl+F5** e entre com seu usuário existente.
8. Confira suas contas e registros nos controles já existentes. Não precisa cadastrá-los novamente.
9. Teste os filtros e as baixas parciais com um compromisso de teste, seguindo a seção abaixo.

Não use `allow read, write: if true`. Preserve `authorized_users` e `finance_v3`. Se aparecer `permission-denied`, confira o projeto, o banco e a publicação destas regras. Registros da antiga reestruturação `finance_v2` continuam fora do app; esta atualização não recria o banco nem importa esses testes antigos.

## Configurar o Firebase desde o início

1. Crie um projeto no Console Firebase e registre um app Web pelo ícone `</>`.
2. Copie o objeto `firebaseConfig` para `js/firebase-config.js`, mantendo a exportação do arquivo. A interface usa SDK modular via CDN, sem compilação.
3. Em **Authentication → Método de login**, habilite **E-mail/senha** e salve.
4. Em **Authentication → Configurações → Domínios autorizados**, adicione o domínio da hospedagem, por exemplo `santos1513lopes-lgtm.github.io`, sem protocolo e caminho.
5. Em **Bancos de dados → Firestore**, crie o banco `(default)`. Escolha a localização com cuidado: não pode ser trocada depois. O projeto atual usa `southamerica-east1` (São Paulo).
6. Inicie no modo de produção e publique as regras completas deste repositório.
7. Cadastre e autorize o primeiro usuário conforme a próxima seção.
8. Publique a interface no GitHub Pages.

As configurações Web identificam o projeto, mas não substituem as regras. Nunca publique chave privada de conta de serviço. Os 30 dias do modo de teste são uma validade da regra temporária, não um prazo de vida do banco gratuito. O uso continua sujeito às quotas e condições do plano Firebase.

## Criar e liberar mais um usuário

São necessárias **duas etapas**, no mesmo projeto:

1. Abra **Authentication → Usuários → Adicionar usuário**.
2. Informe e-mail e senha e salve. Não publique senhas no repositório.
3. Copie o **UID** desse usuário.
4. Abra **Firestore → Dados**.
5. Se não existir, inicie a coleção `authorized_users`.
6. Adicione um documento cujo **ID seja exatamente o UID**, respeitando maiúsculas e minúsculas. Não use ID automático nem o e-mail.
7. Crie o campo `enabled`, tipo **boolean**, valor **true/verdadeiro**. Não use o texto `"true"`.
8. Salve e peça ao usuário para entrar no site.

Exemplo: `authorized_users/UID_DO_USUARIO` com `{ enabled: true }`.

Cada usuário tem seus próprios controles. Esta versão não compartilha uma empresa entre usuários diferentes. Para revogar autorização, defina `enabled: false`; para desativar o login, desative também o usuário em Authentication. O app não cria usuários nem altera autorizações. Esqueci a senha usa o e-mail de recuperação do Firebase.

## Publicar no GitHub Pages

1. Envie para a raiz `index.html`, `styles.css`, `icon.svg`, a pasta `js` e os demais arquivos.
2. Abra **Settings/Configurações → Pages**.
3. Publique pela branch `main`, pasta `/ (root)`.
4. Aguarde **Actions → pages build and deployment** concluir com sucesso.
5. Abra o endereço gerado. O repositório atual já está configurado.
6. Nas atualizações, preserve os caminhos relativos dos módulos.

Firebase Hosting não é necessário. `firebase.json` aponta apenas para `firestore.rules`.

## Pessoal e Empresa

O seletor **Controle financeiro** fica no cabeçalho. Cada seleção carrega contas, cartões, categorias, lançamentos, orçamento, metas e potes próprios. O título e os formulários identificam onde você está trabalhando.

Cadastre em **Contas** o saldo existente antes dos movimentos da data de abertura. Saldo inicial não é receita. Conta corrente, carteira e poupança entram no saldo disponível; investimentos ficam separados. Não registre o mesmo dinheiro como abertura e receita.

## Contas a pagar e contas fixas mensais

1. Selecione o controle correto e cadastre conta e categorias.
2. Abra **Contas a pagar** e escolha o mês.
3. **Conta a pagar** cria um vencimento avulso.
4. **Conta fixa mensal** abre o formulário com **12 ocorrências**, incluindo a primeira. Ajuste de 1 a 120.
5. Informe descrição (ex.: Internet), categoria, conta, valor e primeiro vencimento.
6. Mantenha **Previsto** até pagar. O valor se repete integralmente em cada ocorrência.
7. Ao salvar, os vencimentos aparecem nos respectivos meses, na Visão geral, em Compromissos e na projeção.
8. Ao pagar, use **Pagar** e informe a quantia e a data efetivas. Cada ocorrência admite baixas parciais e acordos próprios. Depois do primeiro registro de histórico, seus dados-base ficam protegidos.

Não há criação infinita nem reconhecimento automático de contas fixas pelo histórico. Ao terminar o período cadastrado, crie novas ocorrências a partir do primeiro vencimento ainda não registrado. Os avisos aparecem dentro do app; não há notificação com o app fechado.

O painel mostra receitas previstas, despesas e saídas entre controles pendentes, faturas abertas e total a pagar no mês. O total de hoje em diante inclui todos os compromissos conhecidos, mesmo além da tabela de 12 meses. Vencidos aparecem separados e entram no primeiro mês da projeção. Pagos e cancelados saem das pendências.

## Pendências do mês, totais e baixas parciais

O botão **Mês selecionado / Todos os períodos** funciona como uma chave: clique para ver somente vencimentos do mês, clique novamente para incluir todos os períodos. Está na Visão geral e nas áreas Contas a pagar / Contas a receber. Os totais e a lista usam o mesmo escopo; o saldo bancário real não muda ao alternar a chave. A projeção mensal continua identificada pelo mês e pelo horizonte de 12 meses.

Em Contas a pagar / Contas a receber, escolha **Todas em aberto**, **Atrasadas** (antes de hoje), **Vencem hoje** ou **Futuras** (depois de hoje). Os cartões resumem o escopo antes do filtro e da busca; o total da lista filtrada é informado separadamente. Valores quitados ou encerrados não entram no aberto. Faturas entram pelo saldo restante, uma única vez.

### Receber/pagar uma parte

1. Escolha o controle e encontre uma receita/despesa prevista.
2. Clique em **Receber** ou **Pagar**.
3. Informe a quantia efetivamente movimentada e a data da baixa.
4. Para a diferença, escolha manter em aberto, renegociar com novo vencimento e motivo, ou encerrar sem dinheiro com motivo.
5. Salve e confira o histórico e o saldo restante. Para apenas renegociar/encerrar, informe zero na quantia efetiva.

Exemplo: receber R$ 200 de R$ 250 acrescenta R$ 200 à conta e mantém R$ 50 a receber. Pagar R$ 400 de R$ 500 reduz a conta e o pote associado em R$ 400 e mantém R$ 100 a pagar. Uma segunda baixa pode quitar o restante; cada data/quantia permanece no histórico.

Encerrar R$ 50 por desconto/abatimento/perdão/cancelamento registra essa diferença como encerrada, sem receita/despesa de caixa fictícia. Renegociar preserva o vencimento anterior no histórico e altera somente o prazo do restante. Reserva não consumida por encerramento continua no pote até você liberá-la. Orçamento considera o compromisso original menos a parcela encerrada, mantendo a competência original; renegociar caixa não muda automaticamente a competência orçamentária.

### Histórico e correções

Depois do primeiro registro de baixa/acordo, o compromisso mantém seu valor original, conta, categoria e vínculo ao pote protegidos. Use as ações específicas em vez de editar/cancelar o original. A tela mostra original, baixado, encerrado e restante. Registros integrais anteriores à atualização continuam válidos, sem criar uma segunda baixa.

Em **Histórico**, **Desfazer registro** pede motivo e acrescenta uma correção, sem apagar o evento original. Isso corrige o efeito no aplicativo; não representa devolução automática de dinheiro no banco. Se houve devolução real, registre a movimentação bancária correspondente. Uma correção pode reabrir o restante e é recusada se tornar as reservas incompatíveis com o saldo.

As novas baixas são para receitas/despesas/rendimentos comuns. Faturas mantêm seus próprios pagamentos parciais. Repasses entre os controles mantêm baixa integral vinculada. O CSV dos lançamentos inclui original, baixado, encerrado e restante; o backup JSON inclui o histórico completo.

O app salva a baixa e eventual acordo juntos. O identificador da operação evita duplicar uma confirmação repetida; uma operação com saldo desatualizado exige nova conferência. As regras deixam eventos imutáveis e protegem os dados-base do compromisso após o primeiro evento. A limpeza em Configurações continua limitada ao controle selecionado e também remove seu histórico de baixas.

## Cartões e faturas

Cadastre cartão, fechamento e vencimento no controle correto. Lance **Compra no cartão**, selecione o cartão e informe o total. Parcelas dividem o valor em até 120 partes; a última ajusta centavos. Compras no dia do fechamento entram no ciclo seguinte. Confira a primeira fatura com o banco.

Uma compra de R$ 180 com fatura em novembro entra uma única vez no total a pagar daquele mês. Não crie outra despesa: use **Pagar** na fatura. Pagamento parcial reduz o restante. Compra compromete a fatura; pagamento movimenta a conta bancária. Créditos excedentes não são redistribuídos automaticamente entre faturas.

## Potes e reservas

**Conta = onde o dinheiro está. Pote = para que está reservado.**

1. Cadastre a conta real e seu saldo.
2. Abra **Potes e reservas → Pote**.
3. Informe nome, conta, valor reservado agora e objetivo.
4. Exemplos: despesas operacionais, folha, impostos, reserva de segurança.
5. O valor já pertence ao saldo bancário: reservar não aumenta patrimônio nem cria receita ou despesa.
6. Use **Reservar dinheiro** para acrescentar uma quantia do saldo não reservado da mesma conta e **Liberar reserva** para devolver uma quantia ao não reservado. Informe apenas o valor desta operação. Em **Editar pote**, o campo reservado informa o total final desejado. A soma dos potes não pode superar o saldo da mesma conta no aplicativo.
7. Ao registrar ou baixar despesa/pagamento de fatura, selecione opcionalmente o pote da mesma conta. A baixa consome reserva e dinheiro uma única vez.

Exemplo: R$ 12 mil na conta PJ, R$ 4 mil para folha e R$ 2 mil para impostos = R$ 6 mil reservados e R$ 6 mil ainda não reservados. O total continua R$ 12 mil.

Previsões não consomem a reserva antes do pagamento. Cadastre vencimentos em Contas a pagar; o objetivo do pote não é um segundo compromisso. Libere a reserva antes de transferir dinheiro reservado para outra conta ou controle. Não há transferência automática de potes. Se já houver histórico de pagamentos, mantenha a conta do pote e crie outro no destino. Contas do tipo Investimento não recebem potes. Saldo não reservado não equivale a lucro.

## Digitação de valores em reais

Os campos monetários formatam automaticamente separadores brasileiros e duas casas decimais. Digitando apenas números: **1 → 0,01**, **2000 → 20,00**, **123456 → 1.234,56**. Selecione o conteúdo inteiro antes de substituir um valor existente. Saldo inicial permite sinal negativo; despesas e reservas exigem valores positivos. Taxas de juros, quantidades, datas e expressões da calculadora mantêm seus formatos próprios.

Ao colar no campo vazio ou totalmente selecionado, o valor inteiro é interpretado em reais: **20 → 20,00**. Também aceita colar **20,00** ou **1.234,56**. A máscara não altera valores já gravados.

Exemplo de reserva: o pote possui R$ 50,00 e você quer guardar mais R$ 20,00. Clique **Reservar dinheiro**, digite **2000** e salve. O pote passa a R$ 70,00; o saldo não reservado da mesma conta diminui R$ 20,00; o saldo bancário permanece igual. Não crie outra receita para isso.

## Pró-labore, distribuição de lucros, aporte e reembolso

1. Cadastre pelo menos uma conta em cada controle.
2. Abra **Entre controles → Entre controles**.
3. Escolha direção, finalidade, contas, valor líquido, descrição, data prevista e situação.
4. **Pró-labore líquido** e **Distribuição de lucros**: Empresa → Pessoal.
5. **Aporte do proprietário**: Pessoal → Empresa.
6. **Reembolso**: pode seguir ambas as direções.
7. **Previsto** entra nas projeções dos dois lados, sem alterar saldos reais.
8. Faça a transferência no banco por sua conta. Depois use **Baixar** e a data efetiva.

Um documento único vincula os dois efeitos. Editar, baixar e cancelar ajustam ambos juntos. As linhas em Lançamentos encaminham a edição para Entre controles. Não crie outra receita ou despesa para o mesmo repasse.

Aporte não é venda; distribuição de lucros não é despesa operacional. A finalidade é preservada no histórico. Pró-labore remunera trabalho, enquanto distribuição depende de apuração contábil. O contador orienta valores, retenções e encargos; registre esses pagamentos separadamente. Saldo no banco não comprova lucro distribuível.

O app não executa Pix, não movimenta bancos, não calcula impostos/folha e não apura lucro contábil. Não há DRE ou visão consolidada entre controles nesta versão.

## Demais funcionalidades

- **Orçamento:** limite por categoria/mês; despesas previstas e compras comprometem o limite. Pagamento de fatura e transferências não entram novamente.
- **Metas:** objetivos e acumulado manual. Atualizar meta não movimenta conta.
- **Investimentos:** contas próprias, aportes/resgates como transferência, rendimentos registrados separadamente. Sem cotações automáticas.
- **Calculadoras:** juros compostos, financiamento Price e expressões matemáticas. Simulações não alteram saldos e não incluem impostos, tarifas, inflação ou CET.
- **Relatórios:** filtro, CSV e impressão/PDF do controle selecionado, identificado no cabeçalho. Projeção é de caixa, não balanço contábil.
- **Backup:** JSON do controle carregado, identificado, com o histórico vinculado entre controles. Não há restauração automática.
- **Ajuda:** busca e guias de todas as funcionalidades.
- **Layout:** cabeçalho fixo, menu recolhível, adaptação para telas pequenas e Sair.

## Limpeza e reinício

Em **Configurações**, as ações afetam somente o controle selecionado:

- **Limpar movimentações:** apaga lançamentos e o histórico de baixas/acordos; zera abertura das contas, acumulado das metas e reservas dos potes; mantém cadastros e objetivos.
- **Começar do zero:** apaga as oito coleções financeiras desse controle.

Se houver repasses vinculados ativos, a limpeza é bloqueada. Primeiro cancele-os em Entre controles: o cancelamento ajusta conscientemente os dois lados. O histórico dos vínculos cancelados é mantido. O outro controle não é apagado.

A confirmação mostra quantidades e exige a palavra solicitada. Não há desfazer. Limpezas grandes usam lotes; uma interrupção pode deixar parte concluída. Atualize e confira antes de preparar outra limpeza. Não use várias abas para limpar ao mesmo tempo. E-mail, senha, login e autorização são preservados.

## Estrutura e testes

```text
authorized_users/{uid}                              # enabled: boolean
finance_v3/{uid}/controls/personal/{colecao}/{id}
finance_v3/{uid}/controls/business/{colecao}/{id}
finance_v3/{uid}/links/{id}                         # repasse canônico
```

Coleções: `accounts`, `cards`, `categories`, `transactions`, `budgets`, `goals`, `pots`, `settlements`.
Documentos de controle mantêm revisão para coordenar gravações concorrentes do app. Repasse grava o vínculo e revisões dos dois controles na mesma transação. As linhas de entrada/saída são derivadas em memória.

As regras exigem autenticação, UID proprietário e autorização ativa. Referências de contas, categorias, cartões e potes são validadas no controle correspondente. Nenhuma autorização pode ser alterada pela interface.

Sirva os arquivos por HTTP (ex.: `python -m http.server 8000` na raiz) e abra com `?demo=1` para testar dados fictícios. Abrir por `file://` não suporta adequadamente módulos. A demonstração v3 usa uma chave local própria e não grava no Firebase.

Com Node.js, execute `npm test`, ou os comandos Node individuais definidos em `package.json`. Os testes abrangem cálculos, limpeza, login simulado, menu, projeções, isolamento, potes, recorrência e falhas/retries de gravação. Testes simulados não substituem publicação/validação das regras no Firebase e conferência visual com dados reais.

## Referências

- Sebrae: https://sp.agenciasebrae.com.br/cultura-empreendedora/sebrae-sp-orienta-sobre-a-importancia-de-separar-as-financas-da-empresa-e-da-familia/
- Receita Federal, IRPF 2026: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirpf/p-r-irpf-2026-v1-00-2026-04-23.pdf
- Firebase, dados: https://firebase.google.com/docs/firestore/data-model
- Firebase, regras: https://firebase.google.com/docs/firestore/security/rules-conditions

Ferramenta de organização financeira; não substitui escrituração contábil e apuração fiscal.
