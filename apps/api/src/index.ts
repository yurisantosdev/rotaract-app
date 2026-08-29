import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import cors from "cors";
import express from "express";

function lerVersaoDoPacote(): string {
  try {
    const caminho = join(process.cwd(), "package.json");
    const pkg = JSON.parse(readFileSync(caminho, "utf8")) as {
      version?: string;
    };
    const v = pkg.version?.trim();
    return v && /^(\d{4})\.\d+$/.test(v) ? v : "unknown";
  } catch {
    return "unknown";
  }
}

const APP_VERSION = lerVersaoDoPacote();

process.on("uncaughtException", (err) => {
  console.error("[fatal] uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[fatal] unhandledRejection:", reason);
});
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database";

//Routes
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";

function portaHttp(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return 3000;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) {
    console.error(
      `PORT inválido: "${raw}" — usando 3000 (remova PORT manual na Railway se não souber o valor certo)`
    );
    return 3000;
  }
  return n;
}

const PORT = portaHttp();

function hostDaMongoUri(uri: string): string {
  const m = uri.match(/@[^/]+/);
  return m ? m[0].slice(1) : "(host não identificado)";
}

let dbPronto = false;

async function tentarMongo(uri: string): Promise<boolean> {
  try {
    await connectDatabase(uri);
    return true;
  } catch (err) {
    console.error(
      "MongoDB indisponível (Atlas: libere 0.0.0.0/0 ou IPs da Railway em Network Access):"
    );
    console.error(err);
    await disconnectDatabase().catch(() => { });
    return false;
  }
}

async function main() {
  const jwtSecretOk = Boolean(process.env.JWT_SECRET?.trim());
  if (!jwtSecretOk) {
    console.error(
      "AVISO: JWT_SECRET ausente — /health responde, mas login e APIs com token falharão até configurar."
    );
  }

  const mongodbUri = process.env.MONGODB_URI?.trim();

  const app = express();
  app.set("trust proxy", 1);

  const allowedOrigins = [
    "http://localhost:3000",
  ];

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      versao: APP_VERSION,
      db: dbPronto,
      jwt: jwtSecretOk,
      ...(mongodbUri ? {} : { aviso: "MONGODB_URI não configurada" }),
      ...(!jwtSecretOk ? { avisoJwt: "JWT_SECRET não configurada" } : {}),
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      versao: APP_VERSION,
      db: dbPronto,
      jwt: jwtSecretOk,
      ...(mongodbUri ? {} : { aviso: "MONGODB_URI não configurada" }),
      ...(!jwtSecretOk ? { avisoJwt: "JWT_SECRET não configurada" } : {}),
    });
  });

  app.use((req, res, next) => {
    const p = req.path || "";
    if (p === "/health" || p === "/" || p.startsWith("/health")) return next();
    if (!dbPronto) {
      return res.status(503).json({
        erro:
          "Banco de dados indisponível. Confira MONGODB_URI e Network Access no Atlas.",
      });
    }
    next();
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);

  const host = process.env.HOST ?? "0.0.0.0";

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, host, () => {
      console.log(
        `Rotaract API ${APP_VERSION} | HTTP em ${host}:${PORT} | GET /health (mongo opcional até conectar)`
      );
      resolve();
    });
    server.on("error", reject);
  });

  if (!mongodbUri) {
    console.error(
      "AVISO: MONGODB_URI ausente — rotas /api/* ficam em 503 até configurar."
    );
    return;
  }

  console.log(`Conectando ao MongoDB em ${hostDaMongoUri(mongodbUri)} …`);

  dbPronto = await tentarMongo(mongodbUri);
  if (dbPronto) {
    console.log("MongoDB conectado.");
  } else {
    const intervaloMs = 15_000;
    console.error(
      `Novas tentativas de MongoDB a cada ${intervaloMs / 1000}s (processo não será encerrado).`
    );
    setInterval(async () => {
      if (dbPronto) return;
      const ok = await tentarMongo(mongodbUri);
      if (ok) {
        dbPronto = true;
        console.log("MongoDB conectado após nova tentativa.");
      }
    }, intervaloMs);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
