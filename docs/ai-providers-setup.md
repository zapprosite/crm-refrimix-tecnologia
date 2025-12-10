# Guia de Configuração - Provedores de IA

Este guia explica como configurar cada provedor de IA para o Chatbot "Cérebro Refrimix".

---

## 🏠 Ollama (Local - GRATUITO)

### Instalação

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Baixe o instalador em: https://ollama.com/download/windows

**macOS:**
```bash
brew install ollama
```

### Iniciando o Servidor
```bash
# Baixar modelo (primeira vez)
ollama pull llama3

# Iniciar servidor (padrão: porta 11434)
ollama serve
```

### Configuração no CRM
| Campo | Valor |
|-------|-------|
| Provedor | `Ollama (Local)` |
| Modelo | `llama3` (ou outro modelo instalado) |
| Base URL | `http://localhost:11434` |
| API Key | *deixar vazio* |

### Modelos Recomendados
- `llama3` - Equilibrado (8B)
- `llama3:70b` - Potente (requer mais RAM)
- `mistral` - Rápido e leve
- `qwen2.5` - Excelente para tool use

---

## 🟢 OpenAI

### Obtenção da API Key
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API Key
3. Copie a chave (começa com `sk-`)

### Configuração no CRM
| Campo | Valor |
|-------|-------|
| Provedor | `OpenAI` |
| Modelo | `gpt-3.5-turbo` ou `gpt-4` |
| API Key | `sk-xxxxxxxxxxxxxxxx` |
| Base URL | *deixar vazio* |

### Modelos Disponíveis
- `gpt-3.5-turbo` - Rápido, barato (~$0.002/1K tokens)
- `gpt-4` - Mais inteligente (~$0.03/1K tokens)
- `gpt-4-turbo` - Melhor custo-benefício

---

## 🔷 Google Gemini

### Obtenção da API Key
1. Acesse https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave

### Configuração no CRM
| Campo | Valor |
|-------|-------|
| Provedor | `Google Gemini` |
| Modelo | `gemini-1.5-flash` |
| API Key | `AIzaSy...sua_chave_aqui` |
| Base URL | *deixar vazio* |

### Modelos Disponíveis
- `gemini-1.5-flash` - Rápido, gratuito (até 60 req/min)
- `gemini-1.5-pro` - Mais capacidade

---

## 🟣 Anthropic Claude

### Obtenção da API Key
1. Acesse https://console.anthropic.com/settings/keys
2. Crie uma API Key
3. Copie a chave

### Configuração no CRM
| Campo | Valor |
|-------|-------|
| Provedor | `Anthropic Claude` |
| Modelo | `claude-3-5-sonnet-20241022` |
| API Key | `sk-ant-api...` |
| Base URL | *deixar vazio* |

### Modelos Disponíveis
- `claude-3-5-sonnet-20241022` - Melhor custo-benefício
- `claude-3-opus-20240229` - Mais inteligente
- `claude-3-haiku-20240307` - Mais rápido/barato

---

## 🔵 Perplexity

### Obtenção da API Key
1. Acesse https://www.perplexity.ai/settings/api
2. Gere uma API Key
3. Copie a chave

### Configuração no CRM
| Campo | Valor |
|-------|-------|
| Provedor | `Perplexity` |
| Modelo | `llama-3.1-sonar-small-128k-online` |
| API Key | `pplx-xxxxxxxxxxxx` |
| Base URL | *deixar vazio* |

> ⚠️ **Nota**: Perplexity é otimizado para busca online. Tool use pode ser limitado.

---

## ⚙️ Variáveis de Ambiente (Opcional)

Você pode pre-configurar API keys no arquivo `.env`:

```env
VITE_OPENAI_API_KEY=sk-sua-chave-aqui
VITE_GOOGLE_API_KEY=AIzaSy-sua-chave-aqui
VITE_ANTHROPIC_API_KEY=sk-ant-api-sua-chave-aqui
VITE_PERPLEXITY_API_KEY=pplx-sua-chave-aqui
```

---

## 🔧 Troubleshooting

### Ollama não conecta
```bash
# Verificar se está rodando
curl http://localhost:11434/api/tags

# Se der erro, reiniciar:
ollama serve
```

### API Key inválida
- Verifique saldo/créditos na conta do provedor
- Confirme que a key não expirou
- Confirme que copiou a key inteira

### Modelo não encontrado
- OpenAI: Verifique se tem acesso ao modelo (GPT-4 requer aprovação)
- Ollama: Execute `ollama list` para ver modelos instalados

---

## 📊 Comparativo de Custos (Dez 2024)

| Provedor | Modelo | Preço Aprox. (1M tokens) |
|----------|--------|--------------------------|
| Ollama | llama3 | **GRÁTIS** (local) |
| Google | gemini-1.5-flash | **GRÁTIS** (limite: 60/min) |
| OpenAI | gpt-3.5-turbo | ~$2 |
| OpenAI | gpt-4-turbo | ~$30 |
| Anthropic | claude-3-sonnet | ~$18 |
| Perplexity | sonar-small | ~$1 |

---

## 💡 Recomendação "Poor Dev"

Para uso em desenvolvimento com custo zero:
1. **Ollama local** como padrão (llama3 ou mistral)
2. **Gemini Flash** como fallback de cloud (grátis)
3. **OpenAI GPT-4** apenas para casos complexos (pago)
