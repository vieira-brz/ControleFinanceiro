from sqlalchemy.orm import Session
from models import models
from schemas import schemas
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from datetime import datetime

# Categoria CRUD
def create_categoria(db: Session, categoria: schemas.CategoriaCreate):
    existing_categoria = db.query(models.Categoria).filter(models.Categoria.nome == categoria.nome).first()
    if existing_categoria:
        raise HTTPException(status_code=400, detail="Categoria já existe")
    db_categoria = models.Categoria(nome=categoria.nome, tipo=categoria.tipo)
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def update_categoria(db: Session, categoria_id: int, categoria: schemas.CategoriaUpdate):
    db_categoria = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    if categoria.nome:
        db_categoria.nome = categoria.nome
    if categoria.tipo:
        db_categoria.tipo = categoria.tipo
    db.commit()
    db.refresh(db_categoria)
    return db_categoria

def get_categorias(db: Session):
    return db.query(models.Categoria).all()

def delete_categoria(db: Session, categoria_id: int):
    db_categoria = db.query(models.Categoria).filter(models.Categoria.id == categoria_id).first()
    if not db_categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    db.delete(db_categoria)
    db.commit()

# Transacao CRUD
def create_transacao(db: Session, transacao: schemas.TransacaoCreate):
    if not transacao.data_hora:
        transacao.data_hora = datetime.utcnow()

    categoria = db.query(models.Categoria).filter(models.Categoria.id == transacao.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=400, detail="Categoria não encontrada.")

    db_transacao = models.Transacao(**transacao.dict())
    db.add(db_transacao)
    db.commit()
    db.refresh(db_transacao)  # Isso garante que o campo `id` seja preenchido
    return db_transacao  # Certifique-se de que db_transacao contém o `id`

def update_transacao(db: Session, transacao_id: int, transacao: schemas.TransacaoUpdate):
    db_transacao = db.query(models.Transacao).filter(models.Transacao.id == transacao_id).first()
    if not db_transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    for var, value in vars(transacao).items():
        if value is not None:
            setattr(db_transacao, var, value)
    
    if transacao.encerrada is not None:
        db_transacao.encerrada = transacao.encerrada
    
    db.commit()
    db.refresh(db_transacao)
    return db_transacao

def get_transacoes(db: Session):
    return db.query(models.Transacao).all()

def delete_transacao(db: Session, transacao_id: int):
    db_transacao = db.query(models.Transacao).filter(models.Transacao.id == transacao_id).first()
    if not db_transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    db.delete(db_transacao)
    db.commit()

# Parcela CRUD
def create_parcela(db: Session, parcela: schemas.ParcelaCreate):
    transacao = db.query(models.Transacao).filter(models.Transacao.id == parcela.transacao_id).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    if transacao.parcelas <= 1:
        raise HTTPException(status_code=400, detail="Transação não está parcelada")

    valor_parcela = transacao.valor / transacao.parcelas
    db_parcela = models.Parcela(
        transacao_id=parcela.transacao_id,
        data_parcela=parcela.data_parcela,
        valor_parcela=valor_parcela,
        encerrada=parcela.encerrada
    )
    db.add(db_parcela)
    db.commit()
    db.refresh(db_parcela)
    return db_parcela

def update_parcela(db: Session, parcela_id: int, parcela: schemas.ParcelaUpdate):
    db_parcela = db.query(models.Parcela).filter(models.Parcela.id == parcela_id).first()
    if not db_parcela:
        raise HTTPException(status_code=404, detail="Parcela não encontrada")
    
    if parcela.transacao_id is not None:
        db_parcela.transacao_id = parcela.transacao_id
    if parcela.data_parcela is not None:
        db_parcela.data_parcela = parcela.data_parcela
    if parcela.valor_parcela is not None:
        db_parcela.valor_parcela = parcela.valor_parcela
    
    if parcela.encerrada is not None:
        db_parcela.encerrada = parcela.encerrada
    
    db.commit()
    db.refresh(db_parcela)
    return db_parcela

def get_parcelas(db: Session):
    return db.query(models.Parcela).all()

def delete_parcela(db: Session, parcela_id: int):
    db_parcela = db.query(models.Parcela).filter(models.Parcela.id == parcela_id).first()
    if not db_parcela:
        raise HTTPException(status_code=404, detail="Parcela não encontrada")
    db.delete(db_parcela)
    db.commit()
