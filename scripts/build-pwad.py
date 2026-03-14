#!/usr/bin/env python3
"""Build a patched doom1.wad with lemon replacements.

Since shareware DOOM blocks -file, we patch the lumps directly into the IWAD.
Reads the original doom1.wad, replaces matching lumps with our custom ones,
and writes a new patched WAD.
"""

import shutil
import struct
from pathlib import Path

from PIL import Image

# DOOM's PLAYPAL — extracted directly from doom1.wad
DOOM_PALETTE = [
    (0,0,0),(31,23,11),(23,15,7),(75,75,75),(255,255,255),
    (27,27,27),(19,19,19),(11,11,11),(7,7,7),(47,55,31),
    (35,43,15),(23,31,7),(15,23,0),(79,59,43),(71,51,35),
    (63,43,27),(255,183,183),(247,171,171),(243,163,163),(235,151,151),
    (231,143,143),(223,135,135),(219,123,123),(211,115,115),(203,107,107),
    (199,99,99),(191,91,91),(187,87,87),(179,79,79),(175,71,71),
    (167,63,63),(163,59,59),(155,51,51),(151,47,47),(143,43,43),
    (139,35,35),(131,31,31),(127,27,27),(119,23,23),(115,19,19),
    (107,15,15),(103,11,11),(95,7,7),(91,7,7),(83,7,7),
    (79,0,0),(71,0,0),(67,0,0),(255,235,223),(255,227,211),
    (255,219,199),(255,211,187),(255,207,179),(255,199,167),(255,191,155),
    (255,187,147),(255,179,131),(247,171,123),(239,163,115),(231,155,107),
    (223,147,99),(215,139,91),(207,131,83),(203,127,79),(191,123,75),
    (179,115,71),(171,111,67),(163,107,63),(155,99,59),(143,95,55),
    (135,87,51),(127,83,47),(119,79,43),(107,71,39),(95,67,35),
    (83,63,31),(75,55,27),(63,47,23),(51,43,19),(43,35,15),
    (239,239,239),(231,231,231),(223,223,223),(219,219,219),(211,211,211),
    (203,203,203),(199,199,199),(191,191,191),(183,183,183),(179,179,179),
    (171,171,171),(167,167,167),(159,159,159),(151,151,151),(147,147,147),
    (139,139,139),(131,131,131),(127,127,127),(119,119,119),(111,111,111),
    (107,107,107),(99,99,99),(91,91,91),(87,87,87),(79,79,79),
    (71,71,71),(67,67,67),(59,59,59),(55,55,55),(47,47,47),
    (39,39,39),(35,35,35),(119,255,111),(111,239,103),(103,223,95),
    (95,207,87),(91,191,79),(83,175,71),(75,159,63),(67,147,55),
    (63,131,47),(55,115,43),(47,99,35),(39,83,27),(31,67,23),
    (23,51,15),(19,35,11),(11,23,7),(191,167,143),(183,159,135),
    (175,151,127),(167,143,119),(159,135,111),(155,127,107),(147,123,99),
    (139,115,91),(131,107,87),(123,99,79),(119,95,75),(111,87,67),
    (103,83,63),(95,75,55),(87,67,51),(83,63,47),(159,131,99),
    (143,119,83),(131,107,75),(119,95,63),(103,83,51),(91,71,43),
    (79,59,35),(67,51,27),(123,127,99),(111,115,87),(103,107,79),
    (91,99,71),(83,87,59),(71,79,51),(63,71,43),(55,63,39),
    (255,255,115),(235,219,87),(215,187,67),(195,155,47),(175,123,31),
    (155,91,19),(135,67,7),(115,43,0),(255,255,255),(255,219,219),
    (255,187,187),(255,155,155),(255,123,123),(255,95,95),(255,63,63),
    (255,31,31),(255,0,0),(239,0,0),(227,0,0),(215,0,0),
    (203,0,0),(191,0,0),(179,0,0),(167,0,0),(155,0,0),
    (139,0,0),(127,0,0),(115,0,0),(103,0,0),(91,0,0),
    (79,0,0),(67,0,0),(231,231,255),(199,199,255),(171,171,255),
    (143,143,255),(115,115,255),(83,83,255),(55,55,255),(27,27,255),
    (0,0,255),(0,0,227),(0,0,203),(0,0,179),(0,0,155),
    (0,0,131),(0,0,107),(0,0,83),(255,255,255),(255,235,219),
    (255,215,187),(255,199,155),(255,179,123),(255,163,91),(255,143,59),
    (255,127,27),(243,115,23),(235,111,15),(223,103,15),(215,95,11),
    (203,87,7),(195,79,0),(183,71,0),(175,67,0),(255,255,255),
    (255,255,215),(255,255,179),(255,255,143),(255,255,107),(255,255,71),
    (255,255,35),(255,255,0),(167,63,0),(159,55,0),(147,47,0),
    (135,35,0),(79,59,39),(67,47,27),(55,35,19),(47,27,11),
    (0,0,83),(0,0,71),(0,0,59),(0,0,47),(0,0,35),
    (0,0,23),(0,0,11),(0,0,0),(255,159,67),(255,231,75),
    (255,123,255),(255,0,255),(207,0,207),(159,0,155),(111,0,107),
    (167,107,107),
]


