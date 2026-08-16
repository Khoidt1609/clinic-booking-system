// Danh sách các loại thuốc gợi ý có sẵn 
const PRESET_MEDICINES = [
    "Paracetamol 500mg",
    "Panadol Extra",
    "Efferalgan 500mg",
    "Amoxicillin 500mg",
    "Augmentin 625mg",
    "Ibuprofen 400mg",
    "Cefuroxim 500mg",
    "Omeprazol 20mg",
    "Vitamin C 500mg",
    "Berberin 50mg",
    "Eugica (Viên đỏ)",
    "Decolgen Forte",
    "Siro Prospan"
];

//  Hàm khởi tạo danh sách gợi ý vào thẻ <datalist>
function filterMedicine(inputElement) {
    const keyword = inputElement.value.trim().toLowerCase();
    const datalist = document.getElementById('medicineList');
    if (!datalist) return;

    // Nếu ô nhập trống, xóa sạch gợi ý để giao diện gọn gàng
    if (keyword === "") {
        datalist.innerHTML = "";
        return;
    }

    // Lọc các thuốc có chứa từ khóa người dùng gõ
    const filtered = PRESET_MEDICINES.filter(medicine =>
        medicine.toLowerCase().includes(keyword)
    );

    // Giới hạn hiển thị tối đa 5 kết quả phù hợp nhất
    const limitedResults = filtered.slice(0, 5);

    datalist.innerHTML = limitedResults
        .map(medicine => `<option value="${medicine}">`)
        .join('');
}