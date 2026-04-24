// api.js

async function analyzeFood(imageFile) {
    // จำลองสถานะ Loading สามารถเพิ่ม UI Spinner ตรงนี้ได้
    console.log("กำลังวิเคราะห์รูปภาพ...");

    try {
        // --- Mock Data: ลบส่วนนี้ออกเมื่อ Backend FastAPI พร้อมใช้งาน ---
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    food_name: "แกงมัสมั่น",
                    confidence: 0.94,
                    overall_risk: { level: "สูง", color: "#FF5B5B" }, // ใช้สีแดงตามเกณฑ์
                    allergens: [
                        { name: "ถั่วลิสง", score: 60, level: "ปานกลาง", color: "#E6DF7C" }, // สีส้ม/เหลือง
                        { name: "ปลา", score: 26, level: "ต่ำ", color: "#1BCF93" } // สีเขียว
                    ]
                });
            }, 1500); // จำลองว่ารอ API 1.5 วินาที
        });

        /* --- โค้ดจริงที่จะใช้ตอน Backend พร้อม ---
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch('YOUR_FASTAPI_URL/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
        */

    } catch (error) {
        console.error("API Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        throw error;
    }
}