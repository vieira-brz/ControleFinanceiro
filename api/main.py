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

# Função para adicionar cabeçalhos CORS
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"  # Permite todas as origens
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"  # Métodos permitidos
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"  # Cabeçalhos permitidos
    return response

# Configuração de CORS
origins = [
    "https://whitex-financeiro-web.vercel.app",  # Adicione aqui seu domínio frontend
    "http://localhost:3000",  # Adicione aqui seu domínio local, se necessário
]

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
    response = { "data": "Working..." }
    return add_cors_headers(response)

# Rotas para Categoria
@app.post("/categorias/", response_model=schemas.Categoria)
def create_categoria(categoria: schemas.CategoriaCreate, db: Session = Depends(get_db)):
    response = crud.create_categoria(db=db, categoria=categoria)
    return add_cors_headers(response)

@app.get("/categorias/", response_model=List[schemas.Categoria])
def read_categorias(db: Session = Depends(get_db)):
    response = crud.get_categorias(db)
    return add_cors_headers(response)

@app.put("/categorias/{categoria_id}", response_model=schemas.Categoria)
def update_categoria(categoria_id: int, categoria: schemas.CategoriaUpdate, db: Session = Depends(get_db)):
    response = crud.update_categoria(db=db, categoria_id=categoria_id, categoria=categoria)
    return add_cors_headers(response)

@app.delete("/categorias/{categoria_id}")
def delete_categoria(categoria_id: int, db: Session = Depends(get_db)):
    crud.delete_categoria(db, categoria_id=categoria_id)
    response = {"message": "Categoria deletada com sucesso"}
    return add_cors_headers(response)

# Rotas para Transacao
@app.post("/transacoes/", response_model=schemas.Transacao)
def create_transacao(transacao: schemas.TransacaoCreate, db: Session = Depends(get_db)):
    response = crud.create_transacao(db=db, transacao=transacao)
    return add_cors_headers(response)

@app.get("/transacoes/", response_model=List[schemas.Transacao])
def read_transacoes(db: Session = Depends(get_db)):
    response = crud.get_transacoes(db)
    return add_cors_headers(response)

@app.put("/transacoes/{transacao_id}", response_model=schemas.Transacao)
def update_transacao(transacao_id: int, transacao: schemas.TransacaoUpdate, db: Session = Depends(get_db)):
    response = crud.update_transacao(db=db, transacao_id=transacao_id, transacao=transacao)
    return add_cors_headers(response)

@app.delete("/transacoes/{transacao_id}")
def delete_transacao(transacao_id: int, db: Session = Depends(get_db)):
    crud.delete_transacao(db, transacao_id=transacao_id)
    response = {"message": "Transação deletada com sucesso"}
    return add_cors_headers(response)

# Rotas para Fatura
@app.post("/faturas/", response_model=schemas.Fatura)
def create_fatura(fatura: schemas.FaturaCreate, db: Session = Depends(get_db)):
    response = crud.create_fatura(db=db, fatura=fatura)
    return add_cors_headers(response)

@app.get("/faturas/", response_model=List[schemas.Fatura])
def read_faturas(db: Session = Depends(get_db)):
    response = crud.get_faturas(db)
    return add_cors_headers(response)

@app.put("/faturas/{fatura_id}", response_model=schemas.Fatura)
def update_fatura(fatura_id: int, fatura: schemas.FaturaUpdate, db: Session = Depends(get_db)):
    response = crud.update_fatura(db=db, fatura_id=fatura_id, fatura=fatura)
    return add_cors_headers(response)

@app.delete("/faturas/{fatura_id}")
def delete_fatura(fatura_id: int, db: Session = Depends(get_db)):
    crud.delete_fatura(db, fatura_id=fatura_id)
    response = {"message": "Fatura deletada com sucesso"}
    return add_cors_headers(response)

# Rotas para Parcela
@app.post("/parcelas/", response_model=schemas.Parcela)
def create_parcela(parcela: schemas.ParcelaCreate, db: Session = Depends(get_db)):
    response = crud.create_parcela(db=db, parcela=parcela)
    return add_cors_headers(response)

@app.get("/parcelas/", response_model=List[schemas.Parcela])
def read_parcelas(db: Session = Depends(get_db)):
    response = crud.get_parcelas(db)
    return add_cors_headers(response)

@app.put("/parcelas/{parcela_id}", response_model=schemas.Parcela)
def update_parcela(parcela_id: int, parcela: schemas.ParcelaUpdate, db: Session = Depends(get_db)):
    response = crud.update_parcela(db=db, parcela_id=parcela_id, parcela=parcela)
    return add_cors_headers(response)

@app.delete("/parcelas/{parcela_id}")
def delete_parcela(parcela_id: int, db: Session = Depends(get_db)):
    crud.delete_parcela(db, parcela_id=parcela_id)
    response = {"message": "Parcela deletada com sucesso"}
    return add_cors_headers(response)