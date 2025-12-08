import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from eth_utils import keccak, to_hex
import joblib
import warnings

warnings.filterwarnings("ignore")

# ---------- CONFIG ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_FILE = os.path.join(DATA_DIR, "garments.csv")
META_FILE = os.path.join(DATA_DIR, "products_metadata.json")
ONCHAIN_FILE = os.path.join(DATA_DIR, "onchain_storage.json")
MODEL_FILE = os.path.join(DATA_DIR, "model_demo.joblib")
SCALER_FILE = os.path.join(DATA_DIR, "scaler_demo.joblib")

# ML params
RANDOM_SEED = 42
N_ESTIMATORS = 100
# ----------------------------

def train_and_generate():
    print("🚀 Starting Data Processing & ML Training...")

    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"CSV file not found at {CSV_FILE}")

    # Load dataset
    df_orig = pd.read_csv(CSV_FILE, low_memory=False)
    print(f"Loaded CSV — rows: {len(df_orig)}")

    # Column mapping
    cols_lower = {c.lower().strip(): c for c in df_orig.columns}
    id_col = cols_lower.get("productid") or cols_lower.get("id") or df_orig.columns[0]
    name_col = cols_lower.get("productname") or cols_lower.get("productdisplayname") or cols_lower.get("name")
    color_col = next((cols_lower[k] for k in ["primarycolor","basecolour","basecolor","color","colour"] if k in cols_lower), None)
    price_col = next((cols_lower[k] for k in ["price","price ","mrp","price (inr)"] if k in cols_lower), None)

    # Prepare DataFrame
    df = df_orig.copy()
    rename_map = {id_col: "id", name_col: "name"}
    if color_col: rename_map[color_col] = "color"
    if price_col: rename_map[price_col] = "price"
    
    df = df.rename(columns=rename_map)
    
    # Normalize price
    if "price" in df.columns:
        df["price"] = pd.to_numeric(df["price"].astype(str).str.replace(r"[^\d\.]", "", regex=True).replace("", "0"), errors="coerce").fillna(0.0).astype(float)
    else:
        df["price"] = 0.0

    df["color"] = df.get("color", "").fillna("").astype(str)
    df["year"] = datetime.now().year
    df = df.fillna("").reset_index(drop=True)

    # --- ML TRAINING ---
    print("🧠 Training Model...")
    label_enc = LabelEncoder()
    label_enc.fit(df["color"].astype(str).unique().tolist() + [""])
    df["color_enc"] = label_enc.transform(df["color"].astype(str))

    X = df[["color_enc", "price", "year"]].values
    y = (df["price"] > df["price"].median()).astype(int)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = RandomForestClassifier(n_estimators=N_ESTIMATORS, random_state=RANDOM_SEED)
    clf.fit(X_scaled, y)

    # Save artifacts
    joblib.dump(scaler, SCALER_FILE)
    joblib.dump(clf, MODEL_FILE)
    print("✅ Model trained and saved.")

    # --- METADATA GENERATION ---
    print("📝 Generating Metadata...")
    products_meta = []
    onchain_records = []

    for _, row in df.iterrows():
        pid = str(row["id"]).strip()
        name = str(row["name"]).strip()
        color = str(row.get("color","")).strip()
        price = float(row.get("price", 0.0))
        year = int(row.get("year", datetime.now().year))

        # Blockchain simulation
        product_data = {"id": pid, "name": name, "color": color, "price": price, "year": year}
        data_json = json.dumps(product_data, sort_keys=True, separators=(",", ":"))
        meta_hash = to_hex(keccak(text=data_json))
        pid_hash = to_hex(keccak(text=pid))
        short_hash = pid_hash[:10]

        # Prediction
        feat = np.array([[row["color_enc"], price, year]], dtype=float)
        feat_scaled = scaler.transform(feat)
        pred_proba = float(clf.predict_proba(feat_scaled)[0][1])
        predicted_status = "Authentic" if pred_proba >= 0.5 else "Suspect"

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
            "image_file": row.get("image_file", None), # Preserve if exists
            # QR fields will be populated by qr_generator.py
            "qr_file": None,
            "tracking_url": None
        }
        products_meta.append(meta_entry)
        onchain_records.append({"product_id": pid, "product_hash": meta_hash})

    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(products_meta, f, indent=2, ensure_ascii=False)
    
    with open(ONCHAIN_FILE, "w", encoding="utf-8") as f:
        json.dump(onchain_records, f, indent=2, ensure_ascii=False)

    print(f"🎉 Processed {len(products_meta)} products. Metadata saved.")

if __name__ == "__main__":
    train_and_generate()