def closest_palette_index(r: int, g: int, b: int) -> int:
    best = 0
    best_dist = float("inf")
    for i, (pr, pg, pb) in enumerate(DOOM_PALETTE):
        dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        if dist < best_dist:
            best_dist = dist
            best = i
    return best


def png_to_patch(
    img: Image.Image,
    target_w: int | None = None,
    target_h: int | None = None,
    left_offset: int = 0,
    top_offset: int = 0,
    chroma_key: tuple[int, int, int] | None = None,
    chroma_threshold: int = 20,
) -> bytes:
    """Convert a PIL Image to DOOM patch format.

    If chroma_key is set, pixels within chroma_threshold distance of that
    color are treated as transparent (for RGB images without alpha).
    """
    if target_w and target_h:
        img = img.resize((target_w, target_h), Image.LANCZOS)

    img = img.convert("RGBA")
    w, h = img.size

    pixels: list[list[tuple[int, bool]]] = []
    for x in range(w):
        col = []
        for y in range(h):
            r, g, b, a = img.getpixel((x, y))
            is_transparent = a < 128
            if not is_transparent and chroma_key is not None:
                cr, cg, cb = chroma_key
                dist_sq = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
                is_transparent = dist_sq < chroma_threshold ** 2
            if is_transparent:
                col.append((0, True))
            else:
                col.append((closest_palette_index(r, g, b), False))
        pixels.append(col)

    header = struct.pack("<HHhh", w, h, left_offset, top_offset)
    col_offsets: list[int] = []
    col_data = bytearray()
    base_offset = 8 + w * 4

    max_post_len = 128  # vanilla DOOM can't handle posts > 128 pixels

    for x in range(w):
        col_offsets.append(base_offset + len(col_data))
        col = pixels[x]
        y = 0
        while y < h:
            if col[y][1]:
                y += 1
                continue
            start = y
            post_pixels = bytearray()
            while y < h and not col[y][1]:
                post_pixels.append(col[y][0])
                y += 1
            # Split long runs into chunks of max_post_len
            for chunk_start in range(0, len(post_pixels), max_post_len):
                chunk = post_pixels[chunk_start:chunk_start + max_post_len]
                row = start + chunk_start
                col_data.append(row if row < 255 else 254)
                col_data.append(len(chunk))
                col_data.append(0)  # pad byte
                col_data.extend(chunk)
                col_data.append(0)  # pad byte
        col_data.append(0xFF)

    offset_table = struct.pack(f"<{w}I", *col_offsets)
    return header + offset_table + bytes(col_data)


def read_lump_dimensions(wad_path: Path) -> dict[str, tuple[int, int, int, int]]:
    """Read original lump dimensions and offsets from a WAD file.

    Returns {name: (width, height, left_offset, top_offset)}.
    """
    dims: dict[str, tuple[int, int, int, int]] = {}
    with open(wad_path, "rb") as f:
        f.read(4)  # magic
        num_lumps = struct.unpack("<I", f.read(4))[0]
        dir_offset = struct.unpack("<I", f.read(4))[0]
        f.seek(dir_offset)
        entries = []
        for _ in range(num_lumps):
            offset = struct.unpack("<I", f.read(4))[0]
            size = struct.unpack("<I", f.read(4))[0]
            name = f.read(8).rstrip(b"\x00").decode("ascii")
            entries.append((offset, size, name))
        for offset, size, name in entries:
            if size > 8:
                f.seek(offset)
                w = struct.unpack("<H", f.read(2))[0]
                h = struct.unpack("<H", f.read(2))[0]
                lo = struct.unpack("<h", f.read(2))[0]
                to = struct.unpack("<h", f.read(2))[0]
                dims[name] = (w, h, lo, to)
    return dims


