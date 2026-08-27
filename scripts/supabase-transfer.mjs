/**
 * Перенос содержимого между проектами Supabase.
 *
 * Миграции переносят схему и базовый сид, но не то, что накопилось в рабочем
 * проекте: тексты секций, проекты, навигацию, настройки и — важнее всего —
 * заявки клиентов из bookings. Этот скрипт выгружает их из старого проекта
 * и заливает в новый.
 *
 * Ключи берутся только из переменных окружения и никуда не записываются:
 * service_role даёт полный доступ в обход RLS, его нельзя ни коммитить,
 * ни пересылать. Найти его: Project Settings → API → service_role.
 *
 *   # выгрузка из старого проекта
 *   SOURCE_SUPABASE_URL="https://xxxx.supabase.co" \
 *   SOURCE_SERVICE_ROLE_KEY="..." \
 *   node scripts/supabase-transfer.mjs export
 *
 *   # заливка в новый
 *   TARGET_SUPABASE_URL="https://yyyy.supabase.co" \
 *   TARGET_SERVICE_ROLE_KEY="..." \
 *   node scripts/supabase-transfer.mjs import
 *
 * Каталог выгрузки задаётся через --dir (по умолчанию ./supabase-dump) и в
 * репозиторий не попадает.
 *
 * Чего скрипт намеренно НЕ переносит:
 *   auth.users и user_roles — идентификаторы пользователей в новом проекте
 *   другие, и перенесённые строки ролей указывали бы в пустоту. Пользователей
 *   заводим заново, роль назначаем через supabase/sql/bootstrap-admin.sql.
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/** Порядок важен: project_images ссылается на projects. */
const TABLES = [
  { name: "site_content", conflict: "id" },
  { name: "site_settings", conflict: "key" },
  { name: "navigation_items", conflict: "id" },
  { name: "projects", conflict: "id" },
  { name: "project_images", conflict: "id" },
  { name: "bookings", conflict: "id" },
];

const BUCKETS = ["images", "project-images"];

const PAGE = 1000;

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function client(urlVar, keyVar) {
  const url = process.env[urlVar];
  const key = process.env[keyVar];
  if (!url || !key) {
    console.error(`Не заданы ${urlVar} и ${keyVar}. Смотри комментарий в начале файла.`);
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function exportAll(dir) {
  const db = client("SOURCE_SUPABASE_URL", "SOURCE_SERVICE_ROLE_KEY");
  mkdirSync(dir, { recursive: true });
  mkdirSync(resolve(dir, "storage"), { recursive: true });

  for (const { name } of TABLES) {
    const rows = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await db.from(name).select("*").range(from, from + PAGE - 1);
      if (error) {
        // Таблицы может не быть — например, bookings заводили отдельным файлом
        console.warn(`  ${name}: пропущено (${error.message})`);
        break;
      }
      rows.push(...data);
      if (data.length < PAGE) break;
    }
    writeFileSync(resolve(dir, `${name}.json`), JSON.stringify(rows, null, 2));
    console.log(`  ${name}: ${rows.length}`);
  }

  for (const bucket of BUCKETS) {
    const { data: files, error } = await db.storage.from(bucket).list("", { limit: 10000 });
    if (error) {
      console.warn(`  bucket ${bucket}: пропущен (${error.message})`);
      continue;
    }
    const out = resolve(dir, "storage", bucket);
    mkdirSync(out, { recursive: true });
    let saved = 0;
    for (const file of files) {
      if (!file.name || file.id === null) continue; // папка, а не файл
      const { data, error: dlError } = await db.storage.from(bucket).download(file.name);
      if (dlError) {
        console.warn(`    ${file.name}: ${dlError.message}`);
        continue;
      }
      writeFileSync(resolve(out, file.name), Buffer.from(await data.arrayBuffer()));
      saved += 1;
    }
    console.log(`  bucket ${bucket}: ${saved} файлов`);
  }

  console.log(`\nВыгружено в ${dir}`);
}

async function importAll(dir) {
  const db = client("TARGET_SUPABASE_URL", "TARGET_SERVICE_ROLE_KEY");

  for (const { name, conflict } of TABLES) {
    const file = resolve(dir, `${name}.json`);
    if (!existsSync(file)) {
      console.warn(`  ${name}: файла нет, пропущено`);
      continue;
    }
    const rows = JSON.parse(readFileSync(file, "utf8"));
    if (!rows.length) {
      console.log(`  ${name}: пусто`);
      continue;
    }
    /* upsert, а не insert: миграции уже засеяли hero и site_settings, и
       обычная вставка упёрлась бы в конфликт первичного ключа. */
    for (let from = 0; from < rows.length; from += 100) {
      const chunk = rows.slice(from, from + 100);
      const { error } = await db.from(name).upsert(chunk, { onConflict: conflict });
      if (error) {
        console.error(`  ${name}: ОШИБКА ${error.message}`);
        break;
      }
    }
    console.log(`  ${name}: ${rows.length}`);
  }

  const { readdirSync } = await import("node:fs");
  for (const bucket of BUCKETS) {
    const src = resolve(dir, "storage", bucket);
    if (!existsSync(src)) continue;
    let sent = 0;
    for (const name of readdirSync(src)) {
      const body = readFileSync(resolve(src, name));
      const { error } = await db.storage.from(bucket).upload(name, body, { upsert: true });
      if (error) console.warn(`    ${name}: ${error.message}`);
      else sent += 1;
    }
    console.log(`  bucket ${bucket}: ${sent} файлов`);
  }

  console.log("\nГотово. Роль администратора назначается отдельно: supabase/sql/bootstrap-admin.sql");
}

const mode = process.argv[2];
const dir = resolve(arg("--dir", "./supabase-dump"));

if (mode === "export") await exportAll(dir);
else if (mode === "import") await importAll(dir);
else {
  console.error("Использование: node scripts/supabase-transfer.mjs export|import [--dir ./supabase-dump]");
  process.exit(1);
}
