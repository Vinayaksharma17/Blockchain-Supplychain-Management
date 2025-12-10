from pydantic import BaseModel
from typing import List, Optional

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
