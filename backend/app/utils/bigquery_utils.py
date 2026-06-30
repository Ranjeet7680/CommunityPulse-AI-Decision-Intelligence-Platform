import pandas as pd
import re

def infer_bigquery_schema(df: pd.DataFrame) -> list:
    schema = []
    # Map pandas types to BigQuery standard types
    type_mapping = {
        "int64": "INTEGER",
        "float64": "FLOAT",
        "bool": "BOOLEAN",
        "datetime64[ns]": "TIMESTAMP",
        "object": "STRING"
    }
    
    for col in df.columns:
        col_type = str(df[col].dtype)
        bq_type = type_mapping.get(col_type, "STRING")
        schema.append({
            "name": sanitize_column_name(col),
            "type": bq_type,
            "mode": "NULLABLE"
        })
    return schema

def sanitize_column_name(name: str) -> str:
    # Lowercase, replace non-alphanumeric with underscores
    sanitized = name.strip().lower()
    sanitized = re.sub(r'[^a-z0-9_]', '_', sanitized)
    sanitized = re.sub(r'_+', '_', sanitized)
    if sanitized[0].isdigit():
        sanitized = f"col_{sanitized}"
    return sanitized
