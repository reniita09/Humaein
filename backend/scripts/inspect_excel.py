from __future__ import annotations

import json
from pathlib import Path

import openpyxl


def inspect(path: Path) -> None:
    wb = openpyxl.load_workbook(path)
    ws = wb.active
    headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
    print(json.dumps(headers))


if __name__ == "__main__":
    file_path = Path(__file__).resolve().parent.parent / ".." / "demofiles" / "091325_Humaein Recruitment_Claims File_vShared.xlsx"
    inspect(file_path.resolve())


