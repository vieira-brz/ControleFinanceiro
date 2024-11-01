from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Categoria Schemas
class CategoriaBase(BaseModel):
    nome: str
    tipo: str

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None

class Categoria(CategoriaBase):
    id: int

    class Config:
        orm_mode = True


# Fatura Schemas
class FaturaBase(BaseModel):
    mes: int
    ano: int
    total: float = 0.0

class FaturaCreate(FaturaBase):
    pass

class FaturaUpdate(BaseModel):
    mes: Optional[int] = None
    ano: Optional[int] = None
    total: Optional[float] = None

class Fatura(FaturaBase):
    id: int

    class Config:
        orm_mode = True


# Transacao Schemas
class TransacaoBase(BaseModel):
    tipo: str
    valor: float
    data_hora: datetime
    remetente: Optional[str] = None
    destinatario: Optional[str] = None
    descricao: Optional[str] = None
    categoria_id: int
    parcelas: int = 1
    parcela_atual: int = 1
    fatura_id: Optional[int] = None
    fixa: bool = False
    encerrada: bool = False

class TransacaoCreate(TransacaoBase):
    pass

class TransacaoUpdate(BaseModel):
    tipo: Optional[str] = None
    valor: Optional[float] = None
    data_hora: Optional[datetime] = None
    remetente: Optional[str] = None
    destinatario: Optional[str] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    parcelas: Optional[int] = None
    parcela_atual: Optional[int] = None
    fatura_id: Optional[int] = None
    fixa: Optional[bool] = None
    encerrada: Optional[bool] = None

class Transacao(TransacaoBase):
    id: int

    class Config:
        orm_mode = True


# Parcela Schemas
class ParcelaBase(BaseModel):
    transacao_id: int
    data_parcela: datetime
    valor_parcela: float
    fatura_id: int
    encerrada: bool = False

class ParcelaCreate(ParcelaBase):
    pass

class ParcelaUpdate(BaseModel):
    transacao_id: Optional[int] = None
    data_parcela: Optional[datetime] = None
    valor_parcela: Optional[float] = None
    fatura_id: Optional[int] = None
    encerrada: Optional[bool] = None

class Parcela(ParcelaBase):
    id: int

    class Config:
        orm_mode = True
