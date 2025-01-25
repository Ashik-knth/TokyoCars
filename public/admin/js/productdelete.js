function deleteProduct(productId) {
    console.log("product block with ID:", productId);
    $.ajax({
        url: '/admin/deleteproduct',
        type: 'POST',
        data: {
            productId: productId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Product Deleted Successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Product Deletion Failed',
                    text: 'Please try again',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        error: function(error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Product Deletion Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}


function archiveProduct(productId) {
    console.log("product block with ID:", productId);
    $.ajax({
        url: '/admin/restoreproduct',
        type: 'POST',
        data: {
            productId: productId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Product Restored Successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Product Restore Failed',
                    text: 'Please try again',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        error: function(error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Product Restore Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}