#!/usr/bin/env bash
# install-crm.sh - Instalação automática do CRM Refrimix no Linux (Home do Usuário)

set -e

echo "== CRM Refrimix - Instalação automática (Linux) =="

# 1) Definir diretórios
# Usa o usuário real se rodando como sudo
REAL_USER="${SUDO_USER:-$USER}"
USER_HOME=$(getent passwd "$REAL_USER" | cut -d: -f6)
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$USER_HOME/crm-refrimix"

echo "Origem: $SOURCE_DIR"
echo "Destino: $TARGET_DIR"

# 2) Garantir dependências básicas (Node.js) - Requer sudo
if [ "$EUID" -ne 0 ]; then
  echo "Este script precisa de permissão sudo para instalar dependências (Node.js)."
  echo "Por favor, digite sua senha se solicitado."
  exec sudo bash "$0" "$@"
fi

# Agora estamos como root, mas queremos instalar os arquivos como o usuário normal
echo "Verificando Node.js..."
if ! command -v node >/dev/null 2>&1; then
  echo "Instalando Node.js e npm..."
  apt-get update
  apt-get install -y nodejs npm
else
  echo "Node.js já instalado."
fi

# 3) Copiar arquivos para a home do usuário
echo "Copiando arquivos para $TARGET_DIR..."
# Cria diretório como o usuário real
sudo -u "$REAL_USER" mkdir -p "$TARGET_DIR"

# Copia arquivos (excluindo node_modules e .git)
rsync -av --exclude 'node_modules' --exclude '.git' --exclude 'install-crm.sh' "$SOURCE_DIR/" "$TARGET_DIR/"

# Ajusta permissões garantindo que o usuário seja dono
chown -R "$REAL_USER:$REAL_USER" "$TARGET_DIR"

# 4) Instalar dependências npm (como usuário normal)
echo "Instalando dependências npm..."
sudo -u "$REAL_USER" bash -c "cd '$TARGET_DIR' && npm install --legacy-peer-deps"

# 5) Criar script de inicialização
START_SCRIPT="$TARGET_DIR/start-crm.sh"
echo "Gerando $START_SCRIPT..."

cat > "$START_SCRIPT" << EOF
#!/usr/bin/env bash
cd "$TARGET_DIR"
echo "Iniciando CRM Refrimix..."

# Tenta abrir terminal
if command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -c "npm run dev; exec bash"
elif command -v konsole >/dev/null 2>&1; then
  konsole -e bash -c "npm run dev; exec bash"
elif command -v xterm >/dev/null 2>&1; then
  xterm -e bash -c "npm run dev; exec bash"
else
  # Background fallback
  npm run dev &
fi

sleep 3
xdg-open "http://localhost:5173"
EOF

chown "$REAL_USER:$REAL_USER" "$START_SCRIPT"
chmod +x "$START_SCRIPT"

# 6) Criar atalho .desktop
DESKTOP_DIR="$USER_HOME/Desktop"
# Verifica se pasta Desktop ou Área de Trabalho existe
if [ ! -d "$DESKTOP_DIR" ]; then
    if [ -d "$USER_HOME/Área de Trabalho" ]; then
        DESKTOP_DIR="$USER_HOME/Área de Trabalho"
    fi
fi

if [ -d "$DESKTOP_DIR" ]; then
    echo "Criando atalho em $DESKTOP_DIR..."
    SHORTCUT="$DESKTOP_DIR/CRM-Refrimix.desktop"
    
    cat > "$SHORTCUT" << EOF
[Desktop Entry]
Type=Application
Name=CRM Refrimix
Comment=Sistema de Gestão HVAC
Exec=$START_SCRIPT
Icon=$TARGET_DIR/icone/00-logo.png
Terminal=false
Categories=Office;Utility;
EOF
    
    chown "$REAL_USER:$REAL_USER" "$SHORTCUT"
    chmod +x "$SHORTCUT"
else
    echo "Pasta Desktop não encontrada. Atalho não criado, mas você pode rodar via terminal."
fi

echo ""
echo "Instalação concluída com sucesso em $TARGET_DIR!"
echo "Para iniciar: $START_SCRIPT"
