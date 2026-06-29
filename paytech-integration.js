/* CEEBU TOUBA — paytech-integration.js */
/* Intégration WhatsApp pour les commandes */

class OrderManagement {
  constructor(whatsappNumber = '+221771234567') {
    this.whatsappNumber = whatsappNumber; // À remplacer par votre numéro
    this.paymentMethods = {
      wave: 'https://app.wave.com/pay',
      om: 'https://www.orangemoney.sn'
    };
  }

  generateOrderSummary(orderData) {
    const items = orderData.items.map(item => 
      `• ${item.name} (${item.weight}) x${item.quantity} = ${(item.price * item.quantity).toLocaleString('fr-SN')} FCFA`
    ).join('\n');

    const message = `
🛍️ *NOUVELLE COMMANDE CEEBU TOUBA*

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

*Adresse de Livraison:*
${orderData.address}
${orderData.city} ${orderData.postal}

*Option Livraison:* ${orderData.delivery === 'express' ? 'Express (Livré demain)' : 'Standard (3-5 jours)'}

*Message:* ${orderData.message || 'Aucun'}

---
Numéro de commande: ${orderData.orderId}
Date: ${new Date().toLocaleString('fr-SN')}
    `.trim();

    return message;
  }

  sendToWhatsApp(orderData) {
    const message = this.generateOrderSummary(orderData);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    // Sauvegarder la commande
    this.saveOrder(orderData);
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
  }

  redirectToPayment(paymentMethod, orderData) {
    let redirectUrl = '';
    
    if (paymentMethod === 'wave') {
      redirectUrl = `https://app.wave.com/pay`;
    } else if (paymentMethod === 'om') {
      redirectUrl = `https://www.orangemoney.sn`;
    }

    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  }

  saveOrder(orderData) {
    const order = {
      id: orderData.orderId,
      customer: {
        name: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        postal: orderData.postal
      },
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      delivery: orderData.delivery,
      message: orderData.message,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const orders = JSON.parse(localStorage.getItem('ceebu_orders') || '[]');
    orders.push(order);
    localStorage.setItem('ceebu_orders', JSON.stringify(orders));

    return order;
  }

  checkOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('ceebu_orders') || '[]');
    return orders.find(order => order.id === orderId);
  }
}

// Instance globale
let orderManager = null;

function initOrderManagement(whatsappNumber = '+221771234567') {
  orderManager = new OrderManagement(whatsappNumber);
  console.log('✓ Gestion des commandes initialisée');
}

function showPaymentLoader(show) {
  let loader = document.getElementById('payment-loader');

  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'payment-loader';
    loader.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 11000;
      backdrop-filter: blur(4px);
    `;
    loader.innerHTML = `
      <div style="background: white; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="width: 50px; height: 50px; border: 4px solid #f0f0f0; border-top-color: var(--green); border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
        <p style="color: var(--text); font-weight: 600; font-size: 16px; margin: 0;">Préparation de votre commande...</p>
        <p style="color: var(--muted); font-size: 13px; margin: 8px 0 0;">Veuillez patienter</p>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;
    document.body.appendChild(loader);
  }

  loader.style.display = show ? 'flex' : 'none';
}

function showPaymentOptions(orderData) {
  let modal = document.getElementById('payment-modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 11000;
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 500px;">
      <h2 style="color: var(--text); margin-top: 0; font-size: 1.5rem;">💳 Choisir un mode de paiement</h2>
      <p style="color: var(--muted); margin-bottom: 24px;">Votre commande a été confirmée. Choisissez votre mode de paiement:</p>
      
      <div style="display: flex; gap: 16px; justify-content: center;">
        <button onclick="proceedPayment('wave', '${JSON.stringify(orderData).replace(/'/g, "\\'").replace(/"/g, '\\"')}')" style="
          background: #1E88E5;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#1565C0'" onmouseout="this.style.background='#1E88E5'">
          💰 Wave
        </button>
        
        <button onclick="proceedPayment('om', '${JSON.stringify(orderData).replace(/'/g, "\\'").replace(/"/g, '\\"')}')" style="
          background: #FF6B35;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.background='#E55100'" onmouseout="this.style.background='#FF6B35'">
          🏪 Orange Money
        </button>
      </div>
      
      <button onclick="closePaymentModal()" style="
        background: transparent;
        border: none;
        color: var(--muted);
        margin-top: 16px;
        cursor: pointer;
        font-size: 14px;
      ">Fermer</button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function proceedPayment(method, orderDataStr) {
  const orderData = JSON.parse(orderDataStr);
  closePaymentModal();
  orderData.paymentMethod = method;
  orderManager.redirectToPayment(method, orderData);
}

function generateOrderId() {
  return 'CT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

function formatAmount(amount) {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
}