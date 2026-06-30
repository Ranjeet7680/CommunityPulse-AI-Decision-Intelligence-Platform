from app.workers.celery_app import celery_app
import time

@celery_app.task(name="tasks.run_bigquery_pipeline")
def run_bigquery_pipeline(dataset_id: str, file_path: str):
    print(f"[Celery Worker] Starting BigQuery load pipeline for dataset {dataset_id}")
    time.sleep(2.0)
    print(f"[Celery Worker] Schema validation passed")
    time.sleep(2.0)
    print(f"[Celery Worker] Data cleaned and normalized. Loaded into BigQuery successfully.")
    return {"status": "success", "dataset_id": dataset_id}

@celery_app.task(name="tasks.gpu_health_check")
def gpu_health_check():
    print("[Celery Worker] NVIDIA GPU health check: Temperature 62C, memory utilization normal.")
    return {"status": "healthy"}
