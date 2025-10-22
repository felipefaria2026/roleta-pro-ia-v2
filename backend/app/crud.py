from sqlalchemy.orm import Session
import json

from . import models, schemas
from .security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_bets_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Bet).filter(models.Bet.owner_id == user_id).offset(skip).limit(limit).all()

def create_user_bet(db: Session, bet: schemas.BetCreate, user_id: int):
    db_bet = models.Bet(**bet.dict(), owner_id=user_id)
    db.add(db_bet)
    db.commit()
    db.refresh(db_bet)
    return db_bet

def get_risk_config_by_user(db: Session, user_id: int):
    return db.query(models.RiskConfig).filter(models.RiskConfig.user_id == user_id).first()

def create_or_update_risk_config(db: Session, risk_config: schemas.RiskConfigCreate, user_id: int):
    db_risk_config = db.query(models.RiskConfig).filter(models.RiskConfig.user_id == user_id).first()
    if db_risk_config:
        for key, value in risk_config.dict(exclude_unset=True).items():
            setattr(db_risk_config, key, value)
    else:
        db_risk_config = models.RiskConfig(**risk_config.dict(), user_id=user_id)
    db.add(db_risk_config)
    db.commit()
    db.refresh(db_risk_config)
    return db_risk_config

def get_strategies_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Strategy).filter(models.Strategy.owner_id == user_id).offset(skip).limit(limit).all()

def get_strategy(db: Session, strategy_id: int, user_id: int):
    return db.query(models.Strategy).filter(models.Strategy.id == strategy_id, models.Strategy.owner_id == user_id).first()

def create_user_strategy(db: Session, strategy: schemas.StrategyCreate, user_id: int):
    db_strategy = models.Strategy(**strategy.dict(), owner_id=user_id)
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

def update_strategy(db: Session, strategy_id: int, user_id: int, strategy_update: schemas.StrategyCreate):
    db_strategy = db.query(models.Strategy).filter(models.Strategy.id == strategy_id, models.Strategy.owner_id == user_id).first()
    if db_strategy:
        for key, value in strategy_update.dict(exclude_unset=True).items():
            setattr(db_strategy, key, value)
        db.commit()
        db.refresh(db_strategy)
    return db_strategy

def delete_strategy(db: Session, strategy_id: int, user_id: int):
    db_strategy = db.query(models.Strategy).filter(models.Strategy.id == strategy_id, models.Strategy.owner_id == user_id).first()
    if db_strategy:
        db.delete(db_strategy)
        db.commit()
        return True
    return False

def toggle_strategy_active_status(db: Session, strategy_id: int, user_id: int):
    db_strategy = db.query(models.Strategy).filter(models.Strategy.id == strategy_id, models.Strategy.owner_id == user_id).first()
    if db_strategy:
        db_strategy.is_active = not db_strategy.is_active
        db.commit()
        db.refresh(db_strategy)
    return db_strategy



def get_chat_history_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).order_by(models.ChatHistory.timestamp).offset(skip).limit(limit).all()

def create_chat_message(db: Session, message: schemas.ChatHistoryCreate, user_id: int):
    db_message = models.ChatHistory(**message.dict(), user_id=user_id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message




def create_notification(db: Session, notification: schemas.NotificationCreate, user_id: int):
    db_notification = models.Notification(**notification.dict(), user_id=user_id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).order_by(models.Notification.timestamp.desc()).offset(skip).limit(limit).all()

def mark_notification_as_read(db: Session, notification_id: int, user_id: int):
    db_notification = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == user_id).first()
    if db_notification:
        db_notification.is_read = True
        db.commit()
        db.refresh(db_notification)
    return db_notification




def create_strategy_optimization_result(db: Session, result: schemas.StrategyOptimizationResultCreate, user_id: int):
    db_result = models.StrategyOptimizationResult(
        **result.dict(exclude={'profit_loss_history', 'strategy_config'}),
        profit_loss_history=json.dumps(result.profit_loss_history),
        strategy_config=json.dumps(result.strategy_config),
        user_id=user_id
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_strategy_optimization_results_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.StrategyOptimizationResult).filter(models.StrategyOptimizationResult.user_id == user_id).order_by(models.StrategyOptimizationResult.timestamp.desc()).offset(skip).limit(limit).all()

