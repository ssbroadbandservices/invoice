document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const elements = {
        invoiceNum: document.getElementById('invoice-number'),
        invoiceDate: document.getElementById('invoice-date'),
        dueDate: document.getElementById('due-date'),
        opName: document.getElementById('operator-name'),
        firmName: document.getElementById('firm-name'),
        opPhone: document.getElementById('operator-phone'),
        opAddr: document.getElementById('operator-address'),
        addGst: document.getElementById('add-gst'),
        upiId: document.getElementById('upi-id')
    };
    // Preview
    const preview = {
        invoiceNum: document.getElementById('p-invoice-num'),
        invoiceDate: document.getElementById('p-invoice-date'),
        dueDate: document.getElementById('p-due-date'),
        opName: document.getElementById('p-op-name'),
        firmName: document.getElementById('p-firm-name'),
        opAddr: document.getElementById('p-op-addr'),
        opPhone: document.getElementById('p-op-phone'),
        itemsBody: document.getElementById('p-items-body'),
        subtotal: document.getElementById('p-subtotal'),
        gstAmount: document.getElementById('p-gst-amount'),
        total: document.getElementById('p-total'),
        qrUpiText: document.getElementById('qr-upi-text')
    };
    const downloadBtn = document.getElementById('download-btn');
    const printBtn = document.getElementById('print-btn');
    // QR Initiation
    let qrcodeContainer = document.getElementById("qrcode");
    let qrcode = new QRCode(qrcodeContainer, {
        text: "",
        width: 100,
        height: 100,
        colorDark: "#1e1e4a",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    // Dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    elements.invoiceDate.value = todayStr;
    const due = new Date(today);
    due.setDate(due.getDate() + 7);
    elements.dueDate.value = due.toISOString().split('T')[0];
    // Dynamic Lists
    let netItems = [];
    let ottItems = [];
    let iptvItems = [];
    function addRow(type) {
        let container, prefix;
        if (type === 'net') { container = document.getElementById('net-container'); prefix = 'Internet Package'; }
        if (type === 'ott') { container = document.getElementById('ott-container'); prefix = 'OTT Package'; }
        if (type === 'iptv') { container = document.getElementById('iptv-container'); prefix = 'IPTV Package'; }
        const div = document.createElement('div');
        div.className = 'dynamic-entry';
        div.innerHTML = `
            <button class="remove-btn" onclick="this.parentElement.remove(); window.syncDynamic();" title="Remove">&times;</button>
            <div class="form-group" style="margin-bottom: 15px;">
                <input type="text" class="d-name" placeholder="Name (e.g. ${prefix})" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <input type="number" class="d-rate" placeholder="Rate (₹)" required>
                </div>
                <div class="form-group">
                    <input type="number" class="d-users" placeholder="Users" required>
                </div>
            </div>
        `;
        const inputs = div.querySelectorAll('input');
        inputs.forEach(inp => inp.addEventListener('input', window.syncDynamic));
        container.appendChild(div);
        window.syncDynamic();
    }
    document.getElementById('add-net-btn').addEventListener('click', () => addRow('net'));
    document.getElementById('add-ott-btn').addEventListener('click', () => addRow('ott'));
    document.getElementById('add-iptv-btn').addEventListener('click', () => addRow('iptv'));
    // Listeners for static fields
    Object.keys(elements).forEach(key => {
        elements[key].addEventListener('input', syncData);
    });
    elements.addGst.addEventListener('change', syncData);
    window.syncDynamic = function () {
        const getItems = (containerId) => {
            const container = document.getElementById(containerId);
            const entries = container.querySelectorAll('.dynamic-entry');
            let arr = [];
            entries.forEach(el => {
                arr.push({
                    name: el.querySelector('.d-name').value,
                    rate: parseFloat(el.querySelector('.d-rate').value) || 0,
                    users: parseInt(el.querySelector('.d-users').value) || 0
                });
            });
            return arr;
        };
        netItems = getItems('net-container');
        ottItems = getItems('ott-container');
        iptvItems = getItems('iptv-container');
        syncData();
    };
    function syncData() {
        preview.invoiceNum.textContent = elements.invoiceNum.value || 'HB/OP/-';
        preview.invoiceDate.textContent = formatDate(elements.invoiceDate.value);
        preview.dueDate.textContent = formatDate(elements.dueDate.value);
        preview.opName.textContent = elements.opName.value || 'Operator Name';
        preview.firmName.textContent = elements.firmName.value || 'Operator Firm Name';
        preview.opAddr.textContent = elements.opAddr.value || 'Address will appear here...';
        preview.opPhone.textContent = elements.opPhone.value ? `Ph: +91 ${elements.opPhone.value}` : '';
        // Table updates
        preview.itemsBody.innerHTML = '';
        let subtotal = 0;
        const renderItems = (items, typeName) => {
            items.forEach(item => {
                if (item.name || item.rate || item.users) {
                    const amount = item.rate * item.users;
                    subtotal += amount;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="item-desc">
                            <h5>${item.name || 'Unnamed Package'}</h5>
                            <p>${typeName}</p>
                        </td>
                        <td>${formatCurrency(item.rate)}</td>
                        <td>${item.users}</td>
                        <td class="price-cell" style="text-align:right;">${formatCurrency(amount)}</td>
                    `;
                    preview.itemsBody.appendChild(tr);
                }
            });
        };
        renderItems(netItems, 'Broadband Data Service');
        renderItems(ottItems, 'Value Added Service - OTT');
        renderItems(iptvItems, 'Value Added Service - IPTV');
        if (preview.itemsBody.children.length === 0) {
            preview.itemsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding: 30px;">No packages added yet. Click + to add.</td></tr>`;
        }
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
        if (upiId && total > 0) {
            preview.qrUpiText.textContent = upiId;
            const upiString = `upi://pay?pa=${upiId}&pn=Hybrid%20Internet&am=${total.toFixed(2)}&cu=INR`;
            qrcode.clear();
            qrcode.makeCode(upiString);
        } else {
            preview.qrUpiText.textContent = 'Enter UPI to generate QR';
            qrcode.clear();
            qrcodeContainer.innerHTML = '';
            qrcode = new QRCode(qrcodeContainer, {
                text: "", width: 100, height: 100,
                colorDark: "#1e1e4a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H
            });
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
    // Add initial rows
    addRow('net');
    // Auto-resizing for long tables during PDF generation
    downloadBtn.addEventListener('click', () => {
        const element = document.getElementById('invoice-preview');
        const originalTransform = element.style.transform;
        element.style.transform = 'none';
        element.style.margin = '0';
        element.style.minHeight = 'auto'; // allow natural expansion for multipage
        const opt = {
            margin: [10, 0, 10, 0], // top, left, bottom, right margins in mm
            filename: `Hybrid_Operator_Invoice_${elements.firmName.value || 'Firm'}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };
        downloadBtn.innerHTML = '<span>Processing...</span>';
        html2pdf().from(element).set(opt).save().then(() => {
            // Restore styling
            element.style.transform = originalTransform;
            element.style.minHeight = '1080px';
            downloadBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Digital PDF`;
        });
    });
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
