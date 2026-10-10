// HR COMP - Customer Order Delivery V1 (Read Only)
// ============================================================
// CUSTOMER ORDER DELIVERY V1 (READ ONLY)

// ============================================================
const deliverySection = document.getElementById('deliverySection');
const deliveryPanels = ['deliveryOrdersPanel','deliveryItemsPanel','deliveryTracePanel'];
let deliveryOrderRows = [];
let deliveryItemRows = [];
let deliverySelectedOrder = null;
let deliverySelectedItem = null;
let deliveryRequestNo = 0;

function deliveryPanel(id) {
    deliveryPanels.forEach(x => document.getElementById(x).classList.toggle('hidden',x!==id));
}
function deliveryNum(v) { return Number(v || 0).toLocaleString('ko-KR'); }
function deliveryDate(v) { return v || '-'; }
function deliveryStatusBadge(v) {
    const s=String(v || '-');
    const cls = /초과|부족|미충족/.test(s) ? 'danger' : /당일|확인/.test(s) ? 'warn' : /충족|완료/.test(s) ? 'ok' : '';
    return `<span class="delivery-badge ${cls}">${escapeHtml(s)}</span>`;
}
function deliveryCell(label,value) {
    return `<div><span class="delivery-cell-label">${escapeHtml(label)}</span><span class="delivery-cell-value">${escapeHtml(value)}</span></div>`;
}
function deliveryError(el, err) {
    console.error(err);
    el.innerHTML = `<div class="message">조회 오류: ${escapeHtml(err?.message || '데이터를 불러오지 못했습니다.')}</div>`;
}
async function showDelivery() {
    showSection('deliverySection');
    deliveryPanel('deliveryOrdersPanel');
    await loadDeliveryOrders();
}
async function loadDeliveryOrders() {
    const token=++deliveryRequestNo;
    deliveryPanel('deliveryOrdersPanel');
    const list=document.getElementById('deliveryOrderList');
    const count=document.getElementById('deliveryOrderCount');
    count.textContent='조회 중...'; list.innerHTML='';
    const q=document.getElementById('txtDeliverySearch').value.trim();
    const {data,error}=await db.rpc('rpc_mobile_customer_order_undelivered_list',{
        p_company_id:null,p_customer_id:null,p_search:q || null
    });
    if(token!==deliveryRequestNo) return;
    if(error) {count.textContent='조회 오류';deliveryError(list,error);return;}
    deliveryOrderRows=data || [];
    count.textContent=`미출하 고객주문 ${deliveryOrderRows.length}건`;
    list.innerHTML=deliveryOrderRows.length ? deliveryOrderRows.map((r,i)=>`
        <button class="delivery-card" data-order-index="${i}">
            <div class="delivery-title">${escapeHtml(r.customer_name || '')}</div>
            <div class="delivery-sub">${escapeHtml(r.order_no || '')} · 주문일 ${escapeHtml(deliveryDate(r.order_date))}</div>
            ${deliveryStatusBadge(r.delivery_status)}
            <div class="delivery-grid">
                ${deliveryCell('최초 미출하 납기',deliveryDate(r.earliest_delivery_date))}
                ${deliveryCell('미출하수량',deliveryNum(r.unshipped_qty))}
                ${deliveryCell('미출하 품목수',deliveryNum(r.undelivered_item_count))}
                ${deliveryCell('납기초과 품목수',deliveryNum(r.overdue_item_count))}
            </div>
        </button>`).join('') : '<div class="message">미출하 고객주문이 없습니다.</div>';
}
async function loadDeliveryItems(order) {
    deliverySelectedOrder=order;
    deliveryPanel('deliveryItemsPanel');
    document.getElementById('deliverySelectedOrder').textContent=`${order.customer_name || ''} / ${order.order_no || ''}`;
    const list=document.getElementById('deliveryItemList');
    const count=document.getElementById('deliveryItemCount');
    count.textContent='조회 중...';list.innerHTML='';
    const token=++deliveryRequestNo;
    const {data,error}=await db.rpc('rpc_mobile_customer_order_delivery_status',{
        p_customer_order_id:order.customer_order_id
    });
    if(token!==deliveryRequestNo) return;
    if(error){count.textContent='조회 오류';deliveryError(list,error);return;}
    deliveryItemRows=data || [];
    count.textContent=`주문 품목 ${deliveryItemRows.length}건`;
    list.innerHTML='<div class="delivery-note">현재재고는 해당 품목의 전체 재고이며, 이 주문에 배정된 수량이 아닙니다.</div>'+
        (deliveryItemRows.length ? deliveryItemRows.map((r,i)=>`
        <button class="delivery-card" data-item-index="${i}">
            <div class="delivery-title">${escapeHtml(r.part_no)}</div>
            <div class="delivery-sub">${escapeHtml(r.part_name || '')} ${escapeHtml(r.spec || '')}</div>
            ${deliveryStatusBadge(r.delivery_status)}
            <div class="delivery-grid">
                ${deliveryCell('요구납기',deliveryDate(r.delivery_date))}
                ${deliveryCell('주문수량',deliveryNum(r.order_qty))}
                ${deliveryCell('출하수량',deliveryNum(r.shipped_qty))}
                ${deliveryCell('미출하수량',deliveryNum(r.unshipped_qty))}
                ${deliveryCell('전체 현재재고',deliveryNum(r.current_stock_qty))}
            </div>
        </button>`).join(''):'<div class="message">조회된 품목이 없습니다.</div>');
}
async function loadDeliveryTrace(item) {
    deliverySelectedItem=item;
    deliveryPanel('deliveryTracePanel');
    document.getElementById('deliveryTraceContext').textContent=`${deliverySelectedOrder?.order_no || ''} / ${item.part_no || ''}`;
    const list=document.getElementById('deliveryTraceList');
    list.innerHTML='<div class="message">조회 중...</div>';
    const token=++deliveryRequestNo;
    const {data,error}=await db.rpc('rpc_mobile_customer_order_supply_trace_v2',{
        p_customer_order_item_id:item.customer_order_item_id
    });
    if(token!==deliveryRequestNo) return;
    if(error){deliveryError(list,error);return;}
    const rows=data || [];
    if(!rows.length){list.innerHTML='<div class="message">공급추적 결과가 없습니다.</div>';return;}
    const r=rows[0];
    const poRows=rows.filter(x=>x.purchase_item_id != null);
    list.innerHTML=`
        <div class="delivery-card">
            <div class="delivery-title">${escapeHtml(r.part_no || item.part_no)}</div>
            <div class="delivery-sub">${escapeHtml(r.part_name || item.part_name || '')}</div>
            <div class="delivery-grid">
                ${deliveryCell('고객 요구납기',deliveryDate(r.delivery_date))}
                ${deliveryCell('미출하수량',deliveryNum(r.unshipped_qty))}
                ${deliveryCell('전체 현재재고',deliveryNum(r.current_stock_qty))}
                ${deliveryCell('발주 미입고수량',deliveryNum(r.open_purchase_qty))}
                ${deliveryCell('납기 내 공급가능수량',deliveryNum(r.total_supply_qty))}
                ${deliveryCell('납기 부족수량',deliveryNum(r.supply_shortage_qty))}
            </div>
            <div class="delivery-note">공급가능수량은 납기 내 배정 기준입니다. 전체 현재재고 및 발주 미입고수량과 단순 합산하지 마십시오.</div>
        </div>
        <div class="delivery-section-title">구매발주 입고예정 현황 (${poRows.length}건)</div>
        ${poRows.length ? poRows.map(x=>`
            <div class="delivery-card">
                <div class="delivery-title">${escapeHtml(x.purchase_no || '-')}</div>
                <div class="delivery-sub">${escapeHtml(x.vendor_name || '-')}</div>
                ${deliveryStatusBadge(x.purchase_schedule_status)}
                <div class="delivery-grid">
                    ${deliveryCell('입고예정일',deliveryDate(x.expected_date))}
                    ${deliveryCell('발주 미입고',deliveryNum(x.purchase_open_qty))}
                    ${deliveryCell('발주수량',deliveryNum(x.purchase_order_qty))}
                    ${deliveryCell('입고수량',deliveryNum(x.purchase_received_qty))}
                    ${deliveryCell('납기 지연일수',x.delivery_delay_days == null ? '-' : String(x.delivery_delay_days))}
                </div>
            </div>`).join(''):'<div class="message">등록된 구매발주가 없습니다.</div>'}`;
}

