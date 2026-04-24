import { fetchAccounts, fetchCategories, fetchRecurrentPayments, createRecurrentPayment, updateRecurrentPayment, deleteRecurrentPayment } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";
import type { Account } from "../types/account";
import type { Category } from "../types/category";
import type { RecurrentPayment } from "../types/recurrent-payment";

let recurrentCache: RecurrentPayment[] | null = null;
let accounts: Account[] = [];
let categories: Category[] = [];
let initialDataPromise: Promise<void> | null = null;

export type ModalElements = {
    modal: HTMLElement | null;
    form: HTMLFormElement | null;
    modalTitle: HTMLElement | null;
    deleteBtn: HTMLElement | null;
    addBtn: HTMLElement | null;
    closeModalBtn: HTMLElement | null;
    cancelModalBtn: HTMLElement | null;
    accTrigger: HTMLElement | null;
    catTrigger: HTMLElement | null;
    startInput: HTMLInputElement | null;
    accLabel: HTMLElement | null;
    accInput: HTMLInputElement | null;
    catLabel: HTMLElement | null;
    catInput: HTMLInputElement | null;
    paymentIdInput: HTMLInputElement | null;
    titleInput: HTMLInputElement | null;
    amountInput: HTMLInputElement | null;
    frequencyInput: HTMLSelectElement | null;
    isActiveInput: HTMLInputElement | null;
};

let cachedModalElements: ModalElements | null = null;

export function getModalElements(): ModalElements {
    if (cachedModalElements) return cachedModalElements;
    cachedModalElements = {
        modal: document.getElementById('recurrent-modal'),
        form: document.getElementById('recurrent-form') as HTMLFormElement,
        modalTitle: document.getElementById('modal-title'),
        deleteBtn: document.getElementById('delete-recurrent-btn'),
        addBtn: document.getElementById('add-recurrent-btn'),
        closeModalBtn: document.getElementById('close-modal'),
        cancelModalBtn: document.getElementById('cancel-modal'),
        accTrigger: document.getElementById('account-select-trigger'),
        catTrigger: document.getElementById('category-select-trigger'),
        startInput: document.getElementById('start_date') as HTMLInputElement,
        accLabel: document.getElementById('selected-account-label'),
        accInput: document.getElementById('account_id') as HTMLInputElement,
        catLabel: document.getElementById('selected-category-label'),
        catInput: document.getElementById('category_id') as HTMLInputElement,
        paymentIdInput: document.getElementById('recurrent-id') as HTMLInputElement,
        titleInput: document.getElementById('title') as HTMLInputElement,
        amountInput: document.getElementById('amount') as HTMLInputElement,
        frequencyInput: document.getElementById('frequency') as HTMLSelectElement,
        isActiveInput: document.getElementById('is_active') as HTMLInputElement
    };
    return cachedModalElements;
}

async function ensureInitialDataLoaded() {
    if (accounts.length !== 0 && categories.length !== 0) return;
    if (initialDataPromise) return initialDataPromise;

    initialDataPromise = (async () => {
        try {
            const [accData, catData] = await Promise.all([
                fetchAccounts(),
                fetchCategories()
            ]);
            accounts = accData;
            categories = catData;
            populateSelects();
        } catch (error) {
            initialDataPromise = null;
            console.error('Error fetching initial data:', error);
            throw error;
        }
    })();

    return initialDataPromise;
}

function populateSelects() {
    const accountOptions = document.getElementById('account-options');
    const selectedLabel = document.getElementById('selected-account-label');
    const accountIdInput = document.getElementById('account_id') as HTMLInputElement;
    const accountDropdown = document.getElementById('account-dropdown');

    if (!accountOptions || !selectedLabel || !accountIdInput || !accountDropdown) return;

    accountOptions.innerHTML = '';
    accounts.forEach(acc => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'w-full text-left px-3 py-2.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-between group';
        
        option.innerHTML = `
            <div class="flex flex-col">
                <span class="text-[14px] font-[510] text-[#f7f8f8]">${acc.name}</span>
                <span class="text-[10px] text-[#62666d]">ID: ${acc.id}</span>
            </div>
            <span class="text-[13px] font-[510] text-[#8a8f98] group-hover:text-[#f7f8f8]">${formatCurrency(acc.balance)}</span>
        `;

        option.onclick = () => {
            accountIdInput.value = acc.id.toString();
            selectedLabel.textContent = acc.name;
            selectedLabel.classList.remove('text-[#8a8f98]');
            selectedLabel.classList.add('text-[#f7f8f8]');
            accountDropdown.classList.add('hidden');
        };

        accountOptions.appendChild(option);
    });

    updateCategorySelect();
}

