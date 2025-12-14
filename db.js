// firebase-db.js - Firebase Database Management

const FirebaseDB = {
    // Initialize default data
    async init() {
        try {
            // Check if data exists, if not create default data
            const menusSnapshot = await database.ref('menus').once('value');
            if (!menusSnapshot.exists()) {
                await this.createDefaultData();
            }
            console.log('✅ Firebase DB initialized');
        } catch (error) {
            console.error('❌ Firebase init error:', error);
        }
    },

    async createDefaultData() {
        const defaultMenus = {
            menu1: { name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', image: 'assets/images/nasi-goreng.jpg', available: true },
            menu2: { name: 'Mie Goreng', price: 20000, category: 'Makanan', image: 'assets/images/mie-goreng.jpg', available: true },
            menu3: { name: 'Ayam Geprek', price: 22000, category: 'Makanan', image: 'assets/images/ayam-geprek.jpg', available: true },
            menu4: { name: 'Sate Ayam', price: 30000, category: 'Makanan', image: 'assets/images/sate.jpg', available: true },
            menu5: { name: 'Es Teh Manis', price: 5000, category: 'Minuman', image: 'assets/images/es-teh.jpg', available: true },
            menu6: { name: 'Es Jeruk', price: 7000, category: 'Minuman', image: 'assets/images/es-jeruk.jpg', available: true },
            menu7: { name: 'Jus Alpukat', price: 12000, category: 'Minuman', image: 'assets/images/jus-alpukat.jpg', available: true }
        };

        const defaultTables = {
            table1: { number: 1, capacity: 4, status: 'available' },
            table2: { number: 2, capacity: 2, status: 'available' },
            table3: { number: 3, capacity: 6, status: 'available' },
            table4: { number: 4, capacity: 4, status: 'available' },
            table5: { number: 5, capacity: 8, status: 'available' }
        };

        const defaultStaff = {
            staff1: { name: 'Budi Santoso', username: 'kasir1', password: 'kasir123', role: 'cashier', phone: '081234567890', status: 'active', joinDate: '2024-01-15' },
            staff2: { name: 'Siti Rahma', username: 'kasir2', password: 'kasir123', role: 'cashier', phone: '081234567891', status: 'active', joinDate: '2024-02-01' },
            staff3: { name: 'Ahmad Yusuf', username: 'pegawai1', password: 'pegawai123', role: 'waiter', phone: '081234567892', status: 'active', joinDate: '2024-01-20' },
            staff4: { name: 'Dewi Lestari', username: 'pegawai2', password: 'pegawai123', role: 'waiter', phone: '081234567893', status: 'active', joinDate: '2024-02-10' }
        };

        const defaultAdmin = {
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        };

        const defaultSettings = {
            restaurantName: 'Restoran Digital',
            taxPercent: 10,
            serviceChargePercent: 5
        };

        await database.ref('menus').set(defaultMenus);
        await database.ref('tables').set(defaultTables);
        await database.ref('staff').set(defaultStaff);
        await database.ref('admin').set(defaultAdmin);
        await database.ref('settings').set(defaultSettings);
        
        console.log('✅ Default data created');
    },

    // Menu Management
    listenMenus(callback) {
        database.ref('menus').on('value', snapshot => {
            const data = snapshot.val();
            const menus = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(menus);
        });
    },

    async addMenu(menu) {
        const newRef = database.ref('menus').push();
        await newRef.set(menu);
        return { id: newRef.key, ...menu };
    },

    async updateMenu(id, updatedMenu) {
        await database.ref(`menus/${id}`).update(updatedMenu);
    },

    async deleteMenu(id) {
        await database.ref(`menus/${id}`).remove();
    },

    // Table Management
    listenTables(callback) {
        database.ref('tables').on('value', snapshot => {
            const data = snapshot.val();
            const tables = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(tables);
        });
    },

    async addTable(table) {
        const newRef = database.ref('tables').push();
        await newRef.set(table);
        return { id: newRef.key, ...table };
    },

    async updateTable(id, updatedTable) {
        await database.ref(`tables/${id}`).update(updatedTable);
    },

    async deleteTable(id) {
        await database.ref(`tables/${id}`).remove();
    },

    // Order Management
    listenOrders(callback) {
        database.ref('orders').on('value', snapshot => {
            const data = snapshot.val();
            const orders = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(orders);
        });
    },

    async addOrder(order) {
        const newRef = database.ref('orders').push();
        order.orderNumber = 'ORD-' + newRef.key.substring(0, 8).toUpperCase();
        order.createdAt = new Date().toISOString();
        await newRef.set(order);
        return { id: newRef.key, ...order };
    },

    async updateOrder(id, updatedOrder) {
        await database.ref(`orders/${id}`).update(updatedOrder);
    },

    async deleteOrder(id) {
        await database.ref(`orders/${id}`).remove();
    },

    // Staff Management
    listenStaff(callback) {
        database.ref('staff').on('value', snapshot => {
            const data = snapshot.val();
            const staff = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            callback(staff);
        });
    },

    async addStaff(staffData) {
        const newRef = database.ref('staff').push();
        staffData.joinDate = new Date().toISOString().split('T')[0];
        await newRef.set(staffData);
        return { id: newRef.key, ...staffData };
    },

    async updateStaff(id, updatedStaff) {
        await database.ref(`staff/${id}`).update(updatedStaff);
    },

    async deleteStaff(id) {
        await database.ref(`staff/${id}`).remove();
    },

    // Settings
    listenSettings(callback) {
        database.ref('settings').on('value', snapshot => {
            callback(snapshot.val());
        });
    },

    async updateSettings(settings) {
        await database.ref('settings').update(settings);
    },

    // Admin
    async getAdmin() {
        const snapshot = await database.ref('admin').once('value');
        return snapshot.val();
    },

    async updateAdmin(admin) {
        await database.ref('admin').update(admin);
    },

    // Get single items (for compatibility)
    async getMenuById(id) {
        const snapshot = await database.ref(`menus/${id}`).once('value');
        return snapshot.exists() ? { id, ...snapshot.val() } : null;
    },

    async getTableById(id) {
        const snapshot = await database.ref(`tables/${id}`).once('value');
        return snapshot.exists() ? { id, ...snapshot.val() } : null;
    },

    async getOrderById(id) {
        const snapshot = await database.ref(`orders/${id}`).once('value');
        return snapshot.exists() ? { id, ...snapshot.val() } : null;
    },

    async getStaffById(id) {
        const snapshot = await database.ref(`staff/${id}`).once('value');
        return snapshot.exists() ? { id, ...snapshot.val() } : null;
    },

    async getStaffByUsername(username) {
        const snapshot = await database.ref('staff').orderByChild('username').equalTo(username).once('value');
        const data = snapshot.val();
        if (data) {
            const key = Object.keys(data)[0];
            return { id: key, ...data[key] };
        }
        return null;
    },

    // Get all items (one-time, for non-realtime operations)
    async getMenus() {
        const snapshot = await database.ref('menus').once('value');
        const data = snapshot.val();
        return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    },

    async getTables() {
        const snapshot = await database.ref('tables').once('value');
        const data = snapshot.val();
        return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    },

    async getOrders() {
        const snapshot = await database.ref('orders').once('value');
        const data = snapshot.val();
        return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    },

    async getStaff() {
        const snapshot = await database.ref('staff').once('value');
        const data = snapshot.val();
        return data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
    },

    async getSettings() {
        const snapshot = await database.ref('settings').once('value');
        return snapshot.val();
    },

    // Statistics
    async getStatistics() {
        const orders = await this.getOrders();
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

// Alias DB untuk kompatibilitas dengan kode lama
const DB = FirebaseDB;

// Initialize on load
window.addEventListener('load', () => {
    FirebaseDB.init();
});


