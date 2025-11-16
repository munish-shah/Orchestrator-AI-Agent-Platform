"""Tool model for database storage"""
from sqlalchemy import Column, String, Boolean, JSON
from models.database import Base


class Tool(Base):
    """
    Tool configuration stored in database.
    Allows enable/disable functionality for frontend.
    """
    __tablename__ = "tools"
    
    id = Column(String, primary_key=True)  # Same as tool.name
    name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    schema = Column(JSON, nullable=False)  # Full OpenAI function calling schema
    enabled = Column(Boolean, default=True)
    icon = Column(String, nullable=True)  # Icon name for frontend
    
    def to_dict(self):
        """Convert to dict for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "schema": self.schema,
            "enabled": self.enabled,
            "icon": self.icon
        }

