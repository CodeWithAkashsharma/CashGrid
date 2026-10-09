import os
import django
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmrs.settings')
django.setup()

from api.models import User, Branch, Customer, Loan, Collection, ScheduledPayment, BankDeposit, CashDenomination

def populate_sample_data():
    branch = Branch.objects.first()
    if not branch:
        branch = Branch.objects.create(
            code='BR-MUM-01',
            name='Mumbai Central Branch',
            city='Mumbai',
            state='Maharashtra',
            address='123 Finance Street, Mumbai',
            is_active=True
        )
        print("Created default Mumbai Central Branch.")

    # 1. Base users
    user_cust = User.objects.filter(username='user').first()
    agent = User.objects.filter(username='agent').first()
    admin = User.objects.filter(username='admin').first()

    # 2. Customer 1: John Customer (linked to login user 'user')
    if user_cust:
        c_john, _ = Customer.objects.get_or_create(
            customer_code='CUST-001',
            defaults={
                'user': user_cust,
                'name': 'John Customer',
                'phone': '9876543210',
                'email': 'user@example.com',
                'address': '123 Customer Lane, Mumbai',
                'branch': branch
            }
        )
    else:
        c_john = None

    # Customer 2: Rajesh Kumar
    c_rajesh, _ = Customer.objects.get_or_create(
        customer_code='CUST-002',
        defaults={
            'name': 'Rajesh Kumar',
            'phone': '+91 98765 43210',
            'email': 'rajesh.kumar@example.com',
            'address': 'Flat 302, Gokul Apts, Goregaon West, Mumbai',
            'branch': branch
        }
    )

    # Customer 3: Anita Sharma
    c_anita, _ = Customer.objects.get_or_create(
        customer_code='CUST-003',
        defaults={
            'name': 'Anita Sharma',
            'phone': '+91 98112 87640',
            'email': 'anita.sharma@example.com',
            'address': 'Plot 14, Sector 7, Andheri East, Mumbai',
            'branch': branch
        }
    )

    # Customer 4: Suresh Verma
    c_suresh, _ = Customer.objects.get_or_create(
        customer_code='CUST-004',
        defaults={
            'name': 'Suresh Verma',
            'phone': '+91 97234 11209',
            'email': 'suresh.verma@example.com',
            'address': 'Shanti Nagar, Dadar West, Mumbai',
            'branch': branch
        }
    )

    # Customer 5: Meena Patel
    c_meena, _ = Customer.objects.get_or_create(
        customer_code='CUST-005',
        defaults={
            'name': 'Meena Patel',
            'phone': '+91 94520 89123',
            'email': 'meena.patel@example.com',
            'address': 'B-12, Sundar Vihar, Borivali West, Mumbai',
            'branch': branch
        }
    )

    print("Populated all 5 Customer profiles.")

    # 3. Create Loans
    loans_to_create = [
        {
            'loan_id': 'LN-8921',
            'customer': c_rajesh,
            'amount': Decimal('50000.00'),
            'outstanding_amount': Decimal('45000.00'),
            'interest_rate': Decimal('12.0'),
            'tenure_months': 12,
            'emi_amount': Decimal('4500.00'),
            'status': 'active',
            'disbursed_days_ago': 60
        },
        {
            'loan_id': 'LN-4412',
            'customer': c_anita,
            'amount': Decimal('30000.00'),
            'outstanding_amount': Decimal('0.00'),
            'interest_rate': Decimal('10.0'),
            'tenure_months': 6,
            'emi_amount': Decimal('2800.00'),
            'status': 'closed',
            'disbursed_days_ago': 210
        },
        {
            'loan_id': 'LN-6190',
            'customer': c_suresh,
            'amount': Decimal('150000.00'),
            'outstanding_amount': Decimal('120000.00'),
            'interest_rate': Decimal('15.0'),
            'tenure_months': 24,
            'emi_amount': Decimal('7200.00'),
            'status': 'active',
            'disbursed_days_ago': 90
        },
        {
            'loan_id': 'LN-3091',
            'customer': c_meena,
            'amount': Decimal('40000.00'),
            'outstanding_amount': Decimal('0.00'),
            'interest_rate': Decimal('11.0'),
            'tenure_months': 10,
            'emi_amount': Decimal('3600.00'),
            'status': 'closed',
            'disbursed_days_ago': 300
        },
    ]

    if c_john:
        loans_to_create.append({
            'loan_id': 'LN-1001',
            'customer': c_john,
            'amount': Decimal('50000.00'),
            'outstanding_amount': Decimal('45000.00'),
            'interest_rate': Decimal('12.5'),
            'tenure_months': 12,
            'emi_amount': Decimal('4500.00'),
            'status': 'active',
            'disbursed_days_ago': 45
        })

    created_loans = {}
    for ld in loans_to_create:
        loan, _ = Loan.objects.get_or_create(
            loan_id=ld['loan_id'],
            defaults={
                'customer': ld['customer'],
                'amount': ld['amount'],
                'outstanding_amount': ld['outstanding_amount'],
                'interest_rate': ld['interest_rate'],
                'tenure_months': ld['tenure_months'],
                'emi_amount': ld['emi_amount'],
                'status': ld['status'],
                'disbursed_at': timezone.now() - timedelta(days=ld['disbursed_days_ago'])
            }
        )
        created_loans[ld['loan_id']] = loan
        print(f"Loaded Loan {ld['loan_id']} for {ld['customer'].name} (Status: {ld['status']}).")

    # 4. Scheduled Payments for Active Loans
    for lid in ['LN-8921', 'LN-6190', 'LN-1001']:
        if lid in created_loans:
            l_obj = created_loans[lid]
            for i in range(3):
                ScheduledPayment.objects.get_or_create(
                    loan=l_obj,
                    scheduled_date=timezone.now() + timedelta(days=30 * (i + 1)),
                    defaults={
                        'amount': l_obj.emi_amount,
                        'status': 'pending'
                    }
                )

    # 5. Past and Pending Collections
    if agent:
        # Collection for Anita (closed loan)
        if 'LN-4412' in created_loans:
            col1, _ = Collection.objects.get_or_create(
                receipt_number='REC-4412-01',
                defaults={
                    'loan': created_loans['LN-4412'],
                    'agent': agent,
                    'amount_collected': Decimal('10000.00'),
                    'payment_method': 'cash',
                    'status': 'branch_received',
                    'collected_at': timezone.now() - timedelta(days=20)
                }
            )

        # Collection for Suresh (partial payment)
        if 'LN-6190' in created_loans:
            col2, _ = Collection.objects.get_or_create(
                receipt_number='REC-6190-01',
                defaults={
                    'loan': created_loans['LN-6190'],
                    'agent': agent,
                    'amount_collected': Decimal('7200.00'),
                    'payment_method': 'cash',
                    'status': 'collected',
                    'collected_at': timezone.now() - timedelta(hours=3)
                }
            )

        # Collection for John
        if 'LN-1001' in created_loans:
            col3, _ = Collection.objects.get_or_create(
                receipt_number='REC-1001-01',
                defaults={
                    'loan': created_loans['LN-1001'],
                    'agent': agent,
                    'amount_collected': Decimal('5000.00'),
                    'payment_method': 'upi',
                    'status': 'branch_received',
                    'collected_at': timezone.now() - timedelta(days=12)
                }
            )

        print("Collections populated successfully.")

    # 6. Bank Deposits (for Branch Manager / Admin)
    if admin:
        dep, _ = BankDeposit.objects.get_or_create(
            reference_number='DEP-UTR-991823',
            defaults={
                'branch_manager': admin,
                'branch': branch,
                'amount': Decimal('25000.00'),
                'bank_name': 'HDFC Bank - Fort Branch',
                'account_number': '50100492819201',
                'status': 'settled',
                'notes': 'End-of-day branch cash vault deposit verified by manager.'
            }
        )
        print("Bank Deposit sample populated.")

    print("\n✓ ALL SAMPLE DATA SUCCESSFULLY POPULATED!")

if __name__ == '__main__':
    populate_sample_data()
