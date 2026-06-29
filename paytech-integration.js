/* CEEBU TOUBA — paytech-integration.js */
/* Intégration WhatsApp pour les commandes - SIMPLIFIÉ ET FONCTIONNEL */

const WHATSAPP_NUMBER = '+221778552550';

function generateOrderId() {
  return 'CMD-' + Date.now();
}

function generateOrderSummary(orderData) {
  const items = orderData.items.map(item => 
    `• ${item.name} (${item.weight}) x${item.quantity} = ${(item.price * item.quantity).toLocaleString('fr-SN')} FCFA`
  ).join('\n');

  const message = `🛍️ *NOUVELLE COMMANDE CEEBU TOUBA*

*Produits:*
${items}

*Montant:*
Sous-total: ${orderData.subtotal.toLocaleString('fr-SN')} FCFA
Livraison: ${orderData.shippingCost.toLocaleString('fr-SN')} FCFA
*Total: ${orderData.total.toLocaleString('fr-SN')} FCFA*

*Client:*
Nom: ${orderData.customerName}
Email: ${orderData.email}
Téléphone: ${orderData.phone}

*Adresse:*
${orderData.address}

*Option Livraison:* ${orderData.delivery === 'express' ? 'Express (Livré demain)' : 'Standard (3-5 jours)'}

*Message:* ${orderData.message || 'Aucun'}

---
Commande: ${orderData.orderId}
Date: ${new Date().toLocaleString('fr-SN')}`;

  return message;
}

function sendToWhatsApp(orderData) {
  const message = generateOrderSummary(orderData);
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  console.log('Envoi WhatsApp:', whatsappUrl);
  window.open(whatsappUrl, '_blank');
  saveOrder(orderData);
}

function saveOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem('ceebu_orders') || '[]');
  orders.push({
    id: orderData.orderId,
    customer: orderData.customerName,
    email: orderData.email,
    phone: orderData.phone,
    address: orderData.address,
    total: orderData.total,
    date: new Date().toISOString()
  });
  localStorage.setItem('ceebu_orders', JSON.stringify(orders));
}
