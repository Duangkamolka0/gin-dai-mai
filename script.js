const presets = [
  'นม', 'ไข่', 'ปลา', 'ข้าวสาลี', 'ถั่วลิสง',
  'ถั่วเหลือง', 'ถั่วเปลือกแข็ง', 'กุ้ง/ปู', 'หมึก/หอย', 'งา', 'อื่นๆ'
];

// ส่วนผสมที่โมเดลเห็นในรูป → ชื่อสารก่อภูมิแพ้ (ใช้ไฮไลต์ส่วนผสมที่ผู้ใช้แพ้)
const INGREDIENT_TO_ALLERGEN_TH = {
  shrimp: 'กุ้ง/ปู',
  salted_crab: 'กุ้ง/ปู',
  squid: 'หมึก/หอย',
  mussel: 'หมึก/หอย',
  fish: 'ปลา',
  egg: 'ไข่',
  peanut: 'ถั่วลิสง'
};

const navigationEntries = window.performance.getEntriesByType("navigation");
const isAbsoluteReload = navigationEntries.length > 0 && navigationEntries[0].type === "reload";

if (isAbsoluteReload) {
  let rawStore = JSON.parse(localStorage.getItem('gindaimaiData')) || {};
  let cleanedStore = {};
  
  presets.forEach(item => {
    if (rawStore[item]) {
      cleanedStore[item] = rawStore[item];
    }
  });
  if (rawStore['อื่นๆ']) {
    cleanedStore['อื่นๆ'] = rawStore['อื่นๆ'];
  }
  
  localStorage.setItem('gindaimaiData', JSON.stringify(cleanedStore));
}

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

