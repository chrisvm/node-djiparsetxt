import os
from pathlib import Path


def rename_files(dir):
    index = 0
    listing = os.listdir(dir)
    base = os.path.basename(dir)

    print(f"  Processing '{base}'")

    for filename in listing:
        src = os.path.join(dir, filename)
        
        # if folder, ignore
        if os.path.isdir(src):
            print(f"    Ignoring subdir {src}")
            continue
        
        ext = "".join(Path(src).suffixes)
        dst = os.path.join(dir, f"{base}_{index}{ext}")

        print(f"    Renaming '{os.path.basename(src)}' -> '{os.path.basename(dst)}'")

        os.rename(src, dst)
        index += 1

def main():
    # get all the dirs in current dir
    script_folder = os.path.dirname(__file__)

    print(f"Processing subdirs of dir '{script_folder}'")

    # for each folder in directory of script
    for entry in os.listdir(script_folder):
        # create full path to subfolder
        dir_path = os.path.join(script_folder, entry)

        # only process if a directory
        if os.path.isdir(dir_path):
            rename_files(dir_path)

if __name__ == "__main__":
    main()