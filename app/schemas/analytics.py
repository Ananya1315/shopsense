from pydantic import BaseModel
from typing import List


class VendorInventoryValueResponse(BaseModel):
    vendor_name: str
    inventory_value: float