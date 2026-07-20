"""Bot Discord Fase 1: slash command /analisa KODE dan /watchlist.

Token WAJIB dari environment variable DISCORD_BOT_TOKEN (lihat .env.example)
— jangan pernah di-hardcode. Bot hanya MEMBACA cache SQLite (storage/db.py),
tidak pernah menghitung ulang analisis per-request (itu tugas scheduler).
"""

import logging
import os

import discord
from discord import app_commands
from dotenv import load_dotenv

from bot.formatter import format_analisa, format_watchlist
from config import WATCHLIST
from storage.db import get_all_latest, get_connection, get_latest_result

logger = logging.getLogger(__name__)

MAX_EMBED_FIELD_LEN = 1024
MAX_DISCORD_MESSAGE_LEN = 1900  # sisakan buffer dari limit 2000


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 20] + "\n… (dipotong)"


def build_embed(formatted: dict) -> discord.Embed:
    embed = discord.Embed(title=formatted["title"], description=_truncate(formatted["deskripsi"], 4096))
    for name, value in formatted["fields"]:
        embed.add_field(name=name, value=_truncate(value, MAX_EMBED_FIELD_LEN), inline=False)
    embed.set_footer(text=formatted["footer"])
    return embed


def create_bot(start_scheduler_on_ready: bool = False) -> discord.Client:
    intents = discord.Intents.default()
    client = discord.Client(intents=intents)
    tree = app_commands.CommandTree(client)

    @client.event
    async def on_ready():
        await tree.sync()
        if start_scheduler_on_ready:
            from scheduler.daily_update import start_scheduler

            start_scheduler()
        logger.info("Bot Discord siap login sebagai %s", client.user)

    @tree.command(name="analisa", description="Analisa teknikal + fundamental satu saham IDX dari watchlist")
    @app_commands.describe(kode="Kode saham IDX, mis. BBCA")
    async def analisa(interaction: discord.Interaction, kode: str):
        kode = kode.strip().upper()
        conn = get_connection()
        try:
            cached = get_latest_result(conn, kode)
        finally:
            conn.close()

        if cached is None:
            await interaction.response.send_message(
                f"❌ Belum ada data ter-cache untuk **{kode}**. "
                f"Pastikan kode ada di watchlist dan scheduler harian sudah pernah jalan.",
                ephemeral=True,
            )
            return

        formatted = format_analisa(cached["payload"])
        embed = build_embed(formatted)
        await interaction.response.send_message(embed=embed)

    @tree.command(name="watchlist", description="Ringkasan semua saham di watchlist berikut sinyalnya")
    async def watchlist(interaction: discord.Interaction):
        conn = get_connection()
        try:
            rows = get_all_latest(conn)
        finally:
            conn.close()

        text = format_watchlist(rows)
        await interaction.response.send_message(_truncate(text, MAX_DISCORD_MESSAGE_LEN))

    client.tree = tree
    return client


def run_bot(start_scheduler_on_ready: bool = True):
    load_dotenv()
    token = os.environ.get("DISCORD_BOT_TOKEN")
    if not token:
        raise RuntimeError(
            "DISCORD_BOT_TOKEN belum diset. Salin .env.example ke .env dan isi token bot Discord Anda."
        )
    logging.basicConfig(level=logging.INFO)
    logger.info("Watchlist aktif (%d saham): %s", len(WATCHLIST), ", ".join(WATCHLIST))
    client = create_bot(start_scheduler_on_ready=start_scheduler_on_ready)
    client.run(token)
