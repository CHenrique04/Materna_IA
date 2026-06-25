🚀 Guia de Execução - Materna.IA
Este é o passo a passo para você rodar o projeto completo da Materna.IA na sua máquina. O repositório já contém o arquivo .env configurado com todas as chaves de API necessárias, então você não precisa se preocupar em criar ou configurar tokens.

1. Configurando o FFmpeg (Essencial para processar áudio)
O bot precisa do FFmpeg instalado e configurado no sistema para lidar com as mensagens de voz do Telegram.

Baixe o FFmpeg através deste link: ffmpeg-git-essentials.7z. (https://www.gyan.dev/ffmpeg/builds/ffmpeg-git-essentials.7z)

Extraia o arquivo baixado em uma pasta de fácil acesso (por exemplo, C:\ffmpeg).

Abra o menu Iniciar do Windows, digite Variáveis de Ambiente e clique em Editar as variáveis de ambiente do sistema.

Na tela "Propriedades do Sistema", clique no botão Variáveis de Ambiente....

Na parte de baixo (Variáveis do sistema), procure a variável Path e selecione-a.

Clique em Editar.

Clique em Novo.

Cole o caminho completo da pasta bin que você extraiu. Deve ficar exatamente assim (exemplo):
C:\ffmpeg\ffmpeg-2026-06-15-git-44d082edc8-essentials_build\bin

Clique em OK.

Clique em OK na tela de Variáveis de Ambiente.

Clique em OK na tela Propriedades do Sistema.

(Importante: Feche qualquer terminal que já estiver aberto e abra um novo para que o Windows reconheça o comando).

2. Banco de Dados (MySQL)
O projeto utiliza o Prisma com MySQL. O arquivo .env já aponta para mysql://root:@localhost:3306/materna_ia.

Abra o seu gerenciador de banco de dados (XAMPP, Laragon, MySQL Workbench, etc.).

Certifique-se de que o serviço do MySQL está aberto e rodando.

Crie um banco de dados vazio chamado materna_ia.

Abra o terminal na pasta backend do projeto e rode os seguintes comandos para criar as tabelas e sincronizar o Prisma:

Bash


npx prisma db push
npx prisma generate
3. Instalando as Dependências (Backend e Frontend)
No terminal, você precisará instalar as dependências do Node.js.

No Backend:
Navegue até a pasta backend e rode:

Bash


npm install
Caso falte alguma biblioteca específica que foi adicionada recentemente, rode também:

Bash


npm install elevenlabs axios openai telegraf
No Frontend:
Navegue até a pasta frontend e rode:

Bash


npm install
4. Configurando o Multivozes BR (Python)
O motor de vozes local roda em Python. Para não dar conflito com outras coisas no seu PC, vamos usar um Ambiente Virtual (venv).

Abra o terminal na pasta onde está o projeto do Multivozes BR (ex: C:\tools\multivozes_br_engine).

Crie o ambiente virtual rodando:

Bash


python -m venv venv
Ative o ambiente virtual:

Bash


venv\Scripts\activate
(Você saberá que funcionou se aparecer um (venv) no começo da linha do terminal).

Com o ambiente ativado, instale os requisitos:

Bash


pip install -r requirements.txt
5. Rodando tudo para a Apresentação
Para a demonstração funcionar perfeitamente, você precisará deixar três terminais abertos simultaneamente:

Terminal 1 (Multivozes):
Na pasta do motor de voz, ative o venv e rode o servidor:

Bash


venv\Scripts\activate
python main.py
Terminal 2 (Backend):
Na pasta backend do projeto principal, rode:

Bash


npm run dev
(Aguarde aparecer a mensagem "✅ Bot do Telegram pronto!")

Terminal 3 (Frontend):
Na pasta frontend, rode:

Bash


npm run dev
Tudo pronto! O bot já vai reconhecer os comandos e gravar/receber áudios processando tudo automaticamente através do banco e das APIs já configuradas.
