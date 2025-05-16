const modelItem = require('../models/item') ;

exports.getItems = async (req,res,next)=> {
    try {
        // 1. BUILD QUERY OBJECT
        // clone req.query เพื่อนำมาใช้เป็น filter (เอา fields ที่เราไม่ใช้ในการ filter ออกก่อน)
        const queryObj = { ...req.query };
        // — สร้างสำเนาแบบ shallow copy ของ req.query ด้วย spread operator
        // — เพื่อไม่ให้การลบหรือแก้ไขต่อไปกระทบกับ req.query ต้นฉบับ
      
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        // — กำหนดรายการของ query parameters ที่จะไม่เอามาใช้ในการ filter
        //   (เพราะพวกนี้ใช้สำหรับ pagination, sorting, field selection)
      
        excludeFields.forEach(el => delete queryObj[el]);
        // — ลูปผ่าน excludeFields แล้วลบ property ที่ตรงกันใน queryObj
        //   (เช่น ถ้า req.query มี page, sort, limit, fields จะถูกลบจาก queryObj)
      
        // 1.1 ADVANCED FILTERING (e.g. gte, gt, lte, lt)
        let queryStr = JSON.stringify(queryObj);
        // — แปลง JavaScript object เป็น JSON string
        //   (เพื่อให้ง่ายต่อการ replace คำที่ต้องการ)
      
        // แปลง ?price[gte]=1000 เป็น { price: { $gte: 1000 } }
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // — ใช้ regex หา key เช่น “gte”, “gt”, “lte”, “lt” แล้วเติม “$” ข้างหน้า
        //   เพื่อให้ตรงกับ syntax ของ MongoDB operators
      
        let query = modelItem.find(JSON.parse(queryStr));
        // — แปลงกลับจาก JSON string เป็น object
        // — เรียกเมธอด find() ของ Mongoose model โดยส่ง filter object ที่ได้
      
        // 2. SORTING
        if (req.query.sort) {
          // ถ้ามีการส่ง sort parameter มา (เช่น ?sort=price,-createdAt)
          const sortBy = req.query.sort.split(',').join(' ');
          // — แยกค่าที่คั่นด้วย comma แล้วเปลี่ยนเป็น space เพื่อ pass เข้า .sort()
          query = query.sort(sortBy);
          // — เรียงลำดับผลลัพธ์ตามฟิลด์ที่ user ระบุ
        } else {
          // default sort
          query = query.sort('-createdAt');
          // — ถ้าไม่มี sort parameter มากำหนด จะเรียงจาก createdAt มากไปน้อย (ใหม่สุดก่อน)
        }
      
        // 3. FIELD SELECTION
        if (req.query.fields) {
          // ถ้ามีการส่ง fields parameter มา (เช่น ?fields=name,price,description)
          const fields = req.query.fields.split(',').join(' ');
          // — แปลง comma-separated list เป็น space-separated list
          query = query.select(fields);
          // — เลือกเฉพาะฟิลด์ที่ user ต้องการแสดง
        } else {
          // exclude internal fields by default
          query = query.select('-__v');
          // — ถ้าไม่มี fields parameter จะตัดทิ้ง __v (version key ของ Mongoose) ออก
        }
      
        // 4. PAGINATION
        const page = parseInt(req.query.page, 10) || 1;
        // — แปลง req.query.page เป็นเลขจำนวนเต็ม (default = 1)
        const limit = parseInt(req.query.limit, 10) || 100;
        // — แปลง req.query.limit เป็นจำนวนรายการต่อหน้า (default = 100)
        const skip = (page - 1) * limit;
        // — คำนวณจำนวนรายการที่จะข้าม (skip) ตามหน้าและ limit
      
        query = query.skip(skip).limit(limit);
        // — เพิ่ม skip() และ limit() ให้กับ query เพื่อทำ pagination
        let totalsConst ;
        // ถ้าขอหน้าที่เกิน จะ throw error
        if (req.query.page) {
          const totalDocs = await modelItem.countDocuments(JSON.parse(queryStr));
          totalsConst = totalDocs ;
          // — นับจำนวนเอกสารทั้งหมดที่ตรงกับ filter
          if (skip >= totalDocs) {
            return res.status(404).json({
              success: false,
              message: 'Page not found'
            });
            // — ถ้า skip มากกว่าหรือเท่ากับ totalDocs แสดงว่า user ขอหน้าที่ไม่มีข้อมูล
            // — ตอบ 404 พร้อมข้อความ “Page not found”
          }
        }
      
        // EXECUTE QUERY
        const items = await query;
        // — รอผลลัพธ์จาก database
      
        console.log(items);
        // — แสดงผลลัพธ์ใน console (สำหรับ debug)
      
        // RESPONSE
        res.status(200).json({
          success: true,
          amount: items.length,
          data: items,
          total : totalsConst
        });
        // — ส่ง response กลับ client: สถานะ success, จำนวนรายการ, และ data จริง
      } catch (err) {
        console.error(err);
        // — ถ้ามี error เกิดขึ้นในบล็อก try จะหลุดมาที่ catch
      
        res.status(500).json({
          success: false,
          message: 'getItems failed',
          error: err.message
        });
        // — ตอบกลับ client ว่า server error พร้อมรายละเอียดข้อผิดพลาด
      }

}


exports.getItem = async (req,res,next)=> {
    try{
        const items = await modelItem.findById(req.params.id) ;
        console.log(items) ;

        res.status(200).json({
            success : true ,
            data : items
        })
    } catch(err){
        console.log(err) ;
        res.status(500).json({
            success : false ,
            message : "deleteItems is Fails"
        })
    }

}




exports.createItem = async (req,res,next)=> {
    try{
        const {price} = req.body ;
        if (price > 100) { //กรณีมีการสร้างเงื่อนไข ต่างๆ
            return res.status(400).json({
                success: false,
                message: 'ราคามากกว่า 100',
                alert: true   // ส่ง flag ให้ frontend แสดง alert
            });
        }
        const items = await modelItem.create(req.body) ;
        console.log(items) ; // items ที่ได้เป็น  Js Object เลย เพราะ mongoose ช่วย เนื่องจาก ต้องมีการนำค่าไปเก็บใน DB
        // แต่ใน fronted ต้องแปลง Json เป็น Js object โดยใช้ .json ก่อน
        res.status(201).json({
            success : true ,
            data : items
        })

    } catch(err){
        console.log(err) ;
        res.status(500).json({ // .json(...) เป็นการแปลง Js Object เป็น Json สำหรับการส่งผ่าน http
            success : false ,
            message : "addItems is Fails"
        })
    }

}


exports.updateItems = async (req,res,next)=> {
    try{
        const items = await modelItem.findByIdAndUpdate(req.params.id ,req.body,{
            new : true ,
            runValidators : true
        }) ;
        console.log(items) ;

        res.status(200).json({
            success : true ,
            data : items
        })
    } catch(err){
        console.log(err) ;
        res.status(500).json({
            success : false ,
            message : "updateItems is Fails"
        })
    }

}


exports.deleteItems = async (req,res,next)=> {
    try{
        const items = await modelItem.findByIdAndDelete(req.params.id) ;
        console.log(items) ;

        res.status(200).json({
            success : true ,
            data : items
        })
    } catch(err){
        console.log(err) ;
        res.status(500).json({
            success : false ,
            message : "deleteItems is Fails"
        })
    }

}