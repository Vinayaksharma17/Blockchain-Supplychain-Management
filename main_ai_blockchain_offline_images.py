# main_ai_blockchain_offline_images.py
"""
Backend (no-TensorFlow version)
- Reads garments.csv
- Trains a small scikit-learn model (fast)
- Generates products_metadata.json and onchain_storage.json
- Generates per-product QR images into ./qr/<product_id>.png
- Adds tracking_url pointing to local network Streamlit (auto-detected)
"""

import os
import json
import socket
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
import qrcode
from qrcode.constants import ERROR_CORRECT_M
from eth_utils import keccak, to_hex
import joblib
import warnings

warnings.filterwarnings("ignore")

# ---------- CONFIG ----------
CSV = "garments.csv"       # input dataset (must be in same folder)
QR_DIR = "qr"
UPLOADS = "uploads"
META_FILE = "products_metadata.json"
ONCHAIN_FILE = "onchain_storage.json"

# QR appearance
QR_VERSION = None
QR_ERROR_CORRECTION = ERROR_CORRECT_M
QR_BOX = 6
QR_BORDER = 2

# ML small model params
RANDOM_SEED = 42
N_ESTIMATORS = 100

# Sample limit (None = all). Set small for quick runs while testing.
SAMPLE_LIMIT = None

# Custom IP for QR codes (leave None to auto-detect)
CUSTOM_HOST_IP = "10.250.49.176" # Example: "192.168.1.5"
# ----------------------------

os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(UPLOADS, exist_ok=True)

