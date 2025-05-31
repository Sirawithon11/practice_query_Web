# ใช้ image node  เป็น base verion20
FROM node:20

# ตั้ง working directory ใน container (สิ่งที่เรา copy หรือ ติดตั้งจะไปอยู่ใน app directory ของ docker)
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (หรือ yarn.lock ถ้าใช้ yarn)
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โปรเจกต์ทั้งหมดไปใน container
COPY . .


# สั่ง build (สำหรับ production ใช้ npm run  เพื่อนำไฟฟล์ที่เรา clone เข้ามารวบเป็นไฟล์เดียวให้กลายเป็น product, ถ้าแค่ dev ก็เปลี่ยนเป็น npm start หรือ npm run dev)
# RUN npm run build
# RUN npm run dev

# (ถ้าต้องการ run ใน production (npm run build)) แนะนำให้ใช้ serve หรือ http-server
# RUN npm install -g serve

#ไม่มีผมต่อการ map port แค่บอกให้ dev รู้ว่า Container นี้ run ที่ port 5000
EXPOSE 5000

# รันแอปด้วย serve
CMD ["npm", "run", "dev"]
