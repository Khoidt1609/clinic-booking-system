document.addEventListener("DOMContentLoaded", async () => {
    const user = requiredAuth("PATIENT");
    if (!user) return;

    // Kiểm tra xem có bị điền thông tin hay chưa trước khi đặt lịch
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('requireUpdate') === 'true') {
        const alertBox = document.getElementById('profileSuccess');
        if (alertBox) {
            alertBox.className = "alert alert-warning fw-medium mb-4";
            alertBox.innerHTML = "<i class='bi bi-exclamation-triangle-fill me-2'></i> Bạn cần cập nhật đầy đủ thông tin cá nhân (SĐT, Ngày sinh, Địa chỉ) trước khi đặt lịch khám.";
            alertBox.classList.remove('d-none');
        }
    }

    await loadProfile(user.id);

    document.getElementById("btnSave").addEventListener("click", submitProfile);
})

async function loadProfile(patientId) {
    try {
        const profile = await apiFetch(`profiles/${patientId}`);
        console.log(profile);
        document.getElementById('fullName').value = profile.fullName || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('phone').value = profile.phone || '';
        document.getElementById("bloodType").value = profile.bloodType || "";
        document.getElementById("dateOfBirth").value = profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "";
        // document.getElementById("gender").value = profile.gender || "";
        document.getElementById("address").value = profile.address || "";
        document.getElementById("allergies").value = profile.allergies || "";
        document.getElementById("medicalHistory").value = profile.medicalHistory || "";

        const genderValue = profile.gender || "";
        if (genderValue) {
            // Tìm nút radio có thuộc tính value trùng với giá trị từ API
            const radioBtn = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
            if (radioBtn) {
                radioBtn.checked = true; // Tự động tích chọn đúng ô Nam hoặc Nữ
            };
        }
        document.getElementById("loadingIndicator").classList.add("d-none");
        console.log(document.getElementById("profileForm"));

        document.getElementById("profileForm").classList.remove("d-none");
    } catch (error) {
        document.getElementById("profileError").textContent = error.message;
        document.getElementById("profileError").classList.remove("d-none");
    }
}

async function submitProfile(event) {
    event.preventDefault();

    const form = document.getElementById("profileForm");
    const errorBox = document.getElementById("profileError");
    const successBox = document.getElementById("profileSuccess");

    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated'); // Hiện tất cả viền đỏ và câu báo lỗi
        return;
    }
    form.classList.remove("was-validated");
    // successBox.className = "alert alert-success fw-medium mb-4";
    errorBox.classList.add("d-none");
    successBox.classList.add("d-none");

    const btnSave = document.getElementById('btnSave');
    btnSave.disabled = true;
    const originalText = btnSave.innerHTML;

    btnSave.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';
    const checkedGender = document.querySelector(`input[name=gender]:checked`);


    try {
        const response = await apiFetch("profiles/profile", {
            method: "PUT",
            body: {
                bloodType: document.getElementById("bloodType").value || null,
                dateOfBirth: document.getElementById("dateOfBirth").value || null,
                gender: checkedGender ? checkedGender.value : null,
                address: document.getElementById("address").value || null,
                allergies: document.getElementById("allergies").value || null,
                medicalHistory: document.getElementById("medicalHistory").value || null
            }
        });

        showToast(response.message);

        // successBox.textContent = response.message;
        // successBox.classList.remove("d-none");
    } catch (error) {
        errorBox.textContent = error.message;
        console.log(error);
        errorBox.classList.remove("d-none");
    } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = originalText;
    }
}




