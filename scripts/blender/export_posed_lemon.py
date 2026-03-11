"""
Export the lemon character WITH the armature for runtime posing/animation.

Usage:
  1. Open Male.blend in Blender
  2. Make visible: body, eyes, eyebrows, teeth, hair, legs, shoes
     (whatever parts you want in the base model)
  3. Scripting workspace → Open this file → Run (Alt+P)
  4. Saves to public/models/lemon.glb

This script:
  - Selects visible meshes + the armature
  - Poses arms into a relaxed idle position
  - Exports WITH the rig (skins=True) so we can animate in R3F
  - Keeps morph targets for face animation
  - Resets the pose when done
"""

import math
import os

import bpy

BLEND_DIR = os.path.dirname(bpy.data.filepath)
REPO_ROOT = os.path.dirname(os.path.dirname(BLEND_DIR))
OUTPUT_PATH = os.path.join(REPO_ROOT, "public", "models", "lemon.glb")


def set_bone_rotation(armature, bone_name, x=0, y=0, z=0):
    """Set a bone's rotation in degrees (Euler XYZ)."""
    bone = armature.pose.bones.get(bone_name)
    if not bone:
        print(f"  [!] Bone '{bone_name}' not found")
        return
    bone.rotation_mode = "XYZ"
    bone.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))


def main():
    print("\n" + "=" * 50)
    print("RIGGED LEMON EXPORTER")
    print("=" * 50)

    # Find the armature
    rig = bpy.data.objects.get("rig_male")
    if not rig:
        print("[!] Could not find 'rig_male' armature!")
        return

    # Set a relaxed rest pose
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.pose.transforms_clear()

    # Arms down at sides with slight bend
    set_bone_rotation(rig, "upper_arm_fk.L", x=0, y=0, z=65)
    set_bone_rotation(rig, "upper_arm_fk.R", x=0, y=0, z=-65)
    set_bone_rotation(rig, "forearm_fk.L", x=0, y=0, z=10)
    set_bone_rotation(rig, "forearm_fk.R", x=0, y=0, z=-10)

    print("  Relaxed pose applied")
    bpy.ops.object.mode_set(mode="OBJECT")

    # Select meshes + armature
    bpy.ops.object.select_all(action="DESELECT")

    # Select the rig
    rig.select_set(True)

    # Select visible mesh objects (skip rig widgets and cage deform meshes)
    skip_prefixes = ("WGT", "Male_Cage", "msdf_", "male_cage")
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        if obj.hide_viewport:
            continue
        if any(obj.name.startswith(p) for p in skip_prefixes):
            continue
        # Skip background/scene objects
        if obj.name in ("Background", "Cube"):
            continue
        obj.select_set(True)

    bpy.context.view_layer.objects.active = rig

    selected = [o.name for o in bpy.context.selected_objects]
    print(f"  Selected: {selected}")

    # Export WITH armature
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        use_selection=True,
        export_apply=False,  # Don't apply modifiers — keep the rig live
        export_animations=False,  # We'll drive animations from code
        export_skins=True,  # Include the armature/skeleton
        export_morph=True,  # Keep blend shapes
        export_morph_normal=False,
        export_morph_tangent=False,
        export_def_bones=True,  # Only export deform bones (DEF-*), skip controls
        export_lights=False,
        export_cameras=False,
    )

    print(f"  Exported to: {OUTPUT_PATH}")

    # Check file size
    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"  File size: {size_mb:.1f} MB")

    # Reset pose
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.pose.transforms_clear()
    bpy.ops.object.mode_set(mode="OBJECT")

    print("  Pose reset")
    print("=" * 50)
    print("DONE — reload your dev server to see the change")


main()
