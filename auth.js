// auth.js - FIXED Authentication Management

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        // =====================
        // ✅ ADMIN LOGIN (FIX)
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

// =====================
// UI ERROR
// =====================
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// =====================
// AUTH CHECK
// =====================
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('userLoggedIn');
    const loginTime = sessionStorage.getItem('loginTime');

    if (isLoggedIn && loginTime) {
        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(loginTime);
        const userRole = sessionStorage.getItem('userRole');

        const maxTime = userRole === 'admin'
            ? 60 * 60 * 1000      // 1 jam
            : 8 * 60 * 60 * 1000; // 8 jam

        if (timeDiff > maxTime) {
            logout();
            return false;
        }
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'login.html';
    }
}

function requireRole(allowedRoles) {
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return false;
    }

    const userRole = sessionStorage.getItem('userRole');
    if (!allowedRoles.includes(userRole)) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        window.location.href = userRole === 'cashier'
            ? 'cashier.html'
            : userRole === 'waiter'
            ? 'waiter.html'
            : 'dashboard.html';
        return false;
    }
    return true;
}

function getUserInfo() {
    return {
        role: sessionStorage.getItem('userRole'),
        name: sessionStorage.getItem('userName'),
        id: sessionStorage.getItem('userId')
    };
}
