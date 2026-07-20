import pytest

from bot.discord_bot import _truncate, build_embed, create_bot, run_bot
from bot.formatter import format_analisa


def test_truncate_short_text_unchanged():
    assert _truncate("halo", 100) == "halo"


def test_truncate_long_text_is_cut():
    text = "x" * 2000
    result = _truncate(text, 1024)
    assert len(result) <= 1024
    assert "dipotong" in result


def test_build_embed_from_unavailable_result():
    formatted = format_analisa({"ticker": "XXXX", "tersedia": False, "alasan": "kode tidak ditemukan"})
    embed = build_embed(formatted)
    assert embed.title == "📊 XXXX"
    assert "Data tidak tersedia" in embed.description
    assert len(embed.fields) == 0


def test_create_bot_registers_analisa_and_watchlist_commands():
    client = create_bot()
    command_names = {cmd.name for cmd in client.tree.get_commands()}
    assert "analisa" in command_names
    assert "watchlist" in command_names


def test_run_bot_raises_without_token(monkeypatch):
    monkeypatch.delenv("DISCORD_BOT_TOKEN", raising=False)
    monkeypatch.setattr("bot.discord_bot.load_dotenv", lambda: None)
    with pytest.raises(RuntimeError, match="DISCORD_BOT_TOKEN"):
        run_bot()
