# Test version of sync-steam.py
# This will be replaced with the real version later

print("Test script placeholder")

# Import fallback for requests if not available
if not hasattr(__builtins, 'requests'):
    import sys
    print("ERROR: requests module not available")
    sys.exit(1)
