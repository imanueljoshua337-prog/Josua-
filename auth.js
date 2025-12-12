// auth.js - Authentication Management

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const admin = DB.getAdmin();
    
    // Check admin login
    if (username === admin.username && password === admin.password) {
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('userName', 'Administrator');
        sessionStorage.setItem('loginTime', new Date().getTime());
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Check staff login
    const staff = DB.getStaffByUsername(username);
    if (staff && staff.password === password) {
        if (staff.status !== 'active') {
            showError('Akun Anda tidak aktif. Hubungi administrator!');
            return;
        }
        
        sessionStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('userRole', staff.role);
        sessionStorage.setItem('userName', staff.name);
        sessionStorage.setItem('userId', staff.id);
        sessionStorage.setItem('loginTime', new Date().getTime());
        
        // Redirect based on role
        if (staff.role === 'cashier') {
            window.location.href = 'cashier.html';
        } else {
            window.location.href = 'waiter.html';
        }
        return;
    }
    
    showError('Username atau password salah!');
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('userLoggedIn');
    const loginTime = sessionStorage.getItem('loginTime');
    
    // Check if session expired (8 hours for staff, 1 hour for admin)
    if (isLoggedIn && loginTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(loginTime);
        const userRole = sessionStorage.getItem('userRole');
        const maxTime = userRole === 'admin' ? 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
        
        if (timeDiff > maxTime) {
            logout();
            return false;
        }
        
        return true;
    }
    
    return false;
}

function logout() {
    sessionStorage.removeItem('userLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('loginTime');
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
        if (userRole === 'cashier') {
            window.location.href = 'cashier.html';
        } else if (userRole === 'waiter') {
            window.location.href = 'waiter.html';
        } else {
            window.location.href = 'dashboard.html';
        }
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