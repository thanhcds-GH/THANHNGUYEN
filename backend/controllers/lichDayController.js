const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const sql = require('mssql');

// Cấu hình lưu tạm file vào bộ nhớ RAM
const upload = multer({ storage: multer.memoryStorage() });

// Hàm hỗ trợ loại bỏ dấu tiếng Việt để dò tìm tên môn/lớp chính xác
const removeVietnameseTones = (str) => {
    if (!str) return "";
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// Hàm bổ trợ chuyển đổi Số nguyên ngày của Excel (Serial Number) sang định dạng YYYY-MM-DD
const excelSerialToDate = (serial) => {
    const num = parseInt(serial, 10);
    if (isNaN(num) || num < 1) return "";
    const utc_days  = num - 25569;
    const date_info = new Date(utc_days * 86400 * 1000);
    
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

router.post('/import-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp Excel sổ đầu bài.' });
        }

        const MA_GIANGVIEN = req.body.MA_GIANGVIEN;
        if (!MA_GIANGVIEN) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn giảng viên sở hữu lịch dạy.' });
        }

        // 1. Đọc dữ liệu thô từ file Excel
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Cấu hình ép hiển thị text ngày tháng chuẩn hóa từ Excel
        const rows = xlsx.utils.sheet_to_json(worksheet, { 
            header: 1, 
            defval: "",
            raw: false,             
            dateNF: 'yyyy-mm-dd'    
        });

        // 2. DÒ TÌM TÊN MÔN HỌC & TÊN LỚP TRÊN CÙNG DÒNG
        let tenMonHoc = "";
        let tenLop = "";
        
        try {
            for (let i = 0; i < Math.min(rows.length, 12); i++) {
                let foundKeyMon = false;
                let foundKeyLop = false;
                let keyMonIndex = -1;
                let keyLopIndex = -1;

                for (let k = 0; k < rows[i].length; k++) {
                    if (!rows[i][k]) continue;
                    const cellVal = rows[i][k].toString().trim().toUpperCase();
                    const cellUnsigned = removeVietnameseTones(cellVal);
                    
                    if (!tenMonHoc && (cellUnsigned.includes("MON HOC") || cellUnsigned.includes("MON:"))) {
                        foundKeyMon = true;
                        keyMonIndex = k;
                    }
                    if (!tenLop && (cellUnsigned.includes("TEN LOP") || cellUnsigned.includes("LOP:") || cellUnsigned.includes("LOP HOC P"))) {
                        foundKeyLop = true;
                        keyLopIndex = k;
                    }
                }

                if (foundKeyMon && keyMonIndex !== -1) {
                    for (let m = keyMonIndex + 1; m < rows[i].length; m++) {
                        const directVal = rows[i][m] ? rows[i][m].toString().trim() : "";
                        if (directVal !== "" && directVal.toUpperCase() !== "HỌC PHẦN:") {
                            tenMonHoc = directVal;
                            break;
                        }
                    }
                }

                if (foundKeyLop && keyLopIndex !== -1) {
                    for (let m = keyLopIndex + 1; m < rows[i].length; m++) {
                        const directVal = rows[i][m] ? rows[i][m].toString().trim() : "";
                        if (directVal !== "" && !directVal.toUpperCase().includes("KHÓA:") && !directVal.toUpperCase().includes("KHOA:")) {
                            tenLop = directVal;
                            break;
                        }
                    }
                }

                if (tenMonHoc && tenLop) break;
            }

            if (!tenLop && rows[6] && rows[6][3]) tenLop = rows[6][3].toString().trim();
            if (!tenMonHoc && rows[6] && rows[6][4]) tenMonHoc = rows[6][4].toString().trim();
        } catch (e) {
            console.warn("Cảnh báo bóc tách tên môn học và lớp học:", e.message);
        }

        if (!tenMonHoc) tenMonHoc = "Tiến độ giảng dạy học phần";
        if (!tenLop) tenLop = "Lớp học phần";

        tenMonHoc = tenMonHoc.substring(0, 150);
        tenLop = tenLop.substring(0, 150);

        // 3 & 4. CẢI TIẾN QUAN TRỌNG: ĐỊNH VỊ CHUẨN XÁC DÒNG TIÊU ĐỀ ĐẦU TIÊN
        let dateColIndex = -1;
        let buoiColIndex = -1;
        let phongColIndex = -1;
        let headerIndex = -1;

        for (let i = 0; i < rows.length; i++) {
            if (!rows[i] || rows[i].length === 0) continue;

            let foundDate = -1;
            let foundBuoi = -1;
            let foundPhong = -1;

            for (let k = 0; k < rows[i].length; k++) {
                if (!rows[i][k]) continue; 

                const cellText = rows[i][k].toString().trim().toUpperCase();
                const cellUnsigned = removeVietnameseTones(cellText);

                if (cellUnsigned.includes('NGAY LEN LOP')) {
                    foundDate = k;
                } else if (cellUnsigned === 'BUOI' || cellUnsigned.includes('BUOI')) {
                    foundBuoi = k;
                } else if (cellUnsigned === 'PHONG' || cellUnsigned.includes('PHONG HOC')) {
                    foundPhong = k;
                }
            }

            // CHỐT MỐC: Khi tìm thấy dòng tiêu đề hiển thị chính thức, khóa mốc và dừng quét ngay lập tức
            if (foundDate !== -1 && foundBuoi !== -1) {
                headerIndex = i;
                dateColIndex = foundDate;
                buoiColIndex = foundBuoi;
                phongColIndex = (foundPhong !== -1) ? foundPhong : (foundBuoi + 1); 
                break; // Thoát hoàn toàn vòng lặp quét hàng tiêu đề, không cho phép dòng dưới đè lên
            }
        }

        if (headerIndex === -1 || dateColIndex === -1 || buoiColIndex === -1) {
            return res.status(400).json({ 
                success: false, 
                message: `Cấu trúc file Excel thiếu cột bắt buộc.` 
            });
        }

        let insertedCount = 0;

        // 5. Vòng lặp bóc tách dữ liệu lịch dạy từ sau dòng tiêu đề chính xác
        for (let j = headerIndex + 1; j < rows.length; j++) {
            const currentRow = rows[j];
            if (!currentRow || currentRow.length === 0) continue;

            let dateText = currentRow[dateColIndex]?.toString().trim();
            const buoiText = currentRow[buoiColIndex]?.toString().trim();
            const phongText = currentRow[phongColIndex]?.toString().trim(); 

            if (!dateText || dateText.toUpperCase() === "DATETEXT" || dateText.toUpperCase() === "NGÀY LÊN LỚP") continue;

            dateText = dateText.replace(/\s+/g, '');

            let formattedDate = "";

            if (/^\d+$/.test(dateText)) {
                formattedDate = excelSerialToDate(dateText);
            }
            else if (dateText.includes('/')) {
                const dateParts = dateText.split('/');
                if (dateParts.length >= 3) {
                    const day = dateParts[0].padStart(2, '0');
                    const month = dateParts[1].padStart(2, '0');
                    const year = dateParts[2].substring(0, 4);
                    formattedDate = `${year}-${month}-${day}`;
                }
            } 
            else if (dateText.includes('-')) {
                const dateParts = dateText.split('-');
                if (dateParts.length >= 3) {
                    if (dateParts[0].length === 4) {
                        const year = dateParts[0];
                        const month = dateParts[1].padStart(2, '0');
                        const day = dateParts[2].padStart(2, '0');
                        formattedDate = `${year}-${month}-${day}`;
                    } else {
                        const day = dateParts[0].padStart(2, '0');
                        const month = dateParts[1].padStart(2, '0');
                        const year = dateParts[2].substring(0, 4);
                        formattedDate = `${year}-${month}-${day}`;
                    }
                }
            }

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!formattedDate || !dateRegex.test(formattedDate)) {
                continue; 
            }

            let validatedBuoi = 'Sáng';
            if (buoiText && (buoiText.toLowerCase().includes('chiều') || buoiText.toLowerCase().includes('chieu'))) {
                validatedBuoi = 'Chiều';
            } else if (buoiText && (buoiText.toLowerCase().includes('tối') || buoiText.toLowerCase().includes('toi'))) {
                validatedBuoi = 'Tối';
            }

            let finalPhongHoc = phongText || 'P.306';
            finalPhongHoc = finalPhongHoc.substring(0, 50); 

            // 6. Thực thi chèn dữ liệu vào bảng dbo.LICH_DAY
            await new sql.Request()
                .input('MA_GIANGVIEN', sql.Int, parseInt(MA_GIANGVIEN))
                .input('NGAY_DAY', sql.Date, formattedDate)
                .input('TEN_LOP', sql.NVarChar, tenLop)
                .input('BUOI_DAY', sql.NVarChar, validatedBuoi)
                .input('TEN_MON_HOC', sql.NVarChar, tenMonHoc)
                .input('PHONG_HOC', sql.NVarChar, finalPhongHoc) 
                .query(`
                    INSERT INTO dbo.LICH_DAY (MA_GIANGVIEN, NGAY_DAY, TEN_LOP, BUOI_DAY, TEN_MON_HOC, PHONG_HOC)
                    VALUES (@MA_GIANGVIEN, @NGAY_DAY, @TEN_LOP, @BUOI_DAY, @TEN_MON_HOC, @PHONG_HOC)
                `);
            
            insertedCount++;
        }

        return res.status(200).json({ 
            success: true, 
            message: `Hệ thống đã tự động nhận diện lớp "${tenLop}", môn "${tenMonHoc}" và đồng bộ thành công ${insertedCount} buổi dạy vào CSDL!`,
            count: insertedCount
        });

    } catch (error) {
        console.error("Lỗi hệ thống import chi tiết:", error);
        return res.status(500).json({ success: false, message: 'Quá trình bóc tách tệp gặp sự cố kỹ thuật.' });
    }
});

module.exports = router;