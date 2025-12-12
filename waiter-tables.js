// waiter-tables.js - Table Status Page Script

let currentTableFilter = 'all';
let currentTableOrderId = null;

function loadTableStatusPage() {
    const userInfo = getUserInfo();
    document.getElementById('waiterName').textContent = userInfo.name;
    
    updateTableStats();
    loadTablesGrid();
}

function updateTableStats() {
    const tables = DB.getTables();
    
    const available = tables.filter(t => t.status === 'available');
    const occupied = tables.filter(t => t.status === 'occupied');
    const reserved = tables.filter(t => t.status === 'reserved');
    
    document.getElementById('totalTables').textContent = tables.length;
    document.getElementById('availableTables').textContent = available.length;
    document.getElementById('occupiedTables').textContent = occupied.length;
    document.getElementById('reservedTables').textContent = reserved.length;
}

function filterTables(status) {
    currentTableFilter = status;
    
    // Update active button
    document.querySelectorAll('[data-table-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-table-filter="${status}"]`).classList.add('active');
    
    loadTablesGrid();
}

function loadTablesGrid() {
    const tables = DB.getTables();
    let filtered;
    
    if (currentTableFilter === 'all') {
        filtered = tables;
    } else {
        filtered = tables.filter(t => t.status === currentTableFilter);
    }
    
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '';
    
    filtered.forEach(table => {
        const tableCard = createTableCard(table);
        grid.appendChild(tableCard);
    });
}

function createTableCard(table) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;';
    card.onclick = () => showTableDetail(table.id);
    card.onmouseover = function() { 
        this.style.transform = 'translateY(-5px)'; 
        this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
    };
    card.onmouseout = function() { 
        this.style.transform = 'translateY(0)'; 
        this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    };
    
    const statusColors = {
        'available': '#27AE60',
        'occupied': '#E74C3C',
        'reserved': '#F39C12'
    };
    
    const statusIcons = {
        'available': '✓',
        'occupied': '✗',
        'reserved': '⏰'
    };
    
    const statusTexts = {
        'available': 'Tersedia',
        'occupied': 'Terisi',
        'reserved': 'Dipesan'
    };
    
    const color = statusColors[table.status];
    const icon = statusIcons[table.status];
    const statusText = statusTexts[table.status];
    
    // Get active order for this table
    const orders = DB.getOrders();
    const activeOrder = orders.find(o => 
        o.tableId === table.id && 
        (o.status === 'pending' || o.status === 'processing')
    );
    
    card.innerHTML = `
        <div style="background: ${color}; color: white; padding: 20px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🪑</div>
            <h2 style="font-size: 2rem; margin: 0;">Meja ${table.number}</h2>
        </div>
        
        <div style="padding: 20px; text-align: center;">
            <div style="margin-bottom: 15px;">
                <div style="color: var(--gray-color); font-size: 0.9rem; margin-bottom: 5px;">Kapasitas</div>
                <div style="font-size: 1.3rem; font-weight: 600;">
                    👥 ${table.capacity} orang
                </div>
            </div>
            
            <div style="background: ${color}; background: rgba(${color === '#27AE60' ? '39, 174, 96' : color === '#E74C3C' ? '231, 76, 60' : '243, 156, 18'}, 0.1); padding: 12px; border-radius: 10px; margin-bottom: 15px;">
                <div style="font-size: 1.5rem; margin-bottom: 5px;">${icon}</div>
                <div style="color: ${color}; font-weight: 600; font-size: 1.1rem;">${statusText}</div>
            </div>
            
            ${activeOrder ? `
                <div style="background: rgba(52, 152, 219, 0.1); padding: 12px; border-radius: 8px; border-left: 3px solid #3498DB; text-align: left; font-size: 0.9rem;">
                    <div style="margin-bottom: 5px;">
                        <strong>Pesanan:</strong> ${activeOrder.orderNumber}
                    </div>
                    <div style="color: var(--primary-color); font-weight: 600;">
                        ${formatCurrency(activeOrder.total)}
                    </div>
                </div>
            ` : `
                <div style="color: var(--gray-color); font-size: 0.9rem; padding: 12px;">
                    ${table.status === 'available' ? 'Siap menerima pesanan' : 'Tidak ada pesanan aktif'}
                </div>
            `}
        </div>
    `;
    
    return card;
}

function showTableDetail(tableId) {
    const table = DB.getTableById(tableId);
    const orders = DB.getOrders();
    const activeOrder = orders.find(o => 
        o.tableId === tableId && 
        (o.status === 'pending' || o.status === 'processing')
    );
    
    document.getElementById('currentTableId').value = tableId;
    currentTableOrderId = activeOrder ? activeOrder.id : null;
    
    // Table info
    document.getElementById('modalTableNumber').textContent = `Meja ${table.number}`;
    document.getElementById('modalTableCapacity').textContent = `${table.capacity} orang`;
    document.getElementById('modalTableStatusText').textContent = getTableStatusText(table.status);
    
    // Status badge
    const statusBadge = document.getElementById('modalTableStatus');
    const statusColors = {
        'available': '#27AE60',
        'occupied': '#E74C3C',
        'reserved': '#F39C12'
    };
    statusBadge.textContent = getTableStatusText(table.status);
    statusBadge.style.background = `rgba(${statusColors[table.status] === '#27AE60' ? '39, 174, 96' : statusColors[table.status] === '#E74C3C' ? '231, 76, 60' : '243, 156, 18'}, 0.2)`;
    statusBadge.style.color = statusColors[table.status];
    
    // Order info
    if (activeOrder) {
        document.getElementById('orderNumber').textContent = activeOrder.orderNumber;
        document.getElementById('orderTotal').textContent = formatCurrency(activeOrder.total);
        document.getElementById('orderStatus').innerHTML = `<span class="status-badge status-${activeOrder.status}">${getStatusText(activeOrder.status)}</span>`;
        document.getElementById('activeOrderInfo').style.display = 'block';
        document.getElementById('noOrderInfo').style.display = 'none';
    } else {
        document.getElementById('activeOrderInfo').style.display = 'none';
        document.getElementById('noOrderInfo').style.display = 'block';
    }
    
    document.getElementById('tableDetailModal').style.display = 'flex';
}

function viewOrderFromTable() {
    if (currentTableOrderId) {
        closeModal('tableDetailModal');
        // Redirect to orders page with order detail
        window.location.href = `waiter-orders.html?orderId=${currentTableOrderId}`;
    }
}

function getTableStatusText(status) {
    const statusMap = {
        'available': '✓ Tersedia',
        'occupied': '✗ Terisi',
        'reserved': '⏰ Dipesan'
    };
    return statusMap[status] || status;
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

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentTableOrderId = null;
}