// script.js (UPDATED WITH HISTORY LOGGING)

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
    const editCategoryEditIcon = document.getElementById('edit-category-edit-icon');
    const categoryListUl = document.getElementById('category-list-ul');
    const addNewCategoryBtn = document.getElementById('add-new-category-btn');
    const saveCategoryChangesBtn = document.getElementById('save-category-changes-btn');

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


    // --- TEMPORARY STORAGE ---
    let pendingItemData = null;
    let currentRowBeingEdited = null;
    let rowToDelete = null;

    // --- === NEW HELPER FUNCTION: ADD HISTORY LOG === ---
    /**
     * Creates a new row in the history table.
     * @param {string} id - The item ID
     * @param {string} name - Item name
     * @param {string} category - Item category
     * @param {number} newQuantity - The quantity *after* the change
     * @param {number} qtyChange - The amount changed (e.g., +20, -5)
     * @param {string} newStatus - The new status text (e.g., "In Stock")
     * @param {string} originalStockInDate - The date from the dataset (YYYY-MM-DD)
     * @param {string} actionType - The type of action (e.g., "Stock In")
     */
    function addHistoryLog(id, name, category, newQuantity, qtyChange, newStatus, originalStockInDate, actionType) {
        if (!historyTableBody) return;

        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const actionTimestamp = `${month}/${day}/${year} ${hours}:${minutes}`;

        // 1. Format Quantity Change Text
        let qtyChangeClass = '';
        let qtyChangeText = '';
        if (qtyChange > 0) {
            qtyChangeClass = 'qty-in';
            qtyChangeText = `+${qtyChange}`;
        } else if (qtyChange < 0) {
            qtyChangeClass = 'qty-out';
            qtyChangeText = `${qtyChange}`;
        } else {
            return; // Don't log if no change
        }

        // 2. Format Final Quantity Display
        const displayQuantity = newQuantity > 0 ? newQuantity : '-';

        // 3. Format Original Stock In Date (using existing helper)
        const formattedStockInDate = formatDate(originalStockInDate);

        // 4. Determine Stock Out Date
        let stockOutDate = '-';
        if (qtyChange < 0) {
            stockOutDate = actionTimestamp; // Use current time for 'out' actions
        }

        // 5. Create Row
        const newHistoryRow = document.createElement('tr');
        newHistoryRow.innerHTML = `
            <td>${id || 'NEW'}</td>
            <td>${name}</td>
            <td>${category}</td>
            <td>${displayQuantity}</td>
            <td><span class="qty-change ${qtyChangeClass}">${qtyChangeText}</span></td>
            <td>${newStatus}</td>
            <td>No Damage</td> <td>${formattedStockInDate}</td> <td>${stockOutDate}</td> <td>${actionType}</td>
            <td>Juan Dela Cruz</td> `;
        
        // Add to the top of the history table
        historyTableBody.prepend(newHistoryRow);
    }
    // --- === END NEW HELPER FUNCTION === ---


    // --- TAB SWITCHING LOGIC ---
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
        // (Your existing filterStocksTable function...)
        if (!tableBody) return;
        const rows = tableBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            let showRow = true;
            if (selectedCategory && cells.length > 2) {
                const categoryText = (cells[2].textContent || cells[2].innerText).toLowerCase();
                if (categoryText !== selectedCategory) {
                    showRow = false;
                }
            }
            if (showRow && selectedStatus && cells.length > 5) {
                const statusSpan = cells[5].querySelector('.status');
                const statusText = statusSpan ? (statusSpan.textContent || statusSpan.innerText).toLowerCase() : '';
                if (statusText !== selectedStatus) {
                    showRow = false; 
                }
            }
            if (showRow && searchTerm) {
                let searchMatch = false;
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j]) {
                        const cellText = cells[j].textContent || cells[j].innerText;
                        if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                            searchMatch = true;
                            break;
                        }
                    }
                }
                if (!searchMatch) {
                    showRow = false;
                }
            }
            row.style.display = showRow ? "" : "none";
        }
    }

    function filterHistoryTable(searchTerm, selectedCategory, selectedStatus) {
        // (Your existing filterHistoryTable function...)
         if (!historyTableBody) return;
        const rows = historyTableBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            let showRow = true;
            if (selectedCategory && cells.length > 2) {
                const categoryText = (cells[2].textContent || cells[2].innerText).toLowerCase();
                if (categoryText !== selectedCategory) {
                    showRow = false;
                }
            }
            if (showRow && selectedStatus && cells.length > 5) {
                const statusText = (cells[5].textContent || cells[5].innerText).toLowerCase();
                if (statusText !== selectedStatus) {
                    showRow = false;
                }
            }
            if (showRow && searchTerm) {
                let searchMatch = false;
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j]) {
                        const cellText = cells[j].textContent || cells[j].innerText;
                        if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                            searchMatch = true;
                            break;
                        }
                    }
                }
                if (!searchMatch) {
                    showRow = false;
                }
            }
            row.style.display = showRow ? "" : "none";
        }
    }

    function runCurrentFilters() {
        // (Your existing runCurrentFilters function...)
        const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : '';
        const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : '';
        const activePanel = document.querySelector('.tab-panel.active');
        if (!activePanel) return;
        if (activePanel.id === 'history-panel') {
            filterHistoryTable(searchTerm, selectedCategory, selectedStatus);
        } else {
            filterStocksTable(searchTerm, selectedCategory, selectedStatus);
        }
    }

    if (searchBar) {
        searchBar.addEventListener('keyup', runCurrentFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', runCurrentFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', runCurrentFilters);
    }

    // --- MODAL HELPER FUNCTIONS ---
    function showModal(modal) {
        if (modal) modal.classList.add('show-modal');
    }
    function hideModal(modal) {
        if (modal) modal.classList.remove('show-modal');
    }

    // --- SIDEBAR HELPER FUNCTIONS ---
    function showSidebar() {
        if (profileSidebar) profileSidebar.classList.add('show-sidebar');
        if (sidebarOverlay) sidebarOverlay.classList.add('show-sidebar');
    }
    function hideSidebar() {
        if (profileSidebar) profileSidebar.classList.remove('show-sidebar');
        if (sidebarOverlay) sidebarOverlay.classList.remove('show-sidebar');
    }

    // --- DATE FORMATTING HELPERS ---
    function parseDate(dateStr) {
        // (Your existing parseDate function...)
        if (!dateStr || dateStr === '-') return '';
        const datePart = dateStr.split(' ')[0];
        const parts = datePart.split('/');
        if (parts.length === 3) {
            return `20${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
        return '';
    }
    function formatDate(dateStr) {
        // (Your existing formatDate function...)
        if (!dateStr) return '-';
        try {
            const dateObj = new Date(dateStr + 'T00:00:00Z');
            const day = (dateObj.getUTCDate()).toString().padStart(2, '0');
            const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getUTCFullYear().toString().slice(-2);
            return `${month}/${day}/${year}`;
        } catch (e) {
            console.error("Error formatting date:", dateStr, e);
            return '-';
        }
    }


    // --- ADD ITEM MODAL (1) ---
    if (addItemBtn) addItemBtn.addEventListener('click', () => showModal(modalOverlay));
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => hideModal(modalOverlay));
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) hideModal(modalOverlay);
    });

    // --- CONFIRMATION (ADD) MODAL (2) ---
    if (addItemForm) {
        addItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            pendingItemData = {
                name: document.getElementById('item-name').value,
                quantity: document.getElementById('item-quantity').value,
                category: document.getElementById('item-category').value,
                stockInDate: document.getElementById('stock-in-date').value,
                description: document.getElementById('item-description').value
            };
            showModal(confirmModalOverlay);
        });
    }
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => {
        hideModal(confirmModalOverlay);
        pendingItemData = null;
    });

    // --- SUCCESS MODAL (3) ---
    if (confirmAddBtn) {
        confirmAddBtn.addEventListener('click', () => {
            if (!pendingItemData) return;
            const { name, quantity, category, stockInDate, description } = pendingItemData;

            let statusText = '', statusClass = '';
            const numQuantity = parseInt(quantity, 10);
            if (isNaN(numQuantity) || numQuantity <= 0) {
                 statusText = 'Out of Stock'; statusClass = 'status-out';
            } else if (numQuantity <= 10) {
                 statusText = 'Low Stock'; statusClass = 'status-low';
            } else {
                 statusText = 'In Stock'; statusClass = 'status-in';
            }
            
            // === JAVASCRIPT MODIFICATION (ADD) ===
            // Log this "add" action to the history tab
            addHistoryLog(
                'NEW',
                name,
                category,
                numQuantity,       // newQuantity
                numQuantity,       // qtyChange (it's all new)
                statusText,
                stockInDate,       // originalStockInDate (from form)
                'Initial Stock'
            );
            // === END MODIFICATION ===

            const formattedDate = formatDate(stockInDate);

            const newRow = document.createElement('tr');
            newRow.dataset.name = name;
            newRow.dataset.quantity = quantity;
            newRow.dataset.category = category;
            newRow.dataset.stockindate = stockInDate;
            newRow.dataset.description = description;

            newRow.innerHTML = `
                <td>NEW</td>
                <td>${name}</td>
                <td>${category}</td>
                <td>${quantity}</td>
                <td>${description.substring(0, 15)}...</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>No Damage</td>
                <td>${formattedDate} 12:00</td>
                <td>-</td>
                <td class="action-icons">
                    <i class="fas fa-edit"></i>
                    <i class="fas fa-trash"></i>
                </td>
            `;
            if (tableBody) tableBody.appendChild(newRow);
            hideModal(confirmModalOverlay);
            hideModal(modalOverlay);
            if (addItemForm) addItemForm.reset();
            pendingItemData = null;
            showModal(successModalOverlay);
        });
    }
    if (successOkayBtn) successOkayBtn.addEventListener('click', () => hideModal(successModalOverlay));

    // --- EDIT ITEM MODAL (4) ---
    if (editModalCloseBtn) editModalCloseBtn.addEventListener('click', () => hideModal(editModalOverlay));
    if (editModalOverlay) editModalOverlay.addEventListener('click', (e) => {
        if (e.target === editModalOverlay) hideModal(editModalOverlay);
    });

    // =======================================================
    // "EDIT ITEM" LOGIC
    // =======================================================
    if (editItemForm) {
        editItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!currentRowBeingEdited) return;

            // Get values from new form
            const newName = document.getElementById('edit-item-name').value;
            const newCategory = document.getElementById('edit-item-category').value;
            const newDescription = document.getElementById('edit-item-description').value;
            const newStatusText = document.getElementById('edit-item-status').value;
            
            // === JAVASCRIPT MODIFICATION (EDIT) ===
            // Renamed 'stockToAdd' to 'stockChange'
            const stockChange = parseInt(document.getElementById('edit-item-add-stock').value, 10) || 0;

            // Calculate new quantity
            const currentQuantity = parseInt(currentRowBeingEdited.dataset.quantity, 10) || 0;
            const newQuantity = currentQuantity + stockChange;

            // Log this "edit" action to the history tab *if* stock changed
            if (stockChange !== 0) {
                const id = currentRowBeingEdited.cells[0].textContent;
                const originalStockInDate = currentRowBeingEdited.dataset.stockindate;
                const actionType = stockChange > 0 ? 'Stock In' : 'Stock Out';
                
                addHistoryLog(
                    id,
                    newName,
                    newCategory,
                    newQuantity,
                    stockChange,
                    newStatusText,
                    originalStockInDate,
                    actionType
                );
            }
            // === END MODIFICATION ===


            // Update dataset
            currentRowBeingEdited.dataset.name = newName;
            currentRowBeingEdited.dataset.quantity = newQuantity; // Use new quantity
            currentRowBeingEdited.dataset.category = newCategory;
            currentRowBeingEdited.dataset.description = newDescription;

            let newStatusClass = '';
            if (newStatusText === 'Out of Stock') {
                newStatusClass = 'status-out';
            } else if (newStatusText === 'Low Stock') {
                newStatusClass = 'status-low';
            } else {
                newStatusClass = 'status-in';
            }

            // Update table row cells
            const cells = currentRowBeingEdited.querySelectorAll('td');
            if (cells.length > 7) {
                cells[1].textContent = newName;
                cells[2].textContent = newCategory;
                cells[3].textContent = newQuantity; // Update with new calculated quantity
                cells[4].textContent = newDescription.substring(0, 15) + '...';
                cells[5].innerHTML = `<span class="status ${newStatusClass}">${newStatusText}</span>`;
            }

            hideModal(editModalOverlay);
            currentRowBeingEdited = null;
        });
    }

    // --- Listeners for Edit Item Modal ---
    const stockSubtractBtn = document.getElementById('stock-subtract-btn');
    const stockAddBtn = document.getElementById('stock-add-btn');
    const stockInput = document.getElementById('edit-item-add-stock');
    const editModalDeleteBtn = document.getElementById('edit-modal-delete-btn');

    // === JAVASCRIPT MODIFICATION (SUBTRACT BUTTON) ===
    // Removed the "if (currentValue > 0)" check to allow negative values
    if (stockSubtractBtn) {
        stockSubtractBtn.addEventListener('click', () => {
            let currentValue = parseInt(stockInput.value, 10) || 0;
            stockInput.value = currentValue - 1;
        });
    }
    // === END MODIFICATION ===

    if (stockAddBtn) {
        stockAddBtn.addEventListener('click', () => {
            let currentValue = parseInt(stockInput.value, 10) || 0;
            stockInput.value = currentValue + 1;
        });
    }
    if (editModalDeleteBtn) {
        editModalDeleteBtn.addEventListener('click', () => {
            if (currentRowBeingEdited) {
                rowToDelete = currentRowBeingEdited;
                hideModal(editModalOverlay);
                showModal(deleteConfirmModalModal); 
            }
        });
    }

    // --- EVENT LISTENER PARA SA TABLE (EDIT at DELETE) ---
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {

            if (event.target.classList.contains('fa-edit')) {
                currentRowBeingEdited = event.target.closest('tr');
                if (!currentRowBeingEdited) return;
                
                const cells = currentRowBeingEdited.querySelectorAll('td');
                const id = cells[0].textContent;
                const name = currentRowBeingEdited.dataset.name || '';
                const category = currentRowBeingEdited.dataset.category || '';
                const description = currentRowBeingEdited.dataset.description || '';
                const statusText = cells[5].querySelector('.status').textContent;

                document.getElementById('edit-item-id').textContent = id;
                document.getElementById('edit-item-name').value = name;
                document.getElementById('edit-item-category').value = category;
                document.getElementById('edit-item-description').value = description;
                document.getElementById('edit-item-status').value = statusText;
                document.getElementById('edit-item-add-stock').value = 0; 

                showModal(editModalOverlay);
            }

            if (event.target.classList.contains('fa-trash')) {
                rowToDelete = event.target.closest('tr');
                if (rowToDelete) showModal(deleteConfirmModalOverlay);
            }
        });
    }

    // --- DELETE CONFIRMATION MODAL (5) ---
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', () => {
            hideModal(deleteConfirmModalOverlay);
            rowToDelete = null;
        });
    }
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            if (rowToDelete) {
                
                // === JAVASCRIPT MODIFICATION (DELETE) ===
                // Log this "delete" action to the history tab *before* removing
                const cells = rowToDelete.cells;
                const id = cells[0].textContent;
                const name = rowToDelete.dataset.name;
                const category = rowToDelete.dataset.category;
                const lastQuantity = parseInt(rowToDelete.dataset.quantity, 10) || 0;
                const originalStockInDate = rowToDelete.dataset.stockindate;

                addHistoryLog(
                    id,
                    name,
                    category,
                    0,               // newQuantity is 0
                    -lastQuantity,   // qtyChange is negative of last quantity
                    'Out of Stock',  // newStatus
                    originalStockInDate,
                    'Item Deleted'
                );
                // === END MODIFICATION ===
                
                rowToDelete.remove();
            }
            hideModal(deleteConfirmModalOverlay);
            rowToDelete = null;
        });
    }

    // --- EDIT CATEGORY MODAL (6) ---
     if (addCategoryEditIcon) {
         addCategoryEditIcon.addEventListener('click', () => showModal(editCategoryModalOverlay));
     }
     if (editCategoryEditIcon) {
         editCategoryEditIcon.addEventListener('click', () => showModal(editCategoryModalOverlay));
     }
     if (categoryModalCloseBtn) {
         categoryModalCloseBtn.addEventListener('click', () => hideModal(editCategoryModalOverlay));
     }
     if (editCategoryModalOverlay) {
         editCategoryModalOverlay.addEventListener('click', (e) => {
             if (e.target === editCategoryModalOverlay) hideModal(editCategoryModalOverlay);
         });
     }

    // --- PROFILE SIDEBAR ---
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', showSidebar);
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', hideSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', hideSidebar);
    }

    // =======================================================
    // START: ACCOUNT DETAILS MODAL FLOW (FROM IMAGE)
    // =======================================================

    // Open "Account Details" modal from sidebar
    if (accountDetailsLink) {
        accountDetailsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(accountDetailsModal);
            hideSidebar(); // Hide sidebar after opening modal
        });
    }

    // Close "Account Details" modal
    if (accountModalCloseBtn) {
        accountModalCloseBtn.addEventListener('click', () => hideModal(accountDetailsModal));
    }
    if (accountDetailsModal) {
        accountDetailsModal.addEventListener('click', (e) => {
            if (e.target === accountDetailsModal) hideModal(accountDetailsModal);
        });
    }

    // Submit "Account Details" form -> Open "Save Confirmation" modal
    if (accountDetailsForm) {
        accountDetailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, you would save form data here
            showModal(saveConfirmModal);
        });
    }

    // "Save Confirmation" modal -> Cancel button
    if (saveCancelBtn) {
        saveCancelBtn.addEventListener('click', () => hideModal(saveConfirmModal));
    }
    
    // "Save Confirmation" modal -> "YES, UPDATE" button
    if (saveConfirmBtn) {
        saveConfirmBtn.addEventListener('click', () => {
            // This is where you would tell the backend to save the data
            hideModal(saveConfirmModal);
            hideModal(accountDetailsModal);
            showModal(saveSuccessModal);
        });
    }

    // "Save Success" modal -> "OKAY" button
    if (saveSuccessOkayBtn) {
        saveSuccessOkayBtn.addEventListener('click', () => hideModal(saveSuccessModal));
    }

    // =======================================================
    // END: ACCOUNT DETAILS MODAL FLOW
    // =======================================================


    // =======================================================
    // START: NEW LOGOUT MODAL FLOW (FROM IMAGE)
    // =======================================================
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideSidebar();
            showModal(logoutConfirmModal);
        });
    }
    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener('click', () => {
            hideModal(logoutConfirmModal);
        });
    }
    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener('click', () => {
            // Here you would typically clear session, redirect to login page, etc.
            alert('Logging out...'); // Placeholder for actual logout logic
            hideModal(logoutConfirmModal);
            // Example: window.location.href = '/login';
        });
    }
    if (logoutConfirmModal) {
        logoutConfirmModal.addEventListener('click', (e) => {
            if (e.target === logoutConfirmModal) hideModal(logoutConfirmModal);
        });
    }
    // =======================================================
    // END: NEW LOGOUT MODAL FLOW
    // =======================================================

    // =======================================================
    // START: NEW DOWNLOAD HISTORY MODAL & FUNCTIONALITY
    // =======================================================
    if (downloadIcon) {
        downloadIcon.addEventListener('click', () => {
            showModal(downloadHistoryModal);
        });
    }
    if (downloadHistoryModal) {
        downloadHistoryModal.addEventListener('click', (e) => {
            if (e.target === downloadHistoryModal) hideModal(downloadHistoryModal);
        });
    }

    if (downloadHistoryBtn) {
        downloadHistoryBtn.addEventListener('click', () => {
            // Logic to download history as CSV
            const table = document.getElementById('history-table');
            if (table) {
                let csv = [];
                const rows = table.querySelectorAll('tr');

                for (let i = 0; i < rows.length; i++) {
                    let row = [];
                    const cols = rows[i].querySelectorAll('th, td');
                    for (let j = 0; j < cols.length; j++) {
                        let text = cols[j].innerText.replace(/"/g, '""'); // Escape double quotes
                        if (text.includes(',') || text.includes('\n')) {
                            text = `"${text}"`; // Enclose in double quotes if it contains commas or newlines
                        }
                        row.push(text);
                    }
                    csv.push(row.join(','));
                }

                // Create a Blob and download
                const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
                const downloadLink = document.createElement('a');
                downloadLink.download = 'inventory_history.csv';
                downloadLink.href = window.URL.createObjectURL(csvFile);
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
            hideModal(downloadHistoryModal);
        });
    }
    // =======================================================
    // END: NEW DOWNLOAD HISTORY MODAL & FUNCTIONALITY
    // =======================================================


}); 