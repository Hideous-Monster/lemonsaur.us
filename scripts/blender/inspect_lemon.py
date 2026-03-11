"""
Inspect Lemon.blend and dump its structure.

Usage:
  1. Open Lemon.blend in Blender
  2. Go to Scripting workspace
  3. Open this file and run it (Alt+P)
  4. Check console output + saves lemon_inspect.json next to the .blend
"""

import json
import os

import bpy


def main():
    output = {
        "file": bpy.data.filepath,
        "objects": [],
        "collections": [],
        "materials": [],
    }

    # All objects
    for obj in bpy.data.objects:
        info = {
            "name": obj.name,
            "type": obj.type,
            "parent": obj.parent.name if obj.parent else None,
            "location": list(obj.location),
            "scale": list(obj.scale),
            "visible": not obj.hide_viewport,
        }

        if obj.type == "MESH":
            info["vertex_count"] = len(obj.data.vertices)
            info["face_count"] = len(obj.data.polygons)
            info["materials"] = [m.name if m else "None" for m in obj.data.materials]

            if obj.data.shape_keys:
                info["shape_keys"] = [kb.name for kb in obj.data.shape_keys.key_blocks]

            if obj.modifiers:
                info["modifiers"] = [{"name": m.name, "type": m.type} for m in obj.modifiers]

            # Vertex groups (bone weights)
            if obj.vertex_groups:
                info["vertex_groups"] = [vg.name for vg in obj.vertex_groups]

        elif obj.type == "ARMATURE":
            info["bone_count"] = len(obj.data.bones)
            info["bones"] = [b.name for b in obj.data.bones]

        output["objects"].append(info)

    # Collections
    def dump_col(col):
        return {
            "name": col.name,
            "objects": [o.name for o in col.objects],
            "children": [dump_col(c) for c in col.children],
        }

    for col in bpy.context.scene.collection.children:
        output["collections"].append(dump_col(col))

    # Materials
    for mat in bpy.data.materials:
        output["materials"].append(mat.name)

    # Print summary
    print("\n" + "=" * 50)
    print("LEMON MODEL INSPECTION")
    print("=" * 50)
    for obj in output["objects"]:
        sk = f", {len(obj.get('shape_keys', []))} shape keys" if obj.get("shape_keys") else ""
        verts = f", {obj.get('vertex_count', '?')} verts" if obj.get("vertex_count") else ""
        print(f"  {obj['name']} ({obj['type']}{verts}{sk})")
    print(f"\nMaterials: {output['materials']}")
    print("=" * 50)

    # Save
    out_path = os.path.join(os.path.dirname(bpy.data.filepath), "lemon_inspect.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Saved to: {out_path}")


main()
