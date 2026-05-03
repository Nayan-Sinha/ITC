// --- State ---
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
let currentAssetIdCounter = parseInt(localStorage.getItem('currentAssetIdCounter')) || 3;
let currentAssetId = null;

let currentEmployeeIdCounter = parseInt(localStorage.getItem('currentEmployeeIdCounter')) || 3;
let currentEmployeeId = null;

const initialAssets = [
    {
        id: 1,
        name: "MacBook Pro M3 Max",
        category: "Laptop",
        value: 3499.00,
        dateAdded: "2024-01-15",
        warrantyDate: "2027-01-15",
        description: "16-inch, 64GB RAM, 2TB SSD. Assigned to Lead Developer."
    },
    {
        id: 2,
        name: "Herman Miller Aeron",
        category: "Furniture",
        value: 1200.00,
        dateAdded: "2023-11-20",
        warrantyDate: "2035-11-20",
        description: "Ergonomic office chair, size B, graphite finish."
    }
];

const initialEmployees = [
    {
        id: 1,
        name: "Alice Johnson",
        department: "IT",
        role: "System Administrator",
        email: "alice@example.com",
        status: "Active"
    },
    {
        id: 2,
        name: "Bob Smith",
        department: "HR",
        role: "HR Manager",
        email: "bob@example.com",
        status: "Active"
    }
];

let assets = JSON.parse(localStorage.getItem('assets')) || initialAssets;
let employees = JSON.parse(localStorage.getItem('employees')) || initialEmployees;

function saveAssetsToStorage() {
    localStorage.setItem('assets', JSON.stringify(assets));
    localStorage.setItem('currentAssetIdCounter', currentAssetIdCounter.toString());
}

function saveEmployeesToStorage() {
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('currentEmployeeIdCounter', currentEmployeeIdCounter.toString());
}

// --- DOM Elements ---
// Views
const loginView = document.getElementById('login-view');
const mainAppView = document.getElementById('main-app');
const detailView = document.getElementById('detail-view');
const empDetailView = document.getElementById('employee-detail-view');

// Subviews & Navigation
const assetsSubview = document.getElementById('assets-view');
const employeesSubview = document.getElementById('employees-view');
const navAssetsBtn = document.getElementById('nav-assets');
const navEmployeesBtn = document.getElementById('nav-employees');

// Login
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Dashboard
const assetListContainer = document.getElementById('asset-list');
const employeeListContainer = document.getElementById('employee-list');
const logoutBtn = document.getElementById('logout-btn');

