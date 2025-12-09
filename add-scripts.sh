#!/bin/bash
# Adiciona scripts de teste e lint no package.json

npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.test:ui="playwright test --ui"
npm pkg set scripts.lint="eslint . --ext ts,tsx"
npm pkg set scripts.lint:fix="eslint . --ext ts,tsx --fix"

echo "✅ Scripts adicionados!"
