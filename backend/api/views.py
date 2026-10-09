from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Customer, Loan, Collection, BankDeposit, ScheduledPayment
from .serializers import UserSerializer, CustomerSerializer, LoanSerializer, CollectionSerializer, BankDepositSerializer, ScheduledPaymentSerializer
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
import uuid

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        remember_me = self.initial_data.get('rememberMe', False)
        refresh = self.get_token(self.user)
        
        if remember_me:
            # Token lifetime is set to 30 days
            refresh.set_exp(lifetime=timedelta(days=30))
            refresh.access_token.set_exp(lifetime=timedelta(days=30))
        else:
            # Default token lifetime is set to 7 days
            refresh.set_exp(lifetime=timedelta(days=7))
            refresh.access_token.set_exp(lifetime=timedelta(days=7))
            
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
def register(request):
    username = request.data.get('username') # acts as email/phone
    password = request.data.get('password')
    name = request.data.get('name')
    
    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=name or "",
        role="customer"
    )
    return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(UserSerializer(request.user).data)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer

class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    def perform_create(self, serializer):
        receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(agent=self.request.user, receipt_number=receipt_number)
        
        # Update loan outstanding amount
        loan = serializer.validated_data['loan']
        loan.outstanding_amount -= serializer.validated_data['amount_collected']
        loan.save()

    @action(detail=True, methods=['post'])
    def receive_at_branch(self, request, pk=None):
        collection = self.get_object()
        actual_amount = request.data.get('actual_amount')
        if not actual_amount:
            return Response({"error": "actual_amount is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        actual_amount = float(actual_amount)
        expected_amount = float(collection.amount_collected)
        
        collection.status = 'branch_received'
        if actual_amount != expected_amount:
            collection.status = 'discrepancy'
            collection.discrepancy_amount = expected_amount - actual_amount
        
        collection.save()
        return Response(self.get_serializer(collection).data)

class BankDepositViewSet(viewsets.ModelViewSet):
    queryset = BankDeposit.objects.all()
    serializer_class = BankDepositSerializer

    def perform_create(self, serializer):
        user = self.request.user if (self.request.user and self.request.user.is_authenticated) else User.objects.filter(role__in=['admin', 'super_admin']).first()
        ref = self.request.data.get('reference_number')
        if not ref:
            import time
            ref = f"DEP-{int(time.time())}"
        serializer.save(branch_manager=user, reference_number=ref)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        # A simple dashboard view
        total_collected = Collection.objects.aggregate(Sum('amount_collected'))['amount_collected__sum'] or 0
        total_deposited = BankDeposit.objects.aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({
            "total_collected": total_collected,
            "total_deposited": total_deposited,
        })

class ScheduledPaymentViewSet(viewsets.ModelViewSet):
    queryset = ScheduledPayment.objects.all()
    serializer_class = ScheduledPaymentSerializer

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        payment = self.get_object()
        new_date_str = request.data.get('new_date')
        
        if not new_date_str:
            return Response({"error": "new_date is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if payment.reschedule_count >= 1:
            return Response({"error": "You can only reschedule once."}, status=status.HTTP_400_BAD_REQUEST)
            
        if payment.status != 'pending':
            return Response({"error": "Only pending payments can be rescheduled."}, status=status.HTTP_400_BAD_REQUEST)
            
        time_until_collection = payment.scheduled_date - timezone.now()
        if time_until_collection < timedelta(hours=12):
            return Response({"error": "Rescheduling is only allowed before 12 hours of the collection time."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from django.utils.dateparse import parse_datetime
            new_date = parse_datetime(new_date_str)
            if new_date is None:
                raise ValueError
        except ValueError:
            return Response({"error": "Invalid date format. Use ISO format (e.g., YYYY-MM-DDTHH:MM:SSZ)."}, status=status.HTTP_400_BAD_REQUEST)
            
        payment.scheduled_date = new_date
        payment.reschedule_count += 1
        payment.save()
        
        return Response(self.get_serializer(payment).data)
