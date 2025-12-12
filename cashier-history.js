// cashier-history.js - Transaction History Script

let currentPeriod = 'today';

function loadHistoryPage() {
    const userInfo = getUserInfo();
    document.getElementById('cashierName').textContent = userInfo.name;
    
    updateStats();
    loadHistoryTable();
}

function filterPeriod(period) {
    currentPeriod = period;
    
    // Update active button
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    updateStats();
    loadHistoryTable();
}

function getFilteredOrders() {
    const orders = DB.getOrders().filter(o => o.status === 'completed');
    const now = new Date();
    
    switch(currentPeriod) {
        case 'today':
            return orders.filter(o => {
                const orderDate = new Date(o.completedAt || o.createdAt);
                return orderDate.toDateString() === now.toDateString();
            });
            
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orders.filter(o => {
                const orderDate = new Date(o.completedAt || o.createdAt);
                return orderDate >= weekAgo;
            });
            
        case 'month':
            return orders.filter(o => {
                const orderDate = new Date(o.completedAt || o.createdAt);
                return orderDate.getMonth() === now.getMonth() && 
                       orderDate.getFullYear() === now.getFullYear();
            });
            
        case 'all':
        default:
            return orders;
    }
}

function updateStats() {
    const orders = getFilteredOrders();
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const cashTransactions = orders.filter(o => o.paymentMethod === 'cash').length;
    const nonCashTransactions = orders.filter(o => o.paymentMethod !== 'cash' && o.paymentMethod).length;
    
    document.getElementById('totalTransactions').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('cashTransactions').textContent = cashTransactions;
    document.getElementById('cardTransactions').textContent = nonCashTransactions;
}

function loadHistoryTable() {
    const orders = getFilteredOrders().reverse();
    const tbody = document.getElementById('historyList');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada transaksi pada periode ini</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>Meja ${order.tableNumber}</td>
            <td><strong style="color: var(--primary-color);">${formatCurrency(order.total)}</strong></td>
            <td><span class="badge badge-${getPaymentMethodColor(order.paymentMethod)}">${getPaymentMethodText(order.paymentMethod)}</span></td>
            <td>${order.completedBy || '-'}</td>
            <td>${formatDateTime(order.completedAt || order.createdAt)}</td>
            <td>
                <button onclick="showDetail(${order.id})" class="btn btn-sm btn-primary">Detail</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showDetail(orderId) {
    const order = DB.getOrderById(orderId);
    
    document.getElementById('detailOrderNumber').textContent = order.orderNumber;
    document.getElementById('detailTable').textContent = 'Meja ' + order.tableNumber;
    document.getElementById('detailPaymentMethod').textContent = getPaymentMethodText(order.paymentMethod);
    document.getElementById('detailTime').textContent = formatDateTime(order.completedAt || order.createdAt);
    document.getElementById('detailCashier').textContent = order.completedBy || '-';
    
    // Load items
    const itemsDiv = document.getElementById('detailItems');
    itemsDiv.innerHTML = '';
    order.items.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--light-color);';
        div.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>${formatCurrency(item.price * item.quantity)}</span>
        `;
        itemsDiv.appendChild(div);
    });
    
    // Load totals
    document.getElementById('detailSubtotal').textContent = formatCurrency(order.subtotal);
    document.getElementById('detailTax').textContent = formatCurrency(order.tax);
    document.getElementById('detailService').textContent = formatCurrency(order.service);
    document.getElementById('detailTotal').textContent = formatCurrency(order.total);
    
    document.getElementById('detailModal').style.display = 'flex';
}

function printReport() {
    const orders = getFilteredOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const settings = DB.getSettings();
    
    let periodText = '';
    switch(currentPeriod) {
        case 'today': periodText = 'Hari Ini'; break;
        case 'week': periodText = 'Minggu Ini'; break;
        case 'month': periodText = 'Bulan Ini'; break;
        case 'all': periodText = 'Semua Periode'; break;
    }
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Laporan Transaksi - ${periodText}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #2C3E50; }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { background: #ECF0F1; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #34495E; color: white; }
                tr:nth-child(even) { background: #f9f9f9; }
                .total { font-weight: bold; background: #3498DB; color: white; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${settings.restaurantName}</h1>
                <h2>Laporan Transaksi - ${periodText}</h2>
                <p>Dicetak: ${new Date().toLocaleString('id-ID')}</p>
            </div>
            
            <div class="summary">
                <h3>Ringkasan</h3>
                <p><strong>Total Transaksi:</strong> ${orders.length}</p>
                <p><strong>Total Pendapatan:</strong> ${formatCurrency(totalRevenue)}</p>
                <p><strong>Transaksi Tunai:</strong> ${orders.filter(o => o.paymentMethod === 'cash').length}</p>
                <p><strong>Transaksi Non-Tunai:</strong> ${orders.filter(o => o.paymentMethod !== 'cash' && o.paymentMethod).length}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>No. Pesanan</th>
                        <th>Meja</th>
                        <th>Total</th>
                        <th>Metode</th>
                        <th>Waktu</th>
                        <th>Kasir</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.orderNumber}</td>
                            <td>Meja ${order.tableNumber}</td>
                            <td>${formatCurrency(order.total)}</td>
                            <td>${getPaymentMethodText(order.paymentMethod)}</td>
                            <td>${formatDateTime(order.completedAt || order.createdAt)}</td>
                            <td>${order.completedBy || '-'}</td>
                        </tr>
                    `).join('')}
                    <tr class="total">
                        <td colspan="2">TOTAL</td>
                        <td colspan="4">${formatCurrency(totalRevenue)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer;">🖨️ Cetak</button>
                <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; margin-left: 10px;">Tutup</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function getPaymentMethodText(method) {
    const methods = {
        'cash': 'Tunai',
        'debit': 'Kartu Debit',
        'credit': 'Kartu Kredit',
        'qris': 'QRIS',
        'ewallet': 'E-Wallet'
    };
    return methods[method] || method || 'Tunai';
}

function getPaymentMethodColor(method) {
    if (method === 'cash') return 'success';
    return 'info';
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