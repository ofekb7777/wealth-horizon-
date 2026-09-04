#!/usr/bin/env python3
"""
מייצר את `src/data/tickers.ts` — קטלוג הסימולים הארוז.

**מריצים את זה ביד, לא בבנייה.** הפלט מקומט לגיט, ולכן `npm run build`
לא מבצע אף בקשת רשת — הכלל מ-CLAUDE.md §6 מלכודת #4 נשמר.

לרענון (פעם בשנה בערך, כשמדד S&P משתנה):
    python3 scripts/generate-tickers.py

מקורות (שניהם ציבוריים, בלי מפתח):
  * datasets/s-and-p-500-companies — הרכב המדד
  * rreichel3/US-Stock-Symbols     — סימולים ושווי שוק לפי בורסה

ETF-ים, קריפטו ומניות תל אביב לא מופיעים בשני המקורות האלה ולכן
מוגדרים כאן ידנית.
"""
import json
import urllib.request
import csv
import io
import re
import sys

SP500 = "https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv"
LISTS = {
    "nasdaq": ("https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_full_tickers.json", "NASDAQ"),
    "nyse": ("https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nyse/nyse_full_tickers.json", "NYSE"),
    "amex": ("https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/amex/amex_full_tickers.json", "NYSE American"),
}

# כל מניה בשווי שוק מעל זה נכנסת, גם אם היא לא במדד.
MIN_MARKET_CAP = 5_000_000_000

# סיומות משפטיות שלא מוסיפות מידע בחיפוש. הסדר חשוב — הארוכה קודם.
NOISE = [
    " Common Stock", " Common Shares", " Capital Stock", " Ordinary Shares",
    " American Depositary Shares", " American Depositary Share",
    " Depositary Shares", " Class A Ordinary Shares", " Ordinary Share",
    " Common Stock Class A", " Registered Shares", " New Common Stock",
    " Common Units", " Limited Partnership", " (The)",
]

TAIL = """
export interface TickerRow {
  symbol: string;
  name: string;
  exchange: string;
}

let parsed: TickerRow[] | null = null;

/** מפוענח בעצלתיים — פעם אחת, בחיפוש הראשון. */
export function tickerCatalog(): readonly TickerRow[] {
  if (!parsed) {
    parsed = RAW.split('\\n').map(line => {
      const [symbol, name, exchange] = line.split('|');
      return { symbol, name, exchange };
    });
  }
  return parsed;
}
"""


