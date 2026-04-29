async function analyzeFood(imageFile) {
    console.log("กำลังวิเคราะห์รูปภาพ...");

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                food_name: "แกงมัสมั่น",
                confidence: 0.94,
                allergens: [
                    { name: "ถั่วลิสง", score: 60, level: "ปานกลาง", color: "#E6DF7C" },
                    { name: "ปลา", score: 26, level: "ต่ำ", color: "#1BCF93" },
                    { name: "นม", score: 10, level: "ต่ำ", color: "#1BCF93" }
                ]
            });
        }, 1500); 
    });
}