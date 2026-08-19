# Fix Mechnova backend + broken pages (no Cloud Functions / no Blaze)

## Context

The app (`functions/`) has a full Cloud Functions backend written, but **zero functions are deployed** to the `mechnova-vitc` Firebase project (confirmed via `firebase functions:list`), and `VITE_USE_CLOUD_FUNCTIONS=false`. You confirmed Blaze billing is off the table, so Cloud Functions deployment is not an option — this app must run entirely on the free Spark plan (Firestore + Auth + Hosting, no server compute).

In place of the functions, there's an **uncommitted, half-finished rewrite** of `src/services/callableApi.js` ("fallback engine") that talks to Firestore directly from the browser, plus loosened `firestore.rules` that were never deployed (production is still running an older rules version — this is already causing a live bug: the public themes list on the homepage errors with "Missing or insufficient permissions" for logged-out visitors).

I traced the "buttons/pages not working" reports to concrete, reproducible bugs (confirmed by reading the code paths end-to-end, not guesswork):

1. **Quiz never completes.** `useQuizSession.js` subscribes to `quizSessions/{teamId}`, but `callableApi.js`'s `startSession` fallback creates the session doc at `quizSessions/session_<timestamp>` — the IDs never match, so the real-time subscription never fires. Worse: `submitAnswerChoice` never passes `sessionId` to `submitAnswerApi`, so the fallback's answer-recording branch (`if (sessionId) {...}`) never runs, and the fallback's `submitAnswer` return object has a `nextSessionState` key while the hook expects `res.session` — so `session.questionIndex` in React state **never advances past 0**. Every submit re-grades question 0, the quiz can never reach `COMPLETED`, and the "Quiz Portal" button leads to a dead end.
2. **Registration silently fails to persist.** `registerTeam` creates the new team's Firebase Auth user on a *secondary* Auth app instance (to avoid signing the visitor into the main app), but then writes the `teams`/`scores` documents using the **primary** `db` instance — whose `request.auth` is `null` for an unauthenticated visitor. Any rule requiring `request.auth != null` on that write will reject it. Fix: perform the Firestore writes through the secondary app's own Firestore instance (whose auth context matches the newly created uid), then sign that instance out.
3. **Public themes never load for logged-out visitors.** `subscribeToPublicThemes` runs an unfiltered `collection(...).orderBy(...)` query while the rule is `resource.data.visible == true || isAuthenticated()`. Firestore rejects the entire *list* query up front for a rule branch that depends on `resource.data` unless the query itself is constrained by a matching `where()` — there's no `where('visible','==',true)`, so anonymous users get a blanket permission error and silently fall back to hardcoded placeholder themes.
4. **Quiz answer key is fully exposed to the browser at quiz start.** `startSession`/`submitAnswer` currently `getDocs()` the *entire* `quizzes/{quizId}/questions` collection — including every `correctOption` — into the browser, then delete the field from the JS object before displaying it. That doesn't hide anything: the raw network/gRPC response (visible in DevTools Network tab) already contains every answer for the whole quiz, before the participant answers question 1.
5. **Rules currently let teams forge their own outcomes.** The uncommitted `firestore.rules` allow any authenticated team to directly `write` their own `scores`, `bids`, and `allocations` documents with arbitrary values, and to `read`/`write` the quiz question bank with no restriction.

## What's achievable without a server (honest tradeoff)

Without Cloud Functions, there is **no way to give a team instant "correct/incorrect" feedback without the browser transiently holding that question's answer** — Firestore rules are document-level, not field-level, so a rule can't serve a document's other fields while hiding one. I'm not going to pretend otherwise. What I *can* do, and will do:

- Stop shipping the **entire quiz's answer key up front** — restructure so only the *current* question's document is ever fetched (one at a time, looked up via an ordered `questionIds` list on the quiz doc), so a participant can at most see the answer to the question they're actively on, not the whole bank in advance.
- Make `scores`, `bids`, and `allocations` writes rule-validated (not freely overwritable) — e.g. a score update must increment `answeredCount` by exactly 1 and `totalPoints` by exactly 0 or 100 from its previous value; `allocations` become admin-write-only (never team-writable); bids require `biddingOpen == true` (checked via `get()` on the event doc) and a themeId that actually exists in `themesPublic`.
- Keep a Firestore-server-timestamped, **create-only, immutable** per-question answer log (`quizSessions/{teamId}/answers/{questionId}`) so admin has a tamper-evident audit trail and can spot anomalies before finalizing allocation.

