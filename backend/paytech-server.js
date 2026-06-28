const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY;
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET;

// Route pour créer une requête de paiement
app.post('/api/payment/request', async (req, res) => {
  try {
    const { orderId, amount, email, phone, items } = req.body;

    const paymentData = {
      item_name: `Commande Ceebu Touba - ${orderId}`,
      item_price: amount,
      currency: 'XOF',
      description: `${items.length} produit(s) - Total: ${amount} FCFA`,
      notify_url: `${process.env.FRONTEND_URL}/callback.html?action=notify`,
      cancel_url: `${process.env.FRONTEND_URL}/callback.html?action=cancel`,
      return_url: `${process.env.FRONTEND_URL}/callback.html?action=success`,
      id_user: `CUST_${Date.now()}`,
    };

    const response = await fetch('https://paytech.sn/api/payment/request-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': PAYTECH_API_KEY,
        'API-SECRET': PAYTECH_API_SECRET,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.success) {
      res.json({
        success: true,
        token: result.token,
        redirectUrl: result.redirect_url,
      });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error) {
    console.error('Erreur Paytech:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour vérifier le statut
app.post('/api/payment/check', async (req, res) => {
  try {
    const { token } = req.body;

    const response = await fetch('https://paytech.sn/api/payment/check-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': PAYTECH_API_KEY,
        'API-SECRET': PAYTECH_API_SECRET,
      },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));