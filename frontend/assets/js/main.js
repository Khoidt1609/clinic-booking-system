//  xử lý Navbar cuộn
document.addEventListener("DOMContentLoaded", function() {
            const navbar = document.getElementById("mainNav");
            
            window.addEventListener("scroll", function() {
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
            
            window.addEventListener("scroll", function() {
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

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}