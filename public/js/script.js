// เก็บข้อมูลตะกร้าสินค้า
let cart = []; 

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
        cart.push({ productId: id, name: name, price: price, qty: 1 }); 
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
    cart.forEach((item) => {
        let itemTotal = item.price * item.qty;
        subTotal += itemTotal;
        cartHtml += `
            <div class="saas-surface p-3 mb-3 d-flex gap-2 align-items-center" style="border-radius: var(--radius-md); box-shadow: none; border: 1px solid var(--border-subtle);">
                <div style="flex: 1; min-width: 0;">
                    <p class="mb-1 text-truncate" style="font-weight: 700; font-size: 1rem; color: var(--saas-text-main); line-height: 1.2;">${item.name}</p>
                    <p class="mb-0" style="font-size: 0.85rem; color: var(--saas-text-muted);">${item.qty} ชิ้น &times; ${item.price} ฿</p>
                </div>
                <div class="text-end d-flex flex-column align-items-end justify-content-center" style="flex-shrink: 0; min-width: 80px;">
                    <p class="mb-2" style="font-weight: 800; color: var(--saas-primary); font-size: 1.15rem; line-height: 1;">${itemTotal.toLocaleString()} ฿</p>
                    <button class="saas-btn saas-btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: var(--radius-sm); letter-spacing: 0.02em;" onclick="removeFromCart('${item.productId}')">
                        <i class="fa-solid fa-trash-can me-1"></i>ลบ
                    </button>
                </div>
            </div>
        `;
    });

    document.getElementById('cart-items').innerHTML = cartHtml;
    
    let promoDiscount = Math.floor(subTotal / 500) * 30; 

    document.getElementById('discount').innerText = promoDiscount + ' ฿';
    document.getElementById('discount').value = promoDiscount;

    let promoText = document.getElementById('promo-text');
    if (promoDiscount > 0) {
        promoText.innerHTML = `<span class="text-success fw-medium">ลดไป ${promoDiscount} บาท!</span>`;
    } else {
        let needed = 500 - subTotal;
        promoText.innerHTML = `<span class="text-distilled-muted">อีก ${needed} ฿ จะได้ส่วนลด 30 บาท</span>`;
    }

    let netTotal = subTotal - promoDiscount;
    if (netTotal < 0) netTotal = 0;

    document.getElementById('total-price').innerText = netTotal.toLocaleString() + ' ฿';
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
                <h4 class="text-primary mb-3">ยอดชำระ: <b>${netTotal} บาท</b></h4>
                <img src="https://cdn.discordapp.com/attachments/1232314598535729266/1479852175612969171/Screenshot_20260307_214315_Gallery.jpg?ex=69ad8b3c&is=69ac39bc&hm=aae9e4cdaf5602bdf8d8ac1f1adc129bcc3a0eadee5aba3eebb6d223f83cba8f&" alt="PromptPay QR" style="width: 220px; border: 2px solid #1e88e5; border-radius: 15px; padding: 10px;">
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

        const saleData = {
            receiptNumber: "REC-" + Date.now(),
            staffId: staffId,
            memberPhone: memberPhone,
            items: cart,
            subTotal: subTotal,
            discount: discount,
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