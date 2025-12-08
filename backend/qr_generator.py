import os
import json
import argparse
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

def generate_qrs(host_ip):
    print(f"🚀 Starting QR Generation for Host: {host_ip}")
    
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
        # Assuming Frontend runs on port 5173 (Vite default)
        tracking_url = f"http://{host_ip}:5173/tracking/{pid}"
        
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

    print(f"✅ QR Generation Complete. Metadata updated with URL: http://{host_ip}:5173")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate QR codes for products.")
    parser.add_argument("--ip", type=str, required=True, help="Host IP address for tracking URLs")
    args = parser.parse_args()
    
    generate_qrs(args.ip)
