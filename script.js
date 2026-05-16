const presets = [
  'นม', 'ไข่', 'ปลา', 'ข้าวสาลี', 'ถั่วลิสง', 
  'ถั่วเหลือง', 'ถั่วเปลือกแข็ง', 'อาหารทะเลเปลือกแข็ง', 'งา', 'อื่นๆ'
];

// 1. ดึงข้อมูลเดิมจาก localStorage
let store = JSON.parse(localStorage.getItem('gindaimaiData')) || {};

// 🟢 [เพิ่มเพิ่มคำสั่งเคลียร์ค่า] วนลูปคัดกรองลบส่วนผสมอื่นๆ (Custom) ออกทันทีที่มีการรีเฟรชหน้าเว็บ
Object.keys(store).forEach(item => {
  // ถ้าส่วนผสมนั้นไม่อยู่ใน presets หลัก (และไม่ใช่คำว่า 'อื่นๆ' ที่เปิดกล่อง Input ค้างไว้) ให้ทำการลบออกทันที
  if (!presets.includes(item) || item === 'อื่นๆ') {
    delete store[item];
  }
});
// บันทึกสถานะเวอร์ชันคลีนค่า Custom ทิ้ง กลับลงไปที่ฐานข้อมูลเบราว์เซอร์
localStorage.setItem('gindaimaiData', JSON.stringify(store));

let selectedImageFile = null;

function saveData() {
  localStorage.setItem('gindaimaiData', JSON.stringify(store));
}

function toggleItem(name) {
  if (store[name]) {
    delete store[name];
  } else {
    store[name] = 'เสี่ยงมาก'; 
  }
  saveData();
  renderSelect();
}

function addCustom() {
  const inputEl = document.getElementById('customInput');
  if (!inputEl) return;

  const customName = inputEl.value.trim();
  if (customName !== "") {
    store[customName] = 'เสี่ยงมาก'; 
    inputEl.value = ''; // เคลียร์ช่องอินพุตหลังเพิ่มเสร็จ
    saveData();
    renderSelect();
  } else {
    alert("กรุณากรอกชื่อสารก่อภูมิแพ้");
  }
}

function setLevel(name, value) {
  store[name] = value;
  saveData();
  renderSelect();
}

