Synthetic CRP body docx is not committed to the repo (binary, large).
To build one for testing the merge_appendixes.py script, run the command
from this directory (01 CRP Body/) so the file is saved here and
merge_appendixes.py can auto-discover it:

    cd /path/to/scripts/crp-document-tools/fixtures/example_workspace/"01 CRP Body"
    pip install python-docx
    python -c "
import os, docx
d = docx.Document()
d.add_heading('Example Body', 0)
out = os.path.join(os.getcwd(), 'Clarke Moyer - Example Body (4-16-2026 0109 EDT).docx')
d.save(out)
print('Saved:', out)
"

Alternatively, pass an explicit --docx path to merge_appendixes.py to
avoid any working-directory dependency:

    python merge_appendixes.py --docx /full/path/to/body.docx --appendix-dir /full/path/to/appendixes

This avoids checking a binary into git history while still letting the
fixture demonstrate the body+appendix merge pattern when needed.
