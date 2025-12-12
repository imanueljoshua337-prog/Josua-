// admin.js - Admin Panel Scripts

// Dashboard Functions
function loadDashboard() {
    const stats = DB.getStatistics();
    
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('completedOrders').textContent = stats.completedOrders;
    document.getElementById('pendingOrders').textContent = stats.pendingOrders;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('todayOrders').textContent = stats.todayOrders;
    document.getElementById('todayRevenue').textContent = formatCurrency(stats.todayRevenue);
    
    loadRecentOrders();
}

function loadRecentOrders() {
    const orders = DB.getOrders();
    const recentOrders = orders.slice(-5).reverse();
    const tbody = document.getElementById('recentOrders');
    
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

// Menu Management Functions
function loadMenuList() {
    const menus = DB.getMenus();
    const tbody = document.getElementById('menuList');
    
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
                <button onclick="editMenu(${menu.id})" class="btn btn-sm btn-primary">Edit</button>
                <button onclick="deleteMenu(${menu.id})" class="btn btn-sm btn-danger">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddMenuForm() {
    document.getElementById('menuFormTitle').textContent = 'Tambah Menu Baru';
    document.getElementById('menuForm').reset();
    document.getElementById('menuId').value = '';
    document.getElementById('menuModal').style.display = 'flex';
}

function editMenu(id) {
    const menu = DB.getMenuById(id);
    document.getElementById('menuFormTitle').textContent = 'Edit Menu';
    document.getElementById('menuId').value = menu.id;
    document.getElementById('menuName').value = menu.name;
    document.getElementById('menuCategory').value = menu.category;
    document.getElementById('menuPrice').value = menu.price;
    document.getElementById('menuImage').value = menu.image;
    document.getElementById('menuAvailable').checked = menu.available;
    document.getElementById('menuModal').style.display = 'flex';
}

function saveMenu(event) {
    event.preventDefault();
    
    const id = document.getElementById('menuId').value;
    const menuData = {
        name: document.getElementById('menuName').value,
        category: document.getElementById('menuCategory').value,
        price: parseInt(document.getElementById('menuPrice').value),
        image: document.getElementById('menuImage').value || 'assets/images/default.jpg',
        available: document.getElementById('menuAvailable').checked
    };
    
    if (id) {
        DB.updateMenu(parseInt(id), menuData);
    } else {
        DB.addMenu(menuData);
    }
    
    closeModal('menuModal');
    loadMenuList();
}

function deleteMenu(id) {
    if (confirm('Yakin ingin menghapus menu ini?')) {
        DB.deleteMenu(id);
        loadMenuList();
    }
}

// Table Management Functions
function loadTableList() {
    const tables = DB.getTables();
    const tbody = document.getElementById('tableList');
    
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
                <button onclick="editTable(${table.id})" class="btn btn-sm btn-primary">Edit</button>
                <button onclick="deleteTable(${table.id})" class="btn btn-sm btn-danger">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddTableForm() {
    document.getElementById('tableFormTitle').textContent = 'Tambah Meja Baru';
    document.getElementById('tableForm').reset();
    document.getElementById('tableId').value = '';
    document.getElementById('tableModal').style.display = 'flex';
}

function editTable(id) {
    const table = DB.getTableById(id);
    document.getElementById('tableFormTitle').textContent = 'Edit Meja';
    document.getElementById('tableId').value = table.id;
    document.getElementById('tableNumber').value = table.number;
    document.getElementById('tableCapacity').value = table.capacity;
    document.getElementById('tableStatus').value = table.status;
    document.getElementById('tableModal').style.display = 'flex';
}

function saveTable(event) {
    event.preventDefault();
    
    const id = document.getElementById('tableId').value;
    const tableData = {
        number: parseInt(document.getElementById('tableNumber').value),
        capacity: parseInt(document.getElementById('tableCapacity').value),
        status: document.getElementById('tableStatus').value
    };
    
    if (id) {
        DB.updateTable(parseInt(id), tableData);
    } else {
        DB.addTable(tableData);
    }
    
    closeModal('tableModal');
    loadTableList();
}

function deleteTable(id) {
    if (confirm('Yakin ingin menghapus meja ini?')) {
        DB.deleteTable(id);
        loadTableList();
    }
}

// Orders Management Functions
function loadOrdersList() {
    const orders = DB.getOrders().reverse();
    const tbody = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada pesanan</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>Meja ${order.tableNumber}</td>
            <td>${order.items.length} item</td>
            <td>${formatCurrency(order.total)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>
                <button onclick="viewOrder(${order.id})" class="btn btn-sm btn-primary">Detail</button>
                ${order.status === 'pending' ? `<button onclick="updateOrderStatus(${order.id}, 'completed')" class="btn btn-sm btn-success">Selesai</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewOrder(id) {
    const order = DB.getOrderById(id);
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
    
    if (order.notes) {
        document.getElementById('detailNotes').textContent = order.notes;
        document.getElementById('detailNotes').parentElement.style.display = 'block';
    } else {
        document.getElementById('detailNotes').parentElement.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function updateOrderStatus(id, status) {
    const order = DB.getOrderById(id);
    DB.updateOrder(id, { status: status });
    
    if (status === 'completed') {
        DB.updateTable(order.tableId, { status: 'available' });
    }
    
    loadOrdersList();
}

// Settings Functions
function loadSettings() {
    const settings = DB.getSettings();
    document.getElementById('restaurantName').value = settings.restaurantName;
    document.getElementById('taxPercent').value = settings.taxPercent;
    document.getElementById('servicePercent').value = settings.serviceChargePercent;
    
    const admin = DB.getAdmin();
    document.getElementById('adminUsername').value = admin.username;
}

// Staff Management Functions
function loadStaffStats() {
    const staff = DB.getStaff();
    const cashiers = staff.filter(s => s.role === 'cashier');
    const waiters = staff.filter(s => s.role === 'waiter');
    
    document.getElementById('totalStaff').textContent = staff.length;
    document.getElementById('totalCashiers').textContent = cashiers.length;
    document.getElementById('totalWaiters').textContent = waiters.length;
}

function loadStaffList() {
    const staff = DB.getStaff();
    const tbody = document.getElementById('staffList');
    
    if (staff.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada staff</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    staff.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.username}</td>
            <td><span class="badge ${s.role === 'cashier' ? 'badge-success' : 'badge-info'}">${getRoleText(s.role)}</span></td>
            <td>${s.phone}</td>
            <td>${formatDate(s.joinDate)}</td>
            <td><span class="status-badge ${s.status === 'active' ? 'status-completed' : 'status-cancelled'}">${s.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</span></td>
            <td>
                <button onclick="editStaff(${s.id})" class="btn btn-sm btn-primary">Edit</button>
                <button onclick="deleteStaff(${s.id})" class="btn btn-sm btn-danger">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddStaffForm() {
    document.getElementById('staffFormTitle').textContent = 'Tambah Staff Baru';
    document.getElementById('staffForm').reset();
    document.getElementById('staffId').value = '';
    document.getElementById('staffPassword').required = true;
    document.getElementById('staffModal').style.display = 'flex';
}

function editStaff(id) {
    const staff = DB.getStaffById(id);
    document.getElementById('staffFormTitle').textContent = 'Edit Staff';
    document.getElementById('staffId').value = staff.id;
    document.getElementById('staffName').value = staff.name;
    document.getElementById('staffUsername').value = staff.username;
    document.getElementById('staffPassword').value = '';
    document.getElementById('staffPassword').required = false;
    document.getElementById('staffRole').value = staff.role;
    document.getElementById('staffPhone').value = staff.phone;
    document.getElementById('staffStatus').value = staff.status;
    document.getElementById('staffModal').style.display = 'flex';
}

function saveStaff(event) {
    event.preventDefault();
    
    const id = document.getElementById('staffId').value;
    const password = document.getElementById('staffPassword').value;
    
    const staffData = {
        name: document.getElementById('staffName').value,
        username: document.getElementById('staffUsername').value,
        role: document.getElementById('staffRole').value,
        phone: document.getElementById('staffPhone').value,
        status: document.getElementById('staffStatus').value
    };
    
    // Only update password if provided
    if (password) {
        staffData.password = password;
    }
    
    if (id) {
        // Check if password should be kept
        if (!password) {
            const existingStaff = DB.getStaffById(parseInt(id));
            staffData.password = existingStaff.password;
        }
        DB.updateStaff(parseInt(id), staffData);
    } else {
        staffData.password = password;
        DB.addStaff(staffData);
    }
    
    closeModal('staffModal');
    loadStaffList();
    loadStaffStats();
}

function deleteStaff(id) {
    if (confirm('Yakin ingin menghapus staff ini?')) {
        DB.deleteStaff(id);
        loadStaffList();
        loadStaffStats();
    }
}

function getRoleText(role) {
    const roleMap = {
        'cashier': 'Kasir',
        'waiter': 'Pelayan'
    };
    return roleMap[role] || role;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Settings Functions (original)
function saveSettings(event) {
    event.preventDefault();
    
    const settings = {
        restaurantName: document.getElementById('restaurantName').value,
        taxPercent: parseInt(document.getElementById('taxPercent').value),
        serviceChargePercent: parseInt(document.getElementById('servicePercent').value)
    };
    
    DB.updateSettings(settings);
    alert('Pengaturan berhasil disimpan!');
}

function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const admin = DB.getAdmin();
    
    if (currentPassword !== admin.password) {
        alert('Password lama salah!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Password baru tidak cocok!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password minimal 6 karakter!');
        return;
    }
    
    DB.updateAdmin({
        username: admin.username,
        password: newPassword
    });
    
    alert('Password berhasil diubah!');
    document.getElementById('passwordForm').reset();
}

// Report Functions
function loadReports() {
    const stats = DB.getStatistics();
    const orders = DB.getOrders();
    
    document.getElementById('reportTotalOrders').textContent = stats.totalOrders;
    document.getElementById('reportCompletedOrders').textContent = stats.completedOrders;
    document.getElementById('reportTotalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('reportTodayRevenue').textContent = formatCurrency(stats.todayRevenue);
    
    // Best selling items
    const itemCount = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemCount[item.name]) {
                itemCount[item.name] = 0;
            }
            itemCount[item.name] += item.quantity;
        });
    });
    
    const sortedItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const bestSelling = document.getElementById('bestSellingItems');
    bestSelling.innerHTML = '';
    sortedItems.forEach(([name, count], index) => {
        const div = document.createElement('div');
        div.className = 'best-selling-item';
        div.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="item-name">${name}</span>
            <span class="item-count">${count} terjual</span>
        `;
        bestSelling.appendChild(div);
    });
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility Functions
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

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Diproses',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
}

function getTableStatusText(status) {
    const statusMap = {
        'available': 'Tersedia',
        'occupied': 'Terisi',
        'reserved': 'Dipesan'
    };
    return statusMap[status] || status;
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}