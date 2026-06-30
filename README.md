# Materna.IA <h1>

##### Carlos Henrique Andrade de Oliveira
##### Jonathas Manuel Vasconcelos Monteiro
##### Matheus Mota de Sousa
##### Sara Cardoso Azevedo <h1>

#### 1. Resumo  
<p align="justify">
O Materna.IA é um chatbot com recurso de voz que usa IA como guia para gestantes de primeira viagem, em momentos onde ela não está acompanhada por uma assitente de pré-natal. Além disso ela possui a parte para administradores, em caso de uso em clinícas para fazer o monitoramento, envio de avisos e alocação de emergência para a gestante, além do gerenciamento de dados e exames.
</p>

#### 2. Arquitetura do Sistema 
##### 2.1 Contexto Geral

<p align="justify">
Composto pelas principais tecnologias de IA, a Materna.IA funciona como um sistema cliente-servidor com apenas um backend, onde se inicia o sistema, para atender seus dois clientes principais: o chatbot do telegram (cliente gestante) e o painel web do administrador (clientes médicos). A parte de regras de negócios, persistência e integração com aplicaçòes externas estão todas concentradas no backend, que deixa exposto uma API REST para o frontend.
</p>

##### 2.2 Canal de Atendimento 

<p align="justify">
O telegram, em conjunto do Telegraf, é o principal canal de atendimento do MAterna.IA em produção. Todo o fluxo de cadrastro da gestante (nome, telefone, data de nascimento, semanas de gestação, contato de emergência e histórico de saúde), assim como o processamento de mensagens de texto, voz e envio de exames, passa exclusivamente por esse canal. Há um segundo canal, esse dedicado apenas para testes, que é o do whatsapp, oferecendo algumas funcionalidade básicas de conversação, porém não ativo.
</p>

##### 2.3 Backend

<p align="justify">
O backend composto pelo Node.JS, Express e TypeScript concentra:
  - A API REST consumida pelo painel admnistrador web e pelo bot do Telegram:
  - O funcionamento da Inteligência Artificial, onde: é montado o prompt com o contexto da gestante (semanas de gestação e histórico de saúde) e histórico recente de mensagens, envia para a Groq(Llama 3.3) e recebe uma resposta estruturada em JSON, contendo a mensagem ao usuário, o sentimento detectado, um provável alerta crítico e um possível tópico para a próxima consulta.
  - A transcrição de áudios recebidos via Groq Whisper e a geração de respostas em Voz via ElevenLabs.
  - A persisência de tudo em MySQL pelo PrismaORM.
  - Autênticação da equipe adiministrativa via JWT, com hashing de senha em brcrypt e um flux de setup para criação do primeiro administrador.

</p>

##### 2.4 Persistência
<p align="justify">

O modelo de dados fica em torno da entidade `Usuario` (gestante), relacionada a mensagens, exames, consultas tópicos de consultas e alertas críticos - todos atualizados a partir das interações no Telegram. Os administradores do painel são uma entidade separada, com papéis de acessos distintos. 

</p>

##### 2.5 Painel Web

<p align="justify">
O frontend composto por React, Vite, TypeScript e Tailwind, é um SPA (Single Page Aplication) que consome a API REST do backend para a visualização e gestão de gestantes, exames, consultas e administradores, além de fazer polling periódico para exibir alertas críticos gerados pela Inteligência Artificial em tempo quase real.
</p>

##### 2.6 Fluxo Resumido

<p align="justify">
Telegram -> Backend -> Groq/Groq Whisper -> MySQL -> Painel Web -> Administradores. o WhatsApp, não faz parte do fluxo. 
</p>

![Diagrama C4](diagrama_c4_materna.png)

#### 3. Tecnologia utilizadas 
##### 3.1.Groq
<p align="justify">
Principal agente de IA para conversação e calibrado para o nosso objetivo.
</p>

##### 3.2. Telegram/Telegraf
<p align="justify">
Principal agente para chatbots, foi escolhido pela simplicidade em implementação, sem necessidade de terceiros.
</p>

##### 3.3. Elevenlabs
Transcritor Texto para Áudio (TTS), para transcrição quando requerido pela usuária.

##### 3.4. Groq Whisper
Transcritor Áudio para Texto, isso para dúvidas da usuária em caso de uso de voz.

##### 3.5. React/Vite
<p align="justify">
Para o frontend Administrador do sistema. React monta a interface em componente e o Vite é dev server que compila e serve a interface. 
</p>

##### 3.6. Node.JS/Express
<p align="justify">
Para o backend. Runtime e Framework que recebem as requisições HTTP da API e faz o roteamento para os controllers/services corretos.
</p>

##### 3.7. Prisma
<p align="justify">
Faz a tradução de códigos TS pra queries SQL. Gerencia migrações do banco de dados e fornece um client tipado para acessar os dados.
</p>

##### 3.8. MySQL
<p align="justify">
Banco de dados relacional onde ficam armazenados os usuários, mensagens, exames, consultas, alertas críticos e administradores.
</p>

