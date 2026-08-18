const API_BASE = "http://127.0.0.1:8000";

let currentVendors = [];
let currentCategories = [];

const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const AUTH_KEY = "buildledger_token";


/* =========================
   LOGIN
========================= */

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

        await showDashboard();

    } catch (error) {

        loginMessage.textContent =
            "Unable to connect to the server";
    }
});


/* =========================
   DASHBOARD
========================= */

async function showDashboard() {

    loginSection.style.display = "none";
    dashboard.style.display = "block";

    await loadVendors();
    await loadCategories();
    await loadExpenses();
}


function showLogin() {

    loginSection.style.display = "block";
    dashboard.style.display = "none";
}


/* =========================
   VENDOR NAME
========================= */

function getVendorName(vendorId) {

    if (!vendorId) {
        return "No Vendor";
    }

    const vendor = currentVendors.find(
        function (vendor) {
            return vendor.id === Number(vendorId);
        }
    );

    return vendor
        ? vendor.name
        : "Unknown Vendor";
}


/* =========================
   CATEGORY NAME
========================= */

function getCategoryName(categoryId, fallbackName) {

    if (!categoryId) {
        return fallbackName || "No Category";
    }

    const category = currentCategories.find(
        function (item) {
            return item.id === Number(categoryId);
        }
    );

    return category
        ? category.name
        : (fallbackName || "Unknown Category");
}


/* =========================
   LOAD EXPENSES
========================= */

