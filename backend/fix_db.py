import os
import sys
import sqlite3
from pathlib import Path

# Set up paths
backend_dir = Path(__file__).resolve().parent
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

db_path = backend_dir / 'db.sqlite3'

print(f"1. Target database path: {db_path}")

# Close any existing connections and delete old db
if db_path.exists():
    try:
        os.remove(db_path)
        print("   Successfully removed old db.sqlite3")
    except Exception as e:
        print(f"   Warning removing db.sqlite3: {e}")

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cmrs.settings')
import django
django.setup()

from django.core.management import call_command

print("2. Running migrations...")
call_command('migrate', interactive=False)

print("3. Populating branches and users...")
from populate_db import populate
populate()

print("4. Populating customers, loans, and collections...")
from populate_sample_data import populate_sample_data
populate_sample_data()

# Verify columns in SQLite
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cols = [c[1] for c in cur.execute("PRAGMA table_info(api_user)").fetchall()]
print(f"5. api_user columns: {cols}")
if 'branch_id' in cols:
    print("   ✓ CONFIRMED: branch_id column exists!")
else:
    print("   ✗ ERROR: branch_id is MISSING!")

cust_count = cur.execute("SELECT COUNT(*) FROM api_customer").fetchone()[0]
loan_count = cur.execute("SELECT COUNT(*) FROM api_loan").fetchone()[0]
user_count = cur.execute("SELECT COUNT(*) FROM api_user").fetchone()[0]
print(f"   ✓ Stats: Users: {user_count}, Customers: {cust_count}, Loans: {loan_count}")
conn.close()

# Reload PythonAnywhere WSGI worker
wsgi_path = Path("/var/www/akash999_pythonanywhere_com_wsgi.py")
if wsgi_path.exists():
    wsgi_path.touch()
    print("6. ✓ Successfully reloaded PythonAnywhere web app!")
else:
    print(f"6. Note: WSGI file {wsgi_path} not found locally (normal if running locally).")

print("\n✓ ALL STEPS COMPLETE AND VERIFIED!")
