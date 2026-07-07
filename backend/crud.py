from sqlalchemy.orm import Session, joinedload
from . import models, schemas
import uuid

def get_user_by_code(db: Session, user_code: str):
    return db.query(models.User).filter(models.User.user_code == user_code).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, username: str):
    user_code = f"TJG-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
    db_user = models.User(username=username, user_code=user_code)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_rooms(db: Session):
    return db.query(models.Room).all()

def create_room(db: Session, name: str):
    db_room = models.Room(name=name)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def get_messages(db: Session, room_id: int, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(models.Message).options(joinedload(models.Message.author)).filter(models.Message.room_id == room_id)
    if search:
        query = query.filter(models.Message.message.contains(search))
    messages = query.order_by(models.Message.created_at.asc()).offset(skip).limit(limit).all()
    # Attach author name for the frontend
    for msg in messages:
        msg.author_name = msg.author.username
    return messages

def create_message(db: Session, message: schemas.MessageCreate, user_id: int):
    db_message = models.Message(**message.model_dump(), user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db_message.author_name = db_message.author.username
    return db_message

def update_message(db: Session, message_id: int, message_update: schemas.MessageUpdate, user_id: int):
    db_message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if db_message:
        db_message.message = message_update.message
        db.commit()
        db.refresh(db_message)
        db_message.author_name = db_message.author.username
    return db_message

def delete_message(db: Session, message_id: int, user_id: int):
    db_message = db.query(models.Message).filter(models.Message.id == message_id, models.Message.user_id == user_id).first()
    if db_message:
        db.delete(db_message)
        db.commit()
        return True
    return False
