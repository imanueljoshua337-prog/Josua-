// auth.js - FIX FINAL
console.log('DB:', DB);
console.log('database:', window.database);

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // =====================
        // ✅ ADMIN LOGIN
        // =====================
        const admin = await DB.getAdmin();

        if (admin && username === admin.username && password === admin.password) {
            sessionStorage.setItem('userLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'admin');
            sessionStorage.setItem('userName', 'Administrator');
            sessionStorage.setItem('loginTime', Date.now());

            window.location.href = 'dashboard.html';
            return;
        }

        // =====================
        // ✅ STAFF LOGIN
        // =====================
        const staff = await DB.getStaffByUsername(username);

        if (staff && staff.password === password) {
            if (staff.status !== 'active') {
                showError('Akun Anda tidak aktif. Hubungi administrator!');
                return;
            }

            sessionStorage.setItem('userLoggedIn', 'true');
            sessionStorage.setItem('userRole', staff.role);
            sessionStorage.setItem('userName', staff.name);
            sessionStorage.setItem('userId', staff.id);
            sessionStorage.setItem('loginTime', Date.now());

            if (staff.role === 'cashier') {
                window.location.href = 'cashier.html';
            } else {
                window.location.href = 'waiter.html';
            }
            return;
        }

        showError('Username atau password salah!');
    } catch (error) {
        console.error('Login error:', error);
        showError('Terjadi kesalahan saat login.');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

