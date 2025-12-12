// cashier-orders.js - Script for Cashier Orders Page

let currentFilter = 'all';

function loadCashierOrdersPage() {
    const userInfo = getUserInfo();
    document.getElementById('cashierName').textContent = userInfo.name;
    
    updateOrderCounts();
    loadOrdersGrid();
    
    // Setup payment method listener
    setupPaymentListeners();
}

function updateOrderCounts() {
    const orders = DB.getOrders();
    const pending = orders.filter(o => o.status === 'pending');
    const processing = orders.filter(o => o.status === 'processing');
    const all = [...pending, ...processing];
    
    document.getElementById('countAll').textContent = all.length;
    document.getElementById('countPending').textContent = pending.length;
    document.getElementById('countProcessing').textContent = processing.length;
}

function filterOrders(status) {
    currentFilter = status;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${status}"]`).classList.add('active');
    
    loadOrdersGrid();
}

function loadOrdersGrid() {
    const orders = DB.getOrders();
    let filtered;
    
    if (currentFilter === 'all') {
        filtered = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    } else {
        filtered = orders.filter(o => o.status === currentFilter);
    }
    
    filtered = filtered.reverse();
    
    const grid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    filtered.forEach(order => {
        const orderCard = createOrderCard(order);
        grid.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;';
    
    const statusColor = order.status === 'pending' ? '#F39C12' : '#3498DB';
    const timeDiff = getTimeDiff(order.createdAt);
    
    card.innerHTML = `
        <div style="background: ${statusColor}; color: white; padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0;">${order.orderNumber}</h3>
                <span style="background: rgba(255,255,255,0.3); padding: 5px 12px; border-radius: 15px; font-size: 0.9rem;">
                    ${timeDiff}
                </span>
            </div>
            <div style="font-size: 1.1rem;">
                🪑 Meja ${order.tableNumber}
            </div>
        </div>
        
        <div style="padding: 20px;">
            <!-- Order Items -->
            <div style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px; color: var(--dark-color);">Item Pesanan:</h4>
                <div style="max-height: 150px; overflow-y: auto;">
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--light-color); font-size: 0.95rem;">
                            <span>${item.name} <strong>x${item.quantity}</strong></span>
                            <span style="color: var(--gray-color);">${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Total -->
            <div style="background: var(--light-color); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 1.1rem; font-weight: 600;">Total Bayar:</span>
                    <span style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">
                        ${formatCurrency(order.total)}
                    </span>
                </div>
            </div>
            
            ${order.notes ? `
                <div style="background: rgba(255, 107, 53, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem;">
                    <strong>📝 Catatan:</strong> ${order.notes}
                </div>
            ` : ''}
            
            <!-- Action Button -->
            <button onclick="showPaymentModal(${order.id})" class="btn btn-success btn-block" style="font-size: 1.1rem; padding: 12px;">
                💰 Proses Pembayaran
            </button>
        </div>
    `;
    
    return card;
}

function showPaymentModal(orderId) {
    const order = DB.getOrderById(orderId);
    
    document.getElementById('paymentOrderId').value = order.id;
    document.getElementById('paymentOrderNumber').textContent = order.orderNumber;
    document.getElementById('paymentTable').textContent = 'Meja ' + order.tableNumber;
    document.getElementById('paymentTotal').textContent = formatCurrency(order.total);
    
    // Load items
    const itemsDiv = document.getElementById('paymentItems');
    itemsDiv.innerHTML = '';
    order.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--light-color);';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        `;
        itemsDiv.appendChild(itemDiv);
    });
    
    // Reset form
    document.getElementById('paymentMethod').value = '';
    document.getElementById('cashReceived').value = '';
    document.getElementById('changeAmount').textContent = 'Rp 0';
    document.getElementById('cashPaymentDiv').style.display = 'none';
    
    document.getElementById('paymentModal').style.display = 'flex';
}

function setupPaymentListeners() {
    const paymentMethod = document.getElementById('paymentMethod');
    const cashReceived = document.getElementById('cashReceived');
    
    if (paymentMethod) {
        paymentMethod.addEventListener('change', function() {
            const cashDiv = document.getElementById('cashPaymentDiv');
            if (this.value === 'cash') {
                cashDiv.style.display = 'block';
                document.getElementById('cashReceived').required = true;
            } else {
                cashDiv.style.display = 'none';
                document.getElementById('cashReceived').required = false;
            }
        });
    }
    
    if (cashReceived) {
        cashReceived.addEventListener('input', function() {
            const totalText = document.getElementById('paymentTotal').textContent;
            const total = parseFloat(totalText.replace(/[^0-9]/g, ''));
            const received = parseFloat(this.value) || 0;
            const change = received - total;
            
            const changeEl = document.getElementById('changeAmount');
            if (change < 0) {
                changeEl.textContent = 'Kurang: ' + formatCurrency(Math.abs(change));
                changeEl.style.color = 'var(--danger-color)';
            } else {
                changeEl.textContent = formatCurrency(change);
                changeEl.style.color = 'var(--success-color)';
            }
        });
    }
}

function processPayment() {
    const orderId = parseInt(document.getElementById('paymentOrderId').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!paymentMethod) {
        alert('Pilih metode pembayaran!');
        return;
    }
    
    // Validate cash payment
    if (paymentMethod === 'cash') {
        const order = DB.getOrderById(orderId);
        const cashReceived = parseFloat(document.getElementById('cashReceived').value) || 0;
        
        if (!cashReceived) {
            alert('Masukkan jumlah uang yang diterima!');
            return;
        }
        
        if (cashReceived < order.total) {
            alert('Uang yang diterima kurang dari total pembayaran!');
            return;
        }
        
        const change = cashReceived - order.total;
        if (change > 0) {
            const confirmMsg = `Kembalian: ${formatCurrency(change)}\n\nProses pembayaran?`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }
    }
    
    // Confirm payment
    if (!confirm('Konfirmasi pembayaran ini?')) {
        return;
    }
    
    // Update order
    DB.updateOrder(orderId, {
        status: 'completed',
        paymentMethod: paymentMethod,
        completedAt: new Date().toISOString(),
        completedBy: getUserInfo().name
    });
    
    // Free table
    const order = DB.getOrderById(orderId);
    DB.updateTable(order.tableId, { status: 'available' });
    
    alert('✓ Pembayaran berhasil diproses!');
    closeModal('paymentModal');
    loadCashierOrdersPage();
}

function getTimeDiff(dateString) {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return diffMins + ' menit lalu';
    
    const diffHours = Math.floor(diffMins / 60);
    return diffHours + ' jam lalu';
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
