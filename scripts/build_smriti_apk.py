import os
import sys
import struct
import zipfile
import subprocess
import shutil

def main():
    print("=== Starting Smriti APK Builder ===")
    source_apk = "Smriti.apk"
    if not os.path.exists(source_apk):
        source_apk = "SahayakSathi.apk"
    if not os.path.exists(source_apk):
        print("Error: Source APK not found")
        sys.exit(1)

    work_dir = "/tmp/smriti_apk_build"
    if os.path.exists(work_dir):
        shutil.rmtree(work_dir)
    os.makedirs(work_dir, exist_ok=True)

    # 1. Generate icon variants from public/logo.svg
    print("Generating Smriti icons from public/logo.svg...")
    sizes = {
        "mdpi": (48, 108),
        "hdpi": (72, 162),
        "xhdpi": (96, 216),
        "xxhdpi": (144, 324),
        "xxxhdpi": (192, 432),
    }

    # Generate 512x512 master PNG
    master_png = os.path.join(work_dir, "master_logo_512.png")
    subprocess.run(["rsvg-convert", "-w", "512", "-h", "512", "public/logo.svg", "-o", master_png], check=True)

    # Generate splash 512
    splash_png = os.path.join(work_dir, "splash_512.png")
    shutil.copy(master_png, splash_png)

    # Generate background for adaptive icon (teal gradient)
    bg_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f766e" />
          <stop offset="50%" stop-color="#0d9488" />
          <stop offset="100%" stop-color="#083344" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)" />
    </svg>"""
    bg_svg_path = os.path.join(work_dir, "adaptive_bg.svg")
    with open(bg_svg_path, "w") as f:
        f.write(bg_svg)

    # Foreground SVG with safe zone padding (central 66% of 512 = 340px)
    fg_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <linearGradient id="memoryCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="25%" stop-color="#fde047" />
          <stop offset="65%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ea580c" />
        </linearGradient>
        <linearGradient id="handLeftGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="#f0fdfa" />
          <stop offset="100%" stop-color="#99f6e4" />
        </linearGradient>
        <linearGradient id="handRightGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="#f0fdfa" />
          <stop offset="100%" stop-color="#a7f3d0" />
        </linearGradient>
      </defs>
      <g transform="translate(40, 30) scale(0.84)">
        <circle cx="256" cy="225" r="95" fill="#fef08a" opacity="0.25" />
        <path d="M 256 315 C 256 315, 160 248, 160 185 C 160 142, 198 116, 238 135 C 248 140, 256 150, 256 150 C 256 150, 264 140, 274 135 C 314 116, 352 142, 352 185 C 352 248, 256 315, 256 315 Z" fill="url(#memoryCoreGrad)" />
        <path d="M 108 375 C 125 335, 158 308, 192 292 C 214 282, 236 287, 247 305 C 236 320, 214 325, 186 336 C 158 347, 136 369, 125 398 C 115 392, 110 383, 108 375 Z" fill="url(#handLeftGrad)" />
        <path d="M 404 375 C 387 335, 354 308, 320 292 C 298 282, 276 287, 265 305 C 276 320, 298 325, 326 336 C 354 347, 376 369, 387 398 C 397 392, 402 383, 404 375 Z" fill="url(#handRightGrad)" />
        <circle cx="256" cy="115" r="14" fill="#ffffff" />
        <circle cx="256" cy="115" r="22" fill="#fef08a" opacity="0.6" />
      </g>
    </svg>"""
    fg_svg_path = os.path.join(work_dir, "adaptive_fg.svg")
    with open(fg_svg_path, "w") as f:
        f.write(fg_svg)

    icon_files = {}

    for dpi, (full_s, fg_s) in sizes.items():
        # Standard launcher icon
        full_png = os.path.join(work_dir, f"ic_{dpi}.png")
        full_webp = os.path.join(work_dir, f"ic_{dpi}.webp")
        subprocess.run(["rsvg-convert", "-w", str(full_s), "-h", str(full_s), "public/logo.svg", "-o", full_png], check=True)
        subprocess.run(["cwebp", "-quiet", "-q", "90", full_png, "-o", full_webp], check=True)
        with open(full_webp, "rb") as f:
            icon_files[f"res/mipmap-{dpi}-v4/ic_launcher.webp"] = f.read()
            icon_files[f"res/mipmap-{dpi}-v4/ic_launcher_round.webp"] = f.read()

        # Adaptive background
        bg_png = os.path.join(work_dir, f"bg_{dpi}.png")
        bg_webp = os.path.join(work_dir, f"bg_{dpi}.webp")
        subprocess.run(["rsvg-convert", "-w", str(fg_s), "-h", str(fg_s), bg_svg_path, "-o", bg_png], check=True)
        subprocess.run(["cwebp", "-quiet", "-q", "90", bg_png, "-o", bg_webp], check=True)
        with open(bg_webp, "rb") as f:
            icon_files[f"res/mipmap-{dpi}-v4/ic_launcher_background.webp"] = f.read()

        # Adaptive foreground
        fg_png = os.path.join(work_dir, f"fg_{dpi}.png")
        fg_webp = os.path.join(work_dir, f"fg_{dpi}.webp")
        subprocess.run(["rsvg-convert", "-w", str(fg_s), "-h", str(fg_s), fg_svg_path, "-o", fg_png], check=True)
        subprocess.run(["cwebp", "-quiet", "-q", "90", fg_png, "-o", fg_webp], check=True)
        with open(fg_webp, "rb") as f:
            icon_files[f"res/mipmap-{dpi}-v4/ic_launcher_foreground.webp"] = f.read()

    # Splashes
    with open(splash_png, "rb") as f:
        splash_data = f.read()
        icon_files["res/raw/front_splash.png"] = splash_data
        icon_files["res/raw-night-v8/front_splash.png"] = splash_data
        icon_files["assets/web/swv_splash.png"] = splash_data
        icon_files["assets/web/swv_splash_white.png"] = splash_data

    # 2. Modify resources.arsc (replace string 101 "Smart WebView" with "Smriti")
    print("Modifying resources.arsc string pool...")
    with zipfile.ZipFile(source_apk, "r") as z:
        arsc = bytearray(z.read("resources.arsc"))

    ctype, cheader_size, csize = struct.unpack("<HHI", arsc[0:8])
    sp_offset = cheader_size
    sp_type, sp_header_size, sp_size = struct.unpack("<HHI", arsc[sp_offset:sp_offset+8])
    scount, style_count, flags, strings_start, styles_start = struct.unpack("<IIIII", arsc[sp_offset+8:sp_offset+28])

    offsets = list(struct.unpack(f"<{scount}I", arsc[sp_offset+28:sp_offset+28+scount*4]))

    raw_strings = []
    for i in range(scount):
        s_begin = sp_offset + strings_start + offsets[i]
        if i < scount - 1:
            s_end = sp_offset + strings_start + offsets[i+1]
        else:
            s_end = sp_offset + (styles_start if style_count > 0 else sp_size)
        raw_strings.append(arsc[s_begin:s_end])

    # Replace string 101 with "Smriti"
    print(f"Original string 101: {raw_strings[101]}")
    raw_strings[101] = b"\x06\x06Smriti\x00"

    # Rebuild strings block and offsets
    new_strings_block = bytearray()
    new_offsets = []
    for s in raw_strings:
        new_offsets.append(len(new_strings_block))
        new_strings_block.extend(s)

    while len(new_strings_block) % 4 != 0:
        new_strings_block.append(0)

    new_sp_size = 28 + scount * 4 + style_count * 4 + len(new_strings_block)
    new_sp = bytearray()
    new_sp.extend(struct.pack("<HHI", sp_type, sp_header_size, new_sp_size))
    new_sp.extend(struct.pack("<IIIII", scount, style_count, flags, 28 + scount * 4, styles_start))
    for off in new_offsets:
        new_sp.extend(struct.pack("<I", off))
    new_sp.extend(new_strings_block)

    arsc_rest = arsc[sp_offset + sp_size:]
    new_csize = cheader_size + len(new_sp) + len(arsc_rest)
    new_arsc = bytearray()
    new_arsc.extend(struct.pack("<HHI", ctype, cheader_size, new_csize))
    new_arsc.extend(arsc[8:cheader_size])
    new_arsc.extend(new_sp)
    new_arsc.extend(arsc_rest)

    # 3. Read and modify other assets in APK
    print("Reading and updating APK entries...")
    unaligned_apk = "/tmp/smriti_unaligned.apk"
    with zipfile.ZipFile(source_apk, "r") as src_z, zipfile.ZipFile(unaligned_apk, "w", compression=zipfile.ZIP_DEFLATED) as dst_z:
        for item in src_z.infolist():
            filename = item.filename

            # Skip signatures
            if filename.startswith("META-INF/") and (filename.endswith(".SF") or filename.endswith(".RSA") or filename.endswith(".MF") or filename.endswith(".DSA")):
                continue

            if filename == "resources.arsc":
                # Stored uncompressed (standard for resources.arsc)
                dst_z.writestr(item, bytes(new_arsc), compress_type=zipfile.ZIP_STORED)
            elif filename in icon_files:
                # Replace with new Smriti icon / splash
                dst_z.writestr(item, icon_files[filename])
            elif filename == "assets/swv.properties":
                data = src_z.read(filename).decode("utf-8", errors="ignore")
                # Ensure correct offline / branding
                data = data.replace("Smart WebView", "Smriti")
                dst_z.writestr(item, data.encode("utf-8"))
            elif filename in ["assets/web/error.html", "assets/web/offline.html", "assets/web/script.js", "assets/web/style.css"]:
                data = src_z.read(filename).decode("utf-8", errors="ignore")
                data = data.replace("Smart WebView", "Smriti").replace("SmartWebView", "Smriti")
                dst_z.writestr(item, data.encode("utf-8"))
            else:
                data = src_z.read(filename)
                # Check compression type
                dst_z.writestr(item, data, compress_type=item.compress_type)

    # 4. Zipalign the APK
    print("Running zipalign...")
    aligned_apk = "/tmp/smriti_aligned.apk"
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    subprocess.run(["zipalign", "-v", "-p", "4", unaligned_apk, aligned_apk], check=True, stdout=subprocess.DEVNULL)

    # 5. Sign with apksigner using debug keystore
    keystore = "/tmp/debug.keystore"
    if not os.path.exists(keystore):
        subprocess.run([
            "keytool", "-genkey", "-v", "-keystore", keystore,
            "-storepass", "android", "-alias", "androiddebugkey",
            "-keypass", "android", "-keyalg", "RSA", "-keysize", "2048",
            "-validity", "10000", "-dname", "CN=Android Debug,O=Android,C=US"
        ], check=True)

    print("Signing APK with apksigner...")
    final_apk = "Smriti.apk"
    if os.path.exists(final_apk):
        os.remove(final_apk)

    subprocess.run([
        "apksigner", "sign",
        "--ks", keystore,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--ks-key-alias", "androiddebugkey",
        "--out", final_apk,
        aligned_apk
    ], check=True)

    # Verify signature
    print("Verifying APK signature...")
    res = subprocess.run(["apksigner", "verify", "-v", final_apk], capture_output=True, text=True, check=True)
    print(res.stdout)

    # Copy to public/Smriti.apk
    shutil.copy(final_apk, "public/Smriti.apk")
    print(f"Successfully generated {final_apk} ({os.path.getsize(final_apk)} bytes) and copied to public/Smriti.apk")

if __name__ == "__main__":
    main()
