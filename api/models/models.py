from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime, Boolean
from datetime import datetime
from database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)

class Transacao(Base):
    __tablename__ = "transacoes"
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    valor = Column(DECIMAL(10, 2), nullable=False)
    data_hora = Column(DateTime, default=datetime.utcnow)
    remetente = Column(String)
    destinatario = Column(String)
    descricao = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    parcelas = Column(Integer, default=1)
    parcela_atual = Column(Integer, default=1)
    fixa = Column(Boolean, default=False)  
    encerrada = Column(Boolean, default=False)  
