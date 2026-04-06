// ===== Navbar Toggle & Overlay =====
const menuToggle = document.querySelector("#menu-toggle");
const menuOverlay = document.querySelector("#menu-overlay");
const overlayClose = document.querySelector("#overlay-close");

if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
        menuOverlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Prevent scrolling
    });
}

if (overlayClose) {
    overlayClose.addEventListener("click", () => {
        menuOverlay.classList.remove("active");
        document.body.style.overflow = "";
    });
}

// ===== Start Button (Landing to Overlay) =====
const startBtn = document.getElementById("start-btn");
if (startBtn) {
    startBtn.addEventListener("click", () => {
        menuOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    });
}

// ===== Overlay Card Dropdowns =====
document.querySelectorAll(".module-card-header").forEach(header => {
    header.addEventListener("click", () => {
        const card = header.parentElement;
        const isActive = card.classList.contains("active");

        // Close all other cards
        document.querySelectorAll(".overlay-module-card").forEach(c => c.classList.remove("active"));

        // Toggle current card
        if (!isActive) {
            card.classList.add("active");
        }
    });
});

// ===== Overlay Submodule Logic =====
document.querySelectorAll(".submodule-link").forEach(link => {
    link.addEventListener("click", (e) => {
        // We now allow normal link navigation, but can add pre-navigation logic if needed
        console.log("Navigating to: " + link.getAttribute("href"));
    });
});

// ===== Deep Link: Open Overlay on Load =====
const checkHashAndOpenOverlay = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#open-')) {
        const moduleName = hash.replace('#open-', '');
        const menuOverlay = document.querySelector("#menu-overlay");
        if (menuOverlay) {
            menuOverlay.classList.add("active");
            document.body.style.overflow = "hidden";

            if (moduleName !== 'overlay') {
                const card = document.querySelector(`.overlay-module-card[data-module="${moduleName}"]`);
                if (card) {
                    // Close others
                    document.querySelectorAll(".overlay-module-card").forEach(c => c.classList.remove("active"));
                    card.classList.add("active");
                }
            }
        }
    }
};

window.addEventListener('load', checkHashAndOpenOverlay);
window.addEventListener('hashchange', checkHashAndOpenOverlay);
