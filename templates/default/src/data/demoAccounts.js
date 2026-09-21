// Static demo accounts for testing. The scaffolder rewrites this file to one
// account per role you picked (or a single normal demo user when UserRole
// support is off) and deletes it entirely when demo accounts aren't wanted.
// Each account carries its full profile and default settings so a backend seed
// (or a first-login init) has everything it needs.
export const DEMO_ACCOUNTS = [
  {
    role: "master",
    email: "master@demo.dev",
    password: "password",
    profile: {
      name: "Aya El-Amin",
      email: "master@demo.dev",
      phone: "+201000000001",
      country_code: "EG",
      city: "Cairo",
      channel: "telegram",
      channel_handle: "@aya_master",
      photo: null,
    },
    settings: {
      notification_preferences: {
        account: { email: true, push: true, sms: false, telegram: false },
        security: { email: true, push: true, sms: true, telegram: false },
        marketing: { email: false, push: false, sms: false, telegram: false },
        updates: { email: true, push: false, sms: false, telegram: false },
      },
      two_factor_enabled: false,
      ai_agent: {
        enabled: true,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        reasoning: false,
        system_prompt: "",
      },
      telegram: { bot_token: "", chat_id: "", username: "@aya_master" },
    },
  },
  {
    role: "super_admin",
    email: "superadmin@demo.dev",
    password: "password",
    profile: {
      name: "Omar El-Sayed",
      email: "superadmin@demo.dev",
      phone: "+966500000002",
      country_code: "SA",
      city: "Riyadh",
      channel: "whatsapp",
      channel_handle: "+966500000002",
      photo: null,
    },
    settings: {
      notification_preferences: {
        account: { email: true, push: true, sms: false, telegram: false },
        security: { email: true, push: true, sms: true, telegram: false },
        marketing: { email: false, push: false, sms: false, telegram: false },
        updates: { email: true, push: false, sms: false, telegram: false },
      },
      two_factor_enabled: false,
      ai_agent: {
        enabled: true,
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        reasoning: false,
        system_prompt: "",
      },
      telegram: { bot_token: "", chat_id: "", username: "" },
    },
  },
  {
    role: "admin",
    email: "admin@demo.dev",
    password: "password",
    profile: {
      name: "Layla Haddad",
      email: "admin@demo.dev",
      phone: "+971500000003",
      country_code: "AE",
      city: "Dubai",
      channel: "none",
      channel_handle: "",
      photo: null,
    },
    settings: {
      notification_preferences: {
        account: { email: true, push: true, sms: false, telegram: false },
        security: { email: true, push: true, sms: true, telegram: false },
        marketing: { email: false, push: false, sms: false, telegram: false },
        updates: { email: true, push: false, sms: false, telegram: false },
      },
      two_factor_enabled: false,
      ai_agent: {
        enabled: false,
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        reasoning: false,
        system_prompt: "",
      },
      telegram: { bot_token: "", chat_id: "", username: "" },
    },
  },
  {
    role: "user",
    email: "user@demo.dev",
    password: "password",
    profile: {
      name: "Karim Nasser",
      email: "user@demo.dev",
      phone: "+120200000004",
      country_code: "US",
      city: "New York",
      channel: "none",
      channel_handle: "",
      photo: null,
    },
    settings: {
      notification_preferences: {
        account: { email: true, push: true, sms: false, telegram: false },
        security: { email: true, push: true, sms: true, telegram: false },
        marketing: { email: false, push: false, sms: false, telegram: false },
        updates: { email: true, push: false, sms: false, telegram: false },
      },
      two_factor_enabled: false,
      ai_agent: {
        enabled: false,
        model: "gemma2-9b-it",
        temperature: 0.8,
        reasoning: false,
        system_prompt: "",
      },
      telegram: { bot_token: "", chat_id: "", username: "" },
    },
  },
];