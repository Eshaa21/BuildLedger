const API_BASE = "http://127.0.0.1:8000";
let currentVendors = [];

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


async function showDashboard() {
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    await loadVendors();
    loadExpenses();
}


function showLogin() {
    loginSection.style.display = "block";
    dashboard.style.display = "none";
}

function getVendorName(vendorId) {
    if (!vendorId) {
        return "No Vendor";
    }

    const vendor = currentVendors.find(function (vendor) {
        return vendor.id === vendorId;
    });

    return vendor ? vendor.name : "Unknown Vendor";
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

        const total = expenses.reduce(function (sum, expense) {
            return sum + Number(expense.amount);
        }, 0);

        document.getElementById("total-expenses").textContent =
            total.toFixed(2);

        document.getElementById("expense-count").textContent =
            expenses.length;

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
                    <p>Vendor: ${getVendorName(expense.vendor_id)}</p>

                    <button onclick="editExpense(${expense.id})">
                        Edit
                    </button>

                    <button onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>
                </div>
            `;
        }).join("");

    } catch (error) {
        document.getElementById("expenses-list").innerHTML =
            "<p>Unable to load expenses.</p>";
    }
}

async function deleteExpense(expenseId) {
    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    const confirmed = confirm(
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
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Failed to delete expense");
            return;
        }

        loadExpenses();

    } catch (error) {
        alert("Unable to connect to the server");
    }
}

const editExpenseSection =
    document.getElementById("edit-expense-section");

const editExpenseForm =
    document.getElementById("edit-expense-form");

const cancelEdit =
    document.getElementById("cancel-edit");


function editExpense(expenseId) {
    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    loadExpenseForEdit(expenseId);
}


async function loadExpenseForEdit(expenseId) {
    const token = localStorage.getItem(AUTH_KEY);

    try {
        const response = await fetch(
            `${API_BASE}/expenses/${expenseId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const expense = await response.json();

        if (!response.ok) {
            alert(
                expense.detail || "Unable to load expense"
            );
            return;
        }

        document.getElementById("edit-expense-id").value =
            expense.id;

        document.getElementById("edit-expense-date").value =
            expense.expense_date;

        document.getElementById("edit-expense-category").value =
            expense.category;

        document.getElementById("edit-expense-description").value =
            expense.description;

        document.getElementById("edit-expense-amount").value =
            expense.amount;

        document.getElementById("edit-expense-vendor").value =
            expense.vendor_id || "";

        editExpenseSection.style.display = "block";

        editExpenseSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        alert("Unable to connect to the server");
    }
}

editExpenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const token = localStorage.getItem(AUTH_KEY);

        const expenseId =
            document.getElementById("edit-expense-id").value;

        const vendorId =
            document.getElementById("edit-expense-vendor").value;

        const expenseData = {
            expense_date:
                document.getElementById("edit-expense-date").value,

            category:
                document.getElementById("edit-expense-category").value,

            description:
                document.getElementById("edit-expense-description").value,

            vendor_id:
                vendorId ? Number(vendorId) : null,

            paid_to: null,

            amount:
                Number(
                    document.getElementById("edit-expense-amount").value
                )
        };

        try {
            const response = await fetch(
                `${API_BASE}/expenses/${expenseId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(expenseData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                document.getElementById(
                    "edit-expense-message"
                ).textContent =
                    data.detail || "Failed to update expense";

                return;
            }

            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Expense updated successfully.";

            editExpenseSection.style.display = "none";

            loadExpenses();

        } catch (error) {
            document.getElementById(
                "edit-expense-message"
            ).textContent =
                "Unable to connect to the server";
        }
    }
);

cancelEdit.addEventListener("click", function () {
    editExpenseSection.style.display = "none";
});

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
        currentVendors = vendors;

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

                    <button onclick="deleteVendor(${vendor.id})">
                        Delete
                    </button>
                </div>
            `;
        }).join("");

    } catch (error) {
        document.getElementById("vendors-list").innerHTML =
            "<p>Unable to load vendors.</p>";
    }
}

async function deleteVendor(vendorId) {
    const token = localStorage.getItem(AUTH_KEY);

    if (!token) {
        showLogin();
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this vendor?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/vendors/${vendorId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(
                data.detail || "Failed to delete vendor"
            );
            return;
        }

        loadVendors();

    } catch (error) {
        alert("Unable to connect to the server");
    }
}