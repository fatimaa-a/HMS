"""add department_id to doctors

Revision ID: c204996ab3ff
Revises: 3fbdb4beaab6
Create Date: 2026-09-02 16:30:20.965045

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c204996ab3ff'
down_revision: Union[str, Sequence[str], None] = '3fbdb4beaab6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'doctors',
        sa.Column('department_id', sa.Integer(), nullable=False)
    )

    op.create_foreign_key(
        'doctors_department_id_fkey',
        'doctors',
        'departments',
        ['department_id'],
        ['id']
    )


def downgrade() -> None:
    op.drop_constraint(
        'doctors_department_id_fkey',
        'doctors',
        type_='foreignkey'
    )

    op.drop_column('doctors', 'department_id')