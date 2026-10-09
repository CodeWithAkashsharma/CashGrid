from rest_framework import serializers
from .models import Branch, User, Customer, Loan, Collection, CashDenomination, BankDeposit, ScheduledPayment, AuditLog

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'branch_name', 'phone']

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class LoanSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Loan
        fields = '__all__'

class CashDenominationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CashDenomination
        fields = '__all__'

class CollectionSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source='agent.username', read_only=True)
    customer_name = serializers.CharField(source='loan.customer.name', read_only=True)
    loan_id_display = serializers.CharField(source='loan.loan_id', read_only=True)
    denomination = CashDenominationSerializer(read_only=True)

    class Meta:
        model = Collection
        fields = '__all__'

class BankDepositSerializer(serializers.ModelSerializer):
    branch_manager_name = serializers.CharField(source='branch_manager.username', read_only=True)
    branch_manager = serializers.PrimaryKeyRelatedField(read_only=True)
    reference_number = serializers.CharField(required=False)

    class Meta:
        model = BankDeposit
        fields = '__all__'

class ScheduledPaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='loan.customer.name', read_only=True)

    class Meta:
        model = ScheduledPayment
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
