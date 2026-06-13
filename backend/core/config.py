import os
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chrononutrition.db")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()
