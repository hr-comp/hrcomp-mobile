// Common navigation / UI helpers
const loginSection =
    document.getElementById("loginSection");

const stockSection =
    document.getElementById("stockSection");

const menuSection =
    document.getElementById("menuSection");

const countSection =
    document.getElementById("countSection");

const btnLogout =
    document.getElementById("btnLogout");


function showSection(id) {
    ['loginSection','menuSection','stockSection','countSection','deliverySection'].forEach(sectionId => {
        document.getElementById(sectionId).classList.toggle('hidden',sectionId !== id);
    });
}
function showMenu() { showSection('menuSection'); }
function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



document.getElementById('btnBackStock').addEventListener('click',returnToPortal);
document.getElementById('btnBackCount').addEventListener('click',returnToPortal);

// Return to the portal tab that launched this module, when available.
// A directly opened module has no opener; navigate to the portal instead.
const ERP_PORTAL_URL = 'https://hrcomp-admin.github.io/hrcomp-erp-portal/';
function returnToPortal() {
    try {
        if (window.opener && !window.opener.closed) {
            window.opener.focus();
            return;
        }
    } catch (e) {
        console.warn('Portal tab focus unavailable:', e);
    }
    window.location.assign(ERP_PORTAL_URL);
}
