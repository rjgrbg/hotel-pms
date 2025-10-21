// script.js (UPDATED FOR FILTERS & SEARCH)

document.addEventListener('DOMContentLoaded', (event) => {

    // --- MGA ELEMENTS SA PAGE ---
    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const tableBody = document.getElementById('inventory-body');

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

    // --- TEMPORARY STORAGE ---
    let pendingItemData = null;
    let currentRowBeingEdited = null;
    let rowToDelete = null;

    // --- FILTER & SEARCH LOGIC ---

    // Function to filter the table based on search term, category, and status
    function filterTable() {
        if (!tableBody) return; // Exit if table body doesn't exist

        const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : '';
        const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : '';
        const rows = tableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            let showRow = true; // Assume row should be shown initially

            // Check Category (cells[2] is the Category column)
            if (selectedCategory && cells[2]) {
                const categoryText = (cells[2].textContent || cells[2].innerText).toLowerCase();
                if (categoryText !== selectedCategory) {
                    showRow = false;
                }
            }

            // Check Status (cells[5] is the Status column)
            if (showRow && selectedStatus && cells[5]) {
                // Get the text inside the <span> within the status cell
                const statusSpan = cells[5].querySelector('.status');
                const statusText = statusSpan ? (statusSpan.textContent || statusSpan.innerText).toLowerCase() : '';
                
                // Compare with selectedStatus (need to handle different text variations)
                let statusMatch = false;
                if (selectedStatus === 'out of stock' && statusText.includes('out of stock')) {
                    statusMatch = true;
                } else if (selectedStatus === 'low stock' && statusText.includes('low stock')) {
                    statusMatch = true;
                } else if (selectedStatus === 'in stock' && statusText.includes('in stock')) { // If you add "In Stock" filter
                     statusMatch = true;
                }
                // Add more conditions if needed (e.g., 'in stock')

                if (!statusMatch) {
                    showRow = false;
                }
            }

            // Check Search Term (only if other filters didn't hide it yet)
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

            // Show or hide the row based on the final decision
            row.style.display = showRow ? "" : "none";
        }
    }

    // Add event listeners for search bar and filters
    if (searchBar) {
        searchBar.addEventListener('keyup', filterTable); // Call filterTable on keyup
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTable); // Call filterTable on change
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterTable); // Call filterTable on change
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
        if (!dateStr || dateStr === '-') return '';
        const datePart = dateStr.split(' ')[0]; 
        const parts = datePart.split('/'); 
        if (parts.length === 3) {
            return `20${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
        return '';
    }
    function formatDate(dateStr) { 
        if (!dateStr) return '-';
        const dateObj = new Date(dateStr);
        const day = (dateObj.getUTCDate()).toString().padStart(2, '0');
        const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear().toString().slice(-2);
        return `${month}/${day}/${year}`;
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
            if (parseInt(quantity) === 0) {
                statusText = 'Out of Stock'; statusClass = 'status-out';
            } else if (parseInt(quantity) > 0 && parseInt(quantity) <= 10) {
                statusText = 'Low Stock'; statusClass = 'status-low';
            } else {
                statusText = 'In Stock'; statusClass = 'status-in';
            }
            
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

    if (editItemForm) {
        editItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!currentRowBeingEdited) return;

            const newName = document.getElementById('edit-item-name').value;
            const newQuantity = document.getElementById('edit-item-quantity').value;
            const newCategory = document.getElementById('edit-item-category').value;
            const newDescription = document.getElementById('edit-item-description').value;
            const newStockInDate = document.getElementById('edit-stock-in-date').value;

            currentRowBeingEdited.dataset.name = newName;
            currentRowBeingEdited.dataset.quantity = newQuantity;
            currentRowBeingEdited.dataset.category = newCategory;
            currentRowBeingEdited.dataset.description = newDescription;
            currentRowBeingEdited.dataset.stockindate = newStockInDate;

            let statusText = '', statusClass = '';
            if (parseInt(newQuantity) === 0) {
                statusText = 'Out of Stock'; statusClass = 'status-out';
            } else if (parseInt(newQuantity) > 0 && parseInt(newQuantity) <= 10) {
                statusText = 'Low Stock'; statusClass = 'status-low';
            } else {
                statusText = 'In Stock'; statusClass = 'status-in';
            }
            
            const cells = currentRowBeingEdited.querySelectorAll('td');
            if (cells.length > 7) { 
                cells[1].textContent = newName;
                cells[2].textContent = newCategory;
                cells[3].textContent = newQuantity;
                cells[4].textContent = newDescription.substring(0, 15) + '...';
                cells[5].innerHTML = `<span class="status ${statusClass}">${statusText}</span>`;
                cells[7].textContent = `${formatDate(newStockInDate)} 12:00`;
            }

            hideModal(editModalOverlay);
            currentRowBeingEdited = null;
        });
    }

    // --- EVENT LISTENER PARA SA TABLE (EDIT at DELETE) ---
    if (tableBody) { 
        tableBody.addEventListener('click', (event) => {
            
            if (event.target.classList.contains('fa-edit')) {
                currentRowBeingEdited = event.target.closest('tr');
                if (!currentRowBeingEdited) return; 
                
                const name = currentRowBeingEdited.dataset.name || ''; 
                const category = currentRowBeingEdited.dataset.category || '';
                const quantity = currentRowBeingEdited.dataset.quantity || '';
                const description = currentRowBeingEdited.dataset.description || '';
                const stockInDate = currentRowBeingEdited.dataset.stockindate || ''; 

                document.getElementById('edit-item-name').value = name;
                document.getElementById('edit-item-quantity').value = quantity;
                document.getElementById('edit-item-category').value = category;
                document.getElementById('edit-item-description').value = description;
                document.getElementById('edit-stock-in-date').value = stockInDate;

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
                rowToDelete.remove(); 
            }
            hideModal(deleteConfirmModalOverlay);
            rowToDelete = null; 
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

}); // <-- Dulo ng DOMContentLoaded