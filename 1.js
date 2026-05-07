let productListArray = [];

function calculateInsulinData() {
    const carbCoefficientStr = document.getElementById('carb_coefficient').value.trim();
    const carbohydratesStr = document.getElementById('carbohydrates').value.trim();
    const productGramsStr = document.getElementById('product_grams').value.trim();
    const proteinsStr = document.getElementById('proteins').value.trim();
    const fatsStr = document.getElementById('fats').value.trim();

    if (!carbCoefficientStr || !carbohydratesStr || !productGramsStr || !proteinsStr || !fatsStr) {
        showError("Пожалуйста, заполните все поля для расчёта.");
        return null;
    }

    try {
        const carbCoefficients = carbCoefficientStr.split(',').map(s => parseFloat(s.trim()));
        const carbohydrates = carbohydratesStr.split(',').map(s => parseFloat(s.trim()));
        const proteins = proteinsStr.split(',').map(s => parseFloat(s.trim()));
        const fats = fatsStr.split(',').map(s => parseFloat(s.trim()));
        const productGrams = parseFloat(productGramsStr);

        const isAnyInputNaN = isNaN(productGrams) || carbCoefficients.some(isNaN) || carbohydrates.some(isNaN) || proteins.some(isNaN) || fats.some(isNaN);

        if (isAnyInputNaN) {
            showError("Все поля должны содержать корректные числовые значения. Используйте точку или запятую как десятичный разделитель.");
            return null;
        }

        const isAnyInputNegative = productGrams < 0 || carbCoefficients.some(val => val < 0) || carbohydrates.some(val => val < 0) || proteins.some(val => val < 0) || fats.some(val => val < 0);
        if (isAnyInputNegative) {
            showError("Значения не могут быть отрицательными.");
            return null;
        }

        const arraysLengths = [carbohydrates.length, proteins.length, fats.length, carbCoefficients.length];
        const firstLength = arraysLengths[0];
        const allLengthsMatch = arraysLengths.every(len => len === firstLength);
        if (!allLengthsMatch) {
            showError("Число элементов в полях 'Углеводный коэффициент', 'Углеводы', 'Белки' и 'Жиры' должно совпадать.");
            return null;
        }

        if (productGrams === 0) {
            showError("Грамм продукта не может быть равен нулю.");
            return null;
        }

        const carbsPer100g = carbohydrates[0];
        const rapidInsulin = (carbsPer100g / 10).toFixed(1);

        const proteinInput = proteins[0];
        const fatInput = fats[0];

        const longInsulinCalculation = (((proteinInput * 4) + (fatInput * 9)) / productGrams) * carbCoefficients[0];
        const longInsulin = longInsulinCalculation.toFixed(1);

        return {
            rapidInsulin: parseFloat(rapidInsulin),
            longInsulin: parseFloat(longInsulin)
        };
    } catch (error) {
        console.error("Ошибка при выполнении скрипта:", error);
        showError("Произошла непредвиденная ошибка при расчёте. Попробуйте ещё раз.");
        return null;
    }
}

function addProductToList() {
    const productName = document.getElementById('product_name').value.trim();
    const carbCoefficientStr = document.getElementById('carb_coefficient').value.trim();
    const carbohydratesStr = document.getElementById('carbohydrates').value.trim();
    const productGramsStr = document.getElementById('product_grams').value.trim();
    const proteinsStr = document.getElementById('proteins').value.trim();
    const fatsStr = document.getElementById('fats').value.trim();

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<p>Результаты расчёта появятся здесь.</p>';

    if (!productName) {
        showError("Пожалуйста, введите название продукта.");
        return;
    }

    const insulinData = calculateInsulinData();
    if (!insulinData) {
        return;
    }

    const totalInsulinForProduct = insulinData.rapidInsulin + insulinData.longInsulin;

    const newProduct = {
        name: productName,
        grams: parseFloat(productGramsStr),
        carbs: parseFloat(carbohydratesStr.split(',')[0]),
        proteins: parseFloat(proteinsStr.split(',')[0]),
        fats: parseFloat(fatsStr.split(',')[0]),
        rapidInsulin: insulinData.rapidInsulin,
        longInsulin: insulinData.longInsulin,
        totalInsulin: totalInsulinForProduct
    };

    productListArray.push(newProduct);
    renderProductList();
    updateTotalInsulin();
    document.getElementById('product_name').value = '';
    document.getElementById('carb_coefficient').value = carbCoefficientStr;
    document.getElementById('carbohydrates').value = '';
    document.getElementById('product_grams').value = '';
    document.getElementById('proteins').value = '';
    document.getElementById('fats').value = '';

    resultDiv.innerHTML = `
        <p><strong>Быстрый инсулин:</strong> ${insulinData.rapidInsulin.toFixed(1)} ЕД</p>
        <p><strong>Долгий инсулин:</strong> ${insulinData.longInsulin.toFixed(1)} ЕД</p>
        <p><strong>Всего для "${productName}":</strong> ${totalInsulinForProduct.toFixed(1)} ЕД</p>
    `;
}

function renderProductList() {
    const productListDiv = document.getElementById('productList');
    if (productListArray.length === 0) {
        productListDiv.innerHTML = '<p>Список пока пуст.</p>';
        return;
    }

    productListDiv.innerHTML = '';

    productListArray.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.setAttribute('data-index', index);

        productItem.innerHTML = `
            <div class="product-info">
                <strong>${product.name}</strong>
                <span>${product.grams.toFixed(0)}г</span> |
                <span>Уг: ${product.carbs.toFixed(1)}г</span> |
                <span>Б: ${product.proteins.toFixed(1)}г</span> |
                <span>Ж: ${product.fats.toFixed(1)}г</span>
            </div>
            <div class="product-insulin">
                ${product.totalInsulin.toFixed(1)} ЕД
            </div>
            <button class="delete-button" onclick="deleteProduct(${index})">X</button>
        `;
        productListDiv.appendChild(productItem);
    });
}

function deleteProduct(index) {
    if(index >= 0 && index < productListArray.length) {
        productListArray.splice(index, 1);
        renderProductList();
        updateTotalInsulin();
    }
}

function updateTotalInsulin() {
    const totalInsulinDiv = document.getElementById('totalInsulin');
    const total = productListArray.reduce((sum, product) => sum + product.totalInsulin, 0);
    totalInsulinDiv.querySelector('p').innerHTML = `<strong>Общий инсулин:</strong> ${total.toFixed(1)} ЕД`;
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderProductList();
    updateTotalInsulin();
});

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'product_name' ||
            activeElement.id === 'carb_coefficient' ||
            activeElement.id === 'carbohydrates' ||
            activeElement.id === 'product_grams' ||
            activeElement.id === 'proteins' ||
            activeElement.id === 'fats') {
            addProductToList();
        }
    }
});
