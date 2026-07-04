import sys
import os

# Add root folder to sys.path so backend package can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
app = create_app()