// Add Asset Modal
const showAddModalBtn = document.getElementById('show-add-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const addModal = document.getElementById('add-modal');
const addAssetForm = document.getElementById('add-asset-form');
const modalTitle = document.getElementById('modal-title');
const assetCategorySelect = document.getElementById('asset-category');
const customCategoryInput = document.getElementById('custom-category');

// Add Employee Modal
const showAddEmployeeBtn = document.getElementById('show-add-employee-btn');
const closeEmpModalBtn = document.getElementById('close-emp-modal-btn');
const addEmpModal = document.getElementById('add-employee-modal');
const addEmployeeForm = document.getElementById('add-employee-form');
const empModalTitle = document.getElementById('emp-modal-title');

function resetCategoryDropdown() {
    customCategoryInput.classList.add('hidden');
    customCategoryInput.required = false;
    customCategoryInput.value = '';
}

// Detail View Elements
const backBtn = document.getElementById('back-btn');
const detailCategory = document.getElementById('detail-category');
const detailId = document.getElementById('detail-id');
const detailName = document.getElementById('detail-name');
const detailValue = document.getElementById('detail-value');
const detailDate = document.getElementById('detail-date');
const detailAssigned = document.getElementById('detail-assigned');
const detailWarranty = document.getElementById('detail-warranty');
const detailDesc = document.getElementById('detail-desc');

// Assignments DOM Elements
const assignModal = document.getElementById('assign-modal');
const closeAssignModalBtn = document.getElementById('close-assign-modal-btn');
const assignForm = document.getElementById('assign-form');
const assignEmployeeSelect = document.getElementById('assign-employee');
const assignDateInput = document.getElementById('assign-date');

// Employee Detail View Elements
const empBackBtn = document.getElementById('emp-back-btn');
const empDetailDept = document.getElementById('emp-detail-dept');
const empDetailId = document.getElementById('emp-detail-id');
const empDetailName = document.getElementById('emp-detail-name');
const empDetailRole = document.getElementById('emp-detail-role');
const empDetailEmail = document.getElementById('emp-detail-email');
const editEmpBtn = document.getElementById('edit-emp-btn');
const deleteEmpBtn = document.getElementById('delete-emp-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

assetCategorySelect.addEventListener('change', (e) => {
    if (e.target.value === 'Custom') {
        customCategoryInput.classList.remove('hidden');
        customCategoryInput.required = true;
    } else {
        resetCategoryDropdown();
    }
});

// --- View Management ---
function showView(viewId) {
    // Hide all views except the target
    document.querySelectorAll('.view').forEach(v => {
        if (v.id !== viewId) {
            v.classList.remove('active');
            setTimeout(() => v.classList.add('hidden'), 400); // Wait for fade out
        }
    });

    // Show target view
    const target = document.getElementById(viewId);
    target.classList.remove('hidden');
    // small delay to allow display:block to apply before opacity transition
    setTimeout(() => target.classList.add('active'), 50);
}

// --- Authentication ---
function checkAuth() {
    if (isAuthenticated) {
        showView('main-app');
        renderAssets();
        renderEmployees();
    } else {
        showView('login-view');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

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

// --- Dashboard ---
function renderAssets() {
    assetListContainer.innerHTML = '';
    
    if (assets.length === 0) {
        assetListContainer.innerHTML = '<p class="text-secondary">No assets found. Add one to get started.</p>';
        return;
    }

    assets.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'glass-card asset-card';
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                viewAssetDetails(asset.id);
            }
        };
        
        let assignmentHtml = '';
        if (asset.assignedTo) {
            const emp = employees.find(e => e.id === parseInt(asset.assignedTo));
            const empName = emp ? emp.name : 'Unknown';
            assignmentHtml = `
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <span class="asset-date" style="color: var(--accent-primary)">Assigned: ${empName}</span>
                    <button class="danger-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="returnAsset(${asset.id}, event)">Return</button>
                </div>
            `;
        } else {
            assignmentHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                    <span class="asset-date" style="color: var(--success)">Unassigned</span>
                    <button class="primary-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="openAssignModal(${asset.id}, event)">Assign</button>
                </div>
            `;
        }
            
        card.innerHTML = `
            <div class="card-header">
                <span class="category-badge">${asset.category}</span>
                <span class="asset-id">AST-${asset.id.toString().padStart(4, '0')}</span>
            </div>
            <h4 class="asset-name">${asset.name}</h4>
            <p class="asset-desc-short">${asset.description}</p>
            <div class="card-footer" style="align-items: center">
                <span class="asset-value">₹${asset.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                ${assignmentHtml}
            </div>
        `;
        assetListContainer.appendChild(card);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// --- Add Asset Modal ---
showAddModalBtn.addEventListener('click', () => {
    currentAssetId = null;
    if (modalTitle) modalTitle.textContent = 'Add New Asset';
    resetCategoryDropdown();
    addModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    addModal.classList.add('hidden');
    resetCategoryDropdown();
    addAssetForm.reset();
});

// Close modal when clicking outside content
addModal.addEventListener('click', (e) => {
    if (e.target === addModal || e.target.classList.contains('modal-backdrop')) {
        addModal.classList.add('hidden');
        resetCategoryDropdown();
        addAssetForm.reset();
    }
});

addAssetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let finalCategory = assetCategorySelect.value;
    if (finalCategory === 'Custom') {
        finalCategory = customCategoryInput.value.trim();
    }
    
    if (currentAssetId) {
        // Edit existing asset
        const asset = assets.find(a => a.id === currentAssetId);
        if (asset) {
            asset.name = document.getElementById('asset-name').value;
            asset.category = finalCategory;
            asset.value = parseFloat(document.getElementById('asset-value').value);
            asset.warrantyDate = document.getElementById('asset-warranty').value;
            asset.description = document.getElementById('asset-desc').value;
        }
        viewAssetDetails(currentAssetId); // Update detail view immediately
    } else {
        // Add new asset
        const newAsset = {
            id: currentAssetIdCounter++,
            name: document.getElementById('asset-name').value,
            category: finalCategory,
            value: parseFloat(document.getElementById('asset-value').value),
            warrantyDate: document.getElementById('asset-warranty').value,
            description: document.getElementById('asset-desc').value,
            dateAdded: new Date().toISOString().split('T')[0]
        };
        assets.unshift(newAsset); // Add to beginning of array
    }
    
    saveAssetsToStorage();
    addModal.classList.add('hidden');
    resetCategoryDropdown();
    addAssetForm.reset();
    renderAssets();
});

// --- Detail View ---
function viewAssetDetails(id) {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    currentAssetId = id;

    detailCategory.textContent = asset.category;
    detailId.textContent = `AST-${asset.id.toString().padStart(4, '0')}`;
    detailName.textContent = asset.name;
    detailValue.textContent = `₹${asset.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
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

    if (detailWarranty) detailWarranty.textContent = asset.warrantyDate ? formatDate(asset.warrantyDate) : 'N/A';
    detailDesc.textContent = asset.description;

    showView('detail-view');
}

backBtn.addEventListener('click', () => {
    showView('main-app');
});

// Edit and Delete actions
document.getElementById('edit-btn').addEventListener('click', () => {
    const asset = assets.find(a => a.id === currentAssetId);
    if (!asset) return;

    if (modalTitle) modalTitle.textContent = 'Edit Asset';
    document.getElementById('asset-name').value = asset.name;
    
    // Handle category dropdown
    const categoryOptions = Array.from(assetCategorySelect.options).map(opt => opt.value);
    if (categoryOptions.includes(asset.category)) {
        assetCategorySelect.value = asset.category;
        resetCategoryDropdown();
        assetCategorySelect.value = asset.category; // Needs to be re-assigned after reset
    } else {
        assetCategorySelect.value = 'Custom';
        customCategoryInput.classList.remove('hidden');
        customCategoryInput.required = true;
        customCategoryInput.value = asset.category;
    }

    document.getElementById('asset-value').value = asset.value;
    document.getElementById('asset-warranty').value = asset.warrantyDate || '';
    document.getElementById('asset-desc').value = asset.description;
    
    addModal.classList.remove('hidden');
});

document.getElementById('delete-btn').addEventListener('click', () => {
    assets = assets.filter(a => a.id !== currentAssetId);
    saveAssetsToStorage();
    renderAssets();
    showView('main-app');
});

// ==========================================
// --- Navigation Logic ---
// ==========================================
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

// ==========================================
// --- Employees Logic ---
// ==========================================
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
                <span class="asset-id">EMP-${emp.id.toString().padStart(4, '0')}</span>
            </div>
            <h4 class="asset-name">${emp.name}</h4>
            <p class="asset-desc-short">${emp.role}</p>
            <div class="card-footer">
                <span class="asset-date" style="color: var(--text-secondary)">${emp.email}</span>
                <span class="asset-value" style="font-size: 0.85rem">${emp.status}</span>
            </div>
        `;
        employeeListContainer.appendChild(card);
    });
}

// --- Add Employee Modal ---
showAddEmployeeBtn.addEventListener('click', () => {
    currentEmployeeId = null;
    if (empModalTitle) empModalTitle.textContent = 'Add New Employee';
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

addEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentEmployeeId) {
        const emp = employees.find(e => e.id === currentEmployeeId);
        if (emp) {
            emp.name = document.getElementById('emp-name').value;
            emp.department = document.getElementById('emp-dept').value;
            emp.role = document.getElementById('emp-role').value;
            emp.email = document.getElementById('emp-email').value;
        }
        viewEmployeeDetails(currentEmployeeId);
    } else {
        const newEmp = {
            id: currentEmployeeIdCounter++,
            name: document.getElementById('emp-name').value,
            department: document.getElementById('emp-dept').value,
            role: document.getElementById('emp-role').value,
            email: document.getElementById('emp-email').value,
            status: "Active"
        };
        employees.unshift(newEmp);
    }
    
    saveEmployeesToStorage();
    addEmpModal.classList.add('hidden');
    addEmployeeForm.reset();
    renderEmployees();
});

// --- Employee Detail View ---
function viewEmployeeDetails(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    currentEmployeeId = id;

    empDetailDept.textContent = emp.department;
    empDetailId.textContent = `EMP-${emp.id.toString().padStart(4, '0')}`;
    empDetailName.textContent = emp.name;
    empDetailRole.textContent = emp.role;
    empDetailEmail.textContent = emp.email;

    showView('employee-detail-view');
}

empBackBtn.addEventListener('click', () => {
    showView('main-app');
});

editEmpBtn.addEventListener('click', () => {
    const emp = employees.find(e => e.id === currentEmployeeId);
    if (!emp) return;

    if (empModalTitle) empModalTitle.textContent = 'Edit Employee';
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-dept').value = emp.department;
    document.getElementById('emp-role').value = emp.role;
    document.getElementById('emp-email').value = emp.email;
    
    addEmpModal.classList.remove('hidden');
});

deleteEmpBtn.addEventListener('click', () => {
    employees = employees.filter(e => e.id !== currentEmployeeId);
    saveEmployeesToStorage();
    renderEmployees();
    showView('main-app');
});

// ==========================================
// --- Assignments Logic ---
// ==========================================
let currentAssignAssetId = null;

function returnAsset(assetId, e) {
    if (e) e.stopPropagation();
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
        asset.assignedTo = null;
        asset.assignmentDate = null;
        saveAssetsToStorage();
        renderAssets();
    }
}

function openAssignModal(assetId, e) {
    if (e) e.stopPropagation();
    currentAssignAssetId = assetId;
    populateAssignDropdowns();
    assignModal.classList.remove('hidden');
}

// Assign Modal
function populateAssignDropdowns() {
    assignEmployeeSelect.innerHTML = '<option value="" disabled selected>Select an employee...</option>';
    employees.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.name} (${e.department})`;
        assignEmployeeSelect.appendChild(opt);
    });

    assignDateInput.value = new Date().toISOString().split('T')[0];
}

if (closeAssignModalBtn) {
    closeAssignModalBtn.addEventListener('click', () => {
        assignModal.classList.add('hidden');
        assignForm.reset();
    });
}

if (assignModal) {
    assignModal.addEventListener('click', (e) => {
        if (e.target === assignModal || e.target.classList.contains('modal-backdrop')) {
            assignModal.classList.add('hidden');
            assignForm.reset();
        }
    });
}

if (assignForm) {
    assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const empId = assignEmployeeSelect.value;
        const date = assignDateInput.value;
        
        const asset = assets.find(a => a.id === currentAssignAssetId);
        if (asset) {
            asset.assignedTo = empId;
            asset.assignmentDate = date;
            saveAssetsToStorage();
            
            assignModal.classList.add('hidden');
            assignForm.reset();
            
            renderAssets();
        }
    });
}
