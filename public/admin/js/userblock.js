function blockUser(userId) {
    console.log("Block user with ID:", userId);
    
    $.ajax({
        url: '/admin/block',
        type: 'POST',
        data: {
            userId: userId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'User Blocked Successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'User Blocking Failed',
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
                title: 'User Blocking Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}


function unblockUser(userId) {

    $.ajax({
        url: '/admin/unblock',
        type: 'POST',
        data: {
            userId: userId
        },
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'User UnBlocked Successfully',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.reload(response.redirectUrl);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'User UnBlocking Failed',
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
                title: 'User UnBlocking Failed',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

}