async function loadExpenses() {

    const token =
        localStorage.getItem(AUTH_KEY);

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

            document.getElementById(
                "expenses-list"
            ).innerHTML =
                "<p>Unable to load expenses.</p>";

            return;
        }

        const expenses =
            await response.json();


        /* Calculate total */

        const total =
            expenses.reduce(
                function (sum, expense) {

                    return sum +
                        Number(expense.amount);

                },
                0
            );


        document.getElementById(
            "total-expenses"
        ).textContent =
            total.toFixed(2);


        document.getElementById(
            "expense-count"
        ).textContent =
            expenses.length;


        const expensesList =
            document.getElementById(
                "expenses-list"
            );


        if (expenses.length === 0) {

            expensesList.innerHTML =
                "<p>No expenses found.</p>";

            return;
        }


        expensesList.innerHTML =
            expenses.map(
                function (expense) {

                    const categoryName =
                        getCategoryName(
                            expense.category_id,
                            expense.category
                        );

                    const vendorName =
                        getVendorName(
                            expense.vendor_id
                        );

                    const paymentMethod =
                        expense.payment_method ||
                        "Cash";


                    return `
                        <div class="expense">

                            <strong>
                                ${expense.description}
                            </strong>

                            <p>
                                Category:
                                ${categoryName}
                            </p>

                            <p>
                                Amount:
                                ₹${Number(
                                    expense.amount
                                ).toFixed(2)}
                            </p>

                            <p>
                                Date:
                                ${expense.expense_date}
                            </p>

                            <p>
                                Vendor:
                                ${vendorName}
                            </p>

                            <p>
                                Payment:
                                ${paymentMethod}
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


    } catch (error) {

        console.error(
            "Unable to load expenses:",
            error
        );

        document.getElementById(
            "expenses-list"
        ).innerHTML =
            "<p>Unable to load expenses.</p>";
    }
}


/* =========================
   DELETE EXPENSE
========================= */

async function deleteExpense(expenseId) {

    const token =
        localStorage.getItem(AUTH_KEY);

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

        const response = await fetch(
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


/* =========================
   EDIT EXPENSE ELEMENTS
========================= */

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


/* =========================
   EDIT EXPENSE
========================= */

function editExpense(expenseId) {

    const token =
        localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    loadExpenseForEdit(expenseId);
}


/* =========================
   LOAD EXPENSE FOR EDIT
========================= */

async function loadExpenseForEdit(expenseId) {

    const token =
        localStorage.getItem(AUTH_KEY);

    try {

        const response = await fetch(
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


        /*
         * Select category using category_id
         */

        document.getElementById(
            "edit-expense-category"
        ).value =
            expense.category_id || "";


        document.getElementById(
            "edit-expense-description"
        ).value =
            expense.description;


        document.getElementById(
            "edit-expense-amount"
        ).value =
            expense.amount;


        document.getElementById(
            "edit-expense-vendor"
        ).value =
            expense.vendor_id || "";


        /*
         * Select payment method
         */

        const editPaymentMethod =
            document.getElementById(
                "edit-expense-payment-method"
            );

        if (editPaymentMethod) {

            editPaymentMethod.value =
                expense.payment_method || "Cash";
        }


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


/* =========================
   UPDATE EXPENSE
========================= */

editExpenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token =
            localStorage.getItem(AUTH_KEY);


        const expenseId =
            document.getElementById(
                "edit-expense-id"
            ).value;


        const vendorId =
            document.getElementById(
                "edit-expense-vendor"
            ).value;


        const categoryId =
            document.getElementById(
                "edit-expense-category"
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


        /*
         * Category must come from the
         * selected category.
         */

        if (!categoryId || !selectedCategory) {

            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Please select a valid category.";

            return;
        }


        /*
         * Payment method must be selected.
         */

        if (!paymentMethod) {

            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Please select a payment method.";

            return;
        }


        const expenseData = {

            expense_date:
                document.getElementById(
                    "edit-expense-date"
                ).value,


            category:
                selectedCategory.name,


            category_id:
                Number(categoryId),


            description:
                document.getElementById(
                    "edit-expense-description"
                ).value,


            vendor_id:
                vendorId
                    ? Number(vendorId)
                    : null,


            paid_to:
                null,


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


/* =========================
   CANCEL EDIT
========================= */

cancelEdit.addEventListener(
    "click",
    function () {

        editExpenseSection.style.display =
            "none";
    }
);


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(AUTH_KEY);

        showLogin();
    }
);


/* =========================
   ADD EXPENSE ELEMENTS
========================= */

const expenseForm =
    document.getElementById(
        "expense-form"
    );

const expenseMessage =
    document.getElementById(
        "expense-message"
    );


/* =========================
   ADD EXPENSE
========================= */

expenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token =
            localStorage.getItem(AUTH_KEY);

        if (!token) {
            showLogin();
            return;
        }


        const vendorId =
            document.getElementById(
                "expense-vendor"
            ).value;


        const categoryId =
            document.getElementById(
                "expense-category"
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


        /*
         * Category validation
         */

        if (!categoryId || !selectedCategory) {

            expenseMessage.textContent =
                "Please select a valid category.";

            return;
        }


        /*
         * Payment method validation
         */

        if (!paymentMethod) {

            expenseMessage.textContent =
                "Please select a payment method.";

            return;
        }


        const amount =
            Number(
                document.getElementById(
                    "expense-amount"
                ).value
            );


        if (amount <= 0) {

            expenseMessage.textContent =
                "Amount must be greater than 0.";

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


            paid_to:
                null,


            amount:
                amount,


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


            /*
             * Restore default option
             */

            document.getElementById(
                "expense-category"
            ).value = "";


            document.getElementById(
                "expense-payment-method"
            ).value = "";


            await loadExpenses();


        } catch (error) {

            expenseMessage.textContent =
                "Unable to connect to the server";
        }
    }
);


/* =========================
   VENDOR FORM
========================= */

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

        const token =
            localStorage.getItem(AUTH_KEY);

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


/* =========================
   LOAD CATEGORIES
========================= */

async function loadCategories() {

    const token =
        localStorage.getItem(AUTH_KEY);

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

            console.error(
                "Failed to load categories"
            );

            return;
        }


        const categories =
            await response.json();


        currentCategories =
            categories;


        const categorySelect =
            document.getElementById(
                "expense-category"
            );


        const editCategorySelect =
            document.getElementById(
                "edit-expense-category"
            );


        categorySelect.innerHTML =
            '<option value="">Select Category</option>';


        editCategorySelect.innerHTML =
            '<option value="">Select Category</option>';


        categories.forEach(
            function (category) {

                /*
                 * Add category to Add Expense
                 */

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


                /*
                 * Add category to Edit Expense
                 */

                const editOption =
                    document.createElement(
                        "option"
                    );

                editOption.value =
                    category.id;

                editOption.textContent =
                    category.name;

                editCategorySelect.appendChild(
                    editOption
                );
            }
        );


    } catch (error) {

        console.error(
            "Unable to load categories:",
            error
        );
    }
}


/* =========================
   LOAD VENDORS
========================= */

async function loadVendors() {

    const token =
        localStorage.getItem(AUTH_KEY);

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

            console.error(
                "Failed to load vendors"
            );

            return;
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
            '<option value="">No Vendor</option>';


        editVendorSelect.innerHTML =
            '<option value="">No Vendor</option>';


        vendors.forEach(
            function (vendor) {

                /*
                 * Add vendor to Add Expense
                 */

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


                /*
                 * Add vendor to Edit Expense
                 */

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
                                ${vendor.description ||
                                    ""}
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

        console.error(
            "Unable to load vendors:",
            error
        );

        document.getElementById(
            "vendors-list"
        ).innerHTML =
            "<p>Unable to load vendors.</p>";
    }
}


/* =========================
   DELETE VENDOR
========================= */

async function deleteVendor(vendorId) {

    const token =
        localStorage.getItem(AUTH_KEY);

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


        /*
         * Refresh expenses because
         * vendor information may have changed.
         */

        await loadExpenses();


    } catch (error) {

        alert(
            "Unable to connect to the server"
        );
    }
}


/* =========================
   INITIAL LOGIN CHECK
========================= */

if (localStorage.getItem(AUTH_KEY)) {

    showDashboard();

} else {

    showLogin();
}