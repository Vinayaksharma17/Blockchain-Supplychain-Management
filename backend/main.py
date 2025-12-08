from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import os
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="Garment SCM API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
META_FILE = os.path.join(DATA_DIR, "products_metadata.json")

# Serve static files (images, qr)
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

# Models
class Product(BaseModel):
    id: str
    name: str
    color: str
    price: float
    year: int
    meta_hash: str
    pid_hash: str
    short_hash: str
    predicted_status: str
    pred_proba: float
    qr_file: Optional[str] = None
    tracking_url: Optional[str] = None
    image_file: Optional[str] = None
    tracking_history: Optional[List[dict]] = []

class TrackingUpdate(BaseModel):
    tracking_history: List[dict]

def save_products(products):
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

def load_products():
    if not os.path.exists(META_FILE):
        return []
    with open(META_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/products", response_model=dict)
async def get_products(
    page: int = 1, 
    limit: int = 12, 
    search: Optional[str] = None
):
    all_products = load_products()
    
    # Filter
    if search:
        search_lower = search.lower()
        all_products = [
            p for p in all_products 
            if search_lower in str(p["id"]).lower() or search_lower in str(p["name"]).lower()
        ]
    
    # Pagination
    total = len(all_products)
    start = (page - 1) * limit
    end = start + limit
    paginated = all_products[start:end]
    
    return {
        "data": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    products = load_products()
    product = next((p for p in products if str(p["id"]) == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/api/products/{product_id}/tracking")
async def update_tracking(product_id: str, update: TrackingUpdate):
    products = load_products()
    product_idx = next((i for i, p in enumerate(products) if str(p["id"]) == product_id), -1)
    
    if product_idx == -1:
        raise HTTPException(status_code=404, detail="Product not found")
    
    products[product_idx]["tracking_history"] = update.tracking_history
    save_products(products)
    
    return {"status": "success", "tracking_history": update.tracking_history}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Garment SCM Backend Running"}
