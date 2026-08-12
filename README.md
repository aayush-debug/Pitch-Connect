
# Pitch Connect

> Curated deal flow for investors. Free, direct access for founders.

Pitch Connect is a discovery platform that matches early-stage startups with investors based on actual fit — sector, stage, and ticket size — instead of generic cold pitches and inbox noise.

## The problem

Founders send pitches into a void with no idea if the investor on the other end even invests in their space. Investors wade through decks that don't match their thesis at all. Pitch Connect narrows that gap: investors set what they're actually looking for, and only see startups that match.

## How it works

**For founders**
- Create a free profile: one-liner, sector, stage, funding ask
- Upload a short pitch video and your deck
- Get discovered by investors actively looking in your space — no subscription required
- When an investor shows interest, review their profile and choose to accept or decline the match

**For investors**
- Subscribe for access to a filtered discovery feed
- Set preferences (sector, stage, ticket size) so the feed only shows relevant startups
- Save startups you're interested in; get full data room access once the founder accepts the match
- Use the AI Q&A assistant to ask questions about a startup, grounded in their actual deck and data

## Core features

- **Investor Preferences Engine** — filters the discovery feed to each investor's stated sector, stage, and ticket-size fit
- **AI-generated startup summaries** — auto-generated via Claude API from each uploaded deck, so every profile has a clean, consistent quick-read regardless of deck quality
- **Founder Credibility Score** — a trust signal for investors browsing the feed
- **Gated Data Room** — full deck and detailed startup data unlock only after a mutual match
- **Deal Room** — where matched founders and investors move a conversation toward a real deal
- **Syndicate feature** — lets multiple smaller investors pool into a single check on a startup they're all interested in
- **Async AI Q&A** — investors can ask a startup-specific question and get an answer grounded only in the founder's actual materials

## Tech stack

- **Frontend & app**: Next.js
- **Database, auth, storage**: Supabase
- **Payments**: Razorpay (investor subscriptions, founder success fees)
- **AI layer**: Claude API (deck summarization, Q&A assistant)
- Built with Lovable; Supabase connected via MCP through the Antigravity IDE for AI-assisted development

## Revenue model

- **Founders**: free to create a profile and get discovered; a success fee applies only if funding is closed through a platform-sourced match
- **Investors**: monthly/annual subscription for access to the discovery feed and data rooms

## Project status

Currently in build/launch phase — onboarding the first cohort of founders and investors ahead of public launch. Not yet accepting live payments; Razorpay is running in test mode until initial usage is validated.

## A note on framing

Despite the swipe-style discovery mechanic, Pitch Connect is not positioned or described as a dating app anywhere in product copy or communications — the language used throughout is professional and B2B ("discover," "fit score," "request intro").

## Roadmap

- [ ] Complete Row Level Security review across all Supabase tables
- [ ] Connect custom domain
- [ ] Switch Razorpay to live mode after KYC
- [ ] Add Privacy Policy and Terms of Service (including success-fee attribution terms)
- [ ] Onboard first 10 founder profiles
- [ ] Onboard first 5-8 investors
- [ ] Public launch

## Contact

Built by Aayush, Computer Engineering student, University of Mumbai.