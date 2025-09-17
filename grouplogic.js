document.addEventListener('DOMContentLoaded', () => {

    function generateId() {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }

    let groups = [];
    let currentGroupId = null;

    const groupsView = document.getElementById('groups-view');
    const groupDetailsView = document.getElementById('group-details-view');
    const groupsList = document.getElementById('groups-list');
    const groupNameHeader = document.getElementById('group-name-header');
    const balancesList = document.getElementById('balances-list');
    const membersList = document.getElementById('members-list');
    const expensesList = document.getElementById('expenses-list');
    const noGroupsMessage = document.getElementById('no-groups-message');
    const noExpensesMessage = document.getElementById('no-expenses-message');

    //Modals
    const createGroupModal = document.getElementById('create-group-modal');
    const addMemberModal = document.getElementById('add-member-modal');
    const addExpenseModal = document.getElementById('add-expense-modal');

    //Forms
    const createGroupForm = document.getElementById('create-group-form');
    const addMemberForm = document.getElementById('add-member-form');
    const addExpenseForm = document.getElementById('add-expense-form');

    //Buttons
    const openCreateGroupModalBtn = document.getElementById('open-create-group-modal');
    const cancelCreateGroupBtn = document.getElementById('cancel-create-group');
    const backToGroupsBtn = document.getElementById('back-to-groups');
    const openAddMemberModalBtn = document.getElementById('open-add-member-modal');
    const cancelAddMemberBtn = document.getElementById('cancel-add-member');
    const openAddExpenseModalBtn = document.getElementById('open-add-expense-modal');
    const cancelAddExpenseBtn = document.getElementById('cancel-add-expense');

    const saveData = () => {
        localStorage.setItem('splitwiseCloneData', JSON.stringify(groups));
    };

    const loadData = () => {
        const data = localStorage.getItem('splitwiseCloneData');
        if (data) {
            groups = JSON.parse(data);
        }
    };

    function showConfirmationModal(message, onConfirm) {
        const existingModal = document.getElementById('confirmation-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'confirmation-modal';
        modalOverlay.style.cssText = `
            position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6);
            display: flex; align-items: center; justify-content: center; z-index: 1000;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white; padding: 2rem; border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            width: 100%; max-width: 400px; text-align: center;
        `;

        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageP.style.cssText = 'margin-bottom: 1.5rem; font-size: 1.1rem; color: #374151;';

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 1rem;';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = "btn btn-primary"

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Remove';
        confirmBtn.className = "btn"

        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(confirmBtn);
        modalContent.appendChild(messageP);
        modalContent.appendChild(btnContainer);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        const closeModal = () => modalOverlay.remove();
        cancelBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });
    }

    //UI
    const renderGroupsList = () => {
        groupsList.innerHTML = '';
        if (groups.length === 0) {
            noGroupsMessage.classList.remove('hidden');
        } else {
            noGroupsMessage.classList.add('hidden');
            groups.forEach(group => {
                const groupCard = document.createElement('div');
                groupCard.className = 'group-card';
                groupCard.dataset.groupId = group.id; // Set group ID on the card itself

                const memberCount = group.members.length;
                groupCard.innerHTML = `
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827;">${group.name}</h3>
                    <p style="color: #6b7280; margin-top: 0.5rem;">${memberCount} member${memberCount !== 1 ? 's' : ''}</p>
                `;

                // --- NEW: Delete button for the group ---
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'remove-group-btn';
                deleteBtn.innerHTML = '-'; // A simple 'X' character
                deleteBtn.dataset.groupId = group.id; // Important for identification
                deleteBtn.style.cssText = `
                    position: absolute;
                    background-color: #ef4444;
                    top: 10px;
                    right: 10px;
                    color: white;
                    border: none;
                    border-radius: 15%;
                    width: 30px;
                    height: 30px;
                    font-size: 1rem;
                    font-weight: bold;
                    line-height: 22px;
                    text-align: center;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                `;
                
                groupCard.addEventListener('mouseenter', () => { deleteBtn.style.opacity = '1'; });
                groupCard.addEventListener('mouseleave', () => { deleteBtn.style.opacity = '0'; });

                groupCard.appendChild(deleteBtn);
                groupsList.appendChild(groupCard);
            });
        }
    };

    const renderGroupDetails = () => {
        const group = groups.find(g => g.id === currentGroupId);
        if (!group) return;

        groupNameHeader.textContent = group.name;

        //Render members
        membersList.innerHTML = '';
        group.members.forEach(member => {
            const memberEl = document.createElement('div');
            memberEl.className = 'member-item';
            memberEl.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #f3f4f6;
                padding: 0.5rem 1rem;
                border-radius: 0.375rem;
                margin-bottom: 0.5rem;
                transition: background-color 0.2s;
             `;

            const memberNameSpan = document.createElement('span');
            memberNameSpan.textContent = member.name;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '–';
            deleteBtn.dataset.memberId = member.id;
            deleteBtn.className = 'remove-member-btn';
            deleteBtn.style.cssText = `
                background-color: #ef4444;
                color: white;
                border: none;
                border-radius: 15%;
                width: 22px;
                height: 22px;
                font-size: 1rem;
                font-weight: bold;
                line-height: 22px;
                text-align: center;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            `;

            memberEl.addEventListener('mouseenter', () => {
                deleteBtn.style.opacity = '1';
                memberEl.style.backgroundColor = '#e5e7eb';
            });
            memberEl.addEventListener('mouseleave', () => {
                deleteBtn.style.opacity = '0';
                memberEl.style.backgroundColor = '#f3f4f6';
            });

            memberEl.appendChild(memberNameSpan);
            memberEl.appendChild(deleteBtn);
            membersList.appendChild(memberEl);
        });

        //Render expenses
        expensesList.innerHTML = '';
        if (group.expenses.length === 0) {
            noExpensesMessage.classList.remove('hidden');
        } else {
            noExpensesMessage.classList.add('hidden');
            group.expenses.slice().reverse().forEach(expense => {
                const expenseEl = document.createElement('div');
                expenseEl.className = 'expense-item';
                expenseEl.style.cssText = `
                    background-color: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 1rem;
                 `;
                const paidByMember = group.members.find(m => m.id === expense.paidBy);
                expenseEl.innerHTML = `
                    <p style="font-weight: 500;">${expense.description}</p>
                    <p style="color: #4b5563; font-size: 0.9rem;">
                        ₹${expense.amount.toFixed(2)} paid by ${paidByMember ? paidByMember.name : 'Unknown'}
                    </p>
                `;
                expensesList.appendChild(expenseEl);
            });
        }

        //Render balances
        renderBalances(group);

        //Update expense form dropdown
        const paidBySelect = document.getElementById('expense-paid-by');
        paidBySelect.innerHTML = '';
        group.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            paidBySelect.appendChild(option);
        });
    };

    const calculateBalances = (group) => {
        const balances = {};
        group.members.forEach(member => {
            balances[member.id] = 0;
        });

        if (group.members.length > 0) {
            group.expenses.forEach(expense => {
                const amountPerPerson = expense.amount / group.members.length;
                balances[expense.paidBy] += expense.amount;

                group.members.forEach(member => {
                    balances[member.id] -= amountPerPerson;
                });
            });
        }
        return balances;
    };

    const renderBalances = (group) => {
        const balances = calculateBalances(group);
        balancesList.innerHTML = '';

        if (group.members.length < 2) {
            balancesList.innerHTML = '<p style="color: #6b7280;">Add more members to see balances.</p>';
            return;
        }

        Object.entries(balances).forEach(([memberId, balance]) => {
            const member = group.members.find(m => m.id === memberId);
            if (!member) return;

            const balanceEl = document.createElement('div');
            balanceEl.className = 'balance-item';
            balanceEl.style.marginBottom = '0.5rem';
            balanceEl.style.color = '#6b7280';

            const balanceAmount = Math.abs(balance).toFixed(2);
            let text;

            if (balance > 0.01) {
                text = `${member.name} is owed <span style="font-weight:600; color: #02dd52ff">₹${balanceAmount}</span>`;
            } else if (balance < -0.01) {
                text = `${member.name} owes <span style="font-weight:600; color: #b60000ff">₹${balanceAmount}</span>`;
            } else {
                text = `${member.name} is settled up`;
            }

            balanceEl.innerHTML = text;
            balancesList.appendChild(balanceEl);
        });
    };


    const switchView = (view) => {
        if (view === 'groups') {
            groupsView.classList.add('active');
            groupDetailsView.classList.remove('active');
            currentGroupId = null;
        } else {
            groupsView.classList.remove('active');
            groupDetailsView.classList.add('active');
        }
    };

    //Modal closer/opener
    const openModal = (modal) => modal.classList.add('flex');
    const closeModal = (modal) => {
        modal.classList.remove('flex');
    };

    //events & shit

    //Group Creation
    openCreateGroupModalBtn.addEventListener('click', () => {
        openModal(createGroupModal);
        createGroupForm.querySelector('input').focus();
    });
    cancelCreateGroupBtn.addEventListener('click', () => closeModal(createGroupModal));
    createGroupModal.addEventListener('click', (e) => e.target === createGroupModal && closeModal(createGroupModal));
    createGroupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const groupName = document.getElementById('group-name').value.trim();
        if (groupName) {
            const newGroup = {
                id: generateId(),
                name: groupName,
                members: [],
                expenses: []
            };
            groups.push(newGroup);
            saveData();
            renderGroupsList();
            createGroupForm.reset();
            closeModal(createGroupModal);
        }
    });

    //Add Member
    openAddMemberModalBtn.addEventListener('click', () => {
        openModal(addMemberModal);
        addMemberForm.querySelector('input').focus();
    });
    cancelAddMemberBtn.addEventListener('click', () => closeModal(addMemberModal));
    addMemberModal.addEventListener('click', (e) => e.target === addMemberModal && closeModal(addMemberModal));
    addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const memberName = document.getElementById('member-name').value.trim();
        const group = groups.find(g => g.id === currentGroupId);
        if (memberName && group) {
            const newMember = {
                id: generateId(),
                name: memberName
            };
            group.members.push(newMember);
            saveData();
            renderGroupDetails();
            addMemberForm.reset();
            closeModal(addMemberModal);
        }
    });

    //Add Expense
    openAddExpenseModalBtn.addEventListener('click', () => {
        const group = groups.find(g => g.id === currentGroupId);
        if (group && group.members.length > 0) {
            openModal(addExpenseModal);
            addExpenseForm.querySelector('input').focus();
        } else {
            alert('Please add at least one member to the group before adding an expense.');
        }
    });
    cancelAddExpenseBtn.addEventListener('click', () => closeModal(addExpenseModal));
    addExpenseModal.addEventListener('click', (e) => e.target === addExpenseModal && closeModal(addExpenseModal));
    addExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('expense-description').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const paidBy = document.getElementById('expense-paid-by').value;
        const group = groups.find(g => g.id === currentGroupId);

        if (description && amount > 0 && paidBy && group) {
            const newExpense = {
                id: generateId(),
                description,
                amount,
                paidBy
            };
            group.expenses.push(newExpense);
            saveData();
            renderGroupDetails();
            addExpenseForm.reset();
            closeModal(addExpenseModal);
        }
    });
    
    //Group deletion
    groupsList.addEventListener('click', (e) => {
        const target = e.target;

        //Check button click
        if (target.classList.contains('remove-group-btn')) {
            const groupId = target.dataset.groupId;
            const group = groups.find(g => g.id === groupId);
            
            if (group) {
                showConfirmationModal(`Are you sure you want to remove the group "${group.name}"?`, () => {
                    groups = groups.filter(g => g.id !== groupId);
                    saveData();
                    renderGroupsList();
                });
            }
        } 
        
        //Otherwise, check if a group card was clicked
        else if (target.closest('.group-card')) {
            const card = target.closest('.group-card');
            currentGroupId = card.dataset.groupId;
            renderGroupDetails();
            switchView('details');
        }
    });


    //Remove Member
    membersList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-member-btn')) {
            const id = e.target.dataset.memberId;
            const group = groups.find(g => g.id === currentGroupId);
            const member = group.members.find(m => m.id === id);

            if (member) {
                const message = `Are you sure you want to remove ${member.name}?`;

                showConfirmationModal(message, () => {
                    group.expenses = group.expenses.filter(expense => expense.paidBy !== id);
                    group.members = group.members.filter(m => m.id !== id);
                    saveData();
                    renderGroupDetails();
                });
            }
        }
    });

    backToGroupsBtn.addEventListener('click', () => switchView('groups'));

    loadData();
    renderGroupsList();
});

