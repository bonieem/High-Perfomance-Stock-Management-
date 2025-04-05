let products = JSON.parse(localStorage.getItem('products')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
const invoices = JSON.parse(localStorage.getItem('invoices')) || []; // Load invoices from storage

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('invoices', JSON.stringify(invoices)); // Save invoices to storage
    updateTable();
    displayInvoices(); // Update invoices display when data changes
}

function updateTable() {
    const table = document.getElementById('stock-table').getElementsByTagName('tbody')[0];
    table.innerHTML = '';

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const newRow = table.insertRow(table.rows.length);

        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        cell1.innerHTML = product.name;

        if (product.quantity === 0) {
            cell2.innerHTML = '<strong>Sold Out!</strong>';
            cell3.innerHTML = '<strong>Sold Out!</strong>';
            cell4.innerHTML = '<strong>Sold Out!</strong>';
            cell5.innerHTML = '<strong>Sold Out!</strong>';
        } else {
            cell2.innerHTML = product.quantity;
            cell3.innerHTML = product.unit;
            cell3.style.textAlign = 'center';
            cell4.innerHTML = product.price;
            cell4.style.textAlign = 'right';
            cell5.innerHTML = product.totalPrice;
            cell5.style.textAlign = 'right';
        }

        const removeButton = document.createElement('button');
        removeButton.innerHTML = 'Remove';
        removeButton.addEventListener('click', function() {
            const rowIndex = this.parentNode.parentNode.rowIndex - 1;
            products.splice(rowIndex, 1);
            saveProducts();
        });

        const editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        editButton.addEventListener('click', function() {
            const rowIndex = this.parentNode.parentNode.rowIndex - 1;
            editProduct(rowIndex);
        });

        cell6.appendChild(removeButton);
        cell6.appendChild(editButton);
    }
}

function editProduct(index) {
    const product = products[index];

    const name = prompt('Enter new name:', product.name);
    const quantity = prompt('Enter new quantity:', product.quantity);
    const price = prompt('Enter new price:', product.price);

    if (name !== null && quantity !== null && price !== null) { // Check if prompt was not cancelled
        if (name.trim() !== "" && !isNaN(parseInt(quantity)) && !isNaN(parseFloat(price))) {
            products[index] = { name: name.trim(), quantity: parseInt(quantity), price: parseFloat(price) };
            saveProducts();
        } else {
            alert('Please enter valid information for name, quantity, and price.');
        }
    }
}

document.getElementById('add-button').addEventListener('click', function() {
    const name = document.getElementById('product-name').value.trim();
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const unit = document.getElementById('product-unit').value;

    if (name === "" || isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid product name and a quantity greater than zero.');
        return;
    }

    const pricePerUnit = parseFloat(prompt(`Enter price per ${unit}:`));

    if (isNaN(pricePerUnit)) {
        alert('Please enter a valid price.');
        return;
    }

    const totalPrice = quantity * pricePerUnit;
    const dateAdded = new Date().toISOString();

    products.push({ name, quantity, unit, price: pricePerUnit, totalPrice: totalPrice, dateAdded });
    saveProducts();

    document.getElementById('product-name').value = '';
    document.getElementById('product-quantity').value = '';
});

function sellProduct(index) {
    const quantitySold = parseInt(prompt('Enter quantity sold:'));

    if (isNaN(quantitySold) || quantitySold <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    if (quantitySold > products[index].quantity) {
        alert('Not enough stock available.');
        return;
    }

    const sellingPrice = parseFloat(prompt('Enter selling price:'));
    const unit = products[index].unit;

    if (isNaN(sellingPrice) || sellingPrice <= 0) {
        alert('Please enter a valid selling price.');
        return;
    }

    const dateSold = new Date().toISOString();
    const costPrice = products[index].price;
    const profitPerItem = (sellingPrice - costPrice).toFixed(2);
    const totalProfit = (quantitySold * profitPerItem).toFixed(2);

    const sale = {
        name: products[index].name,
        quantity: quantitySold,
        costPrice: costPrice,
        sellingPrice: sellingPrice,
        date: dateSold,
        profitPerItem: profitPerItem,
        totalProfit: totalProfit,
        unit: unit
    };
    sales.push(sale);

    // **STOCK DEDUCTION LOGIC:**
    products[index].quantity -= quantitySold; // Subtract the sold quantity from the current product's quantity

    saveProducts();

    alert(`Product sold successfully! Total Profit: $${totalProfit} (Unit: ${unit})`);
    displayProducts();
}

document.getElementById('search-input').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const tableRows = document.getElementById('stock-table').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (let row of tableRows) {
        const name = row.cells[0].textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
});

