let currentAppointment = null;
let existingRecordId = null;

let globalPatientRecords = []; // Lưu trữ tạm danh sách bệnh án cũ

document.addEventListener("DOMContentLoaded", async () => {
    const doctor = requiredAuth("DOCTOR");
    if (!doctor) return;
    const addMedBtn = document.getElementById("addMedicineBtn");
    const prescriptionBody = document.getElementById("prescriptionBody");

    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get("id");
    const examForm = document.getElementById('examinationForm');
    console.log(urlParams)
    if (!appointmentId) {
        showToast("Không tìm thấy thông tin ca khám!", "danger");
        window.location.href = 'dashboard.html';
        return;
    };


    await loadAppointmentInfo(appointmentId);
    if (currentAppointment) {
        await loadPatientProfile(currentAppointment.patientId);
        await loadPatientHistory(currentAppointment.patientId, currentAppointment.id || currentAppointment.appointmentId);
        await loadExistingRecord(currentAppointment.id || currentAppointment.appointmentId);
    }

    if (addMedBtn) {
        addMedBtn.addEventListener("click", () => addMedicineRow());
    }
    if (prescriptionBody) {
        prescriptionBody.addEventListener("click", (event) => {
            // .closest giúp tìm trúng nút xóa kể cả khi bác sĩ bấm lệch vào icon dấu X bên trong
            const deleteBtn = event.target.closest(".removeMedicineBtn");

            // Nếu đúng là bấm vào nút xóa, gọi hàm xóa dòng
            if (deleteBtn) {
                removeMedicineRow(deleteBtn);
            }
        });
    }
    if (examForm) {
        examForm.addEventListener("submit", (event) => submitExamination(event));
    }

    if (document.querySelectorAll("#prescriptionBody tr").length === 0) {
        addMedicineRow();
    }

    const printBtn = document.getElementById("btn-print-prescription");
    if (printBtn && existingRecordId) {
        printBtn.disabled = false;
        printBtn.addEventListener("click", () => {
            // Kiểm tra xem dữ liệu lịch hẹn có tồn tại 
            if (currentAppointment && currentAppointment.appointmentId) {
                const printUrl = `/doctor/print-prescription.html?appointmentId=${currentAppointment.appointmentId}`;
                window.open(printUrl, '_blank');
            } else {
                showToast("Không tìm thấy mã lịch hẹn để in đơn thuốc!", "danger");
            }
        });
    }
})

async function loadAppointmentInfo(appointmentId) {
    try {
        currentAppointment = await apiFetch(`appointments/${appointmentId}`);
        console.log(currentAppointment);
        document.getElementById("patientName").textContent = currentAppointment.patientName;
        document.getElementById('examTime').innerHTML = `<i class="bi bi-clock"></i> Giờ khám: ${currentAppointment.timeDisplay || currentAppointment.timeSlot}`;
        document.getElementById('appointmentDate').innerHTML = `<i class="bi bi-calendar3"></i> Ngày khám: ${formatDateForView(currentAppointment.appointmentDate)}`;
        document.getElementById('patientSymptoms').textContent = currentAppointment.symptoms || "Không có ghi chú triệu chứng ban đầu.";

        // Ẩn loading, hiện form
        document.getElementById('loadingPatient').classList.add('d-none');
        document.getElementById('examinationContainer').classList.remove('d-none');
    } catch (error) {
        document.getElementById('loadingPatient').innerHTML = `
            <div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Lỗi: ${error.message}</div>
            <a href="dashboard.html" class="btn btn-primary mt-3">Quay lại lịch khám</a>
        `;
    }
}

async function loadPatientProfile(patientId) {
    const container = document.getElementById("patientProfileContainer");
    console.log(container)
    try {
        const profile = await apiFetch(`profiles/${patientId}`);
        console.log(profile)
        container.innerHTML = `
            <div class="row g-2 small">
                <div class="col-6"><strong>Ngày sinh:</strong> ${profile.dateOfBirth || "Chưa cập nhật"}</div>
                <div class="col-6"><strong>Giới tính:</strong> ${translateGender(profile.gender)}</div>
                <div class="col-6"><strong>Nhóm máu:</strong> ${profile.bloodType || "Chưa cập nhật"}</div>
                <div class="col-6"><strong>SĐT:</strong> ${profile.phone || "-"}</div>
                <div class="col-12"><strong>Địa chỉ:</strong> ${profile.address || "Chưa cập nhật"}</div>
                <div class="col-12"><strong>Dị ứng:</strong>
                    <span class="${profile.allergies ? 'text-danger fw-semibold' : ''}">${profile.allergies || "Không có"}</span>
                </div>
                <div class="col-12"><strong>Tiền sử bệnh lý:</strong> ${profile.medicalHistory || "Không có"}</div>
            </div>`;

    } catch (error) {
        container.innerHTML = `<p class="text-muted small mb-0">Không tải được hồ sơ bệnh nhân</p>`;
        console.log(error)

    }
}

