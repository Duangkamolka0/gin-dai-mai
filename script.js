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
    store[name] = 'เสี่ยงปานกลาง';
  }
  saveData();
  renderSelect();
}

function setLevel(name, value) {
  store[name] = value;
  saveData();
}

function addCustom() {
  const value = document.getElementById('customInput').value.trim();
  if (value) {
    store[value] = 'เสี่ยงน้อย';
    saveData();
    renderSelect();
  }
}

function renderSelect() {
  const allergensEl = document.getElementById('allergens');
  if (allergensEl) {
    allergensEl.innerHTML = presets.map(item => `
      <span class="tag ${store[item] ? 'active' : ''}" onclick="toggleItem('${item}')">
        ${item}
      </span>
    `).join('');
  }

  const customWrapEl = document.getElementById('customWrap');
  if (customWrapEl) {
    customWrapEl.innerHTML = store['อื่นๆ'] ? `
      <input id="customInput" placeholder="กรอกสารเพิ่มเติม">
      <button class="add-btn" onclick="addCustom()">เพิ่ม</button>
    ` : '';
  }

  const selectedItemsEl = document.getElementById('selectedItems');
  if (selectedItemsEl) {
    selectedItemsEl.innerHTML = Object.keys(store)
      .filter(item => item !== 'อื่นๆ')
      .map(item => {
        let level = store[item];
        let width = '30%';
        let color = '#1BCF93';
        if (level === 'เสี่ยงปานกลาง') { width = '60%'; color = '#E6DF7C'; }
        if (level === 'เสี่ยงมาก') { width = '100%'; color = '#FF5B5B'; }

        return `
          <div class="selected-row">
            <div class="item-left">
              <span class="item-name">${item}</span>
              <div class="risk-bar">
                <div class="risk-fill" style="width:${width}; background:${color};"></div>
              </div>
            </div>
            <select onchange="setLevel('${item}', this.value); renderSelect();">
              <option ${level === 'เสี่ยงมาก' ? 'selected' : ''}>เสี่ยงมาก</option>
              <option ${level === 'เสี่ยงปานกลาง' ? 'selected' : ''}>เสี่ยงปานกลาง</option>
              <option ${level === 'เสี่ยงน้อย' ? 'selected' : ''}>เสี่ยงน้อย</option>
            </select>
          </div>
        `;
      }).join('');
  }
}

function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = function(e) {
    const box = document.getElementById("uploadBox");
    box.style.backgroundImage = `url('${e.target.result}')`;
    box.style.backgroundSize = "contain";
    box.style.backgroundRepeat = "no-repeat";
    box.style.backgroundPosition = "center";
    box.style.backgroundColor = "#1B2B23";
    document.getElementById("cameraIcon").style.display = "none";
    document.getElementById("uploadText").style.display = "none";
    document.getElementById("nextBtn").disabled = false;
  };
  reader.readAsDataURL(file);
}

async function handleAnalyze() {
  const nextBtn = document.getElementById("nextBtn");
  nextBtn.disabled = true;
  nextBtn.innerText = "กำลังวิเคราะห์...";

  try {
    const result = await analyzeFood(selectedImageFile);
    localStorage.setItem('analysisResult', JSON.stringify(result));
    location.href = 'result.html';
  } catch (error) {
    nextBtn.disabled = false;
    nextBtn.innerText = "เริ่มวิเคราะห์";
  }
}

function renderResult() {
  const resultData = JSON.parse(localStorage.getItem('analysisResult'));
  const resultsContainer = document.getElementById('results');
  if (!resultsContainer) return;

  if (!resultData || !resultData.allergens) {
    resultsContainer.innerHTML = `<p class="sub-text">ยังไม่มีผลการวิเคราะห์</p>`;
    return;
  }

  resultsContainer.innerHTML = resultData.allergens.map(item => `
    <div class="row">
      <div style="display: flex; flex-direction: column;">
        <span style="font-weight: 500;">${item.name}</span>
        <small style="color: #68A590; font-size: 12px;">ความแม่นยำ ${(item.score)}%</small>
      </div>
      <span style="color: ${item.color}; font-weight: bold;">
        ${item.level}
      </span>
    </div>
  `).join('');
}