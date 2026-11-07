from pydantic import BaseModel, ConfigDict

class FanpageBase(BaseModel):
    name: str
    page_id: str
    quota: int = 0
    active: bool = True

class FanpageCreate(FanpageBase):
    pass

class Fanpage(FanpageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
