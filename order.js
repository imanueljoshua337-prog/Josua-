// order-firebase.js - Script untuk halaman pemesanan dengan Firebase

let cart = [];
let settings = {};

document.addEventListener('DOMContentLoaded', async function() {
    // Cek apakah meja sudah dipilih
    const selectedTable = sessionStorage.getItem('selectedTableNumber');
    if (!selectedTable) {
        alert('Silakan pilih meja terlebih dahulu');
        window.location.href = 'index-firebase.html';
        return;
    }

    await loadSettings();
    loadRestaurantName();
    displayTableNumber();
    loadMenus();
    setupCategoryFilter();
});

async function loadSettings() {
    settings = await FirebaseDB.getSettings();
    document.getElementById('taxPercent').textContent = settings.taxPercent;
    document.getElementById('servicePercent').textContent = settings.serviceChargePercent;
}

function loadRestaurantName() {
    // Listen for realtime updates
    FirebaseDB.listenSettings(newSettings => {
        if (newSettings) {
            document.getElementById('restaurantName').textContent = newSettings.restaurantName;
        }
    });
}

function displayTableNumber() {
    const tableNumber = sessionStorage.getItem('selectedTableNumber');
    document.getElementById('tableNumber').textContent = tableNumber;
}

function loadMenus(category = 'all') {
    // Listen for realtime menu updates
    FirebaseDB.listenMenus(menus => {
        const menuList = document.getElementById('menuList');
        menuList.innerHTML = '';
        
        const filteredMenus = category === 'all' 
            ? menus.filter(m => m.available)
            : menus.filter(m => m.available && m.category === category);
        
        if (filteredMenus.length === 0) {
            menuList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-color);">Tidak ada menu tersedia</div>';
            return;
        }
        
        filteredMenus.forEach(menu => {
            const menuCard = document.createElement('div');
            menuCard.className = 'menu-card';
            
            menuCard.innerHTML = `
                <div class="menu-image" style="background-image: url('${menu.image}')"></div>
                <div class="menu-info">
                    <h3>${menu.name}</h3>
                    <p class="menu-category">${menu.category}</p>
                    <p class="menu-price">${formatCurrency(menu.price)}</p>
                    <button class="btn btn-primary btn-sm" onclick="addToCart('${menu.id}', '${menu.name}', ${menu.price})">
                        + Tambah
                    </button>
                </div>
            `;
            
            menuList.appendChild(menuCard);
        });
    });
}

function setupCategoryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            loadMenus(category);
        });
    });
}

function addToCart(menuId, menuName, menuPrice) {
    const existingItem = cart.find(item => item.id === menuId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: menuId,
            name: menuName,
            price: menuPrice,
            quantity: 1
        });
    }
    
    updateCart();
}

function removeFromCart(menuId) {
    cart = cart.filter(item => item.id !== menuId);
    updateCart();
}

function updateQuantity(menuId, change) {
    const item = cart.find(item => item.id === menuId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(menuId);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartActions = document.getElementById('cartActions');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>🛒 Keranjang masih kosong</p></div>';
        cartSummary.style.display = 'none';
        cartActions.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)}</p>
            </div>
            <div class="cart-item-controls">
                <button class="btn-qty" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="qty">${item.quantity}</span>
                <button class="btn-qty" onclick="updateQuantity('${item.id}', 1)">+</button>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')">🗑️</button>
            </div>
            <div class="cart-item-total">
                ${formatCurrency(item.price * item.quantity)}
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * (settings.taxPercent / 100);
    const service = subtotal * (settings.serviceChargePercent / 100);
    const total = subtotal + tax + service;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('service').textContent = formatCurrency(service);
    document.getElementById('total').textContent = formatCurrency(total);
    
    cartSummary.style.display = 'block';
    cartActions.style.display = 'block';
}

async function placeOrder() {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    
    const tableId = sessionStorage.getItem('selectedTable');
    const tableNumber = sessionStorage.getItem('selectedTableNumber');
    const notes = document.getElementById('orderNotes').value;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * (settings.taxPercent / 100);
    const service = subtotal * (settings.serviceChargePercent / 100);
    const total = subtotal + tax + service;
    
    const order = {
        tableId: tableId,
        tableNumber: tableNumber,
        items: cart,
        subtotal: subtotal,
        tax: tax,
        service: service,
        total: total,
        notes: notes,
        status: 'pending'
    };
    
    try {
        // Show loading
        const btn = event.target;
        btn.disabled = true;
        btn.textContent = 'Memproses...';
        
        // Add order to Firebase
        const savedOrder = await FirebaseDB.addOrder(order);
        
        // Update table status
        await FirebaseDB.updateTable(tableId, { status: 'occupied' });
        
        // Save order ID to session
        sessionStorage.setItem('lastOrderId', savedOrder.id);
        
        // Redirect to success page
        window.location.href = 'success-firebase.html';
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Terjadi kesalahan saat memesan. Silakan coba lagi.');
        btn.disabled = false;
        btn.textContent = 'Pesan Sekarang';
    }
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}
