"""
Inspect the Characterz Male.blend file and dump the full structure.

Usage:
  1. Open Male.blend in Blender
  2. Go to Scripting workspace (top menu bar)
  3. Click "New" to create a new text block
  4. Paste this entire script
  5. Click "Run Script" (or Alt+P)
  6. Check the terminal/console for output — also saves to inspect_output.json

The output tells us:
  - All collections and their hierarchy
  - All objects and what type they are (mesh, armature, etc.)
  - Shape keys on each mesh
  - Modifiers on each mesh
  - Armature bone names
  - Material names
"""

import json
import os

import bpy


def inspect_collection(col, depth=0):
    """Recursively inspect a collection and its children."""
    result = {
        "name": col.name,
        "objects": [],
        "children": [],
    }

    for obj in col.objects:
        obj_info = {
            "name": obj.name,
            "type": obj.type,
            "parent": obj.parent.name if obj.parent else None,
            "visible": not obj.hide_viewport,
            "vertex_count": len(obj.data.vertices) if obj.type == "MESH" else None,
        }

        # Shape keys
        if obj.type == "MESH" and obj.data.shape_keys:
            obj_info["shape_keys"] = [
                kb.name for kb in obj.data.shape_keys.key_blocks
            ]

        # Modifiers
        if obj.modifiers:
            obj_info["modifiers"] = [
                {"name": m.name, "type": m.type} for m in obj.modifiers
            ]

        # Materials
        if obj.type == "MESH" and obj.data.materials:
            obj_info["materials"] = [
                m.name if m else "None" for m in obj.data.materials
            ]

        # Armature bones
        if obj.type == "ARMATURE" and obj.data.bones:
            obj_info["bone_count"] = len(obj.data.bones)
            obj_info["bones"] = [b.name for b in obj.data.bones]

        result["objects"].append(obj_info)

    for child_col in col.children:
        result["children"].append(inspect_collection(child_col, depth + 1))

    return result


def main():
    print("\n" + "=" * 60)
    print("CHARACTERZ MODEL INSPECTOR")
    print("=" * 60)

    output = {
        "file": bpy.data.filepath,
        "blender_version": ".".join(str(v) for v in bpy.app.version),
        "scene_collections": [],
        "all_armatures": [],
        "all_shape_key_objects": [],
    }

    # Inspect scene collection hierarchy
    scene_col = bpy.context.scene.collection
    for col in scene_col.children:
        output["scene_collections"].append(inspect_collection(col))

    # Also inspect root-level objects
    root_objects = []
    for obj in scene_col.objects:
        root_objects.append({
            "name": obj.name,
            "type": obj.type,
            "parent": obj.parent.name if obj.parent else None,
        })
    output["root_objects"] = root_objects

    # Summary: all armatures
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            output["all_armatures"].append({
                "name": obj.name,
                "bone_count": len(obj.data.bones),
            })

    # Summary: all objects with shape keys
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.data.shape_keys:
            output["all_shape_key_objects"].append({
                "name": obj.name,
                "shape_key_count": len(obj.data.shape_keys.key_blocks),
                "shape_keys": [kb.name for kb in obj.data.shape_keys.key_blocks],
            })

    # Print summary to console
    print(f"\nFile: {output['file']}")
    print(f"Blender: {output['blender_version']}")

    print(f"\nArmatures: {len(output['all_armatures'])}")
    for arm in output["all_armatures"]:
        print(f"  - {arm['name']} ({arm['bone_count']} bones)")

    print(f"\nObjects with shape keys: {len(output['all_shape_key_objects'])}")
    for obj in output["all_shape_key_objects"]:
        print(f"  - {obj['name']} ({obj['shape_key_count']} keys)")
        for sk in obj["shape_keys"][:10]:
            print(f"      {sk}")
        if len(obj["shape_keys"]) > 10:
            print(f"      ... and {len(obj['shape_keys']) - 10} more")

    print(f"\nTop-level collections:")
    for col in output["scene_collections"]:
        print(f"  - {col['name']} ({len(col['objects'])} objects, {len(col['children'])} subcollections)")
        for child in col["children"]:
            obj_count = len(child["objects"])
            sub_count = len(child["children"])
            print(f"      - {child['name']} ({obj_count} objects, {sub_count} subcollections)")
            for sub in child["children"]:
                print(f"          - {sub['name']} ({len(sub['objects'])} objects)")

    # Save full output as JSON
    out_path = os.path.join(os.path.dirname(bpy.data.filepath), "inspect_output.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nFull output saved to: {out_path}")
    print("=" * 60)


main()
