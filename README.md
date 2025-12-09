# Instalação do CRM Refrimix (Windows)

1. Copie a pasta **crm-refrimix** inteira do pendrive para o disco C:

   Exemplo: `C:\RefrimixCRM`

2. Abra o PowerShell como Administrador:

   - Clique no botão Iniciar
   - Digite **PowerShell**
   - Clique com o botão direito em *Windows PowerShell* e escolha **Executar como administrador**

3. No PowerShell, rode:

cd C:\RefrimixCRM
powershell -ExecutionPolicy Bypass -File .\install-crm.ps1

text

4. Aguarde:

- O script vai instalar o Node.js (se não tiver)
- Vai instalar as dependências do CRM
- Vai criar um atalho **"CRM Refrimix"** na área de trabalho

5. Para usar o CRM:

- Dê dois cliques no atalho **"CRM Refrimix"**
- O sistema vai abrir automaticamente no navegador em `http://localhost:5173`