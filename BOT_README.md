# 🤖 BOT WHATSAPP CEEBU TOUBA - GUIDE D'INSTALLATION

## 📋 Prérequis
- **Node.js** v14+ et **npm**
- **WhatsApp** sur votre téléphone
- Un serveur ou VPS pour héberger le bot 24/7

---

## 🚀 Installation

### 1️⃣ Cloner le dossier du bot
```bash
git clone https://github.com/zogueye63-design/ceebu-touba.git
cd ceebu-touba
```

### 2️⃣ Installer les dépendances
```bash
npm install
```

### 3️⃣ Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet:
```bash
cp .env.example .env
```

Éditer `.env`:
```
ADMIN_NUMBER=221778552550
BOT_NAME=Ceebu Touba Bot
NODE_ENV=production
```

### 4️⃣ Démarrer le bot
```bash
npm start
```

Vous verrez un **QR Code** dans le terminal. Scannez-le avec WhatsApp sur votre téléphone.

---

## 🔄 Flux de Fonctionnement

### **Étape 1: Client envoie une commande**
Le client remplit le formulaire sur le site et clique "Confirmer avec WhatsApp". Le message de commande arrive au numéro admin.

### **Étape 2: Bot détecte la commande**
Le bot reçoit le message et utilise des **Regex** pour extraire:
- ✅ Montant total
- ✅ Nom du client
- ✅ Produits
- ✅ Téléphone

### **Étape 3: Réponse automatique**
Le bot envoie automatiquement au client:
```
✅ Merci pour votre commande [Nom] ! 🌾
Montant à payer: [Total] FCFA

Pour valider, transférez sur:
🌊 Wave: 77 855 25 50
🧡 Orange Money: 77 855 25 50

⚠️ Envoyez la CAPTURE D'ÉCRAN du reçu dans cette discussion
```

### **Étape 4: Client envoie le reçu**
Le client prend une photo du reçu de paiement et l'envoie par WhatsApp.

### **Étape 5: Bot valide le reçu**
- 📸 Télécharge et sauvegarde l'image
- ✅ Confirme au client
- 🔔 Alerte l'admin avec l'image
- ✅ Marque la commande comme confirmée

---

## 📊 Commandes Admin

Depuis le chat WhatsApp avec le bot:

| Commande | Description |
|----------|-------------|
| `/commandes` | Liste les commandes en attente de paiement |
| `/stats` | Affiche les statistiques du bot |
| `/aide` | Affiche les commandes disponibles |

---

## 💾 Stockage des Données

### Dossier `receipts/`
Les images de reçus sont sauvegardées en local:
```
receipts/
├── receipt_CMD-1719667200000_1719667300000.png
├── receipt_CMD-1719667300000_1719667400000.png
└── ...
```

### Données en mémoire
Les commandes en attente sont stockées dans une `Map()`:
```javascript
pendingOrders = {
  "221XXXXXXXXX@c.us": {
    total: "57 500 FCFA",
    clientName: "Moussa Sow",
    items: "Riz Long 25kg x2",
    phone: "+221 77 XXX XX XX",
    orderId: "CMD-1719667200000",
    timestamp: "2024-06-29..."
  }
}
```

---

## 🔧 Personnalisation

### Modifier les numéros Wave/Orange Money
Éditer la fonction `handleNewOrder()` dans `bot.js`:
```javascript
🌊 *Wave* : VOTRE_NUMERO
🧡 *Orange Money* : VOTRE_NUMERO
```

### Modifier le numéro admin
Éditer le fichier `.env`:
```
ADMIN_NUMBER=221XXXXXXXXX
```

### Ajouter d'autres fonctionnalités
- Intégration base de données (MongoDB, PostgreSQL)
- Webhook vers votre serveur
- Notification email
- Dashboard d'administration

---

## ⚠️ Troubleshooting

### ❌ QR Code ne s'affiche pas
```bash
# Vérifier les dépendances
npm install --save-dev puppeteer

# Relancer
npm start
```

### ❌ Erreur "ENOTFOUND" 
Le bot ne peut pas rejoindre WhatsApp. Vérifier votre connexion Internet.

### ❌ Images non sauvegardées
Vérifier que le dossier `receipts/` est créé automatiquement. Si non:
```bash
mkdir receipts
chmod 755 receipts
```

---

## 📱 Déploiement sur Serveur

### Option 1: Utiliser PM2 (Recommandé)
```bash
npm install -g pm2

pm2 start bot.js --name "ceebu-touba-bot"
pm2 save
pm2 startup
```

### Option 2: Utiliser Docker
Créer `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "bot.js"]
```

Lancer:
```bash
docker build -t ceebu-bot .
docker run -d ceebu-bot
```

### Option 3: Héberger sur Railway, Heroku, ou Render
⚠️ **Important**: Les services d'hébergement gratuits peuvent être limités pour les bots WhatsApp. Préférer un **VPS** (Digital Ocean, Linode, AWS EC2).

---

## 🛡️ Sécurité

✅ **À faire:**
- Stocker `ADMIN_NUMBER` en variable d'environnement
- Utiliser des tokens sécurisés
- Valider tous les entrées utilisateur
- Chiffrer les données sensibles

❌ **À éviter:**
- Ne pas committer le fichier `.env`
- Ne pas partager les numéros de clients
- Ne pas stocker les mots de passe en clair

---

## 📞 Support

Pour toute question sur le bot:
1. Consultez cette documentation
2. Vérifiez les logs dans le terminal
3. Ouvrez une issue sur GitHub

---

**Bot créé pour Ceebu Touba 🌾💚**
