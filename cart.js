/* CEEBU TOUBA — cart.js */
/* Gestion du panier avec localStorage */

class ShoppingCart {
  constructor() {
    this.cartKey = 'ceebu_touba_cart';
    this.loadCart();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.cartKey);
      this.items = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.items = [];
    }
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.items));
    this.notifyObservers();
  }

  addItem(product) {
    const existingItem = this.items.find(
      item => item.id === product.id && item.weight === product.weight
    );

    if (existingItem) {
      existingItem.quantity += product.quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        weight: product.weight,
        quantity: product.quantity,
        image: product.image
      });
    }

    this.saveCart();
    return true;
  }

  removeItem(id, weight) {
    this.items = this.items.filter(item => !(item.id === id && item.weight === weight));
    this.saveCart();
  }

  updateQuantity(id, weight, quantity) {
    const item = this.items.find(item => item.id === id && item.weight === weight);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCart();
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  getItems() {
    return this.items;
  }

  observers = [];

  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this));
  }
}

// Instance globale du panier
const cart = new ShoppingCart();

// Fonction pour ajouter un produit au panier
function addToCart(productId) {
  const productType = productId === 'touba' ? 'touba' : 'walo';
  
  // Récupérer les infos du produit
  const products = {
    touba: {
      id: 'touba',
      name: 'Riz Long Premium',
      weight: document.querySelector(`#product-${productType} .weight-btn.active`)?.textContent.trim() || '25 kg',
      price: parseInt(
        document.querySelector(`#prix-${productType}`)?.textContent.match(/\d+/)?.[0] || '12500'
      ),
      quantity: parseInt(document.querySelector(`#qty-${productType}`)?.textContent) || 1,
      image: 'images/result.png'
    },
    walo: {
      id: 'walo',
      name: 'Riz Brisé Premium',
      weight: document.querySelector(`#product-${productType} .weight-btn.active`)?.textContent.trim() || '25 kg',
      price: parseInt(
        document.querySelector(`#prix-${productType}`)?.textContent.match(/\d+/)?.[0] || '10500'
      ),
      quantity: parseInt(document.querySelector(`#qty-${productType}`)?.textContent) || 1,
      image: 'images/result (1).png'
    }
  };

  const product = products[productType];

  if (cart.addItem(product)) {
    // Animation de confirmation
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Ajouté au panier!';
    btn.style.background = 'var(--green)';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);

    // Afficher le panier
    showCartNotification();
  }
}

// Notification du panier
function showCartNotification() {
  let notification = document.getElementById('cart-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'cart-notification';
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--green);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    document.body.appendChild(notification);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const itemCount = cart.getItemCount();
  notification.innerHTML = `
    🛒 ${itemCount} article(s) dans le panier
    <a href="checkout.html" style="color:white; text-decoration:underline; margin-left:auto; cursor:pointer;">Voir →</a>
  `;
  notification.style.animation = 'slideIn 0.3s ease';

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.style.display = 'none', 300);
  }, 5000);
}

// Mettre à jour les boutons au chargement
document.addEventListener('DOMContentLoaded', () => {
  updateCartButtons();
  cart.subscribe(updateCartButtons);
});

function updateCartButtons() {
  const cartCount = cart.getItemCount();
  let badge = document.getElementById('cart-badge');
  
  if (cartCount > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'cart-badge';
      badge.style.cssText = `
        position: fixed;
        top: 75px;
        right: 20px;
        background: var(--red);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        z-index: 9999;
      `;
      document.body.appendChild(badge);
    }
    badge.textContent = cartCount;
    badge.style.display = 'flex';
  } else if (badge) {
    badge.style.display = 'none';
  }
}