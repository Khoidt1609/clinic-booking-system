document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get("appointmentId");

    if (!appointmentId) {
        alert("Lỗi: Không tìm thấy mã bệnh án để in!");
        window.close();
        return;
    }

    await loadPrescriptionData(appointmentId);

})

async function loadPrescriptionData(appointmentId) {
    try {
        const record = await apiFetch(`medical-records/appointment/${appointmentId}`)
        const appointment = await apiFetch(`appointments/${appointmentId}`)

        console.log(record)
        console.log(appointment)

        if (!record) {
            showToast("Ca khám này chưa có bệnh án hoặc chưa có bệnh án", "warning");
            return;
        }

        let patientProfile = {};
        if (appointment.patientId) {
            try {
                patientProfile = await apiFetch(`profiles/${appointment.patientId}`);
                console.log(patientProfile)
            } catch (error) {
                console.log("Không tải được profile bệnh nhân");
            }
        }

        document.getElementById("printPatientName").textContent = record.patientName || "";
        document.getElementById("printGender").textContent = translateGender(patientProfile.gender);
        if (patientProfile.dateOfBirth) {
            const birthYear = new Date(patientProfile.dateOfBirth).getFullYear();
            const currentYear = new Date().getFullYear();
            document.getElementById("printAge").textContent = `${currentYear - birthYear} tuổi`
        } else {
            console.log("Khong tim thay tuoi");
        }
        document.getElementById("printAddress").textContent = patientProfile.address;

        document.getElementById("printDiagnosis").textContent = record.doctorDiagnosis;

        // Điền ngày tháng in đơn
        const today = new Date();
        document.getElementById("printDate").innerHTML = `<i style="font-size: 0.9rem; margin: -30px">Đà Nẵng, Ngày ${today.getDate().toString().padStart(2, 0)} tháng ${(today.getMonth() + 1).toString().padStart(2, '0')} năm ${today.getFullYear()}</i>`;

        // Đơn thuốc
        const medListUl = document.getElementById("printMedicationList");
        const items = record.prescriptionItems || [];

        if (items.length === 0) {
            medListUl.innerHTML = "<p><i>Không kê thuốc cho ca khám này.</i></p>";
        } else {
            medListUl.innerHTML = items.map(item => `
                <li class="medication-item">
                    <div class="med-name-qty">
                        <span>${item.medicineName}</span>
                        <span>${item.quantity} viên/gói</span>
                    </div>
                    <div class="med-dosage">HD: ${item.dosageInstruction || "Theo chỉ định của bác sĩ"}</div>
                </li>
            `).join("");
        }

        document.getElementById("printNotes").textContent = record.doctorNotes || "Uống thuốc theo đơn.";

        window.print();
    } catch (error) {
        alert("Lỗi khi tải đơn thuốc: " + error.message);
    }
}

function translateGender(g) {
    return { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" }[g] || "Chưa cập nhật";
}