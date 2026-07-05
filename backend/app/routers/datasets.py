from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.models.schemas import DatasetUploadResponse, DatasetMetadata, BigQueryTableInfo, DataQualityReport
from app.core.dependencies import get_db_client, get_current_user, get_bq_client
from datetime import datetime
import uuid
import pandas as pd
import io

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user), 
    db = Depends(get_db_client)
):
    # Validate file type
    allowed_extensions = ('.csv', '.xlsx', '.json')
    if not file.filename.endswith(allowed_extensions):
        raise HTTPException(
            status_code=400, 
            detail=f"Only {', '.join(allowed_extensions)} files are supported"
        )
    
    # Validate file size (max 50MB)
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Validate file is not empty
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file provided")
        
    datasets = db.setdefault("datasets", {})
    dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
    
    # Parse and validate file content
    df = None
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), nrows=100)
        elif file.filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(content), nrows=100)
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(content))
            
        # Validate dataframe is not empty
        if df is None or df.empty:
            raise ValueError("File contains no data")
            
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to parse file: {str(e)}"
        )
        
    # Extract schema
    schema_fields = {}
    if df is not None:
        for col in df.columns:
            schema_fields[col] = str(df[col].dtype)
            
    # Save metadata in mock database
    datasets[dataset_id] = {
        "dataset_id": dataset_id,
        "name": file.filename,
        "org_id": current_user["org_id"],
        "row_count": len(df) if df is not None else 0,
        "column_count": len(df.columns) if df is not None else 0,
        "file_size_bytes": len(content),
        "schema_fields": schema_fields,
        "created_at": datetime.utcnow(),
        "status": "completed"
    }
    
    # Save file contents for preview/query endpoints
    db.setdefault("datasets_data", {})[dataset_id] = (
        df.to_dict(orient="records") if df is not None else []
    )
    
    return DatasetUploadResponse(
        dataset_id=dataset_id,
        filename=file.filename,
        status="completed",
        job_id=f"job_{uuid.uuid4().hex[:12]}"
    )

@router.get("/", response_model=list[DatasetMetadata])
async def list_datasets(current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    user_datasets = []
    
    for ds_id, ds in datasets.items():
        if ds["org_id"] == current_user["org_id"]:
            user_datasets.append(DatasetMetadata(
                dataset_id=ds["dataset_id"],
                name=ds["name"],
                org_id=ds["org_id"],
                row_count=ds["row_count"],
                column_count=ds["column_count"],
                file_size_bytes=ds["file_size_bytes"],
                created_at=ds["created_at"] if isinstance(ds["created_at"], datetime) else datetime.utcnow(),
                schema_fields=ds["schema_fields"]
            ))
    return user_datasets

@router.get("/{dataset_id}", response_model=DatasetMetadata)
async def get_dataset(dataset_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    ds = datasets.get(dataset_id)
    if not ds or ds["org_id"] != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    return DatasetMetadata(
        dataset_id=ds["dataset_id"],
        name=ds["name"],
        org_id=ds["org_id"],
        row_count=ds["row_count"],
        column_count=ds["column_count"],
        file_size_bytes=ds["file_size_bytes"],
        created_at=ds["created_at"] if isinstance(ds["created_at"], datetime) else datetime.utcnow(),
        schema_fields=ds["schema_fields"]
    )

@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    ds = datasets.get(dataset_id)
    if not ds or ds["org_id"] != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    del datasets[dataset_id]
    
    datasets_data = db.setdefault("datasets_data", {})
    if dataset_id in datasets_data:
        del datasets_data[dataset_id]
        
    return {"message": "Dataset successfully deleted"}

@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    ds = datasets.get(dataset_id)
    if not ds or ds["org_id"] != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    data = db.setdefault("datasets_data", {}).get(dataset_id, [])
    return data[:100]

@router.post("/{dataset_id}/validate", response_model=DataQualityReport)
async def validate_dataset(dataset_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db_client)):
    datasets = db.setdefault("datasets", {})
    ds = datasets.get(dataset_id)
    if not ds or ds["org_id"] != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Simulate a data quality check
    fields = ds["schema_fields"]
    null_counts = {f: 0 for f in fields.keys()}
    
    return DataQualityReport(
        dataset_id=dataset_id,
        completeness_score=1.0,
        duplicate_rows=0,
        null_value_counts=null_counts,
        status="passed"
    )