def png_to_patch_matching(
    img: Image.Image,
    target_w: int,
    target_h: int,
    left_offset: int,
    top_offset: int,
) -> bytes:
    """Convert a PIL Image to DOOM patch format, matching specific dimensions and offsets."""
    img = img.resize((target_w, target_h), Image.LANCZOS).convert("RGBA")
    w, h = img.size

    pixels: list[list[tuple[int, bool]]] = []
    for x in range(w):
        col = []
        for y in range(h):
            r, g, b, a = img.getpixel((x, y))
            if a < 128:
                col.append((0, True))
            else:
                col.append((closest_palette_index(r, g, b), False))
        pixels.append(col)

    header = struct.pack("<HHhh", w, h, left_offset, top_offset)
    col_offsets: list[int] = []
    col_data = bytearray()
    base_offset = 8 + w * 4
    max_post_len = 128

    for x in range(w):
        col_offsets.append(base_offset + len(col_data))
        col = pixels[x]
        y = 0
        while y < h:
            if col[y][1]:
                y += 1
                continue
            start = y
            post_pixels = bytearray()
            while y < h and not col[y][1]:
                post_pixels.append(col[y][0])
                y += 1
            for chunk_start in range(0, len(post_pixels), max_post_len):
                chunk = post_pixels[chunk_start:chunk_start + max_post_len]
                row = start + chunk_start
                col_data.append(row if row < 255 else 254)
                col_data.append(len(chunk))
                col_data.append(0)
                col_data.extend(chunk)
                col_data.append(0)
        col_data.append(0xFF)

    offset_table = struct.pack(f"<{w}I", *col_offsets)
    return header + offset_table + bytes(col_data)


def patch_wad(
    original: Path,
    output: Path,
    replacements: dict[str, bytes],
) -> None:
    """Patch an IWAD by replacing lumps with new data.

    Reads the original WAD, replaces matching lumps, and writes a new WAD.
    Lumps that aren't in the original are appended.
    """
    shutil.copy2(original, output)

    with open(output, "r+b") as f:
        # Read header
        magic = f.read(4)
        num_lumps = struct.unpack("<I", f.read(4))[0]
        dir_offset = struct.unpack("<I", f.read(4))[0]

        # Read directory
        f.seek(dir_offset)
        directory: list[tuple[int, int, str]] = []
        for _ in range(num_lumps):
            offset = struct.unpack("<I", f.read(4))[0]
            size = struct.unpack("<I", f.read(4))[0]
            name = f.read(8).rstrip(b"\x00").decode("ascii")
            directory.append((offset, size, name))

        # For each replacement, append the new data at end of file
        # and update the directory entry
        remaining = dict(replacements)
        new_directory = list(directory)

        for i, (offset, size, name) in enumerate(directory):
            if name in remaining:
                new_data = remaining.pop(name)
                # Append new data at end of file
                f.seek(0, 2)  # seek to end
                new_offset = f.tell()
                f.write(new_data)
                new_directory[i] = (new_offset, len(new_data), name)
                print(f"  Replaced: {name} ({size}b -> {len(new_data)}b)")

        # Append any lumps that weren't in the original
        for name, data in remaining.items():
            f.seek(0, 2)
            new_offset = f.tell()
            f.write(data)
            new_directory.append((new_offset, len(data), name))
            print(f"  Added: {name} ({len(data)}b)")

        # Write new directory at end of file
        f.seek(0, 2)
        new_dir_offset = f.tell()
        for offset, size, name in new_directory:
            f.write(struct.pack("<II", offset, size))
            f.write(name.encode("ascii").ljust(8, b"\x00")[:8])

        # Update header
        f.seek(4)
        f.write(struct.pack("<II", len(new_directory), new_dir_offset))

    print(f"  Written: {output} ({output.stat().st_size:,} bytes)")