def fetch(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def clean_name(name: str) -> str:
    out = name.strip()
    changed = True
    while changed:
        changed = False
        for suffix in NOISE:
            if out.endswith(suffix):
                out = out[: -len(suffix)].strip()
                changed = True
    # ניסוח משפטי ארוך של ADR — חותכים אותו, הוא רק מפריע בחיפוש.
    out = re.split(r"\s+(?:American Depositary|each representing|representing )", out)[0].strip()
    # `|` הוא המפריד בקובץ הפלט, ולכן אסור שיופיע בתוך שדה.
    out = out.replace("|", " ")
    return re.sub(r"\s+", " ", out).strip(" ,")


def yahoo_symbol(symbol: str) -> str:
    """
    Yahoo מפריד מחלקות מניה במקף: BRK-B.
    ה-CSV של S&P משתמש בנקודה (BRK.B) והרשימות בלוכסן (BRK/A).
    """
    return symbol.strip().upper().replace("/", "-").replace(".", "-")


# --- ETF-ים. אין אותם באף אחד מהמקורות; זו רשימה ידנית של הנפוצים. ---
ETFS = [
    ("SPY", "SPDR S&P 500 ETF"), ("VOO", "Vanguard S&P 500 ETF"),
    ("IVV", "iShares Core S&P 500 ETF"), ("QQQ", "Invesco QQQ Trust"),
    ("QQQM", "Invesco NASDAQ 100 ETF"), ("VTI", "Vanguard Total Stock Market ETF"),
    ("VT", "Vanguard Total World Stock ETF"), ("VXUS", "Vanguard Total International Stock ETF"),
    ("VEA", "Vanguard FTSE Developed Markets ETF"), ("VWO", "Vanguard FTSE Emerging Markets ETF"),
    ("IEFA", "iShares Core MSCI EAFE ETF"), ("IEMG", "iShares Core MSCI Emerging Markets ETF"),
    ("EFA", "iShares MSCI EAFE ETF"), ("EEM", "iShares MSCI Emerging Markets ETF"),
    ("IWM", "iShares Russell 2000 ETF"), ("IWB", "iShares Russell 1000 ETF"),
    ("VUG", "Vanguard Growth ETF"), ("VTV", "Vanguard Value ETF"),
    ("VB", "Vanguard Small-Cap ETF"), ("VO", "Vanguard Mid-Cap ETF"),
    ("VYM", "Vanguard High Dividend Yield ETF"), ("VIG", "Vanguard Dividend Appreciation ETF"),
    ("SCHD", "Schwab US Dividend Equity ETF"), ("DVY", "iShares Select Dividend ETF"),
    ("DIA", "SPDR Dow Jones Industrial Average ETF"), ("MDY", "SPDR S&P MidCap 400 ETF"),
    ("RSP", "Invesco S&P 500 Equal Weight ETF"), ("SPLG", "SPDR Portfolio S&P 500 ETF"),
    ("ITOT", "iShares Core S&P Total US Stock Market ETF"),
    ("BND", "Vanguard Total Bond Market ETF"), ("BNDX", "Vanguard Total International Bond ETF"),
    ("AGG", "iShares Core US Aggregate Bond ETF"), ("TLT", "iShares 20+ Year Treasury Bond ETF"),
    ("IEF", "iShares 7-10 Year Treasury Bond ETF"), ("SHY", "iShares 1-3 Year Treasury Bond ETF"),
    ("BIL", "SPDR Bloomberg 1-3 Month T-Bill ETF"), ("SGOV", "iShares 0-3 Month Treasury Bond ETF"),
    ("LQD", "iShares Investment Grade Corporate Bond ETF"), ("HYG", "iShares High Yield Corporate Bond ETF"),
    ("TIP", "iShares TIPS Bond ETF"), ("MUB", "iShares National Muni Bond ETF"),
    ("GLD", "SPDR Gold Shares"), ("IAU", "iShares Gold Trust"),
    ("SLV", "iShares Silver Trust"), ("GDX", "VanEck Gold Miners ETF"),
    ("USO", "United States Oil Fund"), ("DBC", "Invesco DB Commodity Index Fund"),
    ("XLK", "Technology Select Sector SPDR"), ("XLF", "Financial Select Sector SPDR"),
    ("XLE", "Energy Select Sector SPDR"), ("XLV", "Health Care Select Sector SPDR"),
    ("XLY", "Consumer Discretionary Select Sector SPDR"), ("XLP", "Consumer Staples Select Sector SPDR"),
    ("XLI", "Industrial Select Sector SPDR"), ("XLU", "Utilities Select Sector SPDR"),
    ("XLB", "Materials Select Sector SPDR"), ("XLRE", "Real Estate Select Sector SPDR"),
    ("XLC", "Communication Services Select Sector SPDR"),
    ("SMH", "VanEck Semiconductor ETF"), ("SOXX", "iShares Semiconductor ETF"),
    ("VNQ", "Vanguard Real Estate ETF"), ("ARKK", "ARK Innovation ETF"),
    ("IBIT", "iShares Bitcoin Trust"), ("FBTC", "Fidelity Wise Origin Bitcoin Fund"),
    ("ETHA", "iShares Ethereum Trust"),
    ("EWJ", "iShares MSCI Japan ETF"), ("EWG", "iShares MSCI Germany ETF"),
    ("EWU", "iShares MSCI United Kingdom ETF"), ("MCHI", "iShares MSCI China ETF"),
    ("INDA", "iShares MSCI India ETF"), ("EIS", "iShares MSCI Israel ETF"),
    ("VGT", "Vanguard Information Technology ETF"), ("VHT", "Vanguard Health Care ETF"),
    ("VFH", "Vanguard Financials ETF"), ("VDE", "Vanguard Energy ETF"),
    ("TQQQ", "ProShares UltraPro QQQ"), ("SQQQ", "ProShares UltraPro Short QQQ"),
    ("VIXY", "ProShares VIX Short-Term Futures ETF"),
    ("JEPI", "JPMorgan Equity Premium Income ETF"), ("JEPQ", "JPMorgan Nasdaq Equity Premium Income ETF"),
]

CRYPTO = [
    ("BTC-USD", "Bitcoin"), ("ETH-USD", "Ethereum"), ("USDT-USD", "Tether"),
    ("BNB-USD", "BNB"), ("SOL-USD", "Solana"), ("XRP-USD", "XRP"),
    ("USDC-USD", "USD Coin"), ("ADA-USD", "Cardano"), ("DOGE-USD", "Dogecoin"),
    ("TRX-USD", "TRON"), ("AVAX-USD", "Avalanche"), ("LINK-USD", "Chainlink"),
    ("DOT-USD", "Polkadot"), ("MATIC-USD", "Polygon"), ("TON-USD", "Toncoin"),
    ("SHIB-USD", "Shiba Inu"), ("LTC-USD", "Litecoin"), ("BCH-USD", "Bitcoin Cash"),
    ("UNI-USD", "Uniswap"), ("XLM-USD", "Stellar"), ("ATOM-USD", "Cosmos"),
    ("XMR-USD", "Monero"), ("ETC-USD", "Ethereum Classic"), ("FIL-USD", "Filecoin"),
    ("APT-USD", "Aptos"), ("ARB-USD", "Arbitrum"), ("OP-USD", "Optimism"),
    ("NEAR-USD", "NEAR Protocol"), ("ALGO-USD", "Algorand"), ("SUI-USD", "Sui"),
]

# מניות תל אביב. סיומת .TA היא הצורה ש-Yahoo מכיר.
# השמות באנגלית בכוונה: הקטלוג אחד לכל השפות, וברירת המחדל אנגלית.
TEL_AVIV = [
    ("TEVA.TA", "Teva Pharmaceutical Industries"), ("POLI.TA", "Bank Hapoalim"),
    ("LUMI.TA", "Bank Leumi"), ("DSCT.TA", "Israel Discount Bank"),
    ("MZTF.TA", "Mizrahi Tefahot Bank"), ("FIBI.TA", "First International Bank of Israel"),
    ("ESLT.TA", "Elbit Systems"), ("NICE.TA", "NICE"),
    ("ICL.TA", "ICL Group"), ("BEZQ.TA", "Bezeq"),
    ("PHOE.TA", "Phoenix Financial"), ("HARL.TA", "Harel Insurance Investments"),
    ("MGDL.TA", "Migdal Insurance"), ("CLIS.TA", "Clal Insurance"),
    ("MMHD.TA", "Menora Mivtachim"), ("AZRG.TA", "Azrieli Group"),
    ("BIG.TA", "Big Shopping Centers"), ("MLSR.TA", "Melisron"),
    ("AMOT.TA", "Amot Investments"), ("ARPT.TA", "Airport City"),
    ("SPNS.TA", "Sapiens International"), ("CAMT.TA", "Camtek"),
    ("NVMI.TA", "Nova"), ("ORA.TA", "Ormat Technologies"),
    ("SAE.TA", "Shufersal"), ("RMLI.TA", "Rami Levy Chain Stores"),
    ("OPCE.TA", "OPC Energy"), ("ENLT.TA", "Enlight Renewable Energy"),
    ("ENOG.TA", "Energean"), ("NWMD.TA", "NewMed Energy"),
    ("TSEM.TA", "Tower Semiconductor"), ("ELAL.TA", "El Al Israel Airlines"),
    ("STRS.TA", "Strauss Group"), ("DELT.TA", "Delta Galil Industries"),
    ("PLTF.TA", "Plastro Gvat"), ("ALHE.TA", "Alony Hetz Properties"),
    ("ISCD.TA", "Isracard"), ("MVNE.TA", "Mivne Real Estate"),
    ("SLARL.TA", "Shapir Engineering"), ("ELTR.TA", "Electra"),
]



def main() -> int:
    print("fetching S&P 500 constituents...", file=sys.stderr)
    sp_rows = list(csv.DictReader(io.StringIO(fetch(SP500).decode("utf-8"))))
    sp_symbols = {yahoo_symbol(r["Symbol"]): clean_name(r["Security"]) for r in sp_rows}
    print(f"  {len(sp_symbols)} constituents", file=sys.stderr)

    listed: dict[str, tuple[str, str, float]] = {}
    for key, (url, label) in LISTS.items():
        print(f"fetching {key} listings...", file=sys.stderr)
        for row in json.loads(fetch(url)):
            sym = yahoo_symbol(row["symbol"])
            if not re.fullmatch(r"[A-Z][A-Z0-9-]{0,6}", sym):
                continue  # מסנן יחידות, כתבי אופציה וסימולים חריגים
            try:
                cap = float(row.get("marketCap") or 0)
            except ValueError:
                cap = 0.0
            listed[sym] = (clean_name(row.get("name", "")), label, cap)

    out: dict[str, tuple[str, str]] = {}

    # 1. כל מדד S&P 500 — ללא תלות בשווי שוק.
    for sym, name in sp_symbols.items():
        info = listed.get(sym)
        out[sym] = (name, info[1] if info else "NYSE")

    # 2. כל מניה מעל סף שווי השוק.
    for sym, (name, label, cap) in listed.items():
        if cap >= MIN_MARKET_CAP and sym not in out and name:
            out[sym] = (name, label)

    stocks = len(out)
    for sym, name in ETFS:
        out[sym] = (name, "ETF")
    for sym, name in CRYPTO:
        out[sym] = (name, "Crypto")
    for sym, name in TEL_AVIV:
        out[sym] = (name, "TASE")

    rows = sorted(out.items())
    for sym, (name, exchange) in rows:
        for field in (sym, name, exchange):
            if "|" in field or "\n" in field:
                raise SystemExit(f"separator appears inside a field: {field!r}")
    body = "\n".join(f"{s}|{n}|{e}" for s, (n, e) in rows)

    header = f'''/**
 * קטלוג סימולים ארוז — {len(rows)} רשומות.
 *
 * **למה זה קיים:** Yahoo חוסם CORS, ולכן חיפוש סימולים לא יכול לעבוד
 * בדפדפן בכלל, וגם באנדרואיד הוא נופל כשאין רשת או כשמגיעים לחסימת קצב.
 * הקטלוג הזה עונה מיידית, תמיד, בלי בקשת רשת אחת. תוצאות Yahoo
 * ממוזגות מעליו כשיש רשת — ראה `searchTickers` ב-`services/marketData.ts`.
 *
 * ⚠️ **נוצר אוטומטית. אל תערוך ידנית.**
 * לרענון: `python3 scripts/generate-tickers.py`
 *
 * ההרכב: מדד S&P 500 המלא, כל מניה אמריקאית בשווי שוק מעל 5 מיליארד
 * דולר ({stocks} מניות בסך הכל), {len(ETFS)} ETF-ים נפוצים, {len(CRYPTO)} מטבעות
 * קריפטו ו-{len(TEL_AVIV)} ניירות מהבורסה בתל אביב.
 *
 * הסימולים בפורמט של Yahoo (BRK-B ולא BRK.B) כי אותו סימול משמש
 * למשיכת המחיר בפועל.
 *
 * **למה מחרוזת אחת ולא מערך של אובייקטים:** מנוע JS מפרסר מחרוזת אחת
 * הרבה יותר מהר מ-{len(rows)} ליטרלים מקוננים, והבאנדל קטן משמעותית.
 * הפיצול קורה פעם אחת, בחיפוש הראשון.
 */

/** `symbol|name|exchange` בכל שורה. */
const RAW = `\
'''
    with open("src/data/tickers.ts", "w", encoding="utf-8") as fh:
        fh.write(header)
        fh.write(body)
        fh.write("`;\n")
        fh.write(TAIL)

    print(f"wrote src/data/tickers.ts — {len(rows)} rows", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