##### 3.9. JWT
<p align="justify">
gera e valida o token de autenticação usado pelo painel de administradores para manteer o usuário logado.
</p>

##### 3.10. Tailwind CSS
Framework de classes utilitárias usado para estilizar o painel administrativo.

##### 3.11. Axios
<p align="justify">
Cliente HTTP usado para o frontend (chamar API) e para o backend (baixar arquivos de áudio do telegram e chamar serviços externos).
</p>

##### 3.12. bcryptsjs
<p align="justify">
Fabrica o hash das senhas dos administradores antes de salvar no banco de dados, evitando que fiquem em texto.

</p>

##### 3.13. React Router
Gerencia a navegação entre telas no painel sem precisar recarregar a página.

##### 3.14. WhatsApp-webjs/ Pupperter
Módulo automatizado para simular o whatsapp web, usado apenas para testes internos.

#### 4. Funcionamento dos componentes
<p align="justify">
Esta seção detalha a lógica interna de cada componente do sistema, o que cada um faz com os dados que recebe antes de produzir uma saída. 
</p>

##### 4.1 Bot do Telegram
<p align="justify">
O bot opera como uma máquina de estados por usuário. Para gestantes ainda não cadastradas, ele conduz um fluxo de cadastro guiado em etapas sequenciais (nome, telefone, data de nascimento, semanas de gestação, contato de emergência, histórico de saúde), validando o formato de cada resposta antes de avançar para o próximo campo — uma data inválida ou um telefone fora do padrão faz o bot repetir a pergunta em vez de seguir adiante.


<p align="justify">
Após o cadastro, cada mensagem recebida passa por um pipeline interno: o bot busca o histórico recente de conversa da gestante no banco, monta um prompt combinando esse histórico com dados de contexto (semanas de gestação, histórico de saúde) e envia para o motor de IA. Ao receber a resposta estruturada da IA, o bot decide, com base nos campos retornados, se deve apenas responder a gestante, se deve também gravar um alerta crítico, ou se deve registrar um tópico para a próxima consulta, onde essa decisão é feita unicamente verificando se os campos correspondentes vieram preenchidos no JSON de retorno, sem necessidade de interpretar texto livre.

<p align="justify">
Mensagens de voz seguem um desvio nesse pipeline: antes de montar o prompt, o áudio é baixado e enviado para transcrição; o texto resultante então entra no mesmo fluxo de uma mensagem de texto comum. Da mesma forma, ao responder, se a resposta for solicitada em áudio, o texto gerado pela IA passa por uma etapa adicional de conversão para voz antes de ser enviado à gestante.

<p align="justify">
Documentos e fotos seguem um caminho separado e mais simples: o bot apenas baixa o arquivo, armazena-o e cria um registro de exame vinculado à gestante, sem envolver a IA nesse momento.
</p>

##### 4.2 Backend (API REST)

O backend atua como múltiplos serviços de domínio, cada um responsável por uma fatia de regras de negócio:

- **Serviço de autenticação**: <p align="justify">verifica se já existe algum administrador cadastrado; se não houver, libera um fluxo de setup para criação do primeiro acesso. Em login, compara a senha informada com o hash salvo (nunca com texto puro) e, se válida, emite um token assinado com tempo de expiração.
- **Serviço de usuários (gestantes)**: <p align="justify">centraliza CRUD de gestantes e suas informações de saúde, além de servir como ponto de consulta para o bot confirmar se um determinado contato do Telegram já está cadastrado.
- **Serviço de exames, consultas e tópicos**: <p align="justify">cada um gerencia seu próprio recorte de dados, mas todos dependem da existência prévia de uma gestante para se relacionar a ela.
- **Serviço de dashboard**: <p align="justify">não armazena nenhum dado próprio — ele apenas agrega informações já existentes em outras tabelas (contagem de gestantes, total de consultas, exames, mensagens, consultas por status, e cadastros agrupados por semana) para alimentar os indicadores exibidos no painel. Toda vez que o frontend pede essas métricas, o cálculo é refeito na hora, a partir dos dados atuais do banco.

<p align="justify">
Em todos os serviços, a validação de entrada e o tratamento de erro ficam a cargo de cada controller individualmente — não há uma camada central de validação de schema.
</p>

##### 4.3 Banco de dados (Prisma + MySQL)

<p align="justify">
O papel do banco vai além de "guardar dados": a modelagem força certas regras de negócio por meio de relacionamentos. Uma `Mensagem` só existe vinculada a um `Usuario`; um `AlertaCritico` e um `TopicoConsulta` só são criados quando a IA explicitamente os solicita na resposta — ou seja, essas tabelas funcionam como uma fila de "pendências" geradas automaticamente, que a equipe médica consome e marca como resolvidas pelo painel. O histórico de mensagens funciona como memória de curto prazo do bot: é dali que o backend monta o contexto enviado de volta à IA a cada nova interação.
</p>

##### 4.4 Motor de IA (Groq — Llama 3.3)