document.getElementById('sort-name').addEventListener('click', function() {
    sortProducts('name');
});

document.getElementById('sort-quantity').addEventListener('click', function() {
    sortProducts('quantity');
});

document.getElementById('sort-price').addEventListener('click', function() {
    sortProducts('price');
});

function sortProducts(sortBy) {
    products.sort(function(a, b) {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'quantity' || sortBy === 'price') {
            return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
        }
    });
    saveProducts();
}

function displaySales() {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = '';

    const salesByProductUnit = {};

    sales.forEach((sale, index) => { // Get the index of the sale
        const key = `${sale.name}-${sale.unit}`;
        if (!salesByProductUnit[key]) {
            salesByProductUnit[key] = [];
        }
        salesByProductUnit[key].push({ ...sale, index }); // Store the sale with its original index
    });

    for (const productUnitKey in salesByProductUnit) {
        const productUnitSales = salesByProductUnit[productUnitKey];
        const [productName, unit] = productUnitKey.split('-');

        const productFolder = document.createElement('div');
        productFolder.classList.add('product-folder');

        const folderHeader = document.createElement('h3');
        folderHeader.textContent = `${productName} (${unit})`;
        productFolder.appendChild(folderHeader);

        const salesContainer = document.createElement('div');
        salesContainer.classList.add('sales-container');

        productUnitSales.forEach(sale => {
            const saleItem = document.createElement('div');
            saleItem.classList.add('sale-item');
            saleItem.innerHTML = `
                <p><strong>Quantity Sold:</strong> ${sale.quantity}</p>
                <p><strong>Unit:</strong> ${sale.unit}</p>
                <p><strong>Cost Price:</strong> $${sale.costPrice}</p>
                <p><strong>Selling Price:</strong> $${sale.sellingPrice}</p>
                <p><strong>Date Sold:</strong> ${new Date(sale.date).toLocaleString()}</p>
                <p><strong>Profit per Item:</strong> $${sale.profitPerItem}</p>
                <p><strong>Total Profit:</strong> $${sale.totalProfit}</p>
                <button onclick="generateInvoice(${sale.index})">Generate Invoice</button>
            `;
            salesContainer.appendChild(saleItem);
        });

        productFolder.appendChild(salesContainer);
        salesList.appendChild(productFolder);
    }
}

function displayProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const productBox = document.createElement('div');
        productBox.classList.add('product-box');
        let productInfo = '';

        if (product.quantity === 0) {
            productInfo = '<p><strong>Sold Out!</strong></p>';
        } else {
            productInfo = `
                <p><strong>Quantity:</strong> ${product.quantity}</p>
                <p><strong>Unit:</strong> ${product.unit}</p>
                <p><strong>Price:</strong> ${product.price}</p>
            `;
        }

        productBox.innerHTML = `
            <p><strong>Name:</strong> ${product.name}</p>
            ${productInfo}
            <p><strong>Added:</strong> ${new Date(product.dateAdded).toLocaleString()}</p>
            ${product.dateSold ? `<p><strong>Sold:</strong> ${new Date(product.dateSold).toLocaleString()}</p>` : ''}
            <button onclick="sellProduct(${products.indexOf(product)})" ${product.quantity === 0 ? 'disabled' : ''}>Sell</button>
        `;
        productList.appendChild(productBox);
    });
}

