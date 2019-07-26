import os
import re
from pathlib import Path


def rename_files(dir):
    base = os.path.basename(dir)
    regex = re.compile(f"{base}_([0-9]+)")
    listing = os.listdir(dir)

    print(f"  Processing '{dir}'\n")

    change_queue = []
    index = -1

    for filename in listing:
        src = os.path.join(dir, filename)
        
        # if folder, ignore
        if os.path.isdir(src):
            print(f"    Ignoring subdir {src}")
            continue
        
        # check if already renamed
        match = regex.match(filename)
        if match:
            match_index = int(match.group(1))
            print(f"    Already renamed {filename} with index {match_index}")
            index = max(index, match_index)
            continue

        ext = "".join(Path(src).suffixes)
        file_options = { "base": base, "ext": ext }
        change_queue.append((src, file_options))

    index += 1
    for src, options in change_queue:
        dst = os.path.join(dir, f"{options['base']}_{index}{options['ext']}")
        print(f"    Renaming '{os.path.basename(src)}' -> '{os.path.basename(dst)}'")
        os.rename(src, dst)
        index += 1
    print()

def main():
    # get all the dirs in current dir
    script_folder = os.path.dirname(__file__)

    print(f"Processing subdirs of dir '{script_folder}'\n")

    # for each folder in directory of script
    for entry in os.listdir(script_folder):
        # create full path to subfolder
        dir_path = os.path.join(script_folder, entry)

        # only process if a directory
        if os.path.isdir(dir_path):
            rename_files(dir_path)

if __name__ == "__main__":
    main()