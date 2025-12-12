// waiter-orders.js - Waiter Orders Page Script

let currentStatusFilter = 'all';

function loadWaiterOrdersPage() {
    const userInfo = getUserInfo();
    document.getElementById('waiterName').textContent = userInfo.name;
    
    updateOrderCounts();
    loadOrdersGrid();
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

function filterStatus(status) {
    currentStatusFilter = status;
    
    // Update active button
    document.querySelectorAll('[data-status]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    loadOrdersGrid();
}

function loadOrdersGrid() {
    const orders = DB.getOrders();
    let filtered;
    
    if (currentStatusFilter === 'all') {
        filtered = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    } else {
        filtered = orders.filter(o => o.status === currentStatusFilter);
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
    card.style.cssText = 'box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; transition: transform 0.3s;';
    card.onmouseover = function() { this.style.transform = 'translateY(-5px)'; };
    card.onmouseout = function() { this.style.transform = 'translateY(0)'; };
    
    const statusColor = order.status === 'pending' ? '#F39C12' : '#3498DB';
    const statusIcon = order.status === 'pending' ? '⏳' : '🔄';
    const timeDiff = getTimeDiff(order.createdAt);
    const isUrgent = getMinutesDiff(order.createdAt) > 15;
    
    card.innerHTML = `
        <div style="background: ${statusColor}; color: white; padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0;">${statusIcon} ${order.orderNumber}</h3>
                <span style="background: ${isUrgent ? '#E74C3C' : 'rgba(255,255,255,0.3)'}; padding: 5px 12px; border-radius: 15px; font-size: 0.9rem; font-weight: 600;">
                    ${timeDiff}
                </span>
            </div>
            <div style="font-size: 1.2rem; font-weight: 600;">
                🪑 Meja ${order.tableNumber}
            </div>
        </div>
        
        <div style="padding: 20px;">
            <!-- Order Items Summary -->
            <div style="margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px; color: var(--dark-color);">Item Pesanan (${order.items.length}):</h4>
                <div style="background: var(--light-color); padding: 12px; border-radius: 8px; max-height: 120px; overflow-y: auto;">
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.95rem;">
                            <span>• ${item.name}</span>
                            <strong>x${item.quantity}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${order.notes ? `
                <div style="background: rgba(255, 107, 53, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; border-left: 3px solid var(--primary-color);">
                    <strong>💬 Catatan:</strong> ${order.notes}
                </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px;">
                <button onclick="viewOrderDetail(${order.id})" class="btn btn-primary" style="flex: 1;">
                    👁️ Detail
                </button>
                ${order.status === 'pending' ? `
                    <button onclick="quickUpdate(${order.id}, 'processing')" class="btn btn-success" style="flex: 1;">
                        ▶️ Proses
                    </button>
                ` : `
                    <button onclick="quickUpdate(${order.id}, 'completed')" class="btn btn-success" style="flex: 1;">
                        ✓ Selesai
                    </button>
                `}
            </div>
        </div>
    `;
    
    return card;
}

function viewOrderDetail(orderId) {
    const order = DB.getOrderById(orderId);
    
    document.getElementById('currentOrderId').value = orderId;
    document.getElementById('detailOrderNumber').textContent = order.orderNumber;
    document.getElementById('detailTableNumber').textContent = 'Meja ' + order.tableNumber;
    document.getElementById('detailTime').textContent = formatDateTime(order.createdAt);
    document.getElementById('detailOrderStatus').innerHTML = `<span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>`;
    document.getElementById('detailTotal').textContent = formatCurrency(order.total);
    
    // Load items
    const itemsDiv = document.getElementById('detailOrderItems');
    itemsDiv.innerHTML = '';
    order.items.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid var(--light-color); background: var(--light-color); border-radius: 5px; margin-bottom: 8px;';
        div.innerHTML = `
            <div>
                <div style="font-weight: 600; margin-bottom: 3px;">${item.name}</div>
                <div style="font-size: 0.9rem; color: var(--gray-color);">${formatCurrency(item.price)} x ${item.quantity}</div>
            </div>
            <div style="font-weight: bold; color: var(--primary-color);">
                ${formatCurrency(item.price * item.quantity)}
            </div>
        `;
        itemsDiv.appendChild(div);
    });
    
    // Show notes if any
    if (order.notes) {
        document.getElementById('detailNotesText').textContent = order.notes;
        document.getElementById('detailNotes').style.display = 'block';
    } else {
        document.getElementById('detailNotes').style.display = 'none';
    }
    
    // Show appropriate action buttons
    const btnProcessing = document.getElementById('btnProcessing');
    const btnCompleted = document.getElementById('btnCompleted');
    
    if (order.status === 'pending') {
        btnProcessing.style.display = 'inline-block';
        btnCompleted.style.display = 'none';
    } else if (order.status === 'processing') {
        btnProcessing.style.display = 'none';
        btnCompleted.style.display = 'inline-block';
    } else {
        btnProcessing.style.display = 'none';
        btnCompleted.style.display = 'none';
    }
    
    document.getElementById('orderDetailModal').style.display = 'flex';
}

function quickUpdate(orderId, newStatus) {
    if (newStatus === 'completed') {
        if (!confirm('Tandai pesanan ini sudah selesai dan diantar?')) {
            return;
        }
    }
    
    DB.updateOrder(orderId, { status: newStatus });
    
    // If completed, free the table
    if (newStatus === 'completed') {
        const order = DB.getOrderById(orderId);
        DB.updateTable(order.tableId, { status: 'available' });
    }
    
    loadWaiterOrdersPage();
}

function updateStatus(newStatus) {
    const orderId = parseInt(document.getElementById('currentOrderId').value);
    quickUpdate(orderId, newStatus);
    closeModal('orderDetailModal');
}

function getTimeDiff(dateString) {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return diffMins + ' menit';
    
    const diffHours = Math.floor(diffMins / 60);
    const remainMins = diffMins % 60;
    return diffHours + 'j ' + remainMins + 'm';
}

function getMinutesDiff(dateString) {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now - orderTime;
    return Math.floor(diffMs / 60000);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Menunggu',
        'processing': 'Sedang Diproses',
        'completed': 'Selesai'
    };
    return statusMap[status] || status;
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}