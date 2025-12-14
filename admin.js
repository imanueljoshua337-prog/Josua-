// admin-firebase.js - Admin Panel Scripts with Firebase Realtime

// Dashboard Functions
function loadDashboard() {
    // Listen for realtime statistics updates
    FirebaseDB.listenOrders(orders => {
        updateDashboardStats(orders);
        loadRecentOrders(orders);
    });
}

function updateDashboardStats(orders) {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
    );
    
    const stats = {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0),
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)
    };
    
    if (document.getElementById('totalOrders')) {
        document.getElementById('totalOrders').textContent = stats.totalOrders;
    }
    if (document.getElementById('completedOrders')) {
        document.getElementById('completedOrders').textContent = stats.completedOrders;
    }
    if (document.getElementById('pendingOrders')) {
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    }
    if (document.getElementById('totalRevenue')) {
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    }
    if (document.getElementById('todayOrders')) {
        document.getElementById('todayOrders').textContent = stats.todayOrders;
    }
    if (document.getElementById('todayRevenue')) {
        document.getElementById('todayRevenue').textContent = formatCurrency(stats.todayRevenue);
    }
}

function loadRecentOrders(orders) {
    const recentOrders = orders.slice(-5).reverse();
    const tbody = document.getElementById('recentOrders');
    
    if (!tbody) return;
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada pesanan</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    recentOrders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>Meja ${order.tableNumber}</td>
            <td>${formatCurrency(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDateTime(order.createdAt)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Menu Management Functions - Realtime
function loadMenuList() {
    FirebaseDB.listenMenus(menus => {
        const tbody = document.getElementById('menuList');
        
        if (!tbody) return;
        
        if (menus.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada menu</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        menus.forEach(menu => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${menu.id}</td>
                <td>${menu.name}</td>
                <td>${menu.category}</td>
                <td>${formatCurrency(menu.price)}</td>
                <td><span class="badge ${menu.available ? 'badge-success' : 'badge-danger'}">${menu.available ? 'Tersedia' : 'Habis'}</span></td>
                <td>
                    <button onclick="editMenu('${menu.id}')" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="deleteMenu('${menu.id}')" class="btn btn-sm btn-danger">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function showAddMenuForm() {
    document.getElementById('menuFormTitle').textContent = 'Tambah Menu Baru';
    document.getElementById('menuForm').reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuModal').style.display = 'flex';
}

async function editMenu(id) {
    const menu = await FirebaseDB.getMenuById(id);
    document.getElementById('menuFormTitle').textContent = 'Edit Menu';
    document.getElementById('menuId').value = menu.id;
    document.getElementById('menuName').value = menu.name;
    document.getElementById('menuCategory').value = menu.category;
    document.getElementById('menuPrice').value = menu.price;
    document.getElementById('menuImage').value = menu.image;
    document.getElementById('menuAvailable').checked = menu.available;
    document.getElementById('menuModal').style.display = 'flex';
}

async function saveMenu(event) {
    event.preventDefault();
    
    const id = document.getElementById('menuId').value;
    const menuData = {
        name: document.getElementById('menuName').value,
        category: document.getElementById('menuCategory').value,
        price: parseInt(document.getElementById('menuPrice').value),
        image: document.getElementById('menuImage').value || 'assets/images/default.jpg',
        available: document.getElementById('menuAvailable').checked
    };
    
    try {
        if (id) {
            await FirebaseDB.updateMenu(id, menuData);
        } else {
            await FirebaseDB.addMenu(menuData);
        }
        
        closeModal('menuModal');
        // List will auto-update from realtime listener
    } catch (error) {
        console.error('Error saving menu:', error);
        alert('Terjadi kesalahan saat menyimpan menu');
    }
}

async function deleteMenu(id) {
    if (confirm('Yakin ingin menghapus menu ini?')) {
        try {
            await FirebaseDB.deleteMenu(id);
            // List will auto-update from realtime listener
        } catch (error) {
            console.error('Error deleting menu:', error);
            alert('Terjadi kesalahan saat menghapus menu');
        }
    }
}

// Table Management Functions - Realtime
function loadTableList() {
    FirebaseDB.listenTables(tables => {
        const tbody = document.getElementById('tableList');
        
        if (!tbody) return;
        
        if (tables.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada meja</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        tables.forEach(table => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${table.id}</td>
                <td>Meja ${table.number}</td>
                <td>${table.capacity} orang</td>
                <td><span class="status-badge status-${table.status}">${getTableStatusText(table.status)}</span></td>
                <td>
                    <button onclick="editTable('${table.id}')" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="deleteTable('${table.id}')" class="btn btn-sm btn-danger">Hapus</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function showAddTableForm() {
    document.getElementById('tableFormTitle').textContent = 'Tambah Meja Baru';
    document.getElementById('tableForm').reset();
    document.getElementById('tableId').value = '';
    document.getElementById('tableModal').style.display = 'flex';
}

async function editTable(id) {
    const table = await FirebaseDB.getTableById(id);
    document.getElementById('tableFormTitle').textContent = 'Edit Meja';
    document.getElementById('tableId').value = table.id;
    document.getElementById('tableNumber').value = table.number;
    document.getElementById('tableCapacity').value = table.capacity;
    document.getElementById('tableStatus').value = table.status;
    document.getElementById('tableModal').style.display = 'flex';
}

async function saveTable(event) {
    event.preventDefault();
    
    const id = document.getElementById('tableId').value;
    const tableData = {
        number: parseInt(document.getElementById('tableNumber').value),
        capacity: parseInt(document.getElementById('tableCapacity').value),
        status: document.getElementById('tableStatus').value
    };
    
    try {
        if (id) {
            await FirebaseDB.updateTable(id, tableData);
        } else {
            await FirebaseDB.addTable(tableData);
        }
        
        closeModal('tableModal');
    } catch (error) {
        console.error('Error saving table:', error);
        alert('Terjadi kesalahan saat menyimpan meja');
    }
}

async function deleteTable(id) {
    if (confirm('Yakin ingin menghapus meja ini?')) {
        try {
            await FirebaseDB.deleteTable(id);
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Terjadi kesalahan saat menghapus meja');
        }
    }
}

// Orders Management Functions - Realtime
let currentOrderFilter = 'active';

function loadOrdersList() {
    FirebaseDB.listenOrders(orders => {
        const reversedOrders = [...orders].reverse();
        const tbody = document.getElementById('ordersList');
        
        if (!tbody) return;
        
        // Update counts
        const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
        const completedOrders = orders.filter(o => o.status === 'completed');
        
        if (document.getElementById('countActive')) {
            document.getElementById('countActive').textContent = activeOrders.length;
        }
        if (document.getElementById('countCompleted')) {
            document.getElementById('countCompleted').textContent = completedOrders.length;
        }
        if (document.getElementById('countAll')) {
            document.getElementById('countAll').textContent = orders.length;
        }
        
        // Filter based on current filter
        let filtered;
        if (currentOrderFilter === 'active') {
            filtered = activeOrders;
        } else if (currentOrderFilter === 'completed') {
            filtered = completedOrders;
        } else {
            filtered = reversedOrders;
        }
        
        if (filtered.length === 0) {
            let emptyMessage = 'Tidak ada pesanan';
            if (currentOrderFilter === 'active') {
                emptyMessage = 'Tidak ada pesanan aktif';
            } else if (currentOrderFilter === 'completed') {
                emptyMessage = 'Belum ada pesanan selesai';
            }
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">${emptyMessage}</td></tr>`;
            return;
        }
        
        tbody.innerHTML = '';
        filtered.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.orderNumber}</td>
                <td>Meja ${order.tableNumber}</td>
                <td>${order.items.length} item</td>
                <td>${formatCurrency(order.total)}</td>
                <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                <td>${formatDateTime(order.createdAt)}</td>
                <td>
                    <button onclick="viewOrder('${order.id}')" class="btn btn-sm btn-primary">Detail</button>
                    ${order.status === 'pending' ? `<button onclick="updateOrderStatus('${order.id}', 'processing')" class="btn btn-sm btn-success">Proses</button>` : ''}
                    ${order.status === 'processing' ? `<button onclick="updateOrderStatus('${order.id}', 'completed')" class="btn btn-sm btn-success">Selesai</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function filterOrderStatus(status) {
    currentOrderFilter = status;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${status}"]`).classList.add('active');
    
    // Re-trigger the listener to refresh display
    loadOrdersList();
}

async function viewOrder(id) {
    const order = await FirebaseDB.getOrderById(id);
    const modal = document.getElementById('orderDetailModal');
    
    document.getElementById('detailOrderNumber').textContent = order.orderNumber;
    document.getElementById('detailTableNumber').textContent = order.tableNumber;
    document.getElementById('detailOrderDate').textContent = formatDateTime(order.createdAt);
    document.getElementById('detailOrderStatus').innerHTML = `<span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>`;
    
    const itemsList = document.getElementById('detailOrderItems');
    itemsList.innerHTML = '';
    order.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'order-item-row';
        div.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        `;
        itemsList.appendChild(div);
    });
    
    document.getElementById('detailSubtotal').textContent = formatCurrency(order.subtotal);
    document.getElementById('detailTax').textContent = formatCurrency(order.tax);
    document.getElementById('detailService').textContent = formatCurrency(order.service);
    document.getElementById('detailTotal').textContent = formatCurrency(order.total);
    
    const notesElement = document.getElementById('detailNotes');
    const notesTextElement = document.getElementById('detailNotesText');
    
    if (notesElement) {
        if (order.notes && order.notes.trim() !== '') {
            if (notesTextElement) {
                notesTextElement.textContent = order.notes;
            }
            notesElement.style.display = 'block';
        } else {
            notesElement.style.display = 'none';
        }
    }
    
    modal.style.display = 'flex';
}

async function updateOrderStatus(id, status) {
    try {
        await FirebaseDB.updateOrder(id, { status: status });
        
        if (status === 'completed') {
            const order = await FirebaseDB.getOrderById(id);
            await FirebaseDB.updateTable(order.tableId, { status: 'available' });
        }
        // List will auto-update from realtime listener
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Terjadi kesalahan saat update status');
    }
}

// Continue in next part...
