document.addEventListener('DOMContentLoaded', () => {
    // Select Elements
    const incomeInputs = document.querySelectorAll('.income-input');
    const expenseInputs = document.querySelectorAll('.expense-input');

    // Display Elements (Monthly)
    const monthlyIncomeDisplay = document.getElementById('monthly-income-display');
    const monthlyExpenseDisplay = document.getElementById('monthly-expense-display');
    const monthlySavingsDisplay = document.getElementById('monthly-savings-display');
    const savingsRateDisplay = document.getElementById('savings-rate-display');

    // Display Elements (Annual)
    const annualIncomeDisplay = document.getElementById('annual-income-display');
    const annualExpenseDisplay = document.getElementById('annual-expense-display');
    const annualSavingsDisplay = document.getElementById('annual-savings-display');

    // Chart Instance
    let budgetChartInstance = null;

    // Color Variables mapped from CSS
    const style = getComputedStyle(document.body);
    const colorIncome = style.getPropertyValue('--color-income').trim() || '#10b981';
    const colorExpense = style.getPropertyValue('--color-expense').trim() || '#ef4444';
    const colorSavings = style.getPropertyValue('--color-savings').trim() || '#6366f1';

    // Main Calculation Function
    function calculate() {
        let totalIncome = 0;
        let totalExpense = 0;

        // Expense breakdown for chart
        const expenseCategories = {
            'Housing': 0,
            'Utilities': 0,
            'Food': 0,
            'Transport': 0,
            'Insurance': 0,
            'Personal': 0,
            'Debt': 0,
            'Other': 0,
            'Tithe': 0,
            'Missions': 0
        };

        // Sum Income
        incomeInputs.forEach(input => {
            const val = parseFloat(input.value) || 0;
            totalIncome += val;
        });

        // Sum Expenses & Map Categories
        expenseInputs.forEach(input => {
            const val = parseFloat(input.value) || 0;
            totalExpense += val;

            // Determine category for chart
            if (input.classList.contains('category-housing')) expenseCategories['Housing'] += val;
            else if (input.classList.contains('category-utilities')) expenseCategories['Utilities'] += val;
            else if (input.classList.contains('category-food')) expenseCategories['Food'] += val;
            else if (input.classList.contains('category-transport')) expenseCategories['Transport'] += val;
            else if (input.classList.contains('category-insurance')) expenseCategories['Insurance'] += val;
            else if (input.classList.contains('category-personal')) expenseCategories['Personal'] += val;
            else if (input.classList.contains('category-debt')) expenseCategories['Debt'] += val;
            else if (input.classList.contains('category-other')) expenseCategories['Other'] += val;
            else if (input.classList.contains('category-tithe')) expenseCategories['Tithe'] += val;
            else if (input.classList.contains('category-missions')) expenseCategories['Missions'] += val;
        });

        const netSavings = totalIncome - totalExpense;
        let savingsRate = 0;
        if (totalIncome > 0) {
            savingsRate = Math.max(0, (netSavings / totalIncome) * 100);
        }

        // Annual Extrapolations
        const annualIncome = totalIncome * 12;
        const annualExpense = totalExpense * 12;
        const annualSavings = netSavings * 12;

        // Update UI Text
        monthlyIncomeDisplay.textContent = formatCurrency(totalIncome);
        monthlyExpenseDisplay.textContent = formatCurrency(totalExpense);

        monthlySavingsDisplay.textContent = formatCurrency(netSavings);

        // Handle negative savings visually
        if (netSavings < 0) {
            monthlySavingsDisplay.classList.remove('highlight-savings');
            monthlySavingsDisplay.classList.add('highlight-debt');
        } else {
            monthlySavingsDisplay.classList.remove('highlight-debt');
            monthlySavingsDisplay.classList.add('highlight-savings');
        }

        savingsRateDisplay.textContent = `${savingsRate.toFixed(1)}%`;

        annualIncomeDisplay.textContent = formatCurrency(annualIncome);
        annualExpenseDisplay.textContent = formatCurrency(annualExpense);
        annualSavingsDisplay.textContent = formatCurrency(annualSavings);

        if (annualSavings < 0) {
            annualSavingsDisplay.classList.remove('text-savings');
            annualSavingsDisplay.classList.add('text-expense');
        } else {
            annualSavingsDisplay.classList.remove('text-expense');
            annualSavingsDisplay.classList.add('text-savings');
        }

        // Update Chart
        updateChart(expenseCategories, netSavings, totalExpense, totalIncome);
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    }

    function initChart() {
        const ctx = document.getElementById('budgetChart').getContext('2d');

        // Chart defaults for dark mode
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Outfit', sans-serif";

        budgetChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Input Data to Start'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255, 255, 255, 0.05)'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { size: 13, family: "'Outfit', sans-serif" },
                        bodyFont: { size: 14, family: "'Outfit', sans-serif", weight: 'bold' },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateChart(categories, netSavings, totalExpense, totalIncome) {
        if (!budgetChartInstance) return;

        // Colors for various generic categories (can be expanded)
        const categoryColors = {
            'Housing': '#3b82f6',     // Blue
            'Utilities': '#0ea5e9',   // Sky
            'Food': '#f59e0b',        // Amber
            'Transport': '#8b5cf6',   // Violet
            'Insurance': '#14b8a6',   // Teal
            'Personal': '#ec4899',    // Pink
            'Debt': '#ef4444',        // Rose
            'Other': '#64748b',       // Slate
            'Tithe': '#d97706',       // Gold
            'Missions': '#22c55e',    // Green
            'Savings': colorSavings   // Indigo
        };

        let labels = [];
        let data = [];
        let backgroundColors = [];

        // If no income and no expense, show empty state
        if (totalIncome === 0 && totalExpense === 0) {
            budgetChartInstance.data.labels = ['Input Data to Start'];
            budgetChartInstance.data.datasets[0].data = [1];
            budgetChartInstance.data.datasets[0].backgroundColor = ['rgba(255, 255, 255, 0.05)'];
            budgetChartInstance.update();
            return;
        }

        // Aggregate actual expenses > 0
        for (const [cat, val] of Object.entries(categories)) {
            if (val > 0) {
                labels.push(cat);
                data.push(val);
                backgroundColors.push(categoryColors[cat]);
            }
        }

        // Add savings if positive
        if (netSavings > 0) {
            labels.push('Savings');
            data.push(netSavings);
            backgroundColors.push(categoryColors['Savings']);
        }

        budgetChartInstance.data.labels = labels;
        budgetChartInstance.data.datasets[0].data = data;
        budgetChartInstance.data.datasets[0].backgroundColor = backgroundColors;

        // Add subtle border between segments
        budgetChartInstance.data.datasets[0].borderColor = '#020617';
        budgetChartInstance.data.datasets[0].borderWidth = 2;

        budgetChartInstance.update();
    }

    // Attach Listeners
    const allInputs = document.querySelectorAll('.calc-input');
    allInputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initialize
    initChart();
    calculate();
});
