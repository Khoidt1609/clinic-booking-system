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
        console.error("API fetch error: ", message);
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
        window.location.href = "/patient/login.html";
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
