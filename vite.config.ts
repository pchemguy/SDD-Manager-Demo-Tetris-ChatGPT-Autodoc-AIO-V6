/** Relative asset URLs support static subdirectory deployment. */
import {defineConfig} from 'vite';
export default defineConfig({
 base:'./',worker:{format:'es'},
 // The lazy worker is outside the initial page scan. Discovering its CommonJS
 // dependency on first Save/Restore would re-optimize and reload the live game.
 optimizeDeps:{include:['sql.js']},
});
