function ValidateForm(event) {
    console.log("Validate form");
    event.preventDefault();
    clearErrorMessage();

    const productName = document.getElementById("productName").value.trim();
    const category = document.getElementById("category").value.trim();
    const price = document.getElementById("price").value.trim();
    const description = document.getElementById("description").value.trim();
    const image1 = document.getElementById("image1").value.trim();
    const image2 = document.getElementById("image2").value.trim();
    const image3 = document.getElementById("image3").value.trim();

    // Get individual error elements
    const nameError = document.getElementById("name-error");
    const categoryError = document.getElementById("category-error");
    const priceError = document.getElementById("price-error");
    const stoclkError = document.getElementById("stock-error");
    const descriptionError = document.getElementById("description-error");
    const image1Error = document.getElementById("image1-error");
    const image2Error = document.getElementById("image2-error");
    const image3Error = document.getElementById("image3-error");

    const categoryRegex = /^[A-Za-z]+$/;
    
    if (productName === "") {
        showError(nameError, "Product name is empty");
        return false;
    } else if(productName.length > 50) {
        showError(nameError, "Product name must be less than 50 characters");
        return false;
    } else if(productName.length < 3) {
        showError(nameError, "Product name must be more than 3 characters");
        return false;
    } else if(!productName.match(/^[A-Za-z]+$/)) {
        showError(nameError, "Product name must contain only letters");
        return false;
    }
    
    if (category === "") {
        showError(categoryError, "Category is empty");
        return false;
    } else if(!categoryRegex.test(category)) {
        showError(categoryError, "Category must contain only letters");
        return false;
    }
    
    if (price === "") {
        showError(priceError, "Price is empty");
        return false;
    }else if(!price.match(/^[0-9]+(\.[0-9]{1,2})?$/)) {
        showError(priceError, "Price must be a number with up to two decimal places");
        return false;
    }else if(price < 0) {
        showError(priceError, "Price must be a Greater than 0");
        return false;
    }else if(price > 1500) {
        showError(priceError, "Price must be less than 1,000,000");
        return false;
    }else if(price % 1 !== 0) {
        showError(priceError, "Price must be an integer");
        return false;
    }else if(10<price && price<100) {
        showError(priceError, "Price must be more than 100");
        return false;
        
    }
    
    
    if (description === "") {
        showError(descriptionError, "Description is empty");
        return false;
    }
    
    if (image1 === "") {
        showError(image1Error, "Image 1 is empty");
        return false;
    }
    
    if (image2 === "") {
        showError(image2Error, "Image 2 is empty");
        return false;
    }
    
    if (image3 === "") {
        showError(image3Error, "Image 3 is empty");
        return false;
    }
    
    return true;
}

function showError(element, message) {
    if (element) {
        console.log("Show error message");
        element.textContent = message;
        element.style.color = "red";
        element.style.display = "block";
        element.style.fontSize = "12px";
    }
}

function clearErrorMessage() {
    const errorMessages = document.querySelectorAll(".error_message");
    errorMessages.forEach((element) => {
        element.textContent = "";
        element.style.display = "none";
    });
}  
