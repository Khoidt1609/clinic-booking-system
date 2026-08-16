//  xử lý Navbar cuộn

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("mainNavbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  renderNavbar();
  // Chạy hàm hiển thị nav mới
  renderAuthNav();

  // Lắng nghe sk click logout
  const container = document.getElementById("authNavArea");
  if (container) {
    container.addEventListener("click", function (event) {
      if (event.target && event.target.id == "logoutBtn") {
        event.preventDefault();
        logout();
      }
    })
  }
})

const indexNavItems = [
  { name: "Giới thiệu", link: "../index.html" },
  { name: "Đặt Lịch", link: "/patient/booking.html" },
  { name: "Dịch vụ", link: "/index.html#services" },
  { name: "Liên hệ", link: "/index.html#contact" }
];

const patientNavItems = [
  { name: "Đặt lịch khám", link: "booking.html" },
  { name: "Lịch hẹn của tôi", link: "appointments.html" },
  { name: "Hồ sơ sức khỏe", link: "profile.html" },
  { name: "Lịch sử khám", link: "medical-history.html" }
];

function renderNavbar() {
  const container = document.getElementById("mainNavbar");

  if (!container) return;
  //Lấy file html từ url 
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  let items = [];
  if (currentPath == "index.html" || currentPath == "login.html" || currentPath == "register.html") {
    items = indexNavItems;
  } else {
    items = patientNavItems;
  }
  console.log(items);
  const item = items.map(item => {
    const isActive = currentPath === item.link ? "active" : "";
    return `
                <li  class="nav-item">
                  <a href="${item.link}" class="nav-link ${isActive}">
                
                          <span>${item.name}</span>
                  </a>
                </li>
                `;
  }).join("")


  container.innerHTML = `
      <nav class="navbar app-navbar navbar-expand-lg ">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2 " href="/index.html">
                <div class=" d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <img src="../assets/images/logo-clinic-nobg.png" alt="logo clinic"
                        class="img-fluid h-100 object-fit-contain">
                </div>
                Phòng khám Nhẫn Tâm
            </a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <i class="bi bi-list fs-1 text-secondary"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
                    ${item}
                </ul>
                <div class="d-flex w-sm-100 w-lg-auto  gap-2" id="authNavArea">
                    <a href="/patient/login.html"
                        class="btn btn-light fw-medium text-dark border flex-fill w-lg-auto">Đăng nhập</a>
                    <a href="/patient/login.html" class="btn btn-cyan fw-medium shadow-sm flex-fill w-lg-auto">Đặt lịch
                        ngay</a>
                </div>
            </div>
        </div>
    </nav>
    `;
};

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/index.html"
}




// Cập nhật vùng navbar theo trạng thái đăng nhập - dùng chung cho mọi trang có navbar
// containerId: id của thẻ div đang chứa nút Đăng nhập/Đăng ký (xem bước 2)
function renderAuthNav(containerId = "authNavArea") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const isSubFolder = window.location.pathname.includes('/patient/') || window.location.pathname.includes('/doctor/');
  const prefix = isSubFolder ? "../" : "./"; // Nếu ở index, prefix sẽ là ./
  const user = getCurrentUser();

  if (user) {

    const dashboardUrl = user.role === "DOCTOR"
      ? `${prefix}doctor/dashboard.html`
      : `${prefix}patient/book-appointment.html`;

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
      <a href="${prefix}patient/login.html" class="btn btn-light fw-medium text-dark border">Đăng nhập</a>
      <a href="${prefix}patient/register.html" class="btn btn-cyan fw-medium shadow-sm">Đặt lịch ngay</a>
    `;
  }
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "1080";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toastEl.setAttribute("role", alert);
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

const statusMap = {
  CONFIRMED: { label: "Chờ khám", cls: "status-badge--confirmed" },
  CANCELLED: { label: "Đã hủy", cls: "status-badge--cancelled" },
  COMPLETED: { label: "Đã khám xong", cls: "status-badge--completed" }
};

function getStatusBadgeHtml(status) {
  const badge = statusMap[status] || { label: status, cls: "bg-light text-dark" };
  return `<span class="badge status-badge ${badge.cls} fw-semibold px-2.5 py-1" style="font-size: 0.8rem;">${badge.label}</span>`
}


function formatDateForView(isoDate) {
  if (!isoDate) return "Chưa cập nhật";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function formatDateForInput(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function translateGender(g) {
  return { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" }[g] || "Chưa cập nhật";
}

