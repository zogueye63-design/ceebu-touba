/* CEEBU TOUBA — paytech-integration.js */
/* Intégration Paytech pour les paiements */

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


      const response = await fetch(`${this.baseUrl}/request-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.apiKey,
          'API-SECRET': this.secretKey
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur Paytech: ${response.status}`);
      }

      const result = await response.json();
      this.saveOrder(orderData, result.token);

      return {
        success: true,
        token: result.token,
        redirectUrl: result.redirect_url || `${this.baseUrl}/checkout/${result.token}`,
        orderId: orderData.orderId
      };

    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

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
    const order = {
      id: orderData.orderId,
      token: token,
      customer: {
        name: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address
      },
      items: orderData.items,
      amount: orderData.amount,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const orders = JSON.parse(localStorage.getItem('ceebu_orders') || '[]');
    orders.push(order);
    localStorage.setItem('ceebu_orders', JSON.stringify(orders));

    return order;
  }

  checkOrderStatus(token) {
    const orders = JSON.parse(localStorage.getItem('ceebu_orders') || '[]');
    return orders.find(order => order.token === token);
  }

  validateIPN(data, signature) {
    const hash = this.generateSignature(data);
    return hash === signature;
  }

  generateSignature(data) {
    const message = JSON.stringify(data) + this.secretKey;
    return btoa(message);
  }
}

let paytech = null;

function initPaytech(apiKey, secretKey) {
  paytech = new PaytechPayment(apiKey, secretKey);
  console.log('✓ Paytech initialisé en mode', paytech.testMode ? 'TEST' : 'PRODUCTION');
}

async function processPayment(orderData) {
  if (!paytech) {
    console.error('Paytech non initialisé!');
    return { success: false, error: 'Paytech non configuré' };
  }

  showPaymentLoader(true);
  const result = await paytech.createPaymentRequest(orderData);
  showPaymentLoader(false);

  if (result.success) {
    window.location.href = result.redirectUrl;
  } else {
    alert(`Erreur: ${result.error}`);
  }

  return result;
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
        <p style="color: var(--text); font-weight: 600; font-size: 16px; margin: 0;">Traitement du paiement...</p>
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