#!/bin/bash
cd "/Users/tavinhocarvalho/Library/Mobile Documents/com~apple~CloudDocs/ZUM/CATALOGO ZUM ONLINE"

echo ""
echo "🔄 Subindo atualizações para o GitHub..."
echo ""

git add .
git commit -m "Atualização: $(date '+%d/%m/%Y %H:%M')"
git push

echo ""
echo "✅ Pronto! Projeto atualizado no GitHub."
echo ""
read -p "Pressione Enter para fechar..."
