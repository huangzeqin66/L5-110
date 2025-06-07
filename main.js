// main.js 拆分自 index.html 脚本部分，并实现预约需管理员审核功能

document.addEventListener('DOMContentLoaded', function() {
// ...existing code...
// 账号数据结构: {username, password, isAdmin}
const ADMIN = { username: "1", password: "1", isAdmin: true };
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([ADMIN]));
}
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function setUsers(data) { localStorage.setItem('users', JSON.stringify(data)); }
function getReservations() { return JSON.parse(localStorage.getItem('reservations') || '[]'); }
function setReservations(data) { localStorage.setItem('reservations', JSON.stringify(data)); }
function getSlots() { return JSON.parse(localStorage.getItem('slots') || '[]'); }
function setSlots(data) { localStorage.setItem('slots', JSON.stringify(data)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
function setCurrentUser(user) { localStorage.setItem('currentUser', JSON.stringify(user)); }
function clearCurrentUser() { localStorage.removeItem('currentUser'); }

// tab切换
window.showTab = function(tab) {
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    if(tab==='login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('loginForm').style.display = '';
    } else {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('registerForm').style.display = '';
    }
    document.getElementById('authMsg').textContent = '';
}

// 登录
const loginForm = document.getElementById('loginForm');
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPwd').value;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        document.getElementById('authMsg').textContent = '账号或密码错误';
        return;
    }
    setCurrentUser(user);
    showMainView();
};
// 注册
const registerForm = document.getElementById('registerForm');
registerForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPwd').value;
    if (!username || !password) return;
    if (username === 'admin') {
        document.getElementById('authMsg').textContent = 'admin为内置管理员账号，不能注册';
        return;
    }
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        document.getElementById('authMsg').textContent = '账号已存在';
        return;
    }
    users.push({ username, password, isAdmin: false });
    setUsers(users);
    document.getElementById('authMsg').textContent = '注册成功，请登录';
    showTab('login');
};

// 退出
window.logout = function() {
    clearCurrentUser();
    showAuthView();
}

// 视图切换
function showAuthView() {
    document.getElementById('authView').style.display = '';
    document.getElementById('userView').style.display = 'none';
    document.getElementById('adminView').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
    showTab('login');
}
function showMainView() {
    const user = getCurrentUser();
    if (!user) return showAuthView();
    document.getElementById('authView').style.display = 'none';
    document.getElementById('navbar').style.display = '';
    if (user.isAdmin) {
        document.getElementById('adminView').style.display = '';
        document.getElementById('userView').style.display = 'none';
        renderSlotTable();
        renderAdminTable();
    } else {
        document.getElementById('userView').style.display = '';
        document.getElementById('adminView').style.display = 'none';
        renderSlotDateGroups();
        renderUserTable();
    }
}

