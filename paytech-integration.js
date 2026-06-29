/* CEEBU TOUBA — paytech-integration.js */
/* Intégration WhatsApp pour les commandes */

<<<<<<< HEAD
class PaytechPayment {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://paytech.sn/api/payment';
   this.testMode = false; // Production mode activé
  }

  async createPaymentRequest(orderData) {
  try {
    const response = await fetch('https://ton-backend.com/api/payment/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        token: result.token,
        redirectUrl: result.redirectUrl,
        orderId: orderData.orderId,
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error: error.message };
  }

=======
class OrderManagement {
  constructor(whatsappNumber = '+221778552550') {
    this.whatsappNumber = whatsappNumber;
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
>>>>>>> d0703823c36593ef8477dbf15d28175d2e61a62d

*Produits:*
${items}

<<<<<<< HEAD
      if (!response.ok) {
        throw new Error(`Erreur Paytech: ${response.status}`);
      }
=======
*Montant:*
Sous-total: ${orderData.subtotal.toLocaleString('fr-SN')} FCFA
Livraison: ${orderData.shippingCost.toLocaleString('fr-SN')} FCFA
*Total: ${orderData.total.toLocaleString('fr-SN')} FCFA*
>>>>>>> d0703823c36593ef8477dbf15d28175d2e61a62d

*Client:*
Nom: ${orderData.customerName}
Email: ${orderData.email}
Téléphone: ${orderData.phone}

*Adresse de Livraison:*
${orderData.address}

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
    const phoneNumber = this.whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    this.saveOrder(orderData);
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

<<<<<<< HEAD
  simulatePaymentResponse(paymentData) {
    const token = this.generateToken();
    const testPayments = JSON.parse(localStorage.getItem('test_payments') || '{}');
    testPayments[token] = {
      ...paymentData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    localStorage.setItem('test_payments', JSON.stringify(testPayments));

    return {
      success: true,
      token: token,
      redirectUrl: `checkout-test.html?token=${token}`,
      orderId: paymentData.metadata.orderId,
      isTestMode: true
    };
  }

  generateToken() {
    return 'TEST_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  }

  saveOrder(orderData, token) {
=======
  saveOrder(orderData) {
>>>>>>> d0703823c36593ef8477dbf15d28175d2e61a62d
    const order = {
      id: orderData.orderId,
      customer: {
        name: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address
      },
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost,
      total: orderData.total,
      delivery: orderData.delivery,
      message: orderData.message,
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
    return orders.find(o => o.id === orderId);
  }


const orderManager = new OrderManagement('+221778552550');

function initOrderManagement(whatsappNumber) {
  const manager = new OrderManagement(whatsappNumber);
  window.orderManager = manager;
}

function generateOrderId() {
  return 'CMD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
