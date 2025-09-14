#!/usr/bin/env python3
"""
Test script to verify the Vitalis setup is working correctly
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        from vitalis_cli import stream_chat, validate_base_url, check_ollama_status
        print("✅ Vitalis CLI functions imported successfully")
    except ImportError as e:
        print(f"❌ Vitalis CLI import failed: {e}")
        return False
    
    try:
        import api_server
        print("✅ API server imported successfully")
    except ImportError as e:
        print(f"❌ API server import failed: {e}")
        return False
    
    return True

def test_ollama_connection():
    """Test connection to Ollama server"""
    print("\nTesting Ollama connection...")
    
    try:
        from vitalis_cli import DEFAULT_BASE_URL, DEFAULT_MODEL, validate_base_url, check_ollama_status
        
        validate_base_url(DEFAULT_BASE_URL)
        print(f"✅ Base URL validation passed: {DEFAULT_BASE_URL}")
        
        check_ollama_status(DEFAULT_BASE_URL, DEFAULT_MODEL)
        print(f"✅ Ollama connection successful with model: {DEFAULT_MODEL}")
        
        return True
    except Exception as e:
        print(f"❌ Ollama connection failed: {e}")
        print("Make sure Ollama is running and the model is available")
        return False

def test_frontend_setup():
    """Test if frontend dependencies are installed"""
    print("\nTesting frontend setup...")
    
    frontend_path = "frontend"
    if not os.path.exists(frontend_path):
        print("❌ Frontend directory not found")
        return False
    
    package_json = os.path.join(frontend_path, "package.json")
    if not os.path.exists(package_json):
        print("❌ Frontend package.json not found")
        return False
    
    node_modules = os.path.join(frontend_path, "node_modules")
    if not os.path.exists(node_modules):
        print("❌ Frontend node_modules not found. Run 'npm install' in frontend directory")
        return False
    
    print("✅ Frontend setup looks good")
    return True

def main():
    """Run all tests"""
    print("🧪 Vitalis Setup Test")
    print("=" * 50)
    
    all_passed = True
    
    # Test imports
    if not test_imports():
        all_passed = False
    
    # Test Ollama connection
    if not test_ollama_connection():
        all_passed = False
    
    # Test frontend setup
    if not test_frontend_setup():
        all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All tests passed! Your setup is ready.")
        print("\nTo start development:")
        print("  npm run dev")
        print("  or")
        print("  ./start-dev.sh")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
