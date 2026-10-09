import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import (
    Branch, User, Customer, Loan, Collection, 
    CashDenomination, BankDeposit, ScheduledPayment, AuditLog
)

class Command(BaseCommand):
    help = 'Seeds PostgreSQL cashgrid_db with comprehensive assessment-ready data'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Create Branches
        b_mumbai, _ = Branch.objects.get_or_create(
            code="BR-MUM-01",
            defaults={
                "name": "Mumbai Central Branch",
                "city": "Mumbai",
                "state": "Maharashtra",
                "address": "402, Nariman Point, Mumbai 400021"
            }
        )
        b_delhi, _ = Branch.objects.get_or_create(
            code="BR-DEL-01",
            defaults={
                "name": "Delhi Connaught Branch",
                "city": "New Delhi",
                "state": "Delhi",
                "address": "12, Barakhamba Road, Connaught Place, New Delhi 110001"
            }
        )
        b_blr, _ = Branch.objects.get_or_create(
            code="BR-BLR-01",
            defaults={
                "name": "Bangalore Tech Branch",
                "city": "Bengaluru",
                "state": "Karnataka",
                "address": "88, Indiranagar 100ft Road, Bengaluru 560038"
            }
        )
        self.stdout.write(self.style.SUCCESS("Branches seeded."))

        # 2. Create Users
        # Super Admin
        super_admin, _ = User.objects.get_or_create(
            username="superadmin",
            defaults={
                "email": "superadmin@cashgrid.com",
                "first_name": "Super",
                "last_name": "Admin",
                "role": "super_admin",
                "is_staff": True,
                "is_superuser": True
            }
        )
        super_admin.set_password("123456789")
        super_admin.save()

        # Branch Manager / Admin
        branch_mgr, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "manager.mumbai@cashgrid.com",
                "first_name": "Vikram",
                "last_name": "Mehta",
                "role": "admin",
                "branch": b_mumbai,
                "branch_name": b_mumbai.name,
                "phone": "+91 98200 11223",
                "is_staff": True
            }
        )
        branch_mgr.set_password("123456789")
        branch_mgr.save()

        # Field Agents
        agent_rk, _ = User.objects.get_or_create(
            username="agent",
            defaults={
                "email": "rk.agent@cashgrid.com",
                "first_name": "Rahul",
                "last_name": "Kumar",
                "role": "agent",
                "branch": b_mumbai,
                "branch_name": b_mumbai.name,
                "phone": "+91 98765 43210"
            }
        )
        agent_rk.set_password("123456789")
        agent_rk.save()

        agent_aj, _ = User.objects.get_or_create(
            username="agent_aj",
            defaults={
                "email": "aj.agent@cashgrid.com",
                "first_name": "Amit",
                "last_name": "Joshi",
                "role": "agent",
                "branch": b_mumbai,
                "branch_name": b_mumbai.name,
                "phone": "+91 98111 22334"
            }
        )
        agent_aj.set_password("123456789")
        agent_aj.save()

        # Customer User (Akash Sharma)
        user_cust, _ = User.objects.get_or_create(
            username="user",
            defaults={
                "email": "akash.sharma@example.com",
                "first_name": "Akash",
                "last_name": "Sharma",
                "role": "customer",
                "phone": "+91 91234 56789"
            }
        )
        user_cust.set_password("123456789")
        user_cust.save()
        self.stdout.write(self.style.SUCCESS("Users seeded."))

        # 3. Create Customers
        cust_akash, _ = Customer.objects.get_or_create(
            phone="+91 91234 56789",
            defaults={
                "user": user_cust,
                "customer_code": "CUST-8921",
                "name": "Akash Sharma",
                "email": "akash.sharma@example.com",
                "address": "B-402, Green Glen Layout, Bellandur, Bengaluru",
                "branch": b_mumbai
            }
        )

        cust_priya, _ = Customer.objects.get_or_create(
            phone="+91 98765 00001",
            defaults={
                "customer_code": "CUST-1044",
                "name": "Priya Patel",
                "email": "priya.patel@example.com",
                "address": "12/A, MG Road, Fort, Mumbai",
                "branch": b_mumbai
            }
        )

        cust_rohit, _ = Customer.objects.get_or_create(
            phone="+91 98765 00002",
            defaults={
                "customer_code": "CUST-1088",
                "name": "Rohit Verma",
                "email": "rohit.verma@example.com",
                "address": "Flat 301, Sunrise Heights, Andheri West, Mumbai",
                "branch": b_mumbai
            }
        )
        self.stdout.write(self.style.SUCCESS("Customers seeded."))

        # 4. Create Loans
        # Active Loan for Akash Sharma
        loan_akash, _ = Loan.objects.get_or_create(
            loan_id="8921",
            defaults={
                "customer": cust_akash,
                "amount": Decimal("50000.00"),
                "outstanding_amount": Decimal("35000.00"),
                "interest_rate": Decimal("12.50"),
                "tenure_months": 12,
                "emi_amount": Decimal("5000.00"),
                "status": "active",
                "disbursed_at": timezone.now() - timedelta(days=90)
            }
        )

        # Closed Loan 1 for Akash Sharma
        loan_closed_1, _ = Loan.objects.get_or_create(
            loan_id="7420",
            defaults={
                "customer": cust_akash,
                "amount": Decimal("72000.00"),
                "outstanding_amount": Decimal("0.00"),
                "interest_rate": Decimal("11.00"),
                "tenure_months": 12,
                "emi_amount": Decimal("6000.00"),
                "status": "closed",
                "disbursed_at": timezone.now() - timedelta(days=450)
            }
        )

        # Closed Loan 2 for Akash Sharma
        loan_closed_2, _ = Loan.objects.get_or_create(
            loan_id="6105",
            defaults={
                "customer": cust_akash,
                "amount": Decimal("48000.00"),
                "outstanding_amount": Decimal("0.00"),
                "interest_rate": Decimal("13.00"),
                "tenure_months": 12,
                "emi_amount": Decimal("4000.00"),
                "status": "closed",
                "disbursed_at": timezone.now() - timedelta(days=800)
            }
        )

        # Active Loan for Priya
        loan_priya, _ = Loan.objects.get_or_create(
            loan_id="3041",
            defaults={
                "customer": cust_priya,
                "amount": Decimal("80000.00"),
                "outstanding_amount": Decimal("60000.00"),
                "interest_rate": Decimal("12.00"),
                "tenure_months": 16,
                "emi_amount": Decimal("5000.00"),
                "status": "active",
                "disbursed_at": timezone.now() - timedelta(days=60)
            }
        )
        self.stdout.write(self.style.SUCCESS("Loans seeded."))

        # 5. Create Collections
        col1, _ = Collection.objects.get_or_create(
            receipt_number="REC-A83BD91",
            defaults={
                "loan": loan_akash,
                "agent": agent_rk,
                "amount_collected": Decimal("5000.00"),
                "payment_method": "cash",
                "status": "branch_received",
                "branch_verified_by": branch_mgr,
                "branch_received_at": timezone.now() - timedelta(days=7),
                "discrepancy_amount": Decimal("0.00"),
            }
        )

        col2, _ = Collection.objects.get_or_create(
            receipt_number="REC-A72CC12",
            defaults={
                "loan": loan_akash,
                "agent": agent_rk,
                "amount_collected": Decimal("5000.00"),
                "payment_method": "upi",
                "status": "branch_received",
                "branch_verified_by": branch_mgr,
                "branch_received_at": timezone.now() - timedelta(days=37),
                "discrepancy_amount": Decimal("0.00"),
            }
        )

        col3, _ = Collection.objects.get_or_create(
            receipt_number="REC-B21MN99",
            defaults={
                "loan": loan_akash,
                "agent": agent_aj,
                "amount_collected": Decimal("5000.00"),
                "payment_method": "cash",
                "status": "branch_received",
                "branch_verified_by": branch_mgr,
                "branch_received_at": timezone.now() - timedelta(days=65),
                "discrepancy_amount": Decimal("0.00"),
            }
        )

        # Fresh Collection today (status: collected, awaiting branch reception)
        col_fresh, _ = Collection.objects.get_or_create(
            receipt_number="REC-D55KL88",
            defaults={
                "loan": loan_priya,
                "agent": agent_rk,
                "amount_collected": Decimal("5000.00"),
                "payment_method": "cash",
                "status": "collected",
                "discrepancy_amount": Decimal("0.00"),
            }
        )

        # Discrepancy Example (Demonstrating CMRS reconciliation feature!)
        col_disc, _ = Collection.objects.get_or_create(
            receipt_number="REC-DISC901",
            defaults={
                "loan": loan_priya,
                "agent": agent_aj,
                "amount_collected": Decimal("5000.00"),
                "payment_method": "cash",
                "status": "discrepancy",
                "branch_verified_by": branch_mgr,
                "branch_received_at": timezone.now() - timedelta(days=2),
                "discrepancy_amount": Decimal("500.00"),
                "discrepancy_reason": "Physical cash bag was ₹4500 (1 note of ₹500 short). Flagged for agent follow-up.",
            }
        )
        self.stdout.write(self.style.SUCCESS("Collections seeded."))

        # 6. Physical Cash Denominations (For Col 1 and Col Fresh)
        CashDenomination.objects.get_or_create(
            collection=col1,
            defaults={
                "notes_500": 8,   # 4000
                "notes_200": 3,   # 600
                "notes_100": 4,   # 400
                "total_calculated": Decimal("5000.00")
            }
        )
        CashDenomination.objects.get_or_create(
            collection=col_fresh,
            defaults={
                "notes_500": 10,  # 5000
                "total_calculated": Decimal("5000.00")
            }
        )
        self.stdout.write(self.style.SUCCESS("Cash Denominations seeded."))

        # 7. Bank Deposits
        dep1, _ = BankDeposit.objects.get_or_create(
            reference_number="DEP-HDFC-991204",
            defaults={
                "branch_manager": branch_mgr,
                "branch": b_mumbai,
                "amount": Decimal("15000.00"),
                "bank_name": "HDFC Bank (Nariman Point)",
                "account_number": "50200012948291",
                "status": "settled",
                "settled_at": timezone.now() - timedelta(days=5),
                "notes": "End of week batch deposit for Mumbai Central Branch collections."
            }
        )
        dep1.collections.set([col1, col2, col3])

        dep2, _ = BankDeposit.objects.get_or_create(
            reference_number="DEP-SBI-881023",
            defaults={
                "branch_manager": branch_mgr,
                "branch": b_mumbai,
                "amount": Decimal("20000.00"),
                "bank_name": "State Bank of India (Commercial)",
                "account_number": "38921102938",
                "status": "deposited",
                "notes": "Daily cash transfer deposit."
            }
        )
        self.stdout.write(self.style.SUCCESS("Bank Deposits seeded."))

        # 8. Scheduled Payments (EMIs)
        ScheduledPayment.objects.get_or_create(
            loan=loan_akash,
            scheduled_date=timezone.now() + timedelta(days=22),
            defaults={
                "amount": Decimal("5000.00"),
                "status": "pending",
                "reschedule_count": 0
            }
        )
        ScheduledPayment.objects.get_or_create(
            loan=loan_akash,
            scheduled_date=timezone.now() + timedelta(days=52),
            defaults={
                "amount": Decimal("5000.00"),
                "status": "pending",
                "reschedule_count": 0
            }
        )
        self.stdout.write(self.style.SUCCESS("Scheduled Payments seeded."))

        # 9. Audit Logs
        AuditLog.objects.get_or_create(
            action="COLLECTION_RECORDED",
            entity_type="Collection",
            entity_id=col1.receipt_number,
            defaults={
                "user": agent_rk,
                "details": {"amount": 5000, "payment_method": "cash", "loan_id": "8921"},
                "ip_address": "127.0.0.1"
            }
        )
        AuditLog.objects.get_or_create(
            action="BRANCH_RECONCILED",
            entity_type="Collection",
            entity_id=col1.receipt_number,
            defaults={
                "user": branch_mgr,
                "details": {"status": "branch_received", "discrepancy": 0},
                "ip_address": "127.0.0.1"
            }
        )
        AuditLog.objects.get_or_create(
            action="DISCREPANCY_FLAGGED",
            entity_type="Collection",
            entity_id=col_disc.receipt_number,
            defaults={
                "user": branch_mgr,
                "details": {"expected": 5000, "actual": 4500, "shortage": 500},
                "ip_address": "127.0.0.1"
            }
        )
        self.stdout.write(self.style.SUCCESS("Audit Logs seeded."))

        self.stdout.write(self.style.SUCCESS("All CashGrid database seeding completed successfully!"))