<p align="justify">
O componente de IA não apenas é apenas uma resposta pronta ou pré-programada, ele recebe um prompt que já embute um protocolo de triagem por cores (verde/amarelo/vermelho) e é instruído a devolver, sempre, uma estrutura fixa em JSON com quatro campos: a resposta a ser enviada à gestante, o sentimento identificado na mensagem dela, um resumo de alerta (preenchido apenas se a situação for considerada de atenção ou emergência) e um tópico sugerido para a próxima consulta (preenchido apenas quando algo relevante for identificado para acompanhamento médico). É essa disciplina de formato que permite ao backend tratar a saída da IA como dado estruturado, e não como texto a ser interpretado.
</p>

##### 4.5 Transcrição de voz (Groq Whisper) e síntese de voz (ElevenLabs)

<p align="justify">
A transcrição recebe o arquivo de áudio exatamente como o Telegram o entrega (`.ogg`/Opus) e devolve apenas o texto reconhecido, sem qualquer etapa de conversão de formato pois o serviço de IA já aceita esse formato nativamente. A síntese de voz faz o caminho inverso: recebe o texto da resposta já gerada pela IA e devolve um áudio pronto para envio, sem nenhuma lógica adicional de interpretação. É uma conversão direta de texto para fala.
</p>

##### 4.6 Painel Web (Frontend)

<p align="justify">
O frontend concentra duas responsabilidades dinâmicas além da exibição de telas: controle de sessão e monitoramento de alertas. O controle de sessão decide, a cada carregamento, qual tela mostrar: se ainda não há administrador cadastrado, força a tela de setup; se há um token salvo, tenta validar a sessão antes de liberar o restante do painel. Já o monitoramento de alertas roda em segundo plano, em intervalos fixos, perguntando ao backend se existem alertas críticos pendentes; ao receber uma resposta positiva, ele interrompe a navegação normal e sobrepõe um modal de emergência, independente da tela em que o usuário estiver.
</p>

##### 4.7 Bot do WhatsApp (módulo de teste)

<p align="justify">
Diferente do bot do Telegram, este módulo não possui máquina de estados, validação de cadastro nem integração com o motor de IA. Ele apenas escuta mensagens recebidas e responde com lógica fixa, servindo como prova de conceito de conexão a um segundo canal. Este não participa do fluxo de dados clínico do sistema.
</p>

#### 5. Como executar o sistema 
<p align="justify">
Este é o passo a passo para você rodar o projeto completo da Materna.IA na sua máquina. O repositório já contém o arquivo .env configurado com todas as chaves de API necessárias (na versão final disponível publicamente não haverá essa opção), então você não precisa se preocupar em criar ou configurar tokens.
</p>

##### 5.1. Banco de Dados (MySQL)
O projeto utiliza o Prisma com MySQL. O arquivo .env já aponta para mysql://root:@localhost:3306/materna_ia.

  - Abra o seu gerenciador de banco de dados (XAMPP, Laragon, MySQL Workbench, etc.).

  - Certifique-se de que o serviço do MySQL está aberto e rodando.

  - Crie um banco de dados vazio chamado materna_ia.

  - Abra o terminal na pasta backend do projeto e rode os seguintes comandos para criar as tabelas e sincronizar o Prisma:

```Bash
npx prisma db push
npx prisma generate
```
##### 5.2. Instalando as Dependências (Backend e Frontend)
No terminal, você precisará instalar as dependências do Node.js.

  - No Backend:
Navegue até a pasta backend e rode:

```Bash
npm install
```
Caso falte alguma biblioteca específica que foi adicionada recentemente, rode também:

```Bash
npm install elevenlabs axios openai telegraf
```
  - No Frontend:
Navegue até a pasta frontend e rode:

```Bash
npm install
```

##### 5.3. Colocando tudo em execução
Para o funcionamento geral da ferramente será preciso colocar
Terminal 2 (Backend):
Na pasta backend do projeto principal, rode:

```Bash
npm run dev
```
(Aguarde aparecer a mensagem "✅ Bot do Telegram pronto!")

Terminal 3 (Frontend):
Na pasta frontend, rode:

```Bash
npm run dev
```
<p align="justify">
Tudo pronto! O bot já vai reconhecer os comandos e gravar/receber áudios processando tudo automaticamente através do banco e das APIs já configuradas.
</p>

#### 6. Considerações finais

<p align="justify">
O Materna.IA em sua primeira ideia e propósito apresentava poucas funcionalidades. Enquanto avançamos mais delas foram elaboradas e colocadas nesse sistema. Ainda destacamos a função de voice speech como nosso carro-chefe para nos destacarmos.
</p>

<P align="justify">
Mesmo com todas as dificuldades possíveis, fizemos o nosso melhor para entregar essa proposta e sermos funcionais para com o propósito final da disciplina. Nossos primeiros planos não geraram tantos frutos como esses que vieram e conseguimos colher os resultados, porém ainda temos a avançar sobre essa idéia, apenas precisamos nos dedicar ( isso se possível no futuro) à ela.
</p>