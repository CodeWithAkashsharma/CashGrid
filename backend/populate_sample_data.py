import os
import django
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmrs.settings')
django.setup()

from api.models import User, Branch, Customer, Loan, Collection, ScheduledPayment

def populate_sample_data():
    branch = Branch.objects.first()
    if not branch:
        print("No branch found. Run populate_db.py first.")
        return

    user = User.objects.filter(username='user').first()
    if not user:
        print("User 'user' not found. Run populate_db.py first.")
        return

    # Create Customer profile
    customer, created = Customer.objects.get_or_create(
        user=user,
        defaults={
            'customer_code': 'CUST-001',
            'name': 'John Customer',
            'phone': '9876543210',
            'email': 'user@example.com',
            'address': '123 Customer Lane, Mumbai',
            'branch': branch
        }
    )
    if created:
        print("Created Customer profile for 'user'.")
    else:
        print("Customer profile already exists.")

    # Create Loans
    loan1, created1 = Loan.objects.get_or_create(
        loan_id='LN-1001',
        defaults={
            'customer': customer,
            'amount': Decimal('50000.00'),
            'outstanding_amount': Decimal('45000.00'),
            'interest_rate': Decimal('12.5'),
            'tenure_months': 12,
            'emi_amount': Decimal('4500.00'),
            'status': 'active',
            'disbursed_at': timezone.now() - timedelta(days=60)
        }
    )
    if created1:
        print("Created Loan LN-1001.")

    loan2, created2 = Loan.objects.get_or_create(
        loan_id='LN-1002',
        defaults={
            'customer': customer,
            'amount': Decimal('15000.00'),
            'outstanding_amount': Decimal('0.00'),
            'interest_rate': Decimal('10.0'),
            'tenure_months': 6,
            'emi_amount': Decimal('2600.00'),
            'status': 'closed',
            'disbursed_at': timezone.now() - timedelta(days=200)
        }
    )
    if created2:
        print("Created Loan LN-1002 (Closed).")

    # Create Scheduled Payments for Active Loan
    for i in range(3):
        ScheduledPayment.objects.get_or_create(
            loan=loan1,
            scheduled_date=timezone.now() + timedelta(days=30*i),
            defaults={
                'amount': loan1.emi_amount,
                'status': 'pending'
            }
        )
    print("Created Scheduled Payments for LN-1001.")

    # Create a past collection for Loan 1
    agent = User.objects.filter(username='agent').first()
    if agent:
        Collection.objects.get_or_create(
            receipt_number='REC-001',
            defaults={
                'loan': loan1,
                'agent': agent,
                'amount_collected': Decimal('5000.00'),
                'payment_method': 'upi',
                'status': 'branch_received',
                'collected_at': timezone.now() - timedelta(days=15)
            }
        )
        print("Created Collection REC-001.")

if __name__ == '__main__':
    populate_sample_data()
