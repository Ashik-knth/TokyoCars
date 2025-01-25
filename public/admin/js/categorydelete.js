function deleteCategory(categoryId){
  
    console.log("category block with ID:", categoryId);

    $.ajax({
        url: '/admin/deletecategory',
        type: 'POST',
        data: {
            categoryId: categoryId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: response.message,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                console.log(response);
                
                Swal.fire({
                    icon: 'error',
                    title: response.message || 'Category Deleted Failed',
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
                title: 'Category Deleted Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

}




function restoreCategory(categoryId){
  
    console.log("category block with ID:", categoryId);

    $.ajax({
        url: '/admin/restorecategory',
        type: 'POST',
        data: {
            categoryId: categoryId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: response.message|| ' Category restored Successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: response.message || 'Category restored Failed',
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
                title:  error.message || 'Category restored Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

}