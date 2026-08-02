const API_BASE_URL = "http://localhost:8080/api/"

/**
 * Hàm gọi API dùng chung 
 * @param {string} path - đường dẫn API
 * @param {object} options - { method, body }
 */

async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    }

    if(token) {
        headers["Authorization"] = "Bearer " + token;
    }
    
    const response = await fetch(API_BASE_URL + path, {
        ...options,
        headers,
        body: JSON.stringify(options.body)
    });

    // Token hết hạn hoặc không hợp lệ  tự động đăng xuất, về lại trang login
    if(response.status == 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../patient/login.html"

    }


    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof data === "string" ? data : (data.message || "Có lỗi xảy ra");
        console.error("API fetch error: ", error);
        throw new Error(message);
    }
    return data;
}

// Lưu lại thông tin đăng nhập vào localStorage 
function saveSession(authResponse) {
    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("user", JSON.stringify({
        id: authResponse.id,
        fullName: authResponse.fullName,
        email: authResponse.email,
        role: authResponse.role
    }))
}

function getCurrentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

function requiredAuth(expectedRole) {
    const user = getCurrentUser();

    if(!user) {
        window.location.href = "./patient/login.html";
        return null;
    }

    if (expectedRole && user.role !== expectedRole) {
        alert("Bạn không có quyền truy cập trang này");
        window.location.href = expectedRole === "DOCTOR" ? "/patient/login.html" : "/doctor/login.html";
        return null;
    }
  return user;
}

let _cachedDoctor = null;
async function getDoctor() {
    if(_cachedDoctor) {return _cachedDoctor;}
    _cachedDoctor = await apiFetch("doctors/default");

    return _cachedDoctor;
}

// LOGOUT
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/index.html"
}

document.addEventListener("DOMContentLoaded", () => {
    // Chạy hàm hiển thị nav mới
    renderAuthNav();

    // Lắng nghe sk click logout
    const container = document.getElementById("authNavArea");
    if(container) {
        container.addEventListener("click", function(event) {
            if(event.target && event.target.id == "logoutBtn") {
                event.preventDefault();
                logout();
            }
        })
    }
})



// Cập nhật vùng navbar theo trạng thái đăng nhập - dùng chung cho mọi trang có navbar
// containerId: id của thẻ div đang chứa nút Đăng nhập/Đăng ký (xem bước 2)
function renderAuthNav(containerId = "authNavArea") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getCurrentUser();

  if (user) {
    const dashboardUrl = user.role === "DOCTOR"
      ? "doctor/dashboard.html"
      : "patient/book-appointment.html";

    container.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-light  dropdown-toggle d-flex align-items-center gap-2"
                type="button" data-bs-toggle="dropdown">
          <span class="user-avatar-dot">${user.fullName.charAt(0).toUpperCase()}</span>
          ${user.fullName}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="${dashboardUrl}">Vào trang của tôi</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Đăng xuất</a></li>
        </ul>
      </div>
    `;
  } else {
    container.innerHTML = `
      <a href="patient/login.html" class="btn btn-light fw-medium text-dark border">Đăng nhập</a>
      <a href="patient/register.html" class="btn btn-cyan fw-medium shadow-sm">Đặt lịch ngay</a>
    `;
  }
}

