// ============================================================
// HR COMP
// Mobile Stock Status V1
// ============================================================


// ------------------------------------------------------------
// Supabase
// ------------------------------------------------------------

const SUPABASE_URL =
    "https://ctwixabopviehfubqfzz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_J1-FuFkGTuNbjudupyc0-w_DL3NiEy2";


const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ------------------------------------------------------------
// Controls
// ------------------------------------------------------------

const loginSection =
    document.getElementById("loginSection");

const stockSection =
    document.getElementById("stockSection");


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

const txtSearch =
    document.getElementById("txtSearch");

const btnSearch =
    document.getElementById("btnSearch");

const stockList =
    document.getElementById("stockList");

const resultCount =
    document.getElementById("resultCount");


// ============================================================
// INITIALIZE
// ============================================================

async function initialize() {

    const {
        data: { session }
    } = await db.auth.getSession();


    if (session) {

        showStock();

    } else {

        showLogin();
    }
}


// ============================================================
// SCREEN
// ============================================================

function showLogin() {

    stockSection.classList.add("hidden");

    loginSection.classList.remove("hidden");

    loginMessage.textContent = "";

    txtPassword.value = "";
}


function showStock() {

    loginSection.classList.add("hidden");

    stockSection.classList.remove("hidden");

    txtSearch.focus();
}


// ============================================================
// LOGIN
// ============================================================

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


    showStock();
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    await db.auth.signOut();

    stockList.innerHTML = "";

    resultCount.textContent =
        "품번 또는 품명을 입력하세요.";

    txtSearch.value = "";

    showLogin();
}


// ============================================================
// STOCK QUERY
// ============================================================

async function loadStock() {

    const searchText =
        txtSearch.value.trim();


    resultCount.textContent =
        "조회 중...";

    stockList.innerHTML = "";


    const { data, error } =
        await db.rpc(
            "rpc_mobile_stock_query",
            {
                p_search_text:
                    searchText === ""
                        ? null
                        : searchText,

                p_include_zero: false
            }
        );


    if (error) {

        console.error(error);

        resultCount.textContent =
            "조회 오류";

        stockList.innerHTML =
            `<div class="message">
                데이터를 조회하지 못했습니다.
             </div>`;

        return;
    }


    renderStock(data);
}


// ============================================================
// STOCK RENDER
// ============================================================

function renderStock(rows) {

    if (!rows || rows.length === 0) {

        resultCount.textContent =
            "검색결과 0건";

        stockList.innerHTML =
            `<div class="message">
                검색된 품목이 없습니다.
             </div>`;

        return;
    }


    resultCount.textContent =
        `검색결과 ${rows.length}건`;


    stockList.innerHTML =
        rows.map(row => {

            const qty =
                Number(
                    row.current_stock_qty || 0
                ).toLocaleString();


            const uom =
                row.uom || "";


            const lastDate =
                row.last_stock_date || "-";


            const spec =
                row.spec || "";


            const partName =
                row.part_name || "";


            return `
                <div class="stock-card">

                    <div class="part-no">
                        ${escapeHtml(row.part_no)}
                    </div>

                    <div class="part-name">
                        ${escapeHtml(partName)}
                    </div>

                    <div class="spec">
                        ${escapeHtml(spec)}
                    </div>

                    <div class="stock-row">

                        <span class="stock-label">
                            현재재고
                        </span>

                        <span class="stock-qty">
                            ${qty}
                            ${escapeHtml(uom)}
                        </span>

                    </div>

                    <div class="last-date">
                        최종수불일
                        ${lastDate}
                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// HTML ESCAPE
// ============================================================

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


// ============================================================
// EVENTS
// ============================================================

btnLogin.addEventListener(
    "click",
    login
);


txtPassword.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            login();
        }
    }
);


btnLogout.addEventListener(
    "click",
    logout
);


btnSearch.addEventListener(
    "click",
    loadStock
);


txtSearch.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            loadStock();
        }
    }
);


// ============================================================
// START
// ============================================================

initialize();