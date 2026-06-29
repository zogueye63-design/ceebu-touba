const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ADMIN_NUMBER = process.env.ADMIN_NUMBER || '221778552550';
const BOT_NAME = process.env.BOT_NAME || 'Ceebu Touba Bot';

// Stockage temporaire des commandes en attente
const pendingOrders = new Map();

// Initialiser le client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  headless: true,
  chromeArgs: ['--no-sandbox']
});

// QR Code pour la première connexion
client.on('qr', (qr) => {
  console.log('📱 QR Code généré. Scannez-le avec votre téléphone:');
  qrcode.generate(qr, { small: true });
});

// Statut de connexion
client.on('ready', () => {
  console.log('✅ Bot Ceebu Touba connecté!');
});

// Écouter les messages
client.on('message', async (message) => {
  try {
    const chat = await message.getChat();
    const sender = message.from;
    const body = message.body;

    // 1️⃣ DÉTECTION D'UNE NOUVELLE COMMANDE
    if (body.includes('NOUVELLE COMMANDE CEEBU TOUBA') && body.includes('Total:')) {
      console.log(`📦 Nouvelle commande détectée de ${sender}`);
      await handleNewOrder(message, chat);
    }

    // 2️⃣ ATTENTE DU REÇU DE PAIEMENT (image)
    if (pendingOrders.has(sender) && message.hasMedia) {
      console.log(`📸 Reçu reçu de ${sender}`);
      await handlePaymentReceipt(message, chat, sender);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
});

/**
 * 1️⃣ INTERCEPTER ET TRAITER LA NOUVELLE COMMANDE
 */
async function handleNewOrder(message, chat) {
  try {
    const orderText = message.body;
    
    // Extraire les données avec Regex
    const orderData = extractOrderData(orderText);
    
    if (!orderData) {
      console.log('❌ Impossible d\'extraire les données de la commande');
      return;
    }

    const { total, clientName, items, phone } = orderData;
    const sender = message.from;

    // Stocker la commande en attente
    pendingOrders.set(sender, {
      total,
      clientName,
      items,
      phone,
      orderId: `CMD-${Date.now()}`,
      timestamp: new Date()
    });

    // 2️⃣ ENVOYER LA RÉPONSE AUTOMATIQUE AU CLIENT
    const responseMessage = `✅ Merci pour votre commande *${clientName}* ! 🌾

*Montant à payer:* ${total} FCFA

Pour valider votre achat, veuillez effectuer le transfert manuel sur l'un de nos comptes :

🌊 *Wave* : 77 855 25 50
🧡 *Orange Money* : 77 855 25 50

⚠️ *IMPORTANT* : Une fois le transfert effectué, veuillez envoyer la *CAPTURE D'ÉCRAN* (photo) du reçu de paiement directement dans cette discussion pour que nous puissions valider votre livraison.

Merci de votre confiance! 💚`;

    await chat.sendMessage(responseMessage);
    console.log(`✅ Réponse automatique envoyée à ${sender}`);

    // 3️⃣ NOTIFIER L'ADMIN
    const adminNotification = `🔔 *NOUVELLE COMMANDE*\n\n*Client:* ${clientName}\n*Total:* ${total} FCFA\n*Téléphone:* ${phone}\n*Statut:* En attente de confirmation de paiement`;
    await client.sendMessage(`${ADMIN_NUMBER}@c.us`, adminNotification);

  } catch (error) {
    console.error('❌ Erreur handleNewOrder:', error);
  }
}

/**
 * 2️⃣ TRAITER LA RÉCEPTION DU REÇU DE PAIEMENT
 */
async function handlePaymentReceipt(message, chat, sender) {
  try {
    const orderInfo = pendingOrders.get(sender);
    const { clientName, total, orderId } = orderInfo;

    // 📸 TÉLÉCHARGER L'IMAGE
    const media = await message.downloadMedia();
    const timestamp = Date.now();
    const imageFileName = `receipt_${orderId}_${timestamp}.png`;
    const imagePath = path.join(__dirname, 'receipts', imageFileName);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(path.join(__dirname, 'receipts'))) {
      fs.mkdirSync(path.join(__dirname, 'receipts'), { recursive: true });
    }

    // Sauvegarder l'image
    fs.writeFileSync(imagePath, media.data, 'base64');
    console.log(`💾 Reçu sauvegardé: ${imageFileName}`);

    // 3️⃣ RÉPONDRE AU CLIENT
    const clientResponse = `✅ Merci ! Votre reçu a bien été reçu et est en cours de vérification par notre équipe.

Vous recevrez une confirmation sous peu. 🚚`;
    await chat.sendMessage(clientResponse);

    // 4️⃣ ENVOYER L'ALERTE À L'ADMIN AVEC L'IMAGE
    const adminAlertMessage = `🔔 *REÇU DE PAIEMENT REÇU*\n\n*Client:* ${clientName}\n*Montant:* ${total} FCFA\n*ID Commande:* ${orderId}\n*Heure:* ${new Date().toLocaleString('fr-SN')}\n\n⚠️ Veuillez vérifier vos applications de paiement (Wave/Orange Money) et confirmer la réception du paiement.`;

    // Envoyer le message + l'image à l'admin
    const adminMediaMessage = new MessageMedia(media.mimetype, media.data, imageFileName);
    await client.sendMessage(`${ADMIN_NUMBER}@c.us`, adminMediaMessage);
    await client.sendMessage(`${ADMIN_NUMBER}@c.us`, adminAlertMessage);

    console.log(`✅ Alerte admin envoyée avec le reçu`);

    // 5️⃣ MARQUER LA COMMANDE COMME CONFIRMÉE
    pendingOrders.delete(sender);
    console.log(`✅ Commande ${orderId} traitée avec succès`);

  } catch (error) {
    console.error('❌ Erreur handlePaymentReceipt:', error);
  }
}

/**
 * 🔍 EXTRAIRE LES DONNÉES DE LA COMMANDE AVEC REGEX
 */
function extractOrderData(text) {
  try {
    // Extraire le montant total
    const totalMatch = text.match(/\*Total:\s*([\d\s]+)\s*FCFA/);
    const total = totalMatch ? totalMatch[1].trim() : null;

    // Extraire le nom du client
    const nameMatch = text.match(/\*Nom:\s*([^\n]*)/);
    const clientName = nameMatch ? nameMatch[1].trim() : 'Client';

    // Extraire le téléphone
    const phoneMatch = text.match(/\*Téléphone:\s*([^\n]*)/);
    const phone = phoneMatch ? phoneMatch[1].trim() : 'N/A';

    // Extraire les produits
    const itemsMatch = text.match(/\*Produits:\*\n([\s\S]*?)\n\*Montant:/);
    const items = itemsMatch ? itemsMatch[1].trim() : 'Non spécifié';

    if (!total) {
      console.log('❌ Montant total non trouvé');
      return null;
    }

    return {
      total: `${total} FCFA`,
      clientName,
      items,
      phone
    };
  } catch (error) {
    console.error('❌ Erreur extraction données:', error);
    return null;
  }
}

/**
 * 📊 COMMANDES UTILES POUR L'ADMIN
 */
client.on('message', async (message) => {
  const body = message.body.toLowerCase();
  const sender = message.from;

  // Commande: /commandes (liste les commandes en attente)
  if (body === '/commandes') {
    let response = '📋 *Commandes en attente:*\n\n';
    
    if (pendingOrders.size === 0) {
      response = 'Aucune commande en attente.';
    } else {
      let count = 1;
      pendingOrders.forEach((order, customer) => {
        response += `${count}. *${order.clientName}* - ${order.total}\n   ID: ${order.orderId}\n\n`;
        count++;
      });
    }

    await message.reply(response);
  }

  // Commande: /stats (statistiques)
  if (body === '/stats') {
    const response = `📊 *Statistiques du Bot*\n\nCommandes en attente: ${pendingOrders.size}\nBot actif: ✅\nVersion: 1.0`;
    await message.reply(response);
  }

  // Commande: /aide (aide)
  if (body === '/aide') {
    const response = `ℹ️ *Commandes disponibles:*\n\n/commandes - Liste des commandes en attente\n/stats - Statistiques du bot\n/aide - Afficher cette aide`;
    await message.reply(response);
  }
});

// Gestion des erreurs
client.on('auth_failure', () => {
  console.log('❌ Erreur d\'authentification');
});

client.on('disconnected', () => {
  console.log('⚠️ Bot déconnecté');
});

// Démarrer le client
client.initialize();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du bot...');
  await client.destroy();
  process.exit(0);
});
