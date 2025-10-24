document.addEventListener('DOMContentLoaded', (event) => {

// --- TAB CONTROLS ---
const tabLinks = document.querySelectorAll('.tab-link');
const tabPanels = document.querySelectorAll('.tab-panel');

if (tabLinks.length > 0) {
tabLinks.forEach(tab => {
tab.addEventListener('click', () => {
const target = tab.dataset.tabTarget;

tabLinks.forEach(t => t.classList.remove('active'));
tabPanels.forEach(p => p.classList.remove('active'));

tab.classList.add('active');
if (target) {
document.querySelector(target).classList.add('active');
}
});
});
}

// --- MODAL HELPER FUNCTIONS ---
function showModal(modal) {
if (modal) modal.classList.add('show-modal');
}
function hideModal(modal) {
if (modal) modal.classList.remove('show-modal');
}

// --- BIRTHDAY FORMAT HELPER ---
function formatBirthdayForInput(mmddyyyy) {
if (!mmddyyyy || !mmddyyyy.includes('/')) return ''; // Basic check
const parts = mmddyyyy.split('/');
if (parts.length === 3) {
const month = parts[0].padStart(2, '0');
const day = parts[1].padStart(2, '0');
const year = parts[2];
return `${month}/${day}/${year}`; // For input type="text"
}
return mmddyyyy; // Return original if format is unexpected
}

function formatBirthdayForTable(yyyymmddOrMmddyyyy) {
if (!yyyymmddOrMmddyyyy) return '';
if (yyyymmddOrMmddyyyy.includes('/')) { // Already MM/DD/YYYY
return yyyymmddOrMmddyyyy;
}
const parts = yyyymmddOrMmddyyyy.split('-'); // Assume YYYY-MM-DD
if (parts.length === 3) {
const year = parts[0];
const month = parts[1];
const day = parts[2];
return `${month}/${day}/${year}`;
}
return yyyymmddOrMmddyyyy; // Return original if format is unexpected
}

// --- SLIDE-IN MODAL (ADD/EDIT USER) ---
const slideModalOverlay = document.getElementById('slide-modal-overlay');
const slideModal = document.getElementById('edit-user-modal');
const slideModalCloseBtn = document.getElementById('slide-modal-close-btn');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const editUserForm = document.getElementById('edit-user-form'); 
const tableBody = document.getElementById('employees-body');

// 'modalActionButton' ay para sa EDIT (pencil icon)
const modalActionButton = document.getElementById('modal-action-button'); 
// 'modalDeleteButton' ay para sa DELETE (trash icon)
const modalDeleteButton = document.getElementById('modal-delete-button'); 
// 'modalBodyActions' ay 'yung CONTAINER ng pencil at trash icons
const modalBodyActions = document.querySelector('.modal-body-actions');

// 'addUserSaveButton' ay para sa ADD ("ADD USER" button)
const addUserSaveButton = document.getElementById('btn-add-user-save');
// 'addUserButtonContainer' ay 'yung CONTAINER ng Shift dropdown at "ADD USER" button
const addUserButtonContainer = document.getElementById('add-user-button-container');

let currentRowBeingEdited = null;

// --- START: AUTO-INCREMENT ID LOGIC ---
let currentMaxId = 0; 
if (tableBody) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const idCell = row.cells[0];
        if (idCell) {
            const id = parseInt(idCell.textContent, 10);
            if (!isNaN(id) && id > currentMaxId) {
                currentMaxId = id; 
            }
        }
    });
}
// --- END: AUTO-INCREMENT ID LOGIC ---


// --- (Walang binago sa pagkuha ng iba pang modals) ---
const successModal = document.getElementById('success-modal');
const successOkayBtn = document.getElementById('success-okay-btn');
const successMessage = document.getElementById('success-message');
const successIcon = document.getElementById('success-icon');
const addUserConfirmModal = document.getElementById('add-user-confirm-modal');
const addUserCancelBtn = document.getElementById('add-user-cancel-btn');
const addUserConfirmBtn = document.getElementById('add-user-confirm-btn');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteCancelBtn = document.getElementById('delete-cancel-btn');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
const downloadIcon = document.getElementById('download-icon');
const downloadConfirmModal = document.getElementById('download-confirm-modal');
const downloadConfirmBtn = document.getElementById('download-confirm-btn');

