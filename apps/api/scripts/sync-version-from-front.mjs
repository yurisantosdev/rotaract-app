#!/usr/bin/env node
/**
 * Alinha api à versão do rotaract-front-end (sem incrementar).
 * Use no pre-commit do back para manter o mesmo AAAA.N quando só há commits na API.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const backRoot = join(__dirname, "..");
const frontVersionPath = join(backRoot, "..", "rotaract-front-end", "VERSION");
const frontPkgPath = join(backRoot, "..", "rotaract-front-end", "package.json");
const backPkgPath = join(backRoot, "package.json");
const backVersionPath = join(backRoot, "VERSION");

function versaoCanonica() {
  if (existsSync(frontVersionPath)) {
    const t = readFileSync(frontVersionPath, "utf8").trim();
    if (/^\d{4}\.\d+$/.test(t)) return t;
  }
  if (existsSync(frontPkgPath)) {
    const pkg = JSON.parse(readFileSync(frontPkgPath, "utf8"));
    const v = String(pkg.version ?? "").trim();
    if (/^\d{4}\.\d+$/.test(v)) return v;
  }
  return null;
}

const target = versaoCanonica();
if (!target) {
  console.warn(
    "[sync-version] rotaract-front-end/VERSION (ou package.json) não encontrado — ignorando."
  );
  process.exit(0);
}

const backPkg = JSON.parse(readFileSync(backPkgPath, "utf8"));
const cur = String(backPkg.version ?? "").trim();
const diskVer = existsSync(backVersionPath)
  ? readFileSync(backVersionPath, "utf8").trim()
  : "";

if (cur === target && diskVer === target) process.exit(0);

if (cur === target && diskVer !== target) {
  writeFileSync(backVersionPath, `${target}\n`);
  console.log(`[sync-version] VERSION do back alinhado a ${target}`);
  process.exit(0);
}

backPkg.version = target;
writeFileSync(backPkgPath, JSON.stringify(backPkg, null, 2) + "\n");
writeFileSync(backVersionPath, `${target}\n`);
console.log(`[sync-version] back alinhado a ${target} (front)`);
