const express = require('express') ;
const dotenv = require('dotenv') ;
const itemRouter = require('./routes/items');
const connectDB = require('./config/DB');
const cors = require('cors') ;
dotenv.config({path:'./config/config.env'}) ;
connectDB();

const app = express() ;
app.use(cors({
    origin: 'http://localhost:3000', // หรือใช้ '*' ถ้าไม่จำกัด
    credentials: true
  }));
app.set('query parser', 'extended'); //ช่วยสำหรับ การ แปลง query พวก  gt และ lt เช่น 'price[$gt]': '20'  ต้องแปลงเป็น { price: { gt: '20' } } mongoose ถึงจะเข้าใจ
app.use(express.json()) ; //เป็นการช่วยให้ backend อ่านข้อมูล Json จาก req.body ได้ 
// และแปลงเป็น Js Object ทำให้เราเข้าถึงข้อมูล req.body ได้ (ไม่เกี่ยวกับการดึงข้อมูล จาก DB แต่เกี่ยวเฉพาะการส่งข้อมูลผ่าน body เท่านั้น)

app.use('/api/v1/items',itemRouter) ;



const server = app.listen(process.env.NODE_PORT , console.log("Server is running on " , process.env.NODE_PORT ," and Status is " , process.env.NODE_ENV));
// process.on('unhandledRejection',(err,promise)=>{
//     console.log(`Error: ${err.message}`);
//     server.close(()=>process.exit(1)) ;
// });