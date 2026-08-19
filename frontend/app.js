const API_BASE = window.location.origin;
let currentVendors = [];
let currentCategories = [];
let currentExpenses = [];

const AUTH_KEY = "buildledger_token";


// =====================================================
// ELEMENTS
// =====================================================

const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("login-email").value;

    const password =
        document.getElementById("login-password").value;

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    try {

        const response = await fetch(
            `${API_BASE}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

            loginMessage.textContent =
                data.detail || "Login failed";

            return;
        }

        localStorage.setItem(
            AUTH_KEY,
            data.access_token
        );

        loginMessage.textContent = "";

        showDashboard();

    } catch (error) {

        loginMessage.textContent =
            "Unable to connect to the server";
    }
});


// =====================================================
// SHOW DASHBOARD
// =====================================================

async function showDashboard() {

    loginSection.style.display = "none";
    dashboard.style.display = "block";

    await loadVendors();
    await loadCategories();
    await loadExpenses();
}


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

    loginSection.style.display = "block";
    dashboard.style.display = "none";
}


// =====================================================
// GET TOKEN
// =====================================================

function getToken() {

    return localStorage.getItem(AUTH_KEY);
}


// =====================================================
// GET VENDOR NAME
// =====================================================

function getVendorName(vendorId) {

    if (!vendorId) {
        return "No Vendor";
    }

    const vendor = currentVendors.find(
        function (vendor) {
            return vendor.id === vendorId;
        }
    );

    return vendor
        ? vendor.name
        : "Unknown Vendor";
}


// =====================================================
// GET CATEGORY NAME
// =====================================================

function getCategoryName(categoryId) {

    if (!categoryId) {
        return "Unknown";
    }

    const category = currentCategories.find(
        function (item) {
            return item.id === categoryId;
        }
    );

    return category
        ? category.name
        : "Unknown";
}


// =====================================================
// METRICS
// =====================================================

function updateMetrics(expenses) {

    let totalAmount = 0;
    let totalPhonePe = 0;
    let totalCash = 0;
    let totalPending = 0;
    let totalPetrol = 0;

    expenses.forEach(function (expense) {

        const amount = Number(expense.amount) || 0;

        totalAmount += amount;

        const paymentMethod =
            String(expense.payment_method || "")
                .trim()
                .toLowerCase();

        if (paymentMethod === "phonepe") {

            totalPhonePe += amount;

        } else if (paymentMethod === "cash") {

            totalCash += amount;

        } else if (paymentMethod === "pending") {

            totalPending += amount;
        }


        // Petrol category
        const categoryName =
            String(expense.category || "")
                .trim()
                .toLowerCase();

        if (categoryName === "petrol") {

            totalPetrol += amount;
        }
    });


    // Total amount
    const totalElement =
        document.getElementById(
            "metric-total-amount"
        );

    if (totalElement) {

        totalElement.textContent =
            totalAmount.toFixed(2);
    }


    // PhonePe
    const phonePeElement =
        document.getElementById(
            "metric-phonepe"
        );

    if (phonePeElement) {

        phonePeElement.textContent =
            totalPhonePe.toFixed(2);
    }


    // Cash
    const cashElement =
        document.getElementById(
            "metric-cash"
        );

    if (cashElement) {

        cashElement.textContent =
            totalCash.toFixed(2);
    }


    // Pending
    const pendingElement =
        document.getElementById(
            "metric-pending"
        );

    if (pendingElement) {

        pendingElement.textContent =
            totalPending.toFixed(2);
    }


    // Petrol
    const petrolElement =
        document.getElementById(
            "metric-petrol"
        );

    if (petrolElement) {

        petrolElement.textContent =
            totalPetrol.toFixed(2);
    }


    // Update selected category total
    updateCategoryMetric();
}


// =====================================================
// CATEGORY METRIC
// =====================================================

function updateCategoryMetric() {

    const select =
        document.getElementById(
            "metric-category-select"
        );

    const totalElement =
        document.getElementById(
            "metric-category-total"
        );

    if (!select || !totalElement) {
        return;
    }

    const selectedCategoryId =
        select.value;

    if (!selectedCategoryId) {

        totalElement.textContent =
            "0.00";

        return;
    }

    const categoryId =
        Number(selectedCategoryId);

    let total = 0;

    currentExpenses.forEach(
        function (expense) {

            if (
                Number(expense.category_id) ===
                categoryId
            ) {

                total +=
                    Number(expense.amount) || 0;
            }
        }
    );

    totalElement.textContent =
        total.toFixed(2);
}


// =====================================================
// LOAD EXPENSES
// =====================================================

async function loadExpenses() {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/expenses/`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (response.status === 401) {

            localStorage.removeItem(AUTH_KEY);

            showLogin();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load expenses"
            );
        }


        const expenses =
            await response.json();

        currentExpenses = expenses;


        // Update all metric cards
        updateMetrics(expenses);


        // Update normal summary
        updateExpenseSummary(expenses);


        // Display expenses
        displayExpenses(expenses);


    } catch (error) {

        console.error(
            "Unable to load expenses:",
            error
        );

        const expensesList =
            document.getElementById(
                "expenses-list"
            );

        if (expensesList) {

            expensesList.innerHTML =
                "<p>Unable to load expenses.</p>";
        }
    }
}


