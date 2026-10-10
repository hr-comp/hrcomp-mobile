// Common navigation / UI helpers
const loginSection =
    document.getElementById("loginSection");

const stockSection =
    document.getElementById("stockSection");

const menuSection =
    document.getElementById("menuSection");

const countSection =
    document.getElementById("countSection");


const txtEmail =
    document.getElementById("txtEmail");

const txtPassword =
    document.getElementById("txtPassword");

const btnLogin =
    document.getElementById("btnLogin");

const loginMessage =
    document.getElementById("loginMessage");


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



document.getElementById('btnBackStock').addEventListener('click',showMenu);
document.getElementById('btnBackCount').addEventListener('click',showMenu);
