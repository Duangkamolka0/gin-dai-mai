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
      <div class="custom-input" style="margin-top: 15px;">
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

        if (level === 'เสี่ยงปานกลาง') {
          color = '#E6DF7C';
          width = '60%';
        } else if (level === 'เสี่ยงมาก') {
          color = '#FF5B5B';
          width = '100%';
        }

        return `
          <div class="selected-row" style="margin-bottom: 20px; border-bottom: 1px solid #29443B; padding-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="item-name" style="font-size: 18px; color: white;">${item}</span>
              <select onchange="setLevel('${item}', this.value); renderSelect();" 
                      style="background: transparent; color: #68A590; border: 1px solid #29443B; border-radius: 5px; font-size: 14px; cursor: pointer;">
                <option value="เสี่ยงมาก" ${level === 'เสี่ยงมาก' ? 'selected' : ''}>เสี่ยงมาก</option>
                <option value="เสี่ยงปานกลาง" ${level === 'เสี่ยงปานกลาง' ? 'selected' : ''}>เสี่ยงปานกลาง</option>
                <option value="เสี่ยงน้อย" ${level === 'เสี่ยงน้อย' ? 'selected' : ''}>เสี่ยงน้อย</option>
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

function addCustom() {
  const input = document.getElementById('customInput');
  if (input && input.value.trim() !== '') {
    const newItem = input.value.trim();
    if (!presets.includes(newItem)) {
      store[newItem] = 'เสี่ยงมาก';
      saveData();
      renderSelect();
      input.value = '';
    } else {
      alert('สารนี้มีอยู่ในรายการแล้ว');
    }
  }
}

function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      const uploadBox = document.getElementById('uploadBox');
      const cameraIcon = document.getElementById('cameraIcon');
      const uploadText = document.getElementById('uploadText');
      const nextBtn = document.getElementById('nextBtn');

      if (cameraIcon) cameraIcon.style.display = 'none';
      if (uploadText) uploadText.style.display = 'none';

      let imgPreview = document.getElementById('imgPreview');
      if (!imgPreview) {
        imgPreview = document.createElement('img');
        imgPreview.id = 'imgPreview';
        imgPreview.style.width = '100%';
        imgPreview.style.height = '100%';
        imgPreview.style.objectFit = 'cover';
        imgPreview.style.borderRadius = '20px';
        uploadBox.appendChild(imgPreview);
      }
      imgPreview.src = e.target.result;

      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.background = '#1BCF93';
        nextBtn.style.color = '#111715';
      }
    };
    reader.readAsDataURL(file);
  }
}

async function handleAnalyze() {
  if (!selectedImageFile) return;

  const nextBtn = document.getElementById('nextBtn');
  const originalText = nextBtn.innerText;
  nextBtn.innerText = 'กำลังวิเคราะห์...';
  nextBtn.disabled = true;

  const result = await analyzeFood(selectedImageFile);

  if (result) {
    localStorage.setItem('gindaimaiResult', JSON.stringify(result));
    location.href = 'result.html';
  } else {
    nextBtn.innerText = originalText;
    nextBtn.disabled = false;
  }
}

function renderResult() {
  const resultData = JSON.parse(localStorage.getItem('gindaimaiResult'));
  const resultsContainer = document.getElementById('results');

  if (!resultData || !resultsContainer) {
    if (resultsContainer) resultsContainer.innerHTML = '<p>ไม่พบข้อมูลการวิเคราะห์</p>';
    return;
  }

  // Create food info header
  let html = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="font-size: 24px; margin-bottom: 5px; color: #1BCF93;">${resultData.food_name}</h3>
      <p style="color: #68A590;">ความแม่นยำ: ${(resultData.confidence * 100).toFixed(2)}%</p>
    </div>
  `;

  // Calculate risk based on user profile
  let totalRiskScore = 0;
  let highestRiskLevel = 'ปลอดภัย';
  let matchedAllergensHTML = '';

  if (resultData.allergens && resultData.allergens.length > 0) {
    matchedAllergensHTML += '<div style="margin-top: 20px;"><h4>ส่วนผสมที่ตรวจพบ</h4>';

    resultData.allergens.forEach(allergen => {
      const userRisk = store[allergen.name];
      let alertColor = '#1BCF93'; // Safe
      let alertText = 'ปกติ';

      if (userRisk) {
        if (userRisk === 'เสี่ยงมาก') {
          alertColor = '#FF5B5B';
          alertText = 'เสี่ยงมาก';
          highestRiskLevel = 'เสี่ยงมาก';
        } else if (userRisk === 'เสี่ยงปานกลาง') {
          alertColor = '#E6DF7C';
          alertText = 'เสี่ยงปานกลาง';
          if (highestRiskLevel !== 'เสี่ยงมาก') highestRiskLevel = 'เสี่ยงปานกลาง';
        } else if (userRisk === 'เสี่ยงน้อย') {
          alertColor = '#E6DF7C'; // use yellow for mild risk as well
          alertText = 'เสี่ยงน้อย';
          if (highestRiskLevel === 'ปลอดภัย') highestRiskLevel = 'เสี่ยงน้อย';
        }
      }

      matchedAllergensHTML += `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #29443B; border-radius: 10px; background: #1B2B23;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>${allergen.name}</span>
            <span style="color: ${alertColor};">${alertText}</span>
          </div>
          <div style="width: 100%; height: 6px; background: #111715; border-radius: 10px;">
             <div style="width: ${allergen.score}%; height: 100%; background: #68A590; border-radius: 10px;"></div>
          </div>
          <p style="font-size: 12px; color: #68A590; margin-top: 5px; text-align: right;">โอกาสมีส่วนผสม: ${allergen.score}%</p>
        </div>
      `;
    });

    matchedAllergensHTML += '</div>';
  } else {
    matchedAllergensHTML = '<p style="text-align: center; color: #1BCF93;">ไม่พบสารก่อภูมิแพ้ในฐานข้อมูล</p>';
  }

  // Render overall risk
  let riskColor = '#1BCF93';
  if (highestRiskLevel === 'เสี่ยงมาก') riskColor = '#FF5B5B';
  else if (highestRiskLevel === 'เสี่ยงปานกลาง' || highestRiskLevel === 'เสี่ยงน้อย') riskColor = '#E6DF7C';

  html += `
    <div style="text-align: center; padding: 20px; border-radius: 15px; border: 2px solid ${riskColor}; margin-bottom: 20px;">
      <h3 style="color: ${riskColor}; margin-bottom: 10px;">ระดับความเสี่ยง: ${highestRiskLevel}</h3>
    </div>
  `;

  html += matchedAllergensHTML;
  resultsContainer.innerHTML = html;
}