def guess_lan_ip():
    """Try to detect LAN IP so tracking URLs embed IP reachable from phone."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return None

def make_qr(url, save_path):
    """Generate QR image for URL (fast & robust)."""
    qr = qrcode.QRCode(
        version=QR_VERSION,
        error_correction=QR_ERROR_CORRECTION,
        box_size=QR_BOX,
        border=QR_BORDER
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(save_path)

print("🚀 AI + Blockchain Garment Project — START")

# Determine host (for QR tracking links)
if CUSTOM_HOST_IP:
    host_url = f"http://{CUSTOM_HOST_IP}:8501"
    print(f"Using configured CUSTOM_HOST_IP -> {host_url}")
else:
    lan = guess_lan_ip()
    if lan:
        host_url = f"http://{lan}:8501"
        print(f"Auto-detected LAN IP -> using host for QR/tracking: {host_url}")
    else:
        host_url = "http://localhost:8501"
        print("Could not auto-detect LAN IP. Using localhost for tracking URLs (phone cannot reach localhost).")
print("Host for QR:", host_url)

# Validate CSV
if not os.path.exists(CSV):
    raise SystemExit(f"ERROR: {CSV} not found. Put garments.csv in the same folder and re-run.")

# Load dataset
df_orig = pd.read_csv(CSV, low_memory=False)
print(f"Loaded CSV — rows: {len(df_orig)} columns: {len(df_orig.columns)}")

# Auto-detect likely columns
cols_lower = {c.lower().strip(): c for c in df_orig.columns}
id_col = cols_lower.get("productid") or cols_lower.get("id") or df_orig.columns[0]
name_col = cols_lower.get("productname") or cols_lower.get("productdisplayname") or cols_lower.get("name") or (df_orig.columns[1] if len(df_orig.columns)>1 else id_col)
color_col = None
for k in ("primarycolor","basecolour","basecolor","color","colour"):
    if k in cols_lower:
        color_col = cols_lower[k]
        break
price_col = None
for k in ("price","price ","mrp","price (inr)"):
    if k in cols_lower:
        price_col = cols_lower[k]
        break

print("Detected columns mapping:")
print("  id_col   ->", id_col)
print("  name_col ->", name_col)
print("  color_col->", color_col)
print("  price_col->", price_col)

# Build working DataFrame with sane column names
use_cols = [id_col, name_col]
if color_col: use_cols.append(color_col)
if price_col: use_cols.append(price_col)

df = df_orig.copy()
df = df[use_cols].rename(columns={
    id_col: "id",
    name_col: "name",
    **({color_col: "color"} if color_col else {}),
    **({price_col: "price"} if price_col else {})
})

# Normalize price
if "price" in df.columns:
    df["price"] = pd.to_numeric(df["price"].astype(str).str.replace(r"[^\d\.]", "", regex=True).replace("", "0"), errors="coerce").fillna(0.0).astype(float)
else:
    df["price"] = 0.0

df["color"] = df.get("color", "").fillna("").astype(str)
df["year"] = datetime.now().year

# small sample for quick testing if SAMPLE_LIMIT set
if SAMPLE_LIMIT:
    df = df.head(SAMPLE_LIMIT)

df = df.fillna("").reset_index(drop=True)
print("Prepared working DataFrame with", len(df), "products.")

# ---------------- ML MODEL (scikit-learn) -----------------
# We'll train a small RandomForest that predicts whether price > median
# This is a demo "status" predictor — you can swap with any other logic.
label_enc = LabelEncoder()
label_enc.fit(df["color"].astype(str).unique().tolist() + [""])

df["color_enc"] = label_enc.transform(df["color"].astype(str))

X = df[["color_enc", "price", "year"]].values
y = (df["price"] > df["price"].median()).astype(int)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

clf = RandomForestClassifier(n_estimators=N_ESTIMATORS, random_state=RANDOM_SEED)
try:
    clf.fit(X_scaled, y)
except Exception as e:
    print("Model training warning:", e)

# Save scaler + model for future use
try:
    joblib.dump(scaler, "scaler_demo.joblib")
    joblib.dump(clf, "model_demo.joblib")
except Exception:
    pass

print("Trained scikit-learn model (demo).")

# ---------------- generate metadata, QR, on-chain records -----------------
products_meta = []
onchain_records = []

for idx, row in df.iterrows():
    pid = str(row["id"]).strip()
    name = str(row["name"]).strip()
    color = str(row.get("color","")).strip()
    price = float(row.get("price", 0.0))
    year = int(row.get("year", datetime.now().year))

    product = {"id": pid, "name": name, "color": color, "price": price, "year": year}
    data_json = json.dumps(product, sort_keys=True, separators=(",", ":"))
    meta_hash = to_hex(keccak(text=data_json))
    pid_hash = to_hex(keccak(text=pid))
    short_hash = pid_hash[:10]

    # Prediction using sklearn
    feat = np.array([[row["color_enc"], price, year]], dtype=float)
    try:
        feat_scaled = scaler.transform(feat)
        pred_proba = float(clf.predict_proba(feat_scaled)[0][1]) if hasattr(clf, "predict_proba") else float(clf.predict(feat_scaled)[0])
    except Exception:
        # fallback
        pred_proba = float(0.0)
    predicted_status = "Authentic" if pred_proba >= 0.5 else "Suspect"

    # tracking URL and QR path
    tracking_url = f"{host_url}/?track={pid}"
    qr_file_name = f"{pid}.png"
    qr_path = os.path.join(QR_DIR, qr_file_name)
    try:
        # Only create if missing (fast reruns)
        if not os.path.exists(qr_path):
            make_qr(tracking_url, qr_path)
    except Exception as e:
        print(f"Warning: QR generation failed for {pid}: {e}")

    # optional product image (leave None by default)
    image_file = None

    meta_entry = {
        "id": pid,
        "name": name,
        "color": color,
        "price": price,
        "year": year,
        "meta_hash": meta_hash,
        "pid_hash": pid_hash,
        "short_hash": short_hash,
        "predicted_status": predicted_status,
        "pred_proba": pred_proba,
        # store relative QR filename (frontend resolves)
        "qr_file": os.path.join(QR_DIR, qr_file_name),
        "tracking_url": tracking_url,
        "image_file": image_file
    }
    products_meta.append(meta_entry)
    onchain_records.append({"product_id": pid, "product_hash": meta_hash})

    if (idx + 1) % 200 == 0:
        print(f"Processed {idx+1}/{len(df)} products...")

# write output files
with open(META_FILE, "w", encoding="utf-8") as f:
    json.dump(products_meta, f, indent=2, ensure_ascii=False)
with open(ONCHAIN_FILE, "w", encoding="utf-8") as f:
    json.dump(onchain_records, f, indent=2, ensure_ascii=False)

print("✅ Written", META_FILE, "and", ONCHAIN_FILE)
print("✅ QR images saved into ./qr/ (first few shown below)")
print("🎉 Done — per-product artifacts ready for UI.")
# show sample paths
for i, p in enumerate(products_meta[:6]):
    print(" ", p["id"], "->", p["qr_file"], "tracking:", p["tracking_url"])
