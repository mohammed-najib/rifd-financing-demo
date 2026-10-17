# Local runtime signing

Run this yourself in a local terminal from the repository root:

```bash
bash .scratch/jev-evidence-assistance/selection-bound-execution/manual-signing/sign-runtime.sh
```

The five stages verify the sealed activation, create or unlock your encrypted Ed25519 key, collect current account evidence, let you review and sign four receipt bodies, and verify the signed packet. The wizard asks you to confirm its stages before it begins. It uses the repository's [wizard skill](../../../../.agents/skills/wizard/SKILL.md).

The default private-key location is `~/.local/share/rifd-jev-signing/reviewer-private.pem`. Choose a passphrase of at least 12 characters and keep it in your password manager. It is read through hidden terminal prompts, passed to the local signing process through standard input, and never written to the state file, command arguments or runtime packet. The encrypted private key stays outside this repository. Only its public key and fingerprint enter runtime trust.

The account stage opens the [TypeSafe console](https://console.typesafe.ai), the console linked from the [official quick start](https://docs.typesafe.ai/introduction/quickstart). Use the balance and charge-history views you previously checked; current menu labels were not independently inspected. Save local screenshots or exports showing current available credit and complete charge history. Capture no API keys, payment details or unrelated account data. Confirm refill remains disabled and charges are settled and explained. Prior source review, custody, terms, pricing/access and the earlier zero actual bill are carried forward. No purchase, refill or account change is requested.

Open `preview/packet.json` when prompted. Its four bodies cover the existing paid authorization, your carried independent source review, current account evidence and the initial development freeze. They bind manifest `7e5670c39b6ce877df05bd6c3641a1a6b6f30630754bda554fe21f31c909758e`, the unchanged roster and the existing immutable ledger identity. Native outcomes remain unreviewed. The default validity is 24 hours; you can enter another future UTC expiry.

Signing creates the five runtime files and matching account captures under `../runtime/`. Private local state, previews, staged output and runtime evidence are Git-ignored. The wizard refuses to replace an existing runtime folder. If it stops after that folder is written, preserve it and tell Codex the reported error. Do not start or restart an attempt ledger yourself.

The wizard makes no inference call, reservation, deployment or release decision. Reply that the wizard completed so Codex can check the real signatures and continue the already authorized execution. Keep the encrypted key for later genuine per-run reconciliation and native-outcome receipts; this initial step signs no future measurement or adjudication.

The helper uses Node's [documented crypto APIs](https://nodejs.org/api/crypto.html), encrypted PKCS#8 key storage and detached Ed25519 signatures over the exact `JSON.stringify(body)` bytes expected by the accepted runner. All automated crypto tests use fictional identities and keys. The interactive wizard is reserved for the human signer.