// 管理员端逻辑
const slotForm = document.getElementById('slotForm');
const slotTableBody = document.querySelector('#slotTable tbody');
const slotMsg = document.getElementById('slotMsg');
const adminTableBody = document.querySelector('#adminTable tbody');
function renderSlotTable() {
    const slots = getSlots();
    const reservations = getReservations();
    // 按日期和开始时间排序
    const sortedSlots = slots.slice().sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
    slotTableBody.innerHTML = sortedSlots.length ? sortedSlots.map((slot, i) => {
        // 只统计已通过的预约
        const count = reservations.filter(r => r.slotId === slot.id && r.status === 'approved').length;
        // 需要找到原始索引以便删除
        const origIdx = slots.findIndex(s => s.id === slot.id);
        return `<tr><td>${slot.date}</td><td>${slot.startTime}-${slot.endTime}</td><td>${slot.limit}</td><td>${count}</td><td><button onclick=\"delSlot(${origIdx})\">删除</button></td></tr>`;
    }).join('') : '<tr><td colspan="5">暂无时间段</td></tr>';
}
window.delSlot = function(idx) {
    const slots = getSlots();
    const slot = slots[idx];
    if (confirm('确定要删除该时间段吗？')) {
        setSlots(slots.filter((_, i) => i !== idx));
        const reservations = getReservations().filter(r => r.slotId !== slot.id);
        setReservations(reservations);
        renderSlotTable();
        renderAdminTable();
        slotMsg.textContent = '时间段已删除';
    }
}
slotForm.onsubmit = function(e) {
    e.preventDefault();
    const date = document.getElementById('slotDate').value;
    const startTime = document.getElementById('slotStart').value;
    const endTime = document.getElementById('slotEnd').value;
    const limit = parseInt(document.getElementById('slotLimit').value, 10);
    if (!date || !startTime || !endTime || !limit) return;
    if (startTime >= endTime) {
        slotMsg.textContent = '开始时间必须早于结束时间！';
        return;
    }
    const slots = getSlots();
    // 防止重复区间
    if (slots.some(s => s.date === date && s.startTime === startTime && s.endTime === endTime)) {
        slotMsg.textContent = '该时间段已存在，请勿重复发布！';
        return;
    }
    slots.push({ id: Date.now().toString(), date, startTime, endTime, limit });
    setSlots(slots);
    renderSlotTable();
    renderSlotDateGroups();
    slotMsg.textContent = '时间段发布成功！';
    slotForm.reset();
};
function renderAdminTable() {
    const reservations = getReservations();
    const slots = getSlots();
    adminTableBody.innerHTML = reservations.length ? reservations.map((r, i) => {
        const slot = slots.find(s => s.id === r.slotId);
        let action = '';
        if (r.status === 'pending') {
            action = `<div class="admin-actions">
                <button onclick="approveReservation(${i})" style="background:#2d6cdf;">通过</button>
                <button onclick="rejectReservation(${i})" style="background:#e53935;">拒绝</button>
                <button onclick=\"delReservation(${i})\" style="background:#e53935;">删除</button>
            </div>`;
        } else if (r.status === 'approved') {
            action = `<div class="admin-actions">
                <span style="color:#2d6cdf;">已通过</span>
                <button onclick=\"delReservation(${i})\" style="background:#e53935;">删除</button>
            </div>`;
        } else if (r.status === 'rejected') {
            action = `<div class="admin-actions">
                <span style="color:#e53935;">已拒绝</span>
                <button onclick=\"delReservation(${i})\" style="background:#e53935;">删除</button>
            </div>`;
        }
        // 新增提交时间列
        const submitTime = r.submitTime ? `<div style='color:#888;font-size:12px;'>${new Date(r.submitTime).toLocaleString()}</div>` : '';
        return `<tr><td>${r.clazz}</td><td>${r.name}</td><td>${r.phone}</td><td>${r.group}</td><td>${slot ? `${slot.date} ${slot.startTime}-${slot.endTime}` : ''}${submitTime}</td><td>${action}</td></tr>`;
    }).join('') : '<tr><td colspan="6">暂无预约</td></tr>';
}
window.approveReservation = function(idx) {
    const reservations = getReservations();
    const r = reservations[idx];
    // 检查名额（只统计已通过的预约）
    const count = reservations.filter(x => x.slotId === r.slotId && x.status === 'approved').length;
    const slot = getSlots().find(s => s.id === r.slotId);
    if (count >= slot.limit) {
        alert('该时间段已约满，无法通过');
        return;
    }
    reservations[idx].status = 'approved';
    setReservations(reservations);
    renderAdminTable();
    renderSlotTable();
    renderSlotDateGroups();
}
window.rejectReservation = function(idx) {
    const reservations = getReservations();
    reservations[idx].status = 'rejected';
    setReservations(reservations);
    renderAdminTable();
    renderSlotTable();
    renderSlotDateGroups();
}
window.delReservation = function(idx) {
    let data = getReservations();
    data.splice(idx, 1);
    setReservations(data);
    renderAdminTable();
    renderSlotTable();
}
window.clearAll = function() {
    if (confirm('确定要清空所有预约吗？')) {
        setReservations([]);
        renderAdminTable();
        renderSlotTable();
    }
}

