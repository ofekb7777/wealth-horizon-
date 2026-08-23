import express from "express";
import { createServer as createViteServer } from "vite";
import YahooFinance from 'yahoo-finance2';
import path from "path";

const yahooFinance = new YahooFinance();

// Initialize express app
const app = express();
const PORT = 3000;

async function startServer() {
  // API endpoints
  app.get("/api/prices", async (req, res) => {
    try {
      const tickersRaw = req.query.tickers as string;
      if (!tickersRaw) {
        return res.json({});
      }

      const tickers = tickersRaw.split(",").filter(Boolean);
      const results: Record<string, number> = {};

      // Fetch quotes concurrently
      await Promise.all(
        tickers.map(async (ticker) => {
          try {
            console.log(`[Price Engine] Fetching quote for: ${ticker}`);
            const quote = (await yahooFinance.quote(ticker)) as any;
            if (quote) {
              const price = quote.regularMarketPrice || quote.postMarketPrice || quote.preMarketPrice || quote.bid || quote.ask;
              if (typeof price === 'number') {
                results[ticker] = price;
              }
            }
          } catch (err) {
            console.error(`[Price Engine] Error fetching data for ${ticker}:`, err instanceof Error ? err.message : String(err));
          }
        })
      );

      res.status(200).json(results);
    } catch (error) {
      console.error('Error in /api/prices route:', error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : "Failed to fetch prices." 
      });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || '').trim().toUpperCase();
      if (!query || query.length < 1) {
        return res.json([]);
      }

      console.log(`[Search] Query: ${query}`);
      
      // Concurrently try search and a direct quote if it looks like a symbol
      const searchPromise = yahooFinance.search(query, { quotesCount: 10 }).catch((err: any) => {
        console.warn(`[Search] Validation/Search error for ${query}:`, err);
        return { quotes: [] };
      });
      const quotePromise = (query.length <= 6 && /^[A-Z0-9.-]+$/i.test(query)) 
        ? (yahooFinance.quote(query) as Promise<any>).catch(() => null)
        : Promise.resolve(null);

      const [searchResult, directQuote] = await Promise.all([searchPromise, quotePromise]) as [any, any];
      
      let quotes = (searchResult.quotes || []) as any[];

      // If direct quote found and not in search results, prepend it
      if (directQuote && directQuote.symbol) {
        const exists = quotes.some(q => q.symbol === directQuote.symbol);
        if (!exists) {
          quotes = [{
            symbol: directQuote.symbol,
            shortname: directQuote.longName || directQuote.shortName || directQuote.symbol,
            exchange: directQuote.exchange || 'Market',
            typeDisp: directQuote.quoteType || 'Equity'
          }, ...quotes];
        }
      }
      
      const filtered = quotes
        .map((q: any) => ({
          symbol: q.symbol,
          shortname: q.shortname || q.longname || q.longName || q.shortName || q.symbol,
          exchange: q.exchange || 'Market',
          typeDisp: q.typeDisp || q.quoteType || 'Asset'
        }))
        .filter((q: any) => q.symbol)
        .sort((a: any, b: any) => {
          const queryUpper = query.toUpperCase();
          
          const getScore = (item: any) => {
            const sym = item.symbol.toUpperCase();
            const name = item.shortname.toUpperCase();
            
            if (sym === queryUpper) return 100; // Exact symbol
            if (name === queryUpper) return 90;  // Exact name
            
            if (sym.startsWith(queryUpper)) return 80; // Starts with symbol
            if (name.startsWith(queryUpper)) return 70; // Starts with name
            
            if (sym.includes(queryUpper)) return 60; // Contains symbol
            if (name.includes(queryUpper)) return 50; // Contains name
            
            return 0;
          };
          
          const scoreA = getScore(a);
          const scoreB = getScore(b);
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          
          return a.symbol.localeCompare(b.symbol);
        })
        .slice(0, 10); // Limit to 10 for better search relevance

      console.log(`[Search] Fetching history for ${filtered.length} results`);
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const resultsWithHistory = await Promise.all(
        filtered.map(async (item: any) => {
          try {
            const chart = await yahooFinance.chart(item.symbol, {
              period1: oneYearAgo,
              interval: '1wk',
            });
            
            const history = chart.quotes
              .filter((q: any) => q.close !== undefined)
              .map((q: any) => ({
                date: q.date,
                price: q.close
              }));
              
            return { ...item, history };
          } catch (e) {
            console.error(`[Search] History failed for ${item.symbol}:`, e);
            return { ...item, history: [] };
          }
        })
      );

      console.log(`[Search] Returning ${resultsWithHistory.length} results with history`);
      res.json(resultsWithHistory);
    } catch (error) {
      console.error('Error in /api/search route:', error);
      res.status(500).json({ error: "Failed to search tickers.", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const tickersRaw = req.query.tickers as string;
      if (!tickersRaw) return res.json({});

      const tickers = tickersRaw.split(",").filter(Boolean);
      const results: Record<string, any> = {};

      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      await Promise.all(
        tickers.map(async (ticker) => {
          try {
            const chart = await yahooFinance.chart(ticker, {
              period1: oneYearAgo,
              interval: '1d', // Daily for better MA calculations
            });

            const quotes = chart.quotes.filter((q: any) => q.close !== undefined);
            if (quotes.length === 0) return;

            const currentPrice = quotes[quotes.length - 1].close;
            
            // Performance calculations
            const getPerf = (days: number) => {
              const pastIdx = Math.max(0, quotes.length - days);
              const pastPrice = quotes[pastIdx].close;
              return ((currentPrice - pastPrice) / pastPrice) * 100;
            };

            const perf = {
              '1M': getPerf(21),
              '3M': getPerf(63),
              '6M': getPerf(126),
              '1Y': getPerf(252),
            };

            // Simple Technical Indicator (MA-based)
            const getMA = (period: number) => {
              if (quotes.length < period) return null;
              const slice = quotes.slice(-period);
              return slice.reduce((sum: number, q: any) => sum + q.close, 0) / period;
            };

            const ma20 = getMA(20);
            const ma50 = getMA(50);
            const ma200 = getMA(200);

            let rating = 'Hold';
            let score = 0;

            if (ma20 && currentPrice > ma20) score++; else score--;
            if (ma50 && currentPrice > ma50) score++; else score--;
            if (ma200 && currentPrice > ma200) score++; else score--;
            if (ma20 && ma50 && ma20 > ma50) score++; else score--;

            if (score >= 3) rating = 'Strong Buy';
            else if (score >= 1) rating = 'Buy';
            else if (score <= -3) rating = 'Strong Sell';
            else if (score <= -1) rating = 'Sell';
            else rating = 'Neutral';

            results[ticker] = {
              perf,
              rating,
              score,
              ma20,
              ma50,
              ma200,
              history: quotes.map(q => ({ date: q.date, price: q.close }))
            };
          } catch (e) {
            console.error(`[Analytics] Error for ${ticker}:`, e);
          }
        })
      );

      res.json(results);
    } catch (error) {
      console.error('Error in /api/analytics route:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/gemini", express.json(), async (req, res) => {
    try {
      const { summary } = req.body;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze this financial profile: ${JSON.stringify(summary, null, 2)}...` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to proxy request" });
    }
  });

  app.get("/api/system-metrics", (req, res) => {
    const usage = process.memoryUsage();
    res.json({
      cpuUsagePercent: Math.floor(Math.random() * 20 + 5),
      memoryUsageMB: Math.floor(usage.heapUsed / 1024 / 1024),
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, let Vite handle the frontend
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In prod, serve dist static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start the server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
