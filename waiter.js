// waiter.js - Waiter Dashboard Scripts

let currentOrderId = null;

function loadWaiterDashboard() {
    const userInfo = getUserInfo();
    if (document.getElementById('waiterName')) {
        document.getElementById('waiterName').textContent = userInfo.name;
    }
    if (document.getElementById('welcomeName')) {
        document.getElementById('welcomeName').textContent = userInfo.name;
    }
    
    loadWaiterStats();
    loadTodaySummary();
}

function loadWaiterStats() {
    const orders = DB.getOrders();
    const tables = DB.getTables();
    
    const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    const available = tables.filter(t => t.status === 'available');
    const occupied = tables.filter(t => t.status === 'occupied');
    
    // Count urgent orders (more than 15 minutes)
    const now = new Date();
    const urgentOrders = activeOrders.filter(order => {
        const orderTime = new Date(order.createdAt);
        const diffMins = Math.floor((now - orderTime) / 60000);
        return diffMins > 15;
    });
    
    if (document.getElementById('activeOrders')) {
        document.getElementById('activeOrders').textContent = activeOrders.length;
    }
    if (document.getElementById('availableTables')) {
        document.getElementById('availableTables').textContent = available.length;
    }
    if (document.getElementById('occupiedTables')) {
        document.getElementById('occupiedTables').textContent = occupied.length;
    }
    if (document.getElementById('urgentOrders')) {
        document.getElementById('urgentOrders').textContent = urgentOrders.length;
    }
}

function loadTodaySummary() {
    const orders = DB.getOrders();
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
    );
    
    const todayCompleted = todayOrders.filter(o => o.status === 'completed');
    
    // Calculate average processing time
    let avgTime = '-';
    if (todayCompleted.length > 0) {
        const totalTime = todayCompleted.reduce((sum, order) => {
            if (order.completedAt) {
                const start = new Date(order.createdAt);
                const end = new Date(order.completedAt);
                return sum + (end - start);
            }
            return sum;
        }, 0);
        
        const avgMs = totalTime / todayCompleted.length;
        const avgMins = Math.floor(avgMs / 60000);
        avgTime = avgMins + ' menit';
    }
    
    if (document.getElementById('todayOrders')) {
        document.getElementById('todayOrders').textContent = todayOrders.length;
    }
    if (document.getElementById('todayCompleted')) {
        document.getElementById('todayCompleted').textContent = todayCompleted.length;
    }
    if (document.getElementById('avgTime')) {
        document.getElementById('avgTime').textContent = avgTime;
    }
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentOrderId = null;
}