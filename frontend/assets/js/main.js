//  xử lý Navbar cuộn
document.addEventListener("DOMContentLoaded", function() {
            const navbar = document.getElementById("mainNav");
            
            window.addEventListener("scroll", function() {
                if (window.scrollY > 20) {
                    navbar.classList.add("scrolled");
                } else {
                    navbar.classList.remove("scrolled");
                }
            });
});