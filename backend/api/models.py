from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Q

class Branch(models.Model):
    """
    Branch entity for multi-branch cash collection operations.
    """
    code = models.CharField(max_length=20, unique=True, db_index=True, help_text="Unique branch identifier (e.g., BR-MUM-01)")
    name = models.CharField(max_length=100, help_text="Branch name")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, default='')
    address = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Branches"
        ordering = ['code']

    def __str__(self):
        return f"{self.name} ({self.code})"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('branch_manager', 'Branch Manager'),
        ('agent', 'Collection Agent'),
        ('customer', 'Customer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer', db_index=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='staff_members')
    branch_name = models.CharField(max_length=100, blank=True, null=True, help_text="Legacy / display branch name")
    phone = models.CharField(max_length=20, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.branch and not self.branch_name:
            self.branch_name = self.branch.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profile')
    customer_code = models.CharField(max_length=50, unique=True, db_index=True, blank=True, null=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='customers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Loan(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('overdue', 'Overdue'),
        ('defaulted', 'Defaulted'),
    )
    loan_id = models.CharField(max_length=50, unique=True, db_index=True, blank=True, null=True, help_text="e.g. LN-8921")
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='loans')
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Sanctioned loan amount")
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Current outstanding balance")
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Annual interest rate in percentage")
    tenure_months = models.IntegerField(default=12)
    emi_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(check=Q(amount__gt=0), name='loan_amount_positive'),
            models.CheckConstraint(check=Q(outstanding_amount__gte=0), name='loan_outstanding_non_negative'),
            models.CheckConstraint(check=Q(interest_rate__gte=0), name='loan_interest_rate_non_negative'),
        ]
        indexes = [
            models.Index(fields=['customer', 'status']),
        ]

    def __str__(self):
        return f"Loan #{self.loan_id or self.id} - {self.customer.name} (₹{self.outstanding_amount} left)"


class Collection(models.Model):
    STATUS_CHOICES = (
        ('collected', 'Collected'),
        ('branch_received', 'Branch Received'),
        ('discrepancy', 'Discrepancy'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('upi', 'UPI / Online'),
        ('cheque', 'Cheque'),
        ('bank_transfer', 'Bank Transfer'),
    )
    loan = models.ForeignKey(Loan, on_delete=models.PROTECT, related_name='collections')
    agent = models.ForeignKey(User, on_delete=models.PROTECT, related_name='collections')
    amount_collected = models.DecimalField(max_digits=12, decimal_places=2)
    receipt_number = models.CharField(max_length=100, unique=True, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='collected', db_index=True)
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    branch_received_at = models.DateTimeField(null=True, blank=True)
    branch_verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_collections')
    discrepancy_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discrepancy_reason = models.TextField(blank=True, null=True)
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-collected_at']
        constraints = [
            models.CheckConstraint(check=Q(amount_collected__gt=0), name='collection_amount_positive'),
            models.CheckConstraint(check=Q(discrepancy_amount__gte=0), name='collection_discrepancy_non_negative'),
        ]
        indexes = [
            models.Index(fields=['status', 'collected_at']),
            models.Index(fields=['agent', 'status']),
        ]

    def __str__(self):
        return f"{self.receipt_number} - ₹{self.amount_collected} ({self.status})"


class CashDenomination(models.Model):
    """
    Denomination breakdown for physical cash handovers at branch reconciliation.
    """
    collection = models.OneToOneField(Collection, on_delete=models.CASCADE, related_name='denomination', null=True, blank=True)
    notes_500 = models.PositiveIntegerField(default=0)
    notes_200 = models.PositiveIntegerField(default=0)
    notes_100 = models.PositiveIntegerField(default=0)
    notes_50 = models.PositiveIntegerField(default=0)
    notes_20 = models.PositiveIntegerField(default=0)
    notes_10 = models.PositiveIntegerField(default=0)
    coins = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_calculated = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def calculate_total(self):
        return (
            (self.notes_500 * 500) +
            (self.notes_200 * 200) +
            (self.notes_100 * 100) +
            (self.notes_50 * 50) +
            (self.notes_20 * 20) +
            (self.notes_10 * 10) +
            self.coins
        )

    def save(self, *args, **kwargs):
        self.total_calculated = self.calculate_total()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Denominations for {self.collection.receipt_number if self.collection else 'Unlinked'} (₹{self.total_calculated})"


class BankDeposit(models.Model):
    STATUS_CHOICES = (
        ('deposited', 'Deposited'),
        ('settled', 'Settled'),
        ('failed', 'Failed'),
    )
    branch_manager = models.ForeignKey(User, on_delete=models.PROTECT, related_name='bank_deposits')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='deposits')
    collections = models.ManyToManyField(Collection, related_name='bank_deposits', blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    reference_number = models.CharField(max_length=100, unique=True, db_index=True, help_text="Bank UTR / deposit receipt number")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='deposited', db_index=True)
    deposited_at = models.DateTimeField(auto_now_add=True, db_index=True)
    settled_at = models.DateTimeField(null=True, blank=True)
    deposit_slip = models.ImageField(upload_to='deposits/', null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-deposited_at']
        constraints = [
            models.CheckConstraint(check=Q(amount__gt=0), name='deposit_amount_positive'),
        ]

    def __str__(self):
        return f"Deposit {self.reference_number} - ₹{self.amount} ({self.status})"


class ScheduledPayment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='scheduled_payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    scheduled_date = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    reschedule_count = models.PositiveSmallIntegerField(default=0)
    reschedule_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_date']
        constraints = [
            models.CheckConstraint(check=Q(amount__gt=0), name='scheduled_payment_amount_positive'),
            models.CheckConstraint(check=Q(reschedule_count__lte=1), name='max_one_reschedule_allowed'),
        ]

    def __str__(self):
        return f"EMI for Loan #{self.loan.loan_id or self.loan.id} - ₹{self.amount} on {self.scheduled_date.strftime('%Y-%m-%d')}"


class AuditLog(models.Model):
    """
    Financial immutable audit log for regulatory compliance and transaction tracking.
    """
    action = models.CharField(max_length=100, db_index=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    entity_type = models.CharField(max_length=50, db_index=True)
    entity_id = models.CharField(max_length=50, db_index=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.action} on {self.entity_type} #{self.entity_id}"
