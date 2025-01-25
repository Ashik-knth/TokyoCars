const toggleArrows = document.querySelectorAll('.toggle-arrow');
        const submenus = document.querySelectorAll('.submenu');

        toggleArrows.forEach(arrow => {
            arrow.addEventListener('click', function () {
                // Hide all submenus except the one being toggled
                submenus.forEach(submenu => {
                    if (submenu !== this.nextElementSibling) {
                        submenu.style.display = 'none';
                    }
                });

                // Close all arrows except the one being toggled
                toggleArrows.forEach(otherArrow => {
                    if (otherArrow !== this) {
                        otherArrow.classList.remove('collapsed');
                    }
                });

                // Toggle the clicked submenu
                const submenu = this.nextElementSibling;
                submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';

                // Toggle the arrow rotation
                this.classList.toggle('collapsed');
            });
        });