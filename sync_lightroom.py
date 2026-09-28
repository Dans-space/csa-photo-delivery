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
    {"slug": "jade-stairs",      "title": "Jade (Stairs)",
     "space": "eed14cfa03e14cb1a76d1ce215e48070",
     "album": "09eadc6a48fc4d5fbbcb752ba12e1bb8"},
    {"slug": "jojo-stairs",      "title": "Jojo (Stairs)",
     "space": "1b624d29d3d34ac283eb022e3ff8e85e",
     "album": "6a07204977244cbd9d5560a86b88a738"},
    {"slug": "raphaelle-stairs", "title": "Raphaëlle (Stairs)",
     "space": "7e0a184d283842ddac2bf8c4ecfdaf69",
     "album": "77e04c8f558249aa811652c3667c20df"},
    {"slug": "rejna-stairs",     "title": "Rejna (Stairs)",
     "space": "0394add2295b48b8b038095982d0d75a",
     "album": "49b1cc5363004916bccec64a8b429d28"},
    {"slug": "roham-stairs",     "title": "Roham (Stairs)",
     "space": "39113ac50f354e498ab117709f3464b3",
     "album": "196ef74cc77c4f058e7d0b184cf41033"},
    {"slug": "susan-stairs",     "title": "Susan (Stairs)",
     "space": "f0ae2bf86b2647b1b25169246e9244f7",
     "album": "0127b8e9462647688b5cf8ffdb67ef3b"},
    {"slug": "tuya-stairs",      "title": "Tuya (Stairs)",
     "space": "498e257a505b48459b6e3f0fdc4a5f57",
     "album": "58b144f63764467293cabcafce5930ed"},
    {"slug": "victoria-stairs",  "title": "Victoria (Stairs)",
     "space": "ce0f82ded7aa441f83eefc85b69bbce3",
     "album": "74000bca3be54096bf133579fee325ac"},
    {"slug": "groupe-photo", "title": "Groupe Photo",
     "space": "ea02f4cc803645508749aff59acbac0b",
     "album": "465eb210b8994171a6f246f5c9ca4f4b"},
    {"slug": "exposed",   "title": "Exposed",
     "space": "0b541de7fbbc4b7f879e86b6ff8b2fa9",
     "album": "f4fe0af7ae2b414bba8b343b2d75da6e"},
    {"slug": "green-gate", "title": "The Green Gate",
     "space": "4b85ee2cabbc443289d21471403454b1",
     "album": "c9350c5815b649118795b7b0b3647282"},
    {"slug": "pool-group", "title": "Poolside",
     "space": "c7a825779f5b4bb1985f5b50d4c5bf65",
     "album": "7c5729ec15524a43bf6ae4f905275654"},
    {"slug": "the-pool",  "title": "The Pool",
     "space": "b62aa6ad14aa4252b0f57243bef8f212",
     "album": "3308564c98514556ad80bc577e8cf83d"},
    {"slug": "other",     "title": "Other",
     "space": "e8b26330ca9c4436bd8b3ddf5fccdf7b",
     "album": "474682090055482186b09c2ad129488b"},
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
           f"?embed=asset&subtype=image;video&limit=100&api_key={API_KEY}")
    while url:
        data = fetch(url)
        assets.extend(data.get("resources", []))
        nxt = data.get("links", {}).get("next", {}).get("href")
        if not nxt:
            break
        if nxt.startswith("http"):
            url = nxt
        elif nxt.startswith("spaces/"):
            url = f"{API_BASE}/{nxt}"
        else:
            url = f"{space_base(space)}/{nxt}"
        if "api_key" not in url:
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
