// Stock query and stock count V2
const txtSearch =
    document.getElementById("txtSearch");

const cboStockPartName =
    document.getElementById("cboStockPartName");

const btnSearch =
    document.getElementById("btnSearch");

const stockList =
    document.getElementById("stockList");

const resultCount =
    document.getElementById("resultCount");


async function showStock() {
    showSection('stockSection');

    await loadPartNameCombo(cboStockPartName);

    txtSearch.focus();
}


async function loadPartNameCombo(cbo) {

    cbo.innerHTML =
        '<option value="">전체</option>';

    const { data, error } =
        await db.rpc(
            "rpc_mobile_part_name_query"
        );

    if (error) {

        console.error(error);

        return;
    }

    cbo.innerHTML =
        '<option value="">전체</option>' +
        (data || []).map(
            r =>
                `<option value="${escapeHtml(r.part_name)}">` +
                `${escapeHtml(r.part_name)}` +
                `</option>`
        ).join("");
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

                p_include_zero: false,

                p_part_name:
                    cboStockPartName.value || null
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


            const remark =
                row.remark || "";


            // ------------------------------------------------
            // Mobile 표시 기준
            // spec + remark 모두 존재 : spec & remark
            // spec만 존재            : spec
            // remark만 존재          : remark
            // 둘 다 없음             : 빈 값
            // ------------------------------------------------

            const specRemark =
                [spec, remark]
                    .filter(
                        value =>
                            String(value).trim() !== ""
                    )
                    .join(" & ");


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
                        ${escapeHtml(specRemark)}
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



document.getElementById('btnMenuStock').addEventListener('click',showStock);
document.getElementById('btnMenuCount').addEventListener('click',showCount);
btnSearch.addEventListener('click',loadStock);
cboStockPartName.addEventListener('change',loadStock);
txtSearch.addEventListener('keydown',e=>{if(e.key==='Enter')loadStock();});
// ============================================================
// STOCK COUNT V2
// ============================================================

async function showCount() {
    showSection('countSection');

    await loadPartNameCombo(
        document.getElementById("cboPartType")
    );

    await loadStockCountList();
}


async function loadStockCountList() {

    const cbo =
        document.getElementById("cboStockCount");

    cbo.innerHTML =
        '<option value="">조회 중...</option>';


    const { data, error } =
        await db.rpc(
            "rpc_stock_count_mobile_list"
        );


    if (error) {

        console.error(error);

        cbo.innerHTML =
            '<option value="">조회 오류</option>';

        document.getElementById(
            "countResultCount"
        ).textContent =
            "모바일 실사목록 조회 오류";

        return;
    }


    if (!data || data.length === 0) {

        cbo.innerHTML =
            '<option value="">진행 중인 모바일 실사 없음</option>';

        document.getElementById(
            "countProgress"
        ).textContent =
            "진행현황: -";

        return;
    }


    cbo.innerHTML =
        data.map(
            r =>
                `<option value="${r.stock_count_id}">
                    ${escapeHtml(r.count_no)} /
                    ${escapeHtml(r.count_date)}
                 </option>`
        ).join("");


    await stockCountChanged();
}


async function stockCountChanged() {

    const id =
        Number(
            document.getElementById(
                "cboStockCount"
            ).value || 0
        );


    if (!id) {
        return;
    }


    const { data, error } =
        await db.rpc(
            "rpc_stock_count_mobile_item_query",
            {
                p_stock_count_id: id,
                p_part_type: null,
                p_input_status: "ALL",
                p_part_no: null
            }
        );


    if (error) {

        console.error(error);

        return;
    }


    document.getElementById(
        "cboInputStatus"
    ).value =
        "NOT_ENTERED";


    document.getElementById(
        "txtCountPartNo"
    ).value =
        "";


    await refreshCountProgress();

    await loadCountItems();
}


async function refreshCountProgress() {

    const id =
        Number(
            document.getElementById(
                "cboStockCount"
            ).value || 0
        );


    const { data, error } =
        await db.rpc(
            "rpc_stock_count_progress_query",
            {
                p_stock_count_id: id
            }
        );


    if (
        error ||
        !data ||
        !data.length
    ) {

        console.error(error);

        document.getElementById(
            "countProgress"
        ).textContent =
            "진행현황 조회 오류";

        return;
    }


    const r =
        data[0];


    document.getElementById(
        "countProgress"
    ).textContent =
        `전체 ${r.total_count} / ` +
        `입력 ${r.entered_count} / ` +
        `미입력 ${r.not_entered_count} / ` +
        `${Number(r.progress_rate).toFixed(1)}%`;
}


async function loadCountItems() {

    const id =
        Number(
            document.getElementById(
                "cboStockCount"
            ).value || 0
        );


    if (!id) {
        return;
    }


    const partType =
        document.getElementById(
            "cboPartType"
        ).value;


    const status =
        document.getElementById(
            "cboInputStatus"
        ).value;


    const partNo =
        document.getElementById(
            "txtCountPartNo"
        ).value.trim();


    const rc =
        document.getElementById(
            "countResultCount"
        );


    const list =
        document.getElementById(
            "countList"
        );


    rc.textContent =
        "조회 중...";

    list.innerHTML =
        "";


    const { data, error } =
        await db.rpc(
            "rpc_stock_count_mobile_item_query",
            {
                p_stock_count_id: id,
                p_part_type:
                    partType || null,
                p_input_status:
                    status,
                p_part_no:
                    partNo || null
            }
        );


    if (error) {

        console.error(error);

        rc.textContent =
            "조회 오류";

        list.innerHTML =
            '<div class="message">' +
            '실사품목을 조회하지 못했습니다.' +
            '</div>';

        return;
    }


    renderCountItems(
        data || []
    );
}


function renderCountItems(rows) {

    const rc =
        document.getElementById(
            "countResultCount"
        );


    const list =
        document.getElementById(
            "countList"
        );


    if (!rows.length) {

        rc.textContent =
            "검색결과 0건";

        list.innerHTML =
            '<div class="message">' +
            '조건에 맞는 실사품목이 없습니다.' +
            '</div>';

        return;
    }


    rc.textContent =
        `검색결과 ${rows.length}건`;


    list.innerHTML =
        rows.map(r => {

            const qty =
                r.count_qty === null
                    ? ""
                    : r.count_qty;


            const diff =
                r.count_qty === null
                    ? ""
                    : Number(r.count_qty) -
                      Number(r.book_qty);


            return `
                <div class="count-card">

                    <div class="part-no">
                        ${escapeHtml(r.part_no)}
                    </div>

                    <div class="part-name">
                        ${escapeHtml(r.part_name || "")}
                    </div>

                    <div class="spec">
                        ${escapeHtml(r.spec || "")}
                    </div>

                    <div class="count-meta">
                        ${escapeHtml(r.part_type || "")}
                    </div>

                    <div class="stock-row">

                        <span class="stock-label">
                            장부재고
                        </span>

                        <span class="stock-qty">
                            ${Number(
                                r.book_qty
                            ).toLocaleString()}
                            ${escapeHtml(r.uom || "")}
                        </span>

                    </div>

                    <div class="qty-row">

                        <div>

                            <span class="stock-label">
                                실사수량
                            </span>

                            ${
                                r.count_qty === null
                                    ? ""
                                    :
                                    `<div class="count-meta">
                                        현재 ${Number(
                                            r.count_qty
                                        ).toLocaleString()}
                                        /
                                        차이 ${diff}
                                     </div>`
                            }

                        </div>

                        <input
                            class="qty-input"
                            type="number"
                            min="0"
                            step="0.001"
                            inputmode="decimal"
                            value="${qty}"
                        >

                    </div>

                    <button
                        class="save-button"
                        data-part-id="${r.part_id}"
                    >
                        저장
                    </button>

                    <div class="saved-info">
                        ${
                            r.entered_by
                                ?
                                `최종입력: ${
                                    escapeHtml(
                                        r.entered_by
                                    )
                                }`
                                :
                                "미입력"
                        }
                    </div>

                </div>
            `;

        }).join("");
}


async function saveCountItem(btn) {

    const input =
        btn.closest(
            ".count-card"
        ).querySelector(
            ".qty-input"
        );


    const raw =
        input.value.trim();


    if (
        raw === "" ||
        Number.isNaN(Number(raw)) ||
        Number(raw) < 0
    ) {

        alert(
            "실사수량을 0 이상의 숫자로 입력하세요."
        );

        input.focus();

        return;
    }


    btn.disabled =
        true;

    btn.textContent =
        "저장 중...";


    const { error } =
        await db.rpc(
            "rpc_stock_count_mobile_save",
            {
                p_stock_count_id:
                    Number(
                        document.getElementById(
                            "cboStockCount"
                        ).value
                    ),

                p_part_id:
                    Number(
                        btn.dataset.partId
                    ),

                p_count_qty:
                    Number(raw)
            }
        );


    btn.disabled =
        false;

    btn.textContent =
        "저장";


    if (error) {

        console.error(error);

        alert(
            "저장하지 못했습니다.\n" +
            (error.message || "")
        );

        return;
    }


    await refreshCountProgress();

    await loadCountItems();
}


// ============================================================
// STOCK COUNT EVENTS
// ============================================================

document.getElementById(
    "cboStockCount"
).addEventListener(
    "change",
    stockCountChanged
);


document.getElementById(
    "cboPartType"
).addEventListener(
    "change",
    loadCountItems
);


document.getElementById(
    "cboInputStatus"
).addEventListener(
    "change",
    loadCountItems
);


document.getElementById(
    "btnCountSearch"
).addEventListener(
    "click",
    loadCountItems
);


document.getElementById(
    "txtCountPartNo"
).addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            loadCountItems();
        }
    }
);


document.getElementById(
    "countList"
).addEventListener(
    "click",
    e => {

        const b =
            e.target.closest(
                ".save-button"
            );

        if (b) {
            saveCountItem(b);
        }
    }
);


