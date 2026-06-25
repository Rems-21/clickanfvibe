#!/bin/bash
# Script de déploiement automatisé pour Hostinger (cPanel / hPanel)
# À exécuter depuis la racine du dépôt git sur le serveur.

echo "====================================="
echo "🚀 Déploiement de Click & Vibe..."
echo "====================================="

# 1. Vérification de Python et Node
if ! command -v python3 &> /dev/null; then
    echo "❌ Erreur: Python3 n'est pas installé."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Erreur: npm (Node.js) n'est pas installé."
    exit 1
fi

# 2. Installation du Backend (FastAPI)
echo "📦 Installation des dépendances Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialisation de la base de données MySQL
echo "🗄️ Initialisation de la base MySQL..."
# Le script Python va s'appuyer sur le .env pour se connecter et créer les tables
python3 -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
echo "✅ Base de données prête !"
cd ..

# 3. Installation et Build du Frontend (React)
echo "🎨 Installation des dépendances Frontend..."
npm install
echo "🏗️ Construction du Frontend (Build)..."
npm run build

echo "✅ Déploiement terminé avec succès !"
echo "====================================="
echo "📌 Étapes finales sur Hostinger :"
echo "1. Le site web (HTML/JS/CSS) se trouve dans le dossier 'dist/'."
echo "2. Configurez une application Python via hPanel pointant vers le dossier 'backend'."
echo "3. L'application WSGI/Passenger doit charger 'main:app'."
echo "====================================="
