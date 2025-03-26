import os

# Worker configuration
workers = int(os.environ.get('GUNICORN_WORKERS', '1'))
worker_class = 'uvicorn.workers.UvicornWorker'

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Binding
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Timeout
timeout = 120 