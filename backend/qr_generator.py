import os
import json
import argparse
import socket
import qrcode
from qrcode.constants import ERROR_CORRECT_M

# ---------- CONFIG ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
META_FILE = os.path.join(DATA_DIR, "products_metadata.json")
QR_DIR = os.path.join(DATA_DIR, "qr")

# QR params
QR_VERSION = None
QR_ERROR_CORRECTION = ERROR_CORRECT_M
QR_BOX = 6
QR_BORDER = 2
# ----------------------------

def get_local_ip():
    """Get the local IP address of the machine."""
    try:
        # Create a socket and connect to an external server to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"

def generate_qrs(host_ip=None, port=5173, base_url=None):
    """
    Generate QR codes for all products.
    
    Args:
        host_ip: IP address for the frontend (auto-detected if not provided)
        port: Port number for the frontend (default: 5173 for Vite dev server)
        base_url: Full base URL (overrides host_ip and port if provided)
                  e.g., "https://your-domain.com" for production
    """
    # Determine the base URL
    if base_url:
        tracking_base = base_url.rstrip('/')
        print(f"🚀 Starting QR Generation with Base URL: {tracking_base}")
    else:
        if not host_ip:
            host_ip = get_local_ip()
            print(f"🔍 Auto-detected IP: {host_ip}")
        tracking_base = f"http://{host_ip}:{port}"
        print(f"🚀 Starting QR Generation for: {tracking_base}")
    
    if not os.path.exists(META_FILE):
        print("❌ Metadata file not found. Run data_processor.py first.")
        return

    os.makedirs(QR_DIR, exist_ok=True)

    with open(META_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Found {len(products)} products. Generating QRs...")

    updated_products = []
    for idx, p in enumerate(products):
        pid = p["id"]
        
        # URL pointing to Frontend Tracking Page
        tracking_url = f"{tracking_base}/tracking/{pid}"
        
        qr_filename = f"{pid}.png"
        qr_path = os.path.join(QR_DIR, qr_filename)
        
        # Generate QR
        qr = qrcode.QRCode(
            version=QR_VERSION,
            error_correction=QR_ERROR_CORRECTION,
            box_size=QR_BOX,
            border=QR_BORDER
        )
        qr.add_data(tracking_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(qr_path)

        # Update metadata
        p["qr_file"] = f"qr/{qr_filename}" # Relative path for API
        p["tracking_url"] = tracking_url
        updated_products.append(p)

        if (idx + 1) % 500 == 0:
            print(f"Generated {idx+1}/{len(products)} QRs...")

    # Save updated metadata
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(updated_products, f, indent=2, ensure_ascii=False)

    print(f"✅ QR Generation Complete. Tracking URL base: {tracking_base}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate QR codes for products.")
    parser.add_argument("--ip", type=str, help="Host IP address for tracking URLs (auto-detected if not provided)")
    parser.add_argument("--port", type=int, default=5173, help="Frontend port (default: 5173)")
    parser.add_argument("--url", type=str, help="Full base URL (e.g., https://your-domain.com) - overrides --ip and --port")
    args = parser.parse_args()
    
    generate_qrs(host_ip=args.ip, port=args.port, base_url=args.url)