// =====================================================
// EXPENSE SUMMARY
// =====================================================

function updateExpenseSummary(expenses) {

    let total = 0;

    expenses.forEach(
        function (expense) {

            total +=
                Number(expense.amount) || 0;
        }
    );


    const totalElement =
        document.getElementById(
            "total-expenses"
        );

    const countElement =
        document.getElementById(
            "expense-count"
        );


    if (totalElement) {

        totalElement.textContent =
            total.toFixed(2);
    }


    if (countElement) {

        countElement.textContent =
            expenses.length;
    }
}


// =====================================================
// DISPLAY EXPENSES
// =====================================================

function displayExpenses(expenses) {

    const expensesList =
        document.getElementById(
            "expenses-list"
        );

    if (!expensesList) {
        return;
    }


    // Category filter
    const filter =
        document.getElementById(
            "expense-filter-category"
        );

    let filteredExpenses = expenses;


    if (filter && filter.value) {

        const selectedCategoryId =
            Number(filter.value);

        filteredExpenses =
            expenses.filter(
                function (expense) {

                    return Number(
                        expense.category_id
                    ) === selectedCategoryId;
                }
            );
    }


    if (filteredExpenses.length === 0) {

        expensesList.innerHTML =
            "<p>No expenses found.</p>";

        return;
    }


    expensesList.innerHTML =
        filteredExpenses.map(
            function (expense) {

                return `
                    <div class="expense">

                        <strong>
                            ${expense.description}
                        </strong>

                        <p>
                            Category:
                            ${expense.category}
                        </p>

                        <p>
                            Amount:
                            ₹${Number(expense.amount).toFixed(2)}
                        </p>

                        <p>
                            Date:
                            ${expense.expense_date}
                        </p>

                        <p>
                            Vendor:
                            ${getVendorName(
                                expense.vendor_id
                            )}
                        </p>

                        <p>
                            Payment:
                            ${expense.payment_method}
                        </p>

                        <button
                            onclick="editExpense(${expense.id})"
                        >
                            Edit
                        </button>

                        <button
                            onclick="deleteExpense(${expense.id})"
                        >
                            Delete
                        </button>

                    </div>
                `;
            }
        ).join("");
}


// =====================================================
// EXPENSE CATEGORY FILTER
// =====================================================

const expenseFilterCategory =
    document.getElementById(
        "expense-filter-category"
    );

if (expenseFilterCategory) {

    expenseFilterCategory.addEventListener(
        "change",
        function () {

            displayExpenses(
                currentExpenses
            );
        }
    );
}


// =====================================================
// CATEGORY METRIC DROPDOWN
// =====================================================

const metricCategorySelect =
    document.getElementById(
        "metric-category-select"
    );

if (metricCategorySelect) {

    metricCategorySelect.addEventListener(
        "change",
        function () {

            updateCategoryMetric();
        }
    );
}


// =====================================================
// DELETE EXPENSE
// =====================================================

