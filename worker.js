import { ZxcvbnFactory } from 'https://esm.sh/@zxcvbn-ts/core@4?bundle';
import * as zxcvbnCommonPackage from 'https://esm.sh/@zxcvbn-ts/language-common@4?bundle';
import * as zxcvbnArPackage from 'https://esm.sh/@zxcvbn-ts/language-ar@4?bundle';
import * as zxcvbnCsPackage from 'https://esm.sh/@zxcvbn-ts/language-cs@4?bundle';
//import * as zxcvbnDaDkPackage from 'https://esm.sh/@zxcvbn-ts/language-da-dk@4?bundle';
import * as zxcvbnDePackage from 'https://esm.sh/@zxcvbn-ts/language-de@4?bundle';
import * as zxcvbnEnPackage from 'https://esm.sh/@zxcvbn-ts/language-en@4?bundle';
import * as zxcvbnEsEsPackage from 'https://esm.sh/@zxcvbn-ts/language-es-es@4?bundle';
import * as zxcvbnFaPackage from 'https://esm.sh/@zxcvbn-ts/language-fa@4?bundle';
//import * as zxcvbnFiPackage from 'https://esm.sh/@zxcvbn-ts/language-fi@4?bundle';
import * as zxcvbnFrPackage from 'https://esm.sh/@zxcvbn-ts/language-fr@4?bundle';
import * as zxcvbnHrPackage from 'https://esm.sh/@zxcvbn-ts/language-hr@4?bundle';
//import * as zxcvbnIdPackage from 'https://esm.sh/@zxcvbn-ts/language-id@4?bundle';
import * as zxcvbnItPackage from 'https://esm.sh/@zxcvbn-ts/language-it@4?bundle';
//import * as zxcvbnJaPackage from 'https://esm.sh/@zxcvbn-ts/language-ja@4?bundle';
import * as zxcvbnKuPackage from 'https://esm.sh/@zxcvbn-ts/language-ku@4?bundle';
import * as zxcvbnNlBePackage from 'https://esm.sh/@zxcvbn-ts/language-nl-be@4?bundle';
import * as zxcvbnPlPackage from 'https://esm.sh/@zxcvbn-ts/language-pl@4?bundle';
//import * as zxcvbnPtBrPackage from 'https://esm.sh/@zxcvbn-ts/language-pt-br@4?bundle';
import * as zxcvbnRoPackage from 'https://esm.sh/@zxcvbn-ts/language-ro@4?bundle';
//import * as zxcvbnThPackage from 'https://esm.sh/@zxcvbn-ts/language-th@4?bundle';
import * as zxcvbnTrPackage from 'https://esm.sh/@zxcvbn-ts/language-tr@4?bundle';
//import * as zxcvbnZhPackage from 'https://esm.sh/@zxcvbn-ts/language-zh@4?bundle';

const zxcvbnOptions = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnArPackage.dictionary,
    ...zxcvbnCsPackage.dictionary,
    /*...zxcvbnDaDkPackage.dictionary,*/
    ...zxcvbnDePackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
    ...zxcvbnEsEsPackage.dictionary,
    ...zxcvbnFaPackage.dictionary,
    /*...zxcvbnFiPackage.dictionary,*/
    ...zxcvbnFrPackage.dictionary,
    ...zxcvbnHrPackage.dictionary,
    /*...zxcvbnIdPackage.dictionary,*/
    ...zxcvbnItPackage.dictionary,
    /*...zxcvbnJaPackage.dictionary,*/
    ...zxcvbnKuPackage.dictionary,
    ...zxcvbnNlBePackage.dictionary,
    ...zxcvbnPlPackage.dictionary,
    /*...zxcvbnPtBrPackage.dictionary,*/
    ...zxcvbnRoPackage.dictionary,
    /*...zxcvbnThPackage.dictionary,*/
    ...zxcvbnTrPackage.dictionary,
    /*...zxcvbnZhPackage.dictionary,*/
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnDePackage.translations,
};

const zxcvbn = new ZxcvbnFactory(zxcvbnOptions);

let currentSequence = 0;

self.addEventListener('message', (e) => {
  const { password, sequence } = e.data;
  currentSequence = sequence;
  
  // Defer computation to allow newer requests to cancel this one
  setTimeout(() => {
    if (sequence !== currentSequence) {
      return; // This request is outdated, skip it
    }
    const result = zxcvbn.check(password);
    self.postMessage({ result, sequence });
  }, 0);
});
