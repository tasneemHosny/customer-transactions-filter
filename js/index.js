document.addEventListener('DOMContentLoaded', () => {
    const customersTable = document.getElementById('customersTable').getElementsByTagName('tbody')[0];
    const customerFilter = document.getElementById('customerFilter');
    const transactionFilter = document.getElementById('transactionFilter');
    const transactionsChartCtx = document.getElementById('transactionsChart').getContext('2d');
    let customers = [];
    let transactions = [];
    let filteredTransactions = [];
    let chart;

    fetch('./js/customers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            customers = data.customers;
            transactions = data.transactions;
            filteredTransactions = transactions;
            displayTable(transactions);
            setupChart();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    customerFilter.addEventListener('input', filterTable);
    transactionFilter.addEventListener('input', filterTable);

    function filterTable() {
        const customerName = customerFilter.value.toLowerCase();
        const transactionAmount = transactionFilter.value;

        filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(customer => customer.id === transaction.customer_id);
            return (customer.name.toLowerCase().includes(customerName) &&
                (transactionAmount === '' || transaction.amount >= transactionAmount));
        });

        displayTable(filteredTransactions);
        updateChart(filteredTransactions);
    }

    function displayTable(transactions) {
        customersTable.innerHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(customer => customer.id === transaction.customer_id);
            const row = customersTable.insertRow();
            row.insertCell(0).textContent = customer.name;
            row.insertCell(1).textContent = transaction.date;
            row.insertCell(2).textContent = transaction.amount;
        });
    }

    function setupChart() {
        chart = new Chart(transactionsChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Transaction Amount',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateChart(transactions) {
        const dates = transactions.map(transaction => transaction.date);
        const amounts = transactions.map(transaction => transaction.amount);

        chart.data.labels = dates;
        chart.data.datasets[0].data = amounts;
        chart.update();
    }
});
