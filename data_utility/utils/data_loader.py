from __future__ import annotations

from io import BytesIO
from typing import Optional, Tuple

import pandas as pd

CHUNK_THRESHOLD_BYTES = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 50_000
MAX_ROWS_FOR_DISPLAY = 200_000


def _read_csv_with_encoding(buffer: BytesIO, encoding: str, chunksize: Optional[int] = None):
    buffer.seek(0)
    return pd.read_csv(buffer, encoding=encoding, chunksize=chunksize, low_memory=False)


def load_csv(uploaded_file) -> Tuple[Optional[pd.DataFrame], Optional[str], bool]:
    """
    Load CSV with encoding fallbacks and chunk mode for large files.

    Returns:
        (df, error_message, sampled_for_performance)
    """
    if uploaded_file is None:
        return None, "No file uploaded.", False

    if not uploaded_file.name.lower().endswith(".csv"):
        return None, "Only CSV files are supported.", False

    raw = uploaded_file.getvalue()
    sampled_for_performance = False

    for encoding in ("utf-8", "latin-1"):
        try:
            if uploaded_file.size > CHUNK_THRESHOLD_BYTES:
                chunk_iter = _read_csv_with_encoding(BytesIO(raw), encoding=encoding, chunksize=CHUNK_SIZE)
                chunks = []
                row_count = 0

                for chunk in chunk_iter:
                    chunks.append(chunk)
                    row_count += len(chunk)
                    if row_count >= MAX_ROWS_FOR_DISPLAY:
                        sampled_for_performance = True
                        break

                if not chunks:
                    return pd.DataFrame(), None, sampled_for_performance

                df = pd.concat(chunks, ignore_index=True)
                return df, None, sampled_for_performance

            df = _read_csv_with_encoding(BytesIO(raw), encoding=encoding)
            return df, None, sampled_for_performance
        except UnicodeDecodeError:
            continue
        except pd.errors.EmptyDataError:
            return pd.DataFrame(), None, sampled_for_performance
        except Exception as exc:  # pragma: no cover
            return None, f"Failed to read CSV: {exc}", sampled_for_performance

    return None, "Encoding error. Unable to decode CSV with utf-8 or latin-1.", sampled_for_performance
