import { expect, it } from 'vitest';
import { normalizeField, parseWholeYER, products, validateFields } from './index';
import type { Fields } from './model';

const valid: Fields = {
  fullName: 'مريم سالم',
  mobile: '+٩٦٧ ٧٧٧-٠٠٠-١٠١',
  city: 'عدن',
  email: 'Demo.Name@example.test',
  businessName: 'متجر مريم',
  activity: 'retail',
  address: 'شارع السوق، عدن',
  operatingSince: '٢٠٢٦-٠٨',
  revenue: '0',
  expenses: '٥٠٬٠٠٠٬٠٠٠',
  amount: '١٠٠٬٠٠٠',
  term: '٦',
  budget: '1',
  explanation: 'شراء مخزون جديد من المستلزمات المنزلية.',
};

it('validates format independently of operating history, budget coverage and surplus', () => {
  expect(validateFields(valid, products.inventory, '2026-10')).toEqual([]);
});

it.each([
  ['١٬٢٠٠٬٠٠٠', 1_200_000],
  [' 100,010 ', 100_010],
  ['٠', 0],
  ['1,00,000', null],
  ['1.0', null],
  ['+100000', null],
  ['1e6', null],
  ['1 000', null],
  ['', null],
])('parses whole YER input %s', (input, expected) => {
  expect(parseWholeYER(input)).toBe(expected);
});

it('compares canonical values without erasing meaningful text differences', () => {
  expect(normalizeField('fullName', '  Cafe\u0301   ١ ')).toBe('café 1');
  expect(normalizeField('mobile', ' +٩٦٧ ٧٧٧-٠٠٠-١٠١ ')).toBe('+967777000101');
  expect(normalizeField('email', ' DEMO@Example.test ')).toBe('demo@example.test');
  expect(normalizeField('amount', '١٠٠٬٠١٠')).toBe('100010');
  expect(normalizeField('term', '٠٦')).toBe('6');
  expect(normalizeField('operatingSince', '٢٠٢٦-٠٨')).toBe('2026-08');
  expect(normalizeField('explanation', 'قلم.')).not.toBe(normalizeField('explanation', 'قلم'));
  expect(normalizeField('fullName', 'مُريم')).not.toBe(normalizeField('fullName', 'مريم'));
});

it.each([
  ['fullName', 'a', false],
  ['fullName', '😀'.repeat(100), true],
  ['fullName', '😀'.repeat(101), false],
  ['city', ' a ', false],
  ['city', 'a'.repeat(60), true],
  ['city', 'a'.repeat(61), false],
  ['businessName', 'ab', true],
  ['businessName', 'a'.repeat(101), false],
  ['address', 'a'.repeat(5), true],
  ['address', 'a'.repeat(250), true],
  ['address', 'a'.repeat(251), false],
  ['explanation', 'a'.repeat(19), false],
  ['explanation', 'a'.repeat(20), true],
  ['explanation', 'a'.repeat(500), true],
  ['explanation', 'a'.repeat(501), false],
  ['amount', '99,999', false],
  ['amount', '100,000', true],
  ['amount', '1,000,000', true],
  ['amount', '1,000,001', false],
  ['term', '٠٦', true],
  ['term', '12', true],
  ['term', '18', false],
  ['term', '6.0', false],
  ['revenue', '0', true],
  ['expenses', '50,000,000', true],
  ['revenue', '50,000,001', false],
  ['budget', '0', false],
  ['budget', '1', true],
  ['budget', '50,000,000', true],
  ['budget', '-1', false],
  ['mobile', '123456789', true],
  ['mobile', '12345678', false],
  ['mobile', '+123456789012345', true],
  ['mobile', '1234567890123456', false],
  ['mobile', '123(456)789', false],
  ['email', '', true],
  ['email', 'name+demo@sub.example.test', true],
  ['email', 'a@-example.test', false],
  ['email', 'a@example-.test', false],
  ['email', 'a@localhost', false],
  ['email', 'a b@example.test', false],
  ['email', 'أ@example.test', false],
  ['operatingSince', '2026-10', true],
  ['operatingSince', '2026-11', false],
  ['operatingSince', '2026-00', false],
  ['operatingSince', '0000-01', false],
  ['operatingSince', '2026-2', false],
] as const)('validates the %s boundary %s', (field, value, accepted) => {
  expect(
    validateFields({ ...valid, [field]: value }, products.inventory, '2026-10').some(
      issue => issue.field === field,
    ),
  ).toBe(!accepted);
});

it.each([
  ['499999', '12', false],
  ['500000', '12', true],
  ['3000000', '24', true],
  ['3000001', '24', false],
  ['500000', '6', false],
  ['1200000', '18', true],
] as const)('checks Equipment amount %s and term %s', (amount, term, accepted) => {
  expect(validateFields({ ...valid, amount, term }, products.equipment, '2026-10')).toHaveLength(
    accepted ? 0 : 1,
  );
});

it('enforces the optional email length boundary', () => {
  const email = `${'a'.repeat(242)}@example.test`;
  expect(email.length).toBe(255);
  expect(
    validateFields({ ...valid, email: email.slice(1) }, products.inventory, '2026-10'),
  ).toEqual([]);
  expect(validateFields({ ...valid, email }, products.inventory, '2026-10')).toContainEqual({
    field: 'email',
    rule: 'email',
  });
});
