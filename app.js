// ─── CONFIG ────────────────────────────────────────────────────────────────────
// After deploying your server on Railway, paste its public URL here.
// e.g. 'https://your-api-name.up.railway.app'
const API_BASE = 'https://your-api-url.up.railway.app';

// ─── STATE ─────────────────────────────────────────────────────────────────────
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
let assets = [];
let employees = [];
let currentAssetId = null;
let currentEmployeeId = null;
let currentAssignAssetId = null;

// ─── DOM ELEMENTS ──────────────────────────────────────────────────────────────
const loginView       = document.getElementById('login-view');
const mainAppView     = document.getElementById('main-app');
const detailView      = document.getElementById('detail-view');
const empDetailView   = document.getElementById('employee-detail-view');

const assetsSubview   = document.getElementById('assets-view');
const employeesSubview= document.getElementById('employees-view');
const navAssetsBtn    = document.getElementById('nav-assets');
const navEmployeesBtn = document.getElementById('nav-employees');

const loginForm       = document.getElementById('login-form');
const loginError      = document.getElementById('login-error');

const assetListContainer    = document.getElementById('asset-list');
const employeeListContainer = document.getElementById('employee-list');
const logoutBtn             = document.getElementById('logout-btn');

const showAddModalBtn   = document.getElementById('show-add-modal-btn');
const closeModalBtn     = document.getElementById('close-modal-btn');
const addModal          = document.getElementById('add-modal');
const addAssetForm      = document.getElementById('add-asset-form');
const modalTitle        = document.getElementById('modal-title');
const assetCategorySelect   = document.getElementById('asset-category');
const customCategoryInput   = document.getElementById('custom-category');

const showAddEmployeeBtn= document.getElementById('show-add-employee-btn');
const closeEmpModalBtn  = document.getElementById('close-emp-modal-btn');
const addEmpModal       = document.getElementById('add-employee-modal');
const addEmployeeForm   = document.getElementById('add-employee-form');
const empModalTitle     = document.getElementById('emp-modal-title');

const backBtn         = document.getElementById('back-btn');
const detailCategory  = document.getElementById('detail-category');
const detailId        = document.getElementById('detail-id');
const detailName      = document.getElementById('detail-name');
const detailValue     = document.getElementById('detail-value');
const detailDate      = document.getElementById('detail-date');
const detailAssigned  = document.getElementById('detail-assigned');
const detailWarranty  = document.getElementById('detail-warranty');
const detailDesc      = document.getElementById('detail-desc');

const assignModal         = document.getElementById('assign-modal');
const closeAssignModalBtn = document.getElementById('close-assign-modal-btn');
const assignForm          = document.getElementById('assign-form');
const assignEmployeeSelect= document.getElementById('assign-employee');
const assignDateInput     = document.getElementById('assign-date');

const empBackBtn      = document.getElementById('emp-back-btn');
const empDetailDept   = document.getElementById('emp-detail-dept');
const empDetailId     = document.getElementById('emp-detail-id');
const empDetailName   = document.getElementById('emp-detail-name');
const empDetailRole   = document.getElementById('emp-detail-role');
const empDetailEmail  = document.getElementById('emp-detail-email');
const editEmpBtn      = document.getElementById('edit-emp-btn');
const deleteEmpBtn    = document.getElementById('delete-emp-btn');

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function showLoading(container) {
    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-secondary);">
            <div style="font-size:1.5rem; margin-bottom:0.5rem;">⏳</div>
            <p>Loading...</p>
        </div>`;
}

function showError(container, msg) {
    container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--danger);">
            <div style="font-size:1.5rem; margin-bottom:0.5rem;">⚠️</div>
            <p>${msg}</p>
        </div>`;
}

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function resetCategoryDropdown() {
    customCategoryInput.classList.add('hidden');
    customCategoryInput.required = false;
    customCategoryInput.value = '';
}

// ─── VIEW MANAGEMENT ───────────────────────────────────────────────────────────
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        if (v.id !== viewId) {
            v.classList.remove('active');
            setTimeout(() => v.classList.add('hidden'), 400);
        }
    });
    const target = document.getElementById(viewId);
    target.classList.remove('hidden');
    setTimeout(() => target.classList.add('active'), 50);
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { checkAuth(); });

function checkAuth() {
    if (isAuthenticated) {
        showView('main-app');
        loadDashboard();
    } else {
        showView('login-view');
    }
}