function renderSelect() {
  const allergensEl = document.getElementById('allergens');
  if (allergensEl) {
    allergensEl.innerHTML = presets.map(item => `
      <span class="tag ${store[item] ? 'active' : ''}" 
            onclick="toggleItem('${item}')"
            style="display: inline-block; padding: 10px 20px; margin: 5px; border-radius: 15px; cursor: pointer; border: 1px solid ${store[item] ? '#1BCF93' : '#29443B'}; color: ${store[item] ? '#1BCF93' : 'white'}; background: #1B2B23;">
        ${item}
      </span>
    `).join('');
  }

  const customWrapEl = document.getElementById('customWrap');
  if (customWrapEl) {
    customWrapEl.innerHTML = store['อื่นๆ'] ? `
      <div class="custom-input" style="margin-top: 15px; margin-bottom: 15px;">
        <input id="customInput" placeholder="กรอกสารเพิ่มเติม" style="background: #1B2B23; border: 1px solid #29443B; color: white; padding: 10px; border-radius: 10px;">
        <button class="add-btn" onclick="addCustom()" style="background: #1BCF93; color: #111715; border: none; padding: 10px 20px; border-radius: 10px; margin-left: 5px; cursor: pointer;">เพิ่ม</button>
      </div>
    ` : '';
  }

  const selectedItemsEl = document.getElementById('selectedItems');
  if (selectedItemsEl) {
    const selectedKeys = Object.keys(store).filter(item => item !== 'อื่นๆ');
    
    if (selectedKeys.length === 0) {
      selectedItemsEl.innerHTML = '<p class="sub-text">ยังไม่ได้เลือกรายการ</p>';
    } else {
      selectedItemsEl.innerHTML = selectedKeys.map(item => {
        let level = store[item];
        let color = '#1BCF93';
        let width = '30%';

        if (level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง') { 
          color = '#E6DF7C'; 
          width = '60%'; 
        } else if (level === 'เสี่ยงมาก' || level === 'อาการรุนแรง') { 
          color = '#FF5B5B'; 
          width = '100%'; 
        }

        return `
          <div class="selected-row" style="margin-bottom: 20px; border-bottom: 1px solid #29443B; padding-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="item-name" style="font-size: 18px; color: white;">${item}</span>
              <select onchange="setLevel('${item}', this.value); renderSelect();" 
                      style="background: transparent; color: #68A590; border: 1px solid #29443B; border-radius: 5px; font-size: 14px; cursor: pointer;">
                <option value="เสี่ยงมาก" ${level === 'เสี่ยงมาก' || level === 'อาการรุนแรง' ? 'selected' : ''}>เสี่ยงมาก</option>
                <option value="เสี่ยงปานกลาง" ${level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง' ? 'selected' : ''}>เสี่ยงปานกลาง</option>
                <option value="เสี่ยงน้อย" ${level === 'เสี่ยงน้อย' || level === 'อาการเล็กน้อย' ? 'selected' : ''}>เสี่ยงน้อย</option>
              </select>
            </div>
            <div style="width: 100%; height: 6px; background: #1B2B23; border-radius: 10px;">
              <div style="width: ${width}; height: 100%; background: ${color}; border-radius: 10px; transition: 0.3s;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = function(e) {
    const uploadBox = document.getElementById('uploadBox');
    if (uploadBox) {
      uploadBox.style.backgroundImage = `url('${e.target.result}')`;
      if(document.getElementById('cameraIcon')) document.getElementById('cameraIcon').style.display = 'none';
      if(document.getElementById('uploadText')) document.getElementById('uploadText').style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

async function startAnalysis(event) {
  if (event) {
    event.preventDefault(); 
  }

  if (!selectedImageFile) {
    alert("กรุณาเลือกรูปภาพอาหารก่อนทำการวิเคราะห์ครับ");
    return;
  }

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.innerText = "กำลังวิเคราะห์...";
    nextBtn.disabled = true;
  }

  const result = await analyzeFood(selectedImageFile);

  if (result) {
    localStorage.setItem('gindaimaiResult', JSON.stringify(result));
    location.href = 'result.html'; 
  } else {
    if (nextBtn) {
      nextBtn.innerText = "เริ่มวิเคราะห์";
      nextBtn.disabled = false;
    }
  }
}

function renderResult() {
  const resultsEl = document.getElementById('results');
  if (!resultsEl) return;

  const resultData = JSON.parse(localStorage.getItem('gindaimaiResult'));

  if (!resultData) {
    resultsEl.innerHTML = '<p class="sub-text">ไม่พบข้อมูลผลการประเมิน กรุณาลองใหม่อีกครั้ง</p>';
    return;
  }

  const foodName = resultData.food_name_thai || "ไม่รู้จักเมนูอาหาร";
  const confidence = (resultData.confidence * 100).toFixed(1);
  const overallRisk = resultData.overall_risk || { level: "ความเสี่ยงต่ำ", color: "green" };
  const allergens = resultData.allergens || [];

  let statusColor = "#1BCF93"; 
  if (overallRisk.color === "orange") statusColor = "#E6DF7C";
  if (overallRisk.color === "red") statusColor = "#FF5B5B";

  let allergensHTML = "";
  if (allergens.length === 0) {
    allergensHTML = `<p style="color: #68A590; font-size: 16px; margin-top: 15px;">ปลอดภัย! ไม่พบส่วนผสมที่เป็นสารก่อภูมิแพ้ตามที่คุณระบุ</p>`;
  } else {
    allergensHTML = allergens.map(item => {
      let barColor = "#1BCF93";
      let barWidth = "30%";
      if (item.level === "ปานกลาง" || item.level === "medium") { barColor = "#E6DF7C"; barWidth = "60%"; }
      if (item.level === "สูง" || item.level === "high") { barColor = "#FF5B5B"; barWidth = "100%"; }

      return `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 4px;">
            <span style="color: white;">${item.name}</span>
            <span style="color: ${barColor}">${item.level}</span>
          </div>
          <div style="width: 100%; height: 6px; background: #1B2B23; border-radius: 10px;">
            <div style="width: ${barWidth}; height: 100%; background: ${barColor}; border-radius: 10px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  resultsEl.innerHTML = `
    <div style="border: 2px solid ${statusColor}; padding: 25px; border-radius: 20px; background: #111715;">
      <h3 style="font-size: 26px; margin-top: 0; color: white;">เมนู: <span style="color: #1BCF93">${foodName}</span></h3>
      <p style="color: #68A590; font-size: 14px; margin-bottom: 20px;">ความมั่นใจของโมเดล: ${confidence}%</p>
      
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 25px; padding: 12px; background: #1B2B23; border-radius: 10px;">
        <div style="width: 15px; height: 15px; background: ${statusColor}; border-radius: 50%;"></div>
        <span style="font-size: 18px; font-weight: bold; color: ${statusColor}">ประเมินภาพรวม: ${overallRisk.level}</span>
      </div>

      <h4 style="font-size: 16px; color: #68A590; border-bottom: 1px solid #29443B; padding-bottom: 8px; margin-bottom: 15px;">สารก่อภูมิแพ้ที่ตรวจพบ:</h4>
      ${allergensHTML}
    </div>
  `;
}