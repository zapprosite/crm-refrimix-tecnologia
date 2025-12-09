#!/usr/bin/env bash
# install-crm.sh - Instalação automática do CRM Refrimix no Ubuntu

set -e

echo "== CRM Refrimix - Instalação automática (Ubuntu) =="

# 1) Caminho do projeto (pasta onde está este script)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Pasta do projeto: $PROJECT_DIR"

# 2) Garantir que está rodando como root (para apt install)
if [ "$EUID" -ne 0 ]; then
  echo "Reabrindo o script com sudo..."
  exec sudo bash "$0" "$@"
fi

# 3) Verificar / instalar Node.js + npm
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js não encontrado. Instalando Node.js e npm..."
  apt update
  apt install -y nodejs npm
else
  echo "Node.js já está instalado."
fi

# 4) Instalar dependências do projeto
cd "$PROJECT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Instalando dependências npm..."
  npm install --legacy-peer-deps
else
  echo "Dependências já instaladas (pasta node_modules existe)."
fi

# 5) Gerar script start-crm.sh
echo "Gerando start-crm.sh..."

cat > "$PROJECT_DIR/start-crm.sh" << 'EOF'
#!/usr/bin/env bash
# start-crm.sh - Inicia o CRM Refrimix

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Iniciando CRM Refrimix..."

# Abre um terminal separado rodando o servidor
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -lc "cd '$PROJECT_DIR'; npm run dev; exec bash"
else
  # fallback: roda no mesmo terminal
  npm run dev
fi

# Abre o navegador na aplicação
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:5173" >/dev/null 2>&1 &
fi
EOF

chmod +x "$PROJECT_DIR/start-crm.sh"

# 6) Criar atalho .desktop na área de trabalho do usuário
#    (usa o usuário que chamou o sudo, não o root)
USER_NAME="${SUDO_USER:-$USER}"
USER_HOME="$(eval echo "~$USER_NAME")"
DESKTOP_DIR="$USER_HOME/Desktop"

echo "Criando atalho na área de trabalho em: $DESKTOP_DIR"

mkdir -p "$DESKTOP_DIR"

ICON_PATH="$PROJECT_DIR/icone/00-logo.png"  # pode ser .png mesmo para .desktop

cat > "$DESKTOP_DIR/CRM-Refrimix.desktop" << EOF
[Desktop Entry]
Type=Application
Name=CRM Refrimix
Comment=Iniciar CRM Refrimix
Exec=$PROJECT_DIR/start-crm.sh
Icon=$ICON_PATH
Terminal=false
Categories=Utility;
EOF

chmod +x "$DESKTOP_DIR/CRM-Refrimix.desktop"

echo ""
echo "Instalação concluída!"
echo "- Use o atalho 'CRM Refrimix' na área de trabalho para abrir o sistema."
echo "- Ou rode manualmente: $PROJECT_DIR/start-crm.sh"
