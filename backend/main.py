from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from typing import Optional

from .models import Product, TrackingUpdate
from .repository import ProductRepository

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

# Repository
repo = ProductRepository(DATA_DIR)

# Serve static files (images, qr)
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

@app.get("/api/products", response_model=dict)
async def get_products(
    page: int = 1, 
    limit: int = 12, 
    search: Optional[str] = None
):
    all_products = repo.get_all()
    
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
    product = repo.get_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/api/products/{product_id}/tracking")
async def update_tracking(product_id: str, update: TrackingUpdate):
    success = repo.update_tracking(product_id, update.tracking_history)
    
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"status": "success", "tracking_history": update.tracking_history}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Garment SCM Backend Running"}