This meaningfully raises the bar over the current state (full answer key exposed instantly, scores directly forgeable) without claiming a security guarantee that isn't possible on the free tier.

## Implementation

**1. Fix the quiz session flow**
- `src/services/callableApi.js`: `startSession` fallback stores the session at `quizSessions/{teamId}` (doc id = teamId), matching what `useQuizSession` subscribes to.
- `src/hooks/useQuizSession.js`: `submitAnswerChoice` passes `sessionId` (= teamId) through to `submitAnswerApi`.
- `src/services/callableApi.js`: `submitAnswer` fallback returns `session: nextSessionState` (not `nextSessionState`) so the hook's `setSession(res.session)` actually updates local state and `questionIndex` advances.
- Restructure question storage: add `quizzes/{quizId}` doc with an ordered `questionIds: [...]` array (no answers); `startSession`/`submitAnswer` fetch one question doc at a time by id instead of `getDocs()` on the whole `questions` collection.
- `src/components/admin/QuizQuestionEditor.jsx`: update save/delete to maintain the `questionIds` order array on the parent quiz doc.

**2. Fix registration**
- `src/services/callableApi.js` `registerTeam`: write the `teams` and `scores` docs using the secondary app's Firestore instance (matching auth context to the new team uid), then sign the secondary app out. Keep the primary app's auth session untouched (visitor stays logged out until they use their new credentials on `/login`).

**3. Fix public themes query**
- `src/services/firestoreService.js` `subscribeToPublicThemes`: add `where('visible', '==', true)` to the query so the list request is satisfiable by the rule for anonymous readers.

**4. Rewrite `firestore.rules`** (replacing the current uncommitted draft)
- Keep `isAdmin()` via the `admins/{uid}` doc-exists check (matches how `authService.js` now grants admin).
- `teams/{teamId}`: `allow create` only when `request.auth.uid == teamId`; no arbitrary team-to-team writes.
- `quizzes/{quizId}` + `.../questions/{id}`: readable by authenticated users; write restricted to admin.
- `quizSessions/{teamId}` and `.../answers/{qId}`: team can create/update their own session, but answer sub-docs are `allow create` only (no update/delete) — immutable once submitted.
- `scores/{teamId}`: team can only write via the constrained increment described above; admin unrestricted (for the recompute safety net).
- `bids/{eventId}/items/{teamId}`: team create/update own doc only, gated on `biddingOpen == true` and a valid `themeId`.
- `allocations/{eventId}/items/{teamId}`: admin-write only.
- `auditLogs`: admin-write only (teams never write these).
- `themesPublic`: public read of `visible == true` docs (matches the new filtered query); admin write.
- `themesPrivate`: admin-only, full stop (no `ownerUid` participant path — that was a bug in the uncommitted draft, private themes are never participant-owned).

**5. Deploy rules + indexes (free on Spark plan)**
- After verifying in the emulator, run `firebase deploy --only firestore:rules,firestore:indexes --project mechnova-vitc`. I'll confirm with you before touching production, even though this costs nothing — it's a live change to a shared system.

**6. Emulator-based verification**
- Start `firebase emulators:start` (Auth :9099, Firestore :8080, UI :4000 — already configured in `firebase.json`), with `.env` temporarily set to `VITE_USE_EMULATORS=true` for the test pass.
- Seed a default event doc, a quiz with 4-5 questions (via the admin Quiz Question Editor UI itself, to also verify that page works), and click through: Register → get credentials → Login → run the quiz to actual completion → Bidding (after admin reveals themes) → Results. Then Admin: all 6 tabs (Controls, Quiz Bank, Theme Vault/Reveal, Allocation, CMS, Audit Log).
- Fix any further breakage found during this pass (there may be smaller issues in pages I haven't fully traced yet, e.g. `ThemeRevealPanel.jsx`, `EventStatus.jsx`, `CmsEditor.jsx`) before calling it done.
- Restore `.env` to its original values (`VITE_USE_EMULATORS=false`) when finished, unless you'd rather keep emulator use as the normal dev workflow going forward.

## Out of scope
- No Cloud Functions deployment, no billing changes.
- No commit/push — I'll leave the working tree changes for you to review and commit yourself unless you ask me to commit.
