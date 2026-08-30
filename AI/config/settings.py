"""
Application configuration.
All paths are derived dynamically using pathlib.
"""

from pathlib import Path
import os

from dotenv import load_dotenv


# finance/
BASE_DIR = Path(__file__).resolve().parent.parent

# finance/data/
DATA_DIR = BASE_DIR / "data"

# finance/data/datasets/
DATASET_DIR = DATA_DIR / "datasets"

# LLM prompt directory
PROMPTS_DIR = BASE_DIR / "llm" / "prompts"

# Load .env
load_dotenv(BASE_DIR / ".env")


LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-20b")
LLM_ENABLED = os.getenv("LLM_ENABLED", "true").lower() == "true"
LLM_MAX_COMPLETION_TOKENS = int(
    os.getenv("LLM_MAX_COMPLETION_TOKENS", "4000")
)

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
