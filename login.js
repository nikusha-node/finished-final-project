window.addEventListener("scroll", function() {
    const header = document.querySelector(".fixed");
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// Switching forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");
const showRegisterNav = document.getElementById("showRegisterNav");

// Handle Register link in navigation
if (showRegisterNav) {
    showRegisterNav.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.remove("active");
        registerForm.classList.add("active");
        // Smooth scroll to form
        document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
    });
}

showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
});


showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
});


const showLoading = () => {

    if (Swal.isVisible()) {
        Swal.close();
    }
    
    Swal.fire({
        title: 'Processing...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

const showError = (message) => {
    try {

        if (Swal.isVisible()) {
            Swal.close();
        }
        

        if (message) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                confirmButtonColor: '#4361ee',
                confirmButtonText: 'OK',
                allowOutsideClick: true,
                allowEscapeKey: true,
                allowEnterKey: true
            });
        }
    } catch (e) {
        // Silently handle any errors
        console.error('Error showing error message:', e);
    }
    return Promise.resolve();
};

// ✅ Show success function
const showSuccess = (message, redirectUrl = null) => {
    // Close loading dialog if it's open
    if (Swal.isVisible()) {
        Swal.close();
    }
    
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        confirmButtonColor: '#4361ee',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    }).then(() => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    });
};

// ✅ LOGIN FORM SUBMIT
loginForm.onsubmit = (e) => {
    e.preventDefault();
    showLoading();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        Swal.close();
        showError('Please fill in all fields');
        return;
    }

    // Simulate API call delay
    setTimeout(() => {
        // ✅ get all users
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // ✅ find matching user
        const user = users.find((u) => u.email === email);

        if (!user) {
            Swal.close();
            showError('No account found with this email');
            return;
        }

        if (user.password !== password) {
            Swal.close();
            showError('Incorrect password');
            return;
        }

        // ✅ Save session
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("currentUser", email);
        
        showSuccess('Login successful!', 'profile.html');
    }, 800);
};

// ✅ Validate email format
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// ✅ Validate password strength
const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

// ✅ Validate phone number
const isValidPhone = (phone) => {
    // Basic phone validation - adjust as needed
    const re = /^[0-9\s\-()]+$/;
    return re.test(phone) && phone.replace(/[^0-9]/g, '').length >= 8;
};

// ✅ REGISTER FORM SUBMIT
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const countryCode = document.getElementById("countryCode").value;
    const phone = document.getElementById("regPhone").value.trim();
    const fullPhone = countryCode + " " + phone;

    // Basic validation
    if (!name || !phone || !email || !password) {
        Swal.close();
        showError('Please fill in all required fields');
        return;
    }

    if (!isValidEmail(email)) {
        Swal.close();
        showError('Please enter a valid email address');
        return;
    }

    if (!isValidPhone(phone)) {
        Swal.close();
        showError('Please enter a valid phone number');
        return;
    }

    if (!isStrongPassword(password)) {
        Swal.close();
        showError('Password must be at least 8 characters long and include uppercase, lowercase, and numbers');
        return;
    }

    // Simulate API call delay
    setTimeout(() => {
        // ✅ Load users array from localStorage
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // ✅ Check for existing email
        const emailExists = users.some((u) => u.email === email);

        if (emailExists) {
            Swal.close();
            showError('This email is already registered!');
            return;
        }

        // ✅ Check for existing phone
        const phoneExists = users.some((u) => u.phone === fullPhone);

        if (phoneExists) {
            Swal.close();
            showError('This phone number is already registered!');
            return;
        }

        // ✅ Add new user
        users.push({ 
            name, 
            phone: fullPhone, 
            email, 
            password,
            createdAt: new Date().toISOString()
        });

        // ✅ Save back to storage
        localStorage.setItem("users", JSON.stringify(users));

        // ✅ Save login session
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("currentUser", email);
        
        showSuccess('Registration successful!', 'profile.html');
    }, 1000);
});

// ✅ REGISTER SUBMIT
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const countryCode = document.getElementById("countryCode").value;
    const phone = document.getElementById("regPhone").value;

    const fullPhone = countryCode + " " + phone;

    if (!name || !phone || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    // ✅ Load users array from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // ✅ Check for existing email
    const emailExists = users.some((u) => u.email === email);

    if (emailExists) {
        showError("This email is already registered!");
        return;
    }

    // ✅ Check for existing phone
    const phoneExists = users.some((u) => u.phone === fullPhone);

    if (phoneExists) {
        showError("This phone number is already registered!");
        return;
    }

    // ✅ Add new user
    users.push({ name, phone: fullPhone, email, password });

    // ✅ Save back to storage
    localStorage.setItem("users", JSON.stringify(users));

    // ✅ Save login session
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", email);

    // ✅ Redirect
    window.location.href = "profile.html";
});


// Burger menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    if (burger && nav) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                burger.classList.remove('active');
            });
        });
    }
});
