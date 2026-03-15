import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import Column, DateTime, func, JSON
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    
    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=func.now(), 
            onupdate=func.now()
        )
    )

    crews: list["CrewProject"] = Relationship(back_populates="user")
    credentials: list["Credential"] = Relationship(back_populates="user")

class CrewProject(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    canvas_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="crews")

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=func.now(), 
            onupdate=func.now()
        )
    )

class Credential(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    key: str
    provider: Optional[str] = None
    
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="credentials")

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), 
            server_default=func.now(), 
            onupdate=func.now()
        )
    )
