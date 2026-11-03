# Meu Plano Financeiro Web

Aplicativo de finanças pessoais em **HTML, CSS e JavaScript**, publicado no **GitHub Pages**. O **Firebase Authentication** identifica os usuários e o **Cloud Firestore** armazena seus registros.

**Acesso por convite:** o administrador cria o usuário no Firebase e autoriza seu UID no Firestore. A página não oferece cadastro público. Os dados financeiros de cada usuário são separados.

- [Abrir aplicativo](https://santos1513lopes-lgtm.github.io/MeuPlanoFinanceiro-web/)
- [Experimentar demonstração](https://santos1513lopes-lgtm.github.io/MeuPlanoFinanceiro-web/?demo=1)
- [Console do projeto Firebase](https://console.firebase.google.com/project/meuplanofinanceiro/overview)

## Como foi criado

O projeto nasceu de uma planilha pessoal para Excel/Office 2021, com VBA, formulários, faturas e planejamento, e do aplicativo anterior do proprietário. Com auxílio do Codex, as regras foram reescritas em JavaScript e divididas em interface, cálculos e persistência. Investimentos e calculadoras foram acrescentados à versão web.

A versão atual usa um **repositório novo**, `santos1513lopes-lgtm/MeuPlanoFinanceiro-web`, e um **projeto Firebase novo**, `meuplanofinanceiro`. Os arquivos ficam diretamente na raiz do repositório, sem uma pasta externa envolvendo o aplicativo.

O modo de demonstração já foi validado pelo proprietário. Em **02/11/2026**, o proprietário confirmou o **login real e a abertura da aba Configurações**, após criar o documento de aprovação com `enabled: true`. Isso confirma a entrada com usuário administrado e a navegação nessa tela; não comprova, por si só, gravação de lançamentos ou execução das limpezas. O motor financeiro passou em 39 casos automatizados. A falha anterior de cadastro público não foi reproduzida com credenciais reais; o cadastro público foi retirado por decisão do proprietário.

## Recursos

Contas, receitas, despesas, transferências, parcelas, recorrências, cartões/faturas, baixas e cancelamentos, orçamento, metas, investimentos, projeção de 12 meses, calculadora comum, juros compostos, comparação de compra à vista/financiada, CSV, backup JSON e impressão/PDF.

## Arquivos importantes

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Interface e formulário de login. |
| `styles.css` | Estilo responsivo. |
| `js/app.js` | Telas, formulários e mensagens. |
| `js/finance.js` | Cálculos financeiros em centavos. |
| `js/storage.js` | Login, autorização, demonstração e persistência. |
| `js/firebase-config.js` | Configuração pública do novo projeto Firebase. |
| `firestore.rules` | Regras de propriedade, aprovação e validação a publicar no console. |
| `firebase.json` | Caminho local do arquivo de regras; não publica regras sozinho. |
| `tests/finance.test.js` | Testes do motor financeiro. |

## Passo a passo da conexão GitHub + Firebase

### 1. Criar e preencher o repositório

1. Crie um repositório público no GitHub, como `MeuPlanoFinanceiro-web`.
2. Na aba **Código**, use **Adicionar arquivo → Carregar arquivos**. Em repositório vazio, use o link para enviar um arquivo existente.
3. Envie o conteúdo da pasta extraída do pacote, mantendo `js/` e `tests/` e colocando `index.html`, `styles.css` e os demais arquivos diretamente na raiz.
4. Não envie somente o ZIP nem crie uma pasta externa contendo todo o aplicativo.
5. Confira os caminhos e confirme o commit.

### 2. Criar um projeto novo no Firebase

1. Acesse o [Console Firebase](https://console.firebase.google.com/).
2. Crie ou selecione o projeto **MeuPlanoFinanceiro**, ID `meuplanofinanceiro`.
3. O plano Spark pode ser usado dentro das cotas gratuitas. Não é necessário contratar Firebase Hosting para este aplicativo.
4. Em **Configurações do projeto → Geral → Seus aplicativos**, clique no símbolo Web **</>**.
5. Registre o aplicativo com um nome como **Meu Plano Financeiro Web**.
6. Deixe Firebase Hosting desmarcado: a hospedagem será pelo GitHub Pages.
7. Ao terminar, o console mostra o objeto `firebaseConfig`. Não é necessário executar `npm install firebase` para o código desta versão.

### 3. Conectar a configuração ao código

1. No console, copie o objeto `firebaseConfig` do aplicativo Web.
2. No GitHub, abra [js/firebase-config.js](js/firebase-config.js) e edite o arquivo.
3. Mantenha a exportação do módulo, com este formato:

```javascript
export const firebaseConfig = {
  apiKey: "VALOR_EXATO_DO_CONSOLE",
  authDomain: "meuplanofinanceiro.firebaseapp.com",
  projectId: "meuplanofinanceiro",
  storageBucket: "VALOR_EXATO_DO_CONSOLE",
  messagingSenderId: "VALOR_EXATO_DO_CONSOLE",
  appId: "VALOR_EXATO_DO_CONSOLE"
};
```

4. Use todos os valores do mesmo aplicativo/projeto. Não misture campos do Firebase antigo com o novo.
5. Não copie para esse arquivo os exemplos de `initializeApp` ou Google Analytics do console: a inicialização já existe em `storage.js`.
6. Confirme a alteração no GitHub e aguarde a republicação da página.

A configuração do projeto `meuplanofinanceiro` já foi colocada no repositório. Em uma verificação somente de leitura, o serviço público de autenticação respondeu para o número de projeto `778195697635`. Isso não comprova que um login com e-mail/senha tenha sido realizado.

A configuração Web é pública e não concede administração. Senhas, chaves privadas e arquivos de conta de serviço não devem ser enviados ao GitHub ou colocados no JavaScript.

[Guia oficial Firebase para Web](https://firebase.google.com/docs/web/setup).

### 4. Ativar Authentication e conferir o domínio

Na organização de menus vista durante esta configuração:

1. Abra **Segurança → Authentication** ou o [link direto](https://console.firebase.google.com/project/meuplanofinanceiro/authentication).
2. Clique em **Começar**, se solicitado.
3. Abra **Método de login → E-mail/senha**, ative o primeiro método e salve.
4. O login por link de e-mail sem senha não é necessário.
5. Abra **Configurações → Domínios autorizados** e confira se existe:
   `santos1513lopes-lgtm.github.io`.
6. Se faltar, adicione somente esse domínio, sem `https://` e sem `/MeuPlanoFinanceiro-web/`.

Em uma consulta durante esta manutenção, a lista retornava localhost e os domínios Firebase, mas ainda não incluía o domínio GitHub Pages. Confirme o estado atual no console.

Não desative E-mail/senha para impedir cadastros públicos, pois isso também impediria o login por senha.

### 5. Bloquear a criação pública de usuários no serviço

Remover o botão de cadastro não basta para bloquear a API de cadastro do Firebase Authentication.

1. Em **Authentication → Configurações**, procure **Ações do usuário / User actions**.
2. Desative a ação de criação de contas pelo usuário, normalmente identificada como **Enable create / Sign-up / Permitir criação de contas**.
3. Salve. Isso bloqueia cadastro por clientes; a administração pelo console continua sendo o caminho para criar usuários.
4. Se essa opção não aparecer no seu projeto, não ative serviços pagos ou atualize o plano apenas por esse motivo. A aprovação no Firestore, descrita abaixo, continua sendo obrigatória e impede que um cadastro não aprovado acesse dados financeiros. Peça ajuda para conferir a opção disponível no console.

A configuração acima é feita no Firebase; não é aplicada por um commit no GitHub. Sem essa restrição no serviço, terceiros ainda podem conseguir criar um registro no Authentication pela API, mas ele **não terá autorização financeira** nas novas regras sem aprovação administrativa.

[Documentação sobre contas administradas e ações do usuário](https://firebase.google.com/docs/auth/users#user_self-service).

### 6. Criar o Cloud Firestore

1. Abra **Bancos de dados e armazenamento → Firestore**, ou o [link direto](https://console.firebase.google.com/project/meuplanofinanceiro/firestore).
2. Clique em **Criar banco de dados**.
3. Selecione a edição **Standard**.
4. Mantenha o ID **`(default)`**: é o banco esperado pelo código.
5. Para este projeto, foi escolhida **`southamerica-east1 (São Paulo)`**. A localização não é uma preferência que possa ser trocada livremente depois de criar o banco.
6. Escolha **Modo de produção**.
7. Deixe backups programados desativados, se não quiser habilitar esse serviço opcional, e conclua a criação.

O banco já foi criado pelo responsável. Não crie outro se ele já aparece no console.

A regra inicial `allow read, write: if false;` bloqueia acesso pelo aplicativo até publicar regras apropriadas. O prazo de 30 dias mencionado no modo de teste é da regra temporária, não do plano Spark. Esta versão não usa expiração por data; continua sujeita às cotas e políticas do Firebase.

### 7. Publicar as regras atuais

**Esta atualização adiciona aprovação administrativa de usuários. As regras que você publicou antes precisam ser substituídas pela versão atual.**

1. Abra [firestore.rules](firestore.rules) no GitHub.
2. Use **Copiar conteúdo do arquivo** ou a visualização **Raw**. Não copie a página traduzida nem texto selecionado com palavras do código traduzidas.
3. No Firebase, abra **Firestore → Regras**.
4. Guarde uma cópia das regras anteriores.
5. Selecione todo o conteúdo do editor e cole o arquivo inteiro.
6. Clique em **Publicar**. A propagação pode levar algum tempo; o console informa o estado.
7. O código deve manter palavras como `rules_version`, `service`, `match` e `function` no idioma original.

A cópia no GitHub **não publica** as regras no Firestore. Até publicá-las, a proteção de aprovação não estará aplicada ao banco. O aplicativo novo também exige a aprovação para abrir o painel e ler/gravar dados.

Não use `allow read, write: if true` ou uma regra que exija somente login. As regras novas verificam propriedade do UID, autorização administrativa e estrutura dos registros.

[Regras de segurança do Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions).

### 8. Publicar a página no GitHub Pages

1. No repositório, abra **Configurações → Pages**.
2. Use **Deploy from a branch**, branch **main**, pasta **/(root)**.
3. Salve e aguarde a publicação.
4. Abra [a página do aplicativo](https://santos1513lopes-lgtm.github.io/MeuPlanoFinanceiro-web/).
5. Após alterações, aguarde a execução de Pages e, se necessário, recarregue com **Ctrl+F5**.

A página já foi publicada pelo responsável. A demonstração não precisa de usuário Firebase e fica separada dos dados reais.

[Configuração do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Criar novos usuários pelo Firebase

A liberação tem **duas etapas obrigatórias**, realizadas pelo administrador: criar o login no Authentication e aprovar o UID no Firestore.

**Fluxo confirmado em 02/11/2026:** depois de salvar a aprovação como booleano `true`, o proprietário entrou no aplicativo e abriu Configurações. Para outra pessoa, repita o mesmo procedimento com **o UID dela**, sem compartilhar sua própria conta.

Não é necessário criar outro projeto Firebase, banco, repositório ou publicação para cada pessoa. Todos usam a mesma página; os dados financeiros ficam separados por UID.

### Resumo para liberar mais uma pessoa

1. **Authentication → Usuários → Adicionar usuário:** cadastre o e-mail e a senha temporária da pessoa.
2. Copie o **UID** desse cadastro.
3. **Firestore → Dados → authorized_users → Adicionar documento:** cole esse UID no **ID do documento**, sem gerar ID automático.
4. Crie o campo **`enabled`**, escolha o tipo **boolean** e o valor **true / verdadeiro**. Não use o tipo string nem escreva `"true"` entre aspas.
5. Clique em **Salvar**. Confira no painel de dados se aparece **`enabled: true`** dentro do documento cujo ID corresponde ao UID do Authentication, respeitando maiúsculas e minúsculas.
6. Envie à pessoa o [endereço do aplicativo](https://santos1513lopes-lgtm.github.io/MeuPlanoFinanceiro-web/), sem `?demo=1`, e oriente a definir sua senha pelo e-mail de recuperação.
7. Peça que entre. O painel deve abrir com o e-mail dela e os próprios cadastros financeiros, inicialmente vazios em uma conta nova.

A coleção `authorized_users` já existe neste projeto: para mais uma pessoa, use **Adicionar documento** dentro dela. **Não substitua o documento de outro usuário.** Só use **Iniciar coleção** se estiver configurando um projeto onde essa coleção ainda não exista.

```text
authorized_users/
├── UID_DA_PRIMEIRA_PESSOA/
│   └── enabled: true
└── UID_DA_SEGUNDA_PESSOA/
    └── enabled: true
```

Esses IDs são exemplos: use os UIDs reais do Authentication no console, sem publicá-los neste README.

Se aparecer **“Acesso não autorizado”**, confira a aprovação antes de redefinir a senha: UID correto, campo `enabled` do tipo boolean, valor `true`, documento salvo, projeto `meuplanofinanceiro` e banco `(default)`. Regras já publicadas e inalteradas não precisam ser republicadas a cada novo usuário.

A seguir estão os detalhes de cada etapa.

### A. Criar o login no Authentication

1. Abra [Authentication → Usuários](https://console.firebase.google.com/project/meuplanofinanceiro/authentication/users).
2. Clique em **Adicionar usuário**.
3. Informe o e-mail real da pessoa e uma senha temporária forte.
4. Confirme o cadastro.
5. Copie o **UID do usuário** mostrado na lista. Se o e-mail já estiver cadastrado, localize o registro existente e use seu UID; não crie outro.
6. Não compartilhe acesso administrativo ao console, ao projeto Firebase ou ao repositório com a pessoa só para permitir uso do aplicativo.

O cadastro no Authentication identifica a pessoa, mas ainda não libera seus dados financeiros.

### B. Autorizar o UID no Firestore

1. Abra **Firestore → Dados**.
2. Na raiz do banco, clique em **Iniciar coleção** e use o nome exato **`authorized_users`**. Se já existir, abra-a.
3. Adicione um documento cujo **ID seja exatamente o UID copiado do Authentication**. Não use ID automático nem e-mail como ID.
4. Adicione o campo:

| Campo | Tipo no console | Valor |
| --- | --- | --- |
| `enabled` | **boolean** | **true** |

5. Salve o documento.
6. O resultado deve ser `authorized_users/UID_DA_PESSOA` com `enabled: true`.

As regras permitem ao usuário ler somente sua própria aprovação. O aplicativo não pode listar todas as autorizações nem criar/alterar essa aprovação. A administração é feita pelo console com suas permissões de projeto.

**Não coloque a senha nesse documento nem em qualquer coleção do Firestore.** Ela é administrada pelo Authentication.

### C. Entregar o acesso e trocar a senha

1. Envie à pessoa o endereço do aplicativo e seu e-mail cadastrado.
2. Prefira usar **Authentication → Usuários → … → Redefinir senha** para que ela escolha uma senha própria pelo e-mail, sem precisar conservar uma senha conhecida pelo administrador.
3. O aplicativo também mantém **Esqueci a senha**.
4. A pessoa acessa com **Entrar na minha conta**; não há botão de criação pública.
5. Cada UID começa com seus próprios dados vazios. As finanças de um usuário não aparecem para outro.

[Gerenciamento oficial de usuários pelo console](https://support.google.com/firebase/answer/6400802?hl=pt-BR).

### D. Suspender o acesso de alguém

1. Em **Firestore → authorized_users → UID**, altere **`enabled` para false**.
2. Em **Authentication → Usuários**, use a opção de desativar a conta.
3. As novas operações financeiras serão negadas pelas regras após propagarem. Registros já vistos/exportados pela pessoa não podem ser recolhidos remotamente.
4. Não é necessário apagar os lançamentos para suspender acesso. Isso preserva os dados caso você queira reativar depois.

## Estrutura dos dados

```text
authorized_users/
└── {uid}/
    └── enabled: true ou false

finance_v2/
└── {uid}/
    ├── accounts/
    ├── cards/
    ├── categories/
    ├── transactions/
    ├── budgets/
    └── goals/
```

As coleções financeiras são criadas com os primeiros cadastros do aplicativo. O documento de autorização é criado manualmente pelo administrador antes do uso real.

## Testar o primeiro acesso real

1. Publique as regras novas e conclua as duas etapas de liberação acima.
2. Abra a página **sem `?demo=1`** e use o e-mail e a senha cadastrados.
3. O painel deve abrir. A mensagem de acesso não autorizado indica que falta conferir `authorized_users/UID/enabled` e as regras publicadas.
4. Cadastre uma conta financeira de teste com saldo inicial **R$ 1.000,00**, usando uma data de abertura compatível com os lançamentos.
5. Cadastre uma categoria. Lance uma receita recebida de **R$ 500,00** e uma despesa paga de **R$ 200,00**.
6. Confira o saldo **R$ 1.300,00**.
7. Clique em Atualizar, saia e entre novamente. Os registros devem permanecer.
8. Confira os documentos em `finance_v2/{uid}/...` no console.
9. Com outro usuário autorizado, confirme que os dados do primeiro não aparecem.
10. Com um usuário sem aprovação, confirme que o painel e as operações financeiras são negados.

Esses passos são necessários: testes do motor financeiro e a demonstração não comprovam a integração real.

## Se o login não abrir o painel

| Sintoma | O que conferir |
| --- | --- |
| E-mail ou senha incorretos | Usuário criado no projeto `meuplanofinanceiro` e credenciais corretas. |
| Acesso não autorizado | Documento `authorized_users/{UID}` e campo booleano `enabled: true`. |
| Permissão insuficiente | Regras atuais publicadas no banco `(default)` e UID correto. |
| Método não permitido | E-mail/senha ativado em Authentication. |
| Configuração inválida | Todos os valores de `firebase-config.js` vieram do mesmo app Web. |
| Erro de domínio | Domínio `santos1513lopes-lgtm.github.io` em Domínios autorizados. |
| Mudança não aparece | Publicação Pages concluída; recarregar com Ctrl+F5. |
| Dados da demonstração | Remover `?demo=1`, sair e entrar com o usuário real. |

Não coloque senhas, tokens ou credenciais administrativas em capturas ou arquivos de diagnóstico. A causa exata do erro anterior de cadastro público não foi confirmada; não foi realizado login de teste usando senha do proprietário.

### Quando o botão Entrar parece não fazer nada

A tela agora informa as etapas: **conferindo e-mail e senha**, **credenciais aceitas/verificando autorização** e **carregamento dos dados**. Campos vazios ou e-mail inválido geram mensagem própria. Falhas no carregamento do JavaScript aparecem na tela em vez de deixarem o botão sem resposta.

A verificação inicial de autorização tem limite de espera de 15 segundos. O carregamento dos dados e a preparação da conexão têm limite de 20 segundos. Se o e-mail e a senha forem aceitos, mas o Firestore não responder, a mensagem informa essa etapa; isso não significa automaticamente senha incorreta.

A confirmação de login agora abre o fluxo de entrada explicitamente, sem depender apenas da notificação de mudança de sessão. A aprovação em `authorized_users` continua obrigatória; nenhuma checagem foi removida.

Após uma atualização, aguarde a publicação do GitHub Pages e use **Ctrl+F5**. Informe ao administrador o texto exato exibido, sem compartilhar a senha. A causa da falha real relatada ainda depende dessa observação; os testes de manutenção usam respostas simuladas.


## Primeiro uso real

1. Cadastre contas e seus saldos de abertura. O saldo deve ser o valor antes dos movimentos da data inicial. Contas com tipo Investimento ficam separadas do saldo disponível; Poupança/reserva integra o disponível.
2. Cadastre categorias e cartões.
3. Registre receitas/despesas e suas previsões. Para séries mensais, informe quantas ocorrências; o valor integral é repetido em cada uma.
4. Para uma compra no cartão, informe o total e as parcelas. O total é dividido em centavos e o ajuste fica na última parcela. Datas de fim de mês são ajustadas sem pular fevereiro. O mês da primeira fatura pode ser informado manualmente para respeitar o extrato do banco.
5. Em Cartões e faturas, use Pagar para pagar a fatura inteira ou informe um valor menor para pagamento parcial. O pagamento altera o saldo da conta e reduz a dívida, sem duplicar despesas por categoria.
6. Para baixar um previsto, use Baixar e informe a data efetiva. Para baixa parcial de receita/despesa comum, divida o registro em parte liquidada e pendente. Não há baixa parcial automática para esse tipo.
7. Transferências entre contas não são receitas ou despesas. Aportes/resgates são transferências entre a conta bancária e a conta de investimento. Rendimentos são registrados quando efetivamente reconhecidos, não pela simulação.
8. O botão Backup exporta um JSON completo dos registros carregados; salve o arquivo em lugar seguro. Não é backup automático do Firebase e esta versão não possui restauração/importação automática.
9. CSV exporta o filtro de relatórios. Imprimir/PDF abre a impressão do navegador; escolha Salvar como PDF.

## Regras de cálculo e limites conhecidos

- Valores de movimentos são guardados como centavos inteiros; saldos de abertura podem ser negativos.
- Comprometido no orçamento inclui despesas previstas e compras no cartão na competência escolhida, excluindo cancelados. Transferências e pagamentos de fatura não entram de novo.
- A projeção parte do saldo disponível de hoje, inclui vencidos no primeiro mês e considera previsões e faturas em aberto. Transferências previstas para investimentos reduzem o disponível; resgates previstos aumentam. Não presume salários ou gastos que você ainda não registrou.
- Metas têm acumulado manual e não movimentam contas.
- Limite do cartão é informativo. Não há controle automático de limite disponível, juros de rotativo ou compensação automática de crédito entre faturas. O formulário impede pagamentos acima da dívida; créditos podem aparecer ao cancelar/editar uma compra já paga e exigem conferência manual.
- Alterar fechamento/vencimento afeta novas compras; não recalcula datas das parcelas existentes. No dia de fechamento, a compra passa ao ciclo seguinte; confira a regra da administradora.
- A edição e o cancelamento afetam uma única ocorrência. Não há edição/exclusão em lote de toda uma série.
- Operações de séries usam writeBatch e são atômicas. Cada série é limitada a 120 ocorrências. Não há geração automática de novas recorrências com o site fechado.
- As leituras carregam o histórico do usuário ao entrar/atualizar. Não há sincronização em tempo real, trabalho offline com fila, paginação de históricos grandes ou resolução de conflitos de edição simultânea. Para uso pessoal inicial; acompanhe as cotas do Firebase.
- Sem importação OFX/CSV, integração bancária, anexos ou notificações. Exclusão definitiva está disponível somente pelos fluxos de limpeza em Configurações.
- As calculadoras usam taxas hipotéticas constantes. Investimentos usam taxa anual efetiva convertida para mensal ou taxa mensal informada, com aportes no início/fim. Não incluem impostos, inflação nem tarifas. Financiamento usa tabela Price e não calcula CET. Resultados nunca geram lançamentos automaticamente.
- Calculadora comum usa uma gramática aritmética, sem eval. Porcentagem é número dividido por 100: 200 * 10% = 20.



## Layout e navegação

- O cabeçalho permanece no topo durante a rolagem, com Atualizar, Backup e Novo lançamento.
- A barra lateral tem logo e rodapé separados da lista de páginas. Somente a região central rola quando a altura da tela não comporta todas as opções.
- No computador, o botão ao lado do título recolhe o menu para uma faixa de ícones ou o expande novamente. Os ícones possuem descrição e identificação acessível.
- A preferência de recolhimento fica neste navegador, na chave local `meu-financeiro-sidebar-collapsed`. Isso não modifica o armazenamento do login ou os registros financeiros.
- O e-mail e o botão **Sair** ficam no rodapé do menu expandido. No modo recolhido, o e-mail aparece no cabeçalho e a saída continua na barra de ícones.
- No celular, o menu abre sobre o conteúdo e fecha pelo botão X, por Esc, ao tocar no fundo ou ao escolher uma página. Enquanto aberto, o foco do teclado fica no menu e a página ao fundo não recebe interação.
- A mudança de tamanho de tela limpa o estado do menu móvel, sem perder a preferência do computador.
- A saída usa o fluxo de logout já existente. Login, autorização, cálculos e regras do Firestore não foram substituídos nesta alteração.
- Animações respeitam a preferência de movimento reduzido do sistema.

Foram executados 19 testes automatizados do controlador de navegação, além dos 12 de login, 39 financeiros e 22 de reinício (92 ao todo). Eles verificam comportamento com elementos simulados; não substituem inspeção visual no navegador em diferentes resoluções, que ainda precisa ser conferida.


## Configurações: limpar movimentações ou começar do zero

A aba **Configurações** oferece duas operações para o usuário conectado. E-mail, senha, sessão de login, cadastro do Authentication e documento `authorized_users/{uid}` são preservados. Os dados de outros usuários não são consultados nem removidos por essa função.

| Opção | O que muda | O que permanece |
| --- | --- | --- |
| **Limpar movimentações** | Apaga todos os lançamentos, inclusive previsões, parcelas, compras e pagamentos de fatura; zera os saldos de abertura e usa a data de hoje; zera o acumulado das metas. | Contas, cartões, categorias, limites de orçamento e objetivos cadastrados, além do acesso do usuário. |
| **Começar do zero** | Apaga todas as seis coleções financeiras do próprio UID: lançamentos, contas, cartões, categorias, orçamento e metas. | Login, senha e autorização de acesso. O usuário cadastra as contas e saldos iniciais novamente. |

### Antes da primeira utilização: publicar regras atualizadas

Esta função precisa da versão atual de [firestore.rules](firestore.rules). No console Firebase, abra **Firestore → Regras**, substitua pelo arquivo inteiro e publique. Um commit no GitHub não publica regras no Firebase.

A permissão nova autoriza exclusões apenas nas seis coleções financeiras do próprio UID aprovado. A coleção `authorized_users` continua sem permissão de escrita/exclusão pelo aplicativo. As contas do Authentication não são manipuladas pela limpeza.

### Como usar

1. Entre normalmente com o usuário autorizado.
2. Abra **Configurações**, no menu do aplicativo.
3. Feche outras abas do aplicativo que possam estar alterando dados.
4. Escolha **Limpar movimentações** ou **Começar do zero**.
5. O aplicativo consulta o servidor e mostra as quantidades de registros. Na demonstração, consulta somente os dados fictícios locais.
6. Use **Baixar backup antes de continuar** e confira se o arquivo foi salvo. O backup é JSON; não há restauração automática nesta versão.
7. Digite exatamente **LIMPAR** ou **ZERAR**, conforme a operação escolhida, e marque a confirmação de exclusão definitiva.
8. Clique em **Confirmar limpeza** e aguarde.
9. Na limpeza de movimentações, edite os saldos iniciais das contas para recomeçar. No reinício completo, cadastre novamente suas contas e categorias.

Cancelar ou fechar a confirmação antes de executar não apaga registros. Não existe desfazer após a confirmação.

### Conexão, lotes e interrupções

A limpeza real exige internet e leitura atualizada do servidor. Operações grandes são divididas em lotes de até 450 alterações; **cada lote é atômico, mas a limpeza completa pode ter vários lotes**. Se a conexão ou a permissão falhar entre lotes, parte dos registros pode já ter sido removida. A mensagem informa as operações confirmadas; atualize os dados, confira o resultado e prepare uma nova limpeza para concluir o restante. Uma perda de conexão durante a confirmação exige conferir o servidor antes de repetir.

Não grave simultaneamente em outra aba/dispositivo durante a operação. Registros adicionados após a preparação não pertencem à lista confirmada e podem permanecer; o aplicativo confere o resultado e avisa se encontrar dados novos. O backup representa a consulta feita antes da confirmação.

Na demonstração, a operação altera apenas a chave de dados fictícios deste aplicativo. Não usa `localStorage.clear()` e não apaga outras preferências ou sessões do navegador.

### Verificação desta função

Há testes do plano de exclusão, preservação de cadastros/acesso, usuário sem autorização, sessão alterada, demonstração, lotes grandes, falha parcial e repetição para concluir. São testes com dados/respostas simulados, não exclusões de dados reais nem validação de regras publicadas no Firebase.


## Desenvolvimento e validação

Para os casos financeiros e os testes de reinício, com Node.js instalado:

```bash
npm test
```

Não há instalação npm obrigatória para o site. Para desenvolvimento local, use um servidor HTTP; abrir `index.html` diretamente como `file://` não é suportado pelos módulos.

A autorização adicionada nesta manutenção foi verificada com respostas simuladas: usuário autorizado, ausente/desativado, erro de consulta e demonstração. Isso não equivale a um teste contra regras publicadas ou emulador Firebase. Faça os testes reais acima após configurar o console.

A tela de login é pública, assim como a demonstração fictícia. O acesso aos **dados financeiros reais** depende da aprovação e das regras. Não há painel administrativo dentro do aplicativo nesta versão.

## Referências

- [Firebase Web](https://firebase.google.com/docs/web/setup)
- [Usuários e restrição de autocadastro](https://firebase.google.com/docs/auth/users)
- [Adicionar usuários no console](https://support.google.com/firebase/answer/6400802?hl=pt-BR)
- [Regras do Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Cotas e planos](https://firebase.google.com/pricing)
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
