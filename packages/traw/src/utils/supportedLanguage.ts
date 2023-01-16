export function getSupportedLanguageByLocale(locale: string): string {
  switch (locale) {
    case 'en-US':
      return 'English (United States)';
    case 'ko-KR':
      return 'Korean (South Korea)';

    default:
      return '';
  }
}
