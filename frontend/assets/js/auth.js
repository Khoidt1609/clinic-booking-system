async function handleLogin(fromEvent) {
    fromEvent.preventDefault();
    const errorBox = document.getElementById("errorBox");
    errorBox.classList.add("d-none");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await apiFetch("auth/login", {
            method: "POST",
            body: {
                email: email, 
                password: password
            }
        });

        saveSession(response);

        if(response.role == "DOCTOR") {
             window.location.href = "/doctor/dashboard.html";
        } else {
             alert('🎉 Đăng nhập thành công!');
            window.location.href = "/patient/booking.html";
        }

    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove("d-none");
    }
}

async function handleRegister(fromEvent) {
    fromEvent.preventDefault();

    const errorBox = document.getElementById("errorBox");
    errorBox.classList.add("d-none");

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
        const response = await apiFetch("auth/register", {
            method: "POST",
            body: {
                fullName: fullName,
                email: email,
                phone: phone,
                password: password
            }
        });
        saveSession(response);

        window.location.href = "/patient/booking.html";
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove("d-none");
    }
}

//  xử lý ẩn/hiện mật khẩu áp dụng được cho nhiều ô input
document.querySelectorAll('.toggle-password').forEach(button => {    
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });
});
