import pandas as pd
import os
import sys

def convert_excel_to_csv():
    print("==============================================")
    print("      โปรแกรมแปลง Excel เป็น CSV ทุก Sheets      ")
    print("==============================================")
    
    # รับค่าไฟล์จากการ "ลากมาวาง" หรือพิมพ์ชื่อไฟล์
    if len(sys.argv) > 1:
        file_path = sys.argv[1].strip('"')
    else:
        file_path = input("กรุณาลากไฟล์ Excel มาวางในหน้าต่างนี้แล้วกด Enter: ").strip('"')

    # ตรวจสอบว่าไฟล์มีอยู่จริงไหม
    if not os.path.exists(file_path):
        print(f"\n[Error] หาไฟล์ไม่พบ: {file_path}")
        print("ตรวจสอบว่าชื่อไฟล์ถูกต้องและไม่มีอักขระพิเศษ")
        return

    try:
        print(f"\nกำลังอ่านไฟล์: {os.path.basename(file_path)}")
        base_name = os.path.splitext(file_path)[0]
        
        # อ่านทุก Sheet
        excel_data = pd.read_excel(file_path, sheet_name=None)
        
        print(f"พบทั้งหมด {len(excel_data)} Sheets กำลังเริ่มแปลง...")
        
        for sheet_name, df in excel_data.items():
            # ตั้งชื่อไฟล์: ชื่อไฟล์เดิม_ชื่อชีต.csv
            file_out = f"{base_name}_{sheet_name}.csv"
            
            # บันทึกไฟล์ (utf-8-sig เพื่อให้ภาษาไทยไม่เพี้ยน)
            df.to_csv(file_out, index=False, encoding='utf-8-sig')
            print(f"  > สร้างเสร็จ: {os.path.basename(file_out)}")
            
        print("\n----------------------------------------------")
        print("เสร็จสมบูรณ์! ไฟล์ CSV จะอยู่ในโฟลเดอร์เดียวกับไฟล์ Excel")
        
    except Exception as e:
        print(f"\n[เกิดข้อผิดพลาด] : {str(e)}")

if __name__ == "__main__":
    convert_excel_to_csv()
    print("\n----------------------------------------------")
    input("กด Enter เพื่อปิดหน้าต่างนี้...")