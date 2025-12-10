import os
import json
import threading

class ProductRepository:
    def __init__(self, data_dir: str):
        self.meta_file = os.path.join(data_dir, "products_metadata.json")
        self._lock = threading.Lock()

    def _load(self):
        if not os.path.exists(self.meta_file):
            return []
        try:
            with open(self.meta_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

    def _save(self, products):
        with open(self.meta_file, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)

    def get_all(self):
        with self._lock:
            return self._load()

    def get_by_id(self, product_id: str):
        with self._lock:
            products = self._load()
            return next((p for p in products if str(p["id"]) == product_id), None)

    def update_tracking(self, product_id: str, tracking_history: list):
        with self._lock:
            products = self._load()
            product = next((p for p in products if str(p["id"]) == product_id), None)
            
            if not product:
                return False
            
            product["tracking_history"] = tracking_history
            self._save(products)
            return True