// =======================================================
// START: FILTER AND SEARCH LOGIC
// =======================================================
const roleFilter = document.getElementById('role-filter');
const shiftFilter = document.getElementById('shift-filter');
const searchBar = document.getElementById('search-bar');

function filterTable() {
    // Only filter the User Management table
    const userManagementPanel = document.getElementById('users-panel');
    if (!tableBody || !userManagementPanel || !userManagementPanel.classList.contains('active')) {
         return; // Don't filter if User Management is not active
    }

    const roleValue = roleFilter.value.toLowerCase();
    const shiftValue = shiftFilter.value.toLowerCase();
    const searchValue = searchBar.value.toLowerCase();
    const rows = tableBody.querySelectorAll('tr.clickable-row');

    rows.forEach(row => {
        const cells = row.cells;
        if (!cells) {
            row.style.display = 'none'; // Hide if row is invalid
            return;
        }

        const roleText = cells[7] ? cells[7].textContent.toLowerCase() : '';
        const shiftText = cells[8] ? cells[8].textContent.toLowerCase() : '';
        
        let rowText = '';
        for (let i = 0; i < cells.length; i++) {
            rowText += cells[i].textContent.toLowerCase() + ' ';
        }

        const roleMatch = (roleValue === '') || (roleText === roleValue);
        const shiftMatch = (shiftValue === '') || (shiftText === shiftValue);
        const searchMatch = (searchValue === '') || rowText.includes(searchValue);

        if (roleMatch && shiftMatch && searchMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
if (roleFilter) { roleFilter.addEventListener('change', filterTable); }
if (shiftFilter) { shiftFilter.addEventListener('change', filterTable); }
if (searchBar) { searchBar.addEventListener('input', filterTable); }
// =======================================================
// END: FILTER AND SEARCH LOGIC
// =======================================================


// Show/Hide Slide-in Modal
function showSlideModal() {
if (slideModalOverlay) slideModalOverlay.classList.add('show-modal');
if (slideModal) slideModal.classList.add('show-modal');
}
function hideSlideModal() {
if (slideModalOverlay) slideModalOverlay.classList.remove('show-modal');
if (slideModal) slideModal.classList.remove('show-modal');
currentRowBeingEdited = null; 
}

if (slideModalCloseBtn) {
slideModalCloseBtn.addEventListener('click', hideSlideModal);
}
if (slideModalOverlay) {
slideModalOverlay.addEventListener('click', (e) => {
    if (e.target === slideModalOverlay) {
        hideSlideModal();
    }
});
}

// "ADD EMPLOYEE" Button: Open blank modal
if (addEmployeeBtn) {
addEmployeeBtn.addEventListener('click', () => {
    currentRowBeingEdited = null; 

    document.getElementById('edit-modal-title').textContent = 'Add New Employee'; 
    document.getElementById('edit-modal-id').textContent = 'ID: NEW';
    editUserForm.reset(); 

    // Ipakita 'yung "ADD USER" button container
    if (addUserButtonContainer) addUserButtonContainer.style.display = 'flex';
    // Itago 'yung icon container (pencil/trash)
    if (modalBodyActions) modalBodyActions.style.display = 'none';

    showSlideModal(); 
});
}

// "EDIT USER": Click table row to open populated modal
if (tableBody) {
tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr.clickable-row');
    if (!row) return;

    currentRowBeingEdited = row; 
    const cells = row.cells;

    // ... (Populate modal with data - walang binago dito) ...
    document.getElementById('edit-first-name').value = cells[1].textContent;
    document.getElementById('edit-middle-name').value = cells[2].textContent;
    document.getElementById('edit-last-name').value = cells[3].textContent;
    document.getElementById('edit-birthday').value = formatBirthdayForInput(cells[4].textContent);
    document.getElementById('edit-contact').value = cells[5].textContent;
    document.getElementById('edit-account-type').value = cells[6].textContent;
    document.getElementById('edit-role').value = cells[7].textContent;
    document.getElementById('edit-shift').value = cells[8].textContent;
    document.getElementById('edit-username').value = cells[9].textContent;
    document.getElementById('edit-email').value = cells[10].textContent;
    document.getElementById('edit-address').value = cells[11].textContent;
    document.getElementById('edit-modal-title').textContent = `${cells[1].textContent} ${cells[3].textContent}`;
    document.getElementById('edit-modal-id').textContent = `ID: ${cells[0].textContent}`;
    // ... (End ng populate) ...

    // Itago 'yung "ADD USER" button container
    if (addUserButtonContainer) addUserButtonContainer.style.display = 'none';
    // Ipakita 'yung icon container (pencil/trash)
    if (modalBodyActions) modalBodyActions.style.display = 'flex';
    // Tiyakin na visible 'yung delete icon
    if (modalDeleteButton) modalDeleteButton.style.display = 'block'; 

    showSlideModal();
});
}

// =======================================================
// BAGONG "ADD USER" BUTTON LOGIC (Para sa "ADD USER" button)
// =======================================================
if (addUserSaveButton) {
    addUserSaveButton.addEventListener('click', () => {
        
        // --- START VALIDATION ---
        if (!editUserForm.checkValidity()) {
            editUserForm.reportValidity();
            return;
        }
        // --- END VALIDATION ---

        // Dahil ito 'yung "ADD USER" button, diretso na sa add confirm modal
        showModal(addUserConfirmModal);
    });
}


// =======================================================
// BINAGONG "SAVE CHANGES" LOGIC (Para sa PENCIL icon)
// =======================================================
if (modalActionButton) {
    modalActionButton.addEventListener('click', () => {
        
        // --- START VALIDATION ---
        if (!editUserForm.checkValidity()) {
            editUserForm.reportValidity();
            return;
        }
        // --- END VALIDATION ---

        // Itong button na 'to (pencil icon) ay para lang sa pag-EDIT
        if (currentRowBeingEdited) {
            // UPDATE EXISTING ROW
            const firstName = document.getElementById('edit-first-name').value;
            const middleName = document.getElementById('edit-middle-name').value;
            const lastName = document.getElementById('edit-last-name').value;
            const birthday = document.getElementById('edit-birthday').value;
            const contact = document.getElementById('edit-contact').value;
            const accountType = document.getElementById('edit-account-type').value;
            const role = document.getElementById('edit-role').value;
            const shift = document.getElementById('edit-shift').value;
            const username = document.getElementById('edit-username').value;
            const email = document.getElementById('edit-email').value;
            const address = document.getElementById('edit-address').value;

            const cells = currentRowBeingEdited.cells;
            cells[1].textContent = firstName;
            cells[2].textContent = middleName;
            cells[3].textContent = lastName;
            cells[4].textContent = formatBirthdayForTable(birthday);
            cells[5].textContent = contact;
            cells[6].textContent = accountType;
            cells[7].textContent = role;
            cells[8].textContent = shift;
            cells[9].textContent = username;
            cells[10].textContent = email;
            cells[11].textContent = address;

            hideSlideModal();
            successMessage.textContent = "Save Changes Successfully";
         successIcon.className = 'fas fa-user-check';
            showModal(successModal);

            filterTable(); 

        } 
    });
}

// =======================================================
// ADD USER CONFIRMATION MODAL LOGIC (Walang binago dito)
// =======================================================
if (addUserCancelBtn) {
addUserCancelBtn.addEventListener('click', () => {
hideModal(addUserConfirmModal);
});
}

if (addUserConfirmBtn) {
addUserConfirmBtn.addEventListener('click', () => {
    const firstName = document.getElementById('edit-first-name').value;
    const middleName = document.getElementById('edit-middle-name').value;
    const lastName = document.getElementById('edit-last-name').value;
    const birthday = document.getElementById('edit-birthday').value;
    const contact = document.getElementById('edit-contact').value;
    const accountType = document.getElementById('edit-account-type').value;
    const role = document.getElementById('edit-role').value;
    const shift = document.getElementById('edit-shift').value;
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    const address = document.getElementById('edit-address').value;

    const newRow = tableBody.insertRow();
    newRow.classList.add('clickable-row');
    currentMaxId++; 
    newRow.insertCell(0).textContent = currentMaxId; 
    newRow.insertCell(1).textContent = firstName;
    newRow.insertCell(2).textContent = middleName;
    newRow.insertCell(3).textContent = lastName;
    newRow.insertCell(4).textContent = formatBirthdayForTable(birthday);
    newRow.insertCell(5).textContent = contact;
    newRow.insertCell(6).textContent = accountType;
    newRow.insertCell(7).textContent = role;
    newRow.insertCell(8).textContent = shift;
    newRow.insertCell(9).textContent = username;
    newRow.insertCell(10).textContent = email;
    newRow.insertCell(11).textContent = address;

    hideModal(addUserConfirmModal);
    hideSlideModal();
    successMessage.textContent = "User Added Successfully";
    successIcon.className = 'fas fa-user-plus';
    showModal(successModal);

    filterTable(); 
});
}

// =======================================================
// DELETE BUTTON & CONFIRMATION (Walang binago dito)
// =======================================================
if (modalDeleteButton) {
modalDeleteButton.addEventListener('click', () => {
if (currentRowBeingEdited) {
showModal(deleteConfirmModal);
}
});
}
if (deleteCancelBtn) {
deleteCancelBtn.addEventListener('click', () => hideModal(deleteConfirmModal));
}
if (deleteConfirmBtn) {
deleteConfirmBtn.addEventListener('click', () => {
if (currentRowBeingEdited) {
currentRowBeingEdited.remove(); 
currentRowBeingEdited = null;
hideModal(deleteConfirmModal);
hideSlideModal(); 
}
});
}

// =======================================================
// DOWNLOAD BUTTON & CONFIRMATION (Inayos ko na 'yung typos)
// =======================================================
if (downloadIcon) {
downloadIcon.addEventListener('click', () => {
showModal(downloadConfirmModal);
});
}
if(downloadConfirmModal) {
downloadConfirmModal.addEventListener('click', (e) => {
if (e.target === downloadConfirmModal) {
hideModal(downloadConfirmModal);
}
});
}
if (downloadConfirmBtn) {
    downloadConfirmBtn.addEventListener('click', () => {
        let tableToDownload;
        let filename;
        const usersPanel = document.getElementById('users-panel');
        const logsPanel = document.getElementById('logs-panel');
        if (usersPanel && usersPanel.classList.contains('active')) {
            tableToDownload = document.querySelector('.employees-table');
            filename = 'employees.csv';
        } else if (logsPanel && logsPanel.classList.contains('active')) {
            tableToDownload = document.querySelector('.logs-table');
            filename = 'user_logs.csv';
        }
        if (tableToDownload) {
            let csv = [];
            const rows = tableToDownload.querySelectorAll('tr');
            for (let i = 0; i < rows.length; i++) {
                const rowElement = rows[i];
                 if (rowElement.style.display === 'none' && tableToDownload.classList.contains('employees-table')) { 
                     continue;
                 }
                let row = [];
                const cols = rowElement.querySelectorAll('th, td');
                for (let j = 0; j < cols.length; j++) {
                    let text = cols[j].innerText.replace(/"/g, '""');
                    if (text.includes(',') || text.includes('\n') || text.includes('"')) {
                       text = `"${text}"`;
                    }
                     row.push(text);
                }
                csv.push(row.join(','));
            }
            const csvFile = new Blob(["\uFEFF" + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const downloadLink = document.createElement('a');
            downloadLink.download = filename;
            downloadLink.href = window.URL.createObjectURL(csvFile);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } 
        hideModal(downloadConfirmModal);
    });
}

// =======================================================
// SUCCESS MODAL & LOGOUT (Walang binago dito)
// =======================================================
if (successOkayBtn) {
successOkayBtn.addEventListener('click', () => {
hideModal(successModal);
});
}

const logoutLink = document.getElementById('logout-link');
const logoutConfirmModal = document.getElementById('logout-confirm-modal');
const logoutCancelBtn = document.getElementById('logout-cancel-btn');
const logoutConfirmBtn = document.getElementById('logout-confirm-btn');

if (logoutLink) {
logoutLink.addEventListener('click', (e) => {
e.preventDefault();
showModal(logoutConfirmModal);
});
}
if (logoutCancelBtn) {
logoutCancelBtn.addEventListener('click', () => hideModal(logoutConfirmModal));
}
if (logoutConfirmBtn) {
logoutConfirmBtn.addEventListener('click', () => {
alert('Logging out...'); 
hideModal(logoutConfirmModal);
// Example: window.location.href = '/login.html';
});
}

}); // <-- End of DOMContentLoaded