from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. USER TABLE (Updated for Email Verification & Roles)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True) 
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") 
    is_verified = Column(Boolean, default=False) 
    reset_token = Column(String, nullable=True) 

    # Relationship
    chats = relationship("ChatHistory", back_populates="owner")
    lesson_sessions = relationship("LessonSession", back_populates="owner")

# 2. CHAT HISTORY TABLE 
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    chat_id = Column(String, index=True, nullable=True)
    user_message = Column(String)
    bot_response = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship
    owner = relationship("User", back_populates="chats")


#  3. ADAPTIVE LESSON SESSIONS (level completions + pathway data)
class LessonSession(Base):
    __tablename__ = "lesson_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    topic = Column(String, index=True)
    level = Column(Integer)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    points = Column(Integer, default=0)
    dominant_pathway = Column(String, default="on-track")
    avg_response_ms = Column(Integer, default=0)
    bonus_questions_used = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    owner = relationship("User", back_populates="lesson_sessions")
    questions = relationship(
        "LessonQuestionLog",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class LessonQuestionLog(Base):
    __tablename__ = "lesson_question_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("lesson_sessions.id"), index=True)
    q_idx = Column(Integer, default=0)
    is_correct = Column(Boolean, default=True)
    response_ms = Column(Integer, default=0)
    attempts = Column(Integer, default=1)
    wrong_attempts = Column(Integer, default=0)
    pathway = Column(String, default="on-track")
    is_bonus = Column(Boolean, default=False)

    session = relationship("LessonSession", back_populates="questions")
