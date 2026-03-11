"""
Batch export all swappable character parts as individual GLB files.

Usage:
  1. Open Male.blend in Blender
  2. Scripting workspace → Open this file → Run (Alt+P)
  3. GLB files are saved to assets/parts/

Each category gets its own folder:
  assets/parts/hair/hair_01.glb
  assets/parts/shirt/anorak.glb
  assets/parts/legs/legs_01.glb
  etc.

Also generates a manifest.json listing all exported parts.
"""

import json
import os
import re

import bpy

# Output directory — relative to the .blend file's grandparent (repo root)
BLEND_DIR = os.path.dirname(bpy.data.filepath)
REPO_ROOT = os.path.dirname(os.path.dirname(BLEND_DIR))
OUTPUT_DIR = os.path.join(REPO_ROOT, "public", "models", "parts")

# Categories mapped to their Blender collection names and export rules.
# Each entry: (collection_path, output_subfolder, name_cleanup_prefix)
# "collection_path" can be a direct child of "Character & Clothes > Male"
# or a nested path like "Male > Male_Hair > Male_Hair 1"
CATEGORIES = {
    "hair": {
        "collection": "Male_Hair",
        "export_children": True,  # Each sub-collection is one hair style
    },
    "beard": {
        "collection": "Male_Beard",
        "export_children": True,
    },
    "eyeglasses": {
        "collection": "Male_Eyeglass",
        "export_objects": True,  # Each object in the collection is one option
    },
    "shirt": {
        "collection": "Male_Shirt",
        "export_objects": True,
    },
    "legs": {
        "collection": "Male_Legs",
        "export_children": True,
    },
    "shoes": {
        "collection": "Male_Shoes",
        "export_objects": True,
    },
    "outfit": {
        "collection": "Male_Outfits",
        "export_children": True,
    },
    "accessories": {
        "collection": "Male_Accesories",
        "export_objects": True,
    },
}


def find_collection(name, root=None):
    """Recursively find a collection by name."""
    if root is None:
        root = bpy.context.scene.collection

    for col in root.children:
        if col.name == name:
            return col
        found = find_collection(name, col)
        if found:
            return found
    return None


def clean_name(name):
    """Turn a Blender object/collection name into a clean filename."""
    # Remove "geo_male_" prefix
    name = re.sub(r"^geo_male_", "", name)
    # Remove "Male_" prefix
    name = re.sub(r"^Male_", "", name)
    # Replace spaces and dots with underscores
    name = re.sub(r"[\s.]+", "_", name)
    # Remove trailing numbers from collection names like "Hair 1" -> keep as "hair_1"
    # Lowercase
    name = name.lower().strip("_")
    return name


def hide_all():
    """Hide all objects in the scene."""
    for obj in bpy.data.objects:
        obj.hide_viewport = True
        obj.hide_render = True
        obj.select_set(False)


def show_object(obj):
    """Make an object visible and selected."""
    obj.hide_viewport = False
    obj.hide_render = False
    obj.select_set(True)


def show_collection_objects(col):
    """Show all objects in a collection (and its children)."""
    for obj in col.objects:
        show_object(obj)
    for child_col in col.children:
        show_collection_objects(child_col)


def export_glb(filepath):
    """Export selected objects as GLB."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_animations=False,
        export_skins=False,
        export_morph=True,
        export_morph_normal=False,
        export_morph_tangent=False,
        export_lights=False,
        export_cameras=False,
    )


def export_category_children(col, subfolder, manifest_entries):
    """Export each child collection as a separate GLB."""
    for child_col in sorted(col.children, key=lambda c: c.name):
        name = clean_name(child_col.name)
        filepath = os.path.join(OUTPUT_DIR, subfolder, f"{name}.glb")

        hide_all()
        show_collection_objects(child_col)

        # Check if anything is actually selected
        selected = [o for o in bpy.data.objects if o.select_get()]
        if not selected:
            print(f"  SKIP {child_col.name} (no visible objects)")
            continue

        print(f"  Exporting {child_col.name} -> {name}.glb ({len(selected)} objects)")
        export_glb(filepath)

        manifest_entries.append({
            "name": name,
            "category": subfolder,
            "file": f"parts/{subfolder}/{name}.glb",
            "source_collection": child_col.name,
            "object_count": len(selected),
        })


def export_category_objects(col, subfolder, manifest_entries):
    """Export each object in the collection as a separate GLB."""
    objects = sorted(col.objects, key=lambda o: o.name)
    for obj in objects:
        if obj.type != "MESH":
            continue

        name = clean_name(obj.name)
        filepath = os.path.join(OUTPUT_DIR, subfolder, f"{name}.glb")

        hide_all()
        show_object(obj)

        # Also show child objects (e.g., belt buckle parented to belt)
        for child in obj.children_recursive:
            show_object(child)

        selected = [o for o in bpy.data.objects if o.select_get()]
        print(f"  Exporting {obj.name} -> {name}.glb ({len(selected)} objects)")
        export_glb(filepath)

        manifest_entries.append({
            "name": name,
            "category": subfolder,
            "file": f"parts/{subfolder}/{name}.glb",
            "source_object": obj.name,
            "object_count": len(selected),
        })


def main():
    print("\n" + "=" * 60)
    print("BATCH PART EXPORTER")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)

    manifest = []
    total = 0

    for category, config in CATEGORIES.items():
        col = find_collection(config["collection"])
        if not col:
            print(f"\n[!] Collection '{config['collection']}' not found, skipping {category}")
            continue

        print(f"\n--- {category.upper()} ({col.name}) ---")

        if config.get("export_children"):
            export_category_children(col, category, manifest)
        elif config.get("export_objects"):
            export_category_objects(col, category, manifest)

        count = len([m for m in manifest if m["category"] == category])
        total += count
        print(f"  -> {count} parts exported")

    # Also export the eye variants from Male_Base_Body
    print(f"\n--- EYES ---")
    base_body_col = find_collection("Male_Base_Body")
    if base_body_col:
        eye_objects = [
            o for o in base_body_col.objects
            if o.type == "MESH" and "eye_" in o.name and "Blinn" not in o.name
        ]
        for obj in sorted(eye_objects, key=lambda o: o.name):
            name = clean_name(obj.name)
            filepath = os.path.join(OUTPUT_DIR, "eyes", f"{name}.glb")

            hide_all()
            show_object(obj)

            selected = [o for o in bpy.data.objects if o.select_get()]
            print(f"  Exporting {obj.name} -> {name}.glb")
            export_glb(filepath)

            manifest.append({
                "name": name,
                "category": "eyes",
                "file": f"parts/eyes/{name}.glb",
                "source_object": obj.name,
                "object_count": len(selected),
            })
            total += 1

    # Save manifest
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # Restore visibility
    hide_all()

    print(f"\n{'=' * 60}")
    print(f"DONE — {total} parts exported")
    print(f"Manifest: {manifest_path}")
    print(f"{'=' * 60}")


main()
