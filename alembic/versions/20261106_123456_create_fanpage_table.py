'''create fanpage table

Revision ID: 20261106_123456
Revises: 
Create Date: 2026-11-06 22:28:00
'''

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20261106_123456"
 down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "fanpages",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("page_id", sa.String, unique=True, nullable=False),
        sa.Column("quota", sa.Integer, default=0),
        sa.Column("active", sa.Boolean, default=True),
    )

def downgrade():
    op.drop_table("fanpages")
