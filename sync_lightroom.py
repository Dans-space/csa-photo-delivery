#!/usr/bin/env python3
"""
Sync photos from public Lightroom albums into the CSA delivery site.
Downloads photos (2048px) and writes a gallery.json manifest that
script.js reads to populate each person's photo grid.

Run:  python sync_lightroom.py
"""

import http.client
import json
import os
import re
import shutil
import sys
import urllib.request
import urllib.error

ALBUMS = [
    {"slug": "jade",      "title": "Jade",
     "space": "695c84306a594a98adc63234d675aed4",
     "album": "9355c14b69554316a02eedcad80bdf53"},
    {"slug": "victoria",  "title": "Victoria",
     "space": "db9d55b820614b39a7a5cab65fba610f",
     "album": "44daf43a46944484827df62253df01a2"},
    {"slug": "jojo",      "title": "Jojo",
     "space": "c95614ed3436430f8472d52f9d921bcd",
     "album": "014eb412b2fc4c58af3111cf289fe07e"},
    {"slug": "roham",     "title": "Roham",
     "space": "0d4fcde5a5a44c588084bf7ace275c66",
     "album": "c9c4ba2eb2ae43a3bfd04e3516e94b4a"},
    {"slug": "raphaelle", "title": "Raphaëlle",
     "space": "41bc7282ca914542990ca54b5e0c94e4",
     "album": "5416a118c5af4da9bd689945a506e509"},
    {"slug": "tuya",      "title": "Tuya",
     "space": "d96d7b5352944e5d88a712b81c57bac9",
     "album": "17cbc414065f407cb95e52a527c7acb3"},
    {"slug": "susan",     "title": "Susan",
     "space": "4ad3d67178c44685841b16756c68dc2e",
     "album": "2e02b705920342219bab8c159e1fc856"},
    {"slug": "rejna",     "title": "Rejna",
     "space": "0d4551ce690941948c1b6fafa81c3447",
     "album": "0ea0d68de5474dbfa01fe139a977318c"},
    {"slug": "jpeg",      "title": "JPEG",
     "space": "b8b38f2249e44d8abcecba87ff3fe5dd",
     "album": "9403a9e314eb4107accca339310b4fd3"},
]

API_KEY = "LightroomMobileWeb1"
SIZE = "2048"
API_BASE = "https://photos.adobe.io/v2"

ROOT = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(ROOT, "assets", "gallery")
MANIFEST = os.path.join(ROOT, "assets", "gallery.json")
UA = "Mozilla/5.0 (portfolio-sync)"


def fetch(url, binary=False, tries=3):
    last = None
    for attempt in range(1, tries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            break
        except (urllib.error.URLError, http.client.IncompleteRead,
                TimeoutError) as e:
            last = e
            if attempt == tries:
                raise
    if binary:
        return data
    text = data.decode("utf-8", "replace")
    text = re.sub(r"^while\s*\(1\)\s*\{\}", "", text).lstrip()
    return json.loads(text)


def space_base(space):
    return f"{API_BASE}/spaces/{space}"


def list_assets(space, album):
    assets = []
    url = (f"{space_base(space)}/albums/{album}/assets"
           f"?embed=asset&subtype=image&limit=100&api_key={API_KEY}")
    while url:
        data = fetch(url)
        assets.extend(data.get("resources", []))
        nxt = data.get("links", {}).get("next", {}).get("href")
        url = (f"{API_BASE}/{nxt}" if nxt and not nxt.startswith("http")
               else nxt) if nxt else None
        if url and "api_key" not in url:
            url += ("&" if "?" in url else "?") + "api_key=" + API_KEY
    return assets


def safe_name(filename, asset_id):
    stem = os.path.splitext(filename or "")[0]
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", stem).strip("-").lower()
    return stem or asset_id[:10]


def sync_album(meta):
    space, album, slug = meta["space"], meta["album"], meta["slug"]
    out_dir = os.path.join(GALLERY_DIR, slug)
    os.makedirs(out_dir, exist_ok=True)

    print(f"\n[{meta['title']}]  ({slug})")
    resources = list_assets(space, album)
    print(f"  {len(resources)} photos")

    photos, used = [], set()
    for idx, res in enumerate(resources, 1):
        asset = res.get("asset", res)
        aid = asset.get("id", "")
        payload = asset.get("payload", {}) or {}
        imp = payload.get("importSource", {}) or {}
        rel = (asset.get("links", {}) or {}).get(f"/rels/rendition_type/{SIZE}") or {}
        href = rel.get("href")
        if not href:
            print(f"    [{idx}] {aid[:8]} - no {SIZE}px rendition, skipped")
            continue

        name = safe_name(imp.get("fileName", ""), aid)
        while name in used:
            name += "-2"
        used.add(name)
        fname = f"{name}.jpg"

        try:
            blob = fetch(f"{space_base(space)}/{href}?api_key={API_KEY}", binary=True)
        except urllib.error.HTTPError as e:
            print(f"    [{idx}] {name} - download failed (HTTP {e.code})")
            continue

        with open(os.path.join(out_dir, fname), "wb") as f:
            f.write(blob)
        photos.append({
            "file": f"assets/gallery/{slug}/{fname}",
            "name": imp.get("fileName", fname),
        })
        print(f"    [{idx}] {name}")

    print(f"  -> {len(photos)} photos saved")
    return {
        "slug": slug,
        "title": meta["title"],
        "count": len(photos),
        "photos": photos,
    }


def main():
    os.makedirs(GALLERY_DIR, exist_ok=True)

    albums = []
    for meta in ALBUMS:
        try:
            albums.append(sync_album(meta))
        except urllib.error.HTTPError as e:
            sys.exit(f"ERROR on '{meta['title']}': HTTP {e.code}")

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump({"albums": albums}, f, indent=2)

    total = sum(a["count"] for a in albums)
    print(f"\nDone: {len(albums)} people, {total} photos -> assets/gallery/")


if __name__ == "__main__":
    main()
