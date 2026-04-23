export const currencyFormatter = new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
});

export const formatCurrency = (amountInCents: number) => {
    return currencyFormatter.format(amountInCents / 100);
};

export const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'Reciente';
};
