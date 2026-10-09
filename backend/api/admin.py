from django.contrib import admin
from .models import Branch, User, Customer, Loan, Collection, CashDenomination, BankDeposit, ScheduledPayment, AuditLog

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'city', 'state', 'is_active', 'created_at')
    search_fields = ('code', 'name', 'city')
    list_filter = ('is_active', 'city', 'state')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'branch_name', 'phone', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'branch_name', 'phone')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_code', 'name', 'phone', 'email', 'created_at')
    search_fields = ('customer_code', 'name', 'phone', 'email')
    list_filter = ('created_at',)

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ('loan_id', 'customer', 'amount', 'outstanding_amount', 'interest_rate', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('loan_id', 'customer__name', 'customer__phone')

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'loan', 'agent', 'amount_collected', 'status', 'payment_method', 'collected_at')
    list_filter = ('status', 'payment_method', 'collected_at')
    search_fields = ('receipt_number', 'loan__loan_id', 'agent__username')

@admin.register(CashDenomination)
class CashDenominationAdmin(admin.ModelAdmin):
    list_display = ('id', 'collection', 'total_calculated')

@admin.register(BankDeposit)
class BankDepositAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'branch_manager', 'bank_name', 'amount', 'status', 'deposited_at')
    list_filter = ('status', 'bank_name', 'deposited_at')
    search_fields = ('reference_number', 'bank_name', 'branch_manager__username')

@admin.register(ScheduledPayment)
class ScheduledPaymentAdmin(admin.ModelAdmin):
    list_display = ('loan', 'amount', 'scheduled_date', 'status', 'reschedule_count')
    list_filter = ('status', 'scheduled_date')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'user', 'entity_type', 'entity_id')
    list_filter = ('action', 'entity_type', 'timestamp')
    search_fields = ('action', 'entity_id', 'user__username')
