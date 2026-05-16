async function analyzeFood(imageFile) {
    console.log("กำลังวิเคราะห์รูปภาพ...");
    
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/allergen", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error analyzing food:", error);
        alert("เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ กรุณาลองใหม่อีกครั้ง");
        return null;
    }
}