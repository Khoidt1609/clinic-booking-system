document.addEventListener("DOMContentLoaded", async () => {
    const user = requiredAuth("PATIENT");
    if (!user) return;
    await loadAppointments(user.id);
})

async function loadAppointments(patientId) {
    const container = document.getElementById("appointmentsContainer");

    try {
        const appointments = await apiFetch(`appointments/patient/${patientId}`);
        console.log(appointments);
        renderAppointments(appointments);

    } catch (error) {
        showToast("Không thể tải danh sách lịch hẹn: " + error.message, "danger");
        document.getElementById('loadingIndicator').innerHTML = '<span class="text-danger">Lỗi tải dữ liệu.</span>';

    }
}

function renderAppointments(appointments) {
    document.getElementById('loadingIndicator').classList.add('d-none');

    const container = document.getElementById("appointmentsContainer");
    const emptyState = document.getElementById("emptyState");

    if (appointments.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    container.innerHTML = appointments.map(a => {
        const canCancel = a.status === "CONFIRMED";
        const actionButton = (a.status !== "CANCELLED" && a.status !== "COMPLETED")
            ? `<button class="btn btn-outline-danger btn-sm px-3 fw-medium" onclick="cancelAppointment(${a.appointmentId})"> 
                    <i class="bi bi-calendar-x me-1"></i> Hủy lịch hẹn 
               </button>`
            : "";
        return `
        
          <div class="card p-4 border border-light-subtle rounded-3 shadow-sm bg-white mb-2" id="card-${a.appointmentId}">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div class="d-flex align-items-start gap-3">
                    <div class="bg-info-subtle text-info rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 52px; height: 52px; flex-shrink: 0;">
                        <i class="bi bi-person-fill fs-4 text-cyan"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2 flex-wrap mb-1 text-dark">
                            Bác sĩ:<h5 class="fw-bold mb-0 text-dark" style="font-size: 1rem;">${a.doctorName}</h5></p>
                            ${getStatusBadgeHtml(a.status)}
                        </div>
                        
                        <div class="d-flex gap-3 text-muted small flex-wrap">
                            <span><i class="bi bi-calendar3 me-1 text-cyan"></i>${formatDateForView(a.appointmentDate)}</span>
                            <span><i class="bi bi-clock me-1 text-cyan"></i>${a.timeSlot}</span>
                        </div>
                        
                        ${a.symptoms ? `<div class="mt-2 text-secondary small bg-light p-2 rounded-2 border-start border-3 border-info-subtle"><strong>Triệu chứng:</strong> ${a.symptoms}</div>` :
                ` <p class="mt-2 mb-0 text-secondary small  p-2 ">Không có mô tả triệu chứng </p>`}
                    </div>
                </div>
                <div class="text-md-end align-self-end align-self-md-center">
                    ${actionButton}
                </div>
            </div>
        </div>`;
    }).join("");
}

async function cancelAppointment(appointmentId) {
    if (!confirm("Bạn chắc chắn muốn hủy lịch hẹn này?")) return;

    try {
        await apiFetch(`appointments/${appointmentId}/cancel`, {
            method: "PUT",
        });

        const user = getCurrentUser();
        document.getElementById("loadingIndicator").classList.remove("d-none");
        await loadAppointments(user.id);
    } catch (error) {
        showToast(error.message, "danger");
    }
}