async function loadDashboard() {
    showLoading(assetListContainer);
    showLoading(employeeListContainer);
    try {
        [assets, employees] = await Promise.all([
            apiFetch('/api/assets'),
            apiFetch('/api/employees')
        ]);
        renderAssets();
        renderEmployees();
    } catch (err) {
        showError(assetListContainer, 'Could not connect to server. Please check your API URL.');
        showError(employeeListContainer, 'Could not connect to server.');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('username').value;
    const pass   = document.getElementById('password').value;
    if (userId === 'sinhanayankumar@gmail.com' && pass === 'ITnayan@2026') {
        isAuthenticated = true;
        localStorage.setItem('isAuthenticated', 'true');
        loginError.style.display = 'none';
        checkAuth();
    } else {
        loginError.style.display = 'block';
    }
});

logoutBtn.addEventListener('click', () => {
    isAuthenticated = false;
    localStorage.removeItem('isAuthenticated');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    checkAuth();
});

// ─── NAVIGATION ────────────────────────────────────────────────────────────────
navAssetsBtn.addEventListener('click', () => {
    navAssetsBtn.classList.add('active');
    navEmployeesBtn.classList.remove('active');
    assetsSubview.classList.add('active');
    assetsSubview.classList.remove('hidden');
    employeesSubview.classList.remove('active');
    employeesSubview.classList.add('hidden');
});

navEmployeesBtn.addEventListener('click', () => {
    navEmployeesBtn.classList.add('active');
    navAssetsBtn.classList.remove('active');
    employeesSubview.classList.add('active');
    employeesSubview.classList.remove('hidden');
    assetsSubview.classList.remove('active');
    assetsSubview.classList.add('hidden');
});

assetCategorySelect.addEventListener('change', (e) => {
    if (e.target.value === 'Custom') {
        customCategoryInput.classList.remove('hidden');
        customCategoryInput.required = true;
    } else {
        resetCategoryDropdown();
    }
});

// ─── RENDER ASSETS ─────────────────────────────────────────────────────────────
function renderAssets() {
    assetListContainer.innerHTML = '';
    if (assets.length === 0) {
        assetListContainer.innerHTML = '<p class="text-secondary">No assets found. Add one to get started.</p>';
        return;
    }
    assets.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'glass-card asset-card';
        card.onclick = (e) => { if (e.target.tagName !== 'BUTTON') viewAssetDetails(asset.id); };

        let assignmentHtml = '';
        if (asset.assignedTo) {
            const emp = employees.find(e => e.id === parseInt(asset.assignedTo));
            const empName = emp ? emp.name : 'Unknown';
            assignmentHtml = `
                <div style="display:flex;flex-direction:column;gap:0.25rem;">
                    <span class="asset-date" style="color:var(--accent-primary)">Assigned: ${empName}</span>
                    <button class="danger-btn" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="returnAsset(${asset.id}, event)">Return</button>
                </div>`;
        } else {
            assignmentHtml = `
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem;">
                    <span class="asset-date" style="color:var(--success)">Unassigned</span>
                    <button class="primary-btn" style="padding:0.3rem 0.6rem;font-size:0.8rem;" onclick="openAssignModal(${asset.id}, event)">Assign</button>
                </div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="category-badge">${asset.category}</span>
                <span class="asset-id">AST-${String(asset.id).padStart(4,'0')}</span>
            </div>
            <h4 class="asset-name">${asset.name}</h4>
            <p class="asset-desc-short">${asset.description || ''}</p>
            <div class="card-footer" style="align-items:center">
                <span class="asset-value">₹${parseFloat(asset.value).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
                ${assignmentHtml}
            </div>`;
        assetListContainer.appendChild(card);
    });
}

// ─── ADD / EDIT ASSET MODAL ────────────────────────────────────────────────────
showAddModalBtn.addEventListener('click', () => {
    currentAssetId = null;
    if (modalTitle) modalTitle.textContent = 'Add New Asset';
    addAssetForm.reset();
    resetCategoryDropdown();
    addModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    addModal.classList.add('hidden');
    resetCategoryDropdown();
    addAssetForm.reset();
});

addModal.addEventListener('click', (e) => {
    if (e.target === addModal || e.target.classList.contains('modal-backdrop')) {
        addModal.classList.add('hidden');
        resetCategoryDropdown();
        addAssetForm.reset();
    }
});

addAssetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let finalCategory = assetCategorySelect.value;
    if (finalCategory === 'Custom') finalCategory = customCategoryInput.value.trim();

    const body = {
        name:         document.getElementById('asset-name').value,
        category:     finalCategory,
        value:        parseFloat(document.getElementById('asset-value').value),
        warrantyDate: document.getElementById('asset-warranty').value,
        description:  document.getElementById('asset-desc').value,
        dateAdded:    new Date().toISOString().split('T')[0]
    };

    try {
        if (currentAssetId) {
            const updated = await apiFetch(`/api/assets/${currentAssetId}`, { method: 'PUT', body: JSON.stringify(body) });
            const idx = assets.findIndex(a => a.id === currentAssetId);
            if (idx !== -1) assets[idx] = updated;
            viewAssetDetails(currentAssetId);
        } else {
            const created = await apiFetch('/api/assets', { method: 'POST', body: JSON.stringify(body) });
            assets.unshift(created);
        }
        addModal.classList.add('hidden');
        resetCategoryDropdown();
        addAssetForm.reset();
        renderAssets();
    } catch (err) {
        alert('Failed to save asset. Please try again.');
    }
});

// ─── ASSET DETAIL VIEW ─────────────────────────────────────────────────────────
function viewAssetDetails(id) {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    currentAssetId = id;

    detailCategory.textContent = asset.category;
    detailId.textContent = `AST-${String(asset.id).padStart(4,'0')}`;
    detailName.textContent = asset.name;
    detailValue.textContent = `₹${parseFloat(asset.value).toLocaleString('en-IN',{minimumFractionDigits:2})}`;
    detailDate.textContent = formatDate(asset.dateAdded);

    if (detailAssigned) {
        if (asset.assignedTo) {
            const emp = employees.find(e => e.id === parseInt(asset.assignedTo));
            detailAssigned.textContent = emp ? emp.name : `EMP-${asset.assignedTo}`;
            detailAssigned.className = 'metric-value status-assigned';
        } else {
            detailAssigned.textContent = 'Unassigned';
            detailAssigned.className = 'metric-value status-unassigned';
        }
    }
    if (detailWarranty) detailWarranty.textContent = formatDate(asset.warrantyDate);
    detailDesc.textContent = asset.description || '';
    showView('detail-view');
}

backBtn.addEventListener('click', () => showView('main-app'));

document.getElementById('edit-btn').addEventListener('click', () => {
    const asset = assets.find(a => a.id === currentAssetId);
    if (!asset) return;
    if (modalTitle) modalTitle.textContent = 'Edit Asset';
    document.getElementById('asset-name').value = asset.name;

    const categoryOptions = Array.from(assetCategorySelect.options).map(opt => opt.value);
    if (categoryOptions.includes(asset.category)) {
        assetCategorySelect.value = asset.category;
        resetCategoryDropdown();
        assetCategorySelect.value = asset.category;
    } else {
        assetCategorySelect.value = 'Custom';
        customCategoryInput.classList.remove('hidden');
        customCategoryInput.required = true;
        customCategoryInput.value = asset.category;
    }
    document.getElementById('asset-value').value = asset.value;
    document.getElementById('asset-warranty').value = asset.warrantyDate ? asset.warrantyDate.split('T')[0] : '';
    document.getElementById('asset-desc').value = asset.description || '';
    addModal.classList.remove('hidden');
});

document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
        await apiFetch(`/api/assets/${currentAssetId}`, { method: 'DELETE' });
        assets = assets.filter(a => a.id !== currentAssetId);
        renderAssets();
        showView('main-app');
    } catch (err) {
        alert('Failed to delete asset.');
    }
});

// ─── ASSIGNMENT ────────────────────────────────────────────────────────────────
function openAssignModal(assetId, e) {
    if (e) e.stopPropagation();
    currentAssignAssetId = assetId;
    assignEmployeeSelect.innerHTML = '<option value="" disabled selected>Select an employee...</option>';
    employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id;
        opt.textContent = `${emp.name} (${emp.department})`;
        assignEmployeeSelect.appendChild(opt);
    });
    assignDateInput.value = new Date().toISOString().split('T')[0];
    assignModal.classList.remove('hidden');
}

async function returnAsset(assetId, e) {
    if (e) e.stopPropagation();
    try {
        const updated = await apiFetch(`/api/assets/${assetId}/assign`, {
            method: 'PATCH',
            body: JSON.stringify({ assignedTo: null, assignmentDate: null })
        });
        const idx = assets.findIndex(a => a.id === assetId);
        if (idx !== -1) assets[idx] = updated;
        renderAssets();
    } catch (err) {
        alert('Failed to return asset.');
    }
}

closeAssignModalBtn.addEventListener('click', () => {
    assignModal.classList.add('hidden');
    assignForm.reset();
});

assignModal.addEventListener('click', (e) => {
    if (e.target === assignModal || e.target.classList.contains('modal-backdrop')) {
        assignModal.classList.add('hidden');
        assignForm.reset();
    }
});

assignForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const updated = await apiFetch(`/api/assets/${currentAssignAssetId}/assign`, {
            method: 'PATCH',
            body: JSON.stringify({ assignedTo: assignEmployeeSelect.value, assignmentDate: assignDateInput.value })
        });
        const idx = assets.findIndex(a => a.id === currentAssignAssetId);
        if (idx !== -1) assets[idx] = updated;
        assignModal.classList.add('hidden');
        assignForm.reset();
        renderAssets();
    } catch (err) {
        alert('Failed to assign asset.');
    }
});

// ─── RENDER EMPLOYEES ──────────────────────────────────────────────────────────
function renderEmployees() {
    employeeListContainer.innerHTML = '';
    if (employees.length === 0) {
        employeeListContainer.innerHTML = '<p class="text-secondary">No employees found. Add one to get started.</p>';
        return;
    }
    employees.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'glass-card asset-card';
        card.onclick = () => viewEmployeeDetails(emp.id);
        card.innerHTML = `
            <div class="card-header">
                <span class="category-badge">${emp.department}</span>
                <span class="asset-id">EMP-${String(emp.id).padStart(4,'0')}</span>
            </div>
            <h4 class="asset-name">${emp.name}</h4>
            <p class="asset-desc-short">${emp.role}</p>
            <div class="card-footer">
                <span class="asset-date" style="color:var(--text-secondary)">${emp.email}</span>
                <span class="asset-value" style="font-size:0.85rem">${emp.status}</span>
            </div>`;
        employeeListContainer.appendChild(card);
    });
}

// ─── ADD / EDIT EMPLOYEE MODAL ─────────────────────────────────────────────────
showAddEmployeeBtn.addEventListener('click', () => {
    currentEmployeeId = null;
    if (empModalTitle) empModalTitle.textContent = 'Add New Employee';
    addEmployeeForm.reset();
    addEmpModal.classList.remove('hidden');
});

closeEmpModalBtn.addEventListener('click', () => {
    addEmpModal.classList.add('hidden');
    addEmployeeForm.reset();
});

addEmpModal.addEventListener('click', (e) => {
    if (e.target === addEmpModal || e.target.classList.contains('modal-backdrop')) {
        addEmpModal.classList.add('hidden');
        addEmployeeForm.reset();
    }
});

addEmployeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        name:       document.getElementById('emp-name').value,
        department: document.getElementById('emp-dept').value,
        role:       document.getElementById('emp-role').value,
        email:      document.getElementById('emp-email').value
    };
    try {
        if (currentEmployeeId) {
            const updated = await apiFetch(`/api/employees/${currentEmployeeId}`, { method: 'PUT', body: JSON.stringify(body) });
            const idx = employees.findIndex(e => e.id === currentEmployeeId);
            if (idx !== -1) employees[idx] = updated;
            viewEmployeeDetails(currentEmployeeId);
        } else {
            const created = await apiFetch('/api/employees', { method: 'POST', body: JSON.stringify(body) });
            employees.unshift(created);
        }
        addEmpModal.classList.add('hidden');
        addEmployeeForm.reset();
        renderEmployees();
    } catch (err) {
        alert('Failed to save employee. Please try again.');
    }
});

// ─── EMPLOYEE DETAIL VIEW ──────────────────────────────────────────────────────
function viewEmployeeDetails(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    currentEmployeeId = id;
    empDetailDept.textContent  = emp.department;
    empDetailId.textContent    = `EMP-${String(emp.id).padStart(4,'0')}`;
    empDetailName.textContent  = emp.name;
    empDetailRole.textContent  = emp.role;
    empDetailEmail.textContent = emp.email;
    showView('employee-detail-view');
}

empBackBtn.addEventListener('click', () => showView('main-app'));

editEmpBtn.addEventListener('click', () => {
    const emp = employees.find(e => e.id === currentEmployeeId);
    if (!emp) return;
    if (empModalTitle) empModalTitle.textContent = 'Edit Employee';
    document.getElementById('emp-name').value  = emp.name;
    document.getElementById('emp-dept').value  = emp.department;
    document.getElementById('emp-role').value  = emp.role;
    document.getElementById('emp-email').value = emp.email;
    addEmpModal.classList.remove('hidden');
});

deleteEmpBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
        await apiFetch(`/api/employees/${currentEmployeeId}`, { method: 'DELETE' });
        employees = employees.filter(e => e.id !== currentEmployeeId);
        renderEmployees();
        showView('main-app');
    } catch (err) {
        alert('Failed to delete employee.');
    }
});
