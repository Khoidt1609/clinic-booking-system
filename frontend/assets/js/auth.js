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

        console.log(" API phản hồi thành công, dữ liệu nhận được:", response);

        saveSession(response);
        console.log(" Đã chạy xong hàm saveSession");

        if (response.role == "DOCTOR") {
            showToast('Đăng nhập thành công với vai trò bác sĩ!');
            console.log(" Chuyển hướng sang trang doctor dashboard sau 1.2s");
            setTimeout(() => window.location.href = "/doctor/dashboard.html", 1200);
        } else {
            showToast('Đăng nhập thành công!');
            console.log(" Chuyển hướng sang trang index sau 1.2s");
            setTimeout(() => window.location.href = "/index.html", 1200);
        }

    } catch (error) {
        console.error(" Lỗi bắt được trong khối CATCH:", error);
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
        showToast('Đăng ký thành công!');
        setTimeout(() => window.location.href = "/patient/login.html", 1200);
        // window.location.href = "/index.html";
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove("d-none");
    }
}

//  xử lý ẩn/hiện mật khẩu áp dụng được cho nhiều ô input
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
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
