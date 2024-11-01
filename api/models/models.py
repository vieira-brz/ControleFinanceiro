from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime, Boolean
from datetime import datetime
from database import Base

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)

class Fatura(Base):
    __tablename__ = "faturas"
    id = Column(Integer, primary_key=True, index=True)
    mes = Column(Integer, nullable=False)
    ano = Column(Integer, nullable=False)
    total = Column(DECIMAL(10, 2), default=0)

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
    fatura_id = Column(Integer, ForeignKey("faturas.id"))
    fixa = Column(Boolean, default=False)  # Indica se a transação é fixa
    encerrada = Column(Boolean, default=False)  # Indica se a transação foi encerrada

class Parcela(Base):
    __tablename__ = "parcelas"
    id = Column(Integer, primary_key=True, index=True)
    transacao_id = Column(Integer, ForeignKey("transacoes.id"))
    data_parcela = Column(DateTime)
    valor_parcela = Column(DECIMAL(10, 2), nullable=False)
    fatura_id = Column(Integer, ForeignKey("faturas.id"))
    encerrada = Column(Boolean, default=False)  # Indica se a parcela foi encerrada