function removeItem(name) {
  if (store[name]) {
    delete store[name];
    saveData();
    renderSelect();
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
        bar.style.background = '#f89d53';
      } else {
        bar.style.width = '30%';
        bar.style.background = '#E6DF7C';
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
        let color = '#FF5B5B';
        let width = '100%';

        if (level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง') { 
          color = '#f89d53'; 
          width = '60%'; 
        } else if (level === 'เสี่ยงน้อย' || level === 'อาการเล็กน้อย') {
          color = '#E6DF7C';
          width = '30%';
        }

        return `
          <div class="selected-row" style="margin-bottom: 16px; border-bottom: 1px solid rgba(41, 68, 59, 0.5); padding-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="item-name" style="font-size: 16px; color: #FFFFFF; font-weight: 400; letter-spacing: 0.3px;">${item}</span>

              <div style="display: flex; align-items: center; gap: 8px;">
                <select onchange="updateRowLevel('${item}', this)" 
                        style="background: #15241D; color: #8BA196; border: 1px solid #29443B; border-radius: 8px; font-size: 13px; padding: 4px 10px; cursor: pointer; outline: none; transition: 0.2s;">
                  <option value="เสี่ยงมาก" ${level === 'เสี่ยงมาก' || level === 'อาการรุนแรง' ? 'selected' : ''}>เสี่ยงมาก</option>
                  <option value="เสี่ยงปานกลาง" ${level === 'เสี่ยงปานกลาง' || level === 'อาการปานกลาง' ? 'selected' : ''}>เสี่ยงปานกลาง</option>
                  <option value="เสี่ยงน้อย" ${level === 'เสี่ยงน้อย' || level === 'อาการเล็กน้อย' ? 'selected' : ''}>เสี่ยงน้อย</option>
                </select>

                <button type="button" onclick="removeItem('${item}')" title="ลบรายการ"
                        onmouseover="this.style.background='rgba(255, 91, 91, 0.25)'; this.style.borderColor='#FF5B5B'"
                        onmouseout="this.style.background='rgba(255, 91, 91, 0.1)'; this.style.borderColor='rgba(255, 91, 91, 0.35)'"
                        style="width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(255, 91, 91, 0.35); background: rgba(255, 91, 91, 0.1); color: #FF5B5B; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; transition: 0.2s; padding: 0; outline: none;">
                  ✕
                </button>
              </div>
            </div>

            <div style="width: 100%; height: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden;">
              <div class="progress-bar" style="width: ${width}; height: 100%; background: ${color}; border-radius: 10px; transition: 0.3s ease;"></div>
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
  const detectedIngredients = resultData.detected_ingredients || [];

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

  // เรียงลำดับ: เช็คจากระดับความเสี่ยงของผู้ใช้ (store) หรือ AI -> พบในรูป -> คะแนน
  const LEVEL_RANK = { 
    "สูง": 0, "high": 0, "เสี่ยงมาก": 0, "อาการรุนแรง": 0,
    "ปานกลาง": 1, "medium": 1, "เสี่ยงปานกลาง": 1, "อาการปานกลาง": 1,
    "ต่ำ": 2, "low": 2, "เสี่ยงน้อย": 2, "อาการเล็กน้อย": 2 
  };
  
  const levelRank = item => {
    const targetLevel = store[item.name] || item.level;
    return targetLevel in LEVEL_RANK ? LEVEL_RANK[targetLevel] : 3;
  };
  const certaintyRank = item => (item.certainty === "confirmed" ? 0 : item.certainty === "possible" ? 1 : 2);
  
  combinedAllergens.sort((a, b) =>
    levelRank(a) - levelRank(b) ||
    certaintyRank(a) - certaintyRank(b) ||
    (b.score || 0) - (a.score || 0)
  );

  // ---------- สารก่อภูมิแพ้ ----------
  let allergensHTML = "";

  if (combinedAllergens.length === 0) {
    allergensHTML = `<p style="color: #68A590; font-size: 15px; margin: 20px 0; text-align: center;">ไม่ได้เลือกสารก่อภูมิแพ้ที่ต้องการเฝ้าระวังไว้</p>`;
  } else {
    allergensHTML = combinedAllergens.map(item => {
      let barWidth = "12%";
      let displayLevel = "ไม่พบ";

      // ดึงระดับความรุนแรงที่ผู้ใช้เลือกไว้ในหน้าแรก (store) มาแสดง
      const effectiveLevel = store[item.name] || item.level;

      if (effectiveLevel === "สูง" || effectiveLevel === "high" || effectiveLevel === "เสี่ยงมาก" || effectiveLevel === "อาการรุนแรง") {
        barWidth = "100%";
        displayLevel = "เสี่ยงมาก";
      } else if (effectiveLevel === "ปานกลาง" || effectiveLevel === "medium" || effectiveLevel === "เสี่ยงปานกลาง" || effectiveLevel === "อาการปานกลาง") {
        barWidth = "60%";
        displayLevel = "เสี่ยงปานกลาง";
      } else if (effectiveLevel === "ต่ำ" || effectiveLevel === "low" || effectiveLevel === "เสี่ยงน้อย" || effectiveLevel === "อาการเล็กน้อย") {
        barWidth = "30%";
        displayLevel = "เสี่ยงน้อย";
      }

      // โทนสี: พบในรูป = สีแดง, อาจมีในสูตร = สีเหลือง
      let barColor = "#465951";
      let levelTextColor = "#8BA196";
      let labelColor = "#8BA196";
      let certaintyBadge = "";

      if (item.certainty === "confirmed") {
        barColor = "#FF5B5B";
        levelTextColor = "#FF5B5B";
        labelColor = "#FFFFFF";
        certaintyBadge = `<span style="font-size: 12px; padding: 2px 8px; margin-left: 8px; border-radius: 8px; background: rgba(255, 69, 69, 0.15); color: #FF4545; border: 1px solid rgba(255, 69, 69, 0.4);">พบในรูป</span>`;
      } else if (item.certainty === "possible") {
        barColor = "#E6DF7C";
        levelTextColor = "#E6DF7C";
        labelColor = "#FFFFFF";
        certaintyBadge = `<span style="font-size: 12px; padding: 2px 8px; margin-left: 8px; border-radius: 8px; background: rgba(255, 213, 79, 0.12); color: #FFD54F; border: 1px solid rgba(255, 213, 79, 0.4);">อาจมีในสูตร</span>`;
      }

      return `
        <div style="margin-bottom: 18px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; margin-bottom: 6px; font-family: 'Sarabun', sans-serif;">
            <span style="color: ${labelColor}; font-weight: 400;">${item.name}${certaintyBadge}</span>
            <span style="color: ${levelTextColor}; font-weight: 500;">${displayLevel}</span>
          </div>
          <div style="width: 100%; height: 5px; background: #1B2B23; border-radius: 10px;">
            <div style="width: ${barWidth}; height: 100%; background: ${barColor}; border-radius: 10px; transition: 0.4s ease-out;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---------- ส่วนผสม: แยก "พบในรูป" กับ "น่าจะมี" ----------
  const makeChip = (ing, likely) => {
    const allergenName = INGREDIENT_TO_ALLERGEN_TH[ing.ingredient];
    const userIsAllergic = allergenName && activeUserAllergens.includes(allergenName);

    const border = userIsAllergic ? '#FF5B5B' : (likely ? '#3A5A4E' : '#29443B');
    const nameColor = userIsAllergic ? '#FF5B5B' : (likely ? '#9FB8AD' : '#FFFFFF');
    const borderStyle = likely ? 'dashed' : 'solid';
    const warn = userIsAllergic ? ' ⚠' : '';

    return `
      <span title="${ing.ingredient}" style="display: inline-flex; align-items: center; padding: 6px 12px; margin: 0 6px 8px 0; border-radius: 14px; background: #1B2B23; border: 1px ${borderStyle} ${border}; font-size: 14px;">
        <span style="color: ${nameColor};">${ing.thai}${warn}</span>
      </span>
    `;
  };

  const seenIngredients = detectedIngredients.filter(ing => ing.in_image !== false);
  const likelyIngredients = detectedIngredients.filter(ing => ing.in_image === false);
  const subLabelStyle = "font-size: 13px; color: #68A590; margin: 0 0 8px 0;";

  let ingredientsHTML = "";
  if (detectedIngredients.length === 0) {
    ingredientsHTML = `<p style="color: #68A590; font-size: 14px; margin: 0 0 8px 0;">ไม่พบส่วนผสมที่มองเห็นได้ชัดเจน</p>`;
  } else {
    if (seenIngredients.length > 0) {
      ingredientsHTML += `
        <p style="${subLabelStyle}">พบในรูป</p>
        <div style="margin-bottom: 10px;">${seenIngredients.map(ing => makeChip(ing, false)).join('')}</div>
      `;
    }
    if (likelyIngredients.length > 0) {
      ingredientsHTML += `
        <p style="${subLabelStyle}">น่าจะมี <span style="font-size: 12px; color: #4F7566;">(มองเห็นไม่ชัด แต่เมนูนี้มักใส่)</span></p>
        <div>${likelyIngredients.map(ing => makeChip(ing, true)).join('')}</div>
      `;
    }
  }

  const sectionTitleStyle = "font-size: 14px; color: #68A590; font-weight: 400; border-bottom: 1px solid #29443B; padding-bottom: 8px; margin-top: 0; margin-bottom: 16px; letter-spacing: 0.5px; text-align: left;";

  resultsEl.innerHTML = `
    <div style="width: 100%; font-family: 'Sarabun', sans-serif; padding: 5px 0;">

      <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: bold; color: white; margin-top: 0; margin-bottom: 18px; text-align: left;">
        เมนู: <span style="color: #1BCF93; font-family: 'Sarabun', sans-serif; font-weight: 500;">${foodName}</span>
      </h3>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px; padding: 12px 16px; background: #1B2B23; border-radius: 12px; border: 1px solid rgba(41, 68, 59, 0.5); text-align: left;">
        <div style="width: 10px; height: 10px; background: ${statusColor}; border-radius: 50%;"></div>
        <span style="font-size: 16px; font-weight: 500; color: ${statusColor}">ประเมินภาพรวม: ${overallRisk.level}</span>
      </div>

      <h4 style="${sectionTitleStyle}">ส่วนผสมในอาหาร:</h4>
      <div style="width: 100%; text-align: left; margin-bottom: 20px;">
        ${ingredientsHTML}
      </div>

      <h4 style="${sectionTitleStyle}">สารก่อภูมิแพ้ที่ตรวจพบ:</h4>
      <div style="width: 100%;">
        ${allergensHTML}
      </div>

    </div>
  `;
}