// เก็บข้อมูลตะกร้าสินค้า
let cart = []; 

// 1. เพิ่มสินค้าลงตะกร้า
function addToCart(id, name, price, stock) {
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
        document.getElementById('cart-items').innerHTML = '<li class="list-group-item text-center text-muted border-0">ตะกร้าว่างเปล่า</li>';
        document.getElementById('total-price').innerText = '0';
        document.getElementById('discount').value = '0';
        document.getElementById('promo-text').innerHTML = '';
        return;
    }

    // คำนวณยอดรวมสินค้าในตะกร้า 
    cart.forEach((item) => {
        let itemTotal = item.price * item.qty;
        subTotal += itemTotal;
        cartHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 border rounded">
                <div>
                    <h6 class="my-0 text-primary">${item.name}</h6>
                    <small class="text-muted">${item.price} ฿ x ${item.qty}</small>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-dark fw-bold me-3">${itemTotal} ฿</span>
                    <button class="btn btn-sm btn-danger px-2 py-1" onclick="removeFromCart('${item.productId}')">
                        ลบ
                    </button>
                </div>
            </li>
        `;
    });

    document.getElementById('cart-items').innerHTML = cartHtml;
    
    let promoDiscount = Math.floor(subTotal / 500) * 30; 

    document.getElementById('discount').value = promoDiscount;

    let promoText = document.getElementById('promo-text');
    if (promoDiscount > 0) {
        promoText.innerHTML = `<span class="text-success fw-bold">ยินดีด้วย! คุณได้รับส่วนลดโปรโมชั่น ${promoDiscount} บาท</span>`;
    } else {
        let needed = 500 - subTotal;
        promoText.innerHTML = `<span class="text-muted" style="font-size: 0.85rem;">💡 ซื้ออีก <b>${needed} ฿</b> รับส่วนลด 30 บาททันที!</span>`;
    }

    let netTotal = subTotal - promoDiscount;
    if (netTotal < 0) netTotal = 0;

    document.getElementById('total-price').innerText = netTotal.toLocaleString();
}

// 4. ชำระเงิน
async function checkout() {
    if (cart.length === 0) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกสินค้าก่อนชำระเงิน!', 'warning');

    let discount = parseFloat(document.getElementById('discount').value) || 0;
    let amountPaid = parseFloat(document.getElementById('amount-paid').value) || 0;
    let memberPhone = document.getElementById('member-phone').value.trim();
    
    let subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let netTotal = subTotal - discount;

    if (amountPaid < netTotal) {
        return Swal.fire('แจ้งเตือน', 'รับเงินมาไม่พอชำระค่าสินค้า!', 'error');
    }

    let change = amountPaid - netTotal;

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
            paymentMethod: "cash",
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
            
            // ข้อความแจ้งเตือน
            let successMsg = `เงินทอน: <b>${change} บาท</b><br><br>`;
            
            if (resultData.earnedPoints > 0) {
                successMsg += `<div class="p-2 bg-light rounded border border-warning">`;
                successMsg += `<span class="text-success fw-bold">คุณ ${resultData.memberName}</span><br>`;
                successMsg += `ได้รับแต้มสะสม <span class="text-warning fw-bold fs-4">${resultData.earnedPoints}</span> แต้ม 🌟`;
                successMsg += `</div>`;
            }

            Swal.fire({
                title: '✅ ชำระเงินเรียบร้อย!',
                html: successMsg,
                icon: 'success'
            }).then(() => {
                window.location.reload(); 
            });
        } else {
            const errData = await response.json();
            Swal.fire('ผิดพลาด', errData.error || 'บันทึกการขายไม่สำเร็จ', 'error');
        }
    } catch (error) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    }
}