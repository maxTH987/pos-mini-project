// เก็บข้อมูลตะกร้าสินค้า
let cart = []; 
let promoSettings = { start: '14:00', end: '16:00', discountPercent: 10 };
let currentMember = null;

// โหลด Settings เมื่อเริ่มหน้าจอ
async function loadPromoSettings() {
    try {
        const res = await fetch('/api/settings?key=happyHour');
        const data = await res.json();
        if (data && data.start) promoSettings = data;
    } catch (e) {
        console.log('Error loading settings', e);
    }
}
document.addEventListener('DOMContentLoaded', loadPromoSettings);

// ตรวจสอบสมาชิก
async function checkMember() {
    const phone = document.getElementById('member-phone').value.trim();
    if (!phone) return Swal.fire('แจ้งเตือน', 'กรุณากรอกเบอร์โทร', 'warning');
    try {
        const res = await fetch(`/api/members/phone/${phone}`);
        if (res.ok) {
            currentMember = await res.json();
            document.getElementById('member-info-section').classList.remove('d-none');
            document.getElementById('member-name-display').innerText = currentMember.name;
            document.getElementById('member-points-display').innerText = currentMember.points + ' แต้ม';
            document.getElementById('use-points-input').value = 0;
            document.getElementById('use-points-input').max = currentMember.points;
            Swal.fire({
                title: 'พบข้อมูลสมาชิก',
                text: `ชื่อ: ${currentMember.name} มีแต้ม: ${currentMember.points} แต้ม`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            updateCart();
        } else {
            currentMember = null;
            document.getElementById('member-info-section').classList.add('d-none');
            Swal.fire('ไม่พบข้อมูล', 'ไม่พบสมาชิกเบอร์นี้ในระบบ (พิมพ์ผิดหรือยังไม่สมัคร)', 'error');
            updateCart();
        }
    } catch (e) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถตรวจสอบข้อมูลได้', 'error');
    }
}

// ฟังก์ชันสลับวิธีชำระเงิน
function togglePaymentMethod() {
    const method = document.getElementById('payment-method').value;
    const cashGroup = document.getElementById('cash-input-group');
    if (method === 'qr') {
        cashGroup.style.display = 'none'; // ซ่อนช่องรับเงินถ้าสแกนจ่าย
    } else {
        cashGroup.style.display = 'flex'; // โชว์ช่องรับเงินถ้าจ่ายเงินสด
    }
}

// 1. เพิ่มสินค้าลงตะกร้า
function addToCart(btn) {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const memberPrice = btn.dataset.memberPrice ? parseFloat(btn.dataset.memberPrice) : price;
    const stock = parseInt(btn.dataset.stock, 10);

    if (stock <= 0) {
        return Swal.fire('ขออภัย', 'สินค้าหมดสต๊อก!', 'warning');
    }

    let existingItem = cart.find(item => item.productId === id);
    if (existingItem) {
        if(existingItem.qty >= stock) {
            return Swal.fire('แจ้งเตือน', 'จำนวนสินค้าเกินสต๊อกที่มี!', 'warning');
        }
        existingItem.qty += 1;
    } else {
        cart.push({ productId: id, name: name, price: price, memberPrice: memberPrice, qty: 1 }); 
    }
    updateCart(); 
}

// 2. ลบสินค้าออกจากตะกร้า
function removeFromCart(id) {
    cart = cart.filter(item => item.productId !== id);
    updateCart();
}

// 3. อัปเดตหน้าจอคำนวณเงิน
function updateCart() {
    let cartHtml = '';
    let subTotal = 0;

    // ถ้าตะกร้าว่างเปล่า
    if (cart.length === 0) {
        document.getElementById('cart-items').innerHTML = '<div class="text-center text-distilled-muted py-5">ตะกร้าว่างเปล่า</div>';
        document.getElementById('total-price').innerText = '0 ฿';
        document.getElementById('discount').innerText = '0 ฿';
        document.getElementById('discount').value = '0'; 
        document.getElementById('promo-text').innerHTML = '';
        return;
    }

    // คำนวณยอดรวมสินค้าในตะกร้า 
    let hasMemberPriceItems = false;
    
    cart.forEach((item) => {
        let activePrice = (currentMember && item.memberPrice < item.price) ? item.memberPrice : item.price;
        let isUsingMemberPrice = (activePrice === item.memberPrice && activePrice < item.price);
        if (isUsingMemberPrice) hasMemberPriceItems = true;

        let itemTotal = activePrice * item.qty;
        subTotal += itemTotal;

        let priceTag = isUsingMemberPrice ? 
            `<span class="text-warning fw-bold">${activePrice} ฿</span> <span class="text-decoration-line-through text-muted" style="font-size: 0.75rem;">${item.price} ฿</span>` : 
            `${item.price} ฿`;

        cartHtml += `
            <div class="saas-surface p-3 mb-3 d-flex gap-2 align-items-center" style="border-radius: var(--radius-md); box-shadow: none; border: 1px solid var(--border-subtle);">
                <div style="flex: 1; min-width: 0;">
                    <p class="mb-1 text-truncate" style="font-weight: 700; font-size: 1rem; color: var(--saas-text-main); line-height: 1.2;">${item.name}</p>
                    <p class="mb-0" style="font-size: 0.85rem; color: var(--saas-text-muted);">${item.qty} ชิ้น &times; ${priceTag}</p>
                </div>
                <div class="text-end d-flex flex-column align-items-end justify-content-center" style="flex-shrink: 0; min-width: 80px;">
                    <p class="mb-2" style="font-weight: 800; color: var(--saas-primary); font-size: 1.15rem; line-height: 1;">${itemTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</p>
                    <button class="saas-btn saas-btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: var(--radius-sm); letter-spacing: 0.02em;" onclick="removeFromCart('${item.productId}')">
                        <i class="fa-solid fa-trash-can me-1"></i>ลบ
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById('cart-items').innerHTML = cartHtml;
    
    // 1. ส่วนลดจากแต้ม
    let pointDiscount = 0;
    let usedPoints = 0;
    if (currentMember) {
        usedPoints = parseInt(document.getElementById('use-points-input').value) || 0;
        if (usedPoints > currentMember.points) usedPoints = currentMember.points;
        if (usedPoints < 0) usedPoints = 0;
        pointDiscount = Math.floor(usedPoints / 10); // 10 แต้ม = 1 บาท
    }

    // 2. ส่วนลด Happy Hour
    let happyHourDiscount = 0;
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentMinutes = currentH * 60 + currentM;

    // ป้องกันกรณี admin ลืมกรอกหรือกรอกผิด
    let isHappyHour = false;
    if (promoSettings && promoSettings.start && promoSettings.end) {
        const startParts = promoSettings.start.split(':');
        const endParts = promoSettings.end.split(':');
        if (startParts.length === 2 && endParts.length === 2) {
            const startH = parseInt(startParts[0], 10);
            const startM = parseInt(startParts[1], 10);
            const endH = parseInt(endParts[0], 10);
            const endM = parseInt(endParts[1], 10);
            
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            isHappyHour = (currentMinutes >= startMinutes && currentMinutes <= endMinutes);
        }
    }

    if (isHappyHour) {
        
        let subtotalAfterPoints = subTotal - pointDiscount;
        if (subtotalAfterPoints < 0) subtotalAfterPoints = 0;
        let p = parseFloat(promoSettings.discountPercent) || 0;
        happyHourDiscount = subtotalAfterPoints * (p / 100);
    }

    let totalDiscount = pointDiscount + happyHourDiscount;

    document.getElementById('discount').innerText = totalDiscount.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ฿';
    document.getElementById('discount').value = totalDiscount;

    let promoTextHtml = '';
    if (pointDiscount > 0) {
        promoTextHtml += `<div class="text-success fw-medium">ลดจากแต้ม ${pointDiscount.toLocaleString()} บาท (ใช้ ${usedPoints} แต้ม)</div>`;
    }
    if (happyHourDiscount > 0) {
        promoTextHtml += `<div class="text-warning fw-bold"><i class="fa-solid fa-clock"></i> Happy Hour! ลด ${promoSettings.discountPercent}% = ${happyHourDiscount.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</div>`;
    }
    if (totalDiscount === 0) {
        promoTextHtml = `<span class="text-distilled-muted">ไม่มีส่วนลด</span>`;
    }
    
    document.getElementById('promo-text').innerHTML = promoTextHtml;

    let netTotal = subTotal - totalDiscount;
    if (netTotal < 0) netTotal = 0;

    document.getElementById('total-price').innerText = netTotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' ฿';
}

// 4. ชำระเงิน
async function checkout() {
    if (cart.length === 0) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกสินค้าก่อนชำระเงิน!', 'warning');

    let discount = parseFloat(document.getElementById('discount').value) || 0;
    let paymentMethod = document.getElementById('payment-method').value; // ดึงวิธีชำระเงิน
    let memberPhone = document.getElementById('member-phone') ? document.getElementById('member-phone').value.trim() : '';
    
    let subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let netTotal = subTotal - discount;

    let amountPaid = 0;
    let change = 0;

    let usedPoints = 0;
    if (currentMember) {
        usedPoints = parseInt(document.getElementById('use-points-input').value) || 0;
        if (usedPoints > currentMember.points) usedPoints = currentMember.points;
    }

    // เช็คเงื่อนไขตามวิธีชำระเงิน
    if (paymentMethod === 'cash') {
        amountPaid = parseFloat(document.getElementById('amount-paid').value) || 0;
        if (amountPaid < netTotal) {
            return Swal.fire('แจ้งเตือน', 'รับเงินมาไม่พอชำระค่าสินค้า!', 'error');
        }
        change = amountPaid - netTotal;
    } else if (paymentMethod === 'qr') {
        amountPaid = netTotal;
        change = 0;

        const qrResult = await Swal.fire({
            title: 'สแกน QR Code เพื่อชำระเงิน',
            html: `
                <h4 class="text-primary mb-3">ยอดชำระ: <b>${netTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท</b></h4>
                <img src="https://cdn.discordapp.com/attachments/1232314598535729266/1479852175612969171/Screenshot_20260307_214315_Gallery.jpg?ex=69c93abc&is=69c7e93c&hm=c61c15298c61f945a966e4eaacc78ec39f738a06e9a0b08032f8cc2f930772f8&${netTotal}" alt="PromptPay QR" style="width: 220px; border: 2px solid #1e88e5; border-radius: 15px; padding: 10px;">
                <p class="text-muted mt-3 mb-0 fs-6">กรุณารอให้ลูกค้าโอนเงินให้สำเร็จ<br>ก่อนกดปุ่มยืนยันด้านล่าง</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'ลูกค้าโอนเงินเรียบร้อย',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            allowOutsideClick: false
        });

        // ถ้ากดยกเลิกสแกน ให้หยุดการทำงาน
        if (!qrResult.isConfirmed) return;
    }

    try {
        const staffRes = await fetch('/api/staff');
        const staffs = await staffRes.json();
        if(staffs.length === 0) return Swal.fire('Error', 'ไม่พบข้อมูลพนักงานในระบบ', 'error');
        const staffId = staffs[0]._id;

        const cartToSend = cart.map(item => {
            let activePrice = (currentMember && item.memberPrice < item.price) ? item.memberPrice : item.price;
            return {
                productId: item.productId,
                qty: item.qty,
                price: activePrice
            };
        });

        const saleData = {
            receiptNumber: "REC-" + Date.now(),
            staffId: staffId,
            memberPhone: memberPhone,
            items: cartToSend,
            subTotal: subTotal,
            discount: discount,
            usedPoints: usedPoints,
            netTotal: netTotal,
            paymentMethod: paymentMethod,
            amountPaid: amountPaid,
            change: change
        };

        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });

        if (response.ok) {
            const resultData = await response.json();
            
            let successMsg = ``;
            if (paymentMethod === 'cash') successMsg += `เงินทอน: <b>${change} บาท</b><br><br>`;
            else successMsg += `ชำระผ่าน QR Code สำเร็จ<br><br>`;
            
            if (resultData.earnedPoints > 0) {
                successMsg += `<div class="p-2 bg-light rounded border border-warning">`;
                successMsg += `<span class="text-success fw-bold">คุณ ${resultData.memberName}</span><br>`;
                successMsg += `ได้รับแต้มสะสม <span class="text-warning fw-bold fs-4">${resultData.earnedPoints}</span> แต้ม 🌟`;
                successMsg += `</div>`;
            }

            Swal.fire({ title: ' ชำระเงินเรียบร้อย!', html: successMsg, icon: 'success' })
            .then(() => { window.location.reload(); });
        } else {
            const errData = await response.json();
            Swal.fire('ผิดพลาด', errData.error || 'บันทึกการขายไม่สำเร็จ', 'error');
        }
    } catch (error) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}