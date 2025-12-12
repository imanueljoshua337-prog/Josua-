// main.js - Script untuk halaman utama

document.addEventListener('DOMContentLoaded', function() {
    loadRestaurantName();
    loadTables();
});

function loadRestaurantName() {
    const settings = DB.getSettings();
    const nameElement = document.getElementById('restaurantName');
    if (nameElement && settings) {
        nameElement.textContent = settings.restaurantName;
    }
}

function loadTables() {
    const tables = DB.getTables();
    const tableList = document.getElementById('tableList');
    
    if (!tableList) return;
    
    tableList.innerHTML = '';
    
    tables.forEach(table => {
        const tableCard = document.createElement('div');
        tableCard.className = `table-card ${table.status}`;
        
        tableCard.innerHTML = `
            <div class="table-number">Meja ${table.number}</div>
            <div class="table-capacity">
                <span class="icon">👥</span>
                ${table.capacity} orang
            </div>
            <div class="table-status">${getStatusText(table.status)}</div>
        `;
        
        if (table.status === 'available') {
            tableCard.style.cursor = 'pointer';
            tableCard.onclick = () => selectTable(table.id, table.number);
        }
        
        tableList.appendChild(tableCard);
    });
}

function getStatusText(status) {
    const statusMap = {
        'available': '✓ Tersedia',
        'occupied': '✗ Terisi',
        'reserved': '⏰ Dipesan'
    };
    return statusMap[status] || status;
}

function selectTable(tableId, tableNumber) {
    // Simpan nomor meja ke sessionStorage
    sessionStorage.setItem('selectedTable', tableId);
    sessionStorage.setItem('selectedTableNumber', tableNumber);
    
    // Redirect ke halaman order
    window.location.href = 'order.html';
}