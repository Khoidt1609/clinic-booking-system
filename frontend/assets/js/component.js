document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    updateSidebarUser();

});

function renderSidebar() {
    const container = document.getElementById("sidebarContainer");

    if (!container) return;
    //Lấy file html từ url 
    const currentPath = window.location.pathname.split("/").pop() || "dashboard.html";
    // Danh sách menu
    const menuGroups = [
        {
            title: "Quản lý",
            items: [
                { name: "Quản lý lịch khám", icon: "bi-calendar2-check", link: "dashboard.html" },
                { name: "Hồ sơ bệnh nhân", icon: "bi-people", link: "patients.html" },
                // { name: "Lịch sử điều trị", icon: "bi-clock-history", link: "history.html" }
            ]
        },
        // {
        //     title: "Cá nhân",
        //     items: [
        //         { name: "Hồ sơ cá nhân", icon: "bi-person-badge", link: "profile.html" }
        //     ]
        // }
    ];

    const menuHtml = menuGroups.map(group => `
        <p class="text-uppercase text-muted small fw-bold px-2 mt-3 mb-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">${group.title}</p>
        <nav class="nav flex-column gap-1">
            ${group.items.map(item => {
        const isActive = currentPath === item.link ? "active" : "";
        return `
                <a href="${item.link}" class="sidebar-link ${isActive}">
                        <i class="bi ${item.icon} fs-5"></i>
                        <span>${item.name}</span>
                </a>
                `;
    }).join("")}
        </nav>
    `).join("");

    container.innerHTML = `
        <aside class="sidebar d-flex flex-column h-100 shadow-sm border-end bg-white">
            <!-- Logo -->
            <div class="p-3 border-bottom">
                <a class="d-flex align-items-center gap-2 fw-bold text-dark text-decoration-none fs-5" href="dashboard.html">
                    <div class=" d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <img src="../assets/images/logo-clinic-nobg.png" alt="logo clinic"
                        class="img-fluid h-100 object-fit-contain">
                    </div>
                    <span>Bảng điều khiển</span>
                </a>
            </div>
            
            <!-- Menu -->
            <div class="p-3 flex-grow-1 overflow-auto">
                ${menuHtml}
            </div>

            <!-- Profile & Đăng xuất -->
            <div class="p-3 border-top bg-light-subtle">
                <div class="d-flex align-items-center gap-3 px-1 mb-3">
                    <div class="bg-info-subtle text-cyan rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 42px; height: 42px;">
                        <i class="bi bi-person-fill fs-4"></i>
                    </div>
                    <div class="overflow-hidden">
                        <h6 class="mb-0 fw-bold text-dark" id="doctorNameDisplay">BS. Đang tải...</h6>
                    </div>
                </div>
                <button class="btn btn-outline-danger w-100 fw-medium btn-sm py-2" onclick="logout()">
                    <i class="bi bi-box-arrow-right me-1"></i> Đăng xuất
                </button>
            </div>
        </aside>
    `;
}

function updateSidebarUser() {
    const user = getCurrentUser();
    if (!user) {
        return;
    };

    try {
        const nameEl = document.getElementById("doctorNameDisplay");
        console.log(nameEl)
        if (nameEl) nameEl.textContent = `BS. ${user.fullName || user.name || ''}`;
    } catch (error) {
        console.error("Lỗi đọc thông tin user sidebar:", error);
    }
}