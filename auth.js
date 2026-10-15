// Authentication / session
const txtEmail =
    document.getElementById("txtEmail");

const txtPassword =
    document.getElementById("txtPassword");

const btnLogin =
    document.getElementById("btnLogin");

const loginMessage =
    document.getElementById("loginMessage");


async function initialize() {

    const {
        data: { session }
    } = await db.auth.getSession();


    if (session) {

        showMenu();

    } else {

        showLogin();
    }
}


function showLogin() {
    showSection('loginSection');
    loginMessage.textContent='';
    txtPassword.value='';
}
async function login() {

    const email =
        txtEmail.value.trim();

    const password =
        txtPassword.value;


    if (!email || !password) {

        loginMessage.textContent =
            "이메일과 비밀번호를 입력하세요.";

        return;
    }


    btnLogin.disabled = true;

    btnLogin.textContent =
        "로그인 중...";

    loginMessage.textContent = "";


    const { error } =
        await db.auth.signInWithPassword({
            email: email,
            password: password
        });


    btnLogin.disabled = false;

    btnLogin.textContent =
        "로그인";


    if (error) {

        console.error(error);

        loginMessage.textContent =
            "이메일 또는 비밀번호를 확인하세요.";

        return;
    }


    showMenu();
}


async function logout() {

    await db.auth.signOut();

    document.getElementById("stockList").innerHTML = "";

    document.getElementById("countList").innerHTML = "";

    menuSection.classList.add("hidden");
    countSection.classList.add("hidden");

    document.getElementById("resultCount").textContent =
        "품번 또는 품명을 입력하세요.";

    document.getElementById("txtSearch").value = "";

    showLogin();
}



document.getElementById('btnLogin').addEventListener('click',login);
document.getElementById('txtPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login();});
document.querySelectorAll('.logout-button').forEach(btn=>btn.addEventListener('click',logout));
initialize();