// 用户端逻辑
const slotDateGroups = document.getElementById('slotDateGroups');
function renderSlotDateGroups() {
    const slots = getSlots();
    if (!slots.length) {
        slotDateGroups.innerHTML = '<div style="color:#888;">暂无可预约时间段</div>';
        return;
    }
    // 按日期和时间排序
    const sortedSlots = slots.slice().sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });
    // 按日期分组
    const group = {};
    sortedSlots.forEach(slot => {
        const date = slot.date;
        if (!group[date]) group[date] = [];
        group[date].push(slot);
    });
    let html = '';
    Object.keys(group).sort().forEach(date => {
        html += `<div class="date-group"><div class="date-title">${date}</div>`;
        html += group[date].map(slot => {
            const reservations = getReservations();
            // 只统计已通过的预约
            const count = reservations.filter(r => r.slotId === slot.id && r.status === 'approved').length;
            const disabled = count >= slot.limit ? 'disabled' : '';
            return `<button class="slot-btn" ${disabled} onclick="openModal('${slot.id}')">${slot.startTime}-${slot.endTime}（剩余${slot.limit - count}）</button>`;
        }).join('');
        html += '</div>';
    });
    slotDateGroups.innerHTML = html;
}
// 弹窗逻辑
window.openModal = function(slotId) {
    document.getElementById('modalSlotId').value = slotId;
    document.getElementById('modalClazz').value = '';
    document.getElementById('modalName').value = '';
    document.getElementById('modalPhone').value = '';
    document.getElementById('modalGroup').value = '';
    document.getElementById('modalMsg').textContent = '';
    document.getElementById('modalMask').style.display = '';
}
window.closeModal = function() {
    document.getElementById('modalMask').style.display = 'none';
}
document.getElementById('modalReservationForm').onsubmit = function(e) {
    e.preventDefault();
    const user = getCurrentUser();
    const clazz = document.getElementById('modalClazz').value.trim();
    const name = document.getElementById('modalName').value.trim();
    const phone = document.getElementById('modalPhone').value.trim();
    const group = document.getElementById('modalGroup').value.trim();
    const slotId = document.getElementById('modalSlotId').value;
    if (!clazz || !name || !phone || !group || !slotId) return;
    const slots = getSlots();
    const slot = slots.find(s => s.id === slotId);
    const reservations = getReservations();
    // 只统计已通过的预约
    const count = reservations.filter(r => r.slotId === slotId && r.status === 'approved').length;
    if (count >= slot.limit) {
        document.getElementById('modalMsg').textContent = '该时间段已约满，请选择其他时间段';
        return;
    }
    const data = getReservations();
    data.push({ username: user.username, clazz, name, phone, group, slotId, status: 'pending', submitTime: new Date().toISOString() });
    setReservations(data);
    closeModal();
    alert('预约已提交，等待管理员审核');
    renderUserTable();
    renderSlotDateGroups();
};

document.getElementById('modalMask').addEventListener('mousedown', function(e) {
    if (e.target === this) closeModal();
});

// 数据结构兼容性处理
function getSlots() {
    // 兼容旧数据结构
    const raw = JSON.parse(localStorage.getItem('slots') || '[]');
    return raw.map(s => {
        if (s.date && s.startTime && s.endTime) return s;
        // 旧数据迁移
        if (s.time) {
            const [date, time] = s.time.split('T');
            const startTime = time ? time.slice(0,5) : '';
            return { id: s.id, date, startTime, endTime: '', limit: s.limit };
        }
        return s;
    });
}
function setSlots(data) { localStorage.setItem('slots', JSON.stringify(data)); }

function renderUserTable() {
    const user = getCurrentUser();
    const reservations = getReservations().filter(r => r.username === user.username);
    const slots = getSlots();
    const tbody = document.querySelector('#reservationTable tbody');
    tbody.innerHTML = reservations.length ? reservations.map((r, i) => {
        const slot = slots.find(s => s.id === r.slotId);
        let statusText = '';
        if (r.status === 'pending') statusText = '<span style="color:#f90;">待审核</span>';
        else if (r.status === 'approved') statusText = '<span style="color:#2d6cdf;">已通过</span>';
        else if (r.status === 'rejected') statusText = '<span style="color:#e53935;">已拒绝</span>';
        return `<tr><td>${r.clazz}</td><td>${r.name}</td><td>${r.phone}</td><td>${r.group}</td><td>${slot ? `${slot.date} ${slot.startTime}-${slot.endTime}` : ''}</td><td>${statusText} ${r.status === 'pending' ? `<button onclick=\"cancelReservation(${i})\">取消</button>` : ''}</td></tr>`;
    }).join('') : '<tr><td colspan="6">暂无预约</td></tr>';
}
window.cancelReservation = function(idx) {
    const user = getCurrentUser();
    let reservations = getReservations();
    // 只删除当前用户的预约
    const userReservations = reservations.filter(r => r.username === user.username);
    userReservations.splice(idx, 1);
    // 合并回全部预约
    reservations = reservations.filter(r => r.username !== user.username).concat(userReservations);
    setReservations(reservations);
    renderUserTable();
    renderSlotDateGroups();
}

// 初始化
showAuthView();
const user = getCurrentUser();
if (user) showMainView();

});