async function deleteExpense(expenseId) {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/expenses/${expenseId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete expense"
            );

            return;
        }


        await loadExpenses();


    } catch (error) {

        alert(
            "Unable to connect to the server"
        );
    }
}


// =====================================================
// EDIT EXPENSE ELEMENTS
// =====================================================

const editExpenseSection =
    document.getElementById(
        "edit-expense-section"
    );

const editExpenseForm =
    document.getElementById(
        "edit-expense-form"
    );

const cancelEdit =
    document.getElementById(
        "cancel-edit"
    );


// =====================================================
// EDIT EXPENSE
// =====================================================

function editExpense(expenseId) {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }

    loadExpenseForEdit(expenseId);
}


// =====================================================
// LOAD EXPENSE FOR EDIT
// =====================================================

async function loadExpenseForEdit(expenseId) {

    const token = getToken();

    try {

        const response =
            await fetch(
                `${API_BASE}/expenses/${expenseId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const expense =
            await response.json();


        if (!response.ok) {

            alert(
                expense.detail ||
                "Unable to load expense"
            );

            return;
        }


        document.getElementById(
            "edit-expense-id"
        ).value =
            expense.id;


        document.getElementById(
            "edit-expense-date"
        ).value =
            expense.expense_date;


        document.getElementById(
            "edit-expense-category"
        ).value =
            expense.category_id || "";


        document.getElementById(
            "edit-expense-description"
        ).value =
            expense.description;


        document.getElementById(
            "edit-expense-vendor"
        ).value =
            expense.vendor_id || "";


        document.getElementById(
            "edit-expense-payment-method"
        ).value =
            expense.payment_method || "Cash";


        document.getElementById(
            "edit-expense-amount"
        ).value =
            expense.amount;


        editExpenseSection.style.display =
            "block";


        editExpenseSection.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        alert(
            "Unable to connect to the server"
        );
    }
}


// =====================================================
// UPDATE EXPENSE
// =====================================================

editExpenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token = getToken();

        if (!token) {

            showLogin();
            return;
        }


        const expenseId =
            document.getElementById(
                "edit-expense-id"
            ).value;


        const categoryId =
            document.getElementById(
                "edit-expense-category"
            ).value;


        const vendorId =
            document.getElementById(
                "edit-expense-vendor"
            ).value;


        const paymentMethod =
            document.getElementById(
                "edit-expense-payment-method"
            ).value;


        const selectedCategory =
            currentCategories.find(
                function (category) {

                    return category.id ===
                        Number(categoryId);
                }
            );


        const expenseData = {

            expense_date:
                document.getElementById(
                    "edit-expense-date"
                ).value,

            category:
                selectedCategory
                    ? selectedCategory.name
                    : "",

            category_id:
                categoryId
                    ? Number(categoryId)
                    : null,

            description:
                document.getElementById(
                    "edit-expense-description"
                ).value,

            vendor_id:
                vendorId
                    ? Number(vendorId)
                    : null,

            paid_to: null,

            amount:
                Number(
                    document.getElementById(
                        "edit-expense-amount"
                    ).value
                ),

            payment_method:
                paymentMethod
        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/expenses/${expenseId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                expenseData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                document.getElementById(
                    "edit-expense-message"
                ).textContent =
                    data.detail ||
                    "Failed to update expense";

                return;
            }


            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Expense updated successfully.";


            editExpenseSection.style.display =
                "none";


            await loadExpenses();


        } catch (error) {

            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Unable to connect to the server";
        }
    }
);


// =====================================================
// CANCEL EDIT
// =====================================================

cancelEdit.addEventListener(
    "click",
    function () {

        editExpenseSection.style.display =
            "none";
    }
);


// =====================================================
// ADD EXPENSE
// =====================================================

const expenseForm =
    document.getElementById(
        "expense-form"
    );

const expenseMessage =
    document.getElementById(
        "expense-message"
    );


expenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token = getToken();

        if (!token) {

            showLogin();
            return;
        }


        const categoryId =
            document.getElementById(
                "expense-category"
            ).value;


        const vendorId =
            document.getElementById(
                "expense-vendor"
            ).value;


        const paymentMethod =
            document.getElementById(
                "expense-payment-method"
            ).value;


        const selectedCategory =
            currentCategories.find(
                function (category) {

                    return category.id ===
                        Number(categoryId);
                }
            );


        if (!selectedCategory) {

            expenseMessage.textContent =
                "Please select a category.";

            return;
        }


        const expenseData = {

            expense_date:
                document.getElementById(
                    "expense-date"
                ).value,

            category:
                selectedCategory.name,

            category_id:
                Number(categoryId),

            description:
                document.getElementById(
                    "expense-description"
                ).value,

            vendor_id:
                vendorId
                    ? Number(vendorId)
                    : null,

            paid_to: null,

            amount:
                Number(
                    document.getElementById(
                        "expense-amount"
                    ).value
                ),

            payment_method:
                paymentMethod
        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/expenses/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                expenseData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                expenseMessage.textContent =
                    data.detail ||
                    "Failed to add expense";

                return;
            }


            expenseMessage.textContent =
                "Expense added successfully.";


            expenseForm.reset();


            await loadExpenses();


        } catch (error) {

            expenseMessage.textContent =
                "Unable to connect to the server";
        }
    }
);


// =====================================================
// ADD VENDOR
// =====================================================

const vendorForm =
    document.getElementById(
        "vendor-form"
    );

const vendorMessage =
    document.getElementById(
        "vendor-message"
    );


vendorForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token = getToken();

        if (!token) {

            showLogin();
            return;
        }


        const vendorData = {

            name:
                document.getElementById(
                    "vendor-name"
                ).value,

            phone:
                document.getElementById(
                    "vendor-phone"
                ).value || null,

            description:
                document.getElementById(
                    "vendor-description"
                ).value || null
        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/vendors/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                vendorData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                vendorMessage.textContent =
                    data.detail ||
                    "Failed to add vendor";

                return;
            }


            vendorMessage.textContent =
                "Vendor added successfully.";


            vendorForm.reset();


            await loadVendors();


        } catch (error) {

            vendorMessage.textContent =
                "Unable to connect to the server";
        }
    }
);


// =====================================================
// LOAD VENDORS
// =====================================================

async function loadVendors() {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/vendors/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(AUTH_KEY);

            showLogin();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load vendors"
            );
        }


        const vendors =
            await response.json();


        currentVendors =
            vendors;


        const vendorsList =
            document.getElementById(
                "vendors-list"
            );


        const vendorSelect =
            document.getElementById(
                "expense-vendor"
            );


        const editVendorSelect =
            document.getElementById(
                "edit-expense-vendor"
            );


        vendorSelect.innerHTML =
            `<option value="">No Vendor</option>`;


        editVendorSelect.innerHTML =
            `<option value="">No Vendor</option>`;


        vendors.forEach(
            function (vendor) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    vendor.id;

                option.textContent =
                    vendor.name;

                vendorSelect.appendChild(
                    option
                );


                const editOption =
                    document.createElement(
                        "option"
                    );

                editOption.value =
                    vendor.id;

                editOption.textContent =
                    vendor.name;

                editVendorSelect.appendChild(
                    editOption
                );
            }
        );


        if (vendors.length === 0) {

            vendorsList.innerHTML =
                "<p>No vendors found.</p>";

            return;
        }


        vendorsList.innerHTML =
            vendors.map(
                function (vendor) {

                    return `
                        <div class="expense">

                            <strong>
                                ${vendor.name}
                            </strong>

                            <p>
                                Phone:
                                ${vendor.phone ||
                                    "Not specified"}
                            </p>

                            <p>
                                ${vendor.description || ""}
                            </p>

                            <button
                                onclick="deleteVendor(${vendor.id})"
                            >
                                Delete
                            </button>

                        </div>
                    `;
                }
            ).join("");


    } catch (error) {

        document.getElementById(
            "vendors-list"
        ).innerHTML =
            "<p>Unable to load vendors.</p>";
    }
}


// =====================================================
// DELETE VENDOR
// =====================================================

async function deleteVendor(vendorId) {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this vendor?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/vendors/${vendorId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete vendor"
            );

            return;
        }


        await loadVendors();


    } catch (error) {

        alert(
            "Unable to connect to the server"
        );
    }
}


// =====================================================
// ADD CATEGORY
// =====================================================

const categoryForm =
    document.getElementById(
        "category-form"
    );

const categoryMessage =
    document.getElementById(
        "category-message"
    );


categoryForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token = getToken();

        if (!token) {

            showLogin();
            return;
        }


        const categoryName =
            document.getElementById(
                "category-name"
            ).value.trim();


        if (!categoryName) {

            categoryMessage.textContent =
                "Please enter a category name.";

            return;
        }


        const categoryData = {

            name: categoryName
        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/categories/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                categoryData
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                categoryMessage.textContent =
                    data.detail ||
                    "Failed to add category";

                return;
            }


            categoryMessage.textContent =
                "Category added successfully.";


            categoryForm.reset();


            await loadCategories();


        } catch (error) {

            categoryMessage.textContent =
                "Unable to connect to the server";
        }
    }
);


// =====================================================
// LOAD CATEGORIES
// =====================================================

async function loadCategories() {

    const token = getToken();

    if (!token) {

        showLogin();
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/categories/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(AUTH_KEY);

            showLogin();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load categories"
            );
        }


        const categories =
            await response.json();


        currentCategories =
            categories;


        // ---------------------------------------------
        // ADD EXPENSE CATEGORY
        // ---------------------------------------------

        const categorySelect =
            document.getElementById(
                "expense-category"
            );


        categorySelect.innerHTML =
            `<option value="">
                Select Category
            </option>`;


        categories.forEach(
            function (category) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category.id;

                option.textContent =
                    category.name;

                categorySelect.appendChild(
                    option
                );
            }
        );


        // ---------------------------------------------
        // EDIT EXPENSE CATEGORY
        // ---------------------------------------------

        const editCategorySelect =
            document.getElementById(
                "edit-expense-category"
            );


        editCategorySelect.innerHTML =
            `<option value="">
                Select Category
            </option>`;


        categories.forEach(
            function (category) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category.id;

                option.textContent =
                    category.name;

                editCategorySelect.appendChild(
                    option
                );
            }
        );


        // ---------------------------------------------
        // METRIC CATEGORY DROPDOWN
        // ---------------------------------------------

        const metricCategorySelect =
            document.getElementById(
                "metric-category-select"
            );


        const previousMetricValue =
            metricCategorySelect.value;


        metricCategorySelect.innerHTML =
            `<option value="">
                Select Category
            </option>`;


        categories.forEach(
            function (category) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category.id;

                option.textContent =
                    category.name;

                metricCategorySelect.appendChild(
                    option
                );
            }
        );


        // Keep previous selection if possible
        if (
            previousMetricValue &&
            categories.some(
                function (category) {
                    return String(category.id) ===
                        String(previousMetricValue);
                }
            )
        ) {

            metricCategorySelect.value =
                previousMetricValue;
        }


        // ---------------------------------------------
        // EXPENSE FILTER CATEGORY
        // ---------------------------------------------

        const expenseFilterCategory =
            document.getElementById(
                "expense-filter-category"
            );


        const previousFilterValue =
            expenseFilterCategory.value;


        expenseFilterCategory.innerHTML =
            `<option value="">
                All Categories
            </option>`;


        categories.forEach(
            function (category) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category.id;

                option.textContent =
                    category.name;

                expenseFilterCategory.appendChild(
                    option
                );
            }
        );


        if (
            previousFilterValue &&
            categories.some(
                function (category) {
                    return String(category.id) ===
                        String(previousFilterValue);
                }
            )
        ) {

            expenseFilterCategory.value =
                previousFilterValue;
        }


        // Recalculate category metric
        updateCategoryMetric();


    } catch (error) {

        console.error(
            "Unable to load categories:",
            error
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            AUTH_KEY
        );

        showLogin();
    }
);


// =====================================================
// INITIAL LOGIN CHECK
// =====================================================

if (getToken()) {

    showDashboard();

} else {

    showLogin();
}