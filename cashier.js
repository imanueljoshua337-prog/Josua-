// cashier.js - Cashier Dashboard Scripts

function loadCashierDashboard() {
    const userInfo = getUserInfo();
    if (document.getElementById('cashierName')) {
        document.getElementById('cashierName').textContent = userInfo.name;
    }
    if (document.getElementById('welcomeName')) {
        document.getElementById('welcomeName').textContent = userInfo.name;
    }
    if (document.getElementById('waiterName')) {
        document.getElementById('waiterName').textContent = userInfo.name;
    }
    
    loadCashierStats();
    loadPaymentMethodStats();
}

function loadCashierStats() {
    const orders = DB.getOrders();
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
    );
    
    const completedToday = todayOrders.filter(o => o.status === 'completed');
    const pendingPayment = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    
    const todayRevenue = completedToday.reduce((sum, order) => sum + order.total, 0);
    const cashToday = completedToday.filter(o => o.paymentMethod === 'cash').length;
    
    if (document.getElementById('todayCompleted')) {
        document.getElementById('todayCompleted').textContent = completedToday.length;
    }
    if (document.getElementById('todayRevenue')) {
        document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue);
    }
    if (document.getElementById('pendingPayment')) {
        document.getElementById('pendingPayment').textContent = pendingPayment.length;
    }
    if (document.getElementById('cashCount')) {
        document.getElementById('cashCount').textContent = cashToday;
    }
}

function loadPaymentMethodStats() {
    const orders = DB.getOrders();
    const today = new Date().toDateString();
    
    const todayCompleted = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today && 
        order.status === 'completed'
    );
    
    const cashCount = todayCompleted.filter(o => o.paymentMethod === 'cash').length;
    const cardCount = todayCompleted.filter(o => o.paymentMethod === 'debit' || o.paymentMethod === 'credit').length;
    const qrisCount = todayCompleted.filter(o => o.paymentMethod === 'qris').length;
    const ewalletCount = todayCompleted.filter(o => o.paymentMethod === 'ewallet').length;
    
    if (document.getElementById('cashMethodCount')) {
        document.getElementById('cashMethodCount').textContent = cashCount;
    }
    if (document.getElementById('cardMethodCount')) {
        document.getElementById('cardMethodCount').textContent = cardCount;
    }
    if (document.getElementById('qrisMethodCount')) {
        document.getElementById('qrisMethodCount').textContent = qrisCount;
    }
    if (document.getElementById('ewalletMethodCount')) {
        document.getElementById('ewalletMethodCount').textContent = ewalletCount;
    }
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
