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
    store[name] = 'อาการรุนแรง';
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
      <span class="tag ${store[item] ? 'active' : ''}" onclick="toggleItem('${item}')">
        ${item}
      </span>
    `).join('');
  }

  const selectedItemsEl = document.getElementById('selectedItems');
  if (selectedItemsEl) {
    const selectedKeys = Object.keys(store).filter(item => item !== 'อื่นๆ');
    selectedItemsEl.innerHTML = selectedKeys.map(item => {
      let level = store[item];
      let color = '#1BCF93';
      let width = '30%';
      if (level === 'อาการปานกลาง') { color = '#E6DF7C'; width = '60%'; }
      if (level === 'อาการรุนแรง') { color = '#FF5B5B'; width = '100%'; }

      return `
        <div class="selected-row" style="margin-bottom: 20px; border-bottom: 1px solid #29443B; padding-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px; font-weight: bold;">${item}</span>
            <select onchange="setLevel('${item}', this.value)" style="background: transparent; color: #68A590; border: 1px solid #29443B; border-radius: 5px; font-size: 12px;">
              <option value="อาการรุนแรง" ${level === 'อาการรุนแรง' ? 'selected' : ''}>อาการรุนแรง</option>
              <option value="อาการปานกลาง" ${level === 'อาการปานกลาง' ? 'selected' : ''}>อาการปานกลาง</option>
              <option value="อาการเล็กน้อย" ${level === 'อาการเล็กน้อย' ? 'selected' : ''}>อาการเล็กน้อย</option>
            </select>
          </div>
          <div style="width: 100%; height: 6px; background: #1B2B23; border-radius: 10px; margin-top: 10px;">
            <div style="width: ${width}; height: 100%; background: ${color}; border-radius: 10px; transition: 0.3s;"></div>
          </div>
        </div>
      `;
    }).join('');
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