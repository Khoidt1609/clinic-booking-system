//  xử lý Navbar cuộn
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("mainNav");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

});



// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/index.html"
}

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("mainNav");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
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
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
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

