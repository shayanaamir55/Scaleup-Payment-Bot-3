export function isValidAmount(amount) {
  const num = parseInt(amount);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
}

export function isValidAccountNumber(account) {
  return typeof account === 'string' && account.trim().length > 0;
}

export function isValidDiscordId(id) {
  return /^\d{17,19}$/.test(id);
}

export function formatCurrency(amount, currency = 'PKR') {
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatMessage(template, variables) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}
