"""oauth accounts

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-08-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'oauth_accounts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=20), nullable=False),
        sa.Column('provider_account_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider', 'provider_account_id', name='uq_oauth_provider_account'),
    )
    op.create_index('ix_oauth_accounts_id', 'oauth_accounts', ['id'], unique=False)
    op.create_index('ix_oauth_accounts_user_id', 'oauth_accounts', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_oauth_accounts_user_id', table_name='oauth_accounts')
    op.drop_index('ix_oauth_accounts_id', table_name='oauth_accounts')
    op.drop_table('oauth_accounts')