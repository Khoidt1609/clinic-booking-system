document.addEventListener("DOMContentLoaded", async () => {
    const user = requiredAuth("PATIENT");
    if (!user) return;

    await loadMedicalHistory(user.id);
})

async function loadMedicalHistory(patientId) {
    const container = document.getElementById("historyContainer");
    const errorBox = document.getElementById("errorBox");
    const loadingIndicator = document.getElementById('loadingIndicator');
    try {
        const records = await apiFetch(`medical-records/patient/${patientId}`);
        console.log(records);
        renderMedicalHistory(records);
    } catch (error) {
        loadingIndicator.classList.add('d-none');
        errorBox.textContent = "Không thể tải lịch sử khám: " + error.message;
        errorBox.classList.remove("d-none");
    }
}

function renderMedicalHistory(records) {
    document.getElementById('loadingIndicator').classList.add('d-none');
    const container = document.getElementById("historyContainer");
    const emptyState = document.getElementById("emptyState");

    if (records.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    container.classList.remove('d-none');

    container.innerHTML = records.map((record, index) => {
        const collapseId = `visit-${record.recordId}`;
        const medicalRows = (record.prescriptionItems || []).map(item =>
            `<tr>
                <td>${item.medicineName}</td>
                <td>${item.quantity}</td>
                <td>${item.dosageInstruction}</td>
            </tr>`
        ).join("");

        return `
            <div class="app-card p-4 mb-3">
                <div class="d-flex justify-content-between align-items-center bg-white collapse-toggle"
                style="cursor: pointer;" data-bs-toggle="collapse"  data-bs-target="#${collapseId}" aria-expanded="false">
                    
                    <div class="d-flex align-items-center gap-3">
                        <div class="bg-info-subtle text-info rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; flex-shrink: 0;">
                            <i class="bi bi-journal-text fs-4 text-cyan"></i>
                        </div>
                        <div>
                            <div class="fw-medium">${record.doctorDiagnosis || "Chưa có chẩn đoán"}</div>
                            <div class="fw-semibold text-muted small">${formatDate(record.appointmentDate)}</div>
                        </div>
                       
                    </div>
                    <i class="bi bi-chevron-down"></i>
                </div>
                
                <div class="collapse mt-3" id="${collapseId}">
                    <hr>                   
                    <div class="row mb-3">
                            <div class="col-md-12">
                                <p class="mb-2 text-muted small text-uppercase fw-bold">Chẩn đoán: ${record.doctorDiagnosis || "-"}</p>
                                <p class="mb-1 text-muted small text-uppercase fw-bold">Ghi chú của bác sĩ</p>
                                <p class="mb-0 text-dark">${record.doctorNotes || "Không có ghi chú thêm."}</p>
                            </div>
                    </div>
                    ${record.prescriptionItems && record.prescriptionItems.length > 0 ? `
                        <table class="table table-sm prescription-table small">
                            <thead>
                                <tr>
                                    <th>Tên thuốc</th>
                                    <th>Số lượng</th>
                                    <th>Cách dùng</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${medicalRows}
                            </tbody>
                        </table>
                        <a href="../print-prescription.html?appointmentId=${record.appointmentId}"
                            target="_blank" class="btn btn-outline-cyan btn-sm p-2">
                            <i class="bi bi-printer"></i> Xem / In đơn thuốc
                        </a>
                    ` : `<p class="text-muted small">Lần khám này không có kê đơn thuốc.</p>`}
                </div>
            </div>`
    }).join("");
}