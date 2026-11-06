import os, sys
print('cwd:', os.getcwd())
print('sys.path:', sys.path)
from app import app
print('imported app:', app)
