import os
import tarfile
import shutil
import argparse
import requests
from pathlib import Path

def download_geolite2(data_dir='data'):
    """
    Download the free GeoLite2 City database from the public mirror
    """
    # Create data directory if it doesn't exist
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    print("Downloading GeoLite2 City database...")
    
    # URL for the GeoLite2 City database (from a public mirror)
    url = "https://git.io/GeoLite2-City.mmdb"
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        filepath = os.path.join(data_dir, "GeoLite2-City.mmdb")
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Database downloaded and saved to {filepath}")
        return True
    except Exception as e:
        print(f"Error downloading database: {e}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download GeoLite2 City database")
    parser.add_argument("--data-dir", default="data", help="Directory to save the database")
    args = parser.parse_args()
    
    download_geolite2(args.data_dir)