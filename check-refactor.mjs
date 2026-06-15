import fs from 'node:fs';

const files = ['index.html', 'assets/css/app.css', 'assets/js/app.js'];
const forbidden = [
  'ap_', 'ap-', 'apShop', 'apAdmin', 'AP_POINTS', 'SHOP_AP', 'ROULETTE_AP',
  'CUSTOM_AP_MSG', 'ap_leadership', 'fsb', 'FSB_POINTS', 'FSB_SPEND', 'SHOP_FSB',
  'ROULETTE_FSB', 'CUSTOM_FSB_MSG', 'fsb_leadership', 'organizations'
];
const requiredHtmlIds = [
  'authGate','appShell','authForm','authEmail','authPassword','authNickname','authUserKind',
  'pageTitle','userAvatarMini','userNicknameMini','userRoleMini','topbarGameXp','topbarRealXp',
  'trainerResolved','trainerAccuracy','trainerTitle','trainerAuthor','trainerText','trainerResult',
  'timeAttackTimer','timeAttackArea','complaintsArea','questsArea','reportForm','reportNickInput',
  'reportDateInput','reportWorkInput','reportLinkInput','reportFileInput','reportPreview','reportResultText',
  'reportsListArea','rtPrevWeekBtn','rtCurrentWeekLabel','rtNextWeekBtn','reportsTableWrapper',
  'inactiveForm','inactiveNickInput','inactiveDateFrom','inactiveDateTo','inactiveReasonInput','inactiveResultText',
  'shopGameXp','shopRealXp','shopItemsContainer','leadAddModSelect','leadModList','leadershipUserSelect',
  'leadershipGiveType','leadershipXpAmount','hiddenCheckUser','hiddenCheckType','hiddenCheckText','adminLogsArea',
  'creatorUserSelect','creatorGiveType','creatorXpAmount','creatorAdminSelect','creatorAdminRole','creatorAdminsList',
  'creatorGeminiApiKeyInput','creatorGeminiKeyStatus','creatorDeepSeekApiKeyInput','creatorDeepSeekModelSelect',
  'creatorDeepSeekEndpointInput','creatorDeepSeekThinkingToggle','creatorDeepSeekKeyStatus','creatorDbContainer',
  'guideSearchInput','aiChatForm','aiChatInput','aiChatMessages','aiChatStatus','confirmModal','genericGameModal',
  'fortuneModal','coinModal','safesModal','johnWickModal','toastRoot'
];
function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Файл не найден: ${file}`);
  return fs.readFileSync(file, 'utf8');
}
const contents = Object.fromEntries(files.map(file => [file, read(file)]));
const allText = Object.values(contents).join('\n');
const forbiddenHits = forbidden.filter(word => allText.includes(word));
const missingIds = requiredHtmlIds.filter(id => !contents['index.html'].includes(`id="${id}"`));
const htmlIds = [...contents['index.html'].matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const duplicateIds = [...new Set(htmlIds.filter((id, i) => htmlIds.indexOf(id) !== i))];
const htmlActions = [...contents['index.html'].matchAll(/data-action="([^"]+)"/g)].map(m => m[1]);
const jsCases = [...contents['assets/js/app.js'].matchAll(/case\s+['"`]([^'"`]+)['"`]\s*:/g)].map(m => m[1]);
const unhandledActions = [...new Set(htmlActions)].filter(action => !jsCases.includes(action));
console.log('\n=== Cherepovets 89 V8 Clean Assets Check ===\n');
console.log('Forbidden leftovers:', forbiddenHits.length ? forbiddenHits : 'OK');
console.log('Missing required HTML ids:', missingIds.length ? missingIds : 'OK');
console.log('Duplicate HTML ids:', duplicateIds.length ? duplicateIds : 'OK');
console.log('Unhandled data-actions:', unhandledActions.length ? unhandledActions : 'OK');
if (forbiddenHits.length || missingIds.length || duplicateIds.length || unhandledActions.length) process.exit(1);
console.log('\nПроверка пройдена. Можно тестировать сборку.');
