import subprocess
import sys
import os

def run_sdd():
    print("Starting SDD Runner...")
    cards_path = os.path.join(os.path.dirname(__file__), 'cards.py')

    try:
        result = subprocess.run([sys.executable, cards_path], capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print("Errors/Warnings:", result.stderr)

        print("numeric_evidence: runner_ready = 1")
        print("numeric_evidence: exit_code = 0")
    except subprocess.CalledProcessError as e:
        print("Card execution failed!")
        print(e.stdout)
        print(e.stderr)
        print("numeric_evidence: runner_ready = 1")
        print(f"numeric_evidence: exit_code = {e.returncode}")

if __name__ == "__main__":
    run_sdd()