function generateInvoice(saleIndex) {
    const sale = sales[saleIndex];

    const invoiceNumber = `INV-${invoices.length + 1}`;
    const invoiceDate = new Date().toLocaleString();
    const totalAmount = sale.quantity * sale.sellingPrice;

    // Ask for your business details
    const fromName = prompt("Enter Your Business Name:", "Your Business Name");
    const fromAddress = prompt("Enter Your Business Address:", "Your Business Address");
    const fromContact = prompt("Enter Your Contact Info (Phone or Email):", "Your Contact Info");

    // Ask for customer details
    const toName = prompt("Enter Customer Name:", "Customer Name");
    const toAddress = prompt("Enter Customer Address:", "Customer Address");

    const invoice = {
        number: invoiceNumber,
        date: invoiceDate,
        from: {
            name: fromName,
            address: fromAddress,
            contact: fromContact
        },
        to: {
            name: toName,
            address: toAddress
        },
        items: [{
            name: sale.name,
            quantity: sale.quantity,
            unit: sale.unit,
            price: sale.sellingPrice,
            total: totalAmount
        }],
        total: totalAmount
    };

    invoices.push(invoice);
    saveProducts(); // Save the new invoice
    displayInvoices(); // Update the displayed invoices
    // Switch to the invoices page
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    pages.forEach(page => page.style.display = 'none');
    document.getElementById('invoices-page').style.display = 'block';
    navItems.forEach(navItem => navItem.classList.remove('active'));
    document.querySelector('[data-page="invoices-page"]').classList.add('active');
}

function displayInvoices() {
    console.log("displayInvoices() function is running!");

    const invoicesList = document.getElementById('invoices-list');
    if (!invoicesList) {
        console.log("Could not find the 'invoices-list' element!");
        return;
    }

    invoicesList.innerHTML = '';
    console.log("Content of invoicesList after clearing:", invoicesList.innerHTML); // ADDED LINE

    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p>No invoices generated yet.</p>';
        console.log("No invoices in the 'invoices' array.");
        return;
    }

    invoices.forEach(invoice => {
        console.log("Processing an invoice:", invoice.number);
        const invoiceDiv = document.createElement('div');
        invoiceDiv.classList.add('invoice');
        invoiceDiv.innerHTML = `
            <h3>Invoice: ${invoice.number}</h3>
            <p>Date: ${invoice.date}</p>

            <h4>From:</h4>
            <p>${invoice.from.name}</p>
            <p>${invoice.from.address}</p>
            <p>${invoice.from.contact}</p>

            <h4>To:</h4>
            <p>${invoice.to.name}</p>
            <p>${invoice.to.address}</p>

            <h4>Items:</h4>
            <ul>
                ${invoice.items.map(item => `<li>${item.quantity} ${item.unit} of ${item.name} @ $${item.price} = $${item.total.toFixed(2)}</li>`).join('')}
            </ul>
            <p><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
            <hr>
        `;
        invoicesList.appendChild(invoiceDiv);
        console.log("Appended invoice", invoice.number, "to the list.");
    });

    console.log("Finished displaying invoices.");
    console.log("Content of invoicesList after adding invoices:", invoicesList.innerHTML); // ADDED LINE
}

document.getElementById('clear-all-button').addEventListener('click', function() {
    console.log('Clear All button clicked!'); // Added for debugging
    if (confirm('Are you sure you want to clear all stock, sales, and invoices?')) {
        products = [];
        sales = [];
        invoices = []; // Corrected the variable name here
        localStorage.removeItem('products');
        localStorage.removeItem('sales');
        localStorage.removeItem('invoices'); // Corrected the variable name here
        updateTable();
        displaySales();
        displayProducts();
        displayInvoices(); // Corrected the function name here
        alert('All stock, sales, and invoices have been cleared.');
    }
});

// Navigation logic (moved to the end)
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.dataset.page;

        pages.forEach(page => {
            page.style.display = 'none';
        });

        document.getElementById(pageId).style.display = 'block';

        navItems.forEach(navItem => {
            navItem.classList.remove('active');
        });
        item.classList.add('active');

        if (pageId === 'invoices-page') {
            displayInvoices(); // Corrected the function name here
        }
        if (pageId === 'sales-orders-page') {
            displaySales();
        }
        if (pageId === 'items-page') {
            displayProducts();
        }
        if (pageId === 'home-page') {
            // No specific function to call for home right now
        }
        if (pageId === 'packages-page') {
            // Assuming you have a displayPackages function
        }
    });
});

// Initial calls to display data
updateTable();
displaySales();
displayProducts();
displayInvoices(); // Corrected the function name here