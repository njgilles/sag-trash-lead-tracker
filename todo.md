HAVE TO DO FIRST:

Examine the build failure from the most recent git push and fix :

4f4fb700ef54: Pull complete
Digest: sha256:d7cbd61ec37591b06ba83e554157439391c378cb488bbb3b47dd7041e2112a6f
Status: Downloaded newer image for us-east4-docker.pkg.dev/serverless-runtimes/google-22-full/builder/nodejs:nodejs_20260105_RC00
public-image-next: Pulling from serverless-runtimes/google-22/run/base
63e5bc7682b8: Already exists
0dd637e4a14e: Pulling fs layer
44d9a4df1c28: Pulling fs layer
0dd637e4a14e: Verifying Checksum
0dd637e4a14e: Download complete
44d9a4df1c28: Verifying Checksum
44d9a4df1c28: Download complete
0dd637e4a14e: Pull complete
44d9a4df1c28: Pull complete
Digest: sha256:fdb575587a0a08ab157ec0bc2b22ffa008389fcd85568880a723622b1a5c6679
Status: Downloaded newer image for us-east4-docker.pkg.dev/serverless-runtimes/google-22/run/base:public-image-next
===> ANALYZING
Image with name "us-east4-docker.pkg.dev/sag-trash-lead-tracker/firebaseapphosting-images/sag-trash-lead-tracker:build-2026-01-13-005" not found
===> DETECTING
target distro name/version labels not found, reading /etc/os-release file
4 of 6 buildpacks participating
google.nodejs.runtime        1.0.0
google.nodejs.firebasenextjs 0.0.1
google.nodejs.npm            1.1.1
google.nodejs.firebasebundle 0.0.1
===> RESTORING
===> BUILDING
target distro name/version labels not found, reading /etc/os-release file
=== Node.js - Runtime (google.nodejs.runtime@1.0.0) ===
Nodejs version not specified, using the latest available Nodejs runtime for the stack "ubuntu2204"
2026/01/13 02:36:26 [DEBUG] GET https://dl.google.com/runtimes/ubuntu2204/nodejs/version.json
Adding image label google.runtime-version: nodejs22
2026/01/13 02:36:27 [DEBUG] GET https://dl.google.com/runtimes/ubuntu2204/nodejs/version.json
Installing Node.js v22.21.0.
2026/01/13 02:36:28 [DEBUG] GET https://dl.google.com/runtimes/ubuntu2204/nodejs/nodejs-22.21.0.tar.gz
Installing the heapsize.sh exec.d script.
=== Node.js - Firebasenextjs (google.nodejs.firebasenextjs@0.0.1) ===
***** CACHE MISS: "npm_modules"
Installing nextjs adaptor 14.0.21
=== Node.js - Npm (google.nodejs.npm@1.1.1) ===
***** CACHE MISS: "npm_modules"
Installing application dependencies.
--------------------------------------------------------------------------------
Running "npm ci --quiet --no-fund --no-audit (NODE_ENV=development)"
added 559 packages in 22s
Done "npm ci --quiet --no-fund --no-audit (NODE_ENV=development)" (22.189983046s)
--------------------------------------------------------------------------------
Running "npm exec --prefix /layers/google.nodejs.firebasenextjs/npm_modules apphosting-adapter-nextjs-build"
Overriding Next Config to add configs optmized for Firebase App Hosting
Successfully created next.config.ts with Firebase App Hosting overrides
> client-finder@1.0.0 build
> next build
▲ Next.js 16.1.1 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 17.6s
  Running TypeScript ...
Failed to compile.
./src/lib/firestore-admin-service.ts:33:14
Type error: Conversion of type '{ id: string; contactedDate: any; lastUpdated: any; }' to type 'Lead' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ id: string; contactedDate: any; lastUpdated: any; }' is missing the following properties from type 'Lead': name, address, location, type
  31 |       }
  32 |
> 33 |       return {
     |              ^
  34 |         ...data,
  35 |         id: doc.id,
  36 |         contactedDate: convertTimestamp(data.contactedDate),
Next.js build worker exited with code: 1 and signal: null
Restoring original next config in project root
/layers/google.nodejs.firebasenextjs/npm_modules/node_modules/@apphosting/common/dist/index.js:64
                reject(new Error(`Build process exited with error code ${code}.`));
                       ^
Error: Build process exited with error code 1.
    at ChildProcess.<anonymous> (/layers/google.nodejs.firebasenextjs/npm_modules/node_modules/@apphosting/common/dist/index.js:64:24)
    at ChildProcess.emit (node:events:519:28)
    at ChildProcess._handle.onexit (node:internal/child_process:293:12)
Node.js v22.21.0
Done "npm exec --prefix /layers/google.nodejs.firebasenextjs/npm_m..." (28.42511732s)
--------------------------------------------------------------------------------
failed to build: (error ID: 54e285a2):
{"reason":"Failed Framework Build","code":"fah/failed-framework-build","userFacingMessage":"Your application failed to run the framework build command 'npm exec --prefix /layers/google.nodejs.firebasenextjs/npm_modules apphosting-adapter-nextjs-build' successfully. Please check the raw log to address the error and confirm that your application builds locally before redeploying.","rawLog":"(error ID: d0a693a9):
Failed to compile.
./src/lib/firestore-admin-service.ts:33:14
Type error: Conversion of type '{ id: string; contactedDate: any; lastUpdated: any; }' to type 'Lead' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ id: string; contactedDate: any; lastUpdated: any; }' is missing the following properties from type 'Lead': name, address, location, type
  31 |       }
  32 |
> 33 |       return {
     |              ^
  34 |         ...data,
  35 |         id: doc.id,
  36 |         contactedDate: convertTimestamp(data.contactedDate),
Next.js build worker exited with code: 1 and signal: null
/layers/google.nodejs.firebasenextjs/npm_modules/node_modules/@apphosting/common/dist/index.js:64
                reject(new Error(`Build process exited with error code ${code}.`));
                       ^
Error: Build process exited with error code 1.
    at ChildProcess.<anonymous> (/layers/google.nodejs.firebasenextjs/npm_modules/node_modules/@apphosting/common/dist/index.js:64:24)
    at ChildProcess.emit (node:events:519:28)
    at ChildProcess._handle.onexit (node:internal/child_process:293:12)
Node.js v22.21.0"}
ERROR: failed to build: exit status 1
ERROR: failed to build: executing lifecycle: failed with status code: 51
Finished Step #2 - "pack"
ERROR
ERROR: build step 2 "gcr.io/k8s-skaffold/pack" failed: step exited with non-zero status: 1

-------------

1. The checkmark that we have on the /maps page should be on the actual map ping and it should persist on the map to show where we have contacted people around the area without entering the zipcode 

2. There should be a solution here where the person is not interested and it should be an X instead of a check, this should be populated in the /contacted page also as not intereted at this time or something similar 

3. Editing the information should be very sleek and quick for people that are using the app

4. There should be a way to enter a lead manually that you have not found via the maps just to keep track of 

5. Create additional page with gcal capabilities to sync team on when we are meeting with leads / who they are and have common notes on lead 
