const presets = [
  'นม',
  'ไข่',
  'ปลา',
  'ข้าวสาลี',
  'ถั่วลิสง',
  'ถั่วเหลือง',
  'ถั่วเปลือกแข็ง',
  'อาหารทะเลเปลือกแข็ง',
  'งา',
  'อื่นๆ'
];

let store = JSON.parse(localStorage.getItem('gindaimaiData')) || {};

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
  document.getElementById('allergens').innerHTML =
    presets.map(item => `
      <span class="tag ${store[item] ? 'active' : ''}"
            onclick="toggleItem('${item}')">
        ${item}
      </span>
    `).join('');

  document.getElementById('customWrap').innerHTML =
    store['อื่นๆ']
      ? `
        <input id="customInput" placeholder="กรอกสารเพิ่มเติม">
        <button onclick="addCustom()">เพิ่ม</button>
      `
      : '';

  document.getElementById('selectedItems').innerHTML =
    Object.keys(store)
      .filter(item => item !== 'อื่นๆ')
      .map(item => {
        let level = store[item];
        let width = '30%';
        let color = '#1BCF93';

        if (level === 'เสี่ยงปานกลาง') {
          width = '60%';
          color = '#E6DF7C';
        }

        if (level === 'เสี่ยงมาก') {
          width = '100%';
          color = '#FF5B5B';
        }

        return `
          <div class="selected-row">
            <div class="item-left">
              <span class="item-name">${item}</span>
              <div class="risk-bar">
                <div class="risk-fill"
                     style="width:${width}; background:${color};">
                </div>
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

function renderResult() {
  const items = Object.keys(store).filter(item => item !== 'อื่นๆ');

  document.getElementById('results').innerHTML =
    items.length === 0
      ? `<p class="sub-text">ยังไม่มีผลการวิเคราะห์</p>`
      : items.map(item => `
          <div class="row">
            <span>${item}</span>
            <span>${store[item]} | AI วิเคราะห์</span>
          </div>
        `).join('');
}

      function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    document.querySelector('.upload-box').innerHTML = `
      <img src="${e.target.result}" class="preview-img">
    `;
  };

  reader.readAsDataURL(file);
}