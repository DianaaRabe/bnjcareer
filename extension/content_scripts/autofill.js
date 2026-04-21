// Le script content_script est injecté en tant que "script", on ne peut pas utiliser "import" facilement.
// On va donc inline matchField.js logic ici pour simplicité dans la V1, ou on peut utiliser un bundler, mais 
// comme c'est une extension sans bundler, je mets la logique directement dans autofill.js pour simplifier.

const FIELD_MAP = {
    firstName:   { autocomplete: ['given-name'], patterns: [/first.?name/i, /prénom/i, /prenom/i, /fname/i] },
    lastName:    { autocomplete: ['family-name'], patterns: [/last.?name/i, /nom/i, /lname/i, /surname/i] },
    email:       { autocomplete: ['email'], types: ['email'], patterns: [/e.?mail/i] },
    phone:       { autocomplete: ['tel'], types: ['tel'], patterns: [/phone/i, /téléphone/i, /^tel/i, /mobile/i] },
    title:       { patterns: [/title/i, /poste/i, /profession/i, /job.?title/i, /intitulé/i] },
    description: { patterns: [/summary/i, /bio/i, /about/i, /description/i, /présentation/i] },
};
  
function matchField(input) {
    const attrs = {
        autocomplete: input.getAttribute('autocomplete') || '',
        type: input.getAttribute('type') || '',
        name: input.getAttribute('name') || '',
        id: input.getAttribute('id') || '',
        placeholder: input.getAttribute('placeholder') || '',
        ariaLabel: input.getAttribute('aria-label') || '',
    };
    
    const labelText = getLabelText(input);
    const searchString = [attrs.name, attrs.id, attrs.placeholder, attrs.ariaLabel, labelText].join(' ');
  
    for (const [cvKey, config] of Object.entries(FIELD_MAP)) {
        if (config.autocomplete && config.autocomplete.includes(attrs.autocomplete)) return cvKey;
        if (config.types && config.types.includes(attrs.type)) return cvKey;
        if (config.patterns && config.patterns.some(p => p.test(searchString))) return cvKey;
    }
    return null;
}
  
function getLabelText(input) {
    if (input.id) {
        // Echappement des ID qui pourraient utiliser des caractères bizarres
        try {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) return label.textContent;
        } catch(e) {}
    }
    const parent = input.closest('label');
    if (parent) return parent.textContent;
    return '';
}

async function autofill() {
    const data = await chrome.storage.local.get(['bnj_cv_data', 'bnj_autofill_enabled']);
    const cv = data.bnj_cv_data;
    const isEnabled = data.bnj_autofill_enabled;
    
    if (!cv || isEnabled === false) return;
  
    console.log("[BNJ Autofill] Démarrage du remplissage des formulaires de l'offre d'emploi...");
    
    // Select custom fields like regular text inputs, textareas
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea');
  
    let completedFields = 0;

    inputs.forEach(input => {
        const cvKey = matchField(input);
        if (cvKey && cv[cvKey] && !input.value) { // Ne pas écraser les valeurs existantes
            fillField(input, cv[cvKey]);
            completedFields++;
        }
    });

    if (completedFields > 0) {
        console.log(`[BNJ Autofill] ${completedFields} champs ont été remplis avec succès.`);
    }
}
  
function fillField(input, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set 
                      || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (nativeSetter) {
        nativeSetter.call(input, value);
    } else {
        input.value = value;
    }
    
    // Simulate interaction for framework logic (React, Vue, etc.)
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
}
  
// Attend que le DOM soit stable avant de lancer le remplissage (très important pour les Single Page Apps)
const observer = new MutationObserver(() => {
    // Basic debounce strategy to wait until DOM calms down
    clearTimeout(window.bnjAutofillTimeout);
    window.bnjAutofillTimeout = setTimeout(() => {
        autofill();
    }, 1500); 
});
observer.observe(document.body, { childList: true, subtree: true });
autofill(); // Also on initial load
