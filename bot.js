const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ==================== CONFIGURATION ====================
const ADMIN_NUMBER = process.env.ADMIN_NUMBER || '221778552550';
const BOT_NAME = process.env.BOT_NAME || 'Ceebu Touba Bot';
const WAVE_ACCOUNT = process.env.WAVE_ACCOUNT || '77 855 25 50';
const ORANGE_MONEY = process.env.ORANGE_MONEY || '77 855 25 50';

// Stockage temporaire des commandes en attente
const pendingOrders = new Map();
const orderHistory = [];

// ==================== INITIALISATION CLIENT ====================
const client = new Client({
  authStrategy: new LocalAuth(),
  headless: true,
  chromeArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ],
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ==================== ÉVÉNEMENTS CLIENT ====================

// QR Code pour la première connexion
client.on('qr', (qr) => {
  console.log('\n' + '='.repeat(50));
  console.log('📱 QR Code généré. Scannez-le avec WhatsApp:');
  console.log('='.repeat(50));
  qrcode.generate(qr, { small: true });
});

// Statut de connexion
client.on('ready', () => {
  console.log('\n✅ Bot Ceebu Touba connecté avec succès!');
  console.log(`🤖 Nom du bot: ${BOT_NAME}`);
  console.log(`👨‍💼 Numéro admin: ${ADMIN_NUMBER}`);
  console.log('En attente de commandes...\n');
});

// Écouter les messages
client.on('message', async (message) => {
  try {
    const sender = message.from;
    const body = message.body;

    // Ignorer les messages du bot lui-même
    if (message.fromMe) return;

    console.log(`\n📨 Message de ${sender}: ${body.substring(0, 50)}...`);

    // 1️⃣ DÉTECTION D'UNE NOUVELLE COMMANDE
    if (body.includes('🛍️ NOUVELLE COMMANDE CEEBU TOUBA') || 
        (body.includes('NOUVELLE COMMANDE') && body.includes('Total:'))) {
      console.log(`📦 Nouvelle commande détectée de ${sender}`);
      await handleNewOrder(message);
    }
    
    // 2️⃣ ATTENTE DU REÇU DE PAIEMENT (image/média)
    else if (pendingOrders.has(sender) && message.hasMedia) {
      console.log(`📸 Reçu/image reçu de ${sender}`);
      await handlePaymentReceipt(message);
    }
    
    // 3️⃣ COMMANDES ADMIN
    else if (sender === `${ADMIN_NUMBER}@c.us`) {
      await handleAdminCommands(message, body.toLowerCase());
    }

  } catch (error) {
    console.error('❌ Erreur dans le gestionnaire de message:', error);
  }
});

// ==================== FONCTION 1: INTERCEPTER LA COMMANDE ====================

/**
 * Intercepte et traite une nouvelle commande
 * Extrait automatiquement le montant et le nom du client
 */
async function handleNewOrder(message) {
  try {
    const orderText = message.body;
    const sender = message.from;
    const chat = await message.getChat();

    // 🔍 EXTRAIRE LES DONNÉES AVEC REGEX
    const orderData = extractOrderData(orderText);

    if (!orderData) {
      console.log('❌ Impossible d\'extraire les données de la commande');
      await chat.sendMessage('⚠️ Erreur: Format de commande non reconnu. Veuillez réessayer.');
      return;
    }

    const { total, clientName, items, phone, address } = orderData;
    const orderId = `CMD-${Date.now()}`;

    // 💾 STOCKER LA COMMANDE EN ATTENTE
    const orderInfo = {
      orderId,
      clientName,
      total,
      items,
      phone,
      address,
      sender,
      timestamp: new Date(),
      status: 'awaiting_payment'
    };

    pendingOrders.set(sender, orderInfo);
    orderHistory.push(orderInfo);

    console.log(`✅ Commande ${orderId} enregistrée`);

    // ==================== FONCTION 2: RÉPONSE AUTOMATIQUE AU CLIENT ====================

    const responseMessage = `✅ Merci pour votre commande *${clientName}* ! 🌾

*Montant à payer:* ${total} FCFA

Pour valider votre achat, veuillez effectuer le transfert manuel sur l'un de nos comptes :

🌊 *Wave* : ${WAVE_ACCOUNT}
🧡 *Orange Money* : ${ORANGE_MONEY}

⚠️ *IMPORTANT* : Une fois le transfert effectué, veuillez envoyer la *CAPTURE D'ÉCRAN* (photo) du reçu de paiement directement dans cette discussion pour que nous puissions valider votre livraison.

*Merci de votre confiance!* 💚`;

    await chat.sendMessage(responseMessage);
    console.log(`📬 Réponse automatique envoyée à ${clientName}`);

    // ==================== NOTIFIER L'ADMIN ====================

    const adminNotification = `🔔 *NOUVELLE COMMANDE REÇUE*

*ID:* ${orderId}
*Client:* ${clientName}
*Téléphone:* ${phone}
*Montant:* ${total} FCFA
*Adresse:* ${address || 'Non spécifiée'}
*Produits:* ${items}
*Statut:* ⏳ En attente de confirmation de paiement
*Heure:* ${new Date().toLocaleString('fr-SN')}

${Array(40).fill('—').join('')}`;

    await client.sendMessage(`${ADMIN_NUMBER}@c.us`, adminNotification);
    console.log(`📢 Notification admin envoyée`);

  } catch (error) {
    console.error('❌ Erreur dans handleNewOrder:', error.message);
  }
}

// ==================== FONCTION 3: TRAITER LE REÇU DE PAIEMENT ====================

/**
 * Reçoit l'image du reçu, la sauvegarde et l'envoie à l'admin
 */
async function handlePaymentReceipt(message) {
  try {
    const sender = message.from;
    const chat = await message.getChat();
    const orderInfo = pendingOrders.get(sender);

    if (!orderInfo) {
      console.log('⚠️ Aucune commande en attente pour ce numéro');
      return;
    }

    const { clientName, total, orderId } = orderInfo;

    // 📸 TÉLÉCHARGER L'IMAGE
    const media = await message.downloadMedia();
    console.log(`📥 Image téléchargée: ${media.mimetype}`);

    const timestamp = Date.now();
    const receiptsDirPath = path.join(__dirname, 'receipts');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(receiptsDirPath)) {
      fs.mkdirSync(receiptsDirPath, { recursive: true });
      console.log('📁 Dossier "receipts" créé');
    }

    const imageFileName = `${orderId}_${clientName.replace(/\s+/g, '_')}_${timestamp}.png`;
    const imagePath = path.join(receiptsDirPath, imageFileName);

    // Sauvegarder l'image en local
    fs.writeFileSync(imagePath, media.data, 'base64');
    console.log(`💾 Reçu sauvegardé: ${imageFileName}`);

    // ==================== RÉPONDRE AU CLIENT ====================

    const clientResponse = `✅ Merci ! Votre reçu a bien été reçu et est en cours de vérification par notre équipe.

Vous recevrez une confirmation sous peu. 🚚`;
    
    await chat.sendMessage(clientResponse);
    console.log(`✅ Confirmation envoyée au client`);

    // ==================== ENVOYER L'ALERTE À L'ADMIN AVEC L'IMAGE ====================

    const adminAlertMessage = `🔔 *REÇU DE PAIEMENT REÇU*

*Client:* ${clientName}
*Montant:* ${total} FCFA
*ID Commande:* ${orderId}
*Heure:* ${new Date().toLocaleString('fr-SN')}

⚠️ Veuillez vérifier vos applications de paiement (Wave, Orange Money) pour confirmer le transfert.

${Array(40).fill('—').join('')}`;

    // Envoyer l'image à l'admin
    const adminMediaMessage = new MessageMedia(media.mimetype, media.data, imageFileName);
    await client.sendMessage(`${ADMIN_NUMBER}@c.us`, adminMediaMessage, { caption: adminAlertMessage });

    console.log(`📸 Image du reçu envoyée à l'admin`);

    // ==================== MARQUER LA COMMANDE COMME CONFIRMÉE ====================

    orderInfo.status = 'payment_received';
    orderInfo.receiptPath = imagePath;
    orderInfo.receiptTime = new Date();
    
    // Garder l'information 24h avant de la supprimer
    setTimeout(() => {
      pendingOrders.delete(sender);
      console.log(`🗑️ Commande ${orderId} supprimée du cache`);
    }, 24 * 60 * 60 * 1000); // 24 heures

    console.log(`✅ Commande ${orderId} traitée avec succès`);

  } catch (error) {
    console.error('❌ Erreur dans handlePaymentReceipt:', error.message);
    const chat = await message.getChat();
    await chat.sendMessage('⚠️ Une erreur est survenue lors du traitement de votre reçu. Veuillez réessayer.');
  }
}

