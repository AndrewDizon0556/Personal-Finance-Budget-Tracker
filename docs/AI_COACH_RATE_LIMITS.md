# Ipon Coach — AI Rate Limits & Recovery Report

_When the AI Coach stops responding because a limit was reached, this explains
**which** limit it was and **when it comes back**._

There are **two separate limits** in front of the AI Coach. The message you see
tells you which one you hit.

---

## 1. App-level cap (yours)

A per-user daily cap built into the app to keep usage within the free tier and
stop any single account from running up cost.

| Property | Value |
|---|---|
| Limit | **15 AI requests per user, per day** |
| In-app message | _"You've reached today's AI limit (15 requests). Try again tomorrow."_ |
| **Resets** | **Local midnight** (server time) — i.e. **the next day** |
| Where it lives | `AiRateLimiter.java` (`DAILY_LIMIT = 15`) |

➡️ **Comes back: the next calendar day.** (Raise `DAILY_LIMIT` if you want more.)

---

## 2. Google Gemini free-tier quota (the provider)

Google's own limits on the free API key. Model: **`gemini-2.5-flash-lite`**.

| Limit | Free tier | **Resets after** |
|---|---|---|
| **Requests per minute (RPM)** | **30 / min** | **~60 seconds** |
| Requests per day (RPD) | 1,500 / day | midnight **US Pacific Time** |
| Tokens per minute (TPM) | 1,000,000 / min | ~60 seconds |

| Property | Value |
|---|---|
| In-app message | _"The AI is busy right now (quota reached). Please try again shortly."_ |
| Cause (most common) | Sending several messages quickly → **30/min** tripped |

➡️ **Comes back: usually ~1 minute** (the per-minute limit). The daily 1,500
limit is very unlikely for one person.

---

## "When will it come back?" — quick answer

| What you hit | Typical trigger | Comes back |
|---|---|---|
| Gemini **per-minute** (30/min) | A few quick messages in a row | **~1 minute** — just wait and retry |
| Gemini **per-day** (1,500/day) | ~1,500 requests in one day (rare) | **Midnight US Pacific** ≈ **3:00 PM Manila** (June) |
| App **daily cap** (15/user/day) | 15 of your own requests today | **Next day** (local midnight) |

> **Pacific → Manila:** midnight Pacific is **UTC-7** in summer (PDT) → **07:00 UTC**
> → **15:00 (3 PM) Philippine Time**. In winter (PST, UTC-8) it's **4 PM PHT**.

---

## What to do

1. **First, just wait ~1 minute and try again** — this clears the most common
   (per-minute) limit.
2. If it stays blocked for several minutes, it's the **daily** quota → wait until
   the reset above.
3. **Monitor usage** anytime in **Google AI Studio → _Usage_ / _Rate Limit_** tabs.

## How to remove the limits (optional)

- **Enable billing** on the Gemini project (Google AI Studio → _Billing_). The free
  tier becomes pay-as-you-go, which raises RPM/RPD dramatically. Cost stays tiny
  (~₱0.25 per chat on Flash-Lite), and the app's own 15/day cap still protects you.
- Or switch `AI_MODEL` to another model with different free limits.

---

_Sources: [Google AI — Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) ·
[Gemini API free-tier limits (2026)](https://www.aifreeapi.com/en/posts/gemini-api-free-tier-rate-limits).
Figures reflect Google's standard free tier as of 2026 and may vary by region/account._
