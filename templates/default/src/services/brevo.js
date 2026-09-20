import api from "./api";

/**
 * Brevo (formerly Sendinblue) — transactional email & SMS.
 *
 * This replaces Firebase (which the previous falak-app generation used for
 * auth emails / push). Brevo's API key is a backend secret, so every call
 * here goes through your Laravel API, authenticated the same way as the
 * rest of the app (X-API-Key + user bearer token via the shared `api` client).
 *
 * Expected Laravel routes (implement server-side with brevo/brevo-php or a
 * plain HTTP client against https://api.brevo.com/v3):
 *   POST /brevo/email        { to, template_id, params }
 *   POST /brevo/sms          { to, message }
 *   POST /brevo/contacts     { email, attributes, list_ids }
 */

export async function sendTransactionalEmail({ to, templateId, params = {} }) {
  const { data } = await api.post("/brevo/email", { to, template_id: templateId, params });
  return data;
}

export async function sendSms({ to, message }) {
  const { data } = await api.post("/brevo/sms", { to, message });
  return data;
}

export async function upsertContact({ email, attributes = {}, listIds = [] }) {
  const { data } = await api.post("/brevo/contacts", {
    email,
    attributes,
    list_ids: listIds,
  });
  return data;
}