// ==================== FONCTION 4: EXTRAIRE LES DONNÉES AVEC REGEX ====================

/**
 * Utilise des Regex pour extraire automatiquement:
 * - Montant total
 * - Nom du client
 * - Produits
 * - Téléphone
 * - Adresse
 */
function extractOrderData(text) {
  try {
    // Pattern pour extraire le montant (ex: "57 500 FCFA" ou "57500 FCFA")
    const totalMatch = text.match(/Total:\s*([\d\s]+)\s*FCFA/i);
    const total = totalMatch ? totalMatch[1].trim() + ' FCFA' : null;

    // Pattern pour extraire le nom du client
    const nameMatch = text.match(/Client:\s*([^\n]+)/i) || 
                      text.match(/Nom:\s*([^\n]+)/i);
    const clientName = nameMatch ? nameMatch[1].trim() : 'Client Anonyme';

    // Pattern pour extraire le téléphone
    const phoneMatch = text.match(/(?:Téléphone|Phone|Tel):\s*([^\n]+)/i);
    const phone = phoneMatch ? phoneMatch[1].trim() : 'N/A';

    // Pattern pour extraire les produits
    const itemsMatch = text.match(/Produits:\s*([^T]*?)(?:Montant:|$)/i);
    const items = itemsMatch ? itemsMatch[1].trim() : 'Non spécifié';

    // Pattern pour extraire l'adresse
    const addressMatch = text.match(/Adresse:\s*([^\n]+)/i);
    const address = addressMatch ? addressMatch[1].trim() : 'Non spécifiée';

    if (!total) {
      console.log('❌ Montant total non trouvé dans le texte');
      return null;
    }

    console.log(`✅ Extraction réussie: ${clientName} - ${total}`);

    return {
      total,
      clientName,
      items,
      phone,
      address
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des données:', error.message);
    return null;
  }
}

// ==================== COMMANDES ADMIN ====================

/**
 * Gère les commandes admin envoyées via WhatsApp
 */
async function handleAdminCommands(message, body) {
  try {
    if (body === '/commandes' || body === '/orders') {
      await showPendingOrders(message);
    } 
    else if (body === '/stats' || body === '/statistics') {
      await showStats(message);
    } 
    else if (body === '/aide' || body === '/help') {
      await showHelp(message);
    }
    else if (body === '/historique' || body === '/history') {
      await showOrderHistory(message);
    }

  } catch (error) {
    console.error('❌ Erreur dans handleAdminCommands:', error.message);
  }
}

/**
 * Affiche les commandes en attente
 */
async function showPendingOrders(message) {
  try {
    let response = '📋 *COMMANDES EN ATTENTE DE PAIEMENT*\n\n';

    if (pendingOrders.size === 0) {
      response += 'Aucune commande en attente ✅';
    } else {
      let count = 1;
      pendingOrders.forEach((order, customer) => {
        response += `${count}️⃣ *${order.clientName}*\n`;
        response += `   💰 ${order.total}\n`;
        response += `   📱 ${order.phone}\n`;
        response += `   🆔 ${order.orderId}\n`;
        response += `   ⏰ ${order.timestamp.toLocaleTimeString('fr-SN')}\n\n`;
        count++;
      });
    }

    response += `\n${Array(40).fill('—').join('')}`;
    await message.reply(response);

  } catch (error) {
    console.error('❌ Erreur showPendingOrders:', error.message);
  }
}

/**
 * Affiche les statistiques du bot
 */
async function showStats(message) {
  try {
    const receiptsCount = fs.existsSync(path.join(__dirname, 'receipts')) 
      ? fs.readdirSync(path.join(__dirname, 'receipts')).length 
      : 0;

    const response = `📊 *STATISTIQUES DU BOT*

🤖 Bot: ${BOT_NAME} ✅
⏳ Commandes en attente: ${pendingOrders.size}
✅ Commandes traitées: ${orderHistory.length}
📁 Reçus sauvegardés: ${receiptsCount}

${Array(40).fill('—').join('')}`;

    await message.reply(response);

  } catch (error) {
    console.error('❌ Erreur showStats:', error.message);
  }
}

/**
 * Affiche l'historique des commandes
 */
async function showOrderHistory(message) {
  try {
    let response = '📜 *HISTORIQUE DES COMMANDES*\n\n';

    if (orderHistory.length === 0) {
      response += 'Aucune commande enregistrée';
    } else {
      const last10 = orderHistory.slice(-10).reverse();
      last10.forEach((order, index) => {
        response += `${index + 1}. ${order.clientName} - ${order.total}\n`;
        response += `   Status: ${order.status}\n`;
        response += `   ${order.timestamp.toLocaleTimeString('fr-SN')}\n\n`;
      });
    }

    await message.reply(response);

  } catch (error) {
    console.error('❌ Erreur showOrderHistory:', error.message);
  }
}

/**
 * Affiche les commandes disponibles
 */
async function showHelp(message) {
  try {
    const response = `ℹ️ *COMMANDES DISPONIBLES*

/commandes - Liste des commandes en attente
/stats - Statistiques du bot
/historique - Historique des 10 dernières commandes
/aide - Afficher cette aide

${Array(40).fill('—').join('')}
Bot Ceebu Touba v2.0`;

    await message.reply(response);

  } catch (error) {
    console.error('❌ Erreur showHelp:', error.message);
  }
}

// ==================== GESTION DES ERREURS ====================

client.on('auth_failure', (message) => {
  console.log('❌ Erreur d\'authentification:', message);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Bot déconnecté:', reason);
  console.log('🔄 Tentative de reconnexion...');
});

// ==================== DÉMARRAGE ET ARRÊT ====================

// Démarrer le client
client.initialize();

// Arrêt gracieux
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du bot...');
  await client.destroy();
  process.exit(0);
});

module.exports = { client, pendingOrders, orderHistory };