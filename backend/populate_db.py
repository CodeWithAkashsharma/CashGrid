import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmrs.settings')
django.setup()

from api.models import User, Branch
from django.contrib.auth.hashers import make_password

def populate():
    # 1. Create a Branch first
    branch, created = Branch.objects.get_or_create(
        code='BR-MUM-01',
        defaults={
            'name': 'Mumbai Central Branch',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'address': '123 Finance Street, Mumbai',
            'is_active': True
        }
    )

    # 2. Create the 4 roles
    users_data = [
        {'username': 'superadmin', 'role': 'super_admin', 'branch': None},
        {'username': 'admin', 'role': 'branch_manager', 'branch': branch},
        {'username': 'agent', 'role': 'agent', 'branch': branch},
        {'username': 'user', 'role': 'customer', 'branch': branch},
    ]

    for ud in users_data:
        user, created = User.objects.get_or_create(
            username=ud['username'],
            defaults={
                'role': ud['role'],
                'branch': ud['branch'],
                'password': make_password('123456789'),
                'is_active': True
            }
        )
        if created:
            print(f"Created user: {user.username} with role {user.role}")
        else:
            print(f"User {user.username} already exists.")

if __name__ == '__main__':
    populate()