document.getElementById('btnMenuDelivery').addEventListener('click',showDelivery);
document.getElementById('btnBackDelivery').addEventListener('click',()=>{++deliveryRequestNo;showMenu();});
document.getElementById('btnDeliverySearch').addEventListener('click',loadDeliveryOrders);
document.getElementById('txtDeliverySearch').addEventListener('keydown',e=>{if(e.key==='Enter')loadDeliveryOrders();});
document.getElementById('btnDeliveryToOrders').addEventListener('click',()=>{++deliveryRequestNo;deliveryPanel('deliveryOrdersPanel');});
document.getElementById('btnDeliveryToItems').addEventListener('click',()=>{++deliveryRequestNo;deliveryPanel('deliveryItemsPanel');});
document.getElementById('deliveryOrderList').addEventListener('click',e=>{
    const b=e.target.closest('[data-order-index]');
    if(b && deliveryOrderRows[Number(b.dataset.orderIndex)])loadDeliveryItems(deliveryOrderRows[Number(b.dataset.orderIndex)]);
});
document.getElementById('deliveryItemList').addEventListener('click',e=>{
    const b=e.target.closest('[data-item-index]');
    if(b && deliveryItemRows[Number(b.dataset.itemIndex)])loadDeliveryTrace(deliveryItemRows[Number(b.dataset.itemIndex)]);
});
