import os
import subprocess
import urllib.request
import urllib.parse
import uuid
import sys
from minio import Minio

MINIO_ENDPOINT = "127.0.0.1:9020"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "greenfruit"

DURIAN_LOCAL_IMAGE = "/Users/caolei/.gemini/antigravity/brain/b734f9f2-88d3-472f-b05c-d325600a6696/durian_premium_1783421445837.jpg"

def run_mysql(query):
    cmd = ["mysql", "-uroot", "-p123456", "-D", "lgg_ruoyi", "-N", "-s", "-e", query]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"MySQL Error: {res.stderr}")
        return []
    return [line.strip().split("\t") for line in res.stdout.strip().split("\n") if line.strip()]

def main():
    # Initialize MinIO client
    client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)
    
    # Check if bucket exists
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)
        print(f"Created bucket: {MINIO_BUCKET}")
        
    print("Fetching products and setmeals...")
    fruits = run_mysql("SELECT id, name, image FROM lgg_fruit;")
    boxes = run_mysql("SELECT id, name, image FROM lgg_fruit_box;")
    
    all_items = []
    for item in fruits:
        all_items.append(("fruit", int(item[0]), item[1], item[2]))
    for item in boxes:
        all_items.append(("box", int(item[0]), item[1], item[2]))
        
    for item_type, item_id, name, img_url in all_items:
        print(f"\nProcessing {name} (ID: {item_id}, Type: {item_type})...")
        
        # 1. Determine local file path
        local_path = None
        ext = ".jpg"
        
        if item_id == 102 and item_type == "fruit":
            if os.path.exists(DURIAN_LOCAL_IMAGE):
                local_path = DURIAN_LOCAL_IMAGE
                print(f"Using local premium durian image: {local_path}")
            else:
                print(f"Warning: local durian image not found at {DURIAN_LOCAL_IMAGE}")
        
        if not local_path:
            if not img_url.startswith("http"):
                print(f"Skip: {img_url} is already local or invalid.")
                continue
            if "127.0.0.1:9020" in img_url:
                print(f"Skip: {img_url} is already a MinIO URL.")
                continue
                
            # Parse extension from URL if possible
            parsed = urllib.parse.urlparse(img_url)
            path_ext = os.path.splitext(parsed.path)[1]
            if path_ext in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
                ext = path_ext
                
            temp_filename = f"temp_{uuid.uuid4()}{ext}"
            print(f"Downloading {img_url} ...")
            try:
                # Set custom User-Agent to avoid HTTP 403 Forbidden from unsplash
                req = urllib.request.Request(
                    img_url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                )
                with urllib.request.urlopen(req, timeout=15) as response, open(temp_filename, 'wb') as out_file:
                    out_file.write(response.read())
                local_path = temp_filename
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")
                continue
                
        # 2. Upload to MinIO
        object_name = f"{uuid.uuid4()}{ext}"
        print(f"Uploading to MinIO as {object_name}...")
        try:
            client.fput_object(MINIO_BUCKET, object_name, local_path)
            new_url = f"http://127.0.0.1:9020/greenfruit/{object_name}"
            print(f"Uploaded. New URL: {new_url}")
        except Exception as e:
            print(f"Failed to upload to MinIO: {e}")
            if local_path and local_path.startswith("temp_") and os.path.exists(local_path):
                os.remove(local_path)
            continue
            
        # Clean up temp file
        if local_path and local_path.startswith("temp_") and os.path.exists(local_path):
            os.remove(local_path)
            
        # 3. Update Database
        table = "lgg_fruit" if item_type == "fruit" else "lgg_fruit_box"
        update_query = f"UPDATE {table} SET image = '{new_url}' WHERE id = {item_id};"
        run_mysql(update_query)
        print(f"Updated product database image link.")
        
        # 4. Update shopping carts and order details where applicable
        # We need to escape single quotes in img_url for MySQL
        escaped_old_url = img_url.replace("'", "\\'")
        
        cart_update = f"UPDATE lgg_shopping_cart SET image = '{new_url}' WHERE fruit_id = {item_id} AND image = '{escaped_old_url}';" if item_type == "fruit" else f"UPDATE lgg_shopping_cart SET image = '{new_url}' WHERE fruit_box_id = {item_id} AND image = '{escaped_old_url}';"
        run_mysql(cart_update)
        
        detail_update = f"UPDATE lgg_order_detail SET image = '{new_url}' WHERE fruit_id = {item_id} AND image = '{escaped_old_url}';" if item_type == "fruit" else f"UPDATE lgg_order_detail SET image = '{new_url}' WHERE fruit_box_id = {item_id} AND image = '{escaped_old_url}';"
        run_mysql(detail_update)
        print(f"Updated historical order details and active shopping carts matching the old URL.")

    print("\nMigration finished successfully!")

if __name__ == "__main__":
    main()
