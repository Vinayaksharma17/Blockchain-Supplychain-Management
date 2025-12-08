# app_streamlit_final2.py
import streamlit as st
import pandas as pd
import os, json
from PIL import Image, ImageOps
from datetime import datetime

st.set_page_config(page_title="GARMENT SCM — AI + Blockchain", layout="wide")

BASE = os.getcwd()
META = os.path.join(BASE, "products_metadata.json")
QR_DIR = os.path.join(BASE, "qr")
UPLOADS = os.path.join(BASE, "uploads")

def load_meta():
    if not os.path.exists(META):
        st.error("products_metadata.json not found. Run backend generator first.")
        st.stop()
    with open(META, "r", encoding="utf-8") as f:
        return json.load(f)

meta = load_meta()
df = pd.DataFrame(meta)

# helper to resolve paths
def resolve_path(folder, filename):
    if not filename: return None
    if os.path.isabs(filename) and os.path.exists(filename): return filename
    candid = os.path.join(folder, filename)
    if os.path.exists(candid): return candid
    # try basename
    b = os.path.basename(filename)
    candid2 = os.path.join(folder, b)
    if os.path.exists(candid2): return candid2
    return None

# session default selected
if "selected_id" not in st.session_state:
    st.session_state["selected_id"] = str(df.iloc[0]["id"]) if not df.empty else None

# Sidebar controls + QR paste
st.sidebar.title("Controls")
q = st.sidebar.text_input("Search (id or name)", "")
colors = ["All"] + sorted(df["color"].fillna("Unknown").unique().tolist())
color_filter = st.sidebar.selectbox("Color", colors)
status_filter = st.sidebar.selectbox("Status", ["All"] + sorted(df["predicted_status"].fillna("N/A").unique().tolist()))
st.sidebar.markdown("---")
qr_input = st.sidebar.text_area("Scan QR (paste JSON payload or product id)", height=120)
if qr_input:
    try:
        parsed = json.loads(qr_input)
        pid = parsed.get("product_id") or parsed.get("product", {}).get("id")
        if pid:
            st.session_state["selected_id"] = str(pid)
            st.sidebar.success(f"Showing product {pid}")
    except Exception:
        pid_try = qr_input.strip()
        if pid_try in df["id"].astype(str).values:
            st.session_state["selected_id"] = pid_try
            st.sidebar.success(f"Showing product {pid_try}")
        else:
            st.sidebar.error("Invalid QR content. Paste product id or JSON with product_id.")

st.sidebar.markdown("---")
if st.sidebar.button("Export metadata JSON"):
    st.sidebar.download_button("Download", data=json.dumps(meta, indent=2, ensure_ascii=False), file_name="products_metadata_export.json")

# Filtering
df_filtered = df.copy()
if q:
    qlow = q.lower()
    df_filtered = df_filtered[df_filtered.apply(lambda r: qlow in str(r["id"]).lower() or qlow in str(r["name"]).lower(), axis=1)]
if color_filter != "All":
    df_filtered = df_filtered[df_filtered["color"].fillna("Unknown")==color_filter]
if status_filter != "All":
    df_filtered = df_filtered[df_filtered["predicted_status"].fillna("N/A")==status_filter]

