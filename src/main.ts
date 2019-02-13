import {main_entry} from './main_entry';


// main function
(function main () {
  const args = process.argv.slice(2);
  main_entry(args);
})();