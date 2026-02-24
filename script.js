document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const elements = {
        vendorName: document.getElementById('vendor-name'),
        invoiceNum: document.getElementById('invoice-number'),
        invoiceDate: document.getElementById('invoice-date'),
        custName: document.getElementById('customer-name'),
        custPhone: document.getElementById('customer-phone'),
        custAddr: document.getElementById('customer-address'),
        pkgName: document.getElementById('package-name'),
        dataLimit: document.getElementById('data-limit'),
        pkgPrice: document.getElementById('package-price'),
        addGst: document.getElementById('add-gst')
    };

    // Preview Fields
    const preview = {
        vendorBadge: document.getElementById('p-vendor-badge'),
        companyTitle: document.getElementById('p-company-title'),
        invoiceNum: document.getElementById('p-invoice-num'),
        invoiceDate: document.getElementById('p-invoice-date'),
        custName: document.getElementById('p-cust-name'),
        custAddr: document.getElementById('p-cust-addr'),
        custPhone: document.getElementById('p-cust-phone'),
        pkgName: document.getElementById('p-pkg-name'),
        dataLimit: document.getElementById('p-data-limit'),
        price: document.getElementById('p-price'),
        subtotal: document.getElementById('p-subtotal'),
        gstAmount: document.getElementById('p-gst-amount'),
        total: document.getElementById('p-total')
    };

    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');

    // Default Date
    const today = new Date().toISOString().split('T')[0];
    elements.invoiceDate.value = today;
    updateText(preview.invoiceDate, formatDate(today));

    // Live Update Logic
    Object.keys(elements).forEach(key => {
        elements[key].addEventListener('input', () => {
            syncData(key);
        });
    });

    // Special listener for checkbox as it doesn't trigger 'input' in some browsers or is better as 'change'
    elements.addGst.addEventListener('change', () => syncData('pkgPrice'));

    function syncData(key) {
        const val = elements[key].value;

        switch (key) {
            case 'vendorName':
                if (val) {
                    preview.vendorBadge.textContent = `Managed by: ${val}`;
                    preview.vendorBadge.style.display = 'inline-block';
                } else {
                    preview.vendorBadge.style.display = 'none';
                }
                break;
            case 'invoiceNum':
                preview.invoiceNum.textContent = val || 'HB/INV/-';
                break;
            case 'invoiceDate':
                preview.invoiceDate.textContent = formatDate(val);
                break;
            case 'custName':
                preview.custName.textContent = val || 'Customer Name';
                break;
            case 'custAddr':
                preview.custAddr.textContent = val || 'Service address will appear here...';
                break;
            case 'custPhone':
                preview.custPhone.textContent = val ? `Ph: +91 ${val}` : '';
                break;
            case 'pkgName':
                preview.pkgName.textContent = val || 'Broadband Subscription';
                break;
            case 'dataLimit':
                preview.dataLimit.textContent = val;
                break;
            case 'pkgPrice':
            case 'addGst':
                const basePrice = parseFloat(elements.pkgPrice.value) || 0;
                let gst = 0;
                let total = basePrice;

                if (elements.addGst.checked) {
                    gst = basePrice * 0.18;
                    total = basePrice + gst;
                }

                preview.price.textContent = formatCurrency(basePrice);
                preview.subtotal.textContent = formatCurrency(basePrice);
                preview.gstAmount.textContent = formatCurrency(gst);
                preview.total.textContent = formatCurrency(total);
                break;
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function formatCurrency(num) {
        return '₹' + num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function updateText(el, text) {
        if (el) el.textContent = text;
    }

    // Export Logic
    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-preview');
        const opt = {
            margin: [0, 0],
            filename: `Hybrid_Invoice_${elements.custName.value || 'Client'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        downloadBtn.innerHTML = '<span>Processing...</span>';
        html2pdf().from(element).set(opt).save().then(() => {
            downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Digital PDF`;
        });
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
});
