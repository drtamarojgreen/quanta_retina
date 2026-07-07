from backend.database import SessionLocal, engine
from backend import models

def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    rooms = ["General", "Blueprint Projects", "Development"]

    for room_name in rooms:
        if not db.query(models.Room).filter(models.Room.name == room_name).first():
            db.add(models.Room(name=room_name))

    # Create a demo user
    if not db.query(models.User).filter(models.User.username == "Tamaro").first():
        db.add(models.User(username="Tamaro", user_code="TJG-8F42-A91C"))

    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
