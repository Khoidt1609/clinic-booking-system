// Danh sách các loại thuốc gợi ý có sẵn 
const PRESET_MEDICINES = [
    // --- Nhóm giảm đau, hạ sốt, kháng viêm ---
    "Paracetamol 500mg",
    "Panadol Extra",
    "Efferalgan 500mg",
    "Ibuprofen 400mg",
    "Meloxicam 7.5mg",
    "Voltaren 50mg",

    // --- Nhóm kháng sinh, kháng nấm ---
    "Amoxicillin 500mg",
    "Augmentin 625mg",
    "Cefuroxim 500mg",
    "Clamoxyl 500mg",
    "Ciprofloxacin 500mg",

    // --- Nhóm ho, cảm cúm, dị ứng ---
    "Eugica (Viên đỏ)",
    "Decolgen Forte",
    "Siro Prospan",
    "Tiffy Dey",
    "Singulair 10mg",
    "Telfast 180mg",
    "Loratadin 10mg",

    // --- Nhóm dạ dày, tiêu hóa ---
    "Omeprazol 20mg",
    "Berberin 50mg",
    "Phosphalugel (Chữ P vàng)",
    "Gaviscon (Dạng gói)",
    "Smecta 3g",
    "Nexium mups 20mg",
    "Motilium-M 10mg",

    // --- Nhóm tim mạch, huyết áp, tiểu đường ---
    "Amlor 5mg",
    "Concor 5mg",
    "Glucophage 850mg",

    // --- Nhóm nhỏ mắt, nhỏ mũi ---
    "Nước muối sinh lý Natri Clorid 0.9%",
    "Tobrex 5ml (Nhỏ mắt)",
    "Otrivin 0.1% (Xịt mũi)",

    // --- Nhóm kem bôi ngoài da ---
    "Salonpas Gel",
    "Skinoren Cream",
    "Dermalex 30g",

    // --- Nhóm Vitamin, bổ não, thực phẩm chức năng ---
    "Vitamin C 500mg",
    "Enervon-C",
    "Ginkgo Biloba 120mg (Bổ não)",
    "Bênexol B1-B6-B12",
    "Calcium Corbiere 10ml"
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