export function updateCategorySelect() {
    const categoryOptions = document.getElementById('category-options');
    const selectedLabel = document.getElementById('selected-category-label');
    const categoryIdInput = document.getElementById('category_id') as HTMLInputElement;
    const categoryTrigger = document.getElementById('category-select-trigger') as HTMLButtonElement;
    const categoryDropdown = document.getElementById('category-dropdown');

    const typeRadios = document.getElementsByName('type') as NodeListOf<HTMLInputElement>;
    const selectedType = Array.from(typeRadios).find(r => r.checked)?.value ?? "";

    if (!categoryOptions || !selectedLabel || !categoryIdInput || !categoryTrigger || !categoryDropdown) return;

    if (!selectedType) {
        selectedLabel.textContent = 'Select a type first';
        categoryTrigger.disabled = true;
        categoryOptions.innerHTML = '';
        categoryIdInput.value = "";
        selectedLabel.classList.remove('text-[#f7f8f8]');
        selectedLabel.classList.add('text-[#8a8f98]');
        return;
    }

    categoryTrigger.disabled = false;
    categoryOptions.innerHTML = '';
    
    const filteredCategories = categories.filter(cat => cat.type === selectedType);
    const currentCatId = categoryIdInput.value;
    const isCurrentCatValid = filteredCategories.some(cat => cat.id.toString() === currentCatId);
    
    if (!isCurrentCatValid) {
        categoryIdInput.value = "";
        selectedLabel.textContent = 'Select Category';
        selectedLabel.classList.remove('text-[#f7f8f8]');
        selectedLabel.classList.add('text-[#8a8f98]');
    }

    filteredCategories.forEach(cat => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'w-full text-left px-3 py-2.5 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center gap-3 group';
        
        option.innerHTML = `
            <div class="w-2 h-2 rounded-full" style="background-color: ${cat.color || '#8a8f98'}"></div>
            <span class="text-[14px] font-[510] text-[#f7f8f8]">${cat.name}</span>
        `;

        option.onclick = () => {
            categoryIdInput.value = cat.id.toString();
            selectedLabel.textContent = cat.name;
            selectedLabel.classList.remove('text-[#8a8f98]');
            selectedLabel.classList.add('text-[#f7f8f8]');
            categoryDropdown.classList.add('hidden');
        };

        categoryOptions.appendChild(option);
    });
}

