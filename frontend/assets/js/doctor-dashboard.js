document.addEventListener("DOMContentLoaded", async () => {
    const doctor = requiredAuth("DOCTOR");
    if (!doctor) return;

    setToday(doctor.id);

    const dateInput = document.getElementById("filterDate");
    dateInput.addEventListener("change", async (e) => {
        await loadDoctorAppointments(doctor.id, e.target.value)
    });

    const todayBtn = document.getElementById("todayBtn");
    todayBtn.addEventListener("click", async () => {
        await setToday(doctor.id);
    });
})
// Hàm gắn ngày hiện tại và load data
async function setToday(doctorId) {
    const now = new Date();
    const dateInput = document.getElementById("filterDate");
    const todayStr = formatDateForInput(now);

    dateInput.value = todayStr;
    await loadDoctorAppointments(doctorId, todayStr);
}

async function loadDoctorAppointments(doctorId, date) {
    const tbody = document.getElementById("appointmentTableBody");
    const loading = document.getElementById("loadingIndicator");
    const emptyState = document.getElementById("emptyState");

    // Reset giao dien
    tbody.innerHTML = "";
    emptyState.classList.add('d-none');
    loading.classList.remove('d-none');

    try {
        const appointments = await apiFetch(`appointments/doctor?doctorId=${doctorId}&date=${date}`);
        renderSchedule(appointments, date);
        updateStats(appointments);
    } catch (error) {
        showToast("Lỗi khi tải lịch khám: " + error.message, "danger");
    } finally {
        loading.classList.add('d-none');
    }
}

function renderSchedule(appointments, selectDate) {
    const tbody = document.getElementById("appointmentTableBody");
    const emptyState = document.getElementById("emptyState");

    if (!appointments || appointments.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    const now = new Date();
    const todayStr = formatDateForInput(now);

    const isFutureDate = selectDate > todayStr;

    tbody.innerHTML = appointments.map(app => {
        let actionBtn = "";

        if (app.status === "CONFIRMED") {
            // if (isFutureDate) {
            //     // Khóa nút nếu chưa đến ngày khám
            //     actionBtn = `<button class="btn btn-sm btn-secondary" disabled title="Chưa đến ngày khám">
            //                     <i class="bi bi-lock me-1"></i> Khám bệnh
            //                  </button>`;
            // } else {
            // Chuyển sang trang khám bệnh theo id
            actionBtn = `<a href="examination.html?id=${app.appointmentId}" class="btn btn-sm btn-primary">
                                <i class="bi bi-stethoscope me-1"></i> Khám bệnh
                             </a>`;
            // }
        } else if (app.status === 'COMPLETED') {
            // Chuyển hướng sang trang xem Lịch sử bệnh án
            actionBtn = `<a href="examination.html?id=${app.appointmentId}" class="btn btn-sm btn-outline-cyan">
                            <i class="bi bi-eye me-1"></i> Xem bệnh án
                          </a>`;
        }

        return `
            <tr>
                <td class="px-4 fw-medium text-dark">
                    <i class="bi bi-clock me-2 text-cyan"></i>${app.timeDisplay || app.timeSlot}
                </td>
                <td>
                    <div class="fw-bold text-dark">${app.patientName}</div>
                    <div class="small text-muted">Mã: #PT-${app.patientId || app.appointmentId}</div>
                </td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 250px;" title="${app.symptoms || ''}">
                        ${app.symptoms || "Không có ghi chú"}
                    </span>
                </td>
                <td>
                   
                    ${getStatusBadgeHtml(app.status)}
                </td>
                <td class="px-4 text-end">
                    ${actionBtn}
                </td>
            </tr>
        `;
    }).join("");
}

function updateStats(appointments) {
    let waiting = 0;
    let completed = 0;

    appointments.forEach(app => {
        if (app.status === "CONFIRMED") waiting++;
        if (app.status === "COMPLETED") completed++;
    });

    document.getElementById("statTotal").textContent = appointments.length;
    document.getElementById("statWaiting").textContent = waiting;
    document.getElementById("statCompleted").textContent = completed;


}