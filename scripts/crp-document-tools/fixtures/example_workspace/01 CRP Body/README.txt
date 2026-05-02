Synthetic CRP body docx is not committed to the repo (binary, large).
To build one for testing the merge_appendixes.py script:

    pip install python-docx
    python -c "from docx import Document; d=Document(); d.add_heading('Example Body', 0); d.save('Clarke Moyer - Example Body (4-16-2026 0109 EDT).docx')"

This avoids checking a binary into git history while still letting the
fixture demonstrate the body+appendix merge pattern when needed.