export async function openModal(payment: RecurrentPayment | null = null) {
    const { 
        modal, modalTitle, deleteBtn, form, paymentIdInput, titleInput, 
        amountInput, startInput, frequencyInput, isActiveInput, 
        accLabel, accInput, catLabel, catInput 
    } = getModalElements();
    
    if (!modal || !modalTitle || !deleteBtn || !form) return;

    await ensureInitialDataLoaded();

    if (payment) {
        modalTitle.textContent = 'Edit Recurrent Payment';
        if (paymentIdInput) paymentIdInput.value = payment.id.toString();
        if (titleInput) titleInput.value = payment.title;
        if (amountInput) amountInput.value = (payment.amount / 100).toString();
        if (startInput) startInput.value = payment.start_date.split('T')[0];
        if (frequencyInput) frequencyInput.value = payment.frequency;
        if (isActiveInput) isActiveInput.checked = payment.is_active;
        
        const typeRadios = document.getElementsByName('type') as NodeListOf<HTMLInputElement>;
        typeRadios.forEach(r => {
            if (r.value === payment.type) r.checked = true;
        });

        const account = accounts.find(a => a.id === payment.account_id);
        if (accLabel && accInput && account) {
            accLabel.textContent = account.name;
            accLabel.classList.remove('text-[#8a8f98]');
            accLabel.classList.add('text-[#f7f8f8]');
            accInput.value = account.id.toString();
        }

        updateCategorySelect();

        const category = categories.find(c => c.id === payment.category_id);
        if (catLabel && catInput && category) {
            catLabel.textContent = category.name;
            catLabel.classList.remove('text-[#8a8f98]');
            catLabel.classList.add('text-[#f7f8f8]');
            catInput.value = category.id.toString();
        }

        deleteBtn.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Add Recurrent Payment';
        form.reset();
        if (paymentIdInput) paymentIdInput.value = '';
        if (startInput) startInput.value = new Date().toISOString().split('T')[0];
        
        if (accLabel && accInput) {
            accLabel.textContent = 'Select Account';
            accLabel.classList.remove('text-[#f7f8f8]');
            accLabel.classList.add('text-[#8a8f98]');
            accInput.value = '';
        }

        if (catLabel && catInput) {
            catLabel.textContent = 'Select a type first';
            catLabel.classList.remove('text-[#f7f8f8]');
            catLabel.classList.add('text-[#8a8f98]');
            catInput.value = '';
        }

        updateCategorySelect();
        deleteBtn.classList.add('hidden');
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

export function closeModal() {
    const { modal } = getModalElements();
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('account-dropdown')?.classList.add('hidden');
        document.getElementById('category-dropdown')?.classList.add('hidden');
    }
    document.body.style.overflow = '';
}

export async function savePayment(e: SubmitEvent) {
    e.preventDefault();
    const { form, paymentIdInput, accInput, catInput } = getModalElements();
    if (!form) return;

    const formData = new FormData(form);
    const id = paymentIdInput?.value;
    const accountId = accInput?.value;
    const categoryId = catInput?.value;
    
    if (!accountId) {
        alert('Please select an account');
        return;
    }
    if (!categoryId) {
        alert('Please select a category');
        return;
    }

    const data: any = {
        title: formData.get('title'),
        amount: Math.round(parseFloat(formData.get('amount') as string) * 100),
        type: formData.get('type'),
        frequency: formData.get('frequency'),
        start_date: formData.get('start_date'),
        account_id: parseInt(accountId),
        category_id: parseInt(categoryId),
        end_date: null,
        is_active: formData.get('is_active') === '1'
    };

    try {
        if (id) {
            await updateRecurrentPayment(parseInt(id), data);
        } else {
            await createRecurrentPayment(data);
        }
        recurrentCache = null; // Invalidate cache
        await loadRecurrentPayments();
        closeModal();
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save payment');
    }
}

export async function handleDelete() {
    const idInput = document.getElementById('recurrent-id') as HTMLInputElement;
    const id = idInput?.value;
    if (!id || !confirm('Are you sure you want to delete this recurrent payment?')) return;

    try {
        await deleteRecurrentPayment(parseInt(id));
        recurrentCache = null; // Invalidate cache
        await loadRecurrentPayments();
        closeModal();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete payment');
    }
}

function renderPayments(payments: RecurrentPayment[]) {
    const rowsContainer = document.getElementById('recurrent-rows');
    if (!rowsContainer) return;
    
    rowsContainer.innerHTML = '';

    if (payments.length === 0) {
        rowsContainer.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-[#8a8f98]">No recurrent payments found.</td></tr>';
        return;
    }

    const fragment = document.createDocumentFragment();

    payments.forEach((payment: RecurrentPayment) => {
        const isIncome = payment.type === 'income';
        const row = document.createElement('tr');
        row.className = 'hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer border-b border-[rgba(255,255,255,0.03)]';
        row.onclick = () => openModal(payment);
        
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'bg-[rgba(248,113,113,0.1)] text-[#f87171]'}">
                        <i class="fas ${isIncome ? 'fa-plus' : 'fa-receipt'} text-[10px]"></i>
                    </div>
                    <div>
                        <div class="text-[14px] font-[510] text-[#f7f8f8]">${payment.title}</div>
                        <div class="text-[11px] text-[#62666d]">${payment.account_name || 'Account'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="text-[13px] text-[#8a8f98] capitalize">${payment.frequency}</span>
            </td>
            <td class="px-6 py-4">
                <span class="badge-pill bg-[rgba(255,255,255,0.03)] flex items-center w-fit gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${payment.category_color || '#8a8f98'}"></div>
                    ${payment.category_name || '-'}
                </span>
            </td>
            <td class="px-6 py-4 text-[13px] text-[#62666d]">
                ${formatDate(payment.next_date)}
            </td>
            <td class="px-6 py-4">
                <span class="badge-pill ${payment.is_active ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'bg-[rgba(255,255,255,0.05)] text-[#8a8f98]'}">
                    ${payment.is_active ? 'Active' : 'Paused'}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <span class="text-[14px] font-[510] ${isIncome ? 'text-[#10b981]' : 'text-[#f87171]'}">
                    ${isIncome ? '+' : '-'}${formatCurrency(payment.amount)}
                </span>
            </td>
        `;
        fragment.appendChild(row);
    });

    rowsContainer.appendChild(fragment);
}

export async function loadRecurrentPayments() {
    if (recurrentCache) {
        renderPayments(recurrentCache);
        return;
    }

    try {
        const data = await fetchRecurrentPayments();
        recurrentCache = data;
        renderPayments(data);
    } catch (error) {
        console.error('Fetch error:', error);
        const rowsContainer = document.getElementById('recurrent-rows');
        if (rowsContainer && !recurrentCache) {
            rowsContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-24 text-center">
                        <p class="text-rose-500 font-[510]">Error loading recurrent payments. Please try again later.</p>
                    </td>
                </tr>
            `;
        }
    }
}

export function resetModalCache() {
    cachedModalElements = null;
}
