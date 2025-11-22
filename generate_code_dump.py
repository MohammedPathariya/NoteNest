import os

def dump_code(output_file='code_dump.txt'):
    # Define the paths and extensions we want to include
    target_dirs = {
        'backend': ['.py'],
        'frontend/src': None  # None means include all files in this directory
    }

    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Walk through the root directory
        for root, dirs, files in os.walk('.'):
            # Check if we are in one of the target directories or their subdirectories
            is_target = False
            for target_path, extensions in target_dirs.items():
                # Normalize paths to handle different OS separators
                if os.path.normpath(target_path) in os.path.normpath(root):
                    is_target = True
                    current_extensions = extensions
                    break
            
            if not is_target:
                continue

            for file in files:
                # If extensions are specified (like for backend), check them
                if current_extensions and not any(file.endswith(ext) for ext in current_extensions):
                    continue
                
                # Construct full file path
                file_path = os.path.join(root, file)
                
                # Skip the script itself or the output file if they happen to be in the source path
                if file_path.endswith('generate_code_dump.py') or file_path.endswith(output_file):
                    continue

                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        
                        # Write a clear header for each file
                        outfile.write(f"\n{'='*80}\n")
                        outfile.write(f"FILE: {file_path}\n")
                        outfile.write(f"{'='*80}\n\n")
                        outfile.write(content)
                        outfile.write("\n")
                        
                    print(f"Included: {file_path}")
                except Exception as e:
                    print(f"Skipped (Error reading): {file_path} - {e}")

    print(f"\nSuccessfully generated code dump at: {os.path.abspath(output_file)}")

if __name__ == "__main__":
    dump_code()