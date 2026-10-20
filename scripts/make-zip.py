import os
import zipfile

src = "dist"
out = "intro-nekoweb.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for root, dirs, files in os.walk(src):
        dirs.sort()
        files.sort()
        for f in files:
            p = os.path.join(root, f)
            arc = os.path.relpath(p, src).replace(os.sep, "/")
            z.write(p, arc)
size = os.path.getsize(out)
names = zipfile.ZipFile(out).namelist()
print(out, round(size / 1024 / 1024, 2), "MB", len(names), "entries")
print("root:", [n for n in names if "/" not in n])
