from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routes import auth, ai, bets, bankroll, users, strategies, notifications, integrations, analytics, strategy_optimization, reports, subscriptions, webhooks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Roleta Pro I.A. API",
    description="API para o projeto Roleta Pro I.A., incluindo funcionalidades de autenticação, IA e gestão de banca.",
    version="1.0.0",
)

# Configuração do CORS
origins = [
    "http://localhost:5173",  # Frontend local
    "http://localhost:3000",  # Outro possível frontend local
    # Adicionar aqui os domínios de produção do frontend (Netlify, Vercel, etc.)
    "https://roletaproai.netlify.app",
    "https://www.roletaproai.netlify.app",
    "https://3001-isvmt4wptiq2611qlgc1w-ccfb79cc.manusvm.computer",
    "https://3007-isvmt4wptiq2611qlgc1w-ccfb79cc.manusvm.computer",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(bets.router, prefix="/api")
app.include_router(bankroll.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(strategies.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(strategy_optimization.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(webhooks.router, prefix="/webhooks") # Webhooks geralmente têm um prefixo separado

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}

