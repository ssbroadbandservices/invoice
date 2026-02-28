document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const elements = {
        vendorName: document.getElementById('vendor-name'),
        invoiceNum: document.getElementById('invoice-number'),
        invoiceDate: document.getElementById('invoice-date'),
        dueDate: document.getElementById('due-date'),
        custName: document.getElementById('customer-name'),
        custPhone: document.getElementById('customer-phone'),
        custAddr: document.getElementById('customer-address'),
        pkgName: document.getElementById('package-name'),
        dataLimit: document.getElementById('data-limit'),
        pkgPrice: document.getElementById('package-price'),
        ottName: document.getElementById('ott-name'),
        ottPrice: document.getElementById('ott-price'),
        iptvName: document.getElementById('iptv-name'),
        iptvPrice: document.getElementById('iptv-price'),
        addGst: document.getElementById('add-gst'),
        upiId: document.getElementById('upi-id')
    };
    // Preview Fields
    const preview = {
        vendorBadge: document.getElementById('p-vendor-badge'),
        companyTitle: document.getElementById('p-company-title'),
        invoiceNum: document.getElementById('p-invoice-num'),
        invoiceDate: document.getElementById('p-invoice-date'),
        dueDate: document.getElementById('p-due-date'),
        custName: document.getElementById('p-cust-name'),
        custAddr: document.getElementById('p-cust-addr'),
        custPhone: document.getElementById('p-cust-phone'),
        pkgName: document.getElementById('p-pkg-name'),
        dataLimit: document.getElementById('p-data-limit'),
        price: document.getElementById('p-price'),
        rowOtt: document.getElementById('row-ott'),
        ottName: document.getElementById('p-ott-name'),
        ottPrice: document.getElementById('p-ott-price'),
        rowIptv: document.getElementById('row-iptv'),
        iptvName: document.getElementById('p-iptv-name'),
        iptvPrice: document.getElementById('p-iptv-price'),
        subtotal: document.getElementById('p-subtotal'),
        gstAmount: document.getElementById('p-gst-amount'),
        total: document.getElementById('p-total'),
        qrUpiText: document.getElementById('qr-upi-text')
    };
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');
    // Initialize QR Code
    let qrcodeContainer = document.getElementById("qrcode");
    let qrcode = new QRCode(qrcodeContainer, {
        text: "",
        width: 100,
        height: 100,
        colorDark: "#1e1e4a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    // Default Dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    elements.invoiceDate.value = todayStr;
    // Default Due Date (7 days after issue date)
    const due = new Date(today);
    due.setDate(due.getDate() + 7);
    const dueDateStr = due.toISOString().split('T')[0];
    elements.dueDate.value = dueDateStr;
    updateText(preview.invoiceDate, formatDate(todayStr));
    updateText(preview.dueDate, formatDate(dueDateStr));
    // Live Update Logic
    Object.keys(elements).forEach(key => {
        elements[key].addEventListener('input', () => {
            syncData();
        });
    });
    elements.addGst.addEventListener('change', () => syncData());
    function syncData() {
        if (elements.vendorName.value) {
            preview.vendorBadge.textContent = `Managed by: ${elements.vendorName.value}`;
            preview.vendorBadge.style.display = 'inline-block';
        } else {
            preview.vendorBadge.style.display = 'none';
        }
        preview.invoiceNum.textContent = elements.invoiceNum.value || 'HB/INV/-';
        preview.invoiceDate.textContent = formatDate(elements.invoiceDate.value);
        preview.dueDate.textContent = formatDate(elements.dueDate.value);
        preview.custName.textContent = elements.custName.value || 'Customer Name';
        preview.custAddr.textContent = elements.custAddr.value || 'Service address will appear here...';
        preview.custPhone.textContent = elements.custPhone.value ? `Ph: +91 ${elements.custPhone.value}` : '';
        preview.pkgName.textContent = elements.pkgName.value || 'Broadband Subscription';
        preview.dataLimit.textContent = elements.dataLimit.value;
        // Pricing Math
        const internetPrice = parseFloat(elements.pkgPrice.value) || 0;
        const ottP = parseFloat(elements.ottPrice.value) || 0;
        const iptvP = parseFloat(elements.iptvPrice.value) || 0;
        preview.price.textContent = formatCurrency(internetPrice);
        // Handle OTT
        if (elements.ottName.value || ottP > 0) {
            preview.rowOtt.style.display = 'table-row';
            preview.ottName.textContent = elements.ottName.value || 'OTT Subscription';
            preview.ottPrice.textContent = formatCurrency(ottP);
        } else {
            preview.rowOtt.style.display = 'none';
        }
        // Handle IPTV
        if (elements.iptvName.value || iptvP > 0) {
            preview.rowIptv.style.display = 'table-row';
            preview.iptvName.textContent = elements.iptvName.value || 'IPTV Service';
            preview.iptvPrice.textContent = formatCurrency(iptvP);
        } else {
            preview.rowIptv.style.display = 'none';
        }
        const subtotal = internetPrice + ottP + iptvP;
        let gst = 0;
        let total = subtotal;
        if (elements.addGst.checked) {
            gst = subtotal * 0.18;
            total = subtotal + gst;
        }
        preview.subtotal.textContent = formatCurrency(subtotal);
        preview.gstAmount.textContent = formatCurrency(gst);
        preview.total.textContent = formatCurrency(total);
        // Handle QR Code
        const upiId = elements.upiId.value.trim();
        if (upiId) {
            preview.qrUpiText.textContent = upiId;
            const upiString = `upi://pay?pa=${upiId}&pn=Hybrid%20Internet&am=${total.toFixed(2)}&cu=INR`;
            qrcode.clear();
            qrcode.makeCode(upiString);
        } else {
            preview.qrUpiText.textContent = 'Enter UPI to generate QR';
            qrcode.clear();
            qrcodeContainer.innerHTML = ''; // Ensure canvas is cleared fully
            qrcode = new QRCode(qrcodeContainer, {
                text: "",
                width: 100,
                height: 100,
                colorDark: "#1e1e4a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
    // Init display
    syncData();
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
        // Remove transform before capture (especially important for mobile scaling)
        const originalTransform = element.style.transform;
        element.style.transform = 'none';
        element.style.margin = '0';
        const opt = {
            margin: 0,
            filename: `Hybrid_Invoice_${elements.custName.value || 'Client'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all' } // This helps prevent splitting
        };
        downloadBtn.innerHTML = '<span>Processing...</span>';
        html2pdf().from(element).set(opt).toPdf().get('pdf').then(function (pdf) {
            // Additional check to ensure only one page exists
            const totalPages = pdf.internal.getNumberOfPages();
            if (totalPages > 1) {
                for (let i = totalPages; i > 1; i--) {
                    pdf.deletePage(i);
                }
            }
        }).save().then(() => {
            // Restore styling
            element.style.transform = originalTransform;
            downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Digital PDF`;
        });
    });
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
