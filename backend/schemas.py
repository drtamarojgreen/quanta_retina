from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    registration_token: str

class User(UserBase):
    id: int
    user_code: str
    created_at: datetime

    class Config:
        from_attributes = True

class RoomBase(BaseModel):
    name: str

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    message: str

class MessageCreate(MessageBase):
    room_id: int

class MessageUpdate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    room_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    author_name: Optional[str] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    user_code: str

class LoginResponse(BaseModel):
    user_id: int
    username: str
    token: str

class TokenData(BaseModel):
    user_id: int
