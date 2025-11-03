/**
 * 日本時間（JST）で日付を扱うためのユーティリティ関数
 */

/**
 * 現在の日本時間の日付を YYYY-MM-DD 形式で取得
 */
export function getJSTDate(): string {
  const now = new Date();
  const jstOffset = 9 * 60; // 日本時間はUTC+9時間
  const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);

  const year = jstTime.getUTCFullYear();
  const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 日本時間で現在の年月を YYYY-MM 形式で取得
 */
export function getJSTYearMonth(): string {
  const now = new Date();
  const jstOffset = 9 * 60;
  const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);

  const year = jstTime.getUTCFullYear();
  const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

/**
 * 日付文字列（YYYY-MM-DD）を日本時間のDateオブジェクトに変換
 */
export function parseJSTDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // 月は0始まりなので-1する
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Dateオブジェクトを日本時間の YYYY-MM-DD 形式に変換
 */
export function formatJSTDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 日本時間で日付と時刻を結合してDateオブジェクトを作成
 */
export function createJSTDateTime(dateString: string, timeString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
