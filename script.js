let salesData = [];

let salesChart;
let categoryChart;
let branchChart;
let paymentChart;


// ===============================
// LOAD CSV
// ===============================

fetch("data/sales.csv")
    .then(response => response.text())
    .then(csv => {

        salesData = parseCSV(csv);

        setupFilters(salesData);

        updateDashboard(salesData);

    })
    .catch(error => {
        console.error("CSV loading error:", error);
    });


// ===============================
// CSV PARSER
// ===============================

function parseCSV(csv) {

    const lines = csv.trim().split("\n");

    const headers = lines[0]
        .split(",")
        .map(header => header.trim());

    return lines.slice(1).map(line => {

        const values = line.split(",");

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index]
                ? values[index].trim()
                : "";
        });

        return row;
    });
}


// ===============================
// FILTER SETUP
// ===============================

function setupFilters(data) {

    const categoryFilter =
        document.getElementById("categoryFilter");

    const branchFilter =
        document.getElementById("branchFilter");


    const categories = [
        ...new Set(
            data
                .map(row => row["Category"])
                .filter(value => value)
        )
    ];


    const branches = [
        ...new Set(
            data
                .map(row => row["Branch"])
                .filter(value => value)
        )
    ];


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });


    branches.forEach(branch => {

        const option =
            document.createElement("option");

        option.value = branch;
        option.textContent = branch;

        branchFilter.appendChild(option);
    });


    categoryFilter.addEventListener(
        "change",
        applyFilters
    );

    branchFilter.addEventListener(
        "change",
        applyFilters
    );
}


// ===============================
// APPLY FILTERS
// ===============================

function applyFilters() {

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const selectedBranch =
        document.getElementById("branchFilter").value;


    const filteredData = salesData.filter(row => {

        const categoryMatch =
            selectedCategory === "All" ||
            row["Category"] === selectedCategory;


        const branchMatch =
            selectedBranch === "All" ||
            row["Branch"] === selectedBranch;


        return categoryMatch && branchMatch;
    });


    updateDashboard(filteredData);
}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard(data) {

    let totalSales = 0;
    let totalProfit = 0;


    data.forEach(row => {

        totalSales +=
            parseFloat(row["Sales"]) || 0;

        totalProfit +=
            parseFloat(row["Profit"]) || 0;
    });


    // TOTAL SALES

    document.getElementById("totalSales").textContent =
        "₹" + totalSales.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });


    // TOTAL PROFIT

    document.getElementById("totalProfit").textContent =
        "₹" + totalProfit.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });


    // TOTAL ORDERS

    const totalOrders = 100;

    document.getElementById("totalOrders").textContent =
        totalOrders;


    // AVERAGE ORDER VALUE

    const averageOrderValue =
        totalSales / totalOrders;

    document.getElementById("averageOrderValue").textContent =
        "₹" + averageOrderValue.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });


    // UPDATE CHARTS

    createSalesChart(data);
    createCategoryChart(data);
    createBranchChart(data);
    createPaymentChart(data);
}


// ===============================
// MONTHLY SALES TREND
// ===============================

function createSalesChart(data) {

    const monthlySales = {};


    data.forEach(row => {

        const date =
            new Date(row["Date"]);

        if (isNaN(date)) return;


        const month =
            date.toLocaleString("en-US", {
                month: "short",
                year: "numeric"
            });


        const sales =
            parseFloat(row["Sales"]) || 0;


        monthlySales[month] =
            (monthlySales[month] || 0) + sales;
    });


    if (salesChart) {
        salesChart.destroy();
    }


    salesChart = new Chart(
        document.getElementById("salesChart"),
        {

            type: "line",

            data: {

                labels:
                    Object.keys(monthlySales),

                datasets: [{

                    label: "Monthly Sales",

                    data:
                        Object.values(monthlySales),

                    tension: 0.3,

                    fill: false
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false
            }
        }
    );
}


// ===============================
// SALES BY CATEGORY
// ===============================

function createCategoryChart(data) {

    const categorySales = {};


    data.forEach(row => {

        const category =
            String(row["Category"] || "").trim();

        const sales =
            parseFloat(row["Sales"]) || 0;


        if (!category) return;


        categorySales[category] =
            (categorySales[category] || 0) + sales;
    });


    if (categoryChart) {
        categoryChart.destroy();
    }


    categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {

            type: "bar",

            data: {

                labels:
                    Object.keys(categorySales),

                datasets: [{

                    label: "Sales",

                    data:
                        Object.values(categorySales)
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false
            }
        }
    );
}


// ===============================
// SALES BY BRANCH
// ===============================

function createBranchChart(data) {

    const branchSales = {};


    data.forEach(row => {

        const branch =
            String(row["Branch"] || "").trim();

        const sales =
            parseFloat(row["Sales"]) || 0;


        if (!branch) return;


        branchSales[branch] =
            (branchSales[branch] || 0) + sales;
    });


    if (branchChart) {
        branchChart.destroy();
    }


    branchChart = new Chart(
        document.getElementById("branchChart"),
        {

            type: "bar",

            data: {

                labels:
                    Object.keys(branchSales),

                datasets: [{

                    label: "Sales",

                    data:
                        Object.values(branchSales)
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false
            }
        }
    );
}


// ===============================
// PAYMENT METHOD PIE CHART
// ===============================

function createPaymentChart(data) {

    const paymentSales = {};


    data.forEach(row => {

        const payment =
            String(row["Payment"] || "").trim();

        const sales =
            parseFloat(row["Sales"]) || 0;


        if (!payment) return;


        paymentSales[payment] =
            (paymentSales[payment] || 0) + sales;
    });


    const labels =
        Object.keys(paymentSales);

    const values =
        Object.values(paymentSales);


    if (paymentChart) {
        paymentChart.destroy();
    }


    paymentChart = new Chart(
        document.getElementById("paymentChart"),
        {

            type: "pie",

            data: {

                labels: labels,

                datasets: [{

                    label: "Payment Method",

                    data: values
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: true,

                        position: "bottom"
                    }
                }
            }
        }
    );
}