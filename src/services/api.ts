import type { DashboardData } from "../types/dashboard";
import type { Account } from "../types/account";
import type { Category } from "../types/category";

const API_URL = import.meta.env.PUBLIC_API_URL;

export async function fetchAccounts(): Promise<Account[]> {
    const res = await fetch(`${API_URL}/account`, { credentials: 'include' });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
    const res = await fetch(`${API_URL}/category`, { credentials: 'include' });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

export async function fetchDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_URL}/dashboard`, { credentials: 'include' });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
}

export async function createTransaction(data: any) {
    const res = await fetch(`${API_URL}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to save transaction');
    return res.json();
}