def main() -> None:
    doom_dir = Path(__file__).parent.parent / "public" / "doom"
    lemoji_dir = Path(__file__).parent.parent / "public" / "images" / "lemoji"
    original_wad = doom_dir / "doom1.wad"

    replacements: dict[str, bytes] = {}

    # --- Remap red palette entries to yellow across all 14 PLAYPAL palettes ---
    print("Remapping PLAYPAL reds → yellows...")
    with open(original_wad, "rb") as f:
        f.read(4)
        num_lumps = struct.unpack("<I", f.read(4))[0]
        dir_offset = struct.unpack("<I", f.read(4))[0]
        f.seek(dir_offset)
        for _ in range(num_lumps):
            offset = struct.unpack("<I", f.read(4))[0]
            size = struct.unpack("<I", f.read(4))[0]
            name = f.read(8).rstrip(b"\x00").decode("ascii")
            if name == "PLAYPAL":
                f.seek(offset)
                pal_data = bytearray(f.read(size))
                break

    num_palettes = len(pal_data) // 768
    for p in range(num_palettes):
        base = p * 768
        # Indices 176-191: bright pure red ramp → yellow ramp
        for i in range(176, 192):
            idx = base + i * 3
            r = pal_data[idx]
            pal_data[idx] = r          # R stays
            pal_data[idx + 1] = r      # G = R (makes yellow)
            pal_data[idx + 2] = 0      # B stays 0

    replacements["PLAYPAL"] = bytes(pal_data)

    # --- Full-screen graphics ---
    titlepic = doom_dir / "TITLEPIC.png"
    if titlepic.exists():
        print("Converting TITLEPIC...")
        img = Image.open(titlepic)
        replacements["TITLEPIC"] = png_to_patch(img, 320, 200)

    # --- Menu logo ---
    m_doom = doom_dir / "M_DOOM.png"
    if m_doom.exists():
        print("Converting M_DOOM...")
        img = Image.open(m_doom)
        replacements["M_DOOM"] = png_to_patch(img, 123, 60)

    # --- Menu skull → lemon ---
    skull_map = {
        "M_SKULL1": "lemon_grumpy",
        "M_SKULL2": "lemon_enraged",
    }
    for lump_name, lemoji_name in skull_map.items():
        lemoji_path = lemoji_dir / f"{lemoji_name}.png"
        if lemoji_path.exists():
            print(f"Converting {lump_name} ({lemoji_name})...")
            img = Image.open(lemoji_path)
            replacements[lump_name] = png_to_patch(
                img, 20, 19, left_offset=0, top_offset=-1,
            )

    # --- Status bar face (lemoji replacements) ---
    face_map: dict[str, str] = {
        "smile": "lemon_smile",
        "pleased": "lemon_pleased",
        "grimace": "lemon_grimace",
        "sweat": "lemon_sweat",
        "scared": "lemon_scared",
        "ouch": "lemon_surprised",
        "evil": "lemon_smug",
        "kill": "lemon_enraged",
        "god": "lemon_fingerguns_shades",
        "dead": "lemon_exploding_head",
    }

    health_faces = ["smile", "pleased", "grimace", "sweat", "scared"]

    # Read original lump dimensions so we match exactly
    orig_dims = read_lump_dimensions(original_wad)

    face_images: dict[str, Image.Image] = {}
    for state, lemoji_name in face_map.items():
        lemoji_path = lemoji_dir / f"{lemoji_name}.png"
        if lemoji_path.exists():
            face_images[state] = Image.open(lemoji_path)

    if face_images:
        print("Converting status bar faces...")

        # Replace every STF* lump in the original WAD with the appropriate lemoji
        stf_state_map: dict[str, str] = {}

        for health_idx, state in enumerate(health_faces):
            # STFST{health}{direction} — normal face looking around
            for direction in range(3):
                stf_state_map[f"STFST{health_idx}{direction}"] = state
            # STFTL{health}0, STFTR{health}0 — turning left/right
            stf_state_map[f"STFTL{health_idx}0"] = state
            stf_state_map[f"STFTR{health_idx}0"] = state
            # STFOUCH{health} — took big hit
            stf_state_map[f"STFOUCH{health_idx}"] = "ouch"
            # STFEVL{health} — evil grin
            stf_state_map[f"STFEVL{health_idx}"] = "evil"
            # STFKILL{health} — rampage
            stf_state_map[f"STFKILL{health_idx}"] = "kill"

        stf_state_map["STFGOD0"] = "god"
        stf_state_map["STFDEAD0"] = "dead"

        for lump_name in orig_dims:
            if not lump_name.startswith("STF"):
                continue
            state = stf_state_map.get(lump_name)
            if not state or state not in face_images:
                continue
            w, h, lo, to = orig_dims[lump_name]
            replacements[lump_name] = png_to_patch_matching(
                face_images[state], w, h, lo, to,
            )

    # --- Patch the WAD ---
    if replacements:
        output = doom_dir / "doom1-lemon.wad"
        print(f"\nPatching WAD with {len(replacements)} lump replacements...")
        patch_wad(original_wad, output, replacements)
        print("Done!")
    else:
        print("No replacements to make!")


if __name__ == "__main__":
    main()
