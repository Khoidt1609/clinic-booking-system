let selectedPatientRecords = [];
let searchDebounceTimer = null;
let selectedPatientId = null;

document.addEventListener("DOMContentLoaded", async () => {
    const doctor = requiredAuth("DOCTOR");
    if (!doctor) return;

    await searchPatients("");

    document.getElementById("searchPatient").addEventListener("input", (event) => {
        clearTimeout(searchDebounceTimer);
        const keyword = event.target.value.trim();

        searchDebounceTimer = setTimeout(() => searchPatients(keyword), 400);
    })

})

async function searchPatients(keyword) {
    const listContainer = document.getElementById("patientList");
    try {
        const patients = await apiFetch(`profiles/search?keyword=${encodeURIComponent(keyword)}`);
        renderPatientList(patients);
    } catch (error) {
        listContainer.innerHTML = `<div class="p-3 text-danger small">Lỗi tải danh sách: ${error.message}</div>`;
    }
}

function renderPatientList(patients) {
    const listContainer = document.getElementById("patientList");

    if (patients.length === 0) {
        listContainer.innerHTML = `<p class="text-muted text-center py-4 small">Không tìm thấy bệnh nhân nào</p>`;
        return;
    }

    listContainer.innerHTML = patients.map(patient => `
        <div class="patient-item" onclick="selectPatient(${patient.patientId}, this)">
            <div class="fw-bold text-dark mb-1">${patient.fullName}</div>
            <div class="d-flex justify-content-between small text-muted">
                <span><i class="bi bi-telephone"></i> ${patient.phone || 'Chưa cập nhật'}</span>
                <span>${patient.gender === 'MALE' ? 'Nam' : (patient.gender === 'FEMALE' ? 'Nữ' : 'Không rõ')}</span>
            </div>
        </div>
        `).join("");
}

async function selectPatient(patientId, element) {
    document.querySelectorAll(".patient-item").forEach(el => el.classList.remove("active"));
    element.classList.add("active");

    document.getElementById("emptyDetailState").classList.add("d-none");
    const detailContainer = document.getElementById("patientDetailContent");
    // console.log(detailContainer)
    detailContainer.classList.remove("d-none");

    try {
        const [profile, record] = await Promise.all([
            apiFetch(`profiles/${patientId}`),
            apiFetch(`medical-records/patient/${patientId}`)
        ]);
        renderPatientDetail(profile, record);
        console.log(profile)
        console.log(record)

    } catch (error) {
        showToast("Lỗi tải hồ sơ: " + error.message, "danger");
        detailContainer.classList.add("d-none");
        document.getElementById("emptyDetailState").classList.remove("d-none");
    }
}

function renderPatientDetail(profile, records) {
    const detailContainer = document.getElementById("patientDetailContent");
    document.getElementById("detailName").textContent = profile.fullName;
    document.getElementById("detailDob").textContent = formatDateForView(profile.dateOfBirth) || "";

    document.getElementById("detailGender").textContent = profile.gender === 'MALE' ? 'Nam' : (profile.gender === 'FEMALE' ? 'Nữ' : 'Khác');
    document.getElementById("detailBlood").textContent = profile.bloodType || "Chưa xét nghiệm";
    document.getElementById("detailPhone").textContent = profile.phone || "---";
    document.getElementById("detailAddress").textContent = profile.address || "---";
    document.getElementById("detailAllergies").textContent = profile.allergies || "---";
    document.getElementById("detailMedicalHistory").textContent = profile.medicalHistory || "---";


    const timelineContainer = document.getElementById("medicalHistoryTimeline");

    if (!records || records.length === 0) {
        timelineContainer.innerHTML = '<div class="text-muted small fst-italic">Bệnh nhân chưa có lịch sử khám bệnh.</div>';
        return;
    }

    timelineContainer.innerHTML = records.map((record, index) => {
        const collapseId = `visit-${record.recordId}`;
        const medicalRows = (record.prescriptionItems || []).map(item =>
            `<tr>
                <td class="fw-semibold text-dark">${item.medicineName}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-dark">${item.quantity}</span></td>    
                <td>${item.dosageInstruction || 'Theo chỉ định'}</td>
            </tr>`
        ).join("");

        return `
            <div class="timeline-item">
                <div class="app-card p-4 mb-3 small">
                    <div class="d-flex justify-content-between align-items-center bg-white collapse-toggle"
                    style="cursor: pointer;" data-bs-toggle="collapse"  data-bs-target="#${collapseId}" aria-expanded="false">
                        
                        <div class="d-flex align-items-center gap-3">
                            <div class="bg-info-subtle text-info rounded-3 p-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; flex-shrink: 0;">
                                <i class="bi bi-journal-text fs-4 text-cyan"></i>
                            </div>
                            <div>
                                <div class="fw-medium">${record.doctorDiagnosis || "Chưa có chẩn đoán"}</div>
                                <div class="fw-semibold text-muted small">${formatDateForView(record.appointmentDate)}</div>
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
                            <table class="table table-sm align-middle prescription-table small">
                                <thead>
                                    <tr>
                                        <th>Tên thuốc</th>
                                        <th style="width: 15%">Số lượng</th>
                                        <th>Cách dùng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${medicalRows}
                                </tbody>
                            </table>
                            <a href="/doctor/print-prescription.html?appointmentId=${record.appointmentId}"
                                target="_blank" class="btn btn-outline-cyan btn-sm p-2">
                                <i class="bi bi-printer"></i> Xem / In đơn thuốc
                            </a>
                        ` : `<p class="text-muted small">Lần khám này không có kê đơn thuốc.</p>`}
                    </div>
                </div>
            </div>`
    }).join("");
}