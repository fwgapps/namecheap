## [2.0.2](https://github.com/fwgapps/[secure]/compare/v2.0.1...v2.0.2) (2026-11-11)


### Bug Fixes

* add fwgapps brand links and author url to package metadata ([be0eb26](https://github.com/fwgapps/[secure]/commit/be0eb269befb4359a692d2708bdf894f037ee6af))

## [2.0.1](https://github.com/fwgapps/[secure]/compare/v2.0.0...v2.0.1) (2026-11-11)


### Bug Fixes

* **deps:** force minimatch ^11.0.5 to fix globparts DoS ([#198](https://github.com/fwgapps/[secure]/issues/198)) ([#9](https://github.com/fwgapps/[secure]/issues/9)) ([05ae64f](https://github.com/fwgapps/[secure]/commit/05ae64fd0685829693819c5fb0f02d3ada4d8d38))

# [2.0.0](https://github.com/fwgapps/[secure]/compare/v1.1.0...v2.0.0) (2026-11-11)


* feat!: require Node >= 22 and update vitest to 5 ([658850e](https://github.com/fwgapps/[secure]/commit/658850eeb30ed050d9dd2d251cbb9f4f7148837c))


### BREAKING CHANGES

* engines.node is now >=22. Node 20 reached end of life on
2026-04-30. CI now tests Node 22, 24 and 26; tsup targets node22.
Also bumps vitest and @vitest/coverage-v8 to 5 (adds vite as a dev dependency).

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019LNn1DfhDn8HDSgv2hJMa2

# [1.1.0](https://github.com/fwgapps/[secure]/compare/v1.0.0...v1.1.0) (2026-11-08)


### Bug Fixes

* **deps:** resolve minimatch to 11.x where it was 10.x ([8f04d25](https://github.com/fwgapps/[secure]/commit/8f04d258178e9dbc689a9f8083f51c701e0fbe32))
* read the response shapes the live sandbox actually sends ([c1d124e](https://github.com/fwgapps/[secure]/commit/c1d124edef850dbcc34e1c2dee088f8b08a83976))


### Features

* **ssl:** activate and reissue accept approver e-mail and HTTP/DNS validation ([870c3b4](https://github.com/fwgapps/[secure]/commit/870c3b446f0d1ea120e4fc17feb28c985e0be922))

# [1.0.0](https://github.com/fwgapps/[secure]/compare/v0.6.0...v1.0.0) (2026-11-08)


* feat!: rewrite the library from scratch for 1.0 ([da17ba1](https://github.com/fwgapps/[secure]/commit/da17ba1fcb93b3745039aedc26aa8515afb812fd))


### Bug Fixes

* **core:** give blank API errors a fallback message ([95ff32e](https://github.com/fwgapps/[secure]/commit/95ff32ee7aa7c71abed36e639fe62a515c95c907))
* **core:** lock down redirects and cover body encoding ([48aaf45](https://github.com/fwgapps/[secure]/commit/48aaf456e719728ac706bdb814b7f6a797a22507))
* **core:** never-throwing lenient readers for undocumented billed or account-changing responses ([a18c738](https://github.com/fwgapps/[secure]/commit/a18c7383d1e4be696f21c0443ee401282edf5ae5))
* **core:** parse number attributes as plain decimals ([aa1579f](https://github.com/fwgapps/[secure]/commit/aa1579f0685a87ce8fd298d73347166728ec1fba))
* **core:** reject prototype names as XML entities ([37438c4](https://github.com/fwgapps/[secure]/commit/37438c417cb166294ee3066eb01e5ab37036a5b7))
* **core:** say the action may have happened when a response cannot be read ([8f950f2](https://github.com/fwgapps/[secure]/commit/8f950f20f82371edc7ef49735969b69964ea1505))
* **dns:** guard destructive setHosts calls and share optionalField ([0b933b2](https://github.com/fwgapps/[secure]/commit/0b933b28e14ef21fbfc0c1272a3608357ac47d2a))
* **domains:** make fixture-only check fields optional and relabel derived fixture ([c557ed4](https://github.com/fwgapps/[secure]/commit/c557ed4c43dcb3006d7de6373395299b6d031f95))
* **examples:** bind the Express example to loopback and validate body field kinds ([02ee49e](https://github.com/fwgapps/[secure]/commit/02ee49e08d6994600a53369bedbde141580755c5))
* **examples:** keep Namecheap errors on 400/502 and validate the dcvMethod body ([19f030d](https://github.com/fwgapps/[secure]/commit/19f030d8168c7cb053713aec39d780d6e2039f5f))
* **examples:** track the params helper and harden request and error handling ([d8c380d](https://github.com/fwgapps/[secure]/commit/d8c380d869107365acdc1245ea37e479a4a08bff))
* make sandbox strictly boolean, unblock the release audit and correct the migration guide ([08246fc](https://github.com/fwgapps/[secure]/commit/08246fcf051aed3f9ff122a9761252deaddf5de6))
* reject reserved param names, bound error fragments and tidy minor findings ([4cf2966](https://github.com/fwgapps/[secure]/commit/4cf2966d49f5a0e9e7b0f1991dcf53777821d2ec))
* **scripts:** harden the fixture recorder and pin its safeguards with tests ([2424476](https://github.com/fwgapps/[secure]/commit/24244760be0c7dc368905ae3f6438d112d456b4c))
* **ssl:** parse billed ssl responses tolerantly ([4bf5d13](https://github.com/fwgapps/[secure]/commit/4bf5d1312e2c3d099e26d8b0b039ed11c6f6f785))
* update dev dependencies ([8158a6f](https://github.com/fwgapps/[secure]/commit/8158a6fe732b6a242c5cdcdd5397f2b00ed6ef9b))
* **users:** tolerant parsing for undocumented responses and a real credential leak test ([cdd491d](https://github.com/fwgapps/[secure]/commit/cdd491dbba5f57fb7800c215ff7cfc0d916dedfe))
* **whoisguard:** tolerant parsing for the undocumented billed renew response ([01f218b](https://github.com/fwgapps/[secure]/commit/01f218b01eca1780f1c837d3660971aae8f8483e))


### Features

* add Namecheap client and public exports ([99a16dd](https://github.com/fwgapps/[secure]/commit/99a16dde892b0fe220b19545521f154921e51646))
* **core:** add defineCommand and group ([888e5d8](https://github.com/fwgapps/[secure]/commit/888e5d8ec4123780ee5d35e7260fb517519b4613))
* **core:** add error classes ([a579479](https://github.com/fwgapps/[secure]/commit/a579479fca50774a40466016fcc6fa36a4c525c5))
* **core:** add minimal XML parser ([5b97495](https://github.com/fwgapps/[secure]/commit/5b97495df8c076589cd31bce0c4a289973dd2ad9))
* **core:** add param serializer ([2a98c90](https://github.com/fwgapps/[secure]/commit/2a98c900b779aa76b2eb6bda2dfabf2b1dde646f))
* **core:** add response envelope handling ([62b4ae6](https://github.com/fwgapps/[secure]/commit/62b4ae6e23698ab5dc51017febc81cac11d6ee34))
* **core:** add transport ([9725f89](https://github.com/fwgapps/[secure]/commit/9725f8948131f1f72a610a38b3b841cc92e28a4e))
* **core:** add typed element reader ([3eab99d](https://github.com/fwgapps/[secure]/commit/3eab99d8a45e2acb8577aae6db0cfbd61924c34b))
* **dns:** add all dns commands ([63945f1](https://github.com/fwgapps/[secure]/commit/63945f1984560fe4a2721caed371ece52020d730))
* **domains:** add all domains commands ([bc7397d](https://github.com/fwgapps/[secure]/commit/bc7397de0dec6bd3b107d2f691c6139692029b87))
* make the library tree-shakeable with standalone commands and run() ([3a07e8a](https://github.com/fwgapps/[secure]/commit/3a07e8aed8072862533badd81114d23992609f78))
* **ns:** add all ns commands ([cecc69e](https://github.com/fwgapps/[secure]/commit/cecc69e4ca2a36845eca5cd3d973d953e75d841c))
* **scripts:** add sandbox fixture recorder ([d683ce5](https://github.com/fwgapps/[secure]/commit/d683ce5b3c4ca3e054dc42499fce22e46f938bed))
* **ssl:** add all ssl commands ([20ca2cd](https://github.com/fwgapps/[secure]/commit/20ca2cdd34b554caa4418c4ebd673bfb7f6d5b1c))
* **transfer:** add all transfer commands ([3369d9e](https://github.com/fwgapps/[secure]/commit/3369d9e3147e48e4e4ba3fd779b30eedbe23e53a))
* **users-address:** add all users-address commands ([51bcc8f](https://github.com/fwgapps/[secure]/commit/51bcc8f8c1bcee10335c8bfb614e248ce129fe5e))
* **users:** add all users commands ([3587a00](https://github.com/fwgapps/[secure]/commit/3587a007fc30c1f34dbdc5ee28728a3fb1d54626))
* **whoisguard:** add all whoisguard commands ([f3f0d24](https://github.com/fwgapps/[secure]/commit/f3f0d2495062d3a205df10573a9546b0d6151b5f))


### BREAKING CHANGES

* new client API, zero dependencies, Node >= 20, no browser build. See MIGRATION.md.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019LNn1GbkB831GgZaBJhUhT

# [0.6.0](https://github.com/fwgapps/namecheap/compare/v0.5.0...v0.6.0) (2025-05-30)


### Features

* added new tests, commentaries and changed some types ([62e197d](https://github.com/fwgapps/namecheap/commit/62e197d6aceae36ed06ebc64b8cac8c8dd7d4fb8))

# [0.5.0](https://github.com/fwgapps/namecheap/compare/v0.4.1...v0.5.0) (2025-05-29)


### Bug Fixes

* **pipeline:** update node version in audit ([b989f49](https://github.com/fwgapps/namecheap/commit/b989f4928200bc73611a482886aa3f54aa3dc6f2))


### Features

* added iife support, update all libraries and eslint config ([25bb687](https://github.com/fwgapps/namecheap/commit/25bb68718377dcd3d4031352bd191e1785d842ec))

## [0.4.1](https://github.com/fwgapps/namecheap/compare/v0.4.0...v0.4.1) (2025-05-28)


### Bug Fixes

* **readme:** correct import example ([716bf3f](https://github.com/fwgapps/namecheap/commit/716bf3f5300d2536384802e0db84e94426eac790)), closes [#1](https://github.com/fwgapps/namecheap/issues/1)

# [0.4.0](https://github.com/fwgapps/namecheap/compare/v0.3.0...v0.4.0) (2025-05-27)


### Bug Fixes

* changed prepare-commit-msg ([c5ecb76](https://github.com/fwgapps/namecheap/commit/c5ecb76021c3edf7fd6a7cbf52c01806c8a8a8a1))


### Features

* update readme ([0b0ecdb](https://github.com/fwgapps/namecheap/commit/0b0ecdb390233b888f3de242b33a9bf0f2358e8c))
