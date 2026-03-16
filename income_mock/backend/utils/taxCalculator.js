function calculateTax(income) {

    let tax = 0;

    if (income <= 250000) {
        tax = 0;
    }

    else if (income <= 500000) {
        tax = (income - 250000) * 0.05;
    }

    else if (income <= 1000000) {
        tax = 12500 + (income - 500000) * 0.20;
    }

    else {
        tax = 112500 + (income - 1000000) * 0.30;
    }

    return tax;
}

module.exports = calculateTax;