import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmrs.settings')
django.setup()

from PIL import Image, ImageDraw, ImageFont
from api.models import Collection, BankDeposit

media_dir = os.path.join(os.path.dirname(__file__), 'media')
os.makedirs(os.path.join(media_dir, 'receipts'), exist_ok=True)
os.makedirs(os.path.join(media_dir, 'deposits'), exist_ok=True)

# Generate realistic receipt photos for collections
for c in Collection.objects.all():
    img = Image.new('RGB', (650, 850), color=(244, 241, 234))
    d = ImageDraw.Draw(img)
    
    # Paper boundary with subtle shading
    d.rectangle([(25, 25), (625, 825)], fill=(255, 255, 255), outline=(200, 195, 185), width=2)
    d.line([(25, 30), (625, 30)], fill=(225, 220, 210), width=1)
    
    # Organization Header
    d.text((180, 50), "ARTH MICROFINANCE LIMITED", fill=(15, 23, 42))
    d.text((150, 75), "FIELD LOAN COLLECTION RECEIPT", fill=(71, 85, 105))
    d.text((195, 95), "Customer Acknowledgment Copy", fill=(100, 116, 139))
    d.line([(45, 120), (605, 120)], fill=(203, 213, 225), width=2)
    
    # Receipt Details
    d.text((55, 140), f"Receipt Number : {c.receipt_number}", fill=(15, 23, 42))
    date_str = c.collected_at.strftime("%d-%b-%Y %I:%M %p") if c.collected_at else "09-Oct-2026 11:30 AM"
    d.text((55, 175), f"Date & Time    : {date_str}", fill=(51, 65, 85))
    
    agent_name = c.agent.username if c.agent else "field_agent"
    d.text((55, 210), f"Collected By   : Agent {agent_name} (Code: AG-8812)", fill=(51, 65, 85))
    
    borrower_name = c.loan.customer.name if (c.loan and c.loan.customer) else "Akash Sharma"
    loan_code = c.loan.loan_id if c.loan else "LN-1001"
    d.text((55, 245), f"Borrower Name  : {borrower_name}", fill=(51, 65, 85))
    d.text((55, 280), f"Loan Account   : {loan_code}", fill=(51, 65, 85))
    d.text((55, 315), f"Payment Mode   : Cash (Handed over in person)", fill=(51, 65, 85))
    
    d.line([(45, 350), (605, 350)], fill=(203, 213, 225), width=1)
    
    # Highlight Box for Amount
    d.rectangle([(55, 375), (595, 475)], fill=(240, 253, 244), outline=(34, 197, 94), width=2)
    d.text((210, 395), "TOTAL CASH RECEIVED", fill=(22, 101, 52))
    d.text((215, 425), f"INR  {float(c.amount_collected):,.2f}", fill=(21, 128, 61))
    
    # Denominations
    d.text((55, 510), "Cash Denominations Verified:", fill=(71, 85, 105))
    d.text((75, 540), f"  * INR 500  x {int(c.amount_collected // 500)} notes", fill=(100, 116, 139))
    if c.amount_collected % 500 > 0:
        d.text((75, 565), f"  * INR 100  x {int((c.amount_collected % 500) // 100)} notes", fill=(100, 116, 139))
        
    # Physical Stamp Effect
    d.rectangle([(360, 610), (580, 690)], outline=(220, 38, 38), width=3)
    d.text((385, 625), "PAID & VERIFIED", fill=(220, 38, 38))
    d.text((400, 650), "OFFICIAL STAMP", fill=(220, 38, 38))
    d.text((410, 670), "ARTH MFI", fill=(220, 38, 38))
    
    # Signatures
    d.text((55, 715), "Agent Signature :", fill=(71, 85, 105))
    d.line([(185, 730), (320, 730)], fill=(30, 41, 59), width=2)
    d.text((55, 755), "Customer Sign   :", fill=(71, 85, 105))
    d.line([(185, 770), (320, 770)], fill=(30, 41, 59), width=2)
    d.text((55, 795), "Status: Recorded via Field Handheld Unit", fill=(148, 163, 184))
    
    rel_path = f"receipts/{c.receipt_number.lower().replace('-', '_')}.jpg"
    full_path = os.path.join(media_dir, rel_path)
    img.save(full_path, "JPEG", quality=92)
    c.receipt_image = rel_path
    c.save()
    print(f"Created receipt photo: {rel_path}")

# Also generate realistic bank deposit slip photos for existing bank deposits
for d_rec in BankDeposit.objects.all():
    img = Image.new('RGB', (700, 900), color=(240, 245, 250))
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(25, 25), (675, 875)], fill=(255, 255, 255), outline=(190, 205, 220), width=2)
    draw.text((180, 50), f"{d_rec.bank_name.upper()}", fill=(30, 58, 138))
    draw.text((195, 75), "CASH DEPOSIT CHALLAN / PAY-IN-SLIP", fill=(59, 130, 246))
    draw.text((220, 95), "BRANCH DUPLICATE COUNTERFOIL", fill=(100, 116, 139))
    draw.line([(45, 120), (655, 120)], fill=(203, 213, 225), width=2)
    
    draw.text((55, 145), f"Deposit Ref / UTR : {d_rec.reference_number}", fill=(15, 23, 42))
    date_str = d_rec.deposited_at.strftime("%d-%b-%Y %I:%M %p") if d_rec.deposited_at else "09-Oct-2026"
    draw.text((55, 180), f"Date of Deposit   : {date_str}", fill=(51, 65, 85))
    draw.text((55, 215), f"Depositor Name    : {d_rec.branch_manager.username if d_rec.branch_manager else 'Branch Admin'}", fill=(51, 65, 85))
    draw.text((55, 250), f"Account Number    : {d_rec.account_number or '38921102938 (Current A/C)'}", fill=(51, 65, 85))
    draw.text((55, 285), f"Account Title     : ARTH Microfinance Branch Vault Account", fill=(51, 65, 85))
    
    draw.rectangle([(55, 335), (645, 435)], fill=(239, 246, 255), outline=(59, 130, 246), width=2)
    draw.text((220, 355), "DEPOSITED CASH AMOUNT", fill=(30, 64, 175))
    draw.text((230, 385), f"INR  {float(d_rec.amount):,.2f}", fill=(29, 78, 216))
    
    if d_rec.notes:
        draw.text((55, 470), f"Depositor Shortfall Notes : {d_rec.notes}", fill=(180, 83, 9))
        
    draw.rectangle([(380, 580), (630, 680)], outline=(37, 99, 235), width=3)
    draw.text((405, 600), "CASH RECEIVED & STAMPED", fill=(37, 99, 235))
    draw.text((435, 625), "BANK TELLER SEAL", fill=(37, 99, 235))
    draw.text((455, 650), "OFFICIAL", fill=(37, 99, 235))
    
    draw.text((55, 720), "Bank Cashier Sign : __________________", fill=(71, 85, 105))
    draw.text((55, 760), "Branch Manager    : __________________", fill=(71, 85, 105))
    
    rel_path = f"deposits/{d_rec.reference_number.lower().replace('-', '_')}.jpg"
    full_path = os.path.join(media_dir, rel_path)
    img.save(full_path, "JPEG", quality=92)
    d_rec.deposit_slip = rel_path
    d_rec.save()
    print(f"Created deposit slip photo: {rel_path}")

print("All photos generated and saved successfully!")
