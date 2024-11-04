from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models import models
from schemas import schemas
from routes import crud
from database import engine, get_db
from dotenv import load_dotenv
from typing import List

load_dotenv()  # Carrega as variáveis de ambiente do arquivo .env

# Cria as tabelas no banco de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens. Substitua "*" por uma lista de domínios específicos para maior segurança
    allow_credentials=True,
    allow_methods=["*"],   # Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],   # Permite todos os headers
)

# Teste de funcionamento da API
@app.get('/')
def log_working():
    return { "data": "Working..." }

# Rotas para Categoria
@app.post("/categorias/", response_model=schemas.Categoria)
def create_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    return crud.create_categoria(db=db, categoria=categoria)

@app.get("/categorias/", response_model=List[schemas.Categoria])
def read_categorias(db: Session = Depends(get_db)):
    return crud.get_categorias(db)

@app.put("/categorias/{categoria_id}", response_model=schemas.Categoria)
def update_categoria(categoria_id: int, categoria: schemas.CategoriaUpdate, db: Session = Depends(get_db)):
    return crud.update_categoria(db=db, categoria_id=categoria_id, categoria=categoria)

@app.delete("/categorias/{categoria_id}")
def delete_categoria(categoria_id: int, db: Session = Depends(get_db)):
    crud.delete_categoria(db, categoria_id=categoria_id)
    return {"message": "Categoria deletada com sucesso"}

# Rotas para Transacao
@app.post("/transacoes/", response_model=schemas.Transacao)
def create_transacao(transacao: schemas.TransacaoCreate, db: Session = Depends(get_db)):
    return crud.create_transacao(db=db, transacao=transacao)

@app.get("/transacoes/", response_model=List[schemas.Transacao])
def read_transacoes(db: Session = Depends(get_db)):
    try:
        return crud.get_transacoes(db)
    except Exception as e:
        return []
    
@app.get("/transacoes/{transacao_id}", response_model=schemas.Transacao)
def get_transacao_id(transacao_id: int, db: Session = Depends(get_db)):
    try:
        return crud.get_transacoes(db, transacao_id)
    except Exception as e:
        return []

@app.put("/transacoes/{transacao_id}", response_model=schemas.Transacao)
def update_transacao(transacao_id: int, transacao: schemas.TransacaoUpdate, db: Session = Depends(get_db)):
    return crud.update_transacao(db=db, transacao_id=transacao_id, transacao=transacao)

@app.delete("/transacoes/{transacao_id}")
def delete_transacao(transacao_id: int, db: Session = Depends(get_db)):
    crud.delete_transacao(db, transacao_id=transacao_id)
    return {"message": "Transação deletada com sucesso"}