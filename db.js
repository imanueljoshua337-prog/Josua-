// db.js - Manajemen Database menggunakan localStorage

const DB = {
    // Inisialisasi database dengan data default
    init() {
        if (!localStorage.getItem('menus')) {
            const defaultMenus = [
                { id: 1, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', image: 'assets/images/nasi-goreng.jpg', available: true },
                { id: 2, name: 'Mie Goreng', price: 20000, category: 'Makanan', image: 'assets/images/mie-goreng.jpg', available: true },
                { id: 3, name: 'Ayam Geprek', price: 22000, category: 'Makanan', image: 'assets/images/ayam-geprek.jpg', available: true },
                { id: 4, name: 'Sate Ayam', price: 30000, category: 'Makanan', image: 'assets/images/sate.jpg', available: true },
                { id: 5, name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'assets/images/es-teh.jpg', available: true },
                { id: 6, name: 'Es Jeruk', price: 7000, category: 'Minuman', image: 'assets/images/es-jeruk.jpg', available: true },
                { id: 7, name: 'Jus Alpukat', price: 12000, category: 'Minuman', image: 'assets/images/jus-alpukat.jpg', available: true }
            ];
            localStorage.setItem('menus', JSON.stringify(defaultMenus));
        }

        if (!localStorage.getItem('tables')) {
            const defaultTables = [
                { id: 1, number: 1, capacity: 4, status: 'available' },
                { id: 2, number: 2, capacity: 2, status: 'available' },
                { id: 3, number: 3, capacity: 6, status: 'available' },
                { id: 4, number: 4, capacity: 4, status: 'available' },
                { id: 5, number: 5, capacity: 8, status: 'available' }
            ];
            localStorage.setItem('tables', JSON.stringify(defaultTables));
        }

        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }

        if (!localStorage.getItem('admin')) {
            const defaultAdmin = {
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            };
            localStorage.setItem('admin', JSON.stringify(defaultAdmin));
        }

        if (!localStorage.getItem('staff')) {
            const defaultStaff = [
                { id: 1, name: 'Budi Santoso', username: 'kasir1', password: 'kasir123', role: 'cashier', phone: '081234567890', status: 'active', joinDate: '2024-01-15' },
                { id: 2, name: 'Siti Rahma', username: 'kasir2', password: 'kasir123', role: 'cashier', phone: '081234567891', status: 'active', joinDate: '2024-02-01' },
                { id: 3, name: 'Ahmad Yusuf', username: 'pegawai1', password: 'pegawai123', role: 'waiter', phone: '081234567892', status: 'active', joinDate: '2024-01-20' },
                { id: 4, name: 'Dewi Lestari', username: 'pegawai2', password: 'pegawai123', role: 'waiter', phone: '081234567893', status: 'active', joinDate: '2024-02-10' }
            ];
            localStorage.setItem('staff', JSON.stringify(defaultStaff));
        }

        if (!localStorage.getItem('settings')) {
            const defaultSettings = {
                restaurantName: 'Restoran Digital',
                taxPercent: 10,
                serviceChargePercent: 5
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }
    },

    // Menu Management
    getMenus() {
        return JSON.parse(localStorage.getItem('menus')) || [];
    },

    getMenuById(id) {
        const menus = this.getMenus();
        return menus.find(menu => menu.id === id);
    },

    addMenu(menu) {
        const menus = this.getMenus();
        menu.id = Date.now();
        menus.push(menu);
        localStorage.setItem('menus', JSON.stringify(menus));
        return menu;
    },

    updateMenu(id, updatedMenu) {
        let menus = this.getMenus();
        menus = menus.map(menu => menu.id === id ? { ...menu, ...updatedMenu } : menu);
        localStorage.setItem('menus', JSON.stringify(menus));
    },

    deleteMenu(id) {
        let menus = this.getMenus();
        menus = menus.filter(menu => menu.id !== id);
        localStorage.setItem('menus', JSON.stringify(menus));
    },

    // Table Management
    getTables() {
        return JSON.parse(localStorage.getItem('tables')) || [];
    },

    getTableById(id) {
        const tables = this.getTables();
        return tables.find(table => table.id === id);
    },

    addTable(table) {
        const tables = this.getTables();
        table.id = Date.now();
        tables.push(table);
        localStorage.setItem('tables', JSON.stringify(tables));
        return table;
    },

    updateTable(id, updatedTable) {
        let tables = this.getTables();
        tables = tables.map(table => table.id === id ? { ...table, ...updatedTable } : table);
        localStorage.setItem('tables', JSON.stringify(tables));
    },

    deleteTable(id) {
        let tables = this.getTables();
        tables = tables.filter(table => table.id !== id);
        localStorage.setItem('tables', JSON.stringify(tables));
    },

    // Order Management
    getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    },

    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(order => order.id === id);
    },

    addOrder(order) {
        const orders = this.getOrders();
        order.id = Date.now();
        order.orderNumber = 'ORD-' + order.id;
        order.createdAt = new Date().toISOString();
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        return order;
    },

    updateOrder(id, updatedOrder) {
        let orders = this.getOrders();
        orders = orders.map(order => order.id === id ? { ...order, ...updatedOrder } : order);
        localStorage.setItem('orders', JSON.stringify(orders));
    },

    deleteOrder(id) {
        let orders = this.getOrders();
        orders = orders.filter(order => order.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
    },

    // Settings
    getSettings() {
        return JSON.parse(localStorage.getItem('settings'));
    },

    updateSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    },

    // Admin
    getAdmin() {
        return JSON.parse(localStorage.getItem('admin'));
    },

    updateAdmin(admin) {
        localStorage.setItem('admin', JSON.stringify(admin));
    },

    // Staff Management
    getStaff() {
        return JSON.parse(localStorage.getItem('staff')) || [];
    },

    getStaffById(id) {
        const staff = this.getStaff();
        return staff.find(s => s.id === id);
    },

    getStaffByUsername(username) {
        const staff = this.getStaff();
        return staff.find(s => s.username === username);
    },

    addStaff(staffData) {
        const staff = this.getStaff();
        staffData.id = Date.now();
        staffData.joinDate = new Date().toISOString().split('T')[0];
        staff.push(staffData);
        localStorage.setItem('staff', JSON.stringify(staff));
        return staffData;
    },

    updateStaff(id, updatedStaff) {
        let staff = this.getStaff();
        staff = staff.map(s => s.id === id ? { ...s, ...updatedStaff } : s);
        localStorage.setItem('staff', JSON.stringify(staff));
    },

    deleteStaff(id) {
        let staff = this.getStaff();
        staff = staff.filter(s => s.id !== id);
        localStorage.setItem('staff', JSON.stringify(staff));
    },

    // Statistics
    getStatistics() {
        const orders = this.getOrders();
        const today = new Date().toDateString();
        
        const todayOrders = orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );

        const todayRevenue = todayOrders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        const totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);

        return {
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            todayRevenue: todayRevenue,
            totalRevenue: totalRevenue,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed').length
        };
    }
};

// Inisialisasi database saat halaman dimuat
DB.init();
