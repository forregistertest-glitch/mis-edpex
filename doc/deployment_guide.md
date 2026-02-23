# 🚀 คู่มือการเตรียมความพร้อมและ Deployment (GitHub & Vercel)

คู่มือนี้สรุปขั้นตอนการนำโปรเจกต์ขึ้น GitHub และการตั้งค่าบน Vercel เพื่อให้ระบบทำงานได้สมบูรณ์

---

## 1. การเตรียมความพร้อมบนเครื่อง (Git Preparation)

เพื่อให้มั่นใจว่าข้อมูลสำคัญไม่หลุดออกไป และโปรเจกต์สะอาดพร้อมใช้งาน:

### ตรวจสอบความถูกต้อง
1.  **Check `.gitignore`**: ตรวจสอบว่ามีไฟล์ `.env.local` หรือไฟล์ที่เป็นความลับอยู่ในลิสต์ที่ต้องข้ามหรือไม่ (ระบบปัจจุบันตั้งไว้ให้ข้าม `.env*` เรียบร้อยแล้ว)
2.  **Lint Check**: รันคำสั่งตรวจสอบ Error ใน Code
    ```bash
    npm run lint
    ```
3.  **Build Check**: ทดสอบ Build บนเครื่องเพื่อให้มั่นใจว่าไม่มี Error บน Vercel
    ```bash
    npm run build
    ```

---

## 2. การนำขึ้นสู่ GitHub (Push to GitHub)

หากคุณมี Repository บน GitHub แล้ว ให้ทำตามคำสั่งนี้ใน Terminal:

### กรณีเชื่อมต่อครั้งแรก
```bash
# 1. ตรวจสอบสถานะไฟล์
git status

# 2. เพิ่มไฟล์ทั้งหมดเข้าสู่การติดตาม
git add .

# 3. Commit งาน
git commit -m "feat: complete research module with NCBI and Scopus integration"

# 4. ระบุที่อยู่ Repository (แทนที่ <URL> ด้วย URL ของคุณ)
git remote add origin <URL-GITHUB-REPO>

# 5. Push ขึ้น Branch หลัก
git push -u origin main
```

---

## 3. การเปิดใช้งานผ่าน Vercel (Deployment)

1.  **เข้าสู่ระบบ [Vercel](https://vercel.com/)** และกดที่ปุ่ม **"Add New"** > **"Project"**
2.  **Import GitHub Repository**: เลือก Repository ที่คุณเพิ่ง Push ขึ้นไป
3.  **Configure Project**:
    - **Framework Preset**: เลือก `Next.js` (ปกติระบบจะตรวจจับให้เอง)
    - **Environment Variables**: **(สำคัญมาก)** ต้องนำค่าจากไฟล์ `.env.local` ในเครื่องไปใส่ในช่องนี้ทั้งหมด เช่น:
        - `NEXT_PUBLIC_FIREBASE_API_KEY`
        - `SCOPUS_API_KEY`
        - `SCOPUS_INST_TOKEN`
        - (ค่าอื่นๆ ที่อยู่ใน `.env.local`)
4.  **Deploy**: กดปุ่ม **Deploy** แล้วรอจนกว่าระบบจะทำงานสำเร็จ

---

## ⚠️ ข้อควรระวังหลังการ Deploy
- **Firebase Authentication**: อย่าลืมนำโดเมนของ Vercel (เช่น `mis-edpex.vercel.app`) ไปเพิ่มใน **Authorized Domains** ของ Firebase Console เพื่อให้ระบบ Login ทำงานได้
- **Vercel Usage**: โปรดระวังเรื่อง Quota ของ Vercel (Hobby plan) หากมีการดึงข้อมูลขนาดใหญ่จำนวนมาก

> [!TIP]
> หากต้องการอัปเดตระบบในอนาคต เพียงแค่คุณทำการ `git push` ขึ้น GitHub ระบบ Vercel จะทำการ Re-deploy ให้อัตโนมัติครับ!
