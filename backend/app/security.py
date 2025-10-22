from datetime import datetime, timedelta
from typing import Optional
import os

from jose import JWTError, jwt
from passlib.context import CryptContext

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import models, crud, schemas
from .database import get_db


SECRET_KEY = "super-secret-key" # Substituir por uma variável de ambiente em produção
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    
    # Carregar a assinatura ativa do usuário
    user.active_subscription = crud.subscription.get_user_active_subscription(db, user_id=user.id)
    
    # Adicionar atributo is_admin temporário para testes, conforme mencionado nas rotas de assinatura
    # Em um ambiente de produção, isso seria gerenciado por um sistema de permissões mais robusto
    user.is_admin = (user.email == "admin@example.com") # Exemplo simples de admin

    return user


def authenticate_user(db: Session, email: str, password: str):
    user = crud.get_user_by_email(db, email=email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user



from cryptography.fernet import Fernet

# Gerar uma chave para Fernet (manter em segredo e carregar de variável de ambiente em produção)
# key = Fernet.generate_key() # Gerar uma vez e armazenar com segurança
# Para fins de demonstração, usaremos uma chave fixa. Em produção, isso deve ser carregado de variáveis de ambiente.
FERNET_KEY = os.getenv("FERNET_KEY", "dASKLevf9RH2EbAsxLbTMe-8wLkQBLzkldc8y4gw4ro=")
fernet = Fernet(FERNET_KEY)

def encrypt_data(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    return fernet.decrypt(encrypted_data.encode()).decode()

