#!/usr/bin/env node
/*
 * init-admin.js
 * ============================================================
 * LOCAL seed script — NEVER deployed, NEVER served to browsers.
 *
 * Creates (or ensures) the SINGLE admin account for the admin panel,
 * then grants it role='admin' through the server-side function
 * public.set_admin_role(email) (which bypasses the client RLS that forbids
 * admin role changes). Uses the Supabase SERVICE ROLE key, which must only
 * EVER exist in this local environment — NOT in the frontend / GitHub.
 *
 * Required environment variables:
 *   SUPABASE_URL          (e.g. https://XXXX.supabase.co)
 *   SUPABASE_SERVICE_KEY  (the service_role key — SECRET)
 *   ADMIN_EMAIL           (the one allowed admin address)
 *   ADMIN_PASSWORD        (the admin password — SECRET)
 *
 * The migration supabase/migrations/20260831000005_admin_security_hardening.sql
 * MUST be applied in the Supabase SQL Editor before running this script.
 *
 * Usage:
 *   node scripts/init-admin.js
 *   (with the env vars set in your shell or a local .env that is NOT committed)
 * ============================================================
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function fail(msg) {
  console.error('[init-admin] ERROR: ' + msg);
  process.exit(1);
}

if (!url) fail('SUPABASE_URL is not set');
if (!serviceKey) fail('SUPABASE_SERVICE_KEY is not set');
if (!adminEmail) fail('ADMIN_EMAIL is not set');
if (!adminPassword) fail('ADMIN_PASSWORD is not set');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + serviceKey,
  'apikey': serviceKey
};

async function main() {
  console.log('[init-admin] Ensuring admin user exists: ' + adminEmail);

  // 1) Create the auth user (idempotent: ignore "already registered").
  let userId;
  const createRes = await fetch(url + '/auth/v1/admin/users', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'مدير النظام', phone: null }
    })
  });

  if (createRes.ok) {
    const created = await createRes.json();
    userId = created.id;
    console.log('[init-admin] Admin auth user created: ' + userId);
  } else {
    const body = await createRes.json().catch(() => ({}));
    const msg = (body.msg || body.message || body.error_description || '').toString();
    if (/already registered|already exists|registered/i.test(msg)) {
      console.log('[init-admin] Admin auth user already exists, fetching it...');
      const listRes = await fetch(
        url + '/auth/v1/admin/users?filter=' + encodeURIComponent('email=eq.' + adminEmail),
        { method: 'GET', headers }
      );
      if (!listRes.ok) fail('unable to list users: ' + listRes.status);
      const list = await listRes.json();
      const found = (list.users || []).find(u => u.email === adminEmail);
      if (!found) fail('admin user email not found after create attempt');
      userId = found.id;
      console.log('[init-admin] Existing admin auth user: ' + userId);
    } else {
      console.error('[init-admin] create response body:', JSON.stringify(body));
      fail('unable to create auth user: ' + msg);
    }
  }

  // 2) Ensure a profile row exists for the admin (the signup trigger usually
  //    creates it, but be safe).
  const upsertRes = await fetch(url + '/rest/v1/profiles?id=eq.' + userId, {
    method: 'GET',
    headers
  });
  const existing = await upsertRes.json();
  if (!Array.isArray(existing) || existing.length === 0) {
    const insRes = await fetch(url + '/rest/v1/profiles', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: userId,
        full_name: 'مدير النظام',
        email: adminEmail,
        phone: null,
        role: 'customer'
      })
    });
    if (!insRes.ok && insRes.status !== 201) {
      console.error('[init-admin] profile insert status ' + insRes.status);
    }
  }

  // 3) Grant admin via the secure server function (bypasses client RLS).
  const rpcRes = await fetch(url + '/rest/v1/rpc/set_admin_role', {
    method: 'POST',
    headers,
    body: JSON.stringify({ target_email: adminEmail })
  });
  if (!rpcRes.ok) {
    console.error('[init-admin] set_admin_role status ' + rpcRes.status);
    fail('set_admin_role failed. Has the hardening migration been applied?');
  }

  console.log('[init-admin] Admin role granted to ' + adminEmail);
  console.log('[init-admin] Done. Log in at /#admin/login with ADMIN_EMAIL / ADMIN_PASSWORD.');
}

main().catch((e) => { console.error(e); process.exit(1); });
