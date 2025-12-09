GUIA DE INSTALAÇÃO VIA PEN DRIVE
================================

Para instalar o CRM Refrimix em outro computador usando este Pen Drive:

REQUISITOS:
- O computador precisa ter conexão com INTERNET (para baixar o Node.js e componentes).
- Windows 10 ou 11 (para instalação automática via PowerShell).

PASSO A PASSO (WINDOWS):
1. Conecte este Pen Drive no computador.
2. Abra a pasta do Pen Drive.
3. Clique com o botão direito no arquivo "install-crm.ps1".
4. Selecione "Executar com o PowerShell".
5. Siga as instruções na tela preta que vai abrir.

O QUE VAI ACONTECER:
- O sistema instalará o CRM na pasta C:\crm-refrimix.
- Se o computador não tiver Node.js, ele será baixado e instalado automaticamente.
- Todas as dependências serão baixadas.
- Um atalho "CRM Refrimix" será criado na Área de Trabalho.

PASSO A PASSO (LINUX/UBUNTU):
1. Copie a pasta para o computador.
2. Abra o terminal na pasta.
3. Digite: bash install-crm.sh

IMPORTANTE:
- Não é necessário copiar a pasta "node_modules" para o Pen Drive (ela é muito pesada e cheia de arquivos pequenos). O instalador baixa tudo na hora.
- Certifique-se de que o arquivo ".env" com as senhas do banco de dados está no Pen Drive junto com os outros arquivos.
