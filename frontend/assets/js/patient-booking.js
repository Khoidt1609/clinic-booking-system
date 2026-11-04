let selectedSlot = null;  // { id, startTime, endTime }
let currentDoctorId = null;

document.addEventListener("DOMContentLoaded", async () => {
    const user = requiredAuth("PATIENT");
    if (!user) return;

    const isProfileComplete = await checkProfileStatus(user.id);
    if (!isProfileComplete) {
        window.location.href = "profile.html?requireUpdate=true";
        return;
    }

    const doctor = await getDoctor();
    currentDoctorId = doctor.id;

    const dateInput = document.getElementById("appointmentDate");
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + 21);

    const todayStr = formatDateForInput(now);
    const maxStr = formatDateForInput(maxDate);
    dateInput.min = todayStr;
    dateInput.value = todayStr;
    dateInput.max = maxStr;
    dateInput.addEventListener("change", loadSlots);
    document.getElementById("confirmBtn").addEventListener("click", submitBooking);

    loadSlots();
});

async function loadSlots(showLoading = true) {
    const date = document.getElementById("appointmentDate").value;
    const slotContainer = document.getElementById("slotContainer");

    if (showLoading) {
        slotContainer.innerHTML = `<p class="text-muted">Đang tải khung giờ...</p>`;
    }
    selectedSlot = null;
    updateConfirmButtonState();

    try {
        const slots = await apiFetch(`time-slots?doctorId=${currentDoctorId}&date=${date}`);
        renderSlot(slots);
        console.log(slots);
    } catch (error) {
        slotContainer.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }

}

function renderSlot(slots) {
    const morning = slots.filter(s => s.shift === "MORNING");
    const afternoon = slots.filter(s => s.shift === "AFTERNOON");

    const container = document.getElementById("slotContainer");
    container.innerHTML = "";

    if (slots.length === 0) {
        container.innerHTML = `<p class="text-muted">Chưa có khung giờ nào được thiết lập.</p>`;
        return;
    }

    if (morning.length > 0) {
        container.innerHTML += `<div class="slot-session-label">Buổi sáng</div>`;
        container.innerHTML += buildSlotGrid(morning);
    }
    if (afternoon.length > 0) {
        container.innerHTML += `<div class="slot-session-label">Buổi chiều</div>`;
        container.innerHTML += buildSlotGrid(afternoon);
    }
}

function buildSlotGrid(slots) {
    const chips = slots.map(slot => {
        const disabled = !slot.available;
        return `
        <div class="slot-chip ${disabled ? "slot-chip--disabled" : ""}"
            ${disabled ? "" : `onclick="selectSlot(${slot.id},'${slot.startTime}','${slot.endTime}', this)"`}>
        ${slot.startTime.substring(0, 5)}
        </div>`;
    }).join("");
    return `<div class = "slot-grid mb-2"> ${chips}</div>`;
}

function selectSlot(id, startTime, endTime, chipEl) {
    // Bỏ trạng thái "đang chọn" ở chip cũ
    document.querySelectorAll(".slot-chip--selected").forEach(element => {
        element.classList.remove("slot-chip--selected");
    });

    chipEl.classList.add("slot-chip--selected");
    selectedSlot = {
        id: id,
        startTime: startTime,
        endTime: endTime,
    };

    const dateInput = document.getElementById("appointmentDate").value;
    const infoBox = document.getElementById("info");

    if (dateInput && infoBox) {
        infoBox.innerHTML = `Đã chọn: <strong class= "text-cyan">${startTime.substring(0, 5)} - ${dateInput}`;

        infoBox.classList.remove("d-none");
    }

    updateConfirmButtonState();
}

function updateConfirmButtonState() {
    document.getElementById("confirmBtn").disabled = !selectedSlot;
}

async function submitBooking() {
    const errorBox = document.getElementById("bookingError");
    errorBox.classList.add("d-none");

    const date = document.getElementById("appointmentDate").value;
    const symptoms = document.getElementById("symptoms").value;

    try {
        await apiFetch("appointments", {
            method: "POST",
            body: {
                doctorId: currentDoctorId,
                slotId: selectedSlot.id,
                appointmentDate: date,
                patientSymptoms: symptoms
            }
        });
        showToast("Đặt lịch khám thành công!");
        document.getElementById("symptoms").value = "";
        // window.location.href = "appointments.html";
        await loadSlots(false);
    } catch (error) {
        const errorMessage = error.message || "";

        // Kiểm tra xem chuỗi lỗi có chứa câu thông báo từ file Java của bạn không
        const isSlotTaken = errorMessage.includes("Khung giờ này đã có người đặt") ||
            errorMessage.includes("vui lòng chọn giờ khác");

        if (isSlotTaken) {
            showToast("Khung giờ này đã bị người khác đặt mất! Vui lòng chọn khung giờ khác.", "danger");

            await loadSlots(false);

            // Ẩn hộp thông tin tóm tắt cũ
            const infoBox = document.getElementById("info");
            if (infoBox) infoBox.classList.add("d-none");

            // Cuộn mượt màn hình lên lại khu vực danh sách giờ 
            const slotSection = document.getElementById("slotContainer");
            if (slotSection) {
                slotSection.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            // Các lỗi hệ thống khác
            errorBox.textContent = errorMessage;
            errorBox.classList.remove("d-none");
            document.getElementById("confirmBtn").disabled = false;
        }
    }
}

async function checkProfileStatus(patientId) {
    try {
        const profile = await apiFetch(`profiles/${patientId}`);

        if (!profile.dateOfBirth || !profile.address || !profile.gender) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