async function loadPatientHistory(patientId, currentAppointmentId) {
    const container = document.getElementById("historyOffcanvasBody");

    try {
        const records = await apiFetch(`medical-records/patient/${patientId}`);
        console.log(records);

        globalPatientRecords = records.filter(record => String(record.appointmentId) !== String(currentAppointmentId));
        console.log(globalPatientRecords)
        if (globalPatientRecords.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <p class="small mb-0">Đây là ca khám đầu tiên của bệnh nhân.</p>
                </div>`;
            return;
        }
        container.innerHTML = globalPatientRecords.map((record, index) => `
            <div class="card mb-3 border shadow-sm rounded-3">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold small">
                            <i class="bi bi-calendar-event me-1"></i>${formatDateForView(record.appointmentDate)}
                        </span>
                        <span class="badge bg-light text-dark border">BS. ${record.doctorName || "Khác"}</span>
                    </div>
                    
                    <div class="mb-2">
                        <small class="text-muted d-block">Chẩn đoán:</small>
                        <div class="fw-semibold text-dark text-truncate">${record.doctorDiagnosis || "Chưa ghi nhận"}</div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                        <small class="text-muted">
                            <i class="bi bi-capsule me-1"></i>${(record.prescriptionItems || []).length} loại thuốc
                        </small>
                        <button type="button" class="btn btn-sm btn-outline-cyan py-1 px-3 rounded-pill" 
                                onclick="openRecordDetailModal(${index})">
                            Xem chi tiết <i class="bi bi-arrow-right me-1"></i>
                        </button>
                    </div>
                </div>
            </div>`).join("");
    } catch (error) {
        container.innerHTML = `<p class="text-muted small mb-0">Không tải được lịch sử khám của bệnh nhân</p>`;

    }
}

// Xem bệnh án đã khám, nếu có tồn tại chuyển sang sửa
async function loadExistingRecord(appointmentId) {
    try {
        const record = await apiFetch(`medical-records/appointment/${appointmentId}`);
        // console.log(record)
        if (!record) {
            existingRecordId = null;
            return;
        }
        existingRecordId = record.recordId;

        document.getElementById("doctorDiagnosis").value = record.doctorDiagnosis || "";
        document.getElementById("doctorNotes").value = record.doctorNotes || "";

        // document.getElementById("prescriptionRows").innerHTML = "";
        (record.prescriptionItems || []).forEach(item => addMedicineRow(item));

        document.getElementById("submitBtnLabel").textContent = "Cập nhật bệnh án";


    } catch (error) {
        existingRecordId = null;
        console.log(error);
    }
}

// logic xử lý bảng kê đơn thuốc
function addMedicineRow(item = null) {
    const tbody = document.getElementById("prescriptionBody");
    const emptyMsg = document.getElementById('emptyPrescriptionMsg');

    emptyMsg.classList.add('d-none');
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td class="ps-4 py-3">
            <input type="text" class="form-control form-control-sm med-name"
                placeholder="Tên thuốc..." value="${item ? item.medicineName : ""}" required>
        </td>
        <td class="py-3">
            <input type="number" class="form-control form-control-sm med-quantity"
                placeholder="SL (Vd: 10 viên)" value="${item ? item.quantity : ""}" required>
        </td>
        <td class="py-3">
            <input type="text" class="form-control form-control-sm med-dosage"
               value="${item ? item.dosageInstruction : ""}" placeholder="Cách dùng (Sáng 1, Tối 1...)">
        </td>
        <td class="pe-4 py-3 text-end">
            <button type="button"
                class="btn btn-delete-danger border-0 btn-sm p-1 removeMedicineBtn"
                style="width: 28px; height: 28px;"
                 title="Xóa dòng này">
                <i class="bi bi-x-lg"></i>
               </button>
        </td>`;

    tbody.appendChild(tr);
}

function removeMedicineRow(button) {
    const row = button.closest("tr");
    row.remove();
    const tbody = document.getElementById('prescriptionBody');
    if (tbody.children.length === 0) {
        document.getElementById('emptyPrescriptionMsg').classList.remove('d-none');
    }
}
// Logic hoàn tất khám 
async function submitExamination(event) {
    event.preventDefault();

    const btnSubmit = document.getElementById("btnSubmitExam");
    const alertBox = document.getElementById("submitAlert");
    const doctorDiagnosis = document.getElementById("doctorDiagnosis").value.trim();
    const doctorNotes = document.getElementById("doctorNotes").value.trim();

    // Lấy danh sách thuốc từ table
    const prescriptionItems = [];
    const rows = document.querySelectorAll("#prescriptionBody tr");

    rows.forEach(row => {
        const name = row.querySelector(".med-name").value.trim();
        const quantity = row.querySelector(".med-quantity").value.trim();
        const dosage = row.querySelector(".med-dosage").value.trim();

        if (name && quantity) {
            prescriptionItems.push({
                medicineName: name,
                quantity: quantity,
                dosageInstruction: dosage
            })
        };
    });

    const request = {
        appointmentId: parseInt(currentAppointment.appointmentId),
        doctorDiagnosis: doctorDiagnosis,
        doctorNotes: doctorNotes,
        prescriptionItems: prescriptionItems
    };

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý...';
    alertBox.classList.add('d-none');


    try {

        const method = existingRecordId ? "PUT" : "POST";
        const endpoint = existingRecordId ? `medical-records/${existingRecordId}` : "medical-records";

        await apiFetch(endpoint, {
            method: method,
            body: request
        });

        alertBox.className = "alert alert-success mt-4";
        alertBox.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Lưu hồ sơ bệnh án thành công!';
        alertBox.classList.remove('d-none');

        // Quay lại bảng điều khiển sau 1.5 giây
        // setTimeout(() => {
        //     window.location.href = 'dashboard.html';
        // }, 1500);
    } catch (error) {
        alertBox.className = "alert alert-danger mt-4";
        alertBox.innerHTML = `<i class="bi bi-x-circle-fill me-2"></i> Lỗi: ${error.message}`;
        alertBox.classList.remove('d-none');

    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Hoàn tất khám';

    }
}

// Hàm mở Modal hiển thị Toàn bộ Chi tiết của 1 Bệnh án
function openRecordDetailModal(index) {
    const record = globalPatientRecords[index];
    if (!record) return;

    const modalBody = document.getElementById("recordDetailModalBody");
    const items = record.prescriptionItems || [];

    // Tạo bảng đơn thuốc chi tiết
    const prescriptionTableHTML = items.length > 0 ? `
        <table class="table table-sm table-bordered align-middle mb-0">
            <thead class="bg-light">
                <tr>
                    <th>Tên thuốc</th>
                    <th style="width: 20%">Số lượng</th>
                    <th style="width: 45%">Cách dùng / Liều dùng</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(p => `
                    <tr>
                        <td class="fw-semibold">${p.medicineName}</td>
                        <td>${p.quantity}</td>
                        <td class="small text-muted">${p.dosageInstruction || 'Theo chỉ định'}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    ` : '<p class="text-muted small fst-italic mb-0">Không kê đơn thuốc trong lần khám này.</p>';


    modalBody.innerHTML = `
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <small class="text-muted d-block">Ngày khám:</small>
                <strong>${formatDateForView(record.appointmentDate)}</strong>
            </div>
            <div class="col-md-6">
                <small class="text-muted d-block">Bác sĩ điều trị:</small>
                <strong>BS. ${record.doctorName || "Chưa rõ"}</strong>
            </div>
        </div>

        <div class="p-3 bg-light rounded-3 mb-3 border">
            <small class="text-muted d-block fw-bold text-uppercase mb-1">Chẩn đoán lâm sàng:</small>
            <div class="fw-bold text-danger fs-6">${record.doctorDiagnosis || "Không có"}</div>
        </div>

        <div class="mb-3">
            <small class="text-muted d-block fw-bold text-uppercase mb-1">Lời khuyên / Ghi chú của bác sĩ:</small>
            <div class="p-2 border rounded bg-white text-dark small">${record.doctorNotes || "Không có ghi chú."}</div>
        </div>

        <div>
            <small class="text-muted d-block fw-bold text-uppercase mb-2">Chi tiết đơn thuốc đã kê:</small>
            ${prescriptionTableHTML}
        </div>
    `;

    // Khởi tạo và Bật Modal Bootstrap
    const detailModal = new bootstrap.Modal(document.getElementById('recordDetailModal'));
    detailModal.show();
}