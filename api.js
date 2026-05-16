async function analyzeFood(imageFile) {
    console.log("กำลังแปลงข้อมูลและส่งรูปภาพไปยังระบบ Food Recognition...");

    // 1. ดึงข้อมูลคนแพ้จากหน้าเว็บ (คีย์ภาษาไทย)
    const localStore = JSON.parse(localStorage.getItem('gindaimaiData')) || {};

    // 2. ตารางคู่แมปเปลี่ยนภาษาไทย -> ภาษาอังกฤษตามที่ Backend กำหนดไว้
    const thaiToEngKeys = {
        "นม": "milk",
        "ไข่": "egg",
        "ปลา": "fish",
        "อาหารทะเลเปลือกแข็ง": "shellfish",
        "ถั่วเปลือกแข็ง": "tree_nut",
        "ถั่วลิสง": "peanut",
        "ข้าวสาลี": "wheat",
        "ถั่วเหลือง": "soy",
        "งา": "sesame"
    };

    const formattedAllergens = {};
    const customIngredients = {};

    // 3. วนลูปแยกพรีเซ็ตหลัก และพวกสารที่พิมพ์เพิ่มเอง (อื่นๆ)
    for (const [thaiName, level] of Object.entries(localStore)) {
        if (thaiName === "อื่นๆ") continue;

        // แปลงระดับความเสี่ยงให้ตรงกับที่ Python ดักรับ (เสี่ยงมาก -> high, เสี่ยงปานกลาง -> medium, เสี่ยงน้อย -> low)
        let backendLevel = "high";
        if (level === "เสี่ยงปานกลาง" || level === "อาการปานกลาง") {
            backendLevel = "medium";
        } else if (level === "เสี่ยงน้อย" || level === "อาการเล็กน้อย") {
            backendLevel = "low";
        }

        if (thaiToEngKeys[thaiName]) {
            // ถ้าเป็นกลุ่มพรีเซ็ตหลัก ให้เปลี่ยนคีย์เป็นภาษาอังกฤษ
            const engKey = thaiToEngKeys[thaiName];
            formattedAllergens[engKey] = backendLevel;
        } else {
            // ถ้าผู้ใช้พิมพ์เพิ่มเข้ามาเอง (อื่นๆ) ให้ใส่ในกลุ่มสารเพิ่มเติม
            customIngredients[thaiName] = backendLevel;
        }
    }

    // 4. บีบข้อมูลทั้งหมดรวมกันเป็นก้อนเดียวเพื่อให้ประมวลผลง่าย
    const backendData = {
        allergen_level: formattedAllergens,
        custom_ingredients: customIngredients
    };

    // 5. แพ็กข้อมูลในรูปแบบ FormData
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("user_data", JSON.stringify(backendData)); // ส่งก้อนที่แปลงเรียบร้อยแล้วไป

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/allergen", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            // ถ้าหลังบ้านพ่น Error ออกมา ให้พิมพ์ Log เช็กรายละเอียด
            const errDetail = await response.text();
            console.error("Backend Error Detail:", errDetail);
            throw new Error("ระบบหลังบ้านขัดข้องหรือส่งข้อมูลไม่ถูกต้อง");
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error connecting to backend API:", error);
        alert("การวิเคราะห์ขัดพลาด: " + error.message);
        return null;
    }
}