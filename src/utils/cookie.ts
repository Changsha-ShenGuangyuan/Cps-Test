// Cookie管理工具类
export class CookieManager {
  /**
   * 设置Cookie
   * @param name Cookie名称
   * @param value Cookie值
   * @param days 过期天数
   * @param path Cookie路径
   * @param domain Cookie域名
   * @param secure 是否仅HTTPS传输
   */
  static setCookie(
    name: string,
    value: string,
    days: number = 30,
    path: string = '/',
    domain?: string,
    secure: boolean = false
  ): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    let cookieStr = name + '=' + encodeURIComponent(value) + expires + '; path=' + path;
    if (domain) {
      cookieStr += '; domain=' + domain;
    }
    if (secure) {
      cookieStr += '; secure';
    }
    document.cookie = cookieStr;
  }

  /**
   * 获取Cookie
   * @param name Cookie名称
   * @returns Cookie值，如果不存在则返回null
   */
  static getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      if (c) {
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
    }
    return null;
  }

  /**
   * 删除Cookie
   * @param name Cookie名称
   * @param path Cookie路径
   * @param domain Cookie域名
   */
  static deleteCookie(name: string, path: string = '/', domain?: string): void {
    // 设置过期时间为过去的时间来删除Cookie
    this.setCookie(name, '', -1, path, domain);
  }

  /**
   * 检查Cookie是否存在
   * @param name Cookie名称
   * @returns 是否存在
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * 获取所有Cookie
   * @returns 所有Cookie的对象
   */
  static getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      if (c) {
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }
        const [name, value] = c.split('=');
        if (name && value) {
          cookies[name] = decodeURIComponent(value);
        }
      }
    }
    return cookies;
  }

  /**
   * 清除所有Cookie
   * @param path Cookie路径
   * @param domain Cookie域名
   */
  static clearAllCookies(path: string = '/', domain?: string): void {
    const cookies = this.getAllCookies();
    for (const name in cookies) {
      this.deleteCookie(name, path, domain);
    }
  }
}

// 常用Cookie名称常量
export const COOKIE_NAMES = {
  // 语言偏好
  LANGUAGE: 'cpstest_language',
  // 隐私政策同意
  PRIVACY_CONSENT: 'cpstest_privacy_consent',
  // 访问统计
  VISIT_COUNT: 'cpstest_visit_count',
  // 上次访问时间
  LAST_VISIT: 'cpstest_last_visit',
  // 用户偏好设置
  USER_PREFERENCES: 'cpstest_user_preferences',
};