# layout
# layout
st.markdown("""
<style>
    .main {
        background-color: #f8f9fa;
    }
    .stButton>button {
        width: 100%;
        border-radius: 5px;
        border: 1px solid #ddd;
        background-color: white;
        color: #333;
    }
    .stButton>button:hover {
        border-color: #007bff;
        color: #007bff;
    }
    .product-card {
        background-color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        margin-bottom: 20px;
        border: 1px solid #eee;
    }
    h1 {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #333;
        font-weight: 700;
        margin-bottom: 30px;
    }
    h3 {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #444;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("<h1 style='text-align:center;'>GARMENT SCM — AI + Blockchain</h1>", unsafe_allow_html=True)
left, right = st.columns([2,1])

with left:
    st.subheader("Catalogue")
    
    # Pagination controls
    col_p1, col_p2, col_p3 = st.columns([1, 2, 1])
    with col_p1:
        per_page = st.selectbox("Per page", [12, 24, 48], index=0)
    
    # Calculate total pages
    total_items = len(df_filtered)
    total_pages = max(1, (total_items + per_page - 1) // per_page)
    
    if "page" not in st.session_state:
        st.session_state.page = 1
        
    # Ensure page is valid
    if st.session_state.page > total_pages:
        st.session_state.page = total_pages
    if st.session_state.page < 1:
        st.session_state.page = 1
        
    with col_p2:
        # Centered pagination info
        st.write("") # Spacer
        st.markdown(f"<div style='text-align: center; padding-top: 10px;'>Page <b>{st.session_state.page}</b> of <b>{total_pages}</b></div>", unsafe_allow_html=True)

    with col_p3:
        # Navigation buttons
        c_prev, c_next = st.columns(2)
        with c_prev:
            if st.button("◀", key="prev_page", disabled=st.session_state.page <= 1):
                st.session_state.page -= 1
                st.rerun()
        with c_next:
            if st.button("▶", key="next_page", disabled=st.session_state.page >= total_pages):
                st.session_state.page += 1
                st.rerun()

    start = (st.session_state.page-1)*per_page
    subset = df_filtered.iloc[start:start+per_page]

    # grid
    per_row = 3 # Fixed to 3 for better consistency, or make selectable
    cols = st.columns(per_row)
    idx = 0
    for _, row in subset.iterrows():
        with cols[idx % per_row]:
            # Card container start
            st.markdown(f"""
            <div class="product-card">
                <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">{row['name'][:50]}...</div>
                <div style="color: #666; font-size: 0.9em; margin-bottom: 5px;">ID: <code>{row['id']}</code></div>
                <div style="color: #888; font-size: 0.9em;">Color: {row.get('color','N/A')}</div>
                <div style="color: #28a745; font-weight: bold; margin-top: 5px;">₹{row.get('price','N/A')}</div>
            </div>
            """, unsafe_allow_html=True)
            
            # Image handling - ONLY show if exists
            img_path = resolve_path(UPLOADS, row.get("image_file"))
            if img_path and os.path.exists(img_path):
                try:
                    img = Image.open(img_path)
                    thumb = img.copy()
                    thumb.thumbnail((260,260))
                    st.image(thumb, use_container_width=True)
                except Exception:
                    pass # Don't show anything if error
            
            if st.button(f"View Details", key=f"v{row['id']}"):
                st.session_state["selected_id"] = str(row["id"])
            
            st.markdown("---") # Separator between rows if needed, or just rely on card
        idx += 1

with right:
    st.subheader("Product details")
    selected = st.session_state.get("selected_id")
    prod = df[df["id"].astype(str)==str(selected)]
    if prod.empty:
        st.info("Select a product to view details.")
    else:
        p = prod.iloc[0]
        
        # Details Container
        st.markdown(f"""
        <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
            <h2 style="margin-top:0;">{p['name']}</h2>
            <p><b>ID:</b> <code>{p['id']}</code></p>
            <p><b>Color:</b> {p.get('color','N/A')}</p>
            <p><b>Price:</b> <span style="color: #28a745; font-weight: bold;">₹{p.get('price','N/A')}</span></p>
            <p><b>Status:</b> {p.get('predicted_status', 'Unknown')}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Hero image - ONLY show if exists
        img_path = resolve_path(UPLOADS, p.get("image_file"))
        if img_path and os.path.exists(img_path):
            try:
                img = Image.open(img_path)
                st.image(img, use_container_width=True)
            except Exception:
                pass

        st.markdown("### Blockchain Verification")
        st.code(f"meta_hash: {p.get('meta_hash')}")
        st.code(f"pid_hash: {p.get('pid_hash')}")
        st.code(f"short_hash: {p.get('short_hash')}")
        
        st.markdown("---")
        # progress bar for tracking stage
        tracking = p.get("tracking", [])
        if tracking:
            st.subheader("Tracking timeline")
            # show nice timeline with progress
            total = len(tracking)
            # assume delivered if last step is Delivered
            current_stage = 0
            for i, step in enumerate(tracking):
                ts = step.get("timestamp")
                try:
                    pretty = datetime.fromisoformat(ts).strftime("%Y-%m-%d %H:%M")
                except Exception:
                    pretty = ts
                status_line = f"{i+1}. **{step.get('step')}** — {step.get('location')} ({pretty})"
                if i < total-1:
                    st.markdown(status_line)
                    st.write("⬇️")
                else:
                    st.markdown(status_line)
                current_stage = i+1
            # progress bar visual (percentage of steps complete)
            prog = int(current_stage/total*100)
            st.progress(prog)
        else:
            st.info("No tracking available.")

        st.markdown("---")

        # --- NEW: Show tracking_url (if present) and make it clickable ---
        tracking_url = p.get("tracking_url") or p.get("trackingUrl") or None
        if tracking_url:
            st.markdown("**Tracking link (scan target):**")
            try:
                # clickable link
                st.markdown(f"[Open tracking page]({tracking_url})")
                st.caption(tracking_url)
            except Exception:
                st.write(tracking_url)
        else:
            st.info("No 'tracking_url' present in metadata.")

        st.markdown("---")

        # --- Robust QR and download handling ---
        # Resolve qr path from metadata (absolute or relative or basename)
        qr_meta = p.get("qr_file") or ""
        qr_path = None
        if qr_meta:
            if os.path.isabs(qr_meta) and os.path.exists(qr_meta):
                qr_path = qr_meta
            else:
                # try as relative path under QR_DIR or as basename
                qr_path = resolve_path(QR_DIR, qr_meta) or resolve_path(QR_DIR, os.path.basename(qr_meta))
        # fallback to default filename <id>.png
        if not qr_path:
            default_qr = os.path.join(QR_DIR, f"{p['id']}.png")
            if os.path.exists(default_qr):
                qr_path = default_qr

        if qr_path and os.path.exists(qr_path):
            try:
                im = Image.open(qr_path)
                # show nicely sized QR
                st.image(im.resize((300,300)), use_container_width=False)
            except Exception:
                st.warning("QR image exists but couldn't be opened.")
            # download button
            try:
                with open(qr_path,"rb") as f:
                    st.download_button("Download QR", f.read(), file_name=os.path.basename(qr_path), mime="image/png")
            except Exception:
                st.write("Download not available.")
        else:
            st.info("QR not found in ./qr/. Ensure backend generated QR images.")

st.markdown("---")
st.caption("UI: Professional catalog + timeline • Backend: demo AI+Keccak+QR generator")
