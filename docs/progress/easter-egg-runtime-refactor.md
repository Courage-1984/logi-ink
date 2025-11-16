## Easter Egg Runtime Refactor Progress

- **Scope:** Deferred the heavy Milky Way easter egg implementation into a lazily loaded runtime chunk so normal page loads skip ~80 KB of JS. Created helper scaffolding that reuses existing containers and menu UI without re-registering triggers.
- **Key Changes:**
  - Added `js/modules/easter-egg/runtime.js` to house the original runtime logic.
  - Simplified `js/core/easter-egg.js` to gate activation via a dynamic import, keeping triple-click/footer triggers lightweight.
  - Updated runtime to build DOM scaffolding on demand and adjusted relative imports for `env` and `three-loader` utilities.
- **Testing:** Manual smoke tests in browser not run yet. TODO for follow-up: verify that activating the easter egg still launches the galaxy scene, that menu controls (fullscreen/reset/exit) function, and that exiting restores the page. Also confirm that normal navigation no longer downloads the runtime chunk.
