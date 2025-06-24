class FinanceTracker {
  constructor() {
    this.transactions = [];
    this.chart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCategories();
    this.setDefaultDate();
    this.updateDisplay();
  }

  setupEventListeners() {
    document
      .getElementById("transactionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.addTransaction();
      });

    document.getElementById("type").addEventListener("change", (e) => {
      this.updateCategories(e.target.value);
    });
  }

  setupCategories() {
    this.categories = {
      income: [
        "Salary",
        "Freelance",
        "Investment",
        "Business",
        "Gift",
        "Other",
      ],
      expense: [
        "Food",
        "Transportation",
        "Entertainment",
        "Bills",
        "Shopping",
        "Healthcare",
        "Education",
        "Other",
      ],
    };
  }

  setDefaultDate() {
    document.getElementById("date").value = new Date()
      .toISOString()
      .split("T")[0];
  }

  updateCategories(type) {
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    if (type && this.categories[type]) {
      this.categories[type].forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
  }

  addTransaction() {
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const transaction = {
      id: Date.now(),
      description,
      amount,
      type,
      category,
      date: new Date(date),
    };

    this.transactions.unshift(transaction);
    this.updateDisplay();
    this.clearForm();
  }

  clearForm() {
    document.getElementById("transactionForm").reset();
    document.getElementById("category").innerHTML =
      '<option value="">Select Category</option>';
    this.setDefaultDate();
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.updateDisplay();
  }

  updateDisplay() {
    this.updateStats();
    this.updateTransactionsList();
    this.updateChart();
  }

  updateStats() {
    const totalIncome = this.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = this.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    document.getElementById(
      "totalIncome"
    ).textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById(
      "totalExpenses"
    ).textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById("netBalance").textContent = `₹${netBalance.toFixed(
      2
    )}`;
  }

  updateTransactionsList() {
    const listContainer = document.getElementById("transactionsList");

    if (this.transactions.length === 0) {
      listContainer.innerHTML =
        '<div class="no-data">No transactions yet. Add your first transaction above!</div>';
      return;
    }

    listContainer.innerHTML = this.transactions
      .map(
        (transaction) => `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <div class="transaction-description">${
                              transaction.description
                            }</div>
                            <div class="transaction-category">${
                              transaction.category
                            } • ${transaction.date.toLocaleDateString()}</div>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="transaction-amount ${transaction.type}">
                                ${
                                  transaction.type === "income" ? "+" : "-"
                                }$${transaction.amount.toFixed(2)}
                            </div>
                            <button class="delete-btn" onclick="tracker.deleteTransaction(${
                              transaction.id
                            })">
                                🗑️
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");
  }

  updateChart() {
    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (this.chart) {
      this.chart.destroy();
    }

    const expenses = this.transactions.filter((t) => t.type === "expense");

    if (expenses.length === 0) {
      // Show empty state
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(
        "No expense data to display",
        ctx.canvas.width / 2,
        ctx.canvas.height / 2
      );
      return;
    }

    const categoryTotals = {};
    expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: $${context.raw.toFixed(
                  2
                )} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          duration: 1000,
        },
      },
    });
  }
}

// Initialize the app
const tracker = new FinanceTracker();
