Firebase Cloud Function & client changes

What I added in this branch:

- VIP.html (root) - updated client which:
  - generates a deviceId and stores in localStorage
  - calls a callable Cloud Function `validateKey` to verify key + device binding
  - no direct client-side read/write to `keys/` path (server should handle keys)
  - improved prediction engine using recent results with smoothing and calibrated confidence

- functions/index.js - example Cloud Function `validateKey` (Node 16+)
  - validates key existence / blocked / expiry
  - registers deviceId under `keys/{key}/devices/{deviceId}` and increments usageCount atomically
  - enforces device limit

- functions/package.json - Node dependencies for Cloud Functions

- firebase-rules/keys-rules.json - example Realtime DB rules to prevent client-side access to `keys`

Important notes:
- I did NOT deploy the Cloud Function to your Firebase project. To deploy:
  1) Install Firebase CLI and login: `npm install -g firebase-tools` && `firebase login`
  2) From repo root: `cd functions && npm install`
  3) Initialize functions in your project (if not yet) and deploy with: `firebase deploy --only functions:validateKey`
  4) Make sure your Firebase project has Realtime Database and the rules are set (see firebase-rules/keys-rules.json)

- Do NOT commit service account JSON or other secrets to the repo. Use GitHub Actions secrets or Firebase console for CI deployments.

Next steps I can help with:
- If you give me permission, I can open a PR in the repository (branch: feature/auth-server) with these changes (already created by me). I will include deployment instructions in the PR description.
- If you want me to also add a GitHub Actions workflow to deploy functions using a CI secret (FIREBASE_SERVICE_ACCOUNT), I can add that too (you will need to add the secret in repo settings).

If you want me to proceed with opening a PR now, tell me and I'll create it and share the link.
