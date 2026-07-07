from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PrismQuanta Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGISTRATION_TOKEN = "tjg_web_services"

# In a real app, this would use JWT and secret keys
# For MVP, we use the user_id as a simple token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        user_id = int(token.replace("token-", ""))
        user = crud.get_user(db, user_id=user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token format")

@app.post("/api/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_code(db, user_code=request.user_code)
    if not user:
        raise HTTPException(status_code=404, detail="User code not found")
    return {
        "user_id": user.id,
        "username": user.username,
        "token": f"token-{user.id}"
    }

@app.get("/api/rooms", response_model=List[schemas.Room])
def read_rooms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_rooms(db)

@app.get("/api/messages", response_model=List[schemas.Message])
def read_messages(room_id: int, search: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_messages(db, room_id=room_id, search=search)

@app.post("/api/messages", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_message(db, message=message, user_id=current_user.id)

@app.put("/api/messages/{message_id}", response_model=schemas.Message)
def update_message(message_id: int, message_update: schemas.MessageUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_message = crud.update_message(db, message_id=message_id, message_update=message_update, user_id=current_user.id)
    if not db_message:
        raise HTTPException(status_code=403, detail="Not authorized to edit this message or message not found")
    return db_message

@app.delete("/api/messages/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    success = crud.delete_message(db, message_id=message_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message or message not found")
    return {"detail": "Message deleted"}

@app.post("/api/users", response_model=schemas.User)
def create_user(user_create: schemas.UserCreate, db: Session = Depends(get_db)):
    if user_create.registration_token != REGISTRATION_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid registration token")
    return crud.create_user(db, username=user_create.username)
