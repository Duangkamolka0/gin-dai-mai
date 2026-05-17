const presets = [
  'นม', 'ไข่', 'ปลา', 'ข้าวสาลี', 'ถั่วลิสง', 
  'ถั่วเหลือง', 'ถั่วเปลือกแข็ง', 'อาหารทะเลเปลือกแข็ง', 'งา', 'อื่นๆ'
];

let store = JSON.parse(localStorage.getItem('gindaimaiData')) || {};
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
    inputEl.value = '';
    saveData();
    renderSelect();
  } else {
    alert("กรุณากรอกชื่อสารก่อภูมิแพ้");
  }
}

function setLevel(name, value) {
  store[name] = value;
  saveData();
}

function updateRowLevel(name, selectEl) {
  const val = selectEl.value;
  setLevel(name, val);
  
  const row = selectEl.closest('.selected-row');
  if (row) {
    const bar = row.querySelector('.progress-bar');
    if (bar) {
      if (val === 'เสี่ยงมาก') {
        bar.style.width = '100%';
        bar.style.background = '#FF5B5B';
      } else if (val === 'เสี่ยงปานกลาง') {
        bar.style.width = '60%';
        bar.style.background = '#E6DF7C';
      } else {
        bar.style.width = '30%';
        bar.style.background = '#1BCF93';
      }
    }
  }
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
      <div class="custom-input" style="margin-top: 15px; margin-bottom: 15px; display: flex; gap: 8px;">
        <input id="customInput" placeholder="กรอกสารเพิ่มเติม" style="background: #1B2B23; border: 1px solid #29443B; color: white; padding: 10px; border-radius: 10px; flex: 1;">
        <button class="add-btn" type="button" onclick="addCustom()" style="background: #1BCF93; color: #111715; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold;">เพิ่ม</button>
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
        let level = store[item] || 'เสี่ยงมาก'; 
        let color = '#1BCF93';
        let width = '30%';

        if (level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง') { 
          color = '#E6DF7C'; 
          width = '60%'; 
        } else if (level === 'เสี่ยงมาก' || level === 'อาการรุนแรง') { 
          color = '#FF5B5B'; 
          width = '100%'; 
        } else if (level === 'เสี่ยงน้อย' || level === 'อาการเล็กน้อย') {
          color = '#1BCF93';
          width = '30%';
        }

        return `
          <div class="selected-row" style="margin-bottom: 20px; border-bottom: 1px solid #29443B; padding-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="item-name" style="font-size: 18px; color: white;">${item}</span>
              <select onchange="updateRowLevel('${item}', this)" 
                      style="background: #1B2B23; color: #68A590; border: 1px solid #29443B; border-radius: 5px; font-size: 14px; padding: 4px 8px; cursor: pointer;">
                <option value="เสี่ยงมาก" ${level === 'เสี่ยงมาก' || level === 'อาการรุนแรง' ? 'selected' : ''}>เสี่ยงมาก</option>
                <option value="เสี่ยงปานกลาง" ${level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง' ? 'selected' : ''}>เสี่ยงปานกลาง</option>
                <option value="เสี่ยงน้อย" ${level === 'เสี่ยงน้อย' || level === 'อาการเล็กน้อย' ? 'selected' : ''}>เสี่ยงน้อย</option>
              </select>
            </div>
            <div style="width: 100%; height: 6px; background: #1B2B23; border-radius: 10px;">
              <div class="progress-bar" style="width: ${width}; height: 100%; background: ${color}; border-radius: 10px; transition: 0.3s;"></div>
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
  const overallRisk = resultData.overall_risk || { level: "ความเสี่ยงต่ำ", color: "green" };
  const allergens = resultData.allergens || [];

  let statusColor = "#1BCF93"; 
  if (overallRisk.color === "orange" || overallRisk.level.includes("ปานกลาง")) statusColor = "#E6DF7C"; 
  if (overallRisk.color === "red" || overallRisk.level.includes("สูง") || overallRisk.level.includes("มาก")) statusColor = "#FF5B5B"; 

  const activeUserAllergens = Object.keys(store).filter(item => {
    return item !== 'อื่นๆ' && store[item] !== 'ไม่แพ้';
  });

  let combinedAllergens = activeUserAllergens.map(allergenName => {
    const aiFound = allergens.find(aiItem => aiItem.name === allergenName);
    if (aiFound) {
      return aiFound;
    } else {
      return { name: allergenName, level: "ไม่พบ" };
    }
  });

  let allergensHTML = "";
  if (combinedAllergens.length === 0) {
    allergensHTML = `<p style="color: #68A590; font-size: 15px; margin: 20px 0; text-align: center;">ไม่ได้เลือกสารก่อภูมิแพ้ที่ต้องการเฝ้าระวังไว้</p>`;
  } else {
    allergensHTML = combinedAllergens.map(item => {
      let barColor = "#c0c0c0"; 
      let barWidth = "12%";     
      let displayLevel = "ไม่พบ";
      let labelColor = "#8BA196"; 
      let levelTextColor = "#c0c0c0"; 

      if (item.level === "สูง" || item.level === "high" || item.level === "เสี่ยงมาก") { 
        barColor = "#FF5B5B";
        barWidth = "100%"; 
        displayLevel = "เสี่ยงมาก";
        labelColor = "#FFFFFF";
        levelTextColor = "#FF5B5B";
      } else if (item.level === "ปานกลาง" || item.level === "medium" || item.level === "เสี่ยงปานกลาง") { 
        barColor = "#E6DF7C";
        barWidth = "60%"; 
        displayLevel = "เสี่ยงปานกลาง";
        labelColor = "#FFFFFF";
        levelTextColor = "#E6DF7C";
      } else if (item.level === "ต่ำ" || item.level === "low" || item.level === "เสี่ยงน้อย") {
        barColor = "#1BCF93";
        barWidth = "30%"; 
        displayLevel = "เสี่ยงน้อย";
        labelColor = "#FFFFFF";
        levelTextColor = "#1BCF93";
      } else if (item.level === "ไม่พบ" || item.level === "none") {
        barColor = "#c0c0c0";
        barWidth = "12%"; 
        displayLevel = "ไม่พบ";
        labelColor = "#8BA196"; 
        levelTextColor = "#c0c0c0"; 
      }

      return `
        <div style="margin-bottom: 18px; text-align: left;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; margin-bottom: 6px; font-family: 'Sarabun', sans-serif;">
            <span style="color: ${labelColor}; font-weight: 400;">${item.name}</span>
            <span style="color: ${levelTextColor}; font-weight: 500;">${displayLevel}</span>
          </div>
          <div style="width: 100%; height: 5px; background: #1B2B23; border-radius: 10px;">
            <div style="width: ${barWidth}; height: 100%; background: ${barColor}; border-radius: 10px; transition: 0.4s ease-out;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  resultsEl.innerHTML = `
    <div style="width: 100%; font-family: 'Sarabun', sans-serif; padding: 5px 0;">
      
      <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: bold; color: white; margin-top: 0; margin-bottom: 18px; text-align: left;">
        เมนู: <span style="color: #1BCF93; font-family: 'Sarabun', sans-serif; font-weight: 500;">${foodName}</span>
      </h3>
      
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding: 12px 16px; background: #1B2B23; border-radius: 12px; border: 1px solid rgba(41, 68, 59, 0.5); text-align: left;">
        <div style="width: 10px; height: 10px; background: ${statusColor}; border-radius: 50%;"></div>
        <span style="font-size: 16px; font-weight: 500; color: ${statusColor}">ประเมินภาพรวม: ${overallRisk.level}</span>
      </div>

      <h4 style="font-size: 14px; color: #68A590; font-weight: 400; border-bottom: 1px solid #29443B; padding-bottom: 8px; margin-top: 0; margin-bottom: 20px; letter-spacing: 0.5px; text-align: left;">
        สารก่อภูมิแพ้ที่ตรวจพบ:
      </h4>
      
      <div style="width: 100%;">
        ${allergensHTML}
      </div>
      
    </div>
  `;
}