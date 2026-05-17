async function analyzeFood(imageFile) {
    console.log("กำลังแปลงข้อมูลและส่งรูปภาพไปยังระบบ Food Recognition...");

    const localStore = JSON.parse(localStorage.getItem('gindaimaiData')) || {};

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

    for (const [thaiName, level] of Object.entries(localStore)) {
        if (thaiName === "อื่นๆ") continue;

        let backendLevel = "high";
        if (level === "เสี่ยงปานกลาง" || level === "อาการปานกลาง") {
            backendLevel = "medium";
        } else if (level === "เสี่ยงน้อย" || level === "อาการเล็กน้อย") {
            backendLevel = "low";
        }

        if (thaiToEngKeys[thaiName]) {
            const engKey = thaiToEngKeys[thaiName];
            formattedAllergens[engKey] = backendLevel;
        } else {
            customIngredients[thaiName] = backendLevel;
        }
    }

    const backendData = {
        allergen_level: formattedAllergens,
        custom_ingredients: customIngredients
    };

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("user_data", JSON.stringify(backendData));

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/allergen", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
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