// Dictionnaire de patterns pour chaque champ CV
const FIELD_MAP = {
  firstName:   { autocomplete: ['given-name'], patterns: [/^first.?name/i, /^prénom/i, /^prenom/i, /^fname/i] },
  lastName:    { autocomplete: ['family-name'], patterns: [/^last.?name/i, /^nom/i, /^lname/i, /^surname/i] },
  email:       { autocomplete: ['email'], types: ['email'], patterns: [/e.?mail/i] },
  phone:       { autocomplete: ['tel'], types: ['tel'], patterns: [/phone/i, /téléphone/i, /^tel/i, /mobile/i] },
  title:       { patterns: [/title/i, /poste/i, /profession/i, /job.?title/i, /intitulé/i] },
  description: { patterns: [/summary/i, /bio/i, /about/i, /description/i, /présentation/i] },
};

// Retourne la clé CV correspondant à un input donné
export function matchField(input) {
  const attrs = {
    autocomplete: input.getAttribute('autocomplete') || '',
    type: input.getAttribute('type') || '',
    name: input.getAttribute('name') || '',
    id: input.getAttribute('id') || '',
    placeholder: input.getAttribute('placeholder') || '',
    ariaLabel: input.getAttribute('aria-label') || '',
  };
  
  // Récupère le texte du label associé
  const labelText = getLabelText(input);
  const searchString = [attrs.name, attrs.id, attrs.placeholder, attrs.ariaLabel, labelText].join(' ');

  for (const [cvKey, config] of Object.entries(FIELD_MAP)) {
    // Niveau 1: autocomplete attribute (le plus fiable)
    if (config.autocomplete && config.autocomplete.includes(attrs.autocomplete)) return cvKey;
    if (config.types && config.types.includes(attrs.type)) return cvKey;
    
    // Niveau 2: regex sur les attributs textuels + label
    if (config.patterns && config.patterns.some(p => p.test(searchString))) return cvKey;
  }
  return null;
}

function getLabelText(input) {
  // Cherche label[for="id"] ou parent <label>
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }
  const parent = input.closest('label');
  if (parent) return parent.textContent;
  return '';
}
