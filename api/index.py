import sys
import os

# Make the server directory importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'server'))

from app import app

# Vercel needs the app object exposed as `app`
# (it does NOT call __main__, so the if __name__ == '__main__' block is skipped)
