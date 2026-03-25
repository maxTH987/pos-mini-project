require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Product = require('./models/Product'); 
const Staff = require('./models/Staff');
const Member = require('./models/Member');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public')); 

app.set('view engine', 'ejs');
app.set('views', './views'); 

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const staffRoutes = require('./routes/staffRoutes');
app.use('/api/staff', staffRoutes); 
const memberRoutes = require('./routes/memberRoutes');
app.use('/api/members', memberRoutes);
const saleRoutes = require('./routes/saleRoutes');
app.use('/api/sales', saleRoutes);
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
          console.log('Connected to MongoDB Successfully!');
          createDefaultAdmin();
      })
      .catch((err) => console.error('MongoDB Connection Error:', err));
}

app.get('/login', (req, res) => {
    res.render('login'); 
});

// 1. หน้าแรก
app.get('/', async (req, res) => {
    const products = await Product.find(); 
    res.render('index', { products: products }); 
});

// 2. หน้าจัดการพนักงาน
app.get('/staff', async (req, res) => {
    const staffList = await Staff.find(); 
    res.render('staff', { staffList: staffList }); 
});

// 3. หน้าจัดการสมาชิก
app.get('/members', async (req, res) => {
    const members = await Member.find(); 
    res.render('members', { members: members }); 
});

// 4. หน้าจัดการสินค้า
app.get('/products', async (req, res) => {
    const products = await Product.find(); 
    res.render('products', { products: products }); 
});

// 5. หน้ารายงาน
app.get('/reports', (req, res) => {
    res.render('reports'); 
});

async function createDefaultAdmin() {
    try {
        // ค้นหาว่ามี user 'admin' อยู่ในระบบแล้วหรือยัง
        const adminUser = await Staff.findOne({ username: 'admin' });
        
        if (!adminUser) {
            const defaultAdmin = new Staff({
                username: 'admin',
                password: '1234',
                name: 'ผู้ดูแลระบบสูงสุด',
                role: 'owner'
            });
            await defaultAdmin.save();
            console.log('สร้างบัญชี Admin เริ่มต้นสำเร็จ (admin / 1234)');
        }
    } catch (err) {
        console.error('ไม่สามารถสร้างหรืออัปเดตบัญชี Admin ได้:', err);
    }
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
