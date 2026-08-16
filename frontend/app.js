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
                    <p>Paid to: ${expense.paid_to || "Not specified"}</p>
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