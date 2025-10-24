// script.js (UPDATED WITH HISTORY LOGGING, FIXES, and CHANGE PASSWORD MODAL)

document.addEventListener('DOMContentLoaded', (event) => {

    // --- MGA ELEMENTS SA PAGE ---
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const tableBody = document.getElementById('inventory-body');

    const historyTableBody = document.getElementById('history-body'); // History table body
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const refreshIcon = document.getElementById('refresh-icon');
    const downloadIcon = document.getElementById('download-icon');

    // --- ADD ITEM MODAL (1) ---
    const addItemBtn = document.querySelector('.add-item-btn');
    const modalOverlay = document.getElementById('add-item-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const addItemForm = document.getElementById('add-item-form');
    const addItemCategorySelect = document.getElementById('item-category');

    // --- CONFIRMATION (ADD) MODAL (2) ---
    const confirmModalOverlay = document.getElementById('confirmation-modal');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmAddBtn = document.getElementById('confirm-add-btn');

    // --- SUCCESS MODAL (3) ---
    const successModalOverlay = document.getElementById('success-modal');
    const successOkayBtn = document.getElementById('success-okay-btn');

    // --- EDIT ITEM MODAL (4) ---
    const editModalOverlay = document.getElementById('edit-item-modal');
    const editModalCloseBtn = document.getElementById('edit-modal-close-btn');
    const editItemForm = document.getElementById('edit-item-form');
    const editItemCategorySelect = document.getElementById('edit-item-category');

    // --- CONFIRMATION (DELETE) MODAL (5) ---
    const deleteConfirmModalOverlay = document.getElementById('delete-confirm-modal');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

    // --- PROFILE SIDEBAR ---
    const userProfileBtn = document.querySelector('.user-profile');
    const profileSidebar = document.getElementById('profile-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

     // --- EDIT CATEGORY MODAL (6) ---
    const editCategoryModalOverlay = document.getElementById('edit-category-modal');
    const categoryModalCloseBtn = document.getElementById('category-modal-close-btn');
    const addCategoryEditIcon = document.getElementById('add-category-edit-icon');
    // const editCategoryEditIcon = document.getElementById('edit-category-edit-icon'); // Removed as icon is removed in Edit modal
    const categoryListUl = document.getElementById('category-list-ul');
    const addCategoryForm = document.getElementById('add-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const saveCategoryChangesBtn = document.getElementById('save-category-changes-btn'); // This is the "DONE" button

    // --- ACCOUNT DETAILS MODALS ---
    const accountDetailsLink = document.getElementById('account-details-link');
    const accountDetailsModal = document.getElementById('account-details-modal');
    const accountModalCloseBtn = document.getElementById('account-modal-close-btn');
    const accountDetailsForm = document.getElementById('account-details-form');
    const saveConfirmModal = document.getElementById('save-confirm-modal');
    const saveCancelBtn = document.getElementById('save-cancel-btn');
    const saveConfirmBtn = document.getElementById('save-confirm-btn');
    const saveSuccessModal = document.getElementById('save-success-modal');
    const saveSuccessOkayBtn = document.getElementById('save-success-okay-btn');

    // --- NEW: LOGOUT MODALS ---
    const logoutLink = document.getElementById('logout-link');
    const logoutConfirmModal = document.getElementById('logout-confirm-modal');
    const logoutCancelBtn = document.getElementById('logout-cancel-btn');
    const logoutConfirmBtn = document.getElementById('logout-confirm-btn');

    // --- NEW: DOWNLOAD HISTORY MODAL ---
    const downloadHistoryModal = document.getElementById('download-history-modal');
    const downloadHistoryBtn = document.getElementById('download-history-btn');

    // --- NEW: CHANGE PASSWORD MODAL ---
    const changePasswordLink = document.getElementById('change-password-link');
    const changePasswordModal = document.getElementById('change-password-modal');
    const changePwCloseBtn = document.getElementById('change-pw-close-btn');
    const changePwCancelBtn = document.getElementById('change-pw-cancel-btn');
    const changePasswordForm = document.getElementById('change-password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-new-password');


    // --- TEMPORARY STORAGE ---
    let pendingItemData = null;
    let currentRowBeingEdited = null;
    let rowToDelete = null;

    // Auto-incrementing ID
    let nextItemId = 105; // Start after the highest initial hardcoded ID

    // Category Management Logic
    let categories = [
        "Cleaning solution",
        "Electrical",
        "Furniture & Fixtures",
        "Room Amenities"
    ];

    function populateCategorySelects() {
        const selects = [categoryFilter, addItemCategorySelect, editItemCategorySelect];
        selects.forEach(select => {
            if (!select) return;
            const currentValue = select.value;
            let firstOptionHTML = '';
            if (select === categoryFilter && select.options[0] && select.options[0].value === "") {
                 firstOptionHTML = select.options[0].outerHTML;
            }
            else if (select === addItemCategorySelect && select.options[0] && select.options[0].value === "") {
                 firstOptionHTML = select.options[0].outerHTML;
            }

            select.innerHTML = firstOptionHTML; // Start fresh or with placeholder
            const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));
            sortedCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });

            if (categories.includes(currentValue)) {
                select.value = currentValue;
            } else if (!firstOptionHTML && categories.length > 0) {
                 select.value = sortedCategories[0];
            } else if (!firstOptionHTML && categories.length === 0) {
                 select.value = '';
            }
        });
    }


    function populateCategoryModalList() {
        if (!categoryListUl) return;
        categoryListUl.innerHTML = '';
        if (categories.length === 0) {
        	categoryListUl.innerHTML = '<li class="category-list-item">No categories found. Add one below.</li>';
        } else {
            const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));
            sortedCategories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'category-list-item';
                const escapedCat = cat.replace(/"/g, '&quot;');
                li.innerHTML = `
                    <span>${cat}</span>
                    <span class="category-actions">
                        <i class="fas fa-trash" data-category-name="${escapedCat}" title="Delete Category"></i>
                    </span>
                `;
                categoryListUl.appendChild(li);
            });
        }
    }

    function openCategoryModal() {
        populateCategoryModalList();
        showModal(editCategoryModalOverlay);
    }

    // --- ADD HISTORY LOG FUNCTION ---
    function addHistoryLog(id, name, category, newQuantity, qtyChange, newStatus, originalStockInDate, actionType) {
        if (!historyTableBody) return;
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const actionTimestamp = `${month}/${day}/${year} ${hours}:${minutes}`;

        let qtyChangeClass = '';
        let qtyChangeText = '';
        if (qtyChange > 0) { qtyChangeClass = 'qty-in'; qtyChangeText = `+${qtyChange}`; }
        else if (qtyChange < 0) { qtyChangeClass = 'qty-out'; qtyChangeText = `${qtyChange}`; }
        else if (actionType.includes('Edit')) { qtyChangeText = '-'; }
        else { return; }

        const displayQuantity = newQuantity > 0 ? newQuantity : '-';
        const formattedStockInDate = formatDate(originalStockInDate);
        let stockOutDate = '-';
        if (qtyChange < 0 || newQuantity <= 0) { stockOutDate = actionTimestamp; }

        const newHistoryRow = document.createElement('tr');
        newHistoryRow.innerHTML = `
            <td>${id || 'N/A'}</td><td>${name}</td><td>${category}</td><td>${displayQuantity}</td><td><span class="qty-change ${qtyChangeClass}">${qtyChangeText}</span></td><td>${newStatus}</td><td>No Damage</td><td>${formattedStockInDate || '-'}</td><td>${stockOutDate}</td><td>${actionType}</td><td>Juan Dela Cruz</td>`;
        historyTableBody.prepend(newHistoryRow);
    }

    // --- TAB SWITCHING LOGIC ---
    if (tabLinks.length > 0) {
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tabTarget;
                tabLinks.forEach(t => t.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                if (target && document.querySelector(target)) { document.querySelector(target).classList.add('active'); }
                else { console.error("Tab target not found:", target); }

                if (target === '#history-panel') {
                    if (downloadIcon) downloadIcon.style.display = 'block';
                    if (refreshIcon) refreshIcon.style.display = 'none';
                } else {
                    if (downloadIcon) downloadIcon.style.display = 'none';
                    if (refreshIcon) refreshIcon.style.display = 'block';
                }
                runCurrentFilters();
            });
        });
    }

    // --- FILTER & SEARCH LOGIC ---
    function filterStocksTable(searchTerm, selectedCategory, selectedStatus) {
        if (!tableBody) return;
        const rows = tableBody.getElementsByTagName('tr');
        searchTerm = searchTerm.toLowerCase(); selectedCategory = selectedCategory.toLowerCase(); selectedStatus = selectedStatus.toLowerCase();
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]; const cells = row.getElementsByTagName('td'); let showRow = true;
            if (selectedCategory && cells.length > 2) { const c = (cells[2].textContent || '').toLowerCase(); if (c !== selectedCategory) showRow = false; }
            if (showRow && selectedStatus && cells.length > 5) { const s = cells[5].querySelector('.status'); const t = s ? (s.textContent || '').toLowerCase() : ''; if (t !== selectedStatus) showRow = false; }
            if (showRow && searchTerm) { let match = false; const idx = [0, 1, 2, 4]; for (let j = 0; j < idx.length; j++) { if (cells[idx[j]]) { const text = (cells[idx[j]].textContent || '').toLowerCase(); if (text.includes(searchTerm)) { match = true; break; } } } if (!match) showRow = false; }
            row.style.display = showRow ? "" : "none";
        }
    }
    function filterHistoryTable(searchTerm, selectedCategory, selectedStatus) {
         if (!historyTableBody) return;
         const rows = historyTableBody.getElementsByTagName('tr');
         searchTerm = searchTerm.toLowerCase(); selectedCategory = selectedCategory.toLowerCase(); selectedStatus = selectedStatus.toLowerCase();
         for (let i = 0; i < rows.length; i++) {
             const row = rows[i]; const cells = row.getElementsByTagName('td'); let showRow = true;
             if (selectedCategory && cells.length > 2) { const c = (cells[2].textContent || '').toLowerCase(); if (c !== selectedCategory) showRow = false; }
             if (showRow && selectedStatus && cells.length > 5) { const t = (cells[5].textContent || '').toLowerCase(); if (!t.includes(selectedStatus)) showRow = false; }
             if (showRow && searchTerm) { let match = false; const idx = [0, 1, 2, 9, 10]; for (let j = 0; j < idx.length; j++) { if (cells[idx[j]]) { const text = (cells[idx[j]].textContent || '').toLowerCase(); if (text.includes(searchTerm)) { match = true; break; } } } if (!match) showRow = false; }
             row.style.display = showRow ? "" : "none";
         }
    }
    function runCurrentFilters() {
        const s = searchBar ? searchBar.value : ''; const c = categoryFilter ? categoryFilter.value : ''; const st = statusFilter ? statusFilter.value : ''; const ap = document.querySelector('.tab-panel.active');
        if (!ap) return; if (ap.id === 'history-panel') filterHistoryTable(s, c, st); else filterStocksTable(s, c, st);
    }
    if (searchBar) searchBar.addEventListener('keyup', runCurrentFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', runCurrentFilters);
    if (statusFilter) statusFilter.addEventListener('change', runCurrentFilters);
    if (refreshIcon) { refreshIcon.addEventListener('click', () => { if (searchBar) searchBar.value = ''; if (categoryFilter) categoryFilter.value = ''; if (statusFilter) statusFilter.value = ''; runCurrentFilters(); }); }

    // --- MODAL & SIDEBAR HELPERS ---
    function showModal(modal) { if (modal) modal.classList.add('show-modal'); }
    function hideModal(modal) { if (modal) modal.classList.remove('show-modal'); }
    function showSidebar() { if (profileSidebar) profileSidebar.classList.add('show-sidebar'); if (sidebarOverlay) sidebarOverlay.classList.add('show-sidebar'); }
    function hideSidebar() { if (profileSidebar) profileSidebar.classList.remove('show-sidebar'); if (sidebarOverlay) sidebarOverlay.classList.remove('show-sidebar'); }

    // --- DATE FORMATTING HELPERS ---
    function parseDate(dateStr) { if (!dateStr || dateStr === '-') return ''; const dp = dateStr.split(' ')[0]; const p = dp.split('/'); if (p.length === 3) return `20${p[2]}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}`; if (dateStr.includes('-') && dateStr.split('-').length === 3) return dateStr; return ''; }
    function formatDate(dateStr) { if (!dateStr || dateStr === '-') return '-'; try { const p = dateStr.split('-'); if (p.length !== 3) return '-'; const y = parseInt(p[0], 10), m = parseInt(p[1], 10), d = parseInt(p[2], 10); const o = new Date(Date.UTC(y, m - 1, d)); if (isNaN(o.getTime())) return '-'; const fd = o.getUTCDate().toString().padStart(2, '0'); const fm = (o.getUTCMonth() + 1).toString().padStart(2, '0'); const fy = o.getUTCFullYear().toString().slice(-2); return `${fm}/${fd}/${fy}`; } catch (e) { console.error("Error formatting date:", dateStr, e); return '-'; } }

    // --- ADD ITEM MODAL ---
     if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('item-quantity'); const dateInput = document.getElementById('stock-in-date'); const nameInput = document.getElementById('item-name'); const descInput = document.getElementById('item-description'); const catSelect = document.getElementById('item-category');
            if (qtyInput) qtyInput.value = '1';
            if (dateInput) { const t = new Date(); dateInput.value = `${t.getFullYear()}-${(t.getMonth() + 1).toString().padStart(2, '0')}-${t.getDate().toString().padStart(2, '0')}`; }
            if (nameInput) nameInput.value = ''; if (descInput) descInput.value = ''; if (catSelect && catSelect.options[0] && catSelect.options[0].value === "") { catSelect.selectedIndex = 0; }
            showModal(modalOverlay);
        });
    }
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => hideModal(modalOverlay));
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(modalOverlay); });
    if (addItemForm) {
        addItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nameInput = document.getElementById('item-name'); const qtyInput = document.getElementById('item-quantity'); const catSelect = document.getElementById('item-category'); const dateInput = document.getElementById('stock-in-date'); const descInput = document.getElementById('item-description');
            const name = nameInput ? nameInput.value : ''; const qty = qtyInput ? qtyInput.value : '0';
            if (!name.trim()) { alert('Item Name is required.'); nameInput.focus(); return; } const numQty = parseInt(qty, 10); if (isNaN(numQty) || numQty < 0) { alert('Quantity cannot be negative.'); qtyInput.focus(); return; } if (!catSelect || !catSelect.value) { alert('Please select a category.'); catSelect.focus(); return; } if (!dateInput || !dateInput.value) { alert('Please select a Stock In Date.'); dateInput.focus(); return; }
            pendingItemData = { name: name.trim(), quantity: qty, category: catSelect.value, stockInDate: dateInput.value, description: descInput ? descInput.value : '' };
            showModal(confirmModalOverlay);
        });
    }
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => { hideModal(confirmModalOverlay); pendingItemData = null; });
    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', () => {
            if (!pendingItemData) return; const { name, quantity, category, stockInDate, description } = pendingItemData; const numQuantity = parseInt(quantity, 10); let sText = '', sClass = ''; if (isNaN(numQuantity) || numQuantity <= 0) { sText = 'Out of Stock'; sClass = 'status-out'; } else if (numQuantity <= 10) { sText = 'Low Stock'; sClass = 'status-low'; } else { sText = 'In Stock'; sClass = 'status-in'; } const newId = nextItemId++;
            addHistoryLog(newId.toString(), name, category, numQuantity, numQuantity, sText, stockInDate, 'Initial Stock'); const fDate = formatDate(stockInDate); const row = document.createElement('tr'); row.dataset.id = newId; row.dataset.name = name; row.dataset.quantity = quantity; row.dataset.category = category; row.dataset.stockindate = stockInDate; row.dataset.description = description;
            row.innerHTML = `<td>${newId}</td><td>${name}</td><td>${category}</td><td>${numQuantity <= 0 ? '-' : quantity}</td><td>${description}</td><td><span class="status ${sClass}">${sText}</span></td><td>No Damage</td><td>${fDate} 12:00</td><td>-</td><td class="action-icons"><i class="fas fa-edit" title="Edit Item"></i><i class="fas fa-trash" title="Delete Item"></i></td>`;
            if (tableBody) tableBody.appendChild(row); hideModal(confirmModalOverlay); hideModal(modalOverlay); if (addItemForm) addItemForm.reset(); if (addItemCategorySelect && addItemCategorySelect.options[0] && addItemCategorySelect.options[0].value === "") { addItemCategorySelect.selectedIndex = 0; } pendingItemData = null; showModal(successModalOverlay); runCurrentFilters();
        });
    }
    if (successOkayBtn) successOkayBtn.addEventListener('click', () => hideModal(successModalOverlay));

    // --- EDIT ITEM MODAL ---
    if (editModalCloseBtn) editModalCloseBtn.addEventListener('click', () => hideModal(editModalOverlay));
    if (editModalOverlay) editModalOverlay.addEventListener('click', (e) => { if (e.target === editModalOverlay) hideModal(editModalOverlay); });
    if (editItemForm) {
        editItemForm.addEventListener('submit', (event) => {
            event.preventDefault(); if (!currentRowBeingEdited) return; const nameIn = document.getElementById('edit-item-name'); const catSel = document.getElementById('edit-item-category'); const descIn = document.getElementById('edit-item-description'); const statSel = document.getElementById('edit-item-status'); const stockIn = document.getElementById('edit-item-add-stock');
            const newName = nameIn ? nameIn.value : ''; const newCat = catSel ? catSel.value : ''; const newDesc = descIn ? descIn.value : ''; const statTxt = statSel ? statSel.value : 'In Stock';
            if (!newName.trim()) { alert('Item Name is required.'); nameIn.focus(); return; } const stockChg = parseInt(stockIn ? stockIn.value : '0', 10) || 0; const currQty = parseInt(currentRowBeingEdited.dataset.quantity || '0', 10); const newQty = currQty + stockChg;
            if (newQty < 0) { alert(`Cannot apply change (${stockChg}): Resulting quantity (${newQty}) < 0.`); stockIn.focus(); return; }
            let newStatClass = ''; let statDisp = statTxt; if (newQty <= 0) { newStatClass = 'status-out'; statDisp = 'Out of Stock'; } else if (newQty <= 10) { newStatClass = 'status-low'; statDisp = (statDisp === 'Out of Stock') ? 'Low Stock' : statDisp; } else { newStatClass = 'status-in'; statDisp = (statDisp === 'Out of Stock' || statDisp === 'Low Stock') ? 'In Stock' : statDisp; }
            const itemId = currentRowBeingEdited.dataset.id || currentRowBeingEdited.cells[0].textContent; const origSID = currentRowBeingEdited.dataset.stockindate; let actType = 'Details Edit'; if (stockChg !== 0) { actType = stockChg > 0 ? 'Stock In' : 'Stock Out'; }
            if (stockChg !== 0 || newName.trim() !== currentRowBeingEdited.dataset.name || newCat !== currentRowBeingEdited.dataset.category || newDesc !== currentRowBeingEdited.dataset.description || statDisp !== (currentRowBeingEdited.querySelector('.status')?.textContent || '')) { addHistoryLog(itemId, newName.trim(), newCat, newQty, stockChg, statDisp + (stockChg === 0 ? " (Edited)" : ""), origSID, actType); }
            currentRowBeingEdited.dataset.name = newName.trim(); currentRowBeingEdited.dataset.quantity = newQty.toString(); currentRowBeingEdited.dataset.category = newCat; currentRowBeingEdited.dataset.description = newDesc;
            const cells = currentRowBeingEdited.querySelectorAll('td'); if (cells.length > 8) { cells[1].textContent = newName.trim(); cells[2].textContent = newCat; cells[3].textContent = newQty <= 0 ? '-' : newQty; cells[4].textContent = newDesc; cells[5].innerHTML = `<span class="status ${newStatClass}">${statDisp}</span>`; if (newQty <= 0 && cells[8].textContent === '-') { const n = new Date(); cells[8].textContent = `${(n.getMonth() + 1).toString().padStart(2, '0')}/${n.getDate().toString().padStart(2, '0')}/${n.getFullYear().toString().slice(-2)} ${n.getHours().toString().padStart(2, '0')}:${n.getMinutes().toString().padStart(2, '0')}`; } else if (newQty > 0 && cells[8].textContent !== '-') { cells[8].textContent = '-'; } }
            hideModal(editModalOverlay); currentRowBeingEdited = null; runCurrentFilters();
        });
    }
    const stockSubtractBtn = document.getElementById('stock-subtract-btn'); const stockAddBtn = document.getElementById('stock-add-btn'); const stockInput = document.getElementById('edit-item-add-stock');
    if (stockSubtractBtn && stockInput) { stockSubtractBtn.addEventListener('click', () => { let val = parseInt(stockInput.value, 10) || 0; stockInput.value = val - 1; }); }
    if (stockAddBtn && stockInput) { stockAddBtn.addEventListener('click', () => { let val = parseInt(stockInput.value, 10) || 0; stockInput.value = val + 1; }); }

    // --- TABLE EVENT LISTENER (Edit/Delete Icons) ---
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            const targetElement = event.target;
            if (targetElement.classList.contains('fa-edit')) {
                currentRowBeingEdited = targetElement.closest('tr'); if (!currentRowBeingEdited) return; const id = currentRowBeingEdited.dataset.id || currentRowBeingEdited.cells[0].textContent; const name = currentRowBeingEdited.dataset.name || ''; const category = currentRowBeingEdited.dataset.category || ''; const description = currentRowBeingEdited.dataset.description || ''; const statusSpan = currentRowBeingEdited.querySelector('.status'); const currentStatusText = statusSpan ? statusSpan.textContent : 'In Stock'; const idSpan = document.getElementById('edit-item-id'); const nameInput = document.getElementById('edit-item-name'); const categorySelect = document.getElementById('edit-item-category'); const descriptionInput = document.getElementById('edit-item-description'); const statusSelect = document.getElementById('edit-item-status'); const addStockInput = document.getElementById('edit-item-add-stock');
                if (idSpan) idSpan.textContent = id; if (nameInput) nameInput.value = name; if (categorySelect) categorySelect.value = category; if (descriptionInput) descriptionInput.value = description; if (statusSelect) statusSelect.value = currentStatusText; if (addStockInput) addStockInput.value = 0;
                showModal(editModalOverlay);
            }
            if (targetElement.classList.contains('fa-trash')) { rowToDelete = targetElement.closest('tr'); if (rowToDelete) showModal(deleteConfirmModalOverlay); }
        });
    }

    // --- DELETE CONFIRMATION LOGIC ---
    if (deleteCancelBtn) { deleteCancelBtn.addEventListener('click', () => { hideModal(deleteConfirmModalOverlay); rowToDelete = null; }); }
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            if (rowToDelete) { const cells = rowToDelete.cells; const id = rowToDelete.dataset.id || cells[0].textContent; const name = rowToDelete.dataset.name || cells[1].textContent; const category = rowToDelete.dataset.category || cells[2].textContent; const lastQuantity = parseInt(rowToDelete.dataset.quantity || '0', 10); const originalStockInDate = rowToDelete.dataset.stockindate; addHistoryLog(id, name, category, 0, -lastQuantity, 'Out of Stock', originalStockInDate, 'Item Deleted'); rowToDelete.remove(); rowToDelete = null; }
            hideModal(deleteConfirmModalOverlay); runCurrentFilters();
        });
    }

    // --- EDIT CATEGORY MODAL LOGIC ---
    if (addCategoryEditIcon) addCategoryEditIcon.addEventListener('click', openCategoryModal);
    // if (editCategoryEditIcon) editCategoryEditIcon.addEventListener('click', openCategoryModal); // Removed
    if (categoryModalCloseBtn) categoryModalCloseBtn.addEventListener('click', () => hideModal(editCategoryModalOverlay));
    if (editCategoryModalOverlay) editCategoryModalOverlay.addEventListener('click', (e) => { if (e.target === editCategoryModalOverlay) hideModal(editCategoryModalOverlay); });
    if (addCategoryForm && newCategoryNameInput) {
        addCategoryForm.addEventListener('submit', (e) => { e.preventDefault(); const newName = newCategoryNameInput.value.trim(); if (newName) { if (!categories.some(cat => cat.toLowerCase() === newName.toLowerCase())) { categories.push(newName); categories.sort((a, b) => a.localeCompare(b)); populateCategoryModalList(); newCategoryNameInput.value = ''; } else { alert(`Category "${newName}" already exists.`); } } else { alert('Please enter a category name.'); } newCategoryNameInput.focus(); });
    }
    if (categoryListUl) {
        categoryListUl.addEventListener('click', (e) => { if (e.target.classList.contains('fa-trash')) { const catDel = e.target.dataset.categoryName; if (catDel && confirm(`Delete category "${catDel}"?`)) { let inUse = false; if (tableBody) { const rows = tableBody.getElementsByTagName('tr'); for (let i = 0; i < rows.length; i++) { if (rows[i].dataset.category === catDel) { inUse = true; break; } } } if (inUse) { alert(`Cannot delete "${catDel}", it is in use.`); } else { categories = categories.filter(c => c !== catDel); populateCategoryModalList(); } } } });
    }
    if (saveCategoryChangesBtn) { saveCategoryChangesBtn.addEventListener('click', () => { populateCategorySelects(); hideModal(editCategoryModalOverlay); }); }

    // --- PROFILE SIDEBAR ---
    if (userProfileBtn) userProfileBtn.addEventListener('click', showSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', hideSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', hideSidebar);

    // --- ACCOUNT DETAILS MODAL ---
    if (accountDetailsLink) { accountDetailsLink.addEventListener('click', (e) => { e.preventDefault(); showModal(accountDetailsModal); hideSidebar(); }); }
    if (accountModalCloseBtn) { accountModalCloseBtn.addEventListener('click', () => hideModal(accountDetailsModal)); }
    if (accountDetailsModal) { accountDetailsModal.addEventListener('click', (e) => { if (e.target === accountDetailsModal) hideModal(accountDetailsModal); }); }
    if (accountDetailsForm) { accountDetailsForm.addEventListener('submit', (e) => { e.preventDefault(); showModal(saveConfirmModal); }); }
    if (saveCancelBtn) { saveCancelBtn.addEventListener('click', () => hideModal(saveConfirmModal)); }

    // === MODIFIED: Added name update logic ===
    if (saveConfirmBtn) {
        saveConfirmBtn.addEventListener('click', () => {
            // --- ADDED: Update Display Name Logic ---
            const newFirstName = document.getElementById('acc-first-name')?.value || 'User';
            const newLastName = document.getElementById('acc-last-name')?.value || '';
            const newFullName = (newFirstName + ' ' + newLastName).trim();
            const modalNameElement = document.getElementById('modal-account-name');
            const sidebarNameElement = document.getElementById('sidebar-account-name');
            if (modalNameElement) modalNameElement.textContent = newFullName;
            if (sidebarNameElement) sidebarNameElement.textContent = newFullName;
            // --- END ADDED ---

            console.log('Simulating saving account details...'); // Keep simulation log
            hideModal(saveConfirmModal);
            hideModal(accountDetailsModal);
            showModal(saveSuccessModal);
        });
    }
    // === END MODIFIED ===

    if (saveSuccessOkayBtn) { saveSuccessOkayBtn.addEventListener('click', () => hideModal(saveSuccessModal)); }

    // --- CHANGE PASSWORD MODAL LOGIC ---
    if (changePasswordLink) { changePasswordLink.addEventListener('click', (e) => { e.preventDefault(); if(changePasswordForm) changePasswordForm.reset(); showModal(changePasswordModal); }); }
    if (changePwCloseBtn) { changePwCloseBtn.addEventListener('click', () => { hideModal(changePasswordModal); }); }
    if (changePwCancelBtn) { changePwCancelBtn.addEventListener('click', () => { hideModal(changePasswordModal); }); }
    if (changePasswordModal) { changePasswordModal.addEventListener('click', (e) => { if (e.target === changePasswordModal) hideModal(changePasswordModal); }); }
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault(); const currentPw = currentPasswordInput.value; const newPw = newPasswordInput.value; const confirmPw = confirmPasswordInput.value;
            if (!currentPw || !newPw || !confirmPw) { alert("Please fill in all password fields."); return; }
            if (newPw !== confirmPw) { alert("New passwords do not match."); confirmPasswordInput.focus(); confirmPasswordInput.value = ""; newPasswordInput.value = ""; return; }
            if (newPw === currentPw) { alert("New password must be different from the current password."); newPasswordInput.focus(); confirmPasswordInput.value = ""; newPasswordInput.value = ""; return; }
            // TODO: Backend Integration
            console.log("Simulating password change..."); alert("Password changed successfully! (Simulation)");
            hideModal(changePasswordModal); changePasswordForm.reset(); const accPasswordInput = document.getElementById('acc-password'); if (accPasswordInput) accPasswordInput.value = "••••••••";
        });
    }

    // --- LOGOUT MODAL ---
    if (logoutLink) { logoutLink.addEventListener('click', (e) => { e.preventDefault(); hideSidebar(); showModal(logoutConfirmModal); }); }
    if (logoutCancelBtn) { logoutCancelBtn.addEventListener('click', () => { hideModal(logoutConfirmModal); }); }
    if (logoutConfirmBtn) { logoutConfirmBtn.addEventListener('click', () => { alert('Logging out...'); hideModal(logoutConfirmModal); /* Add logout logic */ }); }
    if (logoutConfirmModal) { logoutConfirmModal.addEventListener('click', (e) => { if (e.target === logoutConfirmModal) hideModal(logoutConfirmModal); }); }

    // --- DOWNLOAD HISTORY ---
    if (downloadIcon) { downloadIcon.addEventListener('click', () => { if(historyTableBody && historyTableBody.rows.length > 0) { showModal(downloadHistoryModal); } else { alert('No history records to download.'); } }); }
    if (downloadHistoryModal) { downloadHistoryModal.addEventListener('click', (e) => { if (e.target === downloadHistoryModal) hideModal(downloadHistoryModal); }); }
    if (downloadHistoryBtn) {
        downloadHistoryBtn.addEventListener('click', () => {
             const table = document.getElementById('history-table'); if (table && historyTableBody && historyTableBody.rows.length > 0) { let csv = []; const headers = []; table.querySelectorAll('thead th').forEach(th => headers.push(`"${th.innerText.replace(/"/g, '""')}"`)); csv.push(headers.join(',')); historyTableBody.querySelectorAll('tr').forEach(tr => { let row = []; tr.querySelectorAll('td').forEach(td => { let text = td.innerText.replace(/"/g, '""'); if (text.includes(',') || text.includes('\n') || text.includes('"')) { text = `"${text}"`; } row.push(text); }); csv.push(row.join(',')); }); const csvFile = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' }); const dl = document.createElement('a'); const now = new Date(); const ds = now.toISOString().split('T')[0]; dl.download = `inventory_history_${ds}.csv`; dl.href = window.URL.createObjectURL(csvFile); dl.style.display = 'none'; document.body.appendChild(dl); dl.click(); document.body.removeChild(dl); window.URL.revokeObjectURL(dl.href); } else { console.error("History table not found or empty."); } hideModal(downloadHistoryModal);
        });
    }

    // --- Initial Setup ---
    populateCategorySelects();
    runCurrentFilters();

}); // End DOMContentLoaded