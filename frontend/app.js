const API_BASE = "http://127.0.0.1:8000";

const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const AUTH_KEY = "buildledger_token";


loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const formData = new URLSearchParams();

    formData.append("username", email);
    formData.append("password", password);

    try {
        const response = await fetch(
            `${API_BASE}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
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

        showDashboard();

    } catch (error) {
        loginMessage.textContent =
            "Unable to connect to the server";
    }
});


function showDashboard() {
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    loadExpenses();
    loadVendors();
}


function showLogin() {
    loginSection.style.display = "block";
    dashboard.style.display = "none";
}


async function loadExpenses() {
    const token = localStorage.getItem(AUTH_KEY);

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
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem(AUTH_KEY);
            showLogin();
            return;
        }

        const expenses = await response.json();

        const expensesList =
            document.getElementById("expenses-list");

        if (expenses.length === 0) {
            expensesList.innerHTML =
                "<p>No expenses found.</p>";
            return;
        }

        expensesList.innerHTML = expenses.map(function (expense) {
            return `
                <div class="expense">
                    <strong>${expense.description}</strong>
                    <p>Category: ${expense.category}</p>
                    <p>Amount: ₹${expense.amount}</p>
                    <p>Date: ${expense.expense_date}</p>
                    <p>Vendor ID: ${expense.vendor_id || "No Vendor"}</p>
                </div>
            `;
        }).join("");

    } catch (error) {
        document.getElementById("expenses-list").innerHTML =
            "<p>Unable to load expenses.</p>";
    }
}


logoutButton.addEventListener("click", function () {
    localStorage.removeItem(AUTH_KEY);

    showLogin();
});


if (localStorage.getItem(AUTH_KEY)) {
    showDashboard();
} else {
    showLogin();
}


const expenseForm = document.getElementById("expense-form");
const expenseMessage = document.getElementById("expense-message");


expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

const vendorId =
    document.getElementById("expense-vendor").value;

const expenseData = {
    expense_date: document.getElementById("expense-date").value,
    category: document.getElementById("expense-category").value,
    description: document.getElementById("expense-description").value,
    vendor_id: vendorId ? Number(vendorId) : null,
    paid_to: null,
    amount: Number(
        document.getElementById("expense-amount").value
    )
};

    try {
        const response = await fetch(
            `${API_BASE}/expenses/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(expenseData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            expenseMessage.textContent =
                data.detail || "Failed to add expense";

            return;
        }

        expenseMessage.textContent =
            "Expense added successfully.";

        expenseForm.reset();

        loadExpenses();

    } catch (error) {
        expenseMessage.textContent =
            "Unable to connect to the server";
    }
});


const vendorForm = document.getElementById("vendor-form");
const vendorMessage = document.getElementById("vendor-message");


vendorForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    const vendorData = {
        name: document.getElementById("vendor-name").value,
        phone: document.getElementById("vendor-phone").value || null,
        description:
            document.getElementById("vendor-description").value || null
    };

    try {
        const response = await fetch(
            `${API_BASE}/vendors/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(vendorData)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            vendorMessage.textContent =
                data.detail || "Failed to add vendor";

            return;
        }

        vendorMessage.textContent =
            "Vendor added successfully.";

        vendorForm.reset();

    } catch (error) {
        vendorMessage.textContent =
            "Unable to connect to the server";
    }
});


async function loadVendors() {
    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/vendors/`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem(AUTH_KEY);
            showLogin();
            return;
        }

        const vendors = await response.json();

        const vendorsList =
            document.getElementById("vendors-list");

        const vendorSelect =
            document.getElementById("expense-vendor");

        vendorSelect.innerHTML =
            '<option value="">No Vendor</option>';

        vendors.forEach(function (vendor) {
            const option = document.createElement("option");

            option.value = vendor.id;
            option.textContent = vendor.name;

            vendorSelect.appendChild(option);
        });

        if (vendors.length === 0) {
            vendorsList.innerHTML =
                "<p>No vendors found.</p>";
            return;
        }

        vendorsList.innerHTML = vendors.map(function (vendor) {
            return `
                <div class="expense">
                    <strong>${vendor.name}</strong>
                    <p>Phone: ${vendor.phone || "Not specified"}</p>
                    <p>${vendor.description || ""}</p>
                </div>
            `;
        }).join("");

    } catch (error) {
        document.getElementById("vendors-list").innerHTML =
            "<p>Unable to load vendors.</p>";
    